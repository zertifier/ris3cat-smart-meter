import {Component, computed, isDevMode, OnDestroy, OnInit, signal} from '@angular/core';
import {ChartModule} from "primeng/chart";
import {MonitoringService, PowerStats} from "../../../services/monitoring.service";
import {map, Subscription} from "rxjs";
import {AsyncPipe, JsonPipe, NgClass, NgIf, NgStyle} from "@angular/common";
import {StatsColors} from "../../../../domain/StatsColors";
import {
  NgbModal,
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLinkButton,
  NgbNavOutlet,
  NgbTooltip
} from "@ng-bootstrap/ng-bootstrap";

import {CalendarModule} from "primeng/calendar";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import dayjs from "@shared/utils/dayjs";
import {AuthStoreService} from "../../../../../auth/infrastructure/services/auth-store.service";
import {StatDisplayComponent} from "../../../components/realtime/stat-display/stat-display.component";
import {ChartLegendComponent} from "../../../components/historic/chart-legend/chart-legend.component";
import {DataChartComponent} from "../../../components/historic/data-chart/data-chart.component";
import {
  ConsumptionItem,
  ConsumptionItemsComponent
} from "../../../components/realtime/consumption-items/consumption-items.component";
import {HistoricChartComponent} from "../../../components/historic/historic-chart/historic-chart.component";
import {UserStoreService} from "../../../../../user/infrastructure/services/user-store.service";
import {NavbarComponent} from "@shared/infrastructure/components/navbar/navbar.component";
import {FooterComponent} from "@shared/infrastructure/components/footer/footer.component";
import {MonitoringStoreService} from "../../../services/monitoring-store.service";
import {getMonth, getMonthTranslated} from "@shared/utils/DatesUtils";
import {KnobModule} from "primeng/knob";
import {PowerflowGausComponent} from "../../../components/powerflow-gaus/powerflow-gaus.component";
import {
  EnergyPredictionChartComponent
} from "../../../components/metereologic-prediction/metereologic-chart/energy-prediction-chart.component";
import {
  MetereologicPredictionComponent
} from "../../../components/metereologic-prediction/metereologic-prediction.component";
import {environment} from "@environments/environment";
import {EnergyPredictionComponent} from "../../../components/energy-prediction/energy-prediction.component";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {
  CommunityResponse,
  TradeTypes
} from '../../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService';
import { ZertipowerService } from '../../../../../../shared/infrastructure/services/zertipower/zertipower.service';
import {
  CommunityModalComponent
} from "@features/energy-stats/infrastructure/pages/community/my-community-page/community-modal/community-modal.component";
import {ChartResource} from "@features/energy-stats/domain/ChartResource";

@Component({
  selector: 'app-my-community-page',
  standalone: true,
  imports: [
    NavbarComponent,
    ChartModule,
    JsonPipe,
    NgStyle,
    StatDisplayComponent,
    NgbNavOutlet,
    NgbNav,
    NgbNavItem,
    NgbNavLinkButton,
    NgbNavContent,
    ChartLegendComponent,
    DataChartComponent,
    ConsumptionItemsComponent,
    FooterComponent,
    NgClass,
    CalendarModule,
    ReactiveFormsModule,
    HistoricChartComponent,
    AsyncPipe,
    KnobModule,
    FormsModule,
    PowerflowGausComponent,
    EnergyPredictionChartComponent,
    MetereologicPredictionComponent,
    EnergyPredictionComponent,
    TranslocoDirective,
    NgIf,
    NgbTooltip
  ],
  templateUrl: './my-community-page.component.html',
  styleUrl: './my-community-page.component.scss'
})
export class MyCommunityPageComponent implements OnInit, OnDestroy {
  consumptionItems: ConsumptionItem[] = [
    {
      consumption: 0.015,
      label: 'LED',
      icon: 'fa-solid fa-lightbulb',
    },
    {
      consumption: 0.6,
      label: 'Nevera',
      icon: 'fa-solid fa-temperature-low',
    },
    {
      consumption: 0.25,
      label: 'TV',
      icon: 'fa-solid fa-tv',
    },
    {
      consumption: 0.5,
      label: 'Rentadora',
      icon: 'fa-solid fa-shirt',
    },
    {
      consumption: 2,
      label: 'Estufa',
      icon: 'fa-solid fa-fire-burner',
    },
    {
      consumption: 7,
      label: 'Cotxe elèctric',
      icon: 'fa-solid fa-car',
    },
  ];
  readonly powerFlow = signal<PowerStats>({production: 0, buy: 0, inHouse: 0, sell: 0})
  readonly knobValue = computed(() => {
    const consumptionRatio = (this.powerFlow().sell * 100) / this.powerFlow().production;
    if (isNaN(consumptionRatio)) {
      return '0 %';
    }

    return `${consumptionRatio.toFixed(0)} %`;
  });
  subscriptions: Subscription[] = [];
  totalMembers$ = this.userStore.selectOnly(state => state.totalMembers);
  activeMembers$ = this.userStore.selectOnly(state => state.activeMembers);
  lastUpdate$ = this.monitoringStore.selectOnly(state => state.lastPowerFlowUpdate)
    .pipe(map(value => {
      if (!value) {
        return '';
      }
      const month = getMonthTranslated(this.translocoService,value.getMonth());
      return dayjs(value).format(`HH:mm:ss - DD [${month}] YYYY`);
    }));
  protected readonly StatsColors = StatsColors;

  communityData!:CommunityResponse | any;
  communityId$ = this.userStore.selectOnly(this.userStore.$.communityId).subscribe(async (communityId:any)=>{
    this.communityData = await this.zertipowerService.communities.getCommunityById(communityId)
  });

  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly authStore: AuthStoreService,
    private readonly userStore: UserStoreService,
    private readonly monitoringStore: MonitoringStoreService,
    private readonly translocoService: TranslocoService,
    private readonly zertipowerService:ZertipowerService,
    private readonly ngbModal: NgbModal,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.monitoringService.start();

    const authData = this.authStore.snapshotOnly(state => state.authData);
    if (!authData) {
      alert('no auth data')
      return;
    }

    this.subscriptions.push(
      this.monitoringService
        .getPowerFlow()
        .subscribe(value => {
          const {production, buy, inHouse, sell} = value;
          this.powerFlow.set({
            production: production / 1000,
            inHouse: inHouse / 1000,
            buy: buy / 1000,
            sell: sell / 1000,
          })
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  openEditModal(){
    const modalRef = this.ngbModal.open(CommunityModalComponent, { size: 'lg' })
    modalRef.componentInstance.community = this.communityData

    this.subscriptions.push(
      modalRef.closed.subscribe(async () => {
        this.communityData = await this.zertipowerService.communities.getCommunityById(this.communityData.id)
      })
    )
  }

  getTradeTypeTranslation(type: TradeTypes){
    switch (type){
      case 'PREFERRED': return this.translocoService.translate('MY-COMMUNITY.texts.tradeTypePref')
      case 'EQUITABLE': return this.translocoService.translate('MY-COMMUNITY.texts.tradeTypeEqui')
    }
  }

  isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  isDevMode = isDevMode;
  protected readonly environment = environment;
    protected readonly ChartResource = ChartResource;
}
