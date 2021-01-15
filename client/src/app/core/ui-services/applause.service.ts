import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { HttpService } from '../core-services/http.service';
import { NotifyService } from '../core-services/notify.service';

export interface Applause {
    level: number;
    presentUsers: number;
}

@Injectable({
    providedIn: 'root'
})
export class ApplauseService {
    private applausePath = '/system/applause';
    private applauseNotifyPath = 'applause';

    public applauseObservable: Observable<Applause> = this.notifyService
        .getMessageObservable<Applause>(this.applauseNotifyPath)
        .pipe(
            map(notify => notify.message as Applause),
            /**
             * only updates when the effective applause level changes
             */
            distinctUntilChanged((prev, curr) => {
                return prev.level === curr.level;
            })
        );

    public constructor(private httpService: HttpService, private notifyService: NotifyService) {}

    public async sendApplause(): Promise<void> {
        await this.httpService.post(this.applausePath);
    }
}
