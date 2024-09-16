import {Injectable} from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {HttpResponse} from "../../../../shared/infrastructure/services/HttpResponse";

export interface VotesWithQty {
  optionId: number,
  qty: number,
  votes: number
}

export interface UserVote{
  optionId: number
}
@Injectable({
  providedIn: 'root'
})
export class VotesService {
  baseUrl = environment.zertipower_url
  // baseUrl= 'http://localhost:3000'

  constructor(
    private httpClient: HttpClient,
  ) { }

  getVotesByProposalId(proposalId: number){
    return this.httpClient.get<HttpResponse<VotesWithQty[]>>(`${this.baseUrl}/votes/proposal/${proposalId}`)
  }
  getVotesByProposalIdAndUserId(proposalId: number, userId: number){
    return this.httpClient.get<HttpResponse<UserVote>>(`${this.baseUrl}/votes/proposal/${proposalId}/user/${userId}`)
  }
  getTotalCupsByCommunityId(communityId: number){
    return this.httpClient.get<HttpResponse<{total: number}>>(`${this.baseUrl}/cups/community/${communityId}/total/`)
  }

  getCustomerSharesByCommunityAndCustomer(communityId: number, customerId: number){
    return this.httpClient.get<HttpResponse<{shares: number}>>(`${this.baseUrl}/shares/community/${communityId}/customer/${customerId}`)
  }

  postVote(userId: number, proposalId: number, proposalOptionId: number){
    const body = {userId, proposalId, optionId: proposalOptionId}

    return this.httpClient.post<HttpResponse<any>>(`${this.baseUrl}/votes`, body)
  }
}
