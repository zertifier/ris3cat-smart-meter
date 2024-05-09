import { Component } from '@angular/core';
import {AppLogoComponent} from "../../app-logo/app-logo.component";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {UserProfileSelectorComponent} from "../../../../../features/user/infrastructure/components/user-profile/user-profile-selector/user-profile-selector.component";
import {BreakPoints, ScreenBreakPointsService} from "../../../services/screen-break-points.service";
import {AsyncPipe, NgStyle} from "@angular/common";
import {map} from "rxjs";
import {UserProfileButtonComponent} from "../../../../../features/user/infrastructure/components/user-profile/user-profile-button/user-profile-button.component";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-large-navbar',
  standalone: true,
  imports: [
    AppLogoComponent,
    RouterLink,
    RouterLinkActive,
    UserProfileSelectorComponent,
    NgStyle,
    AsyncPipe,
    UserProfileButtonComponent,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownToggle
  ],
  templateUrl: './large-navbar.component.html',
  styleUrl: './large-navbar.component.scss'
})
export class LargeNavbarComponent {
  currentBreakpoint$ = this.screenBreakpoints.observeBreakpoints();
  hideLogo$ = this.currentBreakpoint$.pipe(map(val => val <= BreakPoints.LG));
  logoWidth$ = this.currentBreakpoint$.pipe(map(value => {
    switch (value) {
      case BreakPoints.XL:
        return '10rem';
      case BreakPoints.XXL:
        return '15rem';
      default:
        return '';
    }
  }));
  constructor(private readonly screenBreakpoints: ScreenBreakPointsService) {
  }
}
