import {Injectable} from '@angular/core';
import {AuthApiService} from "../../../features/auth/infrastructure/services/auth-api.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {HttpResponse} from "./HttpResponse";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    public readonly auth: AuthApiService,
    private httpClient: HttpClient,

  ) {}

  baseUrl = environment.zertipower_url
  // baseUrl = 'http://localhost:3000'


  getCommunityById(communityId: number){
    return this.httpClient.get<HttpResponse<any>>(`${this.baseUrl}/communities/${communityId}`)
  }

  getWalletByEmail(email: string){
    return this.httpClient.post<HttpResponse<{walletAddress: string}>>(`${this.baseUrl}/users/wallet/email`, {email})
  }

}
