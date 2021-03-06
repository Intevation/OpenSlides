import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSpinnerComponent } from './global-spinner.component';
import { E2EImportsModule } from 'e2e-imports.module';

describe('GlobalSpinnerComponent', () => {
    let component: GlobalSpinnerComponent;
    let fixture: ComponentFixture<GlobalSpinnerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GlobalSpinnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
