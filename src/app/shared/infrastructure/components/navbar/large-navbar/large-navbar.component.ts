import {Component, OnDestroy} from '@angular/core';
import {AppLogoComponent} from "../../app-logo/app-logo.component";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {
  UserProfileSelectorComponent
} from "../../../../../features/user/infrastructure/components/user-profile/user-profile-selector/user-profile-selector.component";
import {BreakPoints, ScreenBreakPointsService} from "../../../services/screen-break-points.service";
import {AsyncPipe, NgClass, NgIf, NgStyle} from "@angular/common";
import {map, Subscription} from "rxjs";
import {
  UserProfileButtonComponent
} from "../../../../../features/user/infrastructure/components/user-profile/user-profile-button/user-profile-button.component";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {UserStoreService} from "../../../../../features/user/infrastructure/services/user-store.service";
import {TranslocoPipe} from "@jsverse/transloco";

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
    NgbDropdownToggle,
    NgClass,
    TranslocoPipe,
    NgIf
  ],
  templateUrl: './large-navbar.component.html',
  styleUrl: './large-navbar.component.scss'
})
export class LargeNavbarComponent implements OnDestroy{
  currentBreakpoint$ = this.screenBreakpoints.observeBreakpoints();
  // hideLogo$ = this.currentBreakpoint$.pipe(map(val => val <= BreakPoints.LG));
  logoHeight$ = this.currentBreakpoint$.pipe(map(value => {
    switch (value) {
      case BreakPoints.XL:
        return '58px';
      case BreakPoints.XXL:
        // return '15rem';
        return '58px';
      default:
        return '';
    }
  }));
  userRole!: string | undefined
  hasCommunity = false

  subscriptions: Subscription[] = []
  constructor(private readonly screenBreakpoints: ScreenBreakPointsService, private userStore: UserStoreService) {
    // const user = this.userStore.snapshotOnly(state => state.user);
    const state = this.userStore.snapshotOnly(state => state);
    this.subscriptions.push(
      this.userStore.selectOnly(this.userStore.$.communityId).subscribe((community) => {
        this.hasCommunity = !!community;
      })
    )

    this.userRole = state.user?.role
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }
}
