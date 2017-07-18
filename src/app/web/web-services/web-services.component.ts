import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/Rx';

import { AuthService } from '../../services/auth.service';
import { MlsService } from '../../services/mls.service';
import { WebService } from '../../models/web-service';

// Component for all web services available to user
// Allows user to select a specific service to use within Excel
@Component({
  selector: 'app-web-services',
  templateUrl: './web-services.component.html',
  styleUrls: ['./web-services.component.css']
})
export class WebServicesComponent implements OnInit {
  // Contains all services available to the user
  public services: WebService[];
  // Boolean to control asynchronous loading messaging
  public isLoading: boolean;
  // Boolean to trigger an error message on the page if retrieval of web services failed
  public error: boolean;
  public errorMessage: string;
  // Service selected by the user which will be injected into the web-service.component and cause this component to become hidden
  public selectedService: WebService;

  constructor(public authService: AuthService, public mlsService: MlsService, private router: Router) {
    this.isLoading = false;
    this.error = false;
    this.errorMessage = 'There was an error in retrieving your services.  Please try to retrieve them again by pressing the button below.';
  }

  ngOnInit() {
    this.getServices();
  }

  // Retrieves all services available to the user
  public getServices() {
    this.isLoading = true;
    this.mlsService.getWebServices()
      .subscribe((data: WebService[]) => {
        this.services = data;
        this.isLoading = false;
        this.error = false;
        this.selectedService = undefined;
      }, (error) => {
        if (error.status === 400 || error.status === 401) {
          // Return user to authentication page
          this.authService.logout();
          this.router.navigate(['/']);
        } else {
          // Miscellaneous error
          // Tell user to try again
          this.isLoading = false;
          this.error = true;
        }
      });
  }

  // Called when user picks a service
  public selected(service: WebService) {
    this.mlsService.serviceSelected = true;
    this.selectedService = service;
  }

  // Called when retry button is clicked after an error has occurred
  public retry() {
    this.getServices();
  }

}

