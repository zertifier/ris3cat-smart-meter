import { Injectable, OnInit } from "@angular/core";
import { Axios } from "axios";

export interface CustomerDTO {
  id: number,
  name: string,
  walletAddress: string,
  balance: number,
  createdAt: number,
  updatedAt: number
}

@Injectable({
  providedIn: 'root'
})
export class ZertipowerCustomersService {

  customers: CustomerDTO[] = [];

  constructor(private axios: Axios) {
    //this.get().catch(err => { console.log(err) })
  }

  async getCustomerById(customerId: number) {
    await this.get();
    if (this.customers.length > 0) {
      return this.customers.find(customer => customer.id == customerId)
    } else {
      await this.get()
      return this.customers.find(customer => customer.id == customerId)
    }
  }

  public async datadisActive(customerId: number) {
    const response = await this.axios.get(`/customers/datadis-active/${customerId}`);
    const body = response.data;
    return body.data;
  }

  public async get(): Promise<CustomerDTO[]> {
    const response = await this.axios.get('/customers');
    this.customers = response.data.data;
    return response.data.data;
  }

  // async updateCustomerBalance(customerId:number,currentBalance: number){
  //   const response = await this.axios.put(`/customers/${customerId}`,{balance:currentBalance});
  // }

}
