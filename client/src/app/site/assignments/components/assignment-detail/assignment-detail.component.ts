import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { Assignment } from 'app/shared/models/assignments/assignment';
import { AssignmentPdfExportService } from '../../services/assignment-pdf-export.service';
import { AssignmentPoll } from 'app/shared/models/assignments/assignment-poll';
import { AssignmentPollService } from '../../services/assignment-poll.service';
import { AssignmentRepositoryService } from 'app/core/repositories/assignments/assignment-repository.service';
import { BaseViewComponent } from 'app/site/base/base-view';
import { ItemRepositoryService } from 'app/core/repositories/agenda/item-repository.service';
import { LocalPermissionsService } from 'app/site/motions/services/local-permissions.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ViewAssignment, AssignmentPhases } from '../../models/view-assignment';
import { ViewAssignmentRelatedUser } from '../../models/view-assignment-related-user';
import { ViewItem } from 'app/site/agenda/models/view-item';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';

/**
 * Component for the assignment detail view
 */
@Component({
    selector: 'os-assignment-detail',
    templateUrl: './assignment-detail.component.html',
    styleUrls: ['./assignment-detail.component.scss']
})
export class AssignmentDetailComponent extends BaseViewComponent implements OnInit {
    /**
     * Determines if the assignment is new
     */
    public newAssignment = false;

    /**
     * If true, the page is supposed to be in 'edit' mode (i.e. the assignment itself can be edited)
     */
    public editAssignment = false;

    /**
     * The different phases of an assignment. Info is fetched from server
     */
    public phaseOptions = AssignmentPhases;

    /**
     * List of users available as candidates (used as raw data for {@link filteredCandidates})
     */
    private availableCandidates = new BehaviorSubject<ViewUser[]>([]);

    /**
     * A BehaviourSubject with a filtered list of users (excluding users already
     * in the list of candidates). It is updated each time {@link filterCandidates}
     * is called (triggered by autoupdates)
     */
    public filteredCandidates = new BehaviorSubject<ViewUser[]>([]);

    /**
     * Form for adding/removing candidates.
     */
    public candidatesForm: FormGroup;

    /**
     * Form for editing the assignment itself (TODO mergeable with candidates?)
     */
    public assignmentForm: FormGroup;

    /**
     * Used in the search Value selector to assign tags
     */
    public tagsObserver: BehaviorSubject<ViewTag[]>;

    /**
     * Used for the search value selector
     */
    public mediafilesObserver: BehaviorSubject<ViewMediafile[]>;

    /**
     * Used in the search Value selector to assign an agenda item
     */
    public agendaObserver: BehaviorSubject<ViewItem[]>;

    /**
     * Sets the assignment, e.g. via an auto update. Reload important things here:
     * - Poll base values are be recalculated
     *
     * @param assignment the assignment to set
     */
    public set assignment(assignment: ViewAssignment) {
        this._assignment = assignment;

        this.filterCandidates();
        if (this.assignment.polls.length) {
            this.assignment.polls.forEach(poll => {
                poll.pollBase = this.pollService.getBaseAmount(poll);
            });
        }
    }

    /**
     * Returns the target assignment.
     */
    public get assignment(): ViewAssignment {
        return this._assignment;
    }

    /**
     * Current instance of ViewAssignment. Accessed via getter and setter.
     */
    private _assignment: ViewAssignment;

    /**
     * Copy instance of the assignment that the user might edit
     */
    public assignmentCopy: ViewAssignment;

    /**
     * Check if the operator is a candidate
     *
     * @returns true if they are in the list of candidates
     */
    public get isSelfCandidate(): boolean {
        return this.assignment.candidates.find(user => user.id === this.operator.user.id) ? true : false;
    }

    /**
     * Checks if there are any tags available
     */
    public get tagsAvailable(): boolean {
        return this.tagsObserver.getValue().length > 0;
    }

    /**
     * Checks if there are any mediafiles available
     */
    public get mediafilesAvailable(): boolean {
        return this.mediafilesObserver.getValue().length > 0;
    }

    /**
     * Checks if there are any items available
     */
    public get parentsAvailable(): boolean {
        return this.agendaObserver.getValue().length > 0;
    }

    /**
     * Constructor. Build forms and subscribe to needed configs and updates
     *
     * @param title
     * @param translate
     * @param matSnackBar
     * @param vp
     * @param operator
     * @param perms
     * @param router
     * @param route
     * @param formBuilder
     * @param repo
     * @param userRepo
     * @param pollService
     * @param agendaRepo
     * @param tagRepo
     * @param promptService
     */
    public constructor(
        title: Title,
        protected translate: TranslateService, // protected required for ng-translate-extract
        matSnackBar: MatSnackBar,
        public vp: ViewportService,
        private operator: OperatorService,
        public perms: LocalPermissionsService,
        private router: Router,
        private route: ActivatedRoute,
        formBuilder: FormBuilder,
        public repo: AssignmentRepositoryService,
        private userRepo: UserRepositoryService,
        public pollService: AssignmentPollService,
        private agendaRepo: ItemRepositoryService,
        private tagRepo: TagRepositoryService,
        private promptService: PromptService,
        private pdfService: AssignmentPdfExportService,
        private mediafileRepo: MediafileRepositoryService
    ) {
        super(title, translate, matSnackBar);
        this.subscriptions.push(
            /* List of eligible users */
            this.userRepo.getViewModelListObservable().subscribe(users => {
                this.availableCandidates.next(users);
                this.filterCandidates();
            })
        );
        this.assignmentForm = formBuilder.group({
            phase: null,
            tags_id: [],
            attachments_id: [],
            title: '',
            description: '',
            poll_description_default: '',
            open_posts: 0,
            agenda_item_id: '' // create agenda item
        });
        this.candidatesForm = formBuilder.group({
            userId: null
        });
    }

    /**
     * Init data
     */
    public ngOnInit(): void {
        this.getAssignmentByUrl();
        this.agendaObserver = this.agendaRepo.getViewModelListBehaviorSubject();
        this.tagsObserver = this.tagRepo.getViewModelListBehaviorSubject();
        this.mediafilesObserver = this.mediafileRepo.getViewModelListBehaviorSubject();
    }

    /**
     * Permission check for interactions.
     *
     * Current operations supported:
     *  - addSelf: the user can add/remove themself to the list of candidates
     *  - addOthers: the user can add/remove other candidates
     *  - createPoll: the user can add/edit an election poll (requires candidates to be present)
     *  - manage: the user has general manage permissions (i.e. editing the assignment metaInfo)
     *
     * @param operation the action requested
     * @returns true if the user is able to perform the action
     */
    public hasPerms(operation: string): boolean {
        const isManager = this.operator.hasPerms('assignments.can_manage');
        switch (operation) {
            case 'addSelf':
                if (isManager && !this.assignment.isFinished) {
                    return true;
                } else {
                    return (
                        this.assignment.isSearchingForCandidates &&
                        this.operator.hasPerms('assignments.can_nominate_self') &&
                        !this.assignment.isFinished
                    );
                }
            case 'addOthers':
                if (isManager && !this.assignment.isFinished) {
                    return true;
                } else {
                    return (
                        this.assignment.isSearchingForCandidates &&
                        this.operator.hasPerms('assignments.can_nominate_others') &&
                        !this.assignment.isFinished
                    );
                }
            case 'createPoll':
                return (
                    isManager && this.assignment && !this.assignment.isFinished && this.assignment.candidateAmount > 0
                );
            case 'manage':
                return isManager;
            default:
                return false;
        }
    }

    /**
     * Sets/unsets the 'edit assignment' mode
     *
     * @param newMode
     */
    public setEditMode(newMode: boolean): void {
        if (newMode && this.hasPerms('manage')) {
            this.patchForm(this.assignment);
            this.editAssignment = true;
        }
        if (!newMode && this.newAssignment) {
            this.router.navigate(['./assignments/']);
        }
        if (!newMode) {
            this.editAssignment = false;
        }
    }

    /**
     * Changes/updates the assignment form values
     *
     * @param assignment
     */
    private patchForm(assignment: ViewAssignment): void {
        this.assignmentCopy = assignment;
        this.assignmentForm.patchValue({
            title: assignment.title || '',
            tags_id: assignment.assignment.tags_id || [],
            attachments_id: assignment.assignment.attachments_id || [],
            agendaItem: assignment.assignment.agenda_item_id || null,
            phase: assignment.phase, // todo default: 0?
            description: assignment.assignment.description || '',
            poll_description_default: assignment.assignment.poll_description_default,
            open_posts: assignment.assignment.open_posts || 1
        });
    }

    /**
     * Save the current state of the assignment
     */
    public saveAssignment(): void {
        if (this.newAssignment) {
            this.createAssignment();
        } else {
            this.updateAssignmentFromForm();
        }
    }

    /**
     * Creates a new Poll
     * TODO: directly open poll dialog?
     */
    public async createPoll(): Promise<void> {
        await this.repo.addPoll(this.assignment).then(null, this.raiseError);
    }

    /**
     * Adds the operator to list of candidates
     */
    public async addSelf(): Promise<void> {
        await this.repo.addSelf(this.assignment).then(null, this.raiseError);
    }

    /**
     * Removes the operator from list of candidates
     */
    public async removeSelf(): Promise<void> {
        await this.repo.deleteSelf(this.assignment).then(null, this.raiseError);
    }

    /**
     * Adds the user from the candidates form to the list of candidates
     *
     * @param userId the id of a ViewUser
     */
    public async addUser(userId: number): Promise<void> {
        const user = this.userRepo.getViewModel(userId);
        if (user) {
            await this.repo.changeCandidate(user, this.assignment, true).then(null, this.raiseError);
        }
    }

    /**
     * Removes a user from the list of candidates
     *
     * @param candidate A ViewAssignmentUser currently in the list of related users
     */
    public async removeUser(candidate: ViewAssignmentRelatedUser): Promise<void> {
        await this.repo.changeCandidate(candidate.user, this.assignment, false).then(null, this.raiseError);
    }

    /**
     * Determine the assignment to display using the URL
     */
    public getAssignmentByUrl(): void {
        const params = this.route.snapshot.params;
        if (params && params.id) {
            // existing assignment
            const assignmentId: number = +params.id;
            // the following subscriptions need to be cleared when the route changes
            this.subscriptions.push(
                this.repo.getViewModelObservable(assignmentId).subscribe(assignment => {
                    if (assignment) {
                        this.assignment = assignment;
                        if (!this.editAssignment) {
                            this.patchForm(this.assignment);
                        }
                    }
                })
            );
            this.subscriptions.push(
                this.candidatesForm.valueChanges.subscribe(formResult => {
                    // resetting a form triggers a form.next(null) - check if data is present
                    if (formResult && formResult.userId) {
                        this.addUser(formResult.userId);
                    }
                })
            );
        } else {
            this.newAssignment = true;
            // TODO set defaults?
            this.assignment = new ViewAssignment(new Assignment(), [], []);
            this.patchForm(this.assignment);
            this.setEditMode(true);
        }
    }

    /**
     * Handler for deleting the assignment
     */
    public async onDeleteAssignmentButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this election?');
        if (await this.promptService.open(title, this.assignment.getTitle())) {
            this.repo.delete(this.assignment).then(() => this.router.navigate(['../']), this.raiseError);
        }
    }

    /**
     * Handler for actions to be done on change of displayed poll
     * TODO: needed?
     */
    public onTabChange(): void {}

    /**
     * Handler for changing the phase of an assignment
     *
     * TODO: only with existing assignments, else it should fail
     * TODO check permissions and conditions
     *
     * @param value the phase to set
     */
    public async onSetPhaseButton(value: number): Promise<void> {
        this.repo.update({ phase: value }, this.assignment).then(null, this.raiseError);
    }

    public onDownloadPdf(): void {
        this.pdfService.exportSingleAssignment(this.assignment);
    }

    /**
     * Creates an assignment. Calls the "patchValues" function
     */
    public async createAssignment(): Promise<void> {
        const newAssignmentValues = { ...this.assignmentForm.value };

        if (!newAssignmentValues.agenda_parent_id) {
            delete newAssignmentValues.agenda_parent_id;
        }
        try {
            const response = await this.repo.create(newAssignmentValues);
            this.router.navigate(['./assignments/' + response.id]);
        } catch (e) {
            this.raiseError(this.translate.instant(e));
        }
    }

    public updateAssignmentFromForm(): void {
        this.repo.patch({ ...this.assignmentForm.value }, this.assignmentCopy).then(() => {
            this.editAssignment = false;
        }, this.raiseError);
    }

    /**
     * clicking Shift and Enter will save automatically
     * Hitting escape while in the edit form should cancel editing
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.saveAssignment();
        }
        if (event.key === 'Escape') {
            this.setEditMode(false);
        }
    }

    /**
     * Assemble a meaningful label for the poll
     * Published polls will look like 'Ballot 2'
     * other polls will be named 'Ballot 2' for normal users, with the hint
     * '(unpulished)' appended for manager users
     *
     * @param poll
     * @param index the index of the poll relative to the assignment
     */
    public getPollLabel(poll: AssignmentPoll, index: number): string {
        const title = `${this.translate.instant('Ballot')} ${index + 1}`;
        if (!poll.published && this.hasPerms('manage')) {
            return title + ` (${this.translate.instant('unpublished')})`;
        } else {
            return title;
        }
    }

    /**
     * Triggers an update of the filter for the list of available candidates
     * (triggered on an autoupdate of either users or the assignment)
     */
    private filterCandidates(): void {
        if (!this.assignment || !this.assignment.candidates) {
            this.filteredCandidates.next(this.availableCandidates.getValue());
        } else {
            this.filteredCandidates.next(
                this.availableCandidates
                    .getValue()
                    .filter(u => !this.assignment.candidates.some(cand => cand.id === u.id))
            );
        }
    }

    /**
     * Triggers an update of the sorting.
     */
    public onSortingChange(listInNewOrder: ViewAssignmentRelatedUser[]): void {
        this.repo
            .sortCandidates(listInNewOrder.map(relatedUser => relatedUser.id), this.assignment)
            .then(null, this.raiseError);
    }

    /**
     * Gets the link to the list of speakers associated with the assignment
     */
    public getSpeakerLink(): string {
        return `/agenda/${this.assignment.agendaItem.id}/speakers`;
    }
}
