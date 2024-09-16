import {Component, inject, OnDestroy,} from '@angular/core';
import {EnergyPredictionChartComponent} from "./metereologic-chart/energy-prediction-chart.component";
import {WeatherPredictionService} from "../../services/weather-prediction.service";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";


import {Subscription} from "rxjs";
import dayjs from "@shared/utils/dayjs";
import {getDayTranslated} from "@shared/utils/DatesUtils";

@Component({
  selector: 'app-metereologic-prediction',
  standalone: true,
  imports: [
    EnergyPredictionChartComponent,
    TranslocoDirective
  ],
  // providers: [{provide: LOCALE_ID, useValue: 'ca'}],
  templateUrl: './metereologic-prediction.component.html',
  styleUrl: './metereologic-prediction.component.scss'
})

export class MetereologicPredictionComponent implements OnDestroy {
  constructor(
    private translocoService: TranslocoService,
  ) {
    this.subscriptions.push(
      this.translocoService.langChanges$.subscribe(async () => {
        this.elements = []
        await this.loadWeather()
      })
    )
  }

  weatherPredictionService = inject(WeatherPredictionService)
  elements: {
    label: string
    image: string
    formattedDate: string
  }[] = [];
  subscriptions: Subscription[] = [];


getDate(day: string){
  return `${getDayTranslated(this.translocoService, dayjs(day).day())} ${dayjs(day).format('DD/MM')}`
}
  async loadWeather(){
    const prediction = await this.weatherPredictionService.getPrediction();

    for (const [day, weather] of prediction) {
      this.elements.push({
        label: day,
        image: `/assets/img/weather/${weather.icon}.png`,
        formattedDate: this.getDate(day)
      });
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
