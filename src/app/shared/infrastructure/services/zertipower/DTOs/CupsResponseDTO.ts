export interface CupsResponseDTO {
  id: number;
  cups: string;
  community_id: number;
  provider_id: number;
  surplus_distribution: string;
  location_id: number;
  customer_id: number;
  type: string;
  datadis_active: number;
  smart_meter_active: number;
  smart_meter_model: "";
  inverter_active: number;
  sensor_active: number;
  created_at: string;
  updated_at: string;
  reference: string | null;
}
