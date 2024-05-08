import { Component } from '@angular/core';
import {Proposal, ProposalsService} from "../../services/proposals.service";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ProposalStatus} from "../../../domain/ProposalStatus";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";

type ProposalType = 'active' | 'pending' | 'finished' | 'executed' | 'succeeded' | 'defeated' | 'all';
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
export class ProposalsPageComponent {

  proposals: Proposal[] = []
  proposalType: ProposalType = 'all'
  filterText!: string
  currentStatus: ProposalStatus | 'all' = 'all'

  constructor(
    private proposalsService: ProposalsService
  ) {

    this.getAllProposals()
  }


  getAllProposals(){
   //EMPTY NOT WORKING
    this.proposalsService.getProposalsByFilter(this.filterText || '').subscribe((response) => {
      this.proposals = response.data.length ? response.data : []
      this.proposalType = 'all'
    })
  }

  getProposalsByStatus(status: ProposalStatus){
    this.proposalsService.getProposalsByFilterAndStatus(this.filterText || '', status).subscribe((response) => {
      this.proposals = response.data.length ? response.data : []
      this.proposalType = status
    })
  }

  getProposalsByFilter(){
    this.proposalsService.getProposalsByFilter(this.filterText).subscribe((response) => {
      this.proposals = response.data.length ? response.data : []
    })
  }
  getProposalsByFilterAndStatus(){
    this.proposalsService.getProposalsByFilterAndStatus(this.filterText, 'active').subscribe((response) => {
      this.proposals = response.data
    })
  }

  statusTranslation(status: ProposalStatus){
    switch (status.toLowerCase()){
      case "active": return 'Actiu'
      case "pending": return 'Pendent'
      case "succeeded": return 'Acceptada'
      case "executed": return 'Executada'
      case "defeated": return 'Vençuda'
      default: return
    }
  }

}
