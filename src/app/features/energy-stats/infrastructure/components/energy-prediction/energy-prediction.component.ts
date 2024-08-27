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
import {NgIf} from "@angular/common";

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

  consumptionPrediction: {date:string,value:number}[] = [];
  productionPrediction: {date:string,value:number}[] = [];
  surplusPrediction: {date:string,value:number}[] = [];

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
    let weekEnd = moment().add(5, 'days').format('YYYY-MM-DD')
    let productionPredictionResponse;
    let consumptionPredictionResponse;

    if (this.community) {
      const communityId = this.userStoreService.snapshotOnly(this.userStoreService.$.communityId);
      productionPredictionResponse = await this.energyPredictionService.getCommunityPrediction(communityId);
      consumptionPredictionResponse = await this.energyPredictionService.getCommunityConsumptionPrediction(communityId, weekInit, weekEnd)
    } else {
      const cupsId = this.userStoreService.snapshotOnly(this.userStoreService.$.cupsId);
      productionPredictionResponse = await this.energyPredictionService.getCupsPrediction(cupsId);
      consumptionPredictionResponse = await this.energyPredictionService.getCommunityConsumptionPrediction(cupsId, weekInit, weekEnd)
    }

    this.consumptionPrediction = consumptionPredictionResponse.map((consumptionPredictionDay: any, index: number) => {
      consumptionPredictionDay.date = moment(consumptionPredictionDay.date, 'YYYY-MM-DD').format('dddd')
      let value = consumptionPredictionDay.consumption
      return { date: consumptionPredictionDay.date, value }
    })

    const dailyPrediction: Map<string, number> = new Map();
    for (const predictionEntry of productionPredictionResponse) {
      // const parsedDate = dayjs(predictionEntry.time).format("YYYY-MM-DD");
      // const parsedDate = dayjs(predictionEntry.time).format("dddd DD");
      //const parsedDate = `${getDayTranslated(this.translocoService, dayjs.utc(predictionEntry.time).day())} ${dayjs.utc(predictionEntry.time).format("DD")}`;
      const parsedDate = moment(predictionEntry.time).format('dddd');
      const value = dailyPrediction.get(parsedDate) || 0;
      dailyPrediction.set(parsedDate, value + predictionEntry.value);
    }

    const productionPredictionArray: Array<{ date: string, value: number }> = Array.from(
      dailyPrediction,
      ([date, value]) => ({date, value: value})
    );

    this.datasets = [
      {
        id: "production",
        color: StatsColors.COMMUNITY_PRODUCTION,
        label: 'Producció',
        data: Array.from(dailyPrediction.values()),
        // productionPredictionArray.map((production, index) => {
        //   if (production && production.value && (production.date == this.consumptionPrediction[index].date)) {
        //     this.productionPrediction.push(production);
        //     let surplusPrediction = production.value - this.consumptionPrediction[index].value;
        //     if (surplusPrediction > 0) {
        //       this.surplusPrediction.push({date:production.date,value:surplusPrediction})
        //     } else {
        //       this.surplusPrediction.push({date:production.date,value:0})
        //     }
        //   } else {
        //     this.productionPrediction.push({date:production.date,value:-1})
    //     this.surplusPrediction.push({date:production.date,value:-1})
    //   }
    // })
        }]

    this.consumptionPrediction.map((consumption, index) => {
      if (productionPredictionArray[index] && productionPredictionArray[index].value
        && (productionPredictionArray[index].date == this.consumptionPrediction[index].date)) {
          productionPredictionArray[index].value = Number(productionPredictionArray[index].value.toFixed(2))
        this.productionPrediction.push(productionPredictionArray[index]);
        let surplusPrediction = productionPredictionArray[index].value - this.consumptionPrediction[index].value;
        if (surplusPrediction > 0) {
          this.surplusPrediction.push({date:consumption.date,value:surplusPrediction})
        } else {
          this.surplusPrediction.push({date:consumption.date,value:0})
        }
      } else {
        this.productionPrediction.push({date:consumption.date,value:-1})
        this.surplusPrediction.push({date:consumption.date,value:-1})
      }
    })

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
