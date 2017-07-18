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
  public rememberMe: boolean;

  constructor(private authService: AuthService, private router: Router) {
    this.error = false;
  }

  ngOnInit() {
    // Checks to see if the user credentials have been stored locally via 'remember me'
    // Populates them in the form if they exist
    if (localStorage.getItem('adminUser')) {
      const data = JSON.parse(localStorage.getItem('adminUser'));
      this.config = {
        connection: data.connection,
        username: data.username,
        password: data.password
      };
      this.rememberMe = true;
    } else {
      this.config = {
        connection: '',
        username: '',
        password: ''
      };
      this.rememberMe = false;
    }
  }

  // Called when the user submits for authentication
  // Stores credentials locally if user checked the 'Remember Me'
  // Sends a HTTP GET to the specified connection
  // If authentication is successful, reroutes user to web-services
  // Otherwise, user is shown an appropriate error message
  onSubmit(form: NgForm) {
    // Store credentials if user wants to be remembered
    if (form.value.remember) {
      localStorage.setItem('adminUser',
        JSON.stringify({ connection: form.value.connection, username: form.value.username, password: form.value.password }));
    } else {
      localStorage.removeItem('adminUser');
    }
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
