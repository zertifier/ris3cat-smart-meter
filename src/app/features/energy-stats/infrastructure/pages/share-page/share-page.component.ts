import { Component, OnDestroy } from '@angular/core';
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharingUsersService } from "../../services/sharing-users.service";
import { MonitoringService } from "../../services/monitoring.service";
import { NavbarComponent } from "../../../../../shared/infrastructure/components/navbar/navbar.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CalendarModule } from "primeng/calendar";
import dayjs from "dayjs";
import { CommonModule, DatePipe, DecimalPipe, NgForOf, NgIf } from "@angular/common";
import { QuestionBadgeComponent } from "@shared/infrastructure/components/question-badge/question-badge.component";
import { ZertipowerService } from "@shared/infrastructure/services/zertipower/zertipower.service";
import { TradeInterface } from "@shared/infrastructure/services/zertipower/trades/ZertipowerTradesService";
import { NoRoundDecimalPipe } from "@shared/infrastructure/pipes/no-round-decimal.pipe";
import { Subscription } from "rxjs";
import { UserStoreService } from "@features/user/infrastructure/services/user-store.service";
import { CommunityResponse } from '../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService';
import { TextShorterPipe } from '../../../../../shared/infrastructure/pipes/wallet-address-shortener.pipe';


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
    TextShorterPipe
  ],
  providers: [
    MonitoringService,
  ],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.scss'
})
export class SharePageComponent implements OnDestroy {

  fromDate: Date = dayjs().subtract(30, 'days').toDate();
  toDate: Date = dayjs().toDate();
  maxDate: Date = dayjs().toDate();
  minToDate: Date = dayjs().subtract(30).toDate();

  loading: boolean = false;

  customerTradesData!: TradeInterface[]
  communityTradesData!: TradeInterface[]
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

  totalShared:number=0;


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
            this.getCustomerTradesData()
            this.customer = await this.zertipower.customers.getCustomerById(this.customerId)
          }
        })
    )
  }

  getData() {
    if (this.infoDisplay == 'community') {
      this.getCommunityTradesData();
    } else if (this.infoDisplay == 'customer') {
      this.getCustomerTradesData();
    }
  }

  async getCustomerTradesData() {
    //console.log(this.fromDate, this.toDate)
    this.minToDate = dayjs(this.fromDate).toDate();
    this.customerTradesData = await this.zertipower.trades.getTradesByCustomer(this.customerId, dayjs(this.fromDate).format('YYYY-MM-DD'), dayjs(this.toDate).format('YYYY-MM-DD'))
    //console.log("customer trades data", this.customerTradesData)
    this.totalShared = 0;
    this.customerTradesData.map((trade)=>{this.totalShared += Number(trade.tradedKwh)})
    this.totalShared = Number(this.totalShared.toFixed(2))
  }

  async getCommunityTradesData() {
    //console.log(this.fromDate, this.toDate)
    this.minToDate = dayjs(this.fromDate).toDate();
    this.communityTradesData = await this.zertipower.trades.getTradesByCommunity(this.communityId, dayjs(this.fromDate).format('YYYY-MM-DD'), dayjs(this.toDate).format('YYYY-MM-DD'))
    //console.log("community trades data", this.communityTradesData)
    this.totalShared = 0;
    this.communityTradesData.map((trade)=>{if(trade.action=='BUY'){this.totalShared += Number(trade.tradedKwh)}})
    this.totalShared = Number(this.totalShared.toFixed(2))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
