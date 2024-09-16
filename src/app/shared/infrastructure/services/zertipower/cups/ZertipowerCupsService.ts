import {Axios} from "axios";
import {HttpResponse} from "../../HttpResponse";

export class ZertipowerCupsService {
  constructor(private axios: Axios) {
  }

  public async datadisActive(cupsId: number) {
    const response = await this.axios.get<HttpResponse<{ active: boolean }>>(`/cups/datadis-active/${cupsId}`);
    const body = response.data;

    const { active } = body.data;

    return active;
  }

  public async registerDatadis(customerId: number, cups: string, dni: string, datadisUser: string, datadisPassword: string) {
    await this.axios.post('/cups/datadis', {customerId, cups, datadisPassword, datadisUser, dni});
  }

  public async updateCupsReference(cupsId: number, reference: string){
    return await this.axios.put(`/cups/${cupsId}`, {reference})
  }
}
