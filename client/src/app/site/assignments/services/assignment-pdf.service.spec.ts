import { TestBed } from '@angular/core/testing';

import { AssignmentPdfService } from './assignment-pdf.service';
import { E2EImportsModule } from 'e2e-imports.module';

describe('AssignmentPdfService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        })
    );

    it('should be created', () => {
        const service: AssignmentPdfService = TestBed.get(AssignmentPdfService);
        expect(service).toBeTruthy();
    });
});
