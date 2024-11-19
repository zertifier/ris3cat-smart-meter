import {AfterViewInit, Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";
import {TranslocoDirective} from "@jsverse/transloco";

export interface ConsumptionItem {
  icon: string,
  label: string,
  consumption: number
}

@Component({
  selector: 'app-consumption-items',
  standalone: true,
  imports: [
    NgClass,
    TranslocoDirective
  ],
  templateUrl: './consumption-items.component.html',
  styleUrl: './consumption-items.component.scss'
})
export class ConsumptionItemsComponent implements AfterViewInit{
  @Input() items: ConsumptionItem[] = []
  @Input() totalSurplus: number = 0;
  @Input() assignedProduction: number = 0;

  availableCommunitySurplus = 0
  ngAfterViewInit() {
    // this.availableCommunitySurplus = (100 - this.assignedProduction) * this.totalSurplus
    this.availableCommunitySurplus = 6
  }

  getClass(value: number){
    if (this.totalSurplus >=value) return 'supplied'
    else
      if (this.availableCommunitySurplus >= value) return 'community-supplied'
    return 'not-supplied'
  }
}
