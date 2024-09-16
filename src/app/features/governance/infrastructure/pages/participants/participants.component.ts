import {Component, OnDestroy} from '@angular/core';
import {PaginatorModule} from "primeng/paginator";
import {Subscription} from "rxjs";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Participant, ParticipantsService, ParticipantStatus} from "../../services/participants.service";
import {UserStoreService} from "../../../../user/infrastructure/services/user-store.service";
import Swal from "sweetalert2";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModifyParticipantModalComponent} from "./modify-participant-modal/modify-participant-modal.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [
    PaginatorModule,
    NgClass,
    NgForOf,
    NgIf
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


  constructor(
    private participantsService: ParticipantsService,
    private userStore: UserStoreService,
    private modalService: NgbModal,
    private router: Router
  ) {

    const user = this.userStore.snapshotOnly(state => state.user);
    if (!user) {
      return
    }

    if (user.role.toLowerCase() == 'user') {
      this.router.navigate(['']);
      return
    }else{
      this.subscriptions.push(
        this.userStore.selectOnly(this.userStore.$.communityId).subscribe((community) => {
          this.communityId = community
          this.getParticipantsByStatus(this.participantStatus)
          this.getPendingQty(this.communityId!)

        })
      )
    }
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
        this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
          console.log("ERRROR", err)
        })
      }
    })
  }

  activateParticipant(id: number) {
    Swal.fire({
      title: "Acceptar aquest participant?",
      icon: "question",
      input: "number",
      inputLabel: "Beta",
      inputPlaceholder: "p.e.: 5000",
      showCancelButton: true,
      confirmButtonText: "Acceptar",
      cancelButtonText: 'Tancar',
      preConfirm : (shares: any) => {
        this.subscriptions.push(
          this.participantsService.activateParticipant(id, shares || 0).subscribe({
            next: result => {
              Swal.fire({
                icon: "success",
                title: "El participant s'ha activat correctament",
                confirmButtonText: 'Entès',
                customClass: {
                  confirmButton: 'btn btn-secondary-force'
                }
              }).then(() => {
                this.getParticipantsByStatus(this.participantStatus)
                this.getPendingQty(this.communityId!)

              })
            },
            error: err => {
              this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
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
      title: "El participant s'eliminarà permanentment",
      confirmButtonText: 'Entès',
      cancelButtonText: 'Tancar',
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
                title: "El participant s'ha eliminat correctament",
                confirmButtonText: 'Entès',
                customClass: {
                  confirmButton: 'btn btn-secondary-force'
                }
              }).then(() => {
                this.getParticipantsByStatus(this.participantStatus)
                this.getPendingQty(this.communityId!)

              })
            },
            error: err => {
              this.swalErrorDisplay('Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.').then(() => {
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
