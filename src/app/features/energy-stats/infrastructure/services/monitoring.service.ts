import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, map, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {HttpResponse} from "@shared/infrastructure/services/HttpResponse";
import {MonitoringStoreService} from "./monitoring-store.service";

export interface EnergyStat {
  inHouseConsumption: number;
  sell: number;
  buy: number;
  date: string;
}

export interface PowerStats {
  production: number;
  inHouse: number;
  buy: number;
  sell: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private powerFlow = new BehaviorSubject<PowerStats>({production: 0, buy: 0, inHouse: 0, sell: 0});
  private interval: any;

  constructor(
    private httpClient: HttpClient,
    private monitoringStoreService: MonitoringStoreService,
  ) {
  }

  async start(type: string = 'datadis', cupsReference: string = '') {
    if (this.interval) {
      return;
    }

    this.updatePowerFlow(type, cupsReference).then(() => console.log('first powerflow updated'));

    this.interval = setInterval(async () => {
      await this.updatePowerFlow(type, cupsReference)
    }, 60000);


  }

  getPowerFlow() {
    return this.powerFlow.asObservable().pipe(tap(() => {}));
  }

  async getEnergyStats(date: string, dateRange: number) {
    const params = new HttpParams().set('date', date).set('daterange', dateRange)
    return await firstValueFrom(this.httpClient.get<EnergyStat[]>(`${environment.api_url}/monitoring/energystats`, {
      params
    }));
  }

  stop() {
    clearInterval(this.interval);
  }

  private async updatePowerFlow(type: string = 'datadis', cupsReference: string = '') {
    try {
      const data = type == 'datadis' ? await this.fetchDatadisPowerFlow() : await this.fetchShellyPowerFlow(cupsReference);

      const stats: PowerStats = {buy: 0, sell: 0, inHouse: 0, production: 0}
      stats.production = data.production
      if (data.consumption > data.production) {
        // stats.inHouse = data.production;
        stats.buy = data.consumption - data.production
      } else {
        // stats.inHouse = data.consumption;
        stats.sell = data.production - data.consumption
      }
      this.powerFlow.next(stats);
    } catch (err: unknown) {
      this.monitoringStoreService.patchState({lastPowerFlowUpdate: undefined});
    }
  }

  private async fetchDatadisPowerFlow(): Promise<{production: number, consumption: number, grid: number}> {
    const response = await firstValueFrom(this.httpClient.get<HttpResponse<{
      production: number,
      consumption: number,
      grid: number
    }>>(`${environment.api_url}/monitoring/powerflow/`)
      .pipe(map(r => r.data)))

    this.monitoringStoreService.patchState({lastPowerFlowUpdate: new Date()})
    return response;
  }

  private async fetchShellyPowerFlow(cupsReference: string): Promise<{production: number, consumption: number, grid: number}> {
    const response = await firstValueFrom(this.httpClient.get<HttpResponse<{
      production: number,
      consumption: number,
      grid: number
    }>>(`${environment.zertipower_url}/cups/${cupsReference}/monitoring`)
      .pipe(map(r => r.data)))

    this.monitoringStoreService.patchState({lastPowerFlowUpdate: new Date()})
    return response;
  }
}
