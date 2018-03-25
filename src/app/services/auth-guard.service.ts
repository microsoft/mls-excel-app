import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { AdalService } from 'ng2-adal/dist/core';

// Guard that determines whether the web service components are accessible based on whether the user is authenticated or not
// If not, it reroutes them to authentication
// Note: Refer to app.routes to see when it is used
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate() {

    if (this.authService.isAuthenticated()) {
      return true;

    } else {
      this.router.navigate(['']);
      return false;

    }
  }
}
