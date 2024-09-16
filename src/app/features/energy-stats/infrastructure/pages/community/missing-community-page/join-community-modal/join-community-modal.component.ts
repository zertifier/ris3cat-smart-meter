import {Component} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {
  QuestionBadgeComponent
} from "../../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ZertipowerService} from "../../../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import {
  LocationInterface
} from "../../../../../../../shared/infrastructure/services/zertipower/location/ZertipowerLocationService";
import {NgForOf, NgIf} from "@angular/common";
import {
  CommunityResponse
} from "../../../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService";

@Component({
  selector: 'app-join-community-modal',
  standalone: true,
  imports: [
    QuestionBadgeComponent,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './join-community-modal.component.html',
  styleUrl: './join-community-modal.component.scss'
})
export class JoinCommunityModalComponent {

  public selectedLocationId!: number
  public selectedCommunityId!: number
  public locations!: LocationInterface[];
  public communities!: CommunityResponse[];
  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly zertipower: ZertipowerService
  ) {
    this.getAllLocations()
  }


  async getAllLocations(){
    try {
      this.locations = await this.zertipower.locations.getLocations()
    }catch (err){
      console.log(err)
    }
  }

  async getCommunitiesByLocation(){
    const selectedLocation = this.locations.find((location) => location.id == this.selectedLocationId)

    try{
      this.communities = await this.zertipower.communities.getByLocationId(this.selectedLocationId)

    }catch (err){
      console.log(err)
    }
  }

  joinCommunity(){

  }
}
