import {Axios} from "axios";
import {CupsResponseDTO} from "../DTOs/CupsResponseDTO";
import {HttpResponse} from "../../HttpResponse";
import {LegacyCriteria} from "../../../../LegacyCriteria";
import {UserResponseDTO} from "../DTOs/UserResponseDTO";
import {UpdateUserDTO} from "../DTOs/UpdateUserDTO";

export class ZertipowerUserService {
  constructor(private readonly axios: Axios) {
  }

  async getCups(id: number): Promise<CupsResponseDTO[] | undefined> {
    const response = await this.axios.get<HttpResponse<CupsResponseDTO[]>>(`/users/${id}/cups`);
    return response.data.data;
  }

  async getUserByCupsId(id: number): Promise<UserResponseDTO[] | undefined> {
    const response = await this.axios.get<HttpResponse<UserResponseDTO[]>>(`/users/cups/${id}`);
    return response.data.data;
  }

  async get(criteria: LegacyCriteria): Promise<UserResponseDTO[]> {
    const response = await this.axios.get<HttpResponse<UserResponseDTO[]>>("/users", {params: {criteria}});
    return response.data.data;
  }

  async update(id: number, data: UpdateUserDTO): Promise<void> {
    await this.axios.put<void>(`/users/${id}`, data);
  }
}
