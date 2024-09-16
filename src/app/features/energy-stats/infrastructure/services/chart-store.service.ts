import {Injectable} from '@angular/core';
import {RxStore} from "@zertifier/rx-store";
import {DateRange} from "../../domain/DateRange";
import {ChartEntity} from "../../domain/ChartEntity";
import {ChartResource} from "../../domain/ChartResource";
import {ChartType} from "../../domain/ChartType";
import {ChartOrigins} from "../../domain/ChartOrigins";
import {DatadisEnergyStat} from "../../../../shared/infrastructure/services/zertipower/DTOs/EnergyStatDTO";

export interface ChartStore {
  dateRange: DateRange,
  date: Date,
  fetchingData: boolean,
  origin: ChartOrigins,
  selectedChartEntity: ChartEntity,
  selectedChartResource: ChartResource,
  chartType: ChartType,
  lastFetchedStats: DatadisEnergyStat[]
}

const defaultValues: ChartStore = {
  dateRange: DateRange.MONTH,
  date: new Date(),
  fetchingData: false,
  origin: ChartOrigins.DATADIS,
  selectedChartEntity: ChartEntity.CUPS,
  selectedChartResource: ChartResource.ENERGY,
  chartType: ChartType.ACC,
  lastFetchedStats: []
}

@Injectable({
  providedIn: 'root'
})
export class ChartStoreService extends RxStore<ChartStore> {
  $ = {
    params(state: ChartStore) {
      const {dateRange, date, selectedChartResource, origin, selectedChartEntity, chartType} = state;
      return {
        dateRange, date, selectedChartResource, origin, selectedChartEntity, chartType
      }
    }
  }

  constructor() {
    super(defaultValues);
  }

  public setChartType(chartType: ChartType) {
    this.patchState({chartType});
  }

  public setDate(date: Date) {
    this.patchState({date})
  }

  public setDateRange(dateRange: DateRange) {
    this.patchState({dateRange})
  }

  public fetchingData(fetchingData: boolean) {
    this.patchState({fetchingData});
  }

  public override resetDefaults() {
    this.setState({...defaultValues, date: new Date()})
  }
}
