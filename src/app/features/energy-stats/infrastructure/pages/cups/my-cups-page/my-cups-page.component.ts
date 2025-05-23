import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {ChartModule} from "primeng/chart";
import {AsyncPipe, CommonModule} from "@angular/common";
import {MonitoringService, PowerStats} from "../../../services/monitoring.service";
import {StatsColors} from "../../../../domain/StatsColors";
import {CalendarModule} from "primeng/calendar";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {StatDisplayComponent} from "../../../components/realtime/stat-display/stat-display.component";
import {
  ConsumptionItem,
  ConsumptionItemsComponent
} from "../../../components/realtime/consumption-items/consumption-items.component";
import {HistoricChartComponent} from "../../../components/historic/historic-chart/historic-chart.component";
import {map, Subscription} from "rxjs";
import {NavbarComponent} from "@shared/infrastructure/components/navbar/navbar.component";
import {FooterComponent} from "@shared/infrastructure/components/footer/footer.component";
import {QuestionBadgeComponent} from "@shared/infrastructure/components/question-badge/question-badge.component";
import {MonitoringStoreService} from "../../../services/monitoring-store.service";
import {getMonthTranslated} from "@shared/utils/DatesUtils";
import dayjs from "@shared/utils/dayjs";
import {KnobModule} from "primeng/knob";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {SelectCupsService} from "../../../../actions/select-cups.service";
import {CupsModalComponent} from "./cups-modal/cups-modal.component";
import {environment} from "@environments/environment";
import {
  MetereologicPredictionComponent
} from "../../../components/metereologic-prediction/metereologic-prediction.component";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {LanguageComponent} from "@core/layouts/language/language.component";
import _default from "chart.js/dist/core/core.interaction";
import {
  CommunityResponse
} from '../../../../../../shared/infrastructure/services/zertipower/communities/ZertipowerCommunitiesService';
import {ZertipowerService} from '../../../../../../shared/infrastructure/services/zertipower/zertipower.service';
import {ChartEntity} from '../../../../domain/ChartEntity';
import {ChartStoreService} from '../../../services/chart-store.service';
import {UpdateUserCupsAction} from "../../../../../user/actions/update-user-cups-action.service";
import {UserCups, UserStoreService} from "../../../../../user/infrastructure/services/user-store.service";


@Component({
  selector: 'app-my-cups-page',
  standalone: true,
  imports: [
    NavbarComponent,
    ChartModule,
    StatDisplayComponent,
    ConsumptionItemsComponent,
    FooterComponent,
    CalendarModule,
    ReactiveFormsModule,
    HistoricChartComponent,
    AsyncPipe,
    QuestionBadgeComponent,
    KnobModule,
    FormsModule,
    MetereologicPredictionComponent,
    TranslocoDirective,
    LanguageComponent,
    CommonModule,
    NgbTooltip
  ],
  templateUrl: './my-cups-page.component.html',
  styleUrl: './my-cups-page.component.scss'
})
export class MyCupsPageComponent implements OnInit, OnDestroy {
  lastUpdate$ = this.monitoringStore.selectOnly(state => state.lastPowerFlowUpdate)
    .pipe(map(value => {
      if (!value) {
        return '';
      }
      const month = getMonthTranslated(this.translocoService, value.getMonth());
      return dayjs(value).format(`HH:mm:ss - DD [${month}] YYYY`);
    }));
  consumptionItems: ConsumptionItem[] = [
    {
      consumption: 0.015,
      label: 'LED',
      icon: 'fa-solid fa-lightbulb',
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
      consumption: 0.6,
      label: 'Nevera',
      icon: 'fa-solid fa-temperature-low',
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
  protected readonly StatsColors = StatsColors;
  cupsReference$ = this.userStore.selectOnly(this.userStore.$.cupsReference);
  communityData!: CommunityResponse | any;
  communityId$ = this.userStore.selectOnly(this.userStore.$.communityId).subscribe(async (communityId: any) => {
    if (communityId) {
      this.communityData = await this.zertipowerService.communities.getCommunityById(communityId)
    }
  });
  cups$ = this.userStore.selectOnly(state => state.cups);
  selectedCupsIndex$ = this.userStore.selectOnly(state => state.selectedCupsIndex);
  surplusDistribution$ = this.userStore.selectOnly(state => state.surplusDistribution);
  subscriptions: Subscription[] = [];

  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly userStore: UserStoreService,
    private readonly monitoringStore: MonitoringStoreService,
    private readonly ngbModal: NgbModal,
    private updateCups: UpdateUserCupsAction,
    private readonly selectCupsAction: SelectCupsService,
    private readonly translocoService: TranslocoService,
    private readonly zertipowerService: ZertipowerService,
    private readonly chartStoreService: ChartStoreService
  ) {
  }

  async ngOnInit(): Promise<void> {
    const selectedCups = this.getSelectedCups()


    this.subscriptions.push(
      this.selectedCupsIndex$.subscribe(index => {
        this.selectCupsAction.run(index);
      }),
      selectedCups.subscribe((selectedCup: UserCups | undefined) => {

        if (selectedCup && selectedCup.origin == 'datadis') this.startDatadisPowerflow()
        if (selectedCup && selectedCup.origin == 'shelly') this.startShellyPowerflow(selectedCup.cupsCode)
      })
    )
  }

  async startDatadisPowerflow() {
    await this.monitoringService.start();

    this.subscriptions.push(
      this.monitoringService
        .getPowerFlow()
        .subscribe(value => {
          const surplusDistribution = this.userStore.snapshotOnly(state => state.surplusDistribution) / 100;
          const {production, buy, inHouse, sell} = value;
          this.powerFlow.set({
            buy: buy * surplusDistribution / 1000,
            inHouse: inHouse * surplusDistribution / 1000,
            production: production * surplusDistribution / 1000,
            sell: sell * surplusDistribution / 1000,
          })
        })
    )
  }

  async startShellyPowerflow(cupsReference: string = '') {
    await this.monitoringService.start('shelly', cupsReference);

    this.subscriptions.push(
      this.monitoringService
        .getPowerFlow()
        .subscribe(value => {
          const surplusDistribution = this.userStore.snapshotOnly(state => state.surplusDistribution) / 100;
          const {production, buy, inHouse, sell} = value;
          this.powerFlow.set({
            buy: buy * surplusDistribution,
            inHouse: 0,
            production: production * surplusDistribution,
            sell: 0,
          })
        })
    )


  }

  selectCups(event: any) {
    const value: number = event.target.value;
    if (value == -1) {
      // switchChartEntityGuard(ChartEntity.CUSTOMER);
      this.chartStoreService.patchState({selectedChartEntity: ChartEntity.CUSTOMERS});
      return;
    }
    this.chartStoreService.patchState({selectedChartEntity: ChartEntity.CUPS});
    this.userStore.patchState({selectedCupsIndex: value});
  }

  openEditModal() {
    const modalRef = this.ngbModal.open(CupsModalComponent, {size: 'lg'})

    const selectedCupsIndex = this.userStore.snapshotOnly((state) => state.selectedCupsIndex)
    this.cups$.subscribe((cups) => {
      modalRef.componentInstance.cups = cups[selectedCupsIndex]

      modalRef.closed.subscribe(async () => {
        const user = this.userStore.snapshotOnly(state => state.user);
        await this.updateCups.run(user?.id!);
      })
    })

  }

  getSelectedCupsCode() {
    return this.cups$.pipe(
      map(cups => {
        const selectedCupsIndex = this.userStore.snapshotOnly(state => state.selectedCupsIndex);
        return cups[selectedCupsIndex]?.cupsCode || '-';
      })
    );
  }

  getSelectedCups() {
    return this.cups$.pipe(
      map(cups => {
        const selectedCupsIndex = this.userStore.snapshotOnly(state => state.selectedCupsIndex);
        return cups[selectedCupsIndex] || undefined;
      })
    );
  }

  isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  protected readonly environment = environment;

  resetFlows() {
    this.powerFlow.set({
      buy: 0,
      inHouse: 0,
      production: 0,
      sell: 0,
    })
  }

  ngOnDestroy(): void {
    this.monitoringService.stop()
    this.monitoringService.resetFlow()
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
