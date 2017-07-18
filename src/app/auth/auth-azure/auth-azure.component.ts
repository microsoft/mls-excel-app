import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';

// Component for AAD authentication
@Component({
    selector: 'app-auth-azure',
    templateUrl: './auth-azure.component.html',
    styleUrls: ['./auth-azure.component.css']
})
export class AuthAzureComponent implements OnInit {

    public config: {
        connection: string,
        tenant: string,
        clientid: string,
        resource: string
    };
    public error: boolean;
    public errorMessage: string;
    public rememberMe: boolean;

    constructor(public router: Router, public authService: AuthService) {
        this.error = false;
    }

    public ngOnInit() {
        // Checks to see if the user credentials have been stored locally via 'remember me'
        // Populates them in the form if they exist
        if (localStorage.getItem('aadUser')) {
            const data = JSON.parse(localStorage.getItem('aadUser'));
            this.config = {
                connection: data.connection,
                tenant: data.tenant,
                clientid: data.clientid,
                resource: data.resource
            };
            this.rememberMe = true;
        } else {
            this.config = {
                connection: '',
                tenant: '',
                clientid: '',
                resource: ''
            };
            this.rememberMe = false;
        }
    }

    // Called when user submits form
    // Uses the ADAL npm wrapper package to log the user in
    // This redirects the user to their AAD sign-in page if they gave a correct tenant
    // If an incorrect tenant was given, AAD will tell them it doesn't exist and they will have to reload the add-in in order to try again
    // Note: All error handling here cannot be handled by our app currently because of the redirect.  Until AAD redirects back to our app
    // all errors are handled by the AAD page.
    login(form: NgForm) {
        // Store credentials if user wants to be remembered
        if (form.value.remember) {
            localStorage.setItem('aadUser',
                JSON.stringify({
                    connection: form.value.connection, tenant: form.value.tenant,
                    clientid: form.value.clientid, resource: form.value.resource
                }));
        } else {
            localStorage.removeItem('aadUser');
        }
        this.authService.loginAdal(form.value.connection, form.value.clientid, form.value.tenant, form.value.resource);
    }


    get isLoggedIn() {
        return this.authService.isAuthenticated();
    }
}
