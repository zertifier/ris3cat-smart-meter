import {AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";
import {TranslocoDirective} from "@jsverse/transloco";

@Component({
  selector: 'app-data-totals',
  standalone: true,
  imports: [
    TranslocoDirective
  ],
  templateUrl: './data-totals.component.html',
  styleUrl: './data-totals.component.scss'
})
export class DataTotalsComponent implements AfterViewInit{
  @Input() datasets!: ChartDataset[]

  totalProduction = 0
  totalActiveProduction = 0
  totalConsumption = 0
  totalSurplus = 0
  totalCo2 = 0
  constructor(
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {

    if (this.datasets)
      this.datasets.forEach((dataset) => {
        if (dataset.id == 'production') this.setVariables(dataset.data, 'production')
        if (dataset.id == 'productionActive') this.setVariables(dataset.data, 'productionActive')
        if (dataset.id == 'networkActiveConsumption') this.setVariables(dataset.data, 'networkActiveConsumption')
        if (dataset.id == 'surplusActive') this.setVariables(dataset.data, 'surplusActive')
      })

    this.totalCo2 = this.totalProduction * 0.00026
    this.cdr.detectChanges(); // removes console error

  }

  setVariables(data: any[], type: 'networkActiveConsumption' | 'production' | 'productionActive' | 'surplusActive'){
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
  }

}
