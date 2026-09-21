import { Component, inject, Input, makeEnvironmentProviders, OnDestroy, OnInit } from '@angular/core';
import { EnergyPredictionChartComponent } from "../metereologic-prediction/metereologic-chart/energy-prediction-chart.component";
import { ChartDataset } from "@shared/infrastructure/interfaces/ChartDataset";
import { StatsColors } from "../../../domain/StatsColors";
import { EnergyPredictionService } from "../../services/energy-prediction.service";
import dayjs from "dayjs";
import { UserStoreService } from "@features/user/infrastructure/services/user-store.service";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { getDayTranslated } from "@shared/utils/DatesUtils";
import { Subscription } from "rxjs";
import moment from 'moment';
import 'moment/locale/ca';
import 'moment/locale/es';
import 'moment/locale/en-gb';

import { NgIf } from "@angular/common";
import { LanguageComponent } from '../../../../../core/layouts/language/language.component';
import { TranslocoHttpLoader } from '../../../../../transloco-loader';

@Component({
  selector: 'app-energy-prediction',
  standalone: true,
  imports: [
    EnergyPredictionChartComponent,
    TranslocoDirective,
    NgIf
  ],
  templateUrl: './energy-prediction.component.html',
  styleUrl: './energy-prediction.component.scss'
})
export class EnergyPredictionComponent implements OnInit, OnDestroy {
  constructor(private translocoService: TranslocoService) {
  }
  @Input() community: boolean = true;
  @Input() communityIdOverride?: number;
  @Input() historicalCommunityIdOverride?: number;
  @Input() historicalCommunityModeOverride = false;
  @Input() cupsIdOverride?: number;
  communityConsumptionMessage = '';
  datasets: ChartDataset[] = [
    {
      id: "production",
      color: StatsColors.COMMUNITY_PRODUCTION,
      label: 'Producció',
      data: [1, 2, 3, 4, 5, 6],
    }
  ];
  elements: {
    label: string
    image: string
  }[] = [];
  labels: string[] = [];
  energyPredictionService = inject(EnergyPredictionService);
  userStoreService = inject(UserStoreService);

  consumptionPrediction: { date: string, value: number }[] = [];
  productionPrediction: { date: string, value: number }[] = [];
  surplusPrediction: { date: string, value: number }[] = [];

  consumptionTestInfo: { historyFrom: string; historyTo: string; members: number; requestedMembers: number } | null = null;
  productionUnavailable = false;
  communityProductionMessage = '';
  communityProductionSummary = '';
  historicalCommunityMode = false;
  historicalValidationReference = new URLSearchParams(window.location.search).get('referenceDate') || undefined;
  loading = false

  subscriptions: Subscription[] = [];
  async ngOnInit() {

    this.subscriptions.push(
      this.translocoService.langChanges$.subscribe(async () => {
        this.elements = []
        await this.getPrediction()
      })
    )
  }

  async getPrediction() {
    this.loading = true

    const activeLang = this.translocoService.getActiveLang()
    moment.locale(activeLang);

    let weekInit = this.historicalValidationReference
      ? moment.utc(this.historicalValidationReference, 'YYYY-MM-DD', true).format('YYYY-MM-DD')
      : new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    let weekEnd = moment.utc(weekInit, 'YYYY-MM-DD', true).add(5, 'days').format('YYYY-MM-DD')
    const consumptionWeekInit = weekInit;
    const consumptionWeekEnd = weekEnd;
    let productionPredictionResponse: any[];
    let consumptionPredictionResponse: any[];
    this.consumptionTestInfo = null;
    this.productionUnavailable = false;
    this.surplusPrediction = [];
    this.productionPrediction = [];
    this.communityProductionMessage = '';
    this.communityProductionSummary = '';
    this.historicalCommunityMode = this.community && (this.historicalCommunityModeOverride || (this.communityIdOverride === undefined && this.historicalCommunityIdOverride !== undefined)) && !!this.historicalValidationReference;
    this.consumptionPrediction = [];

    if (this.community) {
      const previewCommunityId = Number(window.location.pathname.match(/community-prediction-preview\/(\d+)/)?.[1]) || undefined;
      const communityId = Number(this.historicalCommunityModeOverride
        ? (this.communityIdOverride ?? this.historicalCommunityIdOverride ?? previewCommunityId)
        : (this.communityIdOverride ?? this.historicalCommunityIdOverride ?? this.userStoreService.snapshotOnly(this.userStoreService.$.communityId))) || 0;
      if (this.communityIdOverride === undefined || this.historicalCommunityModeOverride) {
        const historical = await this.energyPredictionService.getHistoricalCommunityMeterPrediction(communityId, this.historicalValidationReference).catch(() => null);
        productionPredictionResponse = Array.isArray(historical?.data) ? historical.data : [];
        if (historical?.membersTotal != null) this.communityProductionSummary = `Suma històrica de ${historical.membersWithHistory} de ${historical.membersTotal} comptadors${this.historicalValidationReference ? ` · data de referència ${moment(this.historicalValidationReference).format('DD/MM/YYYY')}` : ''}`;
        if (!productionPredictionResponse.length) this.communityProductionMessage = 'No hi ha dades recents disponibles per als comptadors de la comunitat.';
        consumptionPredictionResponse = await this.energyPredictionService.getCommunityConsumptionPrediction(communityId, consumptionWeekInit, consumptionWeekEnd).catch(error=>{return []});
      } else {
      const communityProduction = await this.energyPredictionService.getCommunityPrediction(communityId).catch(error => {
        this.communityProductionMessage = String(error?.error?.message || '').includes('potència nominal de l’inversor')
          ? 'Falta la potència nominal de l’inversor. Completa les cobertes desades a la calculadora.'
          : 'No s’ha pogut obtenir la previsió de les cobertes seleccionades.';
        return [];
      });
      productionPredictionResponse = Array.isArray(communityProduction) ? communityProduction : [];
      const productionDetails = await this.energyPredictionService.getCommunityProductionDetails(communityId).catch(() => null);
      if (productionDetails?.selectedRoofs && productionDetails?.predictions?.some((p: any) => p.source === 'simulation')) {
        const simulated = productionDetails.predictions.filter((p: any) => p.source === 'simulation').length;
        const totalKwp = productionDetails.predictions.reduce((sum: number, p: any) => sum + Number(p.input?.kwp || 0), 0);
        this.communityProductionSummary = simulated === 1
          ? `Basada en 1 instal·lació simulada · ${totalKwp.toFixed(1).replace('.', ',')} kWp total`
          : `Basada en ${simulated} instal·lacions simulades · ${totalKwp.toFixed(1).replace('.', ',')} kWp totals`;
      } else if (!productionPredictionResponse.length && !this.communityProductionMessage) {
        this.communityProductionMessage = 'No hi ha cobertes atribuïdes a membres actius ni àrees seleccionades per simular.';
      }
      consumptionPredictionResponse = await this.energyPredictionService.getCommunityConsumptionPrediction(communityId, consumptionWeekInit, consumptionWeekEnd).catch(error=>{return []})
      }
    } else {
      const cupsId = this.cupsIdOverride ?? this.userStoreService.snapshotOnly(this.userStoreService.$.cupsId);
      productionPredictionResponse = await this.energyPredictionService.getCupsPrediction(cupsId, this.historicalValidationReference).catch(error=>{return []});
      if (this.historicalValidationReference) this.communityProductionMessage = `Mode de validació històrica · Data de referència: ${moment(this.historicalValidationReference).format('DD/MM/YYYY')}`;
      consumptionPredictionResponse = await this.energyPredictionService.getCupsConsumptionPrediction(cupsId, consumptionWeekInit, consumptionWeekEnd).catch(error=>{return []})
    }

    if (consumptionPredictionResponse?.[0]?.source === 'local-historical-test') this.consumptionTestInfo = consumptionPredictionResponse[0];
    this.productionUnavailable = false;

    if (this.community && consumptionPredictionResponse?.[0]?.source === 'local-historical-community-estimate') {
      const info = consumptionPredictionResponse[0];
      this.communityConsumptionMessage = `Estimació per a ${info.members} punts actius: ${info.observedMembers} amb històric i ${info.estimatedMembers} estimats. Històric: ${info.historyFrom} — ${info.historyTo}.`;
    }
    //format production if exist
    if (productionPredictionResponse) {
      const dailyPrediction: Map<string, number> = new Map();
      for (const predictionEntry of productionPredictionResponse) {
        const predictionDate = moment.utc(predictionEntry.time);
        const calendarDate = predictionDate.format('YYYY-MM-DD');
        if (productionPredictionResponse.length && (calendarDate < weekInit || calendarDate > weekEnd)) continue;
        // Key by the complete UTC calendar date.  Weekday names are not
        // unique in a historical backtest and local timezone conversion can
        // move a midnight value to the previous day.
        const value = dailyPrediction.get(calendarDate) || 0;
        dailyPrediction.set(calendarDate, value + Number(predictionEntry.value));
      }
      this.productionPrediction = [];
      for (let offset = 0; offset < 6; offset++) {
        const date = moment.utc(weekInit, 'YYYY-MM-DD', true).add(offset, 'days');
        const key = date.format('YYYY-MM-DD');
        const value = dailyPrediction.get(key);
        this.productionPrediction.push({
          date: date.format('dddd DD/MM'),
          value: value == null ? -1 : Number(value.toFixed(2))
        });
      }
    }

    // Match both rows by full calendar date, including gaps and unordered responses.
    const consumptionByDate = new Map<string, number>(
      (consumptionPredictionResponse || []).map(day => [
        moment.utc(day.date, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601], true).format('YYYY-MM-DD'),
        day.consumption
      ])
    );
    this.consumptionPrediction = Array.from({ length: 6 }, (_, offset) => {
      const date = moment.utc(weekInit, 'YYYY-MM-DD', true).add(offset, 'days');
      const value = consumptionByDate.get(date.format('YYYY-MM-DD'));
      return { date: date.format('dddd DD/MM'), value: value == null ? -1 : Number(value.toFixed(2)) };
    });

    let index = 0;

    //insert non existent data (surplus included):
    for (let i = moment.utc(weekInit, 'YYYY-MM-DD', true); i.isSameOrBefore(moment.utc(weekEnd, 'YYYY-MM-DD', true)); i.add(1, 'days')) {

      let weekDay = i.format('dddd DD/MM')

      if (!this.consumptionPrediction[index]) {
        let consumption = { date: weekDay, value: -1 }
        this.consumptionPrediction.push(consumption);
      }

      if (!this.productionPrediction[index]) {
        this.productionPrediction.push({ date: weekDay, value: -1 })
      }

      if ((this.consumptionTestInfo && this.consumptionTestInfo.members < this.consumptionTestInfo.requestedMembers) || this.productionPrediction[index].value == -1 || this.consumptionPrediction[index].value == -1) {
        this.surplusPrediction.push({ date: weekDay, value: -1 })
      } else {
        let surplusPredictionValue = this.productionPrediction[index].value - this.consumptionPrediction[index].value;
        if (surplusPredictionValue > 0) {
          this.surplusPrediction.push({ date: weekDay, value: surplusPredictionValue })
        } else {
          this.surplusPrediction.push({ date: weekDay, value: 0 })
        }
      }
      index++;
    }
    this.loading = false
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
