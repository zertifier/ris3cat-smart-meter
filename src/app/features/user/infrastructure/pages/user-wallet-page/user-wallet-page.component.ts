import {Component, OnDestroy} from '@angular/core';
import {AsyncPipe, DecimalPipe, NgIf} from "@angular/common";
import {UserStoreService} from "../../services/user-store.service";
import {EthersService} from "@shared/infrastructure/services/ethers.service";
import {FormsModule} from "@angular/forms";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {Subscription} from "rxjs";
import Swal from "sweetalert2";
import {DaoService} from "@features/governance/infrastructure/services/dao.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TransferModalComponent} from "./transfer-modal/transfer-modal.component";
import {NoRoundDecimalPipe} from "@shared/infrastructure/pipes/no-round-decimal.pipe";

@Component({
  selector: 'app-user-wallet-page',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    QuestionBadgeComponent,
    DecimalPipe,
    NoRoundDecimalPipe,
    NgIf
  ],
  templateUrl: './user-wallet-page.component.html',
  styleUrl: './user-wallet-page.component.scss'
})
export class UserWalletPageComponent implements OnDestroy {
  wallet$ = this.userStore.selectOnly(state => state.user?.wallet_address)
    .pipe(wallet => wallet || 'No hi ha cap wallet assignada')

  userStore$ = this.userStore.selectOnly(state => state)

  ekwBalance: number = 0
  chainBalance: number = 0
  voteWeight: number = 0
  communityId?: number
  customerId!: number
  walletAddress!: string;

  subscriptions: Subscription[] = [];

  constructor(
    private userStore: UserStoreService,
    private ethersService: EthersService,
    private daoService: DaoService,
    private modalService: NgbModal
  ) {
    this.subscriptions.push(
      this.userStore$.subscribe((store) => {
        if (store && store.user?.wallet_address) {
          this.communityId = store.cups.length ? store.cups[0].communityId : undefined
          this.customerId = store.user?.customer_id!
          this.walletAddress = store.user?.wallet_address
          this.getAllBalances(this.walletAddress)
        }
      })
    )
  }

  getAllBalances(wallet: string) {
    this.ethersService.getEKWBalance(wallet,).then((balance) => {
      this.ekwBalance = balance
    })
    this.ethersService.getChainBalance(wallet).then((balance) => {
      this.chainBalance = balance
    })

    if (this.communityId)
      this.daoService.getDaoBalance(wallet, this.communityId).then((balance) => {
        this.voteWeight = balance
      })

  }

  openTransferModal(type: 'DAO' | 'XDAI' | 'EKW', currentAmount: number) {
    const modalRef = this.modalService.open(TransferModalComponent, {size: 'lg'})
    modalRef.componentInstance.type = type
    modalRef.componentInstance.currentAmount = currentAmount
    modalRef.componentInstance.communityId = this.communityId

    this.subscriptions.push(
      modalRef.closed.subscribe({
        next: () => {
          this.getAllBalances(this.walletAddress)
        }
      })
    )
  }

  swalErrorDisplay(message: string) {
    return Swal.fire({
      icon: 'error',
      title: 'ERROR',
      text: message,
      confirmButtonText: 'Entès',
      customClass: {
        confirmButton: 'btn btn-secondary-force'
      }
    })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
