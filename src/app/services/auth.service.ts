import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AdalService } from 'ng2-adal/dist/core';

// Service for Authentication
// Uses a combination of a wrapper package for ADAL methods
// and http requests for local/LDAP/LDAP-S authentication
@Injectable()
export class AuthService {

    // AuthType determines whether an ADAL or a Local authentication method is called
    public authType: string = null;
    public connection: string = null;
    public accessToken: string = null;
    public refreshToken: string = null;

    // Configuration for AAD
    public adalConfig = {
        tenant: '',
        clientId: '',
        resource: '',
        // Production development
        redirectUri: window.location.origin + '/mls-excel-app',
        postLogoutRedirectUri: window.location.origin + '/mls-excel-app',
        // Local development
        // redirectUri: window.location.origin + '/',
        // postLogoutRedirectUri: window.location.origin + '/',
    };

    constructor(private adalService: AdalService, private http: Http) { }

    // ADAL Methods
    loginAdal(connection: string, clientId: string, tenant: string, resource: string) {
        this.authType = 'adal';
        console.log(JSON.stringify({ tenant: tenant, clientid: clientId, resource: resource, conn: connection }))
        sessionStorage.setItem('aadConfig',
            JSON.stringify({ tenant: tenant, clientid: clientId, resource: resource, connection: connection }));
        this.initAdal(resource, clientId, tenant);
        this.connection = connection;
        this.adalService.login();
    }

    initAdal(resource: string, clientId: string, tenant: string) {
        // ClientID and Resource need to be swapped since this is not a native app
        this.adalConfig.resource = clientId;
        this.adalConfig.clientId = resource;
        this.adalConfig.tenant = tenant;
        this.adalService.init(this.adalConfig);
    }

    // ADMIN/LDAP/LDAP-S Methods
    loginAdmin(connection: string, username: string, password: string) {
        this.connection = connection;
        connection = connection + '/login';
        this.authType = 'admin';
        const body = {
            'username': username,
            'password': password
        };
        const headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http.post(connection, body, { headers: headers })
            .map(
            (response: Response) => {
                const data = response.json();
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;
                sessionStorage.setItem('tokens',
                    JSON.stringify({ accessToken: this.accessToken, refreshToken: this.refreshToken, type: 'admin' }));
                return data;
            }
            )
            .catch(
            (error: Response) => {
                    if (error.status === 404) {
                        return Observable.throw('Server Not Found: invalid connection string. Please try again.');
                    } else if (error.status === 400 || error.status === 401) {
                        return Observable.throw('Unauthorized: invalid credentials. Please try again.')
                    } else {
                        return Observable.throw('Error: please check that your MLS has CORS enabled and is currently running');
                    }
                }
            );
    }

    getToken() {
        if (this.authType === 'adal') {
            return this.adalService.getCachedToken(this.adalConfig.clientId);
        } else {
            return this.accessToken;
        }
    }

    isAuthenticated() {
        if (this.authType === 'adal') {
            return this.adalService.userInfo.isAuthenticated;
        } else {
            return this.accessToken != null;
        }
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.connection = null;
        this.adalConfig = {
            tenant: '',
            clientId: '',
            resource: '',
            redirectUri: window.location.origin + '/',
            postLogoutRedirectUri: window.location.origin + '/',
        };

        if (this.authType === 'adal') {
            this.authType = null;
            this.adalService.logOut();
        } else {
            this.authType = null;
            sessionStorage.clear();
        }
    }
}
