import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {Chart} from "chart.js";
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";

@Component({
  selector: 'app-energy-prediction-chart',
  standalone: true,
  imports: [],
  templateUrl: './energy-prediction-chart.component.html',
  styleUrl: './energy-prediction-chart.component.scss'
})
export class EnergyPredictionChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('chartCanvas') canvas!: ElementRef;
  chart!: Chart<"bar", unknown[], string>;

  @Input() dataset: ChartDataset[] = [];
  @Input({required: true}) labels!: string[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels']) {
      this.labels = changes['labels'].currentValue as string[];
    }
    if (changes['dataset']) {
      this.dataset = changes['dataset'].currentValue as ChartDataset[];
    }

    this.initChart(this.labels, this.dataset);
  }

  initChart(labels: string[], dataset: ChartDataset[]) {
    if (!this.canvas) {
      return;
    }
    if (this.chart) {
      this.chart.destroy()
    }
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataset.map(d => {
          return {
            data: d.data,
            label: d.label,
            backgroundColor: d.color,
            order: d.order,
            stack: d.stack,
            borderRadius: 10,
            borderWidth: 1,
          }
        })
      },
      options: {
        aspectRatio: 1,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (tickValue) => {
                return `${tickValue} kWh`
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initChart(this.labels, this.dataset);
  }
}
