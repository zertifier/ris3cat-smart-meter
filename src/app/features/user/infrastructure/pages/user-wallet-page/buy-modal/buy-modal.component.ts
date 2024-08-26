import { Component,Renderer2,ElementRef  } from '@angular/core';
import { OnInit } from '@angular/core';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { NgClass, NgIf } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UserStoreService } from "@features/user/infrastructure/services/user-store.service";
import { StripeService } from "@shared/infrastructure/services/zertipower/stripe/stripe.service";
import { FormsModule } from "@angular/forms";
import Swal from "sweetalert2";

// @ts-ignore
//import { createCowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

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

export class BuyModalComponent implements OnInit {
  buyType: BuyType = "VISA"
  qty!: number
  constructor(
    public activeModal: NgbActiveModal,
    private userStore: UserStoreService,
    private stripeService: StripeService,
    private translocoService: TranslocoService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {

  }

  ngOnInit() {
    this.createCryptoModal();
  }

  createCryptoModal() {    
    // let widgetContainer = this.el.nativeElement.querySelector('#cowswap-widget');
    // if (!widgetContainer) {
    //   widgetContainer = this.renderer.createElement('div');
    //   this.renderer.setAttribute(widgetContainer, 'id', 'cowswap-widget');
    //   this.renderer.appendChild(this.el.nativeElement, widgetContainer);
    // }
    // const params: CowSwapWidgetParams = {
    //   appCode: 'NAME-OF-YOU-APP', // Add here the name of your app. e.g. "Pig Swap"
    //   width: '600',
    //   height: '640',
    //   sell: { asset: 'DAI' },
    //   buy: { asset: 'USDC', amount: '0.1' }
    // }

    // createCowSwapWidget(widgetContainer, { params })
  }

  openStripe() {
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

  swalQtyError() {
    Swal.fire({
      icon: "error",
      text: this.translocoService.translate('MY-WALLET.modals.buy.swal.qtyError'),
      confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
    })
  }
  swalUserError() {
    Swal.fire({
      icon: "error",
      text: this.translocoService.translate('MY-WALLET.modals.buy.swal.userError'),
      confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
    })
  }
}
