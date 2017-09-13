import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

// Component for local/LDAP/LDAP-S authentication
@Component({
  selector: 'app-auth-admin',
  templateUrl: './auth-admin.component.html',
  styleUrls: ['./auth-admin.component.css']
})
export class AuthAdminComponent implements OnInit {

  public authenticated = false;
  public config: {
    connection: string,
    username: string,
    password: string
  };
  public error: boolean;
  public errorMessage: string;

  constructor(private authService: AuthService, private router: Router) {
    this.error = false;
  }

  ngOnInit() {
    this.config = {
      connection: '',
      username: '',
      password: ''
    };
  }

  // Called when the user submits for authentication
  // Sends a HTTP GET to the specified connection
  // If authentication is successful, reroutes user to web-services
  // Otherwise, user is shown an appropriate error message
  onSubmit(form: NgForm) {
    this.authService.loginAdmin(form.value.connection, form.value.username, form.value.password)
      .subscribe(
      (data: any) => {
        // Correctly authenticated, redirect page
        this.error = false;
        this.authenticated = true;
        this.router.navigate(['/web-services']);

      },
      (error) => {
        // Show user error message
        this.errorMessage = error;
        this.error = true;
      }
      );
  }

}
