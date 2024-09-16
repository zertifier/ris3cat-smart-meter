import {Component, inject, LOCALE_ID, OnInit} from '@angular/core';
import {EnergyPredictionChartComponent} from "./metereologic-chart/energy-prediction-chart.component";
import {WeatherPredictionService} from "../../services/weather-prediction.service";
import {DatePipe, registerLocaleData} from "@angular/common";
import localeCa from '@angular/common/locales/ca';

@Component({
  selector: 'app-metereologic-prediction',
  standalone: true,
  imports: [
    EnergyPredictionChartComponent,
    DatePipe
  ],
  providers: [{provide: LOCALE_ID, useValue: 'ca-ES'}],
  templateUrl: './metereologic-prediction.component.html',
  styleUrl: './metereologic-prediction.component.scss'
})

export class MetereologicPredictionComponent implements OnInit {
  constructor() {
    // Register the Catalan locale data
    registerLocaleData(localeCa);
  }
  weatherPredictionService = inject(WeatherPredictionService)
  elements: {
    label: string
    image: string
  }[] = [];

  async ngOnInit() {
    const prediction = await this.weatherPredictionService.getPrediction();

    for (const [day, weather] of prediction) {
      this.elements.push({
        label: day,
        image: `/assets/img/weather/${weather.icon}.png`
      });
    }
  }
}
