import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

// Components
import { WebServicesComponent } from './web-services.component';

// Services
import { AuthService } from '../../services/auth.service';
import { MlsService } from '../../services/mls.service';

// Models
import { WebService, Parameter, ExcelParameter } from '../../models/web-service';

// Integration tests for the Web Services Component
describe('WebServicesComponent', function () {
  let comp: WebServicesComponent;
  let fixture: ComponentFixture<WebServicesComponent>;
  let authService: AuthService;
  let mlsService: MlsService;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [WebServicesComponent],
      imports: [HttpModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: MlsService, useClass: MlsServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Can use this to ignore unnecessary components for the tests
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebServicesComponent);
    comp = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    mlsService = TestBed.get(MlsService);

    // Create a test service upon initialization to provide in the list
    spyOn(comp, 'ngOnInit').and.callFake(() => {
      const testService: WebService = new WebService();
      testService.name = 'test_service';
      testService.description = 'test';
      testService.version = '1.0.0';
      comp.services = new Array<WebService>();
      comp.services.push(testService);
      comp.isLoading = false;
      comp.error = false;
      comp.selectedService = undefined;
    });
    fixture.detectChanges();
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('should populate with the test service', () => {
    expect(comp.services.length > 0);
  });

  it('should contain the name of the test service', () => {
    const de = fixture.debugElement.query(By.css('.ms-ListItem-primaryText'));
    const el = de.nativeElement;
    expect(el.innerText).toContain('test_service');
  });

  it('should contain an error message due to failure to get services', () => {
    comp.error = true;
    fixture.detectChanges();
    const de = fixture.debugElement.query(By.css('.ms-MessageBar-text'));
    const el = de.nativeElement;
    expect(el.innerText).toContain('There was an error in retrieving your services.')
  });

  it('should call getServices when button is pressed after failure', fakeAsync(() => {
    comp.error = true;
    fixture.detectChanges();
    spyOn(comp, 'getServices').and.callFake(() => {
      comp.error = false;
    });

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    tick();

    expect(comp.getServices).toHaveBeenCalled();
  }))

});

class AuthServiceStub {
  // Implementation not needed
};

class MlsServiceStub {
  private subject = new Subject();

  getWebServices() {
    return this.subject.asObservable();
  }
}
