import { Component } from '@angular/core';
import {MetereologicChartComponent} from "./metereologic-chart/metereologic-chart.component";

@Component({
  selector: 'app-metereologic-prediction',
  standalone: true,
  imports: [
    MetereologicChartComponent
  ],
  templateUrl: './metereologic-prediction.component.html',
  styleUrl: './metereologic-prediction.component.scss'
})
export class MetereologicPredictionComponent {
  elements: {
    label: string
    image: string
  }[] = [
    {
      label: 'Dilluns',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
    {
      label: 'Dimarts',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
    {
      label: 'Dimecres',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
    {
      label: 'Dijous',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
    {
      label: 'Divendres',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
    {
      label: 'Dissabte',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
    {
      label: 'Diumenge',
      image: 'https://cdn-icons-png.flaticon.com/512/1146/1146795.png',
    },
  ];
}
