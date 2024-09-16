import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import {AppLogoComponent} from "../app-logo/app-logo.component";

@Component({
  selector: 'app-no-logged-navbar',
  standalone: true,
  imports: [
    RouterLink,
    AppLogoComponent
  ],
  templateUrl: './no-logged-navbar.component.html',
  styleUrl: './no-logged-navbar.component.scss'
})
export class NoLoggedNavbarComponent {

}
