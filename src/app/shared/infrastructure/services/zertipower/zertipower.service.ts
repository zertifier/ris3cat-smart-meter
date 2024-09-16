import {Injectable} from '@angular/core';
import axios from "axios";
import {environment} from "../../../../../environments/environment";
import {AuthStoreService} from "../../../../features/auth/infrastructure/services/auth-store.service";
import {SKIP_AUTH_INTERCEPTOR} from "../../../../features/auth/infrastructure/interceptors/auth-token.interceptor";
import {ZertipowerUserService} from "./users/ZertipowerUserService";
import {ZertipowerEnergyStats} from "./energy-stats/ZertipowerEnergyStats";
import {ZertipowerAuthService} from "./auth/ZertipowerAuthService";
import {ZertipowerCommunitiesService} from "./communities/ZertipowerCommunitiesService";
import {ZertipowerCustomersService} from "./customers/ZertipowerCustomersService";
import {ZertipowerCupsService} from "./cups/ZertipowerCupsService";
import {ZertipowerLocationService} from "./location/ZertipowerLocationService";
import {ZertipowerEnergyHourlyService} from "@shared/infrastructure/services/zertipower/energy-hourly/ZertipowerEnergyHourlyService";

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

  // Note, the usage of axios is because it can parse the criteria object and send it correctly.
  // Angular http client cannot do that.
  constructor(
    private readonly authStore: AuthStoreService
  ) {
    // Implementing auth token interceptor
    this.axiosClient.interceptors.request.use((config) => {
      if (config.headers.has(SKIP_AUTH_INTERCEPTOR)) {
        config.headers.delete(SKIP_AUTH_INTERCEPTOR);
        return config;
      }

      const accessToken = this.authStore.snapshotOnly(state => state.accessToken);
      config.headers.delete(SKIP_AUTH_INTERCEPTOR);
      config.headers.set('Authorization', `Bearer ${accessToken}`);

      return config;
    });
    this.users = new ZertipowerUserService(this.axiosClient);
    this.energyStats = new ZertipowerEnergyStats(this.axiosClient);
    this.auth = new ZertipowerAuthService(this.axiosClient);
    this.communities = new ZertipowerCommunitiesService(this.axiosClient);
    this.customers = new ZertipowerCustomersService(this.axiosClient);
    this.cups = new ZertipowerCupsService(this.axiosClient);
    this.locations = new ZertipowerLocationService(this.axiosClient);
    this.energyHourly = new ZertipowerEnergyHourlyService(this.axiosClient);
  }
}
