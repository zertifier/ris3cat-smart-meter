import {AfterViewInit, Component, ElementRef, Input, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {ChartLegendComponent} from "../chart-legend/chart-legend.component";
import {DataChartComponent} from "../data-chart/data-chart.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, CommonModule, NgClass} from "@angular/common";
import {DatadisChartComponent} from "../datadis-chart/datadis-chart.component";
import {DateRange} from '../../../../domain/DateRange';
import {ChartStoreService} from '../../../services/chart-store.service';
import {ChartResource} from '../../../../domain/ChartResource';
import {MonitoringService} from "../../../services/monitoring.service";
import {ChartType} from '../../../../domain/ChartType';
import {ChartOrigins} from "../../../../domain/ChartOrigins";
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {
  BreakPoints,
  ScreenBreakPointsService
} from "../../../../../../shared/infrastructure/services/screen-break-points.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslocoDirective} from "@jsverse/transloco";
import moment from "moment";
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ZertipowerCommunitiesService } from '../../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService';
import { ZertipowerService } from '../../../../../../shared/infrastructure/services/zertipower/zertipower.service';

@Component({
  selector: 'app-historic-chart',
  standalone: true,
  imports: [
    CalendarModule,
    ChartLegendComponent,
    DataChartComponent,
    NgClass,
    ReactiveFormsModule,
    AsyncPipe,
    FormsModule,
    DatadisChartComponent,
    QuestionBadgeComponent,
    TranslocoDirective,
    NgMultiSelectDropDownModule,
    CommonModule
  ],
  templateUrl: './historic-chart.component.html',
  styleUrl: './historic-chart.component.scss'
})
export class HistoricChartComponent implements AfterViewInit, OnDestroy{

  @Input({ required: false }) chartType: 'community' | 'cups' | 'customers' = 'cups';

  date$ = this.chartStoreService.selectOnly(state => {
    return state.date
  });
  origin$ = this.chartStoreService.selectOnly(state => state.origin)
  maxDate = new Date();
  chartType$ = this.chartStoreService.selectOnly(state => state.chartType);
  
  

  calendarView$ = this.chartStoreService.selectOnly(state => {
    this.chartStoreService.setDate(state.date)

    switch (state.dateRange) {
      case DateRange.MONTH:
        return 'month'
      case DateRange.YEAR:
        return 'year'
      case DateRange.DAY:
        return 'date'
    }
  });
  dateFormat$ = this.chartStoreService.selectOnly(state => {
    this.chartStoreService.setDate(state.date)
    switch (state.dateRange) {
      case DateRange.MONTH:
        return 'mm-yy'
      case DateRange.YEAR:
        return 'yy'
      case DateRange.DAY:
        return 'dd-mm-yy'
    }
  });
  chartResource$ = this.chartStoreService.selectOnly(state => state.selectedChartResource);

  loading = false;

  dateRange$ = this.chartStoreService.selectOnly(state => state.dateRange)
  currentBreakpoint$ = this.screenBreakpoints.observeBreakpoints();
  protected readonly DateRange = DateRange;
  protected readonly ChartOrigins = ChartOrigins;
  protected readonly ChartResource = ChartResource;
  protected readonly ChartType = ChartType;
  @ViewChild('modalLegend') modalLegend!: ElementRef;

  @Input() data:any;

  cupsIdsToExclude:number[]=[];
  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: false,
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  
  constructor(
    private readonly monitoringService: MonitoringService,
    public readonly chartStoreService: ChartStoreService,
    private readonly screenBreakpoints: ScreenBreakPointsService,
    private readonly ngbModal: NgbModal,
    private zertipowerService: ZertipowerService
  ) {
  }

  async ngAfterViewInit(){
    this.date$ = this.chartStoreService.selectOnly(state => state.date);
  }

  async ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'data':
            if (changes['data'].currentValue) {
              if(this.chartType==='community'){
                this.setCommunityData(changes['data'].currentValue)
              }
            }
            break;
          default:
            break;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.chartStoreService.setCupsToExclude([]);
  }

  async setCommunityData(communityData:any){
    let communityId = communityData.id;
    let producers = await this.zertipowerService.communities.getProducers(communityId);
    this.dropdownList = producers.map((producer:any)=>{return {item_id:producer.id,item_text:producer.cups}})
  }

  onItemSelect(item: any) {
    this.cupsIdsToExclude = this.selectedItems.map((item:any)=>{return item.item_id});
    this.chartStoreService.setCupsToExclude(this.cupsIdsToExclude);
  }

  onSelectAll(items: any) {
    this.cupsIdsToExclude = this.selectedItems.map((item:any)=>{return item.item_id});
    this.chartStoreService.setCupsToExclude(this.cupsIdsToExclude);
  }

  onDeselect(items:any){
    this.cupsIdsToExclude = this.selectedItems.map((item:any)=>{return item.item_id});
    this.chartStoreService.setCupsToExclude(this.cupsIdsToExclude);
  }

  setChartType(event: Event) {
    const chartType = (event.target as any).value === 'ACC' ? ChartType.ACC : ChartType.CCE;
    this.chartStoreService.setChartType(chartType);
  }

  setDateRange(range: DateRange) {
    this.loading = true
    this.chartStoreService.setDateRange(range);
    this.chartStoreService.setDate(new Date());
    this.loading = false
  }

  setChartResource(event: Event) {
    const selectedValue = (event.target as any).value as string;
    let newResource: ChartResource;
    if (selectedValue === ChartResource.PRICE) {
      newResource = ChartResource.PRICE;
    } else {
      newResource = ChartResource.ENERGY;
    }

    this.chartStoreService.patchState({selectedChartResource: newResource});
  }

  setDate(date: Date) {
    this.chartStoreService.setDate(date);
  }

  setInputDate(date: Date){
    if (date && date.getTime()){
      this.chartStoreService.setDate(date);
    }
  }

  showLegend() {
    const breakpoint = this.screenBreakpoints.getCurrentBreakPoint();
    if (breakpoint >= BreakPoints.MD) {
      return;
    }

    this.ngbModal.open(this.modalLegend, {size: "lg"});
  }

  protected readonly BreakPoints = BreakPoints;
}
