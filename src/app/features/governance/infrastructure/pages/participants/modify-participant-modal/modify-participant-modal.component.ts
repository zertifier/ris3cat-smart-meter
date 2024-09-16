import {Component, Input, OnDestroy} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {Participant, ParticipantsService} from "../../../services/participants.service";
import {Subscription} from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: 'app-modify-participant-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './modify-participant-modal.component.html',
  styleUrl: './modify-participant-modal.component.scss'
})
export class ModifyParticipantModalComponent implements OnDestroy{
  @Input() participant!: Participant;
  subscriptions: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private participantsService: ParticipantsService,
  ) {
  }

  saveParticipant() {
    this.subscriptions.push(
      this.participantsService.updateParticipant(this.participant).subscribe({
        next: res => {
          this.activeModal.close('Close click')
          this.successSwal()

        },
        error: err => {
          this.swalErrorDisplay()
        }
      })
    )
  }

  successSwal(){
    Swal.fire({
      icon: 'success',
      title: 'Participant modificat correctament',
      confirmButtonText: "D'acord"
    })
  }

  swalErrorDisplay() {
    return Swal.fire({
      icon: 'error',
      title: 'ERROR',
      text: 'Hi ha hagut un error amb la proposta. Espera uns minuts i torna-ho a intentar.',
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
