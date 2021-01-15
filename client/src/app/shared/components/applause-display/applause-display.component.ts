import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { Applause, ApplauseService } from 'app/core/ui-services/applause.service';
import { ConfigService } from 'app/core/ui-services/config.service';
import { fadeAnimation } from 'app/shared/animations';
import { BaseViewComponentDirective } from 'app/site/base/base-view';

type ApplauseDisplayType = 'bar' | 'particles';
@Component({
    selector: 'os-applause-display',
    templateUrl: './applause-display.component.html',
    styleUrls: ['./applause-display.component.scss'],
    animations: [fadeAnimation],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ApplauseDisplayComponent extends BaseViewComponentDirective {
    public level = 0;
    public showLevel: boolean;
    public type: ApplauseDisplayType;
    private presentUsers = 0;
    private _percent = 0;
    private minApplauseLevel: number;
    private maxApplauseLevel: number;

    public get percent(): number {
        return this._percent;
    }

    public get hasLevel(): boolean {
        return this.level >= this.minApplauseLevel;
    }

    public constructor(
        title: Title,
        translate: TranslateService,
        matSnackBar: MatSnackBar,
        cd: ChangeDetectorRef,
        applauseService: ApplauseService,
        configService: ConfigService
    ) {
        super(title, translate, matSnackBar);
        this.subscriptions.push(
            applauseService.applauseObservable.subscribe((applause: Applause) => {
                this.level = applause?.level || 0;
                this.presentUsers = applause?.presentUsers || 0;
                this.setPercentage();
                cd.markForCheck();
            }),
            configService.get<any>('general_system_applause_type').subscribe(type => {
                if (type === 'applause-type-bar') {
                    this.type = 'bar';
                } else if (type === 'applause-type-particles') {
                    this.type = 'particles';
                }
                cd.markForCheck();
            }),
            configService.get<boolean>('general_system_applause_show_level').subscribe(show => {
                this.showLevel = show;
            }),
            configService.get<boolean>('general_system_applause_show_level').subscribe(show => {
                this.showLevel = show;
            }),
            configService.get<number>('general_system_applause_min_amount').subscribe(minLevel => {
                this.minApplauseLevel = minLevel;
            }),
            configService.get<number>('general_system_applause_max_amount').subscribe(maxLevel => {
                this.maxApplauseLevel = maxLevel;
            })
        );
    }

    public setPercentage(): void {
        if (this.level >= this.minApplauseLevel) {
            const max = this.maxApplauseLevel || this.presentUsers || 0;

            let quote = this.level / max || 0;

            if (quote > 1) {
                quote = 1;
            }

            this._percent = quote * 100;
        } else {
            this._percent = 0;
        }
    }
}
