import { TestBed } from '@angular/core/testing';

import { MotionXlsxExportService } from './motion-xlsx-export.service';
import { E2EImportsModule } from 'e2e-imports.module';

describe('MotionXlsxExportService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        })
    );

    it('should be created', () => {
        const service: MotionXlsxExportService = TestBed.get(MotionXlsxExportService);
        expect(service).toBeTruthy();
    });
});
