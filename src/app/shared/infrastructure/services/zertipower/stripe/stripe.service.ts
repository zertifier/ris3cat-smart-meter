import {Injectable} from '@angular/core';
import Swal from "sweetalert2";
import {environment} from "../../../../../../environments/environment";
import {HttpResponse} from "../../HttpResponse";
import {HttpClient} from "@angular/common/http";
import {io} from "socket.io-client";
import {BehaviorSubject, Subject} from "rxjs";

export type MintStatus = 'MINTING' | 'ACCEPTED' | 'ERROR'

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  baseUrl = environment.zertipower_url
  // baseUrl = 'http://localhost:3000'

  mintStatus: Subject<MintStatus> = new Subject<MintStatus>()

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  getCheckoutUrl(walletAddress: string, quantity: number): string {
    const url = `${this.baseUrl}/stripe?quantity=${quantity}&walletAddress=${walletAddress}`

    // window.location.href = url;
    return url
    // return this.http.get(url);
  }

  setMintStatus(sessionId: string) {

    const url = `${this.baseUrl}/stripe/session/${sessionId}/status`
    const socket = this.getMintSocket(sessionId)


    const subscription = this.httpClient.get<HttpResponse<MintStatus>>(url).subscribe({
      next: data => {
        this.mintStatus.next(data.data)
        subscription.unsubscribe()
        socket.on('isMinted', (status: MintStatus) => {
          subscription.unsubscribe()
          socket.close()
          this.mintStatus.next(status)
        });
      },
      error: err => {
        subscription.unsubscribe()
        console.log(err)
        socket.on('isMinted', (status: MintStatus) => {
          subscription.unsubscribe()
          socket.close()
          this.mintStatus.next(status)
        });
      }
    })
  }

  getMintSocket(sessionId: string) {
    return io(`${this.baseUrl}/socket/mint/status`, {
        query: {sessionId},
      }
    );
  }
}
