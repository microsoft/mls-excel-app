import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

// Services
import { AuthService } from './auth.service';

// Models
import { WebService, ExcelParameter } from '../models/web-service';

// Service which makes API calls to GET services and POST to an individual service
@Injectable()
export class MlsService {

    // Boolean field for WebService and WebServices component templates to know whether a service has been selected or not
    public serviceSelected = false;

    constructor(private http: Http, private authService: AuthService) { }

    // GET all services available to the user
    getWebServices(): Observable<WebService[]> {
        const connection = this.authService.connection + '/services';
        // Add authorization header with jwt token
        const token = this.authService.getToken();
        const headers = new Headers({ 'Authorization': 'Bearer ' + token });
        const options = new RequestOptions({ headers: headers });

        // Get services from web service api endpoint
        return this.http.get(connection, options)
            .map((response: Response) => {
                const data = response.json();
                return data;
            })
            .catch((error: Response) => {
                /*WebServices Component is currently handling error messaging so
                that the necessary rerouting can take place if needed to reauthenticate*/
                return Observable.throw(error);
            });
    }

    // POST to the selected service to retrieve an output
    postWebServices(webService: WebService, inputParameters: ExcelParameter[]): Observable<any[]> {
        const connection = this.authService.connection + '/api/' + webService.name + '/' + webService.version
        // Add authorization header with jwt token
        const token = this.authService.getToken();
        const headers = new Headers({ 'Authorization': 'Bearer ' + token });
        const options = new RequestOptions({ headers: headers });
        const body = {};

        // Ensure a value exists
        if (inputParameters[0].value != null) {
            inputParameters.forEach((element: ExcelParameter) => {
                // The Excel value format is [][], so it needs to be processed differently depending on the input data type
                if (element.type === 'data.frame') {
                    // Processing data frame with generic labels c0, c1, c2, etc.
                    let i = 0;
                    const temp = {};
                    while (i < element.value.length) {
                        const randomLabel = 'c' + i;
                        temp[randomLabel] = element.value[i];
                        i++;
                    }
                    body[element.name] = temp;
                } else if (element.type === 'vector') {
                    body[element.name] = element.value[0];
                } else if (element.type === 'matrix') {
                    body[element.name] = element.value;
                } else {
                    body[element.name] = element.value[0][0];
                }
            });

            // Get output from web service api endpoint
            return this.http.post(connection, body, { headers: headers })
                .map(
                (response: Response) => {
                    const data = response.json();
                    return data['outputParameters'];
                })
                .catch(
                (error: Response) => {
                    /*WebService Component is currently handling error messaging
                    so that the necessary rerouting can take place if needed to reauthenticate*/
                    return Observable.throw(error);
                });
        } else {
            return Observable.throw('Invalid parameters');
        }
    }
}
