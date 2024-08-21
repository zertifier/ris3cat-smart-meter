import {Injectable} from '@angular/core';
import Swal from "sweetalert2";
import {environment} from "../../../../../../environments/environment";
import {HttpResponse} from "../../HttpResponse";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  // baseUrl = environment.zertipower_url
  baseUrl = 'http://localhost:3000'


  constructor(
    private httpClient: HttpClient,

  ) {
  }
  getCheckoutUrl(userId: number,quantity: number): string {
    const url = `${this.baseUrl}/stripe?quantity=${quantity}&userId=${userId}`

    // window.location.href = url;
    return url
    // return this.http.get(url);
  }

  getOrderStatus(orderCode: string) {
    const url = `${this.baseUrl}/stripe/status?eventId=${orderCode}`

    return this.httpClient.get<HttpResponse<any>>(url)
  }
}
