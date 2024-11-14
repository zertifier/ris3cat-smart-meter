import {Component} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {ZertiauthApiService} from "../../../../../../auth/infrastructure/services/zertiauth-api.service";
import {ZertipowerService} from "../../../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import {
  LocationInterface
} from "../../../../../../../shared/infrastructure/services/zertipower/location/ZertipowerLocationService";
import {NgForOf, NgIf} from "@angular/common";
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import swal from "sweetalert2";
import {
  UserProfile,
  UserStore,
  UserStoreService
} from "../../../../../../user/infrastructure/services/user-store.service";
import {Router} from "@angular/router";
@Component({
  selector: 'app-add-community-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './add-community-form.component.html',
  styleUrl: './add-community-form.component.scss'
})
export class AddCommunityFormComponent {
  protected formData = this.formBuilder.group({
    name: new FormControl<string>('', [Validators.required]),
    locationId: new FormControl<number | null>(null, [Validators.required]),
  });

  locations?: LocationInterface[]
  loading = false
  user: UserProfile | undefined;
  constructor(
    public readonly activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private apiService: ZertipowerService,
    private transloco: TranslocoService,
    private userStore: UserStoreService,
    private router: Router
  ) {
    this.apiService.locations.getLocations().then((locations) => {
      this.locations = locations
    });

    this.userStore
      .selectOnly(state => state).subscribe((data) => {
      this.user = data.user
    })

  }

  async save(){
    this.loading = true;
    if (this.formData.invalid) {
      this.formData.markAllAsTouched()
      this.loading = false
      return;
    }

    const {name, locationId} = this.formData.value

    try {
      const response = await this.apiService.communities.create({locationId: locationId!, name: name!, customerId: this.user?.customer_id || undefined})
      if (response.success) this.swalErrorCreating()
      swal.fire({
        icon: "success",
        text: this.transloco.translate('MY-COMMUNITY.modals.addCommunity.texts.successCreating'),
        confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
      }).then(() => {
        this.loading = false
        window.location.href = '/community';
      })
    }catch (e) {
      this.swalErrorCreating()
    }
  }

  swalErrorCreating(){
    swal.fire({
      icon: "error",
      text: this.transloco.translate('MY-COMMUNITY.modals.addCommunity.texts.errorCreating'),
      confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
    })
    this.loading = false
  }
}
