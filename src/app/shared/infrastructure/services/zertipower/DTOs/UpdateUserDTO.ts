export interface UpdateUserDTO {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  wallet_address: string;
  customer_id?: number;
}
