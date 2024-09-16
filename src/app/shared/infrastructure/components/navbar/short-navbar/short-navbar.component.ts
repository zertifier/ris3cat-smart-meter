import {Component, TemplateRef} from '@angular/core';
import {
  UserProfileSelectorComponent
} from "../../../../../features/user/infrastructure/components/user-profile/user-profile-selector/user-profile-selector.component";
import {
  NgbAccordionBody,
  NgbAccordionButton,
  NgbAccordionCollapse,
  NgbAccordionDirective,
  NgbAccordionHeader,
  NgbAccordionItem,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbModal
} from "@ng-bootstrap/ng-bootstrap";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {
  UserProfileButtonComponent
} from "../../../../../features/user/infrastructure/components/user-profile/user-profile-button/user-profile-button.component";
import {UserStoreService} from "../../../../../features/user/infrastructure/services/user-store.service";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-short-navbar',
  standalone: true,
  imports: [
    UserProfileSelectorComponent,
    RouterLink,
    RouterLinkActive,
    UserProfileButtonComponent,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbAccordionDirective,
    NgbAccordionItem,
    NgbAccordionHeader,
    NgbAccordionButton,
    NgbAccordionCollapse,
    NgbAccordionBody,
    NgIf,
    NgClass
  ],
  templateUrl: './short-navbar.component.html',
  styleUrl: './short-navbar.component.scss'
})
export class ShortNavbarComponent {
  buttons: { label: string, route: string }[] = [
    {route: '/energy-stats/community', label: 'La meva comunitat'},
    {route: '/energy-stats/my-cup', label: 'El meu comptador'},
    {route: '/energy-stats/share', label: 'Compartir energia'},
    {route: '/energy-stats/stats', label: 'Estadístiques'},
    // {route: '/energy-stats/governance', label: 'Governança'},
    {route: '/energy-stats/data-source-health', label: 'Status'}
  ]

  userRole!: string | undefined
  constructor(private readonly ngbModalService: NgbModal, private userStore: UserStoreService,) {
    const user = this.userStore.snapshotOnly(state => state.user);

    this.userRole = user?.role


  }

  showMenu(content: TemplateRef<any>) {
    this.ngbModalService.open(content, {fullscreen: true, backdrop: false, modalDialogClass: 'transparent-modal'});
  }
}
