export interface ChartDataset {
  id: idTypes;
  label: string,
  color: string,
  order?: number,
  stack?: string,
  data: unknown[],
  tooltipText?: string,
  yAxisID?:string
}

export type idTypes = "productionActive" | "production" | "surplus" | "surplusActiveShared" | "surplusActive" | "networkActiveConsumption" | "networkConsumption"
