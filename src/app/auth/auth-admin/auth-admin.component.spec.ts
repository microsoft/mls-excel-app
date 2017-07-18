import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

// Components
import { AuthAdminComponent } from './auth-admin.component';

// Services
import { AuthService } from '../../services/auth.service';
import { MlsService } from '../../services/mls.service';

// Integration tests for local authentication
describe('AuthAdminComponent', function () {
  let comp: AuthAdminComponent;
  let fixture: ComponentFixture<AuthAdminComponent>;
  let authService: AuthService;
  let mlsService: MlsService;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [AuthAdminComponent],
      imports: [HttpModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: MlsService, useClass: MlsServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthAdminComponent);
    comp = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    mlsService = TestBed.get(MlsService);
    fixture.detectChanges();
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('should successfully submit form', () => {
    spyOn(comp, 'onSubmit').and.callThrough();
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('#connection').nodeValue = 'test_connection';
    el.querySelector('#username').nodeValue = 'test_username';
    el.querySelector('#password').nodeValue = 'test_password';
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(comp.onSubmit).toHaveBeenCalled();
  });

  it('should receive error from form submission', fakeAsync(() => {
    spyOn(comp, 'onSubmit').and.callFake(() => {
      comp.error = true;
      comp.errorMessage = 'Failed';
    })
    let el: HTMLElement = fixture.nativeElement;
    el.querySelector('#connection').nodeValue = 'test_connection';
    el.querySelector('#username').nodeValue = 'test_username';
    el.querySelector('#password').nodeValue = 'test_password';
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    tick();
    const de = fixture.debugElement.query(By.css('#error'));
    el = de.nativeElement;
    console.log(el.innerText);
    expect(el.innerText).toContain('Failed');
  }));

});

class AuthServiceStub {
  accessToken: string = null;
  private subject = new Subject();

  isAuthenticated() {
    return this.accessToken != null;
  }

  loginAdmin(connection: string, username: string, password: string) {
    return this.subject.asObservable();
  }

};

class MlsServiceStub {
  // Not needed
}
