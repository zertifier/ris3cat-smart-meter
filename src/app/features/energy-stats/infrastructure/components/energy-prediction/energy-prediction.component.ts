import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {EnergyPredictionChartComponent} from "../metereologic-prediction/metereologic-chart/energy-prediction-chart.component";
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";
import {StatsColors} from "../../../domain/StatsColors";
import {EnergyPredictionService} from "../../services/energy-prediction.service";
import dayjs from "dayjs";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {getDayTranslated} from "@shared/utils/DatesUtils";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-energy-prediction',
  standalone: true,
  imports: [
    EnergyPredictionChartComponent,
    TranslocoDirective
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
      color: StatsColors.COMMUNITY_PRODUCTION,
      label: 'Producció',
      data: [1, 2, 3, 4, 5, 6],
    }
  ];
  elements: {
    label: string
    image: string
  }[] = [];
  labels: string [] = [];
  energyPredictionService = inject(EnergyPredictionService);
  userStoreService = inject(UserStoreService);
  productionPrediction: any;

  subscriptions: Subscription[] = [];
  async ngOnInit() {
    this.subscriptions.push(
      this.translocoService.langChanges$.subscribe(async () => {
        this.elements = []
        await this.getPrediction()
      })
    )
  }


  async getPrediction(){
    if (this.community) {
      const communityId = this.userStoreService.snapshotOnly(this.userStoreService.$.communityId);
      this.productionPrediction = await this.energyPredictionService.getCommunityPrediction(communityId);
    } else {
      const cupsId = this.userStoreService.snapshotOnly(this.userStoreService.$.cupsId);
      this.productionPrediction = await this.energyPredictionService.getCupsPrediction(cupsId);
    }

    const dailyPrediction: Map<string, number> = new Map();
    for (const predictionEntry of this.productionPrediction) {
      // const parsedDate = dayjs(predictionEntry.time).format("YYYY-MM-DD");
      console.log(getDayTranslated(this.translocoService, dayjs(predictionEntry.time).day() ))
      // const parsedDate = dayjs(predictionEntry.time).format("dddd DD");
      const parsedDate = `${getDayTranslated(this.translocoService, dayjs(predictionEntry.time).day())} ${dayjs(predictionEntry.time).format("DD")}`;

      const value = dailyPrediction.get(parsedDate) || 0;
      dailyPrediction.set(parsedDate, value + predictionEntry.value);
    }

    this.datasets = [
      {
        color: StatsColors.COMMUNITY_PRODUCTION,
        label: 'Producció',
        data: Array.from(dailyPrediction.values()),
      }
    ];
    this.labels = Array.from(dailyPrediction.keys());
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
