import { type ColorTheme } from "@/components/color-palette"

export interface ChartData {
  scenario: string
  value: number
  displayValue?: string
}

export interface ChartDataSeries {
  name: string
  data: ChartData[]
  color?: string
  visible?: boolean  // Toggle visibility of this series
}

export interface ChartDimensions {
  width: number
  height: number
  preset: string
  aspectRatio: string
}

export interface ChartConfig {
  title: string
  subtitle: string
  type: "horizontal-bar" | "vertical-bar" | "pie" | "donut" | "line" | "combo"
  data: ChartData[]
  series?: ChartDataSeries[]  // Multi-series support
  multiSeries?: boolean       // Toggle for multi-series mode
  dimensions?: ChartDimensions
  theme?: ColorTheme
  isModalContext?: boolean
  isSeriesEditingMode?: boolean // Flag for series editing context
}