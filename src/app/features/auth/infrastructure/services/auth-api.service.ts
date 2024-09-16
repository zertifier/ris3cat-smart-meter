import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "@environments/environment";
import {firstValueFrom, map} from "rxjs";
import {SKIP_AUTH_INTERCEPTOR} from "../interceptors/auth-token.interceptor";
import {HttpResponse} from "@shared/infrastructure/services/HttpResponse";

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  constructor(private httpClient: HttpClient) {
  }

  public async getSignCode(walletAddress: string, email?: string): Promise<string> {
    const headers = new HttpHeaders().set(SKIP_AUTH_INTERCEPTOR, '');

    const response = this.httpClient.post<HttpResponse<{
      signCode: string
    }>>(`${environment.api_url}/auth/users/sign-code`, {
      walletAddress,
      email
    }, {headers}).pipe(map(r => r.data.signCode));
    return firstValueFrom(response);
  }

  public async login(walletAddress: string, privateKey: string, email: string): Promise<{
    accessToken: string,
    refreshToken: string
  }> {
    const headers = new HttpHeaders().set(SKIP_AUTH_INTERCEPTOR, '');

    const response = this.httpClient.post<HttpResponse<{
      accessToken: string,
      refreshToken: string
    }>>(`${environment.api_url}/auth/users/w3-login`, {
      walletAddress,
      privateKey,
      email,
    }, {headers}).pipe(map(r => r.data))

    return firstValueFrom(response);
  }

  public async logout(token: string): Promise<void> {
    const headers = new HttpHeaders().set(SKIP_AUTH_INTERCEPTOR, '');
    const response = this.httpClient.delete(`${environment.api_url}/auth/users/logout`, {body: {token}, headers});
    await firstValueFrom(response);
  }
}
