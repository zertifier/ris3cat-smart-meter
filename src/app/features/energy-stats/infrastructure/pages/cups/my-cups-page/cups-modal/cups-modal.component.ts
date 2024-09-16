import {AfterViewInit, Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgIf} from "@angular/common";
import {UserCups} from "../../../../../../user/infrastructure/services/user-store.service";
import {FormsModule} from "@angular/forms";
import {ZertipowerService} from "../../../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-cups-modal',
  standalone: true,
  imports: [
    NgIf,
    FormsModule
  ],
  templateUrl: './cups-modal.component.html',
  styleUrl: './cups-modal.component.scss'
})
export class CupsModalComponent implements AfterViewInit{

  @Input() cups?: UserCups | undefined
  reference: string = ''
  loading: boolean = false

  constructor(
    public readonly activeModal: NgbActiveModal,
    private zertipower: ZertipowerService,
  ) {
  }

  ngAfterViewInit(): void {
    this.reference = this.cups?.reference || ''
  }


  async save(){
    this.loading = true
    if (this.cups){
      try {
        const response = await this.zertipower.cups.updateCupsReference(this.cups.id, this.reference)

        this.displaySuccessAlert().then(() => {
          this.loading = false
          this.activeModal.close()
        })
      }catch (e){
        this.displayErrorAlert().then(() => {
          this.loading = false
        })

      }
    }
  }

  displaySuccessAlert(){
    return Swal.fire({
      icon: 'success',
      title: "Les dades s'han guardat amb èxit",
      confirmButtonText: "D'acord"
    })
  }

  displayErrorAlert(){
    return Swal.fire({
      icon: 'error',
      title: "Les dades no s'han pogut guardar.",
      text: "Torna-ho a intentar d'aqui uns minuts",
      confirmButtonText: "D'acord"
    })
  }
}
