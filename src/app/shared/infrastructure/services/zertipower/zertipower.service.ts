import { Injectable } from '@angular/core';
import axios from "axios";
import { environment } from "../../../../../environments/environment";
import { AuthStoreService } from "../../../../features/auth/infrastructure/services/auth-store.service";
import { SKIP_AUTH_INTERCEPTOR } from "../../../../features/auth/infrastructure/interceptors/auth-token.interceptor";
import { ZertipowerUserService } from "./users/ZertipowerUserService";
import { ZertipowerEnergyStats } from "./energy-stats/ZertipowerEnergyStats";
import { ZertipowerAuthService } from "./auth/ZertipowerAuthService";
import { ZertipowerCommunitiesService } from "./communities/ZertipowerCommunitiesService";
import { ZertipowerCustomersService } from "./customers/ZertipowerCustomersService";
import { ZertipowerCupsService } from "./cups/ZertipowerCupsService";
import { ZertipowerLocationService } from "./location/ZertipowerLocationService";
import { UserStoreService } from '../../../../features/user/infrastructure/services/user-store.service';
import { ZertiauthApiService } from '../../../../features/auth/infrastructure/services/zertiauth-api.service';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { ZertipowerEnergyHourlyService } from './energy-hourly/ZertipowerEnergyHourlyService';
import { ZertipowerTradesService } from './trades/ZertipowerTradesService';

@Injectable({
  providedIn: 'root'
})
export class ZertipowerService {
  private BASE_URL = environment.zertipower_url;
  private axiosClient = axios.create({
    baseURL: this.BASE_URL,
  });
  public readonly users: ZertipowerUserService;
  public readonly energyStats: ZertipowerEnergyStats;
  public readonly auth: ZertipowerAuthService;
  public readonly communities: ZertipowerCommunitiesService;
  public readonly customers: ZertipowerCustomersService;
  public readonly cups: ZertipowerCupsService;
  public readonly locations: ZertipowerLocationService;
  public readonly energyHourly: ZertipowerEnergyHourlyService;
  public readonly trades: ZertipowerTradesService;

  // Note, the usage of axios is because it can parse the criteria object and send it correctly.
  // Angular http client cannot do that.
  constructor(
    private readonly authStore: AuthStoreService,
    private userStore:UserStoreService,
    public readonly authApiService: ZertiauthApiService,
    private http: HttpClient
  ) {

    // Implementing auth token interceptor
    this.axiosClient.interceptors.request.use((config) => {
      if (config.headers.has(SKIP_AUTH_INTERCEPTOR)) {
        config.headers.delete(SKIP_AUTH_INTERCEPTOR);
        return config;
      }
      const accessToken = this.authStore.snapshotOnly(state => state.accessToken);
      config.headers.delete(SKIP_AUTH_INTERCEPTOR);
      if (accessToken) {
        config.headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return config;
    });

    //implementing error interceptor
    this.axiosClient.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        let ignoredErrors = ['Token not provided']
        console.log("axios interceptor error", error, error.response)
        if (error.response) {
          let errorMsg = '';
          if (error.response.data && error.response.data.msg) {
            errorMsg = error.response.data.msg;
          } else if (error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.message) {
            errorMsg = error.response.message;
          } else {
            errorMsg = error.response.statusText;
          }
          if(!ignoredErrors.includes(errorMsg)){
            swal.fire('Error', errorMsg, 'error');
          }
        } else {
          console.log("Network Error", error.message);
          swal.fire('Error', 'Network Error', 'error');
        }
        return Promise.reject(error);
      }
    );

    this.users = new ZertipowerUserService(this.axiosClient);
    this.energyStats = new ZertipowerEnergyStats(this.axiosClient);
    this.auth = new ZertipowerAuthService(this.axiosClient);

    this.communities = new ZertipowerCommunitiesService(this.axiosClient, this.http ,this.userStore); //this.authApiService
    this.customers = new ZertipowerCustomersService(this.axiosClient);
    this.cups = new ZertipowerCupsService(this.axiosClient);
    this.locations = new ZertipowerLocationService(this.axiosClient);
    this.energyHourly = new ZertipowerEnergyHourlyService(this.axiosClient);
    this.trades = new ZertipowerTradesService(this.axiosClient);
  }
}
