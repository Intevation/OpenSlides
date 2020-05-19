import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import videojs from 'video.js';

import { Deferred } from 'app/core/promises/deferred';
import { ConfigService } from 'app/core/ui-services/config.service';

interface VideoSource {
    src: string;
    type: 'video/mp4' | 'application/x-mpegURL';
}

@Component({
    selector: 'os-vjs-player',
    templateUrl: './vjs-player.component.html',
    styleUrls: ['./vjs-player.component.scss']
})
export class VjsPlayerComponent implements OnInit, OnDestroy {
    @ViewChild('target', { static: true }) private target: ElementRef;

    public get defaultOptions(): object {
        return {
            autoplay: true,
            controls: true,
            sources: [this.videoSource]
        };
    }

    public player: videojs.Player;

    private configLoaded: Deferred<void> = new Deferred();
    private videoUrl: string;

    private get videoSource(): VideoSource {
        return {
            src: this.videoUrl,
            type: 'application/x-mpegURL'
        };
    }

    public constructor(configService: ConfigService) {
        configService.get<string>('general_system_stream_url').subscribe(url => {
            if (url) {
                this.videoUrl = url;
                this.configLoaded.resolve();
            }
        });
    }

    public async ngOnInit(): Promise<void> {
        await this.configLoaded;
        this.player = videojs(this.target.nativeElement, this.defaultOptions, () => {
            console.log('onPlayerReady');
        });
    }

    public ngOnDestroy(): void {
        if (this.player) {
            this.player.dispose();
        }
    }
}
