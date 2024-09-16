import {DateRange} from "@features/energy-stats/domain/DateRange";
import {ChartEntity} from "@features/energy-stats/domain/ChartEntity";
import dayjs from "@shared/utils/dayjs";
import {HttpResponse} from "../../HttpResponse";
import {EnergyStatDTO} from "../DTOs/EnergyStatDTO";
import {Axios} from "axios";

export class ZertipowerEnergyStats {
  constructor(private readonly axios: Axios) {
  }
  public async getCupEnergyStats(cupId: number, source: string, date: Date, dateRange: DateRange) {
    return this.getEnergyStats(ChartEntity.CUPS, cupId, source, date, dateRange);
  }

  public async getCommunityEnergyStats(communityId: number, source: string, date: Date, dateRange: DateRange) {
    return this.getEnergyStats(ChartEntity.COMMUNITIES, communityId, source, date, dateRange);
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
