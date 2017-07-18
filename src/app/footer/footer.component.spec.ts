import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

// Components
import { FooterComponent } from './footer.component';

// Services
import { AuthService } from '../services/auth.service';
import { MlsService } from '../services/mls.service';

describe('FooterComponent', function () {
  let comp: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let authService: AuthService;
  let mlsService: MlsService;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: MlsService, useClass: MlsServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    comp = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    mlsService = TestBed.get(MlsService);
    fixture.detectChanges();
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('should contain ML Server branding', () => {
    const de = fixture.debugElement.query(By.css('h1'));
    const el: HTMLElement = de.nativeElement;

    expect(el.innerText).toContain('ML Server');
  })

});

class AuthServiceStub {
  accessToken: string = null;

  isAuthenticated() {
    return this.accessToken != null;
  }

};

class MlsServiceStub {
  // Implementation not needed
}
