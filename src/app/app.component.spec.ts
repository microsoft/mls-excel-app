import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MlsService } from './services/mls.service';

// Integration Tests for app component
// Ensures that the router module and the header and footer components all exist when application is loaded
describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [AppComponent, HeaderComponent, FooterComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: MlsService, useClass: MlsServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA] // can use this to ignore things not needed to include
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => expect(component).toBeDefined());

  it('should have a router outlet', () => {
    const de = fixture.debugElement.query(By.directive(RouterOutlet));

    expect(de).not.toBeNull();
  });

  it('should have a header', () => {
    const de = fixture.debugElement.query(By.directive(HeaderComponent));

    expect(de).not.toBeNull();
  })

  it('should have a footer', () => {
    const de = fixture.debugElement.query(By.directive(FooterComponent));

    expect(de).not.toBeNull();
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
