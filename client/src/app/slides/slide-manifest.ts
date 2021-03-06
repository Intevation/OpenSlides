import { InjectionToken } from '@angular/core';
import { IdentifiableProjectorElement, ProjectorElement } from 'app/shared/models/core/projector';
import { TranslateService } from '@ngx-translate/core';
import { ViewModelStoreService } from 'app/core/core-services/view-model-store.service';

type BooleanOrFunction = boolean | ((element: ProjectorElement) => boolean);

export interface Slide {
    slide: string;
}

/**
 * Slides can have these options.
 */
export interface SlideDynamicConfiguration {
    /**
     * Should this slide be scrollable?
     */
    scrollable: BooleanOrFunction;

    /**
     * Should this slide be scaleable?
     */
    scaleable: BooleanOrFunction;

    getSlideTitle?: (
        element: ProjectorElement,
        translate: TranslateService,
        viewModelStore: ViewModelStoreService
    ) => string;
}

/**
 * Is similar to router entries, so we can trick the router. Keep slideName and
 * path in sync.
 */
export interface SlideManifest extends Slide {
    path: string;
    loadChildren: string;
    verboseName: string;
    elementIdentifiers: (keyof IdentifiableProjectorElement)[];
    canBeMappedToModel: boolean;
}

export const SLIDE_MANIFESTS = new InjectionToken<SlideManifest[]>('SLIDE_MANIFEST');
