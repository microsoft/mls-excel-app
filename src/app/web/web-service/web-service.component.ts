import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

import { WebService, Parameter, ExcelParameter } from '../../models/web-service';
import { ExcelService } from '../../services/excel.service';
import { AuthService } from '../../services/auth.service';
import { MlsService } from '../../services/mls.service';

// Component for individually selected web services
// Allows user to select cells within Excel for data binding to input and output parameters
@Component({
  selector: 'app-web-service',
  templateUrl: './web-service.component.html',
  styleUrls: ['./web-service.component.css']
})
export class WebServiceComponent implements OnInit, OnDestroy {
  // Service is injected by web-services when selected
  // Documentation: https://angular.io/guide/component-interaction
  @Input() service: WebService;

  // Local copies of parameters with added necessary Excel data
  public inputParameters: ExcelParameter[];
  public outputParameters: ExcelParameter[];

  // Reactive form for the service
  // Documentation: https://angular.io/guide/reactive-forms
  public serviceForm: FormGroup;

  // Subscriptions to trigger auto-update when data changes in the selected Excel cell bindings
  // Documentation: https://angular.io/guide/component-interaction#!#bidirectional-service
  public inputSubscription: Subscription;
  public outputSubscription: Subscription;

  // Boolean to control UI when loading
  public isLoading: boolean;
  // Boolean to disable submit button until a submission has completed
  public submitted: boolean;
  // Boolean to trigger an error message on the page if submission failed
  public error: boolean;
  public errorMessage: string;
  // Boolean to determine whether user has made an initial successful submission
  // so that the binding can be continually updated when data changes
  public updateOutput: boolean;

  // Included for debugging within Excel - to utilize, uncomment the feedback data bindings
  // in the component template: web-service.component.html
  public feedback: string;
  public feedback2: string;

  constructor(private fb: FormBuilder, private excelService: ExcelService,
    public mlsService: MlsService, public authService: AuthService, private router: Router) {
    this.inputParameters = [];
    this.outputParameters = [];
    this.isLoading = false;
    this.submitted = false;
    this.error = false;
    this.updateOutput = false;
    this.errorMessage = 'There was a parameter mismatch error. ' +
      'Please check that your specified parameters are correct for your selected service and try to submit again.';
    this.feedback = '';
    this.createForm();
  }

  ngOnInit() {
    this.isLoading = true;
    this.setParameters()
    this.setSubscriptions();
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.inputSubscription.unsubscribe();
  }

  public get inputParams(): FormArray {
    return this.serviceForm.get('inputParameters') as FormArray;
  };

  public get outputParams(): FormArray {
    return this.serviceForm.get('outputParameters') as FormArray;
  };

  // Initializes the reactive form
  public createForm() {
    this.serviceForm = this.fb.group({
      inputParameters: this.fb.array([]),
      outputParameters: this.fb.array([])
    });
  }

  // Sets up the ExcelParameter objects for the reactive form
  public setParameters() {

    // Create ExcelParameter objects from the definitions given in the service
    this.service.inputParameterDefinitions.forEach(element => {
      const temp: ExcelParameter = {
        name: element.name,
        type: element.type,
        binding: null,
        range: null,
        value: null,
        labels: [],
        display: null
      };
      this.inputParameters.push(temp);
    });

    this.service.outputParameterDefinitions.forEach(element => {
      const temp: ExcelParameter = {
        name: element.name,
        type: element.type,
        binding: null,
        range: null,
        value: null,
        labels: [],
        display: null
      };
      this.outputParameters.push(temp);
    });

    // Set parameters in Reactive form

    let params = this.inputParameters.map(input => this.fb.group(input));
    const inputParametersFormArray = this.fb.array(params);
    this.serviceForm.setControl('inputParameters', inputParametersFormArray);

    params = this.outputParameters.map(output => this.fb.group(output));
    const outputParametersFormArray = this.fb.array(params);
    this.serviceForm.setControl('outputParameters', outputParametersFormArray);
  }

  // Sets up subscription to change form values whenever data inside a cell binding is changed
  public setSubscriptions() {
    this.inputSubscription = this.excelService.inputParameterChanged$
      .subscribe(id => {
        this.excelService.getValue(id)
          .then(result => {
            let i = 0;
            while (i < this.inputParameters.length) {
              if (this.inputParameters[i].name === id) {
                break;
              } else {
                i = i + 1;
              }
            }
            if(this.inputParameters[i].type === 'data.frame') {
              this.inputParameters[i].labels = result.shift();
            }
            this.inputParameters[i].value = this.transpose(result);
            if (this.inputParameters[i].type === 'data.frame' ||
              this.inputParameters[i].type === 'vector' || this.inputParameters[i].type === 'matrix') {
              this.setFormText(i, this.inputParameters[i].range, true);
            } else {
              this.setFormText(i, this.inputParameters[i].value, true);
            }

            if (this.updateOutput === true) {
              this.onSubmit();
            }

          })
      });
  }

  // Helper method for converting the Excel representation of rows/columns into columns/rows
  // for submission to the api
  public transpose(a: any) {
    return Object.keys(a[0]).map(function (c) {
      return a.map(function (r: any) { return r[c]; });
    })
  }

  // Called when 'Submit' button is clicked in the Service Form
  // Submits form to the api for a response and outputs the
  // response data to the specified output bindings if successful.
  // Otherwise, it triggers an output error that is shown to the user
  onSubmit() {
    // Disables form fields and submit button until async call to web service api is complete
    this.toggleFields();
    this.isLoading = true;

    // Retrieves the values from the form
    // Sends as a POST and receives an output
    // Puts the output in the Excel sheet
    this.mlsService.postWebServices(this.service, this.inputParameters)
      .subscribe(
      (data: any) => {
        // Correctly received data
        // Access the data by name while looping through output parameters
        this.error = false;
        let i = 0;
        this.outputParameters.forEach((element: ExcelParameter) => {
          // temporary name to identify the parameter
          const name = element.name;
          // Set the data value in the parameter
          // based on the data type (data.frame, vector, matrix, other)
          if (element.type === 'data.frame') {
            const parameter = data[name];
            const excelData = [];
            element.labels = [];
            for (const key in parameter) {
              if (parameter.hasOwnProperty(key)) {
                element.labels.push(key);
                const val = parameter[key];
                excelData.push(val);
              }
            }

            element.value = this.transpose(excelData);
            element.display = element.value;
            element.display.unshift(element.labels);

          } else if (element.type === 'vector') {
            element.value = this.transpose([data[name]]);
            element.display = element.value;
          } else if (element.type === 'matrix') {
            element.value = this.transpose(data[name]);
            element.display = element.value;
          } else {
            element.value = [[data[name]]];
            element.display = element.value;
          }

          // Sets the value(s) in the output binding and expands the cells
          // from the first cell in the binding according to however
          // many cells is needed for the output
          this.excelService.setFlexValues(element.name, element.display)
            .then(() => {
              this.error = false;
              this.updateOutput = true;
              i++;
            })

          // Submission complete, enable the form fields and submission button
          this.isLoading = false;
          this.toggleFields();

        });
      },
      (error) => {
        if (error.status === 401) {
          // Return user to authentication page to reauthenticate
          this.isLoading = false;
          this.authService.logout();
          this.router.navigate(['/']);
        } else {
          // Parameter mismatch error, tell user to try again
          this.isLoading = false;
          this.feedback = error;
          this.toggleFields();
          this.error = true;
        }
      }
      );

  }

  // Toggles disable/enable of form fields and submit button
  public toggleFields() {
    if (this.serviceForm.enabled) {
      this.submitted = true;
      this.serviceForm.disable();
    } else {
      this.submitted = false;
      this.serviceForm.enable();
    }
  }

  // Called when an input parameter value field is clicked
  // Disables all form fields and submission button
  // Opens an Excel Prompt for the user to select a range
  // If a range was selected, creates a binding to the selected range
  onClickInput(id: number) {
    try {
      this.toggleFields();
      const name = this.inputParameters[id].name.toString();
      const type = this.inputParameters[id].type.toString();

      // Triggers Excel Prompt and binds to the selected range with the name of the input parameter as its id
      this.excelService.bind(name)
        .then(result => {
          this.inputParameters[id].binding = result;
        })
        // Adds a handler to notify the component of any data changes to the bound range of cells
        .then(() => this.excelService.addHandler(this.inputParameters[id].binding))
        // Gets the range of cells from the binding
        .then(() => this.excelService.getRange(name))
        .then(result => {
          this.inputParameters[id].range = result;
        })
        // Gets the value of the range of cells from the binding
        .then(() => this.excelService.getValue(name))
        .then((result: any[][]) => {
          // If it's a data.frame, get the labels
          if(this.inputParameters[id].type === 'data.frame') {
            this.inputParameters[id].labels = result.shift();
          }
          // Sets the value after transposing from row/col to col/row
          this.inputParameters[id].value = this.transpose(result);
          // If a ranged parameter, show the range.  Otherwise, show the value to the user in the form field
          if (this.inputParameters[id].type === 'data.frame' || this.inputParameters[id].type === 'vector'
            || this.inputParameters[id].type === 'matrix') {
            this.setFormText(id, this.inputParameters[id].range, true);
          } else {
            this.setFormText(id, this.inputParameters[id].value, true);
          }
        })
        .then(() => {
          this.toggleFields();
        })
        .catch((error) => {
          this.feedback = error;
          this.toggleFields();
        })
    } catch (error) {
      this.feedback = error;
      this.toggleFields();
    }
  }

  // Called when an output parameter value field is clicked
  // Disables all form fields and submission button
  // Opens an Excel Prompt for the user to select a range
  // If a range was selected, creates a binding to the selected range
  // (Major difference between this and the onClickInput is that a handler is not created so
  // resubmission will not automatically occur if the output range binding is changed -
  // they will again have to manually click 'submit')
  onClickOutput(id: number) {
    try {
      this.toggleFields();
      const name = this.outputParameters[id].name.toString();
      const type = this.outputParameters[id].type.toString();
      // Triggers Excel Prompt and binds to the selected range with the name of the output parameter as its id
      this.excelService.bind(name)
        .then(result => {
          this.outputParameters[id].binding = result;
        })
        // Gets the range of cells from the binding
        .then(() => this.excelService.getRange(name))
        .then(result => {
          this.outputParameters[id].range = result;
          this.setFormText(id, result, false);
        })
        .then(() => {
          this.toggleFields();
        })
        .catch((error) => {
          this.feedback = error;
          this.toggleFields();
        })
    } catch (error) {
      this.feedback = error;
      this.toggleFields();
    }
  }

  // Helper method for setting the form value field's text
  public setFormText(parameterId: number, text: string, input: boolean) {
    let paramGroup: string;
    if (input) {
      paramGroup = 'inputParameters';
    } else {
      paramGroup = 'outputParameters';
    }
    const param = (<FormArray>this.serviceForm.controls[paramGroup]).at(parameterId);
    param.patchValue({
      value: text
    });
  }

}
