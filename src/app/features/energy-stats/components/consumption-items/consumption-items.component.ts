import {Component, Input} from '@angular/core';

export interface ConsumptionItem {
  icon: string,
  label: string,
  consumption: number
}

@Component({
  selector: 'app-consumption-items',
  standalone: true,
  imports: [],
  templateUrl: './consumption-items.component.html',
  styleUrl: './consumption-items.component.scss'
})
export class ConsumptionItemsComponent {
  @Input() items: ConsumptionItem[] = []
}
