export interface EnergyStatDTO {
  activeMembers: number,
  id: number;
  infoDt: string; // Date
  cupsId?: number;
  origin: string;
  kwhIn: number;
  kwhOut: number;
  kwhOutVirtual: number;
  kwhInPrice: number;
  kwhOutPrice: number;
  kwhInPriceCommunity: number;
  kwhOutPriceCommunity: number;
  type: string;
  createdAt: string; // Date
  updatedAt: string; // Date
  productionActives: number,
  communityId?: number
  production: number,
  communitiesCups: CommunitiesCups[] | [];
}

export interface DatadisEnergyStat {
  id: number;
  activeMembers: number;
  infoDt: Date;
  cupsId?: number;
  origin: string;
  kwhIn: number;
  kwhOut: number;
  kwhOutVirtual: number;
  kwhInPrice: number;
  kwhOutPrice: number;
  kwhInPriceCommunity: number;
  kwhOutPriceCommunity: number;
  type: string;
  createdAt: Date;
  productionActives: number;
  updatedAt: Date;
  communityId?: number;
  production: number;
  communitiesCups: CommunitiesCups[] | [];
}


export interface CommunitiesCups{
  kwhOut: number;
  infoDt: string;
  cupsId: number;
  cups: string;
  reference: string | null;
}
