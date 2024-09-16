export interface ChartDataset {
  label: string,
  color: string,
  order?: number,
  stack?: string,
  data: unknown[],
  tooltipText?: string,
}
