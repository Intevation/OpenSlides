import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaSortComponent } from './agenda-sort.component';
import { E2EImportsModule } from 'e2e-imports.module';

describe('AgendaSortComponent', () => {
    let component: AgendaSortComponent;
    let fixture: ComponentFixture<AgendaSortComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [AgendaSortComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaSortComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
