import { Component } from '@angular/core';
import {TranslocoDirective, TranslocoPipe} from "@jsverse/transloco";
import {NgIf} from "@angular/common";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {StripeService} from "@shared/infrastructure/services/zertipower/stripe/stripe.service";

@Component({
  selector: 'app-buy-modal',
  standalone: true,
  imports: [
    TranslocoDirective,
    NgIf,
    TranslocoPipe
  ],
  templateUrl: './buy-modal.component.html',
  styleUrl: './buy-modal.component.scss'
})
export class BuyModalComponent {

  constructor(
    public activeModal: NgbActiveModal,
    private userStore: UserStoreService,
    private stripeService: StripeService
  ) {
  }

  openStripe(){
    const user = this.userStore.snapshotOnly(state => state.user);
    window.location.href = this.stripeService.getCheckoutUrl(user!.id!, 3)
  }

}
