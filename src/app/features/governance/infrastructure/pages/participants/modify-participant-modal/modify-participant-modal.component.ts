import {Component, Input, OnDestroy} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {Participant, ParticipantsService} from "../../../services/participants.service";
import {Subscription} from "rxjs";
import Swal from "sweetalert2";
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";

@Component({
  selector: 'app-modify-participant-modal',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoDirective,
    TranslocoPipe
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
    private transloco: TranslocoService
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
      title: this.transloco.translate('PARTICIPANTS.modals.modify.success'),
      confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
    })
  }

  swalErrorDisplay() {
    return Swal.fire({
      icon: 'error',
      title: this.transloco.translate('PARTICIPANTS.modals.modify.error'),
      confirmButtonText: this.transloco.translate('GENERIC.texts.okay'),
      customClass: {
        confirmButton: 'btn btn-secondary-force'
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
