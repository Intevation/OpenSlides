import { TestBed } from '@angular/core/testing';

import { AssignmentPdfExportService } from './assignment-pdf-export.service';
import { E2EImportsModule } from 'e2e-imports.module';

describe('AssignmentPdfExportService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        })
    );

    it('should be created', () => {
        const service: AssignmentPdfExportService = TestBed.get(AssignmentPdfExportService);
        expect(service).toBeTruthy();
    });
});
