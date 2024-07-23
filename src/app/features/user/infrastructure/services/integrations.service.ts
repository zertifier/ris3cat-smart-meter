import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { AuthStoreService } from "../../../auth/infrastructure/services/auth-store.service";

@Injectable({
    providedIn: 'root'
})
export class IntegrationsService {

    accessToken='';

    constructor(private httpClient: HttpClient,private readonly authStore: AuthStoreService) {
        this.accessToken = this.authStore.snapshotOnly(state => state.accessToken);
        console.log(this.accessToken)
    }

  getPermaToken() {
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
    })
    return this.httpClient.post(`${environment.real_time_energy_url}/tokens/`, { headers: headers });
  }

  refreshPermaToken() {
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
    })
    return this.httpClient.post(`${environment.real_time_energy_url}/tokens/refresh`, { headers: headers });
  }

  
}