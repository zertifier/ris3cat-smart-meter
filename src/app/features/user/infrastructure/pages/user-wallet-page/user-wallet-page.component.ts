import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DecimalPipe, NgIf } from "@angular/common";
import { UserStoreService } from "../../services/user-store.service";
import { EthersService } from "@shared/infrastructure/services/ethers.service";
import { FormsModule } from "@angular/forms";
import { QuestionBadgeComponent } from "@shared/infrastructure/components/question-badge/question-badge.component";
import { filter, first, Subscription } from "rxjs";
import Swal from "sweetalert2";
import { DaoService } from "@features/governance/infrastructure/services/dao.service";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TransferModalComponent } from "./transfer-modal/transfer-modal.component";
import { NoRoundDecimalPipe } from "@shared/infrastructure/pipes/no-round-decimal.pipe";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { ZertipowerService } from '../../../../../shared/infrastructure/services/zertipower/zertipower.service';
import { CustomerDTO } from '../../../../../shared/infrastructure/services/zertipower/customers/ZertipowerCustomersService';
import { BuyModalComponent } from "@features/user/infrastructure/pages/user-wallet-page/buy-modal/buy-modal.component";
import { ActivatedRoute, Params } from "@angular/router";
import { MintStatus, StripeService } from "@shared/infrastructure/services/zertipower/stripe/stripe.service";
import { QrGeneratorComponent } from "@shared/infrastructure/components/qr-generator/qr-generator.component";
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-user-wallet-page',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    QuestionBadgeComponent,
    DecimalPipe,
    NoRoundDecimalPipe,
    TranslocoDirective,
    CommonModule,
    QrGeneratorComponent,
    CommonModule
  ],
  providers: [
    NgbActiveModal
  ],
  templateUrl: './user-wallet-page.component.html',
  styleUrl: './user-wallet-page.component.scss'
})

export class UserWalletPageComponent implements AfterViewInit, OnDestroy {
  wallet$ = this.userStore.selectOnly(state => state.user?.wallet_address)
    .pipe(wallet => wallet || 'No hi ha cap wallet assignada')

  userStore$ = this.userStore.selectOnly(state => state)

  ekwBalance: number = 0
  chainBalance: number = 0
  voteWeight: number = 0
  communityId?: number
  customerId!: number
  customer: CustomerDTO | undefined;
  walletAddress!: string;
  
  pk:string = '';
  textOrPwd:'text'|'password'='password';
  isPasswordVisible:boolean=false;

  activeSection: 'Platform' | 'Blockchain' = 'Platform';
  userAction: 'add' | 'pullOut' | 'transfer' = 'add';
  userActionType: 'balance' | 'tokens' | 'betas' = 'balance';

  subscriptions: Subscription[] = [];

  // public activeModal = inject(NgbActiveModal);

  constructor(
    private userStore: UserStoreService,
    private ethersService: EthersService,
    private daoService: DaoService,
    private modalService: NgbModal,
    private zertipowerService: ZertipowerService,
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private translocoService: TranslocoService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscriptions.push(
      this.userStore$.subscribe((store) => {
        if (store && store.user?.wallet_address) {
          this.communityId = store.cups.length ? store.cups[0].communityId : undefined
          this.customerId = store.user?.customer_id!
          this.walletAddress = store.user?.wallet_address
          this.getAllBalances(this.walletAddress)
          this.pk = this.userStore.snapshotOnly(state => state.user?.wallet?.privateKey)!;
        }
      })
    )
  }

  ngAfterViewInit() {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['blockchain'] == 'true') {
          this.activeSection = 'Blockchain'
          //Check if transloco is ready
          this.subscriptions.push(
            this.translocoService.events$.pipe(
              filter(e => e.type === 'translationLoadSuccess'), first()
            ).subscribe(() => {
              console.log("bbbb")

              this.stripeCheckoutManagement(params)
            })
          )
        }
      })
    )
  }

  async getAllBalances(wallet: string) {
    this.ethersService.getEKWBalance(wallet).then((balance) => {
      this.ekwBalance = balance
      console.log("ekw", balance)
    })
    this.ethersService.getChainBalance(wallet).then((balance) => {
      this.chainBalance = balance
      console.log("chain", balance)
    })
    if (this.communityId) {
      this.daoService.getDaoBalance(wallet, this.communityId).then((balance) => {
        this.voteWeight = balance
        console.log("vote", balance)
      })
    }
    this.customer = await this.zertipowerService.customers.getCustomerById(this.customerId)
    console.log("customer", this.customer)
  }

  openTransferModal(type: 'DAO' | 'XDAI' | 'EKW', currentAmount: number, userAction: string, userActionType: string) {
    const modalRef = this.modalService.open(TransferModalComponent, { size: 'lg' })
    modalRef.componentInstance.type = type

    if (currentAmount) {
      modalRef.componentInstance.currentAmount = currentAmount;
    }

    modalRef.componentInstance.communityId = this.communityId
    modalRef.componentInstance.userAction = userAction
    modalRef.componentInstance.userActionType = userActionType

    if (this.customer) {
      modalRef.componentInstance.customer = this.customer
    }

    // modalRef.componentInstance.updateData.subscribe((res:boolean)=>{
    //   if(res){
    //     this.getAllBalances(this.walletAddress)
    //   }
    // })

    this.subscriptions.push(
      modalRef.closed.subscribe({
        next: () => {
          console.log("modal closed")
          this.getAllBalances(this.walletAddress)
        }
      })
    )
  }

  openAddEkwModal() {
    const modalRef = this.modalService.open(BuyModalComponent, { size: 'lg' })
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

  changeSection(activeSection: 'Platform' | 'Blockchain') {
    this.activeSection = activeSection;
  }

  async stripeCheckoutManagement(params: Params) {
    const sessionId = params['session_id'];
    if (sessionId) {
      if (params['success'] == 'false') {
        Swal.fire({
          icon: "error",
          text: this.translocoService.translate('MY-WALLET.swal.stripeCheckoutError'),
          confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
        })
        return
      }
      if (params['success'] == 'true') {
        /*const loadingSwal = await Swal.fire({
          text: "S'esta processant la teva petició",
          didOpen: () => {
            Swal.showLoading();
          }
        })*/
        // loadingSwal.dismiss

        this.subscriptions.push(
          this.stripeService.mintStatus.subscribe((status) => {
            // loadingSwal.dismiss

            this.swalMintStatus(status)
          })
        )


        this.stripeService.setMintStatus(sessionId)

      }
    }
  }

  async swalMintStatus(status: MintStatus) {
    switch (status) {
      case "ACCEPTED":
        Swal.hideLoading()
        Swal.fire({
        icon: 'success',
        text: this.translocoService.translate('MY-WALLET.swal.stripeMintSuccess'),
        showConfirmButton: true,
        confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
      })

        break;
      case "ERROR":
        Swal.hideLoading()
        Swal.fire({
        icon: 'error',
        text: this.translocoService.translate('MY-WALLET.swal.stripeMintError'),
        showConfirmButton: true,
        confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
      })
        break;

      case "MINTING": Swal.fire({
        text: this.translocoService.translate('MY-WALLET.swal.stripeMintingWait'),
        didOpen: () => {
          Swal.showLoading();

        }
      })
        break
    }
    this.getAllBalances(this.walletAddress)
  }
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  togglePasswordVisibility(){
    this.isPasswordVisible=!this.isPasswordVisible;
    if(this.isPasswordVisible){
      this.textOrPwd='text'
    } else {
      this.textOrPwd='password'
    }
  }

  copyToClipboard(elementToCopy:any) {
    navigator.clipboard.writeText(elementToCopy).then(() => {
      Swal.fire({title:this.translocoService.translate('MY-WALLET.swal.copy'),'timer':1000,'showConfirmButton':false})
    }).catch(err => {
      console.error('Error al copiar el texto: ', err);
    });
  }

}
