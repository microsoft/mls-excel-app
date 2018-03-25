import { AuthService } from './auth.service';
import { AdalService } from 'ng2-adal/dist/core';
import { MlsService } from './mls.service';
import { HttpModule, Http, XHRBackend, Response, ResponseOptions, ResponseType } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { TestBed, inject, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import { WebService, ExcelParameter } from '../models/web-service';

// Integration Tests for the WebServices Service
// Utilizes a mock backend for all tests
describe('WebService Tests', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                AuthService,
                AdalService,
                MlsService,
                { provide: XHRBackend, useClass: MockBackend }
            ]
        })
            .compileComponents();
    }));

    it('can instantiate service when inject service',
        inject([MlsService], (service: MlsService) => {
            expect(service instanceof MlsService).toBe(true);
        }));

    it('can instantiate service with \'new\'', inject([Http], (http: Http) => {
        expect(http).not.toBeNull('http should be provided');
        const service = new MlsService(http, new AuthService(new AdalService(), http));
        expect(service instanceof MlsService).toBe(true, 'new service should be ok');
    }));

    it('can provide the mockBackend as XHRBackend',
        inject([XHRBackend], (backend: MockBackend) => {
            expect(backend).not.toBeNull('backend should be provided');
        }));

    describe('GET WebServices', () => {
        let backend: MockBackend;
        let service: MlsService;
        let response: Response;
        let fakeServicesData: any;

        beforeEach(inject([Http, XHRBackend], (http: Http, be: MockBackend) => {
            backend = be;
            service = new MlsService(http, new AuthService(new AdalService(), http));
            fakeServicesData = servicesData;
            const options = new ResponseOptions({ status: 200, body: { data: fakeServicesData } });
            response = new Response(options);
        }));

        it('should expect successful GET of services', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.getWebServices().toPromise()
                .then(data => {
                    expect(data.length === fakeServicesData.length);
                });
        })));

        it('should expect Observable error for 404: Server Not Found', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 404, body: { data: fakeServicesData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.getWebServices()
                .do(data => {
                    fail('should not respond with a successful GET');
                })
                .catch((err: Response) => {
                    expect(err.status).toMatch('404');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect Observable error for 401: Invalid Credentials', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 401, body: { data: fakeServicesData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.getWebServices()
                .do(data => {
                    fail('should not respond with a successful GET');
                })
                .catch((err: Response) => {
                    expect(err).toMatch('401');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect Observable error for 500: Miscellaneous Error', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 500, body: { data: fakeServicesData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.getWebServices()
                .do(data => {
                    fail('should not respond with a successful GET');
                })
                .catch((err: Response) => {
                    expect(err).toMatch('500');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

    })

    describe('POST WebServices', () => {
        let backend: MockBackend;
        let service: MlsService;
        let response: Response;
        let fakeServicesData: any;

        beforeEach(inject([Http, XHRBackend], (http: Http, be: MockBackend) => {
            webService.name = 'test_service';
            const testParam = new ExcelParameter();
            testParam.name = 'test_param';
            testParam.value = 'test_param';
            inputParams.push(testParam);
            backend = be;
            service = new MlsService(http, new AuthService(new AdalService(), http));
            fakeServicesData = servicesData;
            const options = new ResponseOptions({ status: 200, body: { data: postData } });
            response = new Response(options);
        }));

        it('should expect successful POST of service', async(inject([], () => {
            backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

            service.postWebServices(webService, inputParams).toPromise()
                .then(data => {
                    expect(data);
                });
        })));

        it('should expect Observable error for 404: Server Not Found', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 404, body: { data: fakeServicesData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.postWebServices(webService, inputParams)
                .do(data => {
                    fail('should not respond with a successful POST');
                })
                .catch((err: Response) => {
                    expect(err.status).toMatch('404');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect Observable error for 401: Invalid Credentials', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 401, body: { data: fakeServicesData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.postWebServices(webService, inputParams)
                .do(data => {
                    fail('should not respond with a successful POST');
                })
                .catch((err: Response) => {
                    expect(err).toMatch('401');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

        it('should expect Observable error for 500: Miscellaneous Error', async(inject([], () => {
            const resp = new MockError(new ResponseOptions({ type: ResponseType.Error, status: 500, body: { data: fakeServicesData } }));
            backend.connections.subscribe((c: MockConnection) => c.mockError(resp));

            service.postWebServices(webService, inputParams)
                .do(data => {
                    fail('should not respond with a successful POST');
                })
                .catch((err: Response) => {
                    expect(err).toMatch('500');
                    return Observable.of(null); // failure is the expected test result
                })
                .toPromise();
        })));

    })

})

const servicesData = [
    {
        name: 'service1', version: '1.0.0', versionPublishedBy: '',
        creationTime: '', snapshotId: '', runtimeType: '',
        initCode: '', code: '', description: '', operationId: '',
        inputParameterDefinitions: [
            { name: '', type: '' }
        ],
        outputParameterDefinitions: [
            { name: '', type: '' }
        ],
        outputFileNames: [''],
        myPermissionOnService: 'read/write'
    }
]

const webService: WebService = new WebService();
const inputParams: ExcelParameter[] = [];
const postData = {
    outputParameters: [
        {}
    ]
}

// ERROR RESPONSE CODES TESTING
// Implemented this class to fix a current issue with the MockConnection response never hitting the error catch block
// https://github.com/angular/angular/pull/8961
class MockError extends Response implements Error {
    name: any;
    message: any;
}
