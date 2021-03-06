import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollComponent } from './assignment-poll.component';
import { E2EImportsModule } from 'e2e-imports.module';

describe('AssignmentPollComponent', () => {
    let component: AssignmentPollComponent;
    let fixture: ComponentFixture<AssignmentPollComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AssignmentPollComponent],
            imports: [E2EImportsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
