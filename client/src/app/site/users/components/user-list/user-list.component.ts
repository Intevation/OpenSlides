import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { ChoiceService } from 'app/core/ui-services/choice.service';
import { ConfigService } from 'app/core/ui-services/config.service';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ListViewBaseComponent } from '../../../base/list-view-base';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { UserFilterListService } from '../../services/user-filter-list.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { UserPdfExportService } from '../../services/user-pdf-export.service';
import { UserSortListService } from '../../services/user-sort-list.service';
import { ViewportService } from 'app/core/ui-services/viewport.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ViewUser } from '../../models/view-user';
import { ViewGroup } from '../../models/view-group';
import { genders, User } from 'app/shared/models/users/user';
import { _ } from 'app/core/translate/translation-marker';
import { StorageService } from 'app/core/core-services/storage.service';

/**
 * Interface for the short editing dialog.
 * Describe, which values the dialog has.
 */
interface InfoDialog {
    /**
     * The name of the user.
     */
    name: string;

    /**
     * Define all the groups the user is in.
     */
    groups_id: number[];

    /**
     * The gender of the user.
     */
    gender: string;

    /**
     * The participant number of the user.
     */
    number: string;

    /**
     * Structure level for one user.
     */
    structure_level: string;
}

/**
 * Component for the user list view.
 *
 */
@Component({
    selector: 'os-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent extends ListViewBaseComponent<ViewUser, User> implements OnInit {
    /**
     * The reference to the template.
     */
    @ViewChild('userInfoDialog')
    private userInfoDialog: TemplateRef<string>;

    /**
     * Declares the dialog for editing.
     */
    public infoDialog: InfoDialog;

    /**
     * All available groups, where the user can be in.
     */
    public groups: ViewGroup[];

    /**
     * The list of all genders.
     */
    public genderList = genders;

    /**
     * Columns to display in table when desktop view is available
     */
    public displayedColumnsDesktop: string[] = ['name', 'group', 'anchor'];

    /**
     * Columns to display in table when mobile view is available
     */
    public displayedColumnsMobile = ['name', 'anchor'];

    /**
     * Stores the observed configuration if the presence view is available to administrators
     */
    private _presenceViewConfigured = false;

    /**
     * @returns true if the presence view is available to administrators
     */
    public get presenceViewConfigured(): boolean {
        return this._presenceViewConfigured && this.operator.hasPerms('users.can_manage');
    }

    /**
     * Helper to check for main button permissions
     *
     * @returns true if the user should be able to create users
     */
    public get canAddUser(): boolean {
        return this.operator.hasPerms('users.can_manage');
    }

    /**
     * The usual constructor for components
     * @param titleService Serivce for setting the title
     * @param translate Service for translation handling
     * @param matSnackBar Helper to diplay errors
     * @param repo the user repository
     * @param groupRepo: The user group repository
     * @param router the router service
     * @param route the local route
     * @param operator
     * @param vp
     * @param csvExport CSV export Service,
     * @param promptService
     * @param groupRepo
     * @param filterService
     * @param sortService
     * @param config ConfigService
     * @param userPdf Service for downloading pdf
     */
    public constructor(
        titleService: Title,
        protected translate: TranslateService, // protected required for ng-translate-extract
        matSnackBar: MatSnackBar,
        route: ActivatedRoute,
        storage: StorageService,
        private repo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        private choiceService: ChoiceService,
        private router: Router,
        private operator: OperatorService,
        private vp: ViewportService,
        protected csvExport: CsvExportService,
        private promptService: PromptService,
        public filterService: UserFilterListService,
        public sortService: UserSortListService,
        config: ConfigService,
        private userPdf: UserPdfExportService,
        private dialog: MatDialog
    ) {
        super(titleService, translate, matSnackBar, route, storage, filterService, sortService);

        // enable multiSelect for this listView
        this.canMultiSelect = true;
        config.get<boolean>('users_enable_presence_view').subscribe(state => (this._presenceViewConfigured = state));
    }

    /**
     * Init function
     *
     * sets the title, inits the table, sets sorting and filter options, subscribes
     * to filter/sort services
     */
    public ngOnInit(): void {
        super.setTitle('Participants');
        this.initTable();
        this.setFulltextFilter();

        // Initialize the groups
        this.groups = this.groupRepo.getSortedViewModelList().filter(group => group.id !== 1);
        this.groupRepo
            .getViewModelListObservable()
            .subscribe(groups => (this.groups = groups.filter(group => group.id !== 1)));
    }

    /**
     * Handles the click on a user row if not in multiSelect modus
     * @param row selected row
     */
    public singleSelectAction(row: ViewUser): void {
        this.router.navigate([`./${row.id}`], { relativeTo: this.route });
    }

    /**
     * Handles the click on the plus button
     */
    public onPlusButton(): void {
        this.router.navigate(['./new'], { relativeTo: this.route });
    }

    /**
     * This function opens the dialog,
     * where the user can quick change the groups,
     * the gender and the participant number.
     *
     * @param user is an instance of ViewUser. This is the given user, who will be modified.
     */
    public openEditInfo(user: ViewUser, ev: MouseEvent): void {
        if (this.isMultiSelect || !this.operator.hasPerms('users.can_manage')) {
            return;
        }
        ev.stopPropagation();
        this.infoDialog = {
            name: user.username,
            groups_id: user.groups_id,
            gender: user.gender,
            structure_level: user.structure_level,
            number: user.number
        };

        const dialogRef = this.dialog.open(this.userInfoDialog, {
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            disableClose: true
        });

        dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            if (event.key === 'Enter' && event.shiftKey) {
                dialogRef.close(this.infoDialog);
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.update(result, user);
            }
        });
    }

    /**
     * Export all users currently matching the filter
     * as CSV (including personal information such as initial passwords)
     */
    public csvExportUserList(): void {
        this.csvExport.export(
            this.dataSource.filteredData,
            [
                { property: 'title' },
                { property: 'first_name', label: 'Given name' },
                { property: 'last_name', label: 'Surname' },
                { property: 'structure_level', label: 'Structure level' },
                { property: 'number', label: 'Participant number' },
                { label: 'groups', map: user => user.groups.map(group => group.name).join(',') },
                { property: 'comment' },
                { property: 'is_active', label: 'Is active' },
                { property: 'is_present', label: 'Is present' },
                { property: 'is_committee', label: 'Is a committee' },
                { property: 'default_password', label: 'Initial password' },
                { property: 'email' }
            ],
            this.translate.instant('Participants') + '.csv'
        );
    }

    /**
     * Export all users currently matching the filter as PDF
     * (access information, including personal information such as initial passwords)
     */
    public onDownloadAccessPdf(): void {
        this.userPdf.exportMultipleUserAccessPDF(this.dataSource.data);
    }

    /**
     * triggers the download of a simple participant list (no details on user name and passwords)
     * with all users currently matching the filter
     */
    public pdfExportUserList(): void {
        this.userPdf.exportUserList(this.dataSource.data);
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete all selected participants?');
        if (await this.promptService.open(title, null)) {
            for (const user of this.selectedRows) {
                await this.repo.delete(user);
            }
        }
    }

    /**
     * Opens a dialog and sets the group(s) for all selected users.
     * SelectedRows is only filled with data in multiSelect mode
     */
    public async setGroupSelected(): Promise<void> {
        const content = this.translate.instant(
            'This will add or remove the following groups for all selected participants:'
        );
        const choices = [_('add group(s)'), _('remove group(s)')];
        const selectedChoice = await this.choiceService.open(content, this.groupRepo.getViewModelList(), true, choices);
        if (selectedChoice) {
            for (const user of this.selectedRows) {
                const newGroups = [...user.groups_id];
                (selectedChoice.items as number[]).forEach(newChoice => {
                    const idx = newGroups.indexOf(newChoice);
                    if (idx < 0 && selectedChoice.action === choices[0]) {
                        newGroups.push(newChoice);
                    } else if (idx >= 0 && selectedChoice.action === choices[1]) {
                        newGroups.splice(idx, 1);
                    }
                });
                await this.repo.update({ groups_id: newGroups }, user);
            }
        }
    }

    /**
     * Handler for bulk setting/unsetting the 'active' attribute.
     * Uses selectedRows defined via multiSelect mode.
     */
    public async setActiveSelected(): Promise<void> {
        const content = this.translate.instant('Set active status for selected participants:');
        const options = [_('active'), _('inactive')];
        const selectedChoice = await this.choiceService.open(content, null, false, options);
        if (selectedChoice) {
            const active = selectedChoice.action === options[0];
            for (const user of this.selectedRows) {
                await this.repo.update({ is_active: active }, user);
            }
        }
    }

    /**
     * Handler for bulk setting/unsetting the 'is present' attribute.
     * Uses selectedRows defined via multiSelect mode.
     */
    public async setPresentSelected(): Promise<void> {
        const content = this.translate.instant('Set presence status for selected participants:');
        const options = [_('present'), _('absent')];
        const selectedChoice = await this.choiceService.open(content, null, false, options);
        if (selectedChoice) {
            const present = selectedChoice.action === options[0];
            for (const user of this.selectedRows) {
                await this.repo.update({ is_present: present }, user);
            }
        }
    }

    /**
     * Handler for bulk setting/unsetting the 'is committee' attribute.
     * Uses selectedRows defined via multiSelect mode.
     */
    public async setCommitteeSelected(): Promise<void> {
        const content = this.translate.instant('Set committee status for selected participants:');
        const options = [_('committee'), _('no committee')];
        const selectedChoice = await this.choiceService.open(content, null, false, options);
        if (selectedChoice) {
            const committee = selectedChoice.action === options[0];
            for (const user of this.selectedRows) {
                await this.repo.update({ is_committee: committee }, user);
            }
        }
    }

    /**
     * Handler for bulk sending e-mail invitations. Uses selectedRows defined via
     * multiSelect mode.
     */
    public async sendInvitationEmailSelected(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to send emails to all selected participants?');
        const content = this.selectedRows.length + ' ' + this.translate.instant('emails');
        if (await this.promptService.open(title, content)) {
            this.repo.sendInvitationEmail(this.selectedRows).then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Get information about the last time an invitation email was sent to a user
     *
     * @param user
     * @returns a string representation about the last time an email was sent to a user
     */
    public getEmailSentTime(user: ViewUser): string {
        if (!user.is_last_email_send) {
            return this.translate.instant('No email sent');
        }
        return this.repo.lastSentEmailTimeString(user);
    }

    /**
     * Handler for bulk setting new passwords. Needs multiSelect mode.
     */
    public async resetPasswordsSelected(): Promise<void> {
        if (this.selectedRows.find(row => row.user.id === this.operator.user.id)) {
            this.raiseError(
                this.translate.instant(
                    'Note: Your own password was not changed. Please use the password change dialog instead.'
                )
            );
        }
        for (const user of this.selectedRows.filter(u => u.user.id !== this.operator.user.id)) {
            const password = this.repo.getRandomPassword();
            this.repo.resetPassword(user, password, true);
        }
    }

    /**
     * returns the column definition
     *
     * @returns column definition
     */
    public getColumnDefinition(): string[] {
        let columns = this.vp.isMobile ? this.displayedColumnsMobile : this.displayedColumnsDesktop;
        if (this.operator.hasPerms('core.can_manage_projector') && !this.isMultiSelect) {
            columns = ['projector'].concat(columns);
        }
        if (this.operator.hasPerms('users.can_manage')) {
            columns = columns.concat(['infos', 'presence']);
        }
        if (this.isMultiSelect) {
            columns = ['selector'].concat(columns);
        }
        return columns;
    }

    /**
     * Sets the user present
     *
     * @param viewUser the viewUser Object
     * @param event the mouse event (to prevent propagaton to row triggers)
     */
    public async setPresent(viewUser: ViewUser): Promise<void> {
        viewUser.user.is_present = !viewUser.user.is_present;
        await this.repo.update(viewUser.user, viewUser);
    }

    /**
     * Overwrites the dataSource's string filter with a case-insensitive search
     * in the full_name property
     */
    private setFulltextFilter(): void {
        this.dataSource.filterPredicate = (data, filter) => {
            if (!data || !data.full_name) {
                return false;
            }
            filter = filter ? filter.toLowerCase() : '';
            return data.full_name.toLowerCase().indexOf(filter) >= 0;
        };
    }
}
