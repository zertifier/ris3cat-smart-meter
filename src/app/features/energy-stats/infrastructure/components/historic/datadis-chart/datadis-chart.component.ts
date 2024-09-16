import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AsyncPipe, JsonPipe, NgIf} from "@angular/common";
import {ChartLegendComponent, DataLabel} from "../chart-legend/chart-legend.component";
import {DataChartComponent} from "../data-chart/data-chart.component";
import {combineLatest, Subscription} from "rxjs";
import {StatsColors} from "../../../../domain/StatsColors";
import {ChartStoreService} from "../../../services/chart-store.service";
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";
import {ChartResource} from "../../../../domain/ChartResource";
import {ChartEntity} from "../../../../domain/ChartEntity";
import {DateRange} from "../../../../domain/DateRange";
import {ChartType} from "../../../../domain/ChartType";
import {DatadisEnergyStat} from "@shared/infrastructure/services/zertipower/DTOs/EnergyStatDTO";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BreakPoints, ScreenBreakPointsService} from "@shared/infrastructure/services/screen-break-points.service";
import {ChartDataset} from "@shared/infrastructure/interfaces/ChartDataset";
import dayjs from '@shared/utils/dayjs';

@Component({
  selector: 'app-datadis-chart',
  standalone: true,
  imports: [
    AsyncPipe,
    ChartLegendComponent,
    DataChartComponent,
    NgIf,
    JsonPipe
  ],
  templateUrl: './datadis-chart.component.html',
  styleUrl: './datadis-chart.component.scss'
})
/**
 * Me hacen cambiar esto cada semana paso de documentarlo al detalle porque
 * no saben ni ellos lo que quieren poner en el gráfico. En vez de hablar con
 * los usuarios y hacer mejoras incrementales, hacen los cambios que les
 * apetece por motivos que se alejan de entregar valor al usuario.
 *
 * **Para la persona que tenga que tocar esto en un futuro**, lo siento es horrible
 * pero tuve que improvisar despues de ver como me pedian cambios tanto en la UI
 * como en la logica de la aplicación.
 *
 * Para que te hagas a una idea los parametros del grafico estan en un ChartStoreService
 * luego los datos se extraen de una api. Estos datos llegaban en un formato llamemoslo ApiResponse.
 * Luego esos datos tienen que transformarse a una interfaz customizada llamada {@link ChartDataset}.
 * Pero como los datos de la api cambiaban constantemente use una interfaz {@link DatadisEnergyStat}.
 * Para luego hacer el mapping de {@link DatadisEnergyStat} a {@link ChartDataset}. Debido a que ese mapping
 * esta repartido en varias partes del codigo me interesaba no tener que cambiar todas las partes del codigo
 * cada vez que la api cambiaba. Por eso el mapping de la respuesta de la api a {@link DatadisEnergyStat} se hace en
 * un unico lugar. Asi cuando la api cambiaba solo tenia que modificar una funcion y no todos los elementos
 * del componente
 *
 * La cosa esta en que como las cosas cambiaron tanto. Las unicas interfaces que realmente important son
 * {@link ChartDataset} y lo que devuelva la api.
 */
export class DatadisChartComponent implements OnInit, OnDestroy {
  fetchingData$ = this.chartStoreService.selectOnly(state => state.fetchingData);
  subscriptions: Subscription[] = [];
  activeMembers$ = this.userStore.selectOnly(state => state.activeMembers);
  totalMembers$ = this.userStore.selectOnly(state => state.totalMembers);
  showCommunity$ = this.chartStoreService
    .selectOnly(state => state.selectedChartEntity === ChartEntity.COMMUNITIES);

  datasets: ChartDataset[] = [];
  labels: string[] = [];
  legendLabels: DataLabel[] = [];
  mobileLabels: DataLabel[] = [];

  @ViewChild(DataChartComponent) dataChart!: DataChartComponent;
  @ViewChild('secondChart') secondChart!: DataChartComponent;
  @ViewChild('maximizedChart') maximizedChart!: ElementRef;
  @ViewChild('legendModal') legendModal!: ElementRef;
  currentBreakpoint$ = this.breakpointsService.observeBreakpoints();
  protected readonly BreakPoints = BreakPoints;

  constructor(
    private readonly chartStoreService: ChartStoreService,
    private readonly userStore: UserStoreService,
    private readonly zertipower: ZertipowerService,
    private readonly ngbModal: NgbModal,
    private readonly breakpointsService: ScreenBreakPointsService,
  ) {
  }

  public maximizeChart() {
    this.ngbModal.open(this.maximizedChart, {fullscreen: true});
  }

  async ngOnInit(): Promise<void> {
    const chartParametrs$ = this.chartStoreService
      .selectOnly(this.chartStoreService.$.params);
    const selectedCups$ = this.userStore.selectOnly(state => ({selectedCupsIndex: state.selectedCupsIndex}))

    this.subscriptions.push(
      combineLatest([chartParametrs$, selectedCups$])
        .subscribe(
          async ([{
            date,
            dateRange,
            selectedChartResource,
            selectedChartEntity,
            chartType,
          }]) => {
            // Every time that params change, fetch data and update chart
            // Fetching data
            const cupId = this.userStore.snapshotOnly(this.userStore.$.cupsId);
            const communityId = this.userStore.snapshotOnly(this.userStore.$.communityId);
            const data = await this.fetchEnergyStats(date, dateRange, cupId, communityId);
            this.chartStoreService.patchState({lastFetchedStats: data});

            // Create labels
            let labels: string[] = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
            if (dateRange === DateRange.MONTH) {
              labels = data.map(d => {
                return dayjs.utc(d.infoDt).format('DD');
              });
            } else if (dateRange === DateRange.DAY) {
              labels = data.map(d => {
                return dayjs.utc(d.infoDt).format('HH');
              })
            }

            const cce = chartType === ChartType.CCE;
            const community = selectedChartEntity === ChartEntity.COMMUNITIES;

            // Map data to a more easy to use objects
            const mappedData = this.mapData(data, chartType, selectedChartResource);

            // Create data sets
            const datasets: ChartDataset[] = [];

            if (cce) {
              datasets.push({
                order: 2,
                label: 'Excedent actius compartit',
                tooltipText: community ? 'Quantitat d’energia per compartir que es produeix i no es consumeix dels participans actius.' : 'Quantitat d’energia per compartir que es produeix i no es consumeix dels participans actius.',
                color: StatsColors.VIRTUAL_SURPLUS,
                data: mappedData.map(d => d.virtualSurplus),
              })
            } else {
              datasets.push({
                order: 2,
                label: community ? 'Excedent actius' : 'Excedent',
                tooltipText: community ? 'Quantitat d’energia que es produeix i no es consumeix dels participans actius.' : 'Quantitat d\'energia que es produeix i no es consumeix.',
                color: StatsColors.SURPLUS,
                data: mappedData.map(d => d.surplus),
                stack: 'Stack 2',
              })
            }

            if (community) {
              datasets.unshift(
                {
                  order: 0,
                  label: 'Producció actius',
                  tooltipText: 'Producció dels participants actius',
                  color: StatsColors.ACTIVE_COMMUNITY_PRODUCTION,
                  data: mappedData.map(d => d.productionActives),
                  stack: 'Excedent',
                },
                {
                  order: 3,
                  color: StatsColors.COMMUNITY_PRODUCTION,
                  label: 'Producció',
                  tooltipText: 'Producció total de la comunitat',
                  data: mappedData.map(d => {
                    if (!d.production) {
                      return 0;
                    }
                    return d.production - d.productionActives;
                  }),
                  stack: 'Excedent',
                },
                {
                  label: 'Consum del a xarxa actius',
                  data: mappedData.map(d => {
                    return d.consumption;
                  }),
                  tooltipText: community ? 'Consum dels participants actius' : 'Quantitat d\'energia que gastem',
                  stack: 'Consumption',
                  order: 0,
                  color: StatsColors.SELF_CONSUMPTION
                },
              )
            } else {
              datasets.unshift({
                label: 'Consum de la xarxa',
                color: StatsColors.SELF_CONSUMPTION,
                data: mappedData.map(d => {
                  return d.gridConsumption
                }),
                tooltipText: 'Consum que facturarà la companyia elèctrica',
                stack: 'Consumption',
              })
              datasets.unshift({
                label: 'Producció',
                tooltipText: 'Producció proporcional comunitària',
                color: StatsColors.COMMUNITY_PRODUCTION,
                data: mappedData.map(d => d.production),
                stack: 'Production',
              })
            }

            this.labels = labels;
            this.datasets = datasets;
            this.legendLabels = datasets.map((entry, index) => {
              return {
                tooltipText: entry.tooltipText,
                label: entry.label,
                radius: '2.5rem',
                color: entry.color,
                hidden: false,
                toggle: (label) => {
                  this.dataChart.toggleDataset(index);
                  label.hidden = !label.hidden;
                  return label;
                }
              }
            });

            this.mobileLabels = this.legendLabels.map(d => {
              return {...d, radius: '2.5rem'}
            })
          }),
    )
    ;
  }

  public showLegendModal() {
    this.ngbModal.open(this.legendModal, {size: "xl"});
  }

  async fetchEnergyStats(date: Date, range: DateRange, cupId: number, communityId: number) {
    this.chartStoreService.snapshotOnly(state => state.origin);
    this.chartStoreService.fetchingData(true);
    let data: DatadisEnergyStat[];
    try {
      const selectedChart = this.chartStoreService.snapshotOnly(state => state.selectedChartEntity);
      if (selectedChart === ChartEntity.CUPS) {
        const response = await this.zertipower.energyStats.getCupEnergyStats(cupId, 'datadis', date, range);
        this.userStore.patchState({activeMembers: response.totalActiveMembers || 0});
        this.userStore.patchState({totalMembers: response.totalMembers || 0});
        data = response.stats;
      } else {
        if (!communityId) {
          return [];
        }
        const response = await this.zertipower.energyStats.getCommunityEnergyStats(communityId, 'datadis', date, range);
        this.userStore.patchState({activeMembers: response.totalActiveMembers || 0});
        this.userStore.patchState({totalMembers: response.totalMembers || 0});
        data = response.stats;

      }
      // this.latestFetchedStats = data;
      return data;
    } finally {
      this.chartStoreService.fetchingData(false);
    }
  }

  mapData(data: DatadisEnergyStat[], chartType: ChartType, chartResource: ChartResource): {
    consumption: number,
    surplus: number,
    virtualSurplus: number,
    production: number,
    productionActives: number,
    gridConsumption: number,
  }[] {
    const showEnergy = chartResource === ChartResource.ENERGY;
    // const cce = chartType === ChartType.CCE;
    return data.map(d => {
      const consumption = showEnergy ? d.kwhIn : +(d.kwhInPrice * d.kwhIn).toFixed(2);
      const surplus = showEnergy ? d.kwhOut : +(d.kwhOutPrice * d.kwhOut).toFixed(2);
      let productionActives = showEnergy ? d.productionActives : +(d.kwhInPrice * d.productionActives).toFixed(2);
      const virtualSurplus = showEnergy ? d.kwhOutVirtual : +(d.kwhOutPriceCommunity * d.kwhOutVirtual).toFixed(2);
      let production = showEnergy ? d.production : +(d.kwhInPrice * d.production).toFixed(2);
      let gridConsumption = consumption - production;
      if (gridConsumption < 0 || isNaN(gridConsumption)) {
        gridConsumption = 0;
      }

      if (production === undefined) {
        production = 0;
      }

      if (productionActives === undefined) {
        productionActives = 0;
      }

      // TODO make calculations for CCE

      return {
        consumption,
        surplus,
        virtualSurplus,
        production,
        productionActives,
        gridConsumption,
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
