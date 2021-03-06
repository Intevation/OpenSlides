import { Injectable } from '@angular/core';

import { DataSendService } from '../../core-services/data-send.service';
import { DataStoreService } from '../../core-services/data-store.service';
import { BaseRepository } from '../base-repository';
import { ViewStatuteParagraph } from 'app/site/motions/models/view-statute-paragraph';
import { StatuteParagraph } from 'app/shared/models/motions/statute-paragraph';
import { CollectionStringMapperService } from '../../core-services/collection-string-mapper.service';
import { ViewModelStoreService } from 'app/core/core-services/view-model-store.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Repository Services for statute paragraphs
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link DataSendService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class StatuteParagraphRepositoryService extends BaseRepository<ViewStatuteParagraph, StatuteParagraph> {
    /**
     * Creates a StatuteParagraphRepository
     * Converts existing and incoming statute paragraphs to ViewStatuteParagraphs
     * Handles CRUD using an observer to the DataStore
     *
     * @param DS The DataStore
     * @param mapperService Maps collection strings to classes
     * @param dataSend sending changed objects
     */
    public constructor(
        DS: DataStoreService,
        dataSend: DataSendService,
        mapperService: CollectionStringMapperService,
        viewModelStoreService: ViewModelStoreService,
        translate: TranslateService
    ) {
        super(DS, dataSend, mapperService, viewModelStoreService, translate, StatuteParagraph);
    }

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Statute paragraphs' : 'Statute paragraph');
    };

    protected createViewModel(statuteParagraph: StatuteParagraph): ViewStatuteParagraph {
        const viewStatuteParagraph = new ViewStatuteParagraph(statuteParagraph);
        viewStatuteParagraph.getVerboseName = this.getVerboseName;
        return viewStatuteParagraph;
    }
}
