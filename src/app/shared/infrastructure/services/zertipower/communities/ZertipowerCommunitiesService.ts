import { Axios } from "axios";
import { DateRange } from "@features/energy-stats/domain/DateRange";
import dayjs from "@shared/utils/dayjs";
import { HttpResponse } from "../../HttpResponse";
import { EnergyStatDTO } from "../DTOs/EnergyStatDTO";
import { ChartEntity } from "@features/energy-stats/domain/ChartEntity";
import { ZertiauthApiService } from "../../../../../features/auth/infrastructure/services/zertiauth-api.service";
import { AuthStoreService } from "../../../../../features/auth/infrastructure/services/auth-store.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { UserStoreService } from "../../../../../features/user/infrastructure/services/user-store.service";

export interface CommunityResponse {
  id: number,
  name: string,
  test: boolean,
  energyPrice: number,
  createdAt: string,
  updatedAt: string
}
export type TradeTypes = 'PREFERRED' | 'EQUITABLE'
export class ZertipowerCommunitiesService {

  constructor(private readonly axios: Axios,
    private readonly http: HttpClient,
    private userStore: UserStoreService,
  ) {}

  async getActiveMembers(id: number): Promise<number> {
    const response = await this.getEnergyStats(ChartEntity.COMMUNITIES, id, 'datadis', new Date(), DateRange.DAY);
    return response.totalActiveMembers;
  }

  async getByLocationId(id: number) {
    const response = await this.axios.get<HttpResponse<CommunityResponse[]>>(`${ChartEntity.COMMUNITIES}/locations/${id}`);
    return response.data.data
  }

  async getCommunityById(id: number) {
    const response = await this.axios.get<HttpResponse<CommunityResponse[]>>(`${ChartEntity.COMMUNITIES}/${id}`);
    return response.data.data;
  }

  async updateNameAndTradetype(id: number, community: {name: string, tradeType: TradeTypes}){
    const response = await this.axios.put<HttpResponse<CommunityResponse[]>>(`${ChartEntity.COMMUNITIES}/${id}/trade-types`, community);
    return response.data.data;
  }

  deposit(balance: number) {
    const pk = this.userStore.snapshotOnly(state => state.user?.wallet?.privateKey)!;
    const body = {
      pk,
      balance
    }
    return this.axios.put(`${ChartEntity.COMMUNITIES}/balance/deposit`, body);
  }

  witdraw(balance: number) {
    const body = {
      balance
    }
    return this.axios.put(`${ChartEntity.COMMUNITIES}/balance/witdraw`, body);
  }

  private async getEnergyStats(resource: ChartEntity, resourceId: number, source: string, date: Date, dateRange: DateRange) {
    let range: string;
    let desiredFormat: string
    switch (dateRange) {
      case DateRange.DAY:
        desiredFormat = 'YYYY-MM-DD'
        range = 'daily'
        break;
      case DateRange.MONTH:
        desiredFormat = 'YYYY-MM'
        range = 'monthly'
        break;
      case DateRange.YEAR:
        desiredFormat = 'YYYY'
        range = 'yearly'
        break;
    }
    const formattedDate = dayjs(date).format(desiredFormat);
    const response = await this.axios.get<HttpResponse<{
      totalActiveMembers: number,
      totalMembers: number,
      stats: EnergyStatDTO[]
    }>>(`/${resource}/${resourceId}/stats/${source}/${range}/${formattedDate}`);
    return {
      ...response.data.data,
      stats: response.data.data.stats.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        infoDt: new Date(r.infoDt),
      })
      )
    };
  }
}
