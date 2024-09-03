import {AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";
import {TranslocoDirective} from "@jsverse/transloco";
import { QuestionBadgeComponent } from '../../../../../../shared/infrastructure/components/question-badge/question-badge.component';
import {ChartStoreService} from "@features/energy-stats/infrastructure/services/chart-store.service";
import {DatadisEnergyStat} from "@shared/infrastructure/services/zertipower/DTOs/EnergyStatDTO";

@Component({
  selector: 'app-data-totals',
  standalone: true,
  imports: [
    TranslocoDirective,
    QuestionBadgeComponent
  ],
  templateUrl: './data-totals.component.html',
  styleUrl: './data-totals.component.scss'
})
export class DataTotalsComponent {
  @Input() datasets!: ChartDataset[]
  data!: DatadisEnergyStat[]

  totalProduction = 0
  totalActiveProduction = 0
  totalConsumption = 0
  totalSurplus = 0
  totalCo2 = 0
  constructor(
    private cdr: ChangeDetectorRef,
    private readonly chartStoreService: ChartStoreService,

  ) {

    this.chartStoreService
      .selectOnly(this.chartStoreService.$.params).subscribe((params) => {
      this.data = params.lastFetchedStats
      this.startCalculate()
    })
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

  startCalculate(){
    if (this.data)
      this.data.forEach((data) => {
        this.setTotals(data)
      })
    this.totalCo2 = this.totalProduction * 0.00026
    this.cdr.detectChanges(); // removes console error
  }

  setTotals(data: any){
    if (data.production) this.totalProduction += parseInt(data.production)
    if (data.productionActives) this.totalActiveProduction += parseInt(data.productionActives)
    if (data.kwhIn) this.totalConsumption += parseInt(data.kwhIn)
    if (data.kwhOut) this.totalSurplus += parseInt(data.kwhOut)
  }

}
