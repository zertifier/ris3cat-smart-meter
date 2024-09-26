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
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {
  DataTotalsComponent
} from "@features/energy-stats/infrastructure/components/historic/data-totals/data-totals.component";

@Component({
  selector: 'app-datadis-chart',
  standalone: true,
  imports: [
    AsyncPipe,
    ChartLegendComponent,
    DataChartComponent,
    NgIf,
    JsonPipe,
    TranslocoDirective,
    DataTotalsComponent
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
  data!: DatadisEnergyStat[]
  labels: string[] = [];
  legendLabels: DataLabel[] = [];
  mobileLabels: DataLabel[] = [];
  cce: boolean = false;

  @ViewChild(DataChartComponent) dataChart!: DataChartComponent;
  @ViewChild('secondChart') secondChart!: DataChartComponent;
  @ViewChild('maximizedChart') maximizedChart!: ElementRef;
  @ViewChild('legendModal') legendModal!: ElementRef;

  currentBreakpoint$ = this.breakpointsService.observeBreakpoints();
  protected readonly BreakPoints = BreakPoints;

  constructor(
    public readonly chartStoreService: ChartStoreService,
    private readonly userStore: UserStoreService,
    private readonly zertipower: ZertipowerService,
    private readonly ngbModal: NgbModal,
    private readonly breakpointsService: ScreenBreakPointsService,
    private translocoService: TranslocoService
  ) {
  }

  public maximizeChart() {
    this.ngbModal.open(this.maximizedChart, { fullscreen: true });
  }

  async ngOnInit(): Promise<void> {
    this.chartStoreService.isLoading$.next(true)
    this.subscriptions.push(
      this.translocoService.langChanges$.subscribe(() => {
        const chartParametrs$ = this.chartStoreService
          .selectOnly(this.chartStoreService.$.params);
        const selectedCups$ = this.userStore.selectOnly(state => ({ selectedCupsIndex: state.selectedCupsIndex }))
        this.subscriptions.push(
          combineLatest([chartParametrs$, selectedCups$])
            .subscribe(
              async ([{
                date,
                dateRange,
                selectedChartResource,
                selectedChartEntity,
                chartType,
                cupsIdsToExclude
              }]) => {
                // Every time that params change, fetch data and update chart
                // Fetching data

                const cupId = this.userStore.snapshotOnly(this.userStore.$.cupsId);
                const communityId = this.userStore.snapshotOnly(this.userStore.$.communityId);
                const customerId = this.userStore.snapshotOnly((state:any) => state.user!.customer_id);
                const data = await this.fetchEnergyStats(date, dateRange, cupId, communityId, customerId, cupsIdsToExclude);
                // console.log({data})
                //this.chartStoreService.chartData$.next(data)
                this.data = data
                this.chartStoreService.patchState({ lastFetchedStats: data });

                // Create labels
                // let labels: string[] = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
                let labels: string[] = [];
                this.translocoService.selectTranslate('GENERIC.texts.monthsArray').subscribe((monthsArray) => {
                  labels = monthsArray
                  if (dateRange === DateRange.MONTH) {
                    labels = data.map(d => {
                      return dayjs.utc(d.infoDt).format('DD');
                    });
                  } else if (dateRange === DateRange.DAY) {
                    labels = data.map(d => {
                      return dayjs.utc(d.infoDt).format('HH');
                    })
                  }
                })


                const cce = chartType === ChartType.CCE;


                const community = selectedChartEntity === ChartEntity.COMMUNITIES;

                // Map data to a more easy to use objects
                const mappedData = this.mapData(data, chartType, selectedChartResource);

                // Create data sets
                const datasets: ChartDataset[] = [];

                if (cce) {
                  datasets.push({
                    id: "surplusActiveShared",
                    order: 2,
                    label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.surplusActiveShared'),
                    // tooltipText: community ? 'Quantitat d’energia per compartir que es produeix i no es consumeix dels participans actius.' : 'Quantitat d’energia per compartir que es produeix i no es consumeix dels participans actius.',
                    tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.community.sharedSurplusActive'),
                    color: StatsColors.VIRTUAL_SURPLUS,
                    data: mappedData.map(d => d.virtualSurplus ? parseFloat(d.virtualSurplus + '').toFixed(2) : '0'),
                  })
                } else {
                  datasets.push({
                    id: "surplusActive",
                    order: 2,
                    label: community ? this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.surplusActive') : this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.surplus'),
                    // tooltipText: community ? 'Quantitat d’energia que es produeix i no es consumeix dels participans actius.' : 'Quantitat d\'energia que es produeix i no es consumeix.',
                    tooltipText: community ? this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.community.surplusActive') : this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.cups.surplusActive'),
                    color: StatsColors.SURPLUS,
                    data: mappedData.map(d => d.surplus ? parseFloat(d.surplus + '').toFixed(2) : '0'),
                    stack: 'Active surplus',
                  })
                }

                if (community) {
                  datasets.unshift(

                    {
                      id: "production",
                      order: 3,
                      color: StatsColors.COMMUNITY_PRODUCTION,
                      // label: 'Producció',
                      label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.community.production'),
                      // tooltipText: 'Producció total de la comunitat',
                      tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.community.production'),
                      data: mappedData.map(d => d.production ? parseFloat(d.production + '').toFixed(2) : '0'),
                      stack: 'Production',
                      yAxisID: 'y'
                    },{
                      id: "productionActive",
                      order: 0,
                      // label: 'Producció actius',
                      label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.productionActive'),
                      tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.community.activeProduction'),
                      color: StatsColors.ACTIVE_COMMUNITY_PRODUCTION,
                      data: mappedData.map(d => d.productionActives ? parseFloat(d.productionActives + '').toFixed(2) : '0'),
                      stack: 'Production',
                      yAxisID: 'y'
                    },
                    {
                      id: "networkActiveConsumption",
                      // label: 'Consum del a xarxa actius',
                      label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.networkActiveConsumption'),
                      data: mappedData.map(
                        d => d.consumption ? parseFloat(d.consumption + '').toFixed(2) : '0'
                      ),
                      tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.community.networkActiveConsumption'),
                      stack: 'Consumption',
                      order: 0,
                      color: StatsColors.SELF_CONSUMPTION,
                      yAxisID: 'y'
                    },
                  )
                  // datasets.unshift({
                  //   // label: 'co2',
                  //   label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.CO2Savings'),
                  //   // tooltipText: 'Producció proporcional comunitaria',
                  //   tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.cups.CO2Savings'),
                  //   color: StatsColors.CO2_SAVINGS,
                  //   data: mappedData.map(d => d.production * this.co2Savings),
                  //   stack: 'CO2Savings',
                  //   yAxisID: 'y1'
                  // })
                } else {
                  datasets.unshift({
                    id: "networkConsumption",
                    // label: 'Consum de la xarxa',
                    label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.networkConsumption'),
                    color: StatsColors.SELF_CONSUMPTION,
                    data: mappedData.map(d => {
                      return d.consumption ? parseFloat(d.consumption + '').toFixed(2) : '0'
                    }),
                    // tooltipText: 'Consum que facturarà la companyia elèctrica',
                    tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.cups.networkConsumption'),
                    stack: 'Consumption',
                    yAxisID: 'y'
                  })
                  datasets.unshift({
                    id: "production",
                    // label: 'Producció',
                    label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.production'),
                    // tooltipText: 'Producció proporcional comunitaria',
                    tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.cups.production'),
                    color: StatsColors.COMMUNITY_PRODUCTION,
                    data: mappedData.map(d => {
                      return d.production ? parseFloat(d.production + '').toFixed(2) : '0'
                    }),
                    stack: 'Production',
                    yAxisID: 'y'
                  })
                  // datasets.unshift({
                  //   // label: 'co2',
                  //   label: this.translocoService.translate('HISTORIC-CHART.texts.chartLabels.CO2Savings'),
                  //   // tooltipText: 'Producció proporcional comunitaria',
                  //   tooltipText: this.translocoService.translate('HISTORIC-CHART.tooltips.chartLabels.cups.CO2Savings'),
                  //   color: StatsColors.CO2_SAVINGS,
                  //   data: mappedData.map(d => d.production * this.co2Savings),
                  //   stack: 'CO2Savings',
                  //   yAxisID: 'y1',
                  // })
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
                  return { ...d, radius: '2.5rem' }
                })
                this.chartStoreService.isLoading$.next(false)

              }),
        );
      })
    )
  }

  public showLegendModal() {
    this.ngbModal.open(this.legendModal, { size: "xl" });
  }

  async fetchEnergyStats(date: Date, range: DateRange, cupId: number, communityId: number, customerId:number, cupsIdsToExclude:number[] = []) {
    this.chartStoreService.isLoading$.next(true)
    this.chartStoreService.snapshotOnly(state => state.origin);
    this.chartStoreService.fetchingData(true);
    let data: DatadisEnergyStat[];
    try {
      //TODO: saber como se define selectedChart
      const selectedChart = this.chartStoreService.snapshotOnly(state => state.selectedChartEntity);
      if (selectedChart === ChartEntity.CUPS) {
        const response = await this.zertipower.energyStats.getCupsEnergyStats(cupId, 'datadis', date, range);
        this.userStore.patchState({ activeMembers: response.totalActiveMembers || 0 });
        this.userStore.patchState({ totalMembers: response.totalMembers || 0 });
        data = response.stats;
      }
        else if (selectedChart === ChartEntity.COMMUNITIES) {
        if (!communityId) {
          return [];
        }
        const response = await this.zertipower.energyStats.getCommunityEnergyStats(communityId, 'datadis', date, range, cupsIdsToExclude);
        // console.log(response, "RESPONSE")
        this.userStore.patchState({ activeMembers: response.totalActiveMembers || 0 });
        this.userStore.patchState({ totalMembers: response.totalMembers || 0 });
        data = response.stats;
      } else if (selectedChart === ChartEntity.CUSTOMERS) {
        const response = await this.zertipower.energyStats.getCustomerEnergyStats(customerId, 'datadis', date, range);
        this.userStore.patchState({ activeMembers: response.totalActiveMembers || 0 });
        this.userStore.patchState({ totalMembers: response.totalMembers || 0 });
        data = response.stats;
      } else {
        data = [];
      }

      // this.latestFetchedStats = data;

      return data;
    } finally {
      this.chartStoreService.fetchingData(false);
      this.chartStoreService.isLoading$.next(false)

    }
  }

  mapData(data: DatadisEnergyStat[], chartType: ChartType, chartResource: ChartResource): {
    consumption: number,
    surplus: number,
    virtualSurplus: number,
    production: number,
    productionActives: number,
    virtualProduction: number,
    virtualConsumption: number
  }[] {
    const showEnergy = chartResource === ChartResource.ENERGY;
    const cce = chartType === ChartType.CCE;
this.cce = chartType === ChartType.CCE;
    return data.map(d => {

      let virtualProduction = d.kwhOutVirtual
      let virtualConsumption = d.kwhInVirtual


      let kwhIn = cce ? d.kwhInVirtual : d.kwhIn;
      let kwhOut = cce ? d.kwhOutVirtual : d.kwhOut;
      const consumption = showEnergy ? kwhIn : + (d.kwhInPrice * kwhIn).toFixed(2);
      const surplus = showEnergy ? kwhOut : + (d.kwhOutPrice * kwhOut).toFixed(2);
      let productionActives = showEnergy ? d.productionActives : +(d.kwhInPrice * d.productionActives).toFixed(2);
      const virtualSurplus = showEnergy ? d.kwhOutVirtual : +(d.kwhOutPriceCommunity * d.kwhOutVirtual).toFixed(2);
      let production = showEnergy ? d.production : +(d.kwhInPrice * d.production).toFixed(2);


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
        virtualProduction,
        virtualConsumption
      }
    })
  }

  ngOnDestroy(): void {
    this.datasets = []
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
