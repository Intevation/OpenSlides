import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ConfigService } from 'app/core/ui-services/config.service';
import { PercentBase } from 'app/shared/models/poll/base-poll';
import { PollType } from 'app/shared/models/poll/base-poll';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { BaseViewComponent } from 'app/site/base/base-view';
import {
    MajorityMethodVerbose,
    PercentBaseVerbose,
    PollClassType,
    PollPropertyVerbose,
    PollTypeVerbose,
    ViewBasePoll
} from 'app/site/polls/models/view-base-poll';
import { ViewGroup } from 'app/site/users/models/view-group';
import { PollService } from '../../services/poll.service';

@Component({
    selector: 'os-poll-form',
    templateUrl: './poll-form.component.html',
    styleUrls: ['./poll-form.component.scss']
})
export class PollFormComponent extends BaseViewComponent implements OnInit {
    /**
     * The form-group for the meta-info.
     */
    public contentForm: FormGroup;

    public PollType = PollType;
    public PollPropertyVerbose = PollPropertyVerbose;

    /**
     * The different methods for this poll.
     */
    @Input()
    public pollMethods: { [key: string]: string };

    @Input()
    public data: Partial<ViewBasePoll>;

    /**
     * The different types the poll can accept.
     */
    public pollTypes = PollTypeVerbose;

    /**
     * The percent base for the poll.
     */
    public percentBases: { [key: string]: string } = PercentBaseVerbose;

    /**
     * The majority methods for the poll.
     */
    public majorityMethods = MajorityMethodVerbose;

    /**
     * Reference to the observable of the groups. Used by the `search-value-component`.
     */
    public groupObservable: Observable<ViewGroup[]> = null;

    /**
     * An twodimensional array to handle constant values for this poll.
     */
    public pollValues: [string, unknown][] = [];

    /**
     * Model for the checkbox.
     * If true, the given poll will immediately be published.
     */
    public publishImmediately = true;

    /**
     * Constructor. Retrieves necessary metadata from the pollService,
     * injects the poll itself
     */
    public constructor(
        title: Title,
        protected translate: TranslateService,
        snackbar: MatSnackBar,
        private fb: FormBuilder,
        private groupRepo: GroupRepositoryService,
        public pollService: PollService,
        private configService: ConfigService
    ) {
        super(title, translate, snackbar);
        this.initContentForm();
    }

    /**
     * OnInit.
     * Sets the observable for groups.
     */
    public ngOnInit(): void {
        this.groupObservable = this.groupRepo.getViewModelListObservable();

        const cast = <ViewAssignmentPoll>this.data;
        if (cast.assignment && !cast.votes_amount) {
            cast.votes_amount = cast.assignment.open_posts;
        }

        if (this.data) {
            if (!this.data.groups_id) {
                if (this.data.collectionString === ViewAssignmentPoll.COLLECTIONSTRING) {
                    this.data.groups_id = this.configService.instant('assignment_poll_default_groups');
                } else {
                    this.data.groups_id = this.configService.instant('motion_poll_default_groups');
                }
            }
            Object.keys(this.contentForm.controls).forEach(key => {
                if (this.data[key]) {
                    this.contentForm.get(key).setValue(this.data[key]);
                }
            });
        }
        this.updatePollValues(this.contentForm.value);

        this.subscriptions.push(
            this.contentForm.valueChanges.subscribe(values => {
                this.updatePollValues(values);
            })
        );

        // update the percent bases when the poll method changes
        this.contentForm.get('pollmethod').valueChanges.subscribe(method => {
            let forbiddenBases: string[];
            if (method === 'YN') {
                forbiddenBases = [PercentBase.YNA, PercentBase.Votes];
            } else if (method === 'YNA') {
                forbiddenBases = [PercentBase.Votes];
            } else if (method === 'votes') {
                forbiddenBases = [PercentBase.YN, PercentBase.YNA];
            }

            const percentBases = {};
            for (const [key, value] of Object.entries(PercentBaseVerbose)) {
                if (!forbiddenBases.includes(key)) {
                    percentBases[key] = value;
                }
            }
            this.percentBases = percentBases;
            // TODO: update selected base
        });
    }

    public getValues<V extends ViewBasePoll>(): Partial<V> {
        return { ...this.data, ...this.contentForm.value };
    }

    /**
     * This updates the poll-values to get correct data in the view.
     *
     * @param data Passing the properties of the poll.
     */
    private updatePollValues(data: { [key: string]: any }): void {
        this.pollValues = [
            [this.pollService.getVerboseNameForKey('type'), this.pollService.getVerboseNameForValue('type', data.type)]
        ];
        // show pollmethod only for assignment polls
        if (this.data.pollClassType === PollClassType.Assignment) {
            this.pollValues.push([
                this.pollService.getVerboseNameForKey('pollmethod'),
                this.pollService.getVerboseNameForValue('pollmethod', data.pollmethod)
            ]);
        }
        if (data.type !== 'analog') {
            this.pollValues.push([
                this.pollService.getVerboseNameForKey('groups'),
                this.groupRepo.getNameForIds(...([] || (data && data.groups_id)))
            ]);
        }
        if (data.pollmethod === 'votes') {
            this.pollValues.push([this.pollService.getVerboseNameForKey('votes_amount'), data.votes_amount]);
            this.pollValues.push([this.pollService.getVerboseNameForKey('global_no'), data.global_no]);
            this.pollValues.push([this.pollService.getVerboseNameForKey('global_abstain'), data.global_abstain]);
        }
    }

    private initContentForm(): void {
        this.contentForm = this.fb.group({
            title: ['', Validators.required],
            type: ['', Validators.required],
            pollmethod: ['', Validators.required],
            onehundred_percent_base: ['', Validators.required],
            majority_method: ['', Validators.required],
            votes_amount: [1, [Validators.required, Validators.min(1)]],
            groups_id: [],
            global_no: [],
            global_abstain: []
        });
    }
}
