import {Component} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {
  QuestionBadgeComponent
} from "../../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ZertipowerService} from "../../../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import {
  LocationInterface
} from "../../../../../../../shared/infrastructure/services/zertipower/location/ZertipowerLocationService";
import {NgForOf, NgIf} from "@angular/common";
import {
  CommunityResponse
} from "../../../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService";
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import {ParticipantsService} from "../../../../../../governance/infrastructure/services/participants.service";
import {UserProfile, UserStoreService} from "../../../../../../user/infrastructure/services/user-store.service";
import swal from "sweetalert2";

@Component({
  selector: 'app-join-community-modal',
  standalone: true,
  imports: [
    QuestionBadgeComponent,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    TranslocoPipe,
    TranslocoDirective
  ],
  templateUrl: './join-community-modal.component.html',
  styleUrl: './join-community-modal.component.scss'
})
export class JoinCommunityModalComponent {
  protected formData = this.formBuilder.group({
    communityId: new FormControl<string | null>(null, [Validators.required]),
  });

  public selectedLocationId!: number
  public locations!: LocationInterface[];
  public communities!: CommunityResponse[];

  loading = false
  user: UserProfile | undefined;

  constructor(
    public readonly activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private readonly apiService: ZertipowerService,
    private participantsService: ParticipantsService,
    private userStore: UserStoreService,
    private transloco: TranslocoService
  ) {
    this.userStore
      .selectOnly(state => state).subscribe((data) => {
      this.user = data.user
    })
    this.getAllLocations()
  }


  async getAllLocations() {
    try {
      this.locations = await this.apiService.locations.getLocations()
    } catch (err) {
      console.log(err)
    }
  }

  async getCommunitiesByLocation() {
    const selectedLocation = this.locations.find((location) => location.id == this.selectedLocationId)

    try {
      this.communities = await this.apiService.communities.getByLocationId(this.selectedLocationId)

    } catch (err) {
      console.log(err)
    }
  }

  joinCommunity() {
    this.loading = true;
    if (this.formData.invalid) {
      this.formData.markAllAsTouched()
      this.loading = false
      return;
    }

    const communityId = this.formData.value.communityId!

    try {
      this.participantsService.create({communityId: parseInt(communityId), customerId: this.user!.customer_id!}).subscribe({
        next: () => {
          swal.fire({
            icon: "success",
            text: this.transloco.translate('MY-COMMUNITY.modals.joinCommunity.texts.successJoining'),
            confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
          }).then(() => {
            this.loading = false
            this.activeModal.close()
          })
        },
        error: err => {
          console.log(err)
          this.swalErrorJoining()
        }
      })
    }catch (e) {
      console.log(e)
      this.swalErrorJoining()
    }
  }

  swalErrorJoining(){
    swal.fire({
      icon: "error",
      text: this.transloco.translate('MY-COMMUNITY.modals.joinCommunity.texts.errorJoining'),
      confirmButtonText: this.transloco.translate('GENERIC.texts.okay')
    })
    this.loading = false
  }
}
