import {Component} from '@angular/core';
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {EnergyPrice, SharingUsersService} from "../../services/sharing-users.service";
import {MonitoringService} from "../../services/monitoring.service";
import {AddUserFormModalComponent} from "../../components/add-user-form-modal/add-user-form-modal.component";
import {NavbarComponent} from "../../../../../shared/infrastructure/components/navbar/navbar.component";
import {TranslocoDirective} from "@jsverse/transloco";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import dayjs from "dayjs";
import {NgForOf, NgIf} from "@angular/common";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";


@Component({
  selector: 'app-share-page',
  standalone: true,
  imports: [
    NgbModule,
    NavbarComponent,
    TranslocoDirective,
    ReactiveFormsModule,
    CalendarModule,
    FormsModule,
    NgIf,
    NgForOf,
    QuestionBadgeComponent,
  ],
  providers: [
    MonitoringService,
  ],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.scss'
})
export class SharePageComponent {

  fromDate: Date = dayjs().subtract(1).toDate();
  toDate: Date = dayjs().toDate();
  maxDate: Date = dayjs().toDate();

  loading: boolean = false;

  sharedData = [
    {
      date: '16/06/24 00:00',
      type: "buy",
      qty: "20",
      total: "10",
      before: "20",
      now: "17"
    },
    {
      date: '1/06/24 15:00',
      type: "sell",
      qty: "30",
      total: "19",
      before: "80",
      now: "71"
    },
    {
      date: '11/06/24 20:00',
      type: "sell",
      qty: "13",
      total: "40",
      before: "53",
      now: "40"
    }
  ]
  constructor(
    private ngModal: NgbModal,
    protected sharingUsers: SharingUsersService,
    private monitoringService: MonitoringService
  ) {
  }


  getData(){
    console.log('DATA')
  }

  protected readonly EnergyPrice = EnergyPrice;
}
