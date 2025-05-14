import {AfterViewInit, Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgIf} from "@angular/common";
import {UserCups} from "../../../../../../user/infrastructure/services/user-store.service";
import {FormsModule} from "@angular/forms";
import {ZertipowerService} from "../../../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import Swal from "sweetalert2";
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";

@Component({
  selector: 'app-cups-modal',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './cups-modal.component.html',
  styleUrl: './cups-modal.component.scss'
})
export class CupsModalComponent implements AfterViewInit{

  @Input() cups?: UserCups | undefined;
  reference: string = '';
  loading: boolean = false;
  energyBlocks:any = {
    provider:0,
    valle:0,
    llano:0,
    punta:0
  };

  constructor(
    public readonly activeModal: NgbActiveModal,
    private zertipower: ZertipowerService,
    private transloco: TranslocoService
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
      title: this.transloco.translate('MY-CUPS.modals.modifyCups.texts.success'),
      confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
    })
  }

  displayErrorAlert(){
    return Swal.fire({
      icon: 'error',
      title: this.transloco.translate('MY-CUPS.modals.modifyCups.texts.error'),
      confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
    })
  }
}
