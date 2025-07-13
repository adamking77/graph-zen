"use client"

import { useState } from "react"
import { ChartEditor } from "@/components/chart-editor"
import { ChartPreview } from "@/components/chart-preview"
import { ExportPanel } from "@/components/export-panel"
import { Header } from "@/components/header"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"
import { ErrorBoundary } from "@/components/error-boundary"
import { useChartConfig } from "@/hooks/use-chart-config"
import { useEmbedMode } from "@/hooks/use-embed-mode"
import { SIZE_PRESETS } from "@/lib/chart-constants"

export interface ChartData {
  scenario: string
  value: number
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
  dimensions?: ChartDimensions
  theme?: ColorTheme
}


export default function ChartGeneratorPage() {
  const isEmbedMode = useEmbedMode()
  const { config, updateConfig } = useChartConfig()
  const [showExport, setShowExport] = useState(false)

  // Embed mode - simplified layout
  if (isEmbedMode) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <ErrorBoundary>
          <main role="main" aria-label="Chart display">
            <ChartPreview config={config} />
          </main>
        </ErrorBoundary>
      </div>
    )
  }

  // Normal mode - full interface
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <aside
          className="w-[400px] border-r border-gray-800/30 bg-[#161616] flex flex-col"
          role="complementary"
          aria-label="Chart editor and controls"
        >
          <ErrorBoundary>
            <ChartEditor config={config} onChange={updateConfig} />
          </ErrorBoundary>
          <div className="p-6 mt-auto">
            <button
              onClick={() => setShowExport(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Export chart to various formats"
            >
              Export Chart
            </button>
          </div>
        </aside>
        
        {/* Main Chart Area */}
        <main className="flex-1 flex flex-col" role="main" aria-label="Chart preview">
          <ErrorBoundary>
            <ChartPreview config={config} />
          </ErrorBoundary>
        </main>
      </div>
      {showExport && (
        <div role="dialog" aria-modal="true" aria-label="Export chart dialog">
          <ExportPanel config={config} onClose={() => setShowExport(false)} />
        </div>
      )}
    </div>
  )
}
