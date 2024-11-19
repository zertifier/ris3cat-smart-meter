import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

export interface ConsumptionItem {
  icon: string,
  label: string,
  consumption: number
}

@Component({
  selector: 'app-consumption-items',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './consumption-items.component.html',
  styleUrl: './consumption-items.component.scss'
})
export class ConsumptionItemsComponent {
  @Input() items: ConsumptionItem[] = []
  @Input() totalSurplus: number = 0;
}
