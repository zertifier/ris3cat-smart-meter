import {Component, OnDestroy} from '@angular/core';
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {SharingUsersService} from "../../services/sharing-users.service";
import {MonitoringService} from "../../services/monitoring.service";
import {NavbarComponent} from "../../../../../shared/infrastructure/components/navbar/navbar.component";
import {TranslocoDirective} from "@jsverse/transloco";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import dayjs from "dayjs";
import {CommonModule, DatePipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {TradeInterface} from "@shared/infrastructure/services/zertipower/trades/ZertipowerTradesService";
import {NoRoundDecimalPipe} from "@shared/infrastructure/pipes/no-round-decimal.pipe";
import {Subscription} from "rxjs";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {
  CommunityResponse
} from '../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService';
import {TextShorterPipe} from '../../../../../shared/infrastructure/pipes/wallet-address-shortener.pipe';
import swal from 'sweetalert2';
import Swal from 'sweetalert2';
import {TableModule} from 'primeng/table';


@Component({
  selector: 'app-share-page',
  standalone: true,
  imports: [
    CommonModule,
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
    TextShorterPipe,
    TableModule
  ],
  providers: [
    MonitoringService,
  ],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.scss'
})
export class SharePageComponent implements OnDestroy {

  defaultDate: any = dayjs().toDate();
  fromDate: Date | null = dayjs().subtract(30, 'days').toDate();
  toDate: Date | null = dayjs().toDate();
  maxDate: Date | null = dayjs().toDate();
  minToDate: Date | null = dayjs().subtract(30).toDate();

  loading: boolean = false;

  tradesData!: TradeInterface[]
  customerId!: number;
  customer: any;

  communityData!: CommunityResponse | any;
  communityId!: number;
  communityId$ = this.userStore.selectOnly(this.userStore.$.communityId).subscribe(async (communityId: any) => {
    if (communityId) {
      this.communityId = communityId;
      this.communityData = await this.zertipower.communities.getCommunityById(communityId)
    }
  });

  infoDisplay: 'community' | 'customer' = 'customer';

  tradeTypeVisible = false;

  totalShared: number = 0;


  subscriptions: Subscription[] = [];

  constructor(
    private ngModal: NgbModal,
    protected sharingUsers: SharingUsersService,
    private monitoringService: MonitoringService,
    private readonly zertipower: ZertipowerService,
    private readonly userStore: UserStoreService
  ) {
    this.subscriptions.push(
      this.userStore
        .selectOnly((state: any) => state).subscribe(async (data: any) => {
        if (data.user) {
          this.customerId = data.user.customer_id!
          this.getData()
          this.customer = await this.zertipower.customers.getCustomerById(this.customerId)
        }
      })
    )
  }

  getData(lastChangedDate: string | null = null) {
    if (dayjs(this.fromDate).unix() && dayjs(this.toDate).unix()) {
      this.maxDate = null;
      this.minToDate = null;
      if (Math.abs(dayjs(this.toDate).diff(dayjs(this.fromDate), 'days')) > 31) {
        if (lastChangedDate == 'from') {
          this.toDate = dayjs(this.fromDate).add(30, 'days').toDate();
          this.maxDate = dayjs(this.fromDate).add(31, 'days').toDate();
          // this.minToDate = null;
        } else if (lastChangedDate == 'to') {
          this.fromDate = dayjs(this.toDate).subtract(30, 'days').toDate();
          this.minToDate = dayjs(this.toDate).subtract(31, 'days').toDate();
          // this.maxDate = null;
        }

      }
    } else {
      if (lastChangedDate == 'from') {
        this.toDate = null;
        this.maxDate = dayjs(this.fromDate).add(31, 'days').toDate();
        this.defaultDate = this.fromDate;
      } else if (lastChangedDate == 'to') {
        this.fromDate = null;
        this.minToDate = dayjs(this.toDate).subtract(31, 'days').toDate();
        this.defaultDate = this.toDate;
      }
    }


    if (this.fromDate && this.toDate) {
      this.loading = true
      if (this.infoDisplay == 'community') {
        this.getCommunityTradesData();
      } else if (this.infoDisplay == 'customer') {
        this.getCustomerTradesData();
      }
    } else {
      this.tradesData = [];
    }
  }

  async getCustomerTradesData() {
    //console.log(this.fromDate, this.toDate)
    // this.minToDate = dayjs(this.fromDate).toDate();
    this.tradesData = await this.zertipower.trades.getTradesByCustomer(this.customerId, dayjs(this.fromDate).format('YYYY-MM-DD'), dayjs(this.toDate).format('YYYY-MM-DD'))
    //console.log("customer trades data", this.customerTradesData)
    this.totalShared = 0;
    this.tradesData.map((trade) => {
      this.totalShared += Number(trade.tradedKwh)
    })
    this.totalShared = Number(this.totalShared.toFixed(2))
    this.loading = false
  }

  async getCommunityTradesData() {
    //console.log(this.fromDate, this.toDate)
    // this.minToDate = dayjs(this.fromDate).toDate();
    this.tradesData = await this.zertipower.trades.getTradesByCommunity(this.communityId, dayjs(this.fromDate).format('YYYY-MM-DD'), dayjs(this.toDate).format('YYYY-MM-DD'))
    console.log(this.tradesData, 'this.tradesData')
    //console.log("community trades data", this.communityTradesData)
    this.totalShared = 0;
    this.tradesData.map((trade) => {
      if (trade.action == 'BUY') {
        this.totalShared += Number(trade.tradedKwh)
      }
    })
    this.totalShared = Number(this.totalShared.toFixed(2))
    this.loading = false
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }


}
