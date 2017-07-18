import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { MlsService } from '../services/mls.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(public authService: AuthService, public mlsService: MlsService, private router: Router) { }

  ngOnInit() {
  }

}
