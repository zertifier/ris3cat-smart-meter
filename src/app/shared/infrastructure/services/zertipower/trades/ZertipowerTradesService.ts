import {Axios} from "axios";
import {HttpResponse} from "../../HttpResponse";


export interface TradeInterface{
  id: number;
  action: string;
  cost: number;
  currentKwh: number;
  infoDt: string;
  previousKwh: number;
  tradedKwh: number;
  fromWalletAddress:string;
  toWalletAddress:string;
}
export class ZertipowerTradesService{
  constructor(private readonly axios: Axios) {
  }

  async getTradesByCustomer(customerId: number, fromDate: string, toDate: string): Promise<TradeInterface[]> {
    const response = await this.axios.get<HttpResponse<TradeInterface[]>>(`/trades/customer/${customerId}/date/${fromDate}/${toDate}`);
    return response.data.data;

  }

  async getTradesByCommunity(communityId: number, fromDate: string, toDate: string): Promise<TradeInterface[]> {
    const response = await this.axios.get<HttpResponse<TradeInterface[]>>(`/trades/community/${communityId}/date/${fromDate}/${toDate}`);
    return response.data.data;

  }
}
