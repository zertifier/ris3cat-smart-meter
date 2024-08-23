import { Component } from '@angular/core';
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import {NgClass, NgIf} from "@angular/common";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {StripeService} from "@shared/infrastructure/services/zertipower/stripe/stripe.service";
import {FormsModule} from "@angular/forms";
import Swal from "sweetalert2";


export type BuyType = "VISA" | "CRYPTO"

@Component({
  selector: 'app-buy-modal',
  standalone: true,
  imports: [
    TranslocoDirective,
    NgIf,
    TranslocoPipe,
    NgClass,
    FormsModule
  ],
  templateUrl: './buy-modal.component.html',
  styleUrl: './buy-modal.component.scss'
})

export class BuyModalComponent {
  buyType: BuyType = "VISA"
  qty!: number
  constructor(
    public activeModal: NgbActiveModal,
    private userStore: UserStoreService,
    private stripeService: StripeService,
    private translocoService: TranslocoService
  ) {
  }

  openStripe(){
    const user = this.userStore.snapshotOnly(state => state.user);
    if (this.qty <= 0 || !this.qty) {
      this.swalQtyError()
      return
    }
    if (!user) {
      this.swalUserError()
      return
    }

    window.location.href = this.stripeService.getCheckoutUrl(user!.wallet_address!, this.qty)
  }

  swalQtyError(){
    Swal.fire({
      icon: "error",
      text: this.translocoService.translate('MY-WALLET.modals.buy.swal.qtyError'),
      confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
    })
  }
  swalUserError(){
    Swal.fire({
      icon: "error",
      text: this.translocoService.translate('MY-WALLET.modals.buy.swal.userError'),
      confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
    })
  }
}
