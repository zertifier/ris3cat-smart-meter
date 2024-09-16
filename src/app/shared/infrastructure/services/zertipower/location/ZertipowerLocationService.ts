import {Axios} from "axios";
import {HttpResponse} from "../../HttpResponse";

export interface LocationInterface{
  id: number,
  municipality: string,
  province: string,
}

export class ZertipowerLocationService {

  constructor(private readonly axios: Axios) {
  }

  async getLocations(){
    const response = await this.axios.get<HttpResponse<LocationInterface[]>>(`/locations`);

    return response.data.data
  }

}
