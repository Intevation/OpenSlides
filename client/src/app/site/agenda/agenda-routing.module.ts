import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgendaImportListComponent } from './components/agenda-import-list/agenda-import-list.component';
import { AgendaListComponent } from './components/agenda-list/agenda-list.component';
import { AgendaSortComponent } from './components/agenda-sort/agenda-sort.component';
import { ListOfSpeakersComponent } from './components/list-of-speakers/list-of-speakers.component';
import { TopicDetailComponent } from './components/topic-detail/topic-detail.component';
import { WatchSortingTreeGuard } from 'app/shared/utils/watch-sorting-tree.guard';

const routes: Routes = [
    { path: '', component: AgendaListComponent, pathMatch: 'full' },
    { path: 'import', component: AgendaImportListComponent, data: { basePerm: 'agenda.can_manage' } },
    { path: 'topics/new', component: TopicDetailComponent, data: { basePerm: 'agenda.can_manage' } },
    {
        path: 'sort-agenda',
        component: AgendaSortComponent,
        canDeactivate: [WatchSortingTreeGuard],
        data: { basePerm: 'agenda.can_manage' }
    },
    { path: 'speakers', component: ListOfSpeakersComponent, data: { basePerm: 'agenda.can_see' } },
    { path: 'topics/:id', component: TopicDetailComponent, data: { basePerm: 'agenda.can_see' } },
    { path: ':id/speakers', component: ListOfSpeakersComponent, data: { basePerm: 'agenda.can_see' } }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgendaRoutingModule {}
