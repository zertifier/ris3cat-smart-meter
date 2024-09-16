import {Axios} from "axios";
import {HttpResponse} from "../../HttpResponse";

export interface RankingConsumption {
  customerId: number,
  walletAddress: string,
  consumption: number,
}
export interface RankingSurplus {
  customerId: number,
  walletAddress: string,
  surplus: number,
}

export class ZertipowerEnergyHourlyService {
  constructor(private readonly axios: Axios) {
  }

  async getRankingConsumption(communityId: number | string, dateByMonth: string){
    const response = await this.axios.get<HttpResponse<RankingConsumption[]>>(`/energy-hourly/ranking/consumption/${communityId}/${dateByMonth}`);

    return response.data.data
  }
  async getRankingSurplus(communityId: number | string, dateByMonth: string){
    const response = await this.axios.get<HttpResponse<RankingSurplus[]>>(`/energy-hourly/ranking/surplus/${communityId}/${dateByMonth}`);

    return response.data.data
  }

}
