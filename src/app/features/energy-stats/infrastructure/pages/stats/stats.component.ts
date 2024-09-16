import {Component, OnDestroy} from '@angular/core';
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {
  RankingConsumption, RankingSurplus
} from "@shared/infrastructure/services/zertipower/energy-hourly/ZertipowerEnergyHourlyService";
import {UserStoreService} from "../../../../user/infrastructure/services/user-store.service";
import dayjs from "dayjs";
import {Subscription} from "rxjs";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {TextShorterPipe} from "@shared/infrastructure/pipes/wallet-address-shortener.pipe";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    TextShorterPipe,
    CalendarModule,
    FormsModule
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnDestroy{

  rankingData!: RankingConsumption[] | RankingSurplus[] | any
  communityId!: number;
  customerId!: number;
  userName: string = ''
  loading = true
  dataType: 'consumption' | 'surplus' = "surplus"

  date: Date = dayjs().toDate();
  maxDate: Date = dayjs().toDate();

  subscriptions: Subscription[] = [];
  constructor(
    private readonly zertipower: ZertipowerService,
    private userStore: UserStoreService,
    ) {


    this.subscriptions.push(
      this.userStore.selectOnly(this.userStore.$.communityId).subscribe((community) => {
        this.communityId = community
        if (this.communityId)
          this.getData(this.dataType)
      }),
      this.userStore
        .selectOnly(state => state).subscribe((data) => {
        if (data.user) {
          this.userName = (data.user.firstname + " " + data.user.lastname)
          this.customerId = data.user.customer_id!;
        }
      })
    )
  }


  getData(dataType: 'consumption' | 'surplus'){
    switch (dataType){
      case "consumption": this.getConsumptionData()
        break
      case "surplus": this.getSurplusData()
        break
      default: this.getSurplusData()
    }
  }

  async getConsumptionData(){
    const currentDateMonth = dayjs(this.date).format('YYYY-MM')
    this.rankingData = await this.zertipower.energyHourly.getRankingConsumption(this.communityId, currentDateMonth)
    this.loading = false
  }

  async getSurplusData(){
    const currentDateMonth = dayjs(this.date).format('YYYY-MM')
    this.rankingData = await this.zertipower.energyHourly.getRankingSurplus(this.communityId, currentDateMonth)
    this.loading = false
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
