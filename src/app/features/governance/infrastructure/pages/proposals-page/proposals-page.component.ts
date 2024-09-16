import {Component, OnDestroy} from '@angular/core';
import {Proposal, ProposalsService} from "../../services/proposals.service";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ProposalStatus} from "../../../domain/ProposalStatus";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {htmlToText} from "html-to-text";
import {Subscription} from "rxjs";
import {DaoService} from "../../services/dao.service";
import Swal from "sweetalert2";
import {EthersService} from "@shared/infrastructure/services/ethers.service";

type ProposalType = 'active' | 'pending' | 'expired' | 'executed' | 'denied' | 'all';

@Component({
  selector: 'app-proposals-page',
  standalone: true,
  imports: [
    NgForOf,
    DatePipe,
    NgClass,
    NgIf,
    RouterLinkActive,
    RouterLink,
    FormsModule
  ],
  templateUrl: './proposals-page.component.html',
  styleUrl: './proposals-page.component.scss'
})
export class ProposalsPageComponent implements OnDestroy {

  proposals: Proposal[] = []
  proposalType: ProposalType = 'all'
  communityId!: number
  userRole: string | undefined = ''
  filterText!: string

  subscriptions: Subscription[] = [];
  constructor(
    private proposalsService: ProposalsService,
    private userStore: UserStoreService,
    private daoService: DaoService,
    private ethersService: EthersService,
  ) {

    this.subscriptions.push(
      this.userStore.selectOnly(this.userStore.$.communityId).subscribe((community) => {
        this.communityId = community
        this.getAllProposals()
      }),
      this.userStore
        .selectOnly(state => state).subscribe((data) => {
        if (data.user) {
          this.userRole = data.user?.role;
        }
      })
    )
  }

  getAllProposals() {
    if (this.filterText) {
      this.subscriptions.push(
        this.proposalsService.getProposalsByFilterAndCommunity(this.communityId, this.filterText).subscribe((response) => {
          this.proposals = response.data.length ? response.data : []
          this.proposalType = 'all'
        })
      )
    } else {
      this.subscriptions.push(
        this.proposalsService.getProposalsByCommunity(this.communityId).subscribe((response) => {
          this.proposals = response.data.length ? response.data : []
          this.proposalType = 'all'
        })
      )
    }
  }

  getProposalsByStatus(status: ProposalStatus) {
    if (this.filterText) {
      this.subscriptions.push(
        this.proposalsService.getProposalsByFilterStatusCommunity(this.communityId, this.filterText || '', status).subscribe((response) => {
          this.proposals = response.data.length ? response.data : []
          this.proposalType = status
        })
      )
    } else {
      this.subscriptions.push(
        this.proposalsService.getProposalsByStatusAndCommunity(this.communityId, status).subscribe((response) => {
          this.proposals = response.data.length ? response.data : []
          this.proposalType = status
        })
      )
    }
  }

  getDescriptionText(htmlText: string) {
    return htmlToText(htmlText, {wordwrap: 150, baseElements: {selectors: ['p']}})
  }

  statusTranslation(status: ProposalStatus) {
    return this.proposalsService.statusTranslation(status)
  }

  async createDao() {
    const name = 'DAO CCE Montolivet'
    const symbol = 'CCE1'
    const contractAddress = await this.daoService.createContract(name, symbol)
    if (contractAddress) {
      this.saveDaoToDb(contractAddress.toString(), name, symbol)
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Hi ha hagut un error creant la DAO'
      })
    }
  }

  saveDaoToDb(daoAddress: string, daoName: string, daoSymbol: string) {
    this.subscriptions.push(
      this.daoService.postDao(this.communityId, {
        daoAddress,
        daoName,
        daoSymbol
      })
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'DAO creada correctament'
            }).then()
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Hi ha hagut un error guardant la DAO'
            }).then()
          }
        }))
  }

  async mintTokens(){
    const mintTx = await this.ethersService.mintTokens('0xF677cc5290a206d85DA400279C7548C8002D721B', 17000)
    console.log(mintTx)
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
