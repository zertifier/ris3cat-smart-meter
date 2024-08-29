import { Component, inject, Input, makeEnvironmentProviders, OnDestroy, OnInit } from '@angular/core';
import { EnergyPredictionChartComponent } from "../metereologic-prediction/metereologic-chart/energy-prediction-chart.component";
import { ChartDataset } from "@shared/infrastructure/interfaces/ChartDataset";
import { StatsColors } from "../../../domain/StatsColors";
import { EnergyPredictionService } from "../../services/energy-prediction.service";
import dayjs from "dayjs";
import { UserStoreService } from "@features/user/infrastructure/services/user-store.service";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { getDayTranslated } from "@shared/utils/DatesUtils";
import { Subscription } from "rxjs";
import moment from 'moment';
import 'moment/locale/ca';
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-energy-prediction',
  standalone: true,
  imports: [
    EnergyPredictionChartComponent,
    TranslocoDirective,
    NgIf
  ],
  templateUrl: './energy-prediction.component.html',
  styleUrl: './energy-prediction.component.scss'
})
export class EnergyPredictionComponent implements OnInit, OnDestroy {
  constructor(private translocoService: TranslocoService) {
  }
  @Input() community: boolean = true;
  datasets: ChartDataset[] = [
    {
      id: "production",
      color: StatsColors.COMMUNITY_PRODUCTION,
      label: 'Producció',
      data: [1, 2, 3, 4, 5, 6],
    }
  ];
  elements: {
    label: string
    image: string
  }[] = [];
  labels: string[] = [];
  energyPredictionService = inject(EnergyPredictionService);
  userStoreService = inject(UserStoreService);

  consumptionPrediction: { date: string, value: number }[] = [];
  productionPrediction: { date: string, value: number }[] = [];
  surplusPrediction: { date: string, value: number }[] = [];

  subscriptions: Subscription[] = [];
  async ngOnInit() {
    moment.locale('ca');
    this.subscriptions.push(
      this.translocoService.langChanges$.subscribe(async () => {
        this.elements = []
        await this.getPrediction()
      })
    )
  }

  async getPrediction() {

    let weekInit = moment().format('YYYY-MM-DD')
    let weekEnd = moment().add(6, 'days').format('YYYY-MM-DD')
    let productionPredictionResponse: any[];
    let consumptionPredictionResponse: any[];

    if (this.community) {
      const communityId = this.userStoreService.snapshotOnly(this.userStoreService.$.communityId);
      productionPredictionResponse = await this.energyPredictionService.getCommunityPrediction(communityId).catch(error=>{return []});
      consumptionPredictionResponse = await this.energyPredictionService.getCommunityConsumptionPrediction(communityId, weekInit, weekEnd).catch(error=>{return []})
    } else {
      const cupsId = this.userStoreService.snapshotOnly(this.userStoreService.$.cupsId);
      productionPredictionResponse = await this.energyPredictionService.getCupsPrediction(cupsId).catch(error=>{return []});
      consumptionPredictionResponse = await this.energyPredictionService.getCupsConsumptionPrediction(cupsId, weekInit, weekEnd).catch(error=>{return []})
    }

    let productionPredictionArray: Array<{ date: string, value: number }> = [];

    //format production if exist
    if (productionPredictionResponse) {
      const dailyPrediction: Map<string, number> = new Map();
      for (const predictionEntry of productionPredictionResponse) {
        const parsedDate = moment(predictionEntry.time).format('dddd');
        const value = dailyPrediction.get(parsedDate) || 0;
        dailyPrediction.set(parsedDate, value + predictionEntry.value);
      }
      this.productionPrediction = Array.from(
        dailyPrediction,
        ([date, value]) => ({ date, value: Number(value.toFixed(2)) })
      );
    }

    //format consumption if exist
    if (!consumptionPredictionResponse) {
      consumptionPredictionResponse = []
      this.consumptionPrediction = consumptionPredictionResponse.map((consumptionPredictionDay: any, index: number) => {
        consumptionPredictionDay.date = moment(consumptionPredictionDay.date, 'YYYY-MM-DD').format('dddd')
        let value = Number(consumptionPredictionDay.consumption.toFixed(2))
        return { date: consumptionPredictionDay.date, value }
      })
    }

    let index = 0;

    //insert non existent data (surplus included):
    for (let i = moment(weekInit); i.isBefore(moment(weekEnd)); i.add(1, 'days')) {

      console.log(i.format('YYYY-MM-DD'));
      let weekDay = moment(i, 'YYYY-MM-DD').format('dddd')

      if (!this.consumptionPrediction[index]) {
        let consumption = { date: weekDay, value: -1 }
        this.consumptionPrediction.push(consumption);
      }

      if (!this.productionPrediction[index]) {
        this.productionPrediction.push({ date: weekDay, value: -1 })
      }

      if (this.productionPrediction[index].value == -1 || this.consumptionPrediction[index].value == -1) {
        this.surplusPrediction.push({ date: weekDay, value: -1 })
      } else {
        let surplusPredictionValue = this.productionPrediction[index].value - this.consumptionPrediction[index].value;
        if (surplusPredictionValue > 0) {
          this.surplusPrediction.push({ date: weekDay, value: surplusPredictionValue })
        } else {
          this.surplusPrediction.push({ date: weekDay, value: 0 })
        }
      }
      index++;
    }

    console.log("this.productionPrediction,this.consumptionPrediction,this.surplusPrediction",this.productionPrediction,this.consumptionPrediction,this.surplusPrediction)

    // if (consumptionPredictionResponse) {

    //   this.consumptionPrediction = consumptionPredictionResponse.map((consumptionPredictionDay: any, index: number) => {
    //     consumptionPredictionDay.date = moment(consumptionPredictionDay.date, 'YYYY-MM-DD').format('dddd')
    //     let value = consumptionPredictionDay.consumption
    //     return { date: consumptionPredictionDay.date, value }
    //   })

    //   this.consumptionPrediction.map((consumption, index) => {
    //     if (productionPredictionArray[index] && productionPredictionArray[index].value
    //       && (productionPredictionArray[index].date == this.consumptionPrediction[index].date)) {
    //       productionPredictionArray[index].value = Number(productionPredictionArray[index].value.toFixed(2))
    //       this.productionPrediction.push(productionPredictionArray[index]);
    //       let surplusPrediction = productionPredictionArray[index].value - this.consumptionPrediction[index].value;
    //       if (surplusPrediction > 0) {
    //         this.surplusPrediction.push({ date: consumption.date, value: surplusPrediction })
    //       } else {
    //         this.surplusPrediction.push({ date: consumption.date, value: 0 })
    //       }
    //     } else {
    //       this.productionPrediction.push({ date: consumption.date, value: -1 })
    //       this.surplusPrediction.push({ date: consumption.date, value: -1 })
    //     }
    //   })

    // } else {

    //   productionPredictionArray.map((productionPredictionElement: any) => {

    //     if (!productionPredictionElement.value) {
    //       productionPredictionElement.value = -1;
    //     } else {
    //       productionPredictionElement.value = productionPredictionElement.value.toFixed(2)
    //     }
    //     this.productionPrediction.push(productionPredictionElement)
    //   });

    // }

    // this.datasets = [
    //   {
    //     color: StatsColors.COMMUNITY_PRODUCTION,
    //     label: 'Producció',
    //     data: Array.from(dailyPrediction.values()),
    //   }
    // ];
    // this.labels = Array.from(dailyPrediction.keys());
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
