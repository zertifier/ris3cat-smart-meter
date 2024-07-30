import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { AuthStoreService } from "../../../auth/infrastructure/services/auth-store.service";

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    accessToken='';
    headers;

    constructor(private httpClient: HttpClient, private readonly authStore: AuthStoreService) {
        this.accessToken = this.authStore.snapshotOnly(state => state.accessToken);
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
        })
    }

    getNotifications() {
        return this.httpClient.get(`${environment.zertipower_url}/user-notifications/categorized`, { headers: this.headers });
    }

    setNotifications(notifications:{}){
        return this.httpClient.put(`${environment.zertipower_url}/user-notifications`,notifications, { headers: this.headers });
    }

}
