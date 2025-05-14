import {Component} from '@angular/core';
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {NavbarComponent} from "../../../../../../shared/infrastructure/components/navbar/navbar.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {JoinCommunityModalComponent} from "./join-community-modal/join-community-modal.component";
import {TranslocoDirective} from '@jsverse/transloco';
import {AddCommunityFormComponent} from "./add-community-form/add-community-form.component";
import {UserProfile, UserStoreService} from "../../../../../user/infrastructure/services/user-store.service";
import {
  ParticipantsService,
  PendingCommunity
} from "../../../../../governance/infrastructure/services/participants.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-missing-community-page',
  standalone: true,
  imports: [
    QuestionBadgeComponent,
    AddCommunityFormComponent,
    NavbarComponent,
    TranslocoDirective,
    NgIf
  ],
  templateUrl: './missing-community-page.component.html',
  styleUrl: './missing-community-page.component.scss'
})
export class MissingCommunityPageComponent {
  user: UserProfile | undefined;
  pendingInvitation = false
  pendingCommunity: PendingCommunity | undefined = undefined

  constructor(
    private readonly modalService: NgbModal,
    private userStore: UserStoreService,
    private participantsApi: ParticipantsService
  ) {
    this.userStore
      .selectOnly(state => state).subscribe((data) => {
      this.user = data.user
      this.getInvitationStatus(this.user?.customer_id || undefined)
    })
  }



  openAddModal() {
    this.modalService.open(AddCommunityFormComponent)
  }
  openJoinModal() {
    const modalRef = this.modalService.open(JoinCommunityModalComponent)
    modalRef.closed.subscribe(() => this.getInvitationStatus(this.user?.customer_id))
  }

  getInvitationStatus(customerId: number | undefined) {
    if (!customerId) {
      return
    }

    this.participantsApi.getByCustomerId(customerId).subscribe({
      next: response => {
        console.log(response.data)
        console.log(response.data && response.data.length)
        if (response.data && response.data.length){
          this.pendingInvitation = true
          this.pendingCommunity = response.data[0]
        }else{
          this.pendingInvitation = false
          this.pendingCommunity = undefined
        }
      },
      error: err => {
        this.pendingInvitation = false
        console.log(err)
      }
    })
  }

}
