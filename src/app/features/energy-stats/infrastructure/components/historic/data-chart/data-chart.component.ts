import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ChartModule} from "primeng/chart";
import {Subscription} from "rxjs";
import {ChartStoreService} from "../../../services/chart-store.service";
import {ChartResource} from "../../../../domain/ChartResource";
import {ChartLegendComponent} from "../chart-legend/chart-legend.component";
import {Chart} from "chart.js";
import {ChartEntity} from "../../../../domain/ChartEntity";
import {AsyncPipe, NgIf} from "@angular/common";
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";

@Component({
  selector: 'app-data-chart',
  standalone: true,
  imports: [
    ChartModule,
    ChartLegendComponent,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './data-chart.component.html',
  styleUrl: './data-chart.component.scss'
})
export class DataChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  data!: {
    datasets: any[],
    labels: string[]
  };
  @Input({required: true}) dataset: ChartDataset[] = [];
  @Input({required: true}) labels: string[] = [];
  @ViewChild('chart') chartElement!: ElementRef;
  private chart!: Chart;
  private subscriptions: Subscription[] = [];

  private textColorSecondary = 'rgba(0, 0, 0, 0.54)';
  private surfaceBorder = 'rgba(0, 0, 0, 0.12)';

  private options: any = {
    maintainAspectRatio: false,
    indexAxis: 'x',
    aspectRatio: 0.8,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: this.textColorSecondary,
          font: {
            weight: 500
          }
        },
        grid: {
          color: this.surfaceBorder,
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        min: 0,
        ticks: {
          callback: (value: never) => {
            const state = this.chartStoreService.snapshot();
            const label = state.selectedChartResource === ChartResource.ENERGY ? 'kWh' : '€'
            return `${value} ${label}`;
          },
          color: this.textColorSecondary
        },
        grid: {
          color: this.surfaceBorder,
        }
      }
    },
    interaction: {
      intersect: true,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const {label} = context.dataset;
            let {formattedValue} = context;
            const chartEntity = this.chartStoreService.snapshotOnly(state => state);

            // To show the bars on the same stack and overlying them (like a z-index) some adjustments need to be made
            // chartjs don't allow to make something similar to z-index. When two bars are on the same stack there
            // are one above the other. The values are "summed" the top bar don't start at 0 start at the end of the
            // previous bar this can confuse the user. To solve this the end bar value is calculated by this way:
            // take the original value and rest the previous bar value. When the bars are displayed they seem to be one
            // after the another. ej.
            //
            // production = production - productionActives.
            //
            // The problem comes when it's necessary to display the tooltip. It has to show the correct values.
            if (context.dataset.label === "Producció" && chartEntity.selectedChartEntity === ChartEntity.COMMUNITIES) {
              const value = context.raw;
              const register = this.chartStoreService.snapshot().lastFetchedStats[context.dataIndex];
              // Here the correct production es being calculated to show the correct value on tooltip
              // production = production + productionActives
              const total = parseFloat(register.productionActives + '') + value;
              formattedValue = total.toLocaleString();
            }

            if (context.dataset.label === "Consum" && chartEntity.selectedChartEntity === ChartEntity.CUPS) {
              const showEnergy = this.chartStoreService.snapshot().selectedChartResource === ChartResource.ENERGY;
              const register = this.chartStoreService.snapshot().lastFetchedStats[context.dataIndex];
              const consumption = showEnergy ? register.kwhIn : +(register.kwhInPrice * register.kwhIn).toFixed(2);
              formattedValue = consumption.toLocaleString();
            }

            const unit = chartEntity.selectedChartResource === ChartResource.ENERGY ? 'kWh' : '€'
            const labels: string[] = [`${label}: ${formattedValue} ${unit}`];

            if (chartEntity.selectedChartEntity === ChartEntity.COMMUNITIES) {
              const stat = this.chartStoreService.snapshot().lastFetchedStats[context.dataIndex];
              if (context.dataset.label === "Excedent actius") {
                labels.push(`Membres actius: ${stat.activeMembers}`);
                labels.push(`----------------`);

              } else if (context.dataset.label === "Producció") {
                for (const cups of stat.communitiesCups) {
                  if (cups.kwhOut > 0)
                    labels.push(`${cups.reference || cups.cups} : ${cups.kwhOut || 0} KWh`)
                }
                // Todo: change 31 to the real number
                labels.push(`Total membres: 31`);
              }
            }
            return labels;
          }
        }
      }
    }
  };

  constructor(
    private chartStoreService: ChartStoreService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataset = (changes as any).dataset.currentValue;
    this.labels = (changes as any).labels.currentValue;

    this.parseInput();
    this.refreshChart();
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartElement.nativeElement, {
      type: 'bar',
      data: this.data,
      options: this.options,
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 990) {
      this.changeToMobile();
    } else {
      this.changeToDesktop();
    }
  }

  public toggleDataset(index: number) {
    if (!this.chart) {
      return;
    }
    const visible = this.getDatasetVisibility(index);
    this.setDatasetVisible(index, !visible);
  }

  public setDatasetVisible(index: number, visible: boolean) {
    if (!this.chart) {
      return;
    }
    this.chart.setDatasetVisibility(index, visible);
    this.chart.update();
  }

  public getDatasetVisibility(index: number): boolean {
    return this.chart.isDatasetVisible(index);
  }

  public refreshChart() {
    if (!this.chart) {
      return;
    }

    this.chart.options = this.options;
    this.chart.data = this.data;
    this.chart.update();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private changeToDesktop() {
    const state = this.chartStoreService.snapshot();
    this.options = {
      ...this.options,
      maintainAspectRatio: false,
      indexAxis: 'x',
      aspectRatio: 0.8,
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: this.textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: this.surfaceBorder,
          }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          min: 0,
          ticks: {
            callback: function (value: never) {
              const label = state.selectedChartResource === ChartResource.ENERGY ? 'kWh' : '€'
              return `${value} ${label}`;
            },
            color: this.textColorSecondary
          },
          grid: {
            color: this.surfaceBorder,
          }
        }
      }
    }

    this.refreshChart();
  }

  private changeToMobile() {
    const state = this.chartStoreService.snapshot();
    this.options = {
      ...this.options,
      maintainAspectRatio: false,
      aspectRatio: 0.5,
      indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          min: 0,
          ticks: {
            color: this.textColorSecondary,
            font: {
              weight: 500
            },
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          stacked: true,
          ticks: {
            callback: function (value: never) {
              const label = state.selectedChartResource === ChartResource.ENERGY ? 'kWh' : '€'
              return `${value} ${label}`;
            },
            color: this.textColorSecondary
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false
          }
        }
      }
    }

    this.refreshChart();
  }

  private parseInput() {
    const datasets: any[] = [];
    for (const entry of this.dataset) {
      datasets.push({
        label: entry.label,
        backgroundColor: entry.color,
        borderRadius: 10,
        borderWidth: 1,
        data: entry.data,
        stack: entry.stack,
        grouped: true,
        order: entry.order,
      });
    }

    this.data = {
      labels: this.labels,
      datasets,
    }

    this.subscriptions.push(
      this.chartStoreService.selectOnly(this.chartStoreService.$.params).subscribe(() => {
        if (window.innerWidth <= 990) {
          this.changeToMobile();
        } else {
          this.changeToDesktop();
        }
      })
    );
  }
}
