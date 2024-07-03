import {Component, OnDestroy, TemplateRef} from '@angular/core';
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
import {TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import {Subscription} from "rxjs";

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
    NgClass,
    TranslocoPipe
  ],
  templateUrl: './short-navbar.component.html',
  styleUrl: './short-navbar.component.scss'
})
export class ShortNavbarComponent implements OnDestroy{

  buttons: { label: string, route: string }[] = [
/*    // {route: '/energy-stats/community', label: 'La meva comunitat'},
    {route: '/energy-stats/community', label: this.translocoService.translate('MY-COMMUNITY.navbar')},
    {route: '/energy-stats/my-cup', label: 'El meu comptador'},
    {route: '/energy-stats/share', label: 'Compartir energia'},
    {route: '/energy-stats/stats', label: 'Estadístiques'},
    // {route: '/energy-stats/governance', label: 'Governança'},
    {route: '/energy-stats/data-source-health', label: 'Status'}*/
  ]

  userRole!: string | undefined
  subscriptions: Subscription[] = [];

  constructor(private readonly ngbModalService: NgbModal, private userStore: UserStoreService, private readonly translocoService: TranslocoService) {
    const user = this.userStore.snapshotOnly(state => state.user);

    this.userRole = user?.role


    this.subscriptions.push(
      this.translocoService.langChanges$.subscribe(() => {
        this.setButtons()
      })
    )
  }

  showMenu(content: TemplateRef<any>) {
    this.ngbModalService.open(content, {fullscreen: true, backdrop: false, modalDialogClass: 'transparent-modal'});
  }

  setButtons(){
    this.buttons = [
      {route: '/energy-stats/community', label: this.translocoService.translate('MY-COMMUNITY.navbar')},
      {route: '/energy-stats/my-cup', label: this.translocoService.translate('MY-CUPS.navbar')},
      {route: '/energy-stats/share', label: this.translocoService.translate('SHARE-ENERGY.navbar')},
      // {route: '/energy-stats/governance', label: 'Governança'},
      {route: '/energy-stats/data-source-health', label: this.translocoService.translate('STATUS.navbar')}
    ]
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
