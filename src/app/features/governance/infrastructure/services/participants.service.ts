import {Injectable} from '@angular/core';
import {HttpResponse} from "../../../../shared/infrastructure/services/HttpResponse";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";

export interface Participant {
  name: string,
  email: string,
  customerId?: number,
  id?: number,
  shares?: string,
  status: ParticipantStatus
}

export interface PendingCommunity {
  name: string;
  id: number;
  communityId: number;
  status: "PENDING";
}

export type ParticipantStatus = 'active' | 'pending'

@Injectable({
  providedIn: 'root'
})
export class ParticipantsService {
  baseUrl = environment.zertipower_url

  // baseUrl= 'http://localhost:3000'

  constructor(
    private httpClient: HttpClient
  ) {
  }


  getParticipants(communityId: number, status: ParticipantStatus) {
    return this.httpClient.get<HttpResponse<Participant[]>>(`${this.baseUrl}/shares/participants/community/${communityId}/status/${status}`)
  }

  getParticipantsFilter(communityId: number, status: ParticipantStatus, filterWord: string) {
    return this.httpClient.get<HttpResponse<Participant[]>>(`${this.baseUrl}/shares/participants/community/${communityId}/status/${status}/filter/${filterWord}`)
  }

  getPendingQty(communityId: number) {
    return this.httpClient.get<HttpResponse<{
      qty: number
    }>>(`${this.baseUrl}/shares/participants/community/${communityId}/quantity`)
  }

  getByCustomerId(customerId: number) {
    return this.httpClient.get<HttpResponse<PendingCommunity[]>>(`${this.baseUrl}/shares/participants/${customerId}`)
  }

  activateParticipant(id: number, shares: number) {
    return this.httpClient.put<HttpResponse<Participant>>(`${this.baseUrl}/shares/participants/${id}/activate`, {shares})
  }

  updateParticipant(participant: Participant) {
    return this.httpClient.put<HttpResponse<Participant>>(`${this.baseUrl}/shares/participants/${participant.id}`, participant)
  }

  create(data: { customerId: number, communityId: number }) {
    return this.httpClient.post<HttpResponse<Participant>>(`${this.baseUrl}/shares`, data)
  }

  removeParticipant(id: number) {
    return this.httpClient.delete<HttpResponse<Participant>>(`${this.baseUrl}/shares/participants/${id}`)
  }


}
