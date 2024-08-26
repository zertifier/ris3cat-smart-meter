import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import { NoRoundDecimalPipe } from "../../../../../../shared/infrastructure/pipes/no-round-decimal.pipe";
import { EthersService } from "../../../../../../shared/infrastructure/services/ethers.service";
import { NgIf } from "@angular/common";
import Swal from "sweetalert2";
import { DaoService } from "../../../../../governance/infrastructure/services/dao.service";
import { Subscription } from "rxjs";
import { ApiService } from "../../../../../../shared/infrastructure/services/api.service";
import { TranslocoDirective, TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { ZertipowerService } from '../../../../../../shared/infrastructure/services/zertipower/zertipower.service';
import { CustomerDTO } from '../../../../../../shared/infrastructure/services/zertipower/customers/ZertipowerCustomersService';
import { QrScannerComponent } from "@shared/infrastructure/components/qr-scanner/qr-scanner.component";

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
    TranslocoPipe,
    QrScannerComponent
  ],
  providers: [NoRoundDecimalPipe],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.scss'
})
export class TransferModalComponent implements OnDestroy {

  @Input() type: 'EKW' | 'XDAI' | 'DAO' = 'XDAI';
  @Input() currentAmount: number = 0;
  @Input() communityId?: number;
  @Input() customer?: CustomerDTO;

  toDirection?: string
  amountToTransfer?: number

  loading: boolean = false;

  @Input() userAction: 'add' | 'pullOut' | 'transfer' = 'add';
  @Input() userActionType: 'balance' | 'tokens' | 'betas' = 'balance';
  @Output() updateData = new EventEmitter<boolean>();

  subscriptions: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private ethersService: EthersService,
    private noRoundDecimal: NoRoundDecimalPipe,
    private daoService: DaoService,
    private apiService: ApiService,
    private readonly translocoService: TranslocoService,
    private zertipowerService: ZertipowerService
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

  async getMaxAmount() {
    if (this.type != 'DAO') {
      const gasPrice = await this.ethersService.getCurrentGasPrice()
      return parseFloat(this.noRoundDecimal.transform((this.currentAmount - gasPrice), 4))
    } else {
      return parseFloat(this.noRoundDecimal.transform(this.currentAmount, 4))
    }
  }

  async send() {

    this.loading = true;

    //add or pull out balance
    if (this.userActionType == 'balance') {

      if (!this.customer) {
        //TODO: swal error: customer lack
      }

      if (this.userAction == 'add') {

        let maxAmount = await this.getMaxAmount();

        //if amount to transfer is greater than max amount
        if ((this.amountToTransfer || 0) > maxAmount) {
          //TODO: swal error: insuficient funds

          Swal.fire('', 'saldo insuficient', 'warning')

          this.loading = false;
          this.activeModal.close();
          return;
        }

        this.zertipowerService.communities.deposit(this.amountToTransfer!)
          .then(
            (res: any) => {
              Swal.fire('', 'saldo depositat', 'success')
              this.updateData.emit(true);
            }
          ).catch((error: any) => {

          }).finally(() => {
            this.loading = false;
            this.activeModal.close();
          })

        return;

      }

      if (this.userAction == 'pullOut') {

        //if amount to transfer is greater than max amount
        if ((this.amountToTransfer || 0) > this.customer?.balance! || 0) {
          //TODO: swal error: insuficient funds
          this.loading = false;
          this.activeModal.close();
          return;
        }

        this.zertipowerService.communities.witdraw(this.amountToTransfer!)
          .then(
            (res: any) => {
              Swal.fire('', 'saldo retirat', 'success')
              this.updateData.emit(true);
            }
          ).catch((error: any) => { }).finally(() => {
            this.loading = false;
            this.activeModal.close();
          })


        return;

      }

      this.loading = false;
      this.activeModal.close();
      return;

    }

    const verification = this.verifyDestinationInput()
    if (verification == 'unknown') {
      this.displayWrongDestinationError();
      this.loading = false;
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
