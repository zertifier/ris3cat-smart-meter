import {Component, ElementRef, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {Proposal, ProposalsService} from "../../../services/proposals.service";
import Swal from "sweetalert2";
import {CalendarModule} from "primeng/calendar";
import {DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {ReactiveFormsModule} from "@angular/forms";
import {ProposalStatus} from "../../../../domain/ProposalStatus";
import {ProposalTypes} from "../../../../domain/ProposalTypes";
import {UserVote, VotesService, VotesWithQty} from "../../../services/votes.service";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-proposal-page',
  standalone: true,
  imports: [
    CalendarModule,
    NgForOf,
    NgIf,
    QuestionBadgeComponent,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    NgClass,
    DatePipe,
    NgbTooltip,
    DecimalPipe
  ],
  templateUrl: './proposal-page.component.html',
  styleUrl: './proposal-page.component.scss'
})
export class ProposalPageComponent implements OnDestroy {

  id: string | null;
  proposal!: Proposal
  selectedOptionId: number | null = null;
  activeOptionIndex: number | undefined;

  currentVotes!: VotesWithQty[]
  optionVoted!: UserVote
  totalVotes: number = 0;
  totalWeightVotes: number = 0;
  voteWeight: number = 0;
  totalMembers: number = 0;
  alreadyVoted: boolean = false;
  userId!: number;
  userRole!: string;
  customerId?: number;
  sanitizedHtml!: SafeHtml;
  subscriptions: Subscription[] = [];
  @ViewChild("proposalContent") proposalContent!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proposalsService: ProposalsService,
    private votesService: VotesService,
    private userStore: UserStoreService,
    public sanitized: DomSanitizer,
    private renderer: Renderer2
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    const user = this.userStore.snapshotOnly(state => state.user);
    if (!user) {
      return
    }

    this.userId = user.id
    this.customerId = user.customer_id
    this.userRole = user.role
    if (this.id && !this.proposal) this.getProposal()


    // this.subscriptions.push(this.userStore
    //   .selectOnly(state => state).subscribe((data) => {
    //     if (data.user) {
    //       console.log(data.user)
    //       this.userId = data.user.id
    //       if (this.id && !this.proposal) this.getProposal()
    //     }
    //   }))
  }


  getProposal() {
    this.subscriptions.push(
      this.proposalsService.getProposalById(this.id!).subscribe({
          next: proposal => {
            const proposalData = proposal.data

            if (!proposalData.id)
              this.swalErrorDisplay('Aquesta proposta no existeix.').then(async () => {
                await this.router.navigate(['/governance/proposals']);
                return
              })

            this.proposal = proposalData
            this.sanitizedHtml = this.sanitized.bypassSecurityTrustHtml(this.proposal.description)

            this.getVoteFromUser()
            this.getTotalUsersByCommunity(proposalData.communityId)
            this.getVoteWeight(proposalData.communityId)
            if (proposalData.transparent == 1 || proposalData.status != 'active' || 'pending') this.getVotes()
          },
          error: (err) => {
            this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
              console.log("ERRROR", err)
            })
          }
        }
      )
    )
  }

  getVotes() {
    this.subscriptions.push(
      this.votesService.getVotesByProposalId(this.proposal.id).subscribe({
          next: data => {
            const votes = data.data
            this.currentVotes = votes
            this.totalVotes = 0
            this.totalWeightVotes = 0
            for (const vote of votes) {
              this.totalVotes += vote.qty
              this.totalWeightVotes += vote.votes
            }

            this.calculatePercentage()

          },
          error: err => {
            this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
              console.log("ERRROR", err)
            })
          }
        }
      )
    )
  }

  getVoteFromUser() {
    this.subscriptions.push(
      this.votesService.getVotesByProposalIdAndUserId(this.proposal.id, this.userId).subscribe({
          next: data => {
            const vote = data.data
            this.optionVoted = vote
            const optionIndex = this.proposal.options?.findIndex(option => {
              return option.id == vote.optionId
            })

            if (optionIndex || optionIndex == 0) {
              this.selectOption(this.optionVoted.optionId, optionIndex)
            }

            if (vote.optionId) this.alreadyVoted = true

          },
          error: err => {
            this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
              console.log("ERRROR", err)
            })
          }
        }
      )
    )
  }

  getTotalUsersByCommunity(communityId: number) {
    this.subscriptions.push(
      this.votesService.getTotalCupsByCommunityId(communityId).subscribe({
        next: value => {
          this.totalMembers = value.data.total
        },
        error: err => {
          this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
            console.log("ERRROR", err)
          })
        }
      })
    )
  }

  getVoteWeight(communityId: number){
    if (this.customerId)
    this.subscriptions.push(
      this.votesService.getCustomerSharesByCommunityAndCustomer(communityId, this.customerId).subscribe({
        next: value => {
          this.voteWeight = value.data.shares
        },
        error: err => {
          this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
            console.log("ERRROR", err)
          })
        }
      })
    )
  }

  vote() {
    this.subscriptions.push(
      this.votesService.postVote(this.userId, this.proposal.id, this.selectedOptionId!).subscribe({
        next: response => {
          this.alreadyVoted = true;
          this.getVotes()
          this.swalSuccessDisplay("Votació realitzada amb èxit")
        },
        error: err => {
          this.swalErrorDisplay('Hi ha hagut votant. Espera uns minuts i torna-ho a intentar.').then(() => {
            console.log("ERRROR", err)
          })
        }
      })
    )

  }

  updateProposalStatus(status: ProposalStatus) {
    this.subscriptions.push(
      this.proposalsService.updateStatus(this.proposal.id, status).subscribe({
        next: value => {
          this.swalSuccessDisplay("L'estat de la proposta s'ha modificiat correctament").then(() => {
            this.getProposal()
          })
        },
        error: err => {
          this.swalErrorDisplay('Hi ha hagut votant. Espera uns minuts i torna-ho a intentar.').then(() => {
            console.log("ERRROR", err)
          })
        }
      })
    )
  }

  deleteProposal() {
    Swal.fire({
      icon: 'info',
      title: "Segur que vols descartar la proposta?",
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-secondary-force',
        cancelButton: 'btn btn-danger'
      }
    }).then((result) => {
      if (result.isConfirmed)
        this.proposalsService.deleteProposal(this.proposal.id).subscribe({
          next: value => {
            this.swalSuccessDisplay("La proposta s'ha borrat correctament").then(() => {
              this.router.navigate(['/governance/proposals']);
            })
          },
          error: err => {
            this.swalErrorDisplay('Hi ha hagut votant. Espera uns minuts i torna-ho a intentar.').then(() => {
              console.log("ERRROR", err)
            })
          }
        })
    })

  }

  selectOption(id: number, index: number) {
    this.activeOptionIndex = index
    this.selectedOptionId = id
  }

  calculatePercentage() {
    for (const vote of this.currentVotes) {
      const votePercentage =
        ((this.proposal.type == 'weighted' ? vote.votes : vote.qty) * 100) / (this.proposal.type == 'weighted' ? this.totalWeightVotes : this.totalVotes)
        // (vote.qty * 100) / this.totalVotes

      for (const option of this.proposal.options!) {
        if (option.id == vote.optionId) option.percentage = votePercentage
      }
    }

  }

  getVoteByOptionId(optionId: number){
    if (this.currentVotes)
      return this.currentVotes.find((vote) => vote.optionId == optionId)
    else
      return {qty: 0}
  }

  swalSuccessDisplay(message: string) {
    return Swal.fire({
      icon: 'success',
      title: message,
      confirmButtonText: 'Entès',
      customClass: {
        confirmButton: 'btn btn-secondary-force'
      }
    })
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

  statusTranslation(status: ProposalStatus) {
    return this.proposalsService.statusTranslation(status)
  }

  typeTranslation(type: ProposalTypes) {
    return this.proposalsService.typeTranslation(type)
  }

  getStatusButtonClass(status: ProposalStatus) {
    switch (status.toLowerCase()) {
      case "active":
        return 'text-bg-success'
      /*case "active":
        return 'btn-outline-success'*/
      /*case "pending":
        return 'btn-outline-warning'*/
      case "pending":
        return 'text-bg-warning'
      case "succeeded":
        return 'text-bg-success'
      /*case "succeeded":
        return 'btn-outline-success'*/
      case "executed":
        return 'tertiary-badge'
      /*case "executed":
        return 'btn-outline-tertiary'*/
      case "defeated":
        return 'text-bg-danger'
     /* case "defeated":
        return 'btn-outline-danger'*/
      default:
        return 'tertiary-badge'
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
