import {Axios} from "axios";
import {DateRange} from "@features/energy-stats/domain/DateRange";
import dayjs from "@shared/utils/dayjs";
import {HttpResponse} from "../../HttpResponse";
import {EnergyStatDTO} from "../DTOs/EnergyStatDTO";
import {ChartEntity} from "@features/energy-stats/domain/ChartEntity";

export interface CommunityResponse{
  id: number,
  name: string,
  test: boolean,
  energyPrice: number,
  createdAt: string,
  updatedAt: string
}

export class ZertipowerCommunitiesService {
  constructor(private readonly axios: Axios) {
  }

  async getActiveMembers(id: number): Promise<number> {
    const response = await this.getEnergyStats(ChartEntity.COMMUNITIES, id, 'datadis', new Date(), DateRange.DAY);
    return response.totalActiveMembers;
  }

  async getByLocationId(id: number){
    const response = await this.axios.get<HttpResponse<CommunityResponse[]>>(`${ChartEntity.COMMUNITIES}/locations/${id}`);
    return response.data.data
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
