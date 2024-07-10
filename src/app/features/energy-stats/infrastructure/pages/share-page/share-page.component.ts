import {Component, OnDestroy} from '@angular/core';
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SharingUsersService} from "../../services/sharing-users.service";
import {MonitoringService} from "../../services/monitoring.service";
import {NavbarComponent} from "../../../../../shared/infrastructure/components/navbar/navbar.component";
import {TranslocoDirective} from "@jsverse/transloco";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import dayjs from "dayjs";
import {DatePipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {TradeInterface} from "@shared/infrastructure/services/zertipower/trades/ZertipowerTradesService";
import {NoRoundDecimalPipe} from "@shared/infrastructure/pipes/no-round-decimal.pipe";
import {Subscription} from "rxjs";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";


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
    DecimalPipe,
    DatePipe,
    NoRoundDecimalPipe,
  ],
  providers: [
    MonitoringService,
  ],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.scss'
})
export class SharePageComponent implements OnDestroy{

  fromDate: Date = dayjs().subtract(1).toDate();
  toDate: Date = dayjs().toDate();
  maxDate: Date = dayjs().toDate();
  minToDate: Date = dayjs().toDate();

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

  tradesData!: TradeInterface[]
  customerId!: number;

  subscriptions: Subscription[] = [];
  constructor(
    private ngModal: NgbModal,
    protected sharingUsers: SharingUsersService,
    private monitoringService: MonitoringService,
    private readonly zertipower: ZertipowerService,
    private readonly userStore: UserStoreService,
  ) {
    this.subscriptions.push(
      this.userStore
        .selectOnly(state => state).subscribe((data) => {
        console.log(data)

        if (data.user) {
          this.customerId = data.user.customer_id!
          this.getData()
        }
      })
    )

  }


  async getData(){
    this.minToDate = dayjs(this.fromDate).toDate();
    this.tradesData = await this.zertipower.trades.getTrades(this.customerId, dayjs(this.fromDate).format('YYYY-MM-DD'), dayjs(this.toDate).format('YYYY-MM-DD'))
    // this.tradesData = await this.zertipower.trades.getTrades(22, dayjs(this.fromDate).format('YYYY-MM-DD'), dayjs(this.toDate).format('YYYY-MM-DD'))

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }


}
