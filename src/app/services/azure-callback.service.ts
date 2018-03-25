import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { AdalService } from 'ng2-adal/dist/core';

// Guard that handles the callback when AAD reroutes back to the application
// The Guard gets the new authentication data from the session, and rebuilds the ADAL service
// Note: To see when used, refer to app.routes
@Injectable()
export class AzureCallback implements CanActivate {
  constructor(private authService: AuthService, private adalService: AdalService, private router: Router) { }

  canActivate() {
    const data = JSON.parse(sessionStorage.getItem('aadConfig'));
    this.authService.adalConfig.clientId = data.resource;
    this.authService.adalConfig.tenant = data.tenant;
    this.authService.adalConfig.resource = data.clientId;
    this.authService.connection = data.connection;
    this.authService.authType = 'adal';
    this.adalService.init(this.authService.adalConfig);
    this.adalService.handleWindowCallback();
    this.adalService.acquireToken(data.clientid);

    if (this.authService.isAuthenticated()) {
      return true;

    } else {
      this.router.navigate(['']);
      return false;

    }
  }
}
