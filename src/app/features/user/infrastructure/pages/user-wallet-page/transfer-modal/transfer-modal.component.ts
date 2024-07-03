import {Component, Input, OnDestroy} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {NoRoundDecimalPipe} from "../../../../../../shared/infrastructure/pipes/no-round-decimal.pipe";
import {EthersService} from "../../../../../../shared/infrastructure/services/ethers.service";
import {NgIf} from "@angular/common";
import Swal from "sweetalert2";
import {DaoService} from "../../../../../governance/infrastructure/services/dao.service";
import {Subscription} from "rxjs";
import {ApiService} from "../../../../../../shared/infrastructure/services/api.service";
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    QuestionBadgeComponent,
    NoRoundDecimalPipe,
    NgIf,
    TranslocoDirective,
    TranslocoPipe
  ],
  providers: [NoRoundDecimalPipe],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.scss'
})
export class TransferModalComponent implements OnDestroy{

  @Input() type: 'EKW' | 'XDAI' | 'DAO' = 'XDAI';
  @Input() currentAmount: number = 0
  @Input() communityId?: number;

  toDirection?: string
  amountToTransfer?: number

  loading: boolean = false;

  subscriptions: Subscription[] = [];
  constructor(
    public activeModal: NgbActiveModal,
    private ethersService: EthersService,
    private noRoundDecimal: NoRoundDecimalPipe,
    private daoService: DaoService,
    private apiService: ApiService,
    private readonly translocoService: TranslocoService
  ) {
  }

  async setMaxAmount() {
    if (this.type != 'DAO') {
      const gasPrice = await this.ethersService.getCurrentGasPrice()
      this.amountToTransfer = parseFloat(this.noRoundDecimal.transform((this.currentAmount - gasPrice), 4))
    } else {
      this.amountToTransfer = parseFloat(this.noRoundDecimal.transform(this.currentAmount, 4))
    }
  }

  async send() {
    this.loading = true
    const verification = this.verifyDestinationInput()

    if (verification == 'unknown') {
      this.displayWrongDestinationError()
      this.loading = false

      return
    }

    let contractAddress = this.type == 'DAO' ? await this.daoService.getCommunityContract(this.communityId!) : undefined
    switch (verification) {
      case "email":
        this.sendFromEmail(contractAddress)
        break;
      case "wallet":
        this.sendFromWallet(contractAddress)
        break;
      default:
        this.sendFromWallet(contractAddress);
    }
  }

  async sendFromWallet(contractAddress?: string) {
    const tx = await this.ethersService.transferFromCurrentWallet(this.toDirection!, this.amountToTransfer || 0, this.type, contractAddress)
    if (tx) {
      this.displaySuccessTransfer().then(() => {
        this.loading = false
        this.activeModal.close()
      })
    } else {
      this.loading = false
      this.displayTransferError()
    }
  }

  sendFromEmail(contractAddress?: string) {
    this.subscriptions.push(
      this.apiService.getWalletByEmail(this.toDirection!).subscribe({
          next: async (walletResponse) => {
            const walletAddress = walletResponse.data.walletAddress || undefined

            if (!walletAddress) {
              this.displayWrongDestinationError()
              return
            }

            const tx = await this.ethersService.transferFromCurrentWallet(walletAddress, this.amountToTransfer || 0, this.type, contractAddress)
            if (tx) {
              this.displaySuccessTransfer().then(() => {
                this.loading = false
                this.activeModal.close()
              })
            } else {
              this.loading = false
              this.displayTransferError()
            }
          },
        error: () => {
            this.displayWrongDestinationError()
        }
        }
      )
    )

  }

  verifyDestinationInput(): 'email' | 'wallet' | 'unknown' {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Regular expression for email validation
    const walletPattern = /^0x[a-fA-F0-9]{40}$/; // Ethereum addresses

    // Check if the input matches the email pattern
    if (emailPattern.test(this.toDirection || '')) {
      return 'email';
    }

    if (walletPattern.test(this.toDirection || '')) {
      return 'wallet';
    }
    return 'unknown'
  }

  displaySuccessTransfer() {
    return Swal.fire({
      icon: 'success',
      title: this.translocoService.translate('MY-WALLET.modals.swal.success'),
    })
  }

  displayTransferError() {
    return Swal.fire({
      icon: 'error',
      title: this.translocoService.translate('MY-WALLET.modals.swal.blockchainError'),
      text: this.translocoService.translate('MY-WALLET.modals.swal.tryAgainError')
    })
  }

  displayWrongDestinationError() {
    return Swal.fire({
      icon: 'error',
      title: this.translocoService.translate('MY-WALLET.modals.swal.wrongDestinyError'),
      text: this.translocoService.translate('MY-WALLET.modals.swal.checkTryAgainError')
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
