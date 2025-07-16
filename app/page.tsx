"use client"

import { useState } from "react"
import { ChartEditor } from "@/components/chart-editor"
import { ChartPreview } from "@/components/chart-preview"
import { ExportPanel } from "@/components/export-panel"
import { Zone1Navigation } from "@/components/zone1-navigation"
import { Zone2ControlPanel } from "@/components/zone2-control-panel"
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
  isModalContext?: boolean
}


export default function ChartGeneratorPage() {
  const isEmbedMode = useEmbedMode()
  const { config, updateConfig } = useChartConfig()
  const [showExport, setShowExport] = useState(false)
  const [activeSection, setActiveSection] = useState("essentials")

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

  // Normal mode - three-zone layout following original guidelines
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Zone 1: Collapsible Navigation Sidebar */}
        <ErrorBoundary>
          <Zone1Navigation 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            onExportClick={() => setShowExport(true)}
          />
        </ErrorBoundary>
        
        {/* Zone 2: Context-Sensitive Control Panel */}
        <ErrorBoundary>
          <Zone2ControlPanel 
            activeSection={activeSection}
            config={config} 
            onChange={updateConfig}
          />
        </ErrorBoundary>
        
        {/* Zone 3: Chart Preview Area */}
        <main className="flex-1 flex flex-col bg-background" role="main" aria-label="Chart preview">
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
