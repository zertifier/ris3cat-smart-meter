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
    /*const response = await this.axios.get<HttpResponse<TradeInterface[]>>(`/trades/customer/${customerId}/date/${fromDate}/${toDate}`);
    return response.data.data;*/
    return [
      {
        "id": 1,
        "action": "BUY",
        "tradedKwh": 0.017000,
        "cost": 0.002000,
        "previousKwh": 0.333000,
        "currentKwh": 0.316000,
        "infoDt": "2024-08-11 19:00:00",
        "fromWalletAddress": "",
        "toWalletAddress": "0x2FC7a05b837956985f7f6Bd1513bdD21635e3956"
      },
      {
        "id": 7,
        "action": "BUY",
        "tradedKwh": 0.017000,
        "cost": 0.002000,
        "previousKwh": 0.142000,
        "currentKwh": 0.125000,
        "infoDt": "2024-08-11 19:00:00",
        "fromWalletAddress": "",
        "toWalletAddress": "0x2FC7a05b837956985f7f6Bd1513bdD21635e3956"
      },
      {
        "id": 8,
        "action": "SELL",
        "tradedKwh": 0.017000,
        "cost": 0.002000,
        "previousKwh": 0.119000,
        "currentKwh": 0.102000,
        "infoDt": "2024-08-11 19:00:00",
        "fromWalletAddress": "0x2FC7a05b837956985f7f6Bd1513bdD21635e3956",
        "toWalletAddress": ''
      },
      {
        "id": 9,
        "action": "BUY",
        "tradedKwh": 0.017000,
        "cost": 0.002000,
        "previousKwh": 0.131000,
        "currentKwh": 0.114000,
        "infoDt": "2024-08-11 19:00:00",
        "fromWalletAddress": '',
        "toWalletAddress": "0x2FC7a05b837956985f7f6Bd1513bdD21635e3956"
      }
    ];
  }

  async getTradesByCommunity(communityId: number, fromDate: string, toDate: string): Promise<TradeInterface[]> {
    const response = await this.axios.get<HttpResponse<TradeInterface[]>>(`/trades/community/${communityId}/date/${fromDate}/${toDate}`);
    return response.data.data;

  }
}
