import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  CommunityResponse,
  TradeTypes
} from "@shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService";
import {NgIf} from "@angular/common";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import Swal from "sweetalert2";
import {ChangeDetection} from "@angular/cli/lib/config/workspace-schema";

@Component({
  selector: 'app-community-modal',
  standalone: true,
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    TranslocoPipe
  ],
  templateUrl: './community-modal.component.html',
  styleUrl: './community-modal.component.scss'
})
export class CommunityModalComponent implements AfterViewInit {
  @Input() community: CommunityResponse | any;
  modifyCommunity: CommunityResponse | any;
  loading = false

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly zertipowerService: ZertipowerService,
    private readonly translocoService: TranslocoService,
    private readonly cd: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
    this.modifyCommunity = {...this.community}
    this.cd.detectChanges() //Removes console error
  }

  save() {
    this.loading = true
    this.zertipowerService.communities
      .updateNameAndTradetype(this.modifyCommunity.id, {name: this.modifyCommunity.name, tradeType: this.modifyCommunity.tradeType!})
      .then((res) => {
          Swal.fire({
            icon: 'success',
            text: this.translocoService.translate('MY-COMMUNITY.modals.modifyCommunity.swal.success'),
            confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
          }).then(() => {
            this.activeModal.close()
          })
        }
      ).catch((err) => {
      Swal.fire({
        icon: 'error',
        text: this.translocoService.translate('MY-COMMUNITY.modals.modifyCommunity.swal.error'),
        confirmButtonText: this.translocoService.translate('GENERIC.texts.okay')
      }).then(() => {
        this.activeModal.close()
      })
    }).finally(() => this.loading = false)
  }
}
