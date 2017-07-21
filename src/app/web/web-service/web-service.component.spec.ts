import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

// Components
import { WebServiceComponent } from './web-service.component';

// Services
import { AuthService } from '../../services/auth.service';
import { MlsService } from '../../services/mls.service';
import { ExcelService } from '../../services/excel.service';

// Models
import { WebService, Parameter, ExcelParameter } from '../../models/web-service';

// Integration tests for the Web Service Component
// Limited testing due to ExcelService not being testable outside of MS Excel
// Recommendation: Create some test services locally and manually test the Excel functionality
describe('WebServiceComponent', function () {
    let comp: WebServiceComponent;
    let fixture: ComponentFixture<WebServiceComponent>;
    let authService: AuthService;
    let mlsService: MlsService;
    let excelService: ExcelService;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [WebServiceComponent],
            imports: [HttpModule, ReactiveFormsModule, RouterTestingModule],
            providers: [
                { provide: AuthService, useClass: AuthServiceStub },
                { provide: MlsService, useClass: MlsServiceStub },
                { provide: ExcelService, useClass: ExcelServiceStub }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WebServiceComponent);
        comp = fixture.componentInstance;
        authService = TestBed.get(AuthService);
        mlsService = TestBed.get(MlsService);
        excelService = TestBed.get(ExcelService);

        // Set up test service to populate the reactive form
        comp.service = new WebService();
        const testParam: Parameter = new Parameter();
        testParam.name = 'test_param';
        testParam.type = 'numeric';
        comp.service.inputParameterDefinitions = [testParam];
        comp.service.outputParameterDefinitions = [testParam];
        fixture.detectChanges();
    });

    it('should create component', () => expect(comp).toBeDefined());

    it('input parameter should exist', () => {
        const de = fixture.debugElement.query(By.css('.ms-ListItem-primaryText'));
        const el = de.nativeElement;
        expect(el.innerText).toContain('test_param')
    });

    it('successful submission', fakeAsync(() => {
        spyOn(comp, 'onSubmit').and.callFake(() => {
            // No need to execute because ExcelService cannot be tested outside of MS Excel
            // Using a fake call to 'simulate'
        });

        const button = fixture.debugElement.query(By.css('.ms-Button--primary'));
        button.nativeElement.click();
        fixture.detectChanges();
        tick();

        expect(comp.onSubmit).toHaveBeenCalled();
    }));

    it('should contain an error message due to parameter mismatch', () => {
        // Can't execute a real submission because ExcelService cannot be tested outside of MS Excel
        // Simulating by triggering the error and ensuring it shows up on the page
        comp.error = true;
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.css('.ms-MessageBar-text'));
        const el = de.nativeElement;
        expect(el.innerText).toContain('There was a parameter mismatch error.')
    });

});

// Fake Service stubs to provide for the component
class AuthServiceStub {
    // Implementation not needed
}

class MlsServiceStub {
    // Implementation not needed
}

// Initialization of web-service.component requires subscriptions to parameter changes from the Excel Service
class ExcelServiceStub {
    private inputParameterChange = new Subject<any>();
    private outputParameterChange = new Subject<any>();

    inputParameterChanged$ = this.inputParameterChange.asObservable();
    outputParameterChanged$ = this.outputParameterChange.asObservable();
}
