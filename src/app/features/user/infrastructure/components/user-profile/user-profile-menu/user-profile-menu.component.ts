import {Component, TemplateRef} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UserStoreService} from "../../../services/user-store.service";
import {map} from "rxjs";
import {TextShorterPipe} from "../../../../../../shared/infrastructure/pipes/wallet-address-shortener.pipe";
import {AsyncPipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {Confirmable} from "../../../../../../shared/infrastructure/decorators/Confirmable";
import {LogoutActionService} from "../../../../../auth/actions/logout-action.service";
import {TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import Swal from "sweetalert2";

@Component({
  selector: 'app-user-profile-menu',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './user-profile-menu.component.html',
  styleUrl: './user-profile-menu.component.scss'
})
export class UserProfileMenuComponent {
  firstname$ = this.userStore.selectOnly(state => state.user?.firstname).pipe(
    map(value => value || 'No firstname')
  )
  wallet$ = this.userStore.selectOnly(state => state.user?.wallet_address).pipe(
    map(value => {
      if (!value) {
        return '';
      }

      return new TextShorterPipe().transform(value, 5, 3);
    })
  );

  constructor(
    private ngbModal: NgbModal,
    private userStore: UserStoreService,
    private logoutAction: LogoutActionService,
    private readonly translocoService: TranslocoService
  ) {
  }

  showMenu(content: TemplateRef<any>) {
    this.ngbModal.open(content, {backdrop: false, modalDialogClass: 'h-100 expand-modal-content my-0'});
  }

  // @Confirmable("Segur que vols tancar sessió?", {confirmButton: 'Tancar sessió', cancelButton: 'Cancel·lar'})
  async logout() {


    Swal.fire({
      text: this.translocoService.translate('LOGOUT.modal.message'),
      icon: 'question',
      confirmButtonText: this.translocoService.translate('LOGOUT.modal.confirm'),
      cancelButtonText: this.translocoService.translate('GENERIC.texts.cancel'),
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        // originalFunction.apply(this, args)
        await this.logoutAction.run();

      }
    });

    // await this.logoutAction.run();
  }

}
