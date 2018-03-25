// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { rootRouterConfig } from './app.routes';

// Components
import { AppComponent } from './app.component';
import { AuthAdminComponent } from './auth/auth-admin/auth-admin.component';
import { AuthAzureComponent } from './auth/auth-azure/auth-azure.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { WebServiceComponent } from './web/web-service/web-service.component';
import { WebServicesComponent } from './web/web-services/web-services.component';
import { LoaderComponent } from './loader/loader.component';

// Services
import { AdalService } from 'ng2-adal/dist/core';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { AzureCallback } from './services/azure-callback.service';
import { MlsService } from './services/mls.service';
import { ExcelService } from './services/excel.service';


@NgModule({
  declarations: [
    AppComponent,
    AuthAdminComponent,
    AuthAzureComponent,
    HeaderComponent,
    FooterComponent,
    WebServiceComponent,
    WebServicesComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: true })
  ],
  providers: [
    AdalService,
    AuthService,
    AuthGuard,
    AzureCallback,
    MlsService,
    ExcelService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
