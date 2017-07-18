import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { MlsService } from '../services/mls.service';

// Navigation command bar for the application with logout and back button logic
// Note: refer to app.component to see where it is used
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  constructor(public authService: AuthService, public mlsService: MlsService, private router: Router) { }

  logout() {
    this.mlsService.serviceSelected = false;
    if (this.authService.authType === 'adal') {
      this.authService.logout();
    } else {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  back() {
    this.mlsService.serviceSelected = false;
  }

}
