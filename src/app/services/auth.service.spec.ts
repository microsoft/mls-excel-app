import { AuthService } from './auth.service';
import { AdalService } from 'ng2-adal/dist/core';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions, ResponseType } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { TestBed, inject, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

// Integration Tests for AuthService
describe('AuthService Tests', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                AuthService,
                AdalService,
                { provide: XHRBackend, useClass: MockBackend }
            ]
        })
            .compileComponents();
    }));

    it('can instantiate service when inject service',
        inject([AuthService], (service: AuthService) => {
            expect(service instanceof AuthService).toBe(true);
        }));

    it('can instantiate service with \'new\'', inject([Http], (http: Http) => {
        expect(http).not.toBeNull('http should be provided');
        const service = new AuthService(new AdalService(), http);
        expect(service instanceof AuthService).toBe(true, 'new service should be ok');
    }));

    it('can provide the mockBackend as XHRBackend',
        inject([XHRBackend], (backend: MockBackend) => {
            expect(backend).not.toBeNull('backend should be provided');
        }));

    describe('Local/LDAP/LDAP-S Login', () => {
        let backend: MockBackend;
        let service: AuthService;
        let fakeAuthData: any;
        let response: Response;
        let fakeCon: string;
        let fakeUser: string;
        let fakePass: string;

        beforeEach(inject([Http, XHRBackend], (http: Http, be: MockBackend) => {
            backend = be;
            service = new AuthService(new AdalService(), http);
            fakeAuthData = authData;
            fakeCon = 'fake_connection';
            fakeUser = 'fake_user';
            fakePass = 'fake_password';
            const options = new ResponseOptions({ status: 200, body: { data: fakeAuthData } });
            response = new Response(options);
        }));

        it('should expect successful auth (then)', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.loginAdmin(fakeCon, fakeUser, fakePass).toPromise()
                .then(data => {
                    expect(data.length).toBe(fakeAuthData.length,
                        'should have received all expected authentication data from a successful login');
                });
        })))

        it('should expect successful auth (Observable.do)', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.loginAdmin(fakeCon, fakeUser, fakePass)
                .do(data => {
                    expect(data.length).toBe(fakeAuthData.length,
                        'should have received all expected authentication data from a successful login');
                });
        })));

        it('should expect Observable error for 404: Server Not Found', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 404, body: { data: fakeAuthData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.loginAdmin('', '', '')
                .do(data => {
                    fail('should not respond with a successful login');
                })
                .catch(err => {
                    expect(err).toMatch('Server Not Found: invalid connection string. Please try again.');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect Observable error for 401: Invalid Credentials', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 401, body: { data: fakeAuthData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.loginAdmin('', '', '')
                .do(data => {
                    fail('should not respond with a successful login');
                })
                .catch(err => {
                    expect(err).toMatch('Unauthorized: invalid credentials. Please try again.');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect Observable error for 500: Miscellaneous Error', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 500, body: { data: fakeAuthData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.loginAdmin('', '', '')
                .do(data => {
                    fail('should not respond with a successful login');
                })
                .catch(err => {
                    expect(err).toMatch('Error: please check that your MLS has CORS enabled and is currently running');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect correct admin token after admin login', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.loginAdmin(fakeCon, fakeUser, fakePass).toPromise()
                .then(data => {
                    expect(data.length).toBe(fakeAuthData.length,
                        'should have received all expected authentication data from a successful login');
                });

            const token = service.getToken()
            expect(token === authData.access_token);
        })));

        it('should expect authenticated to be true', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.loginAdmin(fakeCon, fakeUser, fakePass).toPromise()
                .then(data => {
                    expect(data.length).toBe(fakeAuthData.length,
                        'should have received all expected authentication data from a successful login');
                });

            const authenticated = service.isAuthenticated();
            expect(authenticated === true);
        })));

        it('should expect authenticated to be false and token to be null after logout', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.loginAdmin(fakeCon, fakeUser, fakePass).toPromise()
                .then(data => {
                    expect(data.length).toBe(fakeAuthData.length,
                        'should have received all expected authentication data from a successful login');
                })

            service.logout();

            const authenticated = service.isAuthenticated();
            expect(authenticated === false);

            const token = service.getToken()
            expect(token == null);
        })))
    })
})

const authData = {
    token_type: 'Bearer',
    access_token: 'fake_access',
    expires_in: 'fake_time',
    expires_on: 'fake_expire',
    refresh_token: 'fake_refresh'
}

// ERROR RESPONSE CODES TESTING
// Implemented this class to fix a current issue with the MockConnection response never hitting the error catch block
// It just extends the Response class so that I can combine it with Error
// https://github.com/angular/angular/pull/8961
class MockError extends Response implements Error {
    name: any;
    message: any;
}
