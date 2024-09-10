import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";
import {TranslocoDirective} from "@jsverse/transloco";
import {
  QuestionBadgeComponent
} from '../../../../../../shared/infrastructure/components/question-badge/question-badge.component';
import {ChartStoreService} from "@features/energy-stats/infrastructure/services/chart-store.service";
import {DatadisEnergyStat} from "@shared/infrastructure/services/zertipower/DTOs/EnergyStatDTO";
import {Subject, Subscription} from "rxjs";
import {DecimalPipe, registerLocaleData} from "@angular/common";
import localeEs from '@angular/common/locales/es';
import {Chart} from "chart.js";
import {StatsColors} from "@features/energy-stats/domain/StatsColors";

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-data-totals',
  standalone: true,
  imports: [
    TranslocoDirective,
    QuestionBadgeComponent,
    DecimalPipe
  ],
  templateUrl: './data-totals.component.html',
  styleUrl: './data-totals.component.scss'
})


export class DataTotalsComponent implements OnDestroy, AfterViewInit {
  @Input() datasets!: ChartDataset[]
  data!: DatadisEnergyStat[]

  totalProduction = 0
  totalActiveProduction = 0
  totalConsumption = 0
  totalSurplus = 0
  totalConsumptionVirtual = 0
  totalSurplusVirtual = 0
  totalCo2 = 0
  chartDataType!: any;
  chartDataTypeSymbol: 'kWh' | '€' = 'kWh'

  subscriptions: Subscription[] = []

  chartData!: any;

  private chart!: Chart | any;

  @ViewChild('chart') chartElement!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly chartStoreService: ChartStoreService,
  ) {

    this.subscriptions.push(
      this.chartStoreService.isLoading$.subscribe((loading) => {
        if (!loading)
          this.subscriptions.push(
            this.chartStoreService
              .selectOnly(this.chartStoreService.$.params).subscribe((params) => {
              this.resetValues();
              console.log(this.chartStoreService.snapshot().lastFetchedStats, "this.chartStoreService.snapshot().lastFetchedStats")
              this.data = this.chartStoreService.snapshot().lastFetchedStats
              this.chartDataType = params.selectedChartResource;
              if (this.chartDataType == 'energy') {
                this.chartDataTypeSymbol = 'kWh'
                this.startEnergyCalculate()
              } else if (this.chartDataType == 'price') {
                this.chartDataTypeSymbol = '€'
                this.startPriceCalculate()
              }
            })
          )
      })
    )

  }

  ngAfterViewInit(): void {
    // let percentage = this.totalSurplus
    this.loadChart()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadChart() {
    if (this.chartElement.nativeElement && this.totalSurplus && this.totalConsumption) {
      const sharedPercentage = ((this.totalSurplusVirtual + this.totalConsumptionVirtual) * 100) / (this.totalConsumption + this.totalSurplus)
      console.log((this.totalSurplusVirtual + this.totalConsumptionVirtual) * 100, "VIRTUAL")
      console.log((this.totalConsumption + this.totalSurplus), "NORMAL")
      console.log((((this.totalSurplusVirtual + this.totalConsumptionVirtual) * 100) / (this.totalConsumption + this.totalSurplus)).toFixed(2), "RESULT")
      this.setChartData(sharedPercentage)
      this.chart = new Chart(this.chartElement.nativeElement, this.chartData,
      );
    }
  }

  startEnergyCalculate() {
    if (this.data) {
      this.data.forEach((data) => {
        this.setEnergyTotals(data)
      })

      this.totalCo2 = this.totalProduction * 0.00026
      this.loadChart()

    }
    //this.cdr.detectChanges(); // removes console error
  }

  setEnergyTotals(data: any) {
    if (data.production) this.totalProduction += parseFloat(data.production)
    if (data.productionActives) this.totalActiveProduction += parseFloat(data.productionActives)
    if (data.kwhIn) this.totalConsumption += parseFloat(data.kwhIn)
    if (data.kwhOut) this.totalSurplus += parseFloat(data.kwhOut)
    if (data.kwhInVirtual) this.totalConsumptionVirtual += parseFloat(data.kwhInVirtual)
    if (data.kwhOutVirtual) this.totalSurplusVirtual += parseFloat(data.kwhOutVirtual)
  }

  startPriceCalculate() {
    if (this.data)
      for (let data of this.data) {
        this.setPriceTotals(data)
      }
    /*for (let data of this.data) {
      this.setPriceTotals(data)
    }*/
    this.roundPriceTotals();
    this.totalCo2 = this.totalProduction * 0.00026
    //this.cdr.detectChanges(); // removes console error
  }

  setPriceTotals(data: any) {
    if (data.production) this.totalProduction += (Number(data.production) * Number(data.kwhOutPrice))
    if (data.productionActives) this.totalActiveProduction += (Number(data.productionActives) * Number(data.kwhOutPrice))
    if (data.kwhIn) this.totalConsumption += (Number(data.kwhIn) * Number(data.kwhInPrice))
    if (data.kwhOut) this.totalSurplus += (Number(data.kwhOut) * Number(data.kwhOutPrice))
  }

  setChartData(sharedPercentage: number) {
    this.chartData = {
      type: 'doughnut',
      options: {
        cutout: 80,
        rotation: -90,
        circumference: 180,
        responsive: true,
        layout: {
          padding: {
            top: 0,
            bottom: 50,
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
            }
          },
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem: any, data: any) {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              const total = dataset.data.reduce((sum: any, val: any) => sum + val, 0);
              const currentValue = dataset.data[tooltipItem.index];
              const percentage = Math.floor(((currentValue / total) * 100) + 0.5);
              return currentValue + ' (' + percentage + '%)';
            }
          }
        }
      },
      data: {
        labels: ['Compartit', 'No compartit'],
        datasets: [
          {
            data: [sharedPercentage.toFixed(2), (100 - sharedPercentage).toFixed(2)],
            backgroundColor: [
              '#0e2b4c',
              '#5f7187',

            ],
            hoverOffset: 4,
          }
        ]
      }
    }
  }

  roundPriceTotals() {
    this.totalProduction = Number(this.totalProduction.toFixed(2))
    this.totalActiveProduction = Number(this.totalActiveProduction.toFixed(2))
    this.totalConsumption = Number(this.totalConsumption.toFixed(2))
    this.totalSurplus = Number(this.totalSurplus.toFixed(2))
  }

  resetValues() {
    this.totalProduction = 0
    this.totalActiveProduction = 0
    this.totalConsumption = 0
    this.totalSurplus = 0
    this.totalCo2 = 0
  }

}
