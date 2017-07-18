import { Routes } from '@angular/router';
import { AuthAzureComponent } from './auth/auth-azure/auth-azure.component';
import { AuthAdminComponent } from './auth/auth-admin/auth-admin.component';
import { WebServicesComponent } from './web/web-services/web-services.component';
import { AuthGuard } from './services/auth-guard.service';
import { AzureCallback } from './services/azure-callback.service';

export const rootRouterConfig: Routes = [
    { path: '', component: AuthAzureComponent },
    { path: 'id_token', component: WebServicesComponent, canActivate: [AzureCallback] },
    { path: 'auth-admin', component: AuthAdminComponent },
    { path: 'web-services', component: WebServicesComponent, canActivate: [AuthGuard] }
];
