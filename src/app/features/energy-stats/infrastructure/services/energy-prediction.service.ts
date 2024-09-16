import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";
import {HttpResponse} from "@shared/infrastructure/services/HttpResponse";
import {firstValueFrom, map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EnergyPredictionService {

  constructor(private httpClient: HttpClient) {
  }

  async getCommunityConsumptionPrediction(communityId: number,startDate:string,endDate:string): Promise<{consumption: number, date: string}[]> {
    const response = this.httpClient.get<HttpResponse<{
      consumption: number,
      date: string
    }[]>>(`${environment.zertipower_url}/energy-prediction/community/${communityId}/consumption/?start_date=${startDate}&end_date=${endDate}`).pipe(map(r => r.data));

    return firstValueFrom(response);
  }

  async getCupsConsumptionPrediction(cupsId: number,startDate:string,endDate:string): Promise<{consumption: number, date: string}[]> {
    const response = this.httpClient.get<HttpResponse<{
      consumption: number,
      date: string
    }[]>>(`${environment.zertipower_url}/energy-prediction/cups/${cupsId}/consumption/?start_date=${startDate}&end_date=${endDate}`).pipe(map(r => r.data));

    return firstValueFrom(response);
  }

  async getCommunityPrediction(communityId: number): Promise<{value: number, time: string}[]> {
    const response = this.httpClient.get<HttpResponse<{
      value: number,
      time: string
    }[]>>(`${environment.zertipower_url}/energy-prediction?community=${communityId}`).pipe(map(r => r.data));

    return firstValueFrom(response);
  }

  async getCupsPrediction(cupsId: number): Promise<{value: number, time: string}[]> {
    const response = this.httpClient.get<HttpResponse<{
      value: number,
      time: string
    }[]>>(`${environment.zertipower_url}/energy-prediction?cups=${cupsId}`).pipe(map(r => r.data));

    return firstValueFrom(response);
  }


}
