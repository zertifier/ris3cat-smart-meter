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

  async getCommunityPrediction(communityId: number): Promise<any> {
    const response = this.httpClient.get<HttpResponse<any>>(`${environment.zertipower_url}/energy-prediction?community=${communityId}`).pipe(map(r => r.data));

    return firstValueFrom(response);
  }

  async getCommunityProductionDetails(communityId: number): Promise<any> {
    const response = this.httpClient.get<HttpResponse<any>>(`${environment.zertipower_url}/roof-simulation/community-production-details?community=${communityId}`).pipe(map(r => r.data));
    return firstValueFrom(response);
  }

  async getHistoricalCommunityMeterPrediction(communityId: number, referenceDate?: string): Promise<any> {
    const resolvedCommunityId = communityId || Number(window.location.pathname.match(/community-prediction-preview\/(\d+)/)?.[1]) || 7;
    const response = this.httpClient.get<HttpResponse<any>>(`${environment.zertipower_url}/energy-prediction/community/${resolvedCommunityId}/historical-meter-production${referenceDate ? `?referenceDate=${encodeURIComponent(referenceDate)}` : ''}`).pipe(map(r => r.data));
    return firstValueFrom(response);
  }

  async getCupsPrediction(cupsId: number, referenceDate?: string): Promise<{value: number, time: string}[]> {
    const response = this.httpClient.get<HttpResponse<any>>(`${environment.zertipower_url}/energy-prediction?cups=${cupsId}${referenceDate ? `&referenceDate=${encodeURIComponent(referenceDate)}` : ''}`).pipe(map(r => {
      const data: any = r.data;
      return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    }));

    return firstValueFrom(response);
  }


}
