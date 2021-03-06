import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { formatQueryParams, QueryParams } from '../query-params';
import { OpenSlidesStatusService } from './openslides-status.service';

/**
 * The generic message format in which messages are send and recieved by the server.
 */
interface BaseWebsocketMessage {
    type: string;
    content: any;
}

/**
 * Outgoing messages must have an id.
 */
interface OutgoingWebsocketMessage extends BaseWebsocketMessage {
    id: string;
}

/**
 * Incomming messages may have an `in_response`, if they are an answer to a previously
 * submitted request.
 */
interface IncommingWebsocketMessage extends BaseWebsocketMessage {
    in_response?: string;
}

/*
 * Options for (re-)connecting.
 */
interface ConnectOptions {
    changeId?: number;
    enableAutoupdates?: boolean;
}

/**
 * Service that handles WebSocket connections. Other services can register themselfs
 * with {@method getOberservable} for a specific type of messages. The content will be published.
 */
@Injectable({
    providedIn: 'root'
})
export class WebsocketService {
    /**
     * The reference to the snackbar entry that is shown, if the connection is lost.
     */
    private connectionErrorNotice: MatSnackBarRef<SimpleSnackBar>;

    /**
     * Subjects that will be called, if a reconnect after a retry (e.g. with a previous
     * connection loss) was successful.
     */
    private _retryReconnectEvent: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Getter for the retry reconnect event.
     */
    public get retryReconnectEvent(): EventEmitter<void> {
        return this._retryReconnectEvent;
    }

    /**
     * Listeners will be nofitied, if the wesocket connection is establiched.
     */
    private _connectEvent: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Getter for the connect event.
     */
    public get connectEvent(): EventEmitter<void> {
        return this._connectEvent;
    }

    /**
     * Listeners will be nofitied, if the wesocket connection is closed.
     */
    private _closeEvent: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Getter for the close event.
     */
    public get closeEvent(): EventEmitter<void> {
        return this._closeEvent;
    }

    /**
     * Saves, if the connection is open
     */
    private _connectionOpen = false;

    /**
     * Whether the WebSocket connection is established
     */
    public get isConnected(): boolean {
        return this._connectionOpen;
    }

    private sendQueueWhileNotConnected: string[] = [];

    /**
     * The websocket.
     */
    private websocket: WebSocket;

    /**
     * Subjects for types of websocket messages. A subscriber can get an Observable by {@function getOberservable}.
     */
    private subjects: { [type: string]: Subject<any> } = {};

    /**
     * Callbacks for a waiting response
     */
    private responseCallbacks: { [id: string]: [(val: any) => boolean, (error: string) => void | null] } = {};

    /**
     * Saves, if the WS Connection should be closed (e.g. after an explicit `close()`). Prohibits
     * retry connection attempts.
     */
    private shouldBeClosed = true;

    /**
     * Counter for delaying the offline message.
     */
    private retryCounter = 0;

    /**
     * Constructor that handles the router
     * @param matSnackBar
     * @param zone
     * @param translate
     * @param router
     */
    public constructor(
        private matSnackBar: MatSnackBar,
        private zone: NgZone,
        private translate: TranslateService,
        private router: Router,
        private openSlidesStatusService: OpenSlidesStatusService
    ) {}

    /**
     * Creates a new WebSocket connection and handles incomming events.
     *
     * Uses NgZone to let all callbacks run in the angular context.
     */
    public async connect(options: ConnectOptions = {}, retry: boolean = false): Promise<void> {
        if (this.websocket) {
            await this.close();
        }

        if (!retry) {
            this.shouldBeClosed = false;
        }

        // set defaults
        options = Object.assign(options, {
            enableAutoupdates: true
        });

        const queryParams: QueryParams = {
            autoupdate: options.enableAutoupdates
        };

        if (options.changeId !== undefined) {
            queryParams.change_id = options.changeId;
        }

        // Create the websocket
        let socketPath = location.protocol === 'https:' ? 'wss://' : 'ws://';
        socketPath += window.location.host;
        if (this.openSlidesStatusService.isPrioritizedClient) {
            socketPath += '/prioritize';
        }
        socketPath += '/ws/';
        socketPath += formatQueryParams(queryParams);

        this.websocket = new WebSocket(socketPath);

        // connection established. If this connect attept was a retry,
        // The error notice will be removed and the reconnectSubject is published.
        this.websocket.onopen = (event: Event) => {
            this.zone.run(() => {
                this.retryCounter = 0;

                if (this.shouldBeClosed) {
                    this.dismissConnectionErrorNotice();
                    return;
                }

                if (retry) {
                    this.dismissConnectionErrorNotice();
                    this._retryReconnectEvent.emit();
                }
                this._connectionOpen = true;
                this._connectEvent.emit();
                this.sendQueueWhileNotConnected.forEach(entry => {
                    this.websocket.send(entry);
                });
                this.sendQueueWhileNotConnected = [];
            });
        };

        this.websocket.onmessage = (event: MessageEvent) => {
            this.zone.run(() => {
                this.handleMessage(event.data);
            });
        };

        this.websocket.onclose = (event: CloseEvent) => {
            this.zone.run(() => {
                this.onclose(event.code === 1000);
            });
        };

        this.websocket.onerror = (event: ErrorEvent) => {
            // place for proper error handling and debugging.
            // Required to get more information about errors
            this.zone.run(() => {
                console.warn('Websocket is on Error state. Error: ', event);
            });
        };
    }

    /**
     * Handles an incomming message.
     *
     * @param data The message
     */
    private handleMessage(data: string): void {
        const message: IncommingWebsocketMessage = JSON.parse(data);
        const type = message.type;
        const inResponse = message.in_response;
        const callbacks = this.responseCallbacks[inResponse];
        if (callbacks) {
            delete this.responseCallbacks[inResponse];
        }

        if (type === 'error') {
            console.error('Websocket error', message.content);
            if (inResponse && callbacks && callbacks[1]) {
                callbacks[1](message.content as string);
            }
            return;
        }

        // Try to fire a response callback directly. If it returnes true, the message is handeled
        // and not distributed further
        if (inResponse && callbacks && callbacks[0](message.content)) {
            return;
        }

        if (this.subjects[type]) {
            // Pass the content to the registered subscribers.
            this.subjects[type].next(message.content);
        } else {
            console.warn(
                `Got unknown websocket message type "${type}" (inResponse: ${inResponse}) with content`,
                message.content
            );
        }
    }

    /**
     * Simulates an abnormal close.
     */
    public simulateAbnormalClose(): void {
        if (this.websocket) {
            this.websocket.close();
        }
        this.onclose(false);
    }

    /**
     * Closes the connection error notice
     */
    private onclose(normalClose: boolean): void {
        this.websocket = null;
        this._connectionOpen = false;
        // 1000 is a normal close, like the close on logout
        this._closeEvent.emit();
        if (!this.shouldBeClosed && !normalClose) {
            // Do not show the message snackbar on the projector
            // tests for /projector and /projector/<id>
            const onProjector = this.router.url.match(/^\/projector(\/[0-9]+\/?)?$/);
            if (this.retryCounter <= 3) {
                this.retryCounter++;
            }

            if (!this.connectionErrorNotice && !onProjector && this.retryCounter > 3) {
                // So here we have a connection failure that wasn't intendet.
                this.connectionErrorNotice = this.matSnackBar.open(
                    this.translate.instant('Offline mode: You can use OpenSlides but changes are not saved.'),
                    '',
                    { duration: 0 }
                );
            }

            // A random retry timeout between 2000 and 5000 ms.
            const timeout = Math.floor(Math.random() * 3000 + 2000);
            setTimeout(() => {
                this.connect({ enableAutoupdates: true }, true);
            }, timeout);
        }
    }

    private dismissConnectionErrorNotice(): void {
        if (this.connectionErrorNotice) {
            this.connectionErrorNotice.dismiss();
            this.connectionErrorNotice = null;
        }
    }

    /**
     * Closes the websocket connection.
     */
    public async close(): Promise<void> {
        this.shouldBeClosed = true;
        this.dismissConnectionErrorNotice();
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
            await this.closeEvent.pipe(take(1)).toPromise();
        }
    }

    /**
     * closes and reopens the connection. If the connection was closed before,
     * it will be just opened.
     *
     * @param options The options for the new connection
     */
    public async reconnect(options: ConnectOptions = {}): Promise<void> {
        await this.close();
        await this.connect(options);
    }

    /**
     * Returns an observable for messages of the given type.
     * @param type the message type
     */
    public getOberservable<T>(type: string): Observable<T> {
        if (!this.subjects[type]) {
            this.subjects[type] = new Subject<T>();
        }
        return this.subjects[type].asObservable();
    }

    /**
     * Sends a message to the server with the content and the given type.
     *
     * @param type the message type
     * @param content the actual content
     * @param success an optional success callback for a response
     * @param error an optional error callback for a response
     * @param id an optional id for the message. If not given, a random id will be generated and returned.
     * @returns the message id
     */
    public send<T, R>(
        type: string,
        content: T,
        success?: (val: R) => boolean,
        error?: (error: string) => void,
        id?: string
    ): string {
        if (!this.websocket) {
            return;
        }

        const message: OutgoingWebsocketMessage = {
            type: type,
            content: content,
            id: id
        };

        // create message id if not given. Required by the server.
        if (!message.id) {
            message.id = '';
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            for (let i = 0; i < 8; i++) {
                message.id += possible.charAt(Math.floor(Math.random() * possible.length));
            }
        }

        if (success) {
            this.responseCallbacks[message.id] = [success, error];
        }

        // Either send directly or add to queue, if not connected.
        const jsonMessage = JSON.stringify(message);
        if (this.isConnected) {
            this.websocket.send(jsonMessage);
        } else {
            this.sendQueueWhileNotConnected.push(jsonMessage);
        }

        return message.id;
    }

    /**
     * Sends a message and waits for the response
     *
     * @param type the message type
     * @param content the actual content
     * @param id an optional id for the message. If not given, a random id will be generated and returned.
     */
    public sendAndGetResponse<T, R>(type: string, content: T, id?: string): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            this.send<T, R>(
                type,
                content,
                val => {
                    resolve(val);
                    return true;
                },
                reject,
                id
            );
        });
    }
}
