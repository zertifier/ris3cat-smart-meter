import {Injectable} from '@angular/core';
import Swal from "sweetalert2";
import {environment} from "../../../../../../environments/environment";
import {HttpResponse} from "../../HttpResponse";
import {HttpClient} from "@angular/common/http";
import {io} from "socket.io-client";
import {BehaviorSubject} from "rxjs";

export type MintStatus = 'MINTING' | 'ACCEPTED' | 'ERROR'
@Injectable({
  providedIn: 'root'
})
export class StripeService {
  // baseUrl = environment.zertipower_url
  baseUrl = 'http://localhost:3000'

  mintStatus: BehaviorSubject<MintStatus> = new BehaviorSubject<MintStatus>('MINTING')

  constructor(
    private httpClient: HttpClient,

  ) {
  }
  getCheckoutUrl(walletAddress: string,quantity: number): string {
    const url = `${this.baseUrl}/stripe?quantity=${quantity}&walletAddress=${walletAddress}`

    // window.location.href = url;
    return url
    // return this.http.get(url);
  }

  setMintStatus(sessionId: string) {

    const url = `${this.baseUrl}/stripe/session/${sessionId}/status`
    const socket = this.getMintSocket(sessionId)

    socket.on('isMinted', (status: MintStatus) => {
      this.mintStatus.next(status)
      socket.close()
    });

    const subscription = this.httpClient.get<HttpResponse<MintStatus>>(url).subscribe({
      next: data => {
        this.mintStatus.next(data.data)
        subscription.unsubscribe()
      },
      error: err => {
        subscription.unsubscribe()
        console.log(err)
      }
    })
  }

  getMintSocket(sessionId: string){
    return io(`${this.baseUrl}/socket/mint/status`, {
      query: { sessionId }
    });
  }
}