import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy} from '@angular/core';
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


export class DataTotalsComponent implements OnDestroy {
  @Input() datasets!: ChartDataset[]
  data!: DatadisEnergyStat[]

  totalProduction = 0
  totalActiveProduction = 0
  totalConsumption = 0
  totalSurplus = 0
  totalCo2 = 0
  chartStoreServiceSubcription!: Subscription;
  chartDataType!: any;
  chartDataTypeSymbol: 'kWh' | '€' = 'kWh'

  subscriptions: Subscription[] = []

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly chartStoreService: ChartStoreService,
  ) {

    this.subscriptions.push(
      this.chartStoreService.isLoading$.subscribe((loading) => {
        /*console.log(this.chartStoreService.snapshot().lastFetchedStats, "LOADING")
        this.data = this.chartStoreService.snapshot().lastFetchedStats
        this.resetValues();

        this.startEnergyCalculate()*/
        if (!loading)
          this.subscriptions.push(
            this.chartStoreService
              .selectOnly(this.chartStoreService.$.params).subscribe((params) => {
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
            })
          )
      })
    )
    /*this.subscriptions.push(
      this.chartStoreService
        .selectOnly(this.chartStoreService.$.params).subscribe((params) => {
        console.log(params, "pARAMS")
        this.resetValues();
        this.data = this.chartStoreService.snapshot().lastFetchedStats
        console.log(this.data)
        this.chartDataType = params.selectedChartResource;
        if (this.chartDataType == 'energy') {
          this.chartDataTypeSymbol = 'kWh'
          this.startEnergyCalculate()
        } else if (this.chartDataType == 'price') {
          this.chartDataTypeSymbol = '€'
          this.startPriceCalculate()
        }
      })
    )*/
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  /*  setVariables(data: any[], type: 'networkActiveConsumption' | 'production' | 'productionActive' | 'surplusActive'){
      for (const register of data)
        if (register)
          switch (type){
            case "production": this.totalProduction += parseInt(register.toString())
              break
            case "productionActive": this.totalActiveProduction += parseInt(register.toString())
              break
            case "networkActiveConsumption": this.totalConsumption += parseInt(register.toString())
              break
            case "surplusActive": this.totalSurplus += parseInt(register.toString())
              break
          }
    }*/

  startEnergyCalculate() {

    if (this.data)
      this.data.forEach((data) => {
        this.setEnergyTotals(data)
      })

    this.totalCo2 = this.totalProduction * 0.00026

    //this.cdr.detectChanges(); // removes console error
  }

  setEnergyTotals(data: any) {
    if (data.production) this.totalProduction += parseFloat(data.production)
    if (data.productionActives) this.totalActiveProduction += parseFloat(data.productionActives)
    if (data.kwhIn) this.totalConsumption += parseFloat(data.kwhIn)
    if (data.kwhOut) this.totalSurplus += parseFloat(data.kwhOut)
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
