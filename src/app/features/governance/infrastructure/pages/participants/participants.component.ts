import {Component, OnDestroy} from '@angular/core';
import {PaginatorModule} from "primeng/paginator";
import {Subscription} from "rxjs";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Participant, ParticipantsService, ParticipantStatus} from "../../services/participants.service";
import {UserProfile, UserStoreService} from "../../../../user/infrastructure/services/user-store.service";
import Swal from "sweetalert2";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModifyParticipantModalComponent} from "./modify-participant-modal/modify-participant-modal.component";
import {Router} from "@angular/router";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";

@Component({
  selector: 'app-participants',
  standalone: true,
    imports: [
        PaginatorModule,
        NgClass,
        NgForOf,
        NgIf,
        TranslocoDirective
    ],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss'
})
export class ParticipantsComponent implements OnDestroy{

  filterText!: string
  participantStatus: ParticipantStatus = "active";
  communityId?: number;
  loading: boolean = true;
  pendingQty: number = 0

  participants: Participant[] = []

  subscriptions: Subscription[] = [];

  // user: UserProfile | undefined

  constructor(
    private participantsService: ParticipantsService,
    private userStore: UserStoreService,
    private modalService: NgbModal,
    private router: Router,
    private translocoService: TranslocoService
  ) {

    /*const user = this.userStore.snapshotOnly(state => state.user);
    if (!user) {
      return
    }*/

    this.subscriptions.push(
      this.userStore
        .selectOnly(state => state).subscribe((data) => {
        if (data.user) {
          // this.user = data.user
          this.subscriptions.push(
            this.userStore.selectOnly(this.userStore.$.communityId).subscribe((community) => {
              if (community) {
                this.communityId = community
                this.getParticipantsByStatus(this.participantStatus)
                this.getPendingQty(this.communityId!)
              }

            })
          )
        }
      })
    )
  }


  getParticipantsByStatus(status: ParticipantStatus) {
    if (this.filterText) {
      this.subscriptions.push(
        this.participantsService.getParticipantsFilter(this.communityId!, status, this.filterText || '').subscribe({
          next: response => {
            this.participants = response.data
            this.loading = false
            this.participantStatus = status
          },
          error: err => {
            this.participants = []
            this.loading = false
          }
        })
      )
    } else {
      this.subscriptions.push(
        this.participantsService.getParticipants(this.communityId!, status).subscribe({
          next: response => {
            this.participants = response.data
            this.loading = false
            this.participantStatus = status

          },
          error: err => {
            this.participants = []
            this.loading = false
          }
        })
      )
    }
  }

  getPendingQty(communityId: number){
    this.participantsService.getPendingQty(communityId).subscribe({
      next: response => {
        this.pendingQty = response.data.qty
      },
      error: err => {
        this.swalErrorDisplay(this.translocoService.translate('PARTICIPANTS.modals.swal.errorMessage')).then(() => {
          console.log("ERRROR", err)
        })
      }
    })
  }

  activateParticipant(id: number) {
    Swal.fire({
      title: this.translocoService.translate('PARTICIPANTS.modals.swal.activate.title'),
      icon: "question",
      input: "number",
      inputLabel: this.translocoService.translate('PARTICIPANTS.modals.swal.activate.inputLabel'),
      inputPlaceholder: this.translocoService.translate('PARTICIPANTS.modals.swal.activate.inputPlaceholder'),
      showCancelButton: true,
      confirmButtonText: this.translocoService.translate('GENERIC.texts.okay'),
      cancelButtonText: this.translocoService.translate('GENERIC.texts.close'),
      preConfirm : (shares: any) => {
        this.subscriptions.push(
          this.participantsService.activateParticipant(id, shares || 0).subscribe({
            next: result => {
              Swal.fire({
                icon: "success",
                title: this.translocoService.translate('PARTICIPANTS.modals.swal.activate.success.title'),
                confirmButtonText: this.translocoService.translate('GENERIC.texts.okay'),
                customClass: {
                  confirmButton: 'btn btn-secondary-force'
                }
              }).then(() => {
                this.getParticipantsByStatus(this.participantStatus)
                this.getPendingQty(this.communityId!)

              })
            },
            error: err => {
              this.swalErrorDisplay(this.translocoService.translate('PARTICIPANTS.modals.swal.errorMessage')).then(() => {
                console.log("ERRROR", err)
              })
            }
          })
        )
      }
    })

  }

  removeParticipant(id: number) {
    Swal.fire({
      icon: "warning",
      title: this.translocoService.translate('PARTICIPANTS.modals.swal.remove.title'),
      confirmButtonText: this.translocoService.translate('GENERIC.texts.okay'),
      cancelButtonText: this.translocoService.translate('GENERIC.texts.close'),
      showCancelButton: true,
      customClass: {
        confirmButton: 'btn btn-secondary-force'
      }
    }).then((swalResult) => {
      if (swalResult.isConfirmed)
        this.subscriptions.push(
          this.participantsService.removeParticipant(id).subscribe({
            next: result => {

              Swal.fire({
                icon: "success",
                title: this.translocoService.translate('PARTICIPANTS.modals.swal.remove.success.title'),
                confirmButtonText: this.translocoService.translate('GENERIC.texts.okay'),
                customClass: {
                  confirmButton: 'btn btn-secondary-force'
                }
              }).then(() => {
                this.getParticipantsByStatus(this.participantStatus)
                this.getPendingQty(this.communityId!)

              })
            },
            error: err => {
              this.swalErrorDisplay(this.translocoService.translate('PARTICIPANTS.modals.swal.errorMessage')).then(() => {
                console.log("ERRROR", err)
              })
            }
          })
        )
    })

  }


  openModifyModal(participant: Participant){
    const modalRef = this.modalService.open(ModifyParticipantModalComponent)
    modalRef.componentInstance.participant = {...participant};

    this.subscriptions.push(
      modalRef.closed.subscribe(() => {
        this.getParticipantsByStatus(this.participantStatus)
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


  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
