import {Axios} from "axios";
import {HttpResponse} from "../../HttpResponse";


export interface TradeInterface{
  action: string;
  cost: number;
  currentKwh: number;
  id: number;
  infoDt: string;
  previousKwh: number;
  tradedKwh: number;
}
export class ZertipowerTradesService{
  constructor(private readonly axios: Axios) {
  }

  async getTrades(customerId: number, fromDate: string, toDate: string): Promise<TradeInterface[]> {
    const response = await this.axios.get<HttpResponse<TradeInterface[]>>(`/trades/customer/${customerId}/date/${fromDate}/${toDate}`);
    return response.data.data;
  }
}
