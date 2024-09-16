import {Component} from '@angular/core';
import {
  QuestionBadgeComponent
} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {JsonPipe} from "@angular/common";
import Swal from "sweetalert2";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {EventBus} from "@shared/domain/EventBus";
import {filter, first} from "rxjs";
import {Router} from "@angular/router";
import {UserCupsChangedEvent} from "@features/user/domain/UserCupsChangedEvent";
import {
  ValidationHintComponent
} from "@shared/infrastructure/components/validation-hint/validation-hint.component";
import {nifValidator} from "@shared/infrastructure/form-validators/nif-validator";

@Component({
  selector: 'app-datadis-register-form',
  standalone: true,
  imports: [
    QuestionBadgeComponent,
    ReactiveFormsModule,
    JsonPipe,
    ValidationHintComponent
  ],
  templateUrl: './datadis-register-form.component.html',
  styleUrl: './datadis-register-form.component.scss'
})
export class DatadisRegisterFormComponent {
  hidePassword = true;

  protected formData = this.formBuilder.group({
    dni: new FormControl<string>('', [nifValidator]),
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
    cups: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private zertipower: ZertipowerService,
    private userStore: UserStoreService,
    private eventBus: EventBus,
    private router: Router,
  ) {
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  public closeModal() {
    this.ngbActiveModal.close('cross click');
  }

  public async registerCups() {
    if (this.formData.invalid) {
      return;
    }

    const {dni, password, cups, username} = this.formData.value;
    const customerId = this.userStore.snapshotOnly(state => state.user!.customer_id);
    try {
      await this.zertipower.cups.registerDatadis(customerId!, cups!, dni!, username!, password!);
    } catch (err) {
      Swal.fire({
        title: 'Hi ha hagut un error',
        icon: "error",
      });
      return;
    }
    // when the handler updates the user data retry to go to /my-cups page
    this.userStore.selectOnly(state => state.cups)
      .pipe(
        filter(cups => cups.length > 0),
        first()
      )
      .subscribe(async () => {
        await this.router.navigate(['/energy-stats/my-cup']);
        this.ngbActiveModal.close();
      });
    await this.eventBus.publishEvents(new UserCupsChangedEvent());
  }
}
