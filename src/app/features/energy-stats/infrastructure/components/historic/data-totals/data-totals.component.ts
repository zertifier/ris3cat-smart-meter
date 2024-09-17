import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {
  QuestionBadgeComponent
} from '../../../../../../shared/infrastructure/components/question-badge/question-badge.component';
import {ChartStoreService} from "@features/energy-stats/infrastructure/services/chart-store.service";
import {DatadisEnergyStat} from "@shared/infrastructure/services/zertipower/DTOs/EnergyStatDTO";
import {Subject, Subscription} from "rxjs";
import {DecimalPipe, NgIf, registerLocaleData} from "@angular/common";
import localeEs from '@angular/common/locales/es';
import {Chart, registerables} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-data-totals',
  standalone: true,
  imports: [
    TranslocoDirective,
    QuestionBadgeComponent,
    DecimalPipe,
    NgIf
  ],
  templateUrl: './data-totals.component.html',
  styleUrl: './data-totals.component.scss'
})


export class DataTotalsComponent implements OnDestroy, AfterViewInit {
  @Input() datasets!: ChartDataset[]
  @Input() cce!: boolean | null
  @Input() showCommunity!: boolean | null
  data!: DatadisEnergyStat[]

  totalProduction = 0
  totalProductionKw = 0
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
    private readonly translocoService: TranslocoService
  ) {
    this.subscriptions.push(
      this.chartStoreService.isLoading$.subscribe((loading: any) => {
        if (!loading)
          this.subscriptions.push(
            this.chartStoreService
              .selectOnly(this.chartStoreService.$.params).subscribe((params: any) => {
              this.resetValues();
              this.data = this.chartStoreService.snapshot().lastFetchedStats
              this.chartDataType = params.selectedChartResource;
              if (this.chartDataType == 'energy') {
                this.chartDataTypeSymbol = 'kWh'
                this.startEnergyCalculate()
              } else if (this.chartDataType == 'price') {
                this.chartDataTypeSymbol = '€'
                this.startPriceCalculate()
              }
              this.loadChart()
            })
          )
      })
    )

  }

  ngAfterViewInit(): void {
    this.loadChart()
  }

  ngOnDestroy(): void {
    this.destroyChart()
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadChart() {
    if (this.chartElement ) {
      console.log({
        totals: this.totalSurplusVirtual,
        surplus: this.totalSurplus,
      })

      const sharedPercentage = 100 - (this.totalSurplus ? (this.totalSurplusVirtual * 100) / this.totalSurplus : 100)
      console.log({sharedPercentage})
      // if (!this.totalSurplus && !sharedPercentage) {
      //   this.displayChart = false
      //   return
      // }
      console.log({datasets: this.datasets})

      this.setChartData(sharedPercentage)
      this.destroyChart()

      this.chart = new Chart(this.chartElement.nativeElement, this.chartData);
    }
  }

  startEnergyCalculate() {
    if (this.data) {
      this.data.forEach((data) => {
        this.setEnergyTotals(data)
      })

      this.totalCo2 = this.totalProductionKw * 0.00026

    }
    //this.cdr.detectChanges(); // removes console error
  }

  setEnergyTotals(data: any) {
    // console.log({data})

    if (data.production) this.totalProductionKw += parseFloat(data.production)
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
    this.totalCo2 = this.totalProductionKw * 0.00026
    //this.cdr.detectChanges(); // removes console error
  }

  setPriceTotals(data: any) {
    if (data.production) this.totalProductionKw += Number(data.production)
    if (data.production) this.totalProduction += (Number(data.production) * Number(data.kwhInPrice))
    if (data.productionActives) this.totalActiveProduction += (Number(data.productionActives) * Number(data.kwhInPrice))
    if (data.kwhIn) this.totalConsumption += (Number(data.kwhIn) * Number(data.kwhInPrice))
    if (data.kwhInVirtual) this.totalConsumptionVirtual += (Number(data.kwhInVirtual) * Number(data.kwhInPrice))
    if (data.kwhOut) this.totalSurplus += (Number(data.kwhOut) * Number(data.kwhOutPrice))
    if (data.kwhOutVirtual) this.totalSurplusVirtual += (Number(data.kwhOutVirtual) * Number(data.kwhOutPriceCommunity))
  }

  setChartData(sharedPercentage: number) {
    this.chartData = {
      type: 'doughnut',
      options: {
        cutout: 80,
        rotation: -90,
        circumference: 180,
        responsive: true,
        aspectRatio: 1.4,
        layout: {
          padding: {
            top: 0,
            bottom: 0,
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            // maxHeight: 20,
            labels: {
              padding: 15,
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              size: 14
            },
            align: 'center',
            formatter: (value: string) => {
              if (value == '0' || value == '0.0' || value == '0.00') return ``
              return value + '%';
            }
          },
          tooltip: {
            callbacks: {
              label:  ((tooltipItem: any)=> `${tooltipItem.raw}%`)
            }
          }
        },

      },
      data: {
        labels: [
          this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.shared'),
          this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.notShared')],
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
      },
      plugins: [ChartDataLabels]
    }
  }

  roundPriceTotals() {
    this.totalProduction = Number(this.totalProduction.toFixed(2))
    this.totalActiveProduction = Number(this.totalActiveProduction.toFixed(2))
    this.totalConsumption = Number(this.totalConsumption.toFixed(2))
    this.totalSurplus = Number(this.totalSurplus.toFixed(2))
  }

  resetValues() {
    this.totalProductionKw = 0
    this.totalProduction = 0
    this.totalActiveProduction = 0
    this.totalConsumption = 0
    this.totalSurplus = 0
    this.totalCo2 = 0
    this.totalConsumptionVirtual = 0
    this.totalSurplusVirtual = 0
  }

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

}
