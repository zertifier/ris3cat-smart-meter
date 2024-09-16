import {Component} from '@angular/core';
import {
  NoLoggedNavbarComponent
} from "../../../../shared/infrastructure/components/no-logged-navbar/no-logged-navbar.component";
import {AuthStoreService} from "../../../auth/infrastructure/services/auth-store.service";
import {AsyncPipe} from "@angular/common";
import {NavbarComponent} from "../../../../shared/infrastructure/components/navbar/navbar.component";

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [
    NoLoggedNavbarComponent,
    AsyncPipe,
    NavbarComponent
  ],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss'
})
export class HelpPageComponent {
  loggedIn$ = this.authStore.selectOnly(this.authStore.$.loggedIn)
  constructor(private readonly authStore: AuthStoreService) {
  }
}
