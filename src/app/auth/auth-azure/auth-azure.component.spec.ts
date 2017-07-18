import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { AuthAzureComponent } from './auth-azure.component';

// Services
import { AuthService } from '../../services/auth.service';
import { MlsService } from '../../services/mls.service';

// Integration tests for AAD component
describe('AuthAzureComponent', function () {
  let comp: AuthAzureComponent;
  let fixture: ComponentFixture<AuthAzureComponent>;
  let authService: AuthService;
  let mlsService: MlsService;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [AuthAzureComponent],
      imports: [HttpModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: MlsService, useClass: MlsServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthAzureComponent);
    comp = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    mlsService = TestBed.get(MlsService);
    fixture.detectChanges();
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('should successfully submit form', () => {
    spyOn(comp, 'login').and.callThrough();
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('#connection').nodeValue = 'test_connection';
    el.querySelector('#tenant').nodeValue = 'test_tenant';
    el.querySelector('#clientid').nodeValue = 'test_clientid';
    el.querySelector('#resource').nodeValue = 'test_resource';
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(comp.login).toHaveBeenCalled();
  });

  it('should receive error from form submission', fakeAsync(() => {
    spyOn(comp, 'login').and.callFake(() => {
      comp.error = true;
      comp.errorMessage = 'Failed';
    })
    let el: HTMLElement = fixture.nativeElement;
    el.querySelector('#connection').nodeValue = 'test_connection';
    el.querySelector('#tenant').nodeValue = 'test_tenant';
    el.querySelector('#clientid').nodeValue = 'test_clientid';
    el.querySelector('#resource').nodeValue = 'test_resource';
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    tick();
    const de = fixture.debugElement.query(By.css('#error'));
    el = de.nativeElement;
    expect(el.innerText).toContain('Failed');
  }));

});

class AuthServiceStub {
  accessToken: string = null;

  isAuthenticated() {
    return this.accessToken != null;
  }

  loginAdal(connection: string, clientId: string, tenant: string, resource: string) {
    // Implementation not needed
  }

};

class MlsServiceStub {
  // Implementation not needed
}
