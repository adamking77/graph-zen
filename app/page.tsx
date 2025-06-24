"use client"

import { useState, useEffect } from "react"
import { ChartEditor } from "@/components/chart-editor"
import { ChartPreview } from "@/components/chart-preview"
import { ExportPanel } from "@/components/export-panel"
import { Header } from "@/components/header"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"

export interface ChartData {
  scenario: string
  value: number
}

export interface ChartConfig {
  title: string
  subtitle: string
  type: "horizontal-bar" | "vertical-bar" | "pie" | "donut" | "line" | "combo"
  data: ChartData[]
  theme?: ColorTheme
}

export default function ChartGeneratorPage() {
  const [isEmbedMode, setIsEmbedMode] = useState(false)
  const [config, setConfig] = useState<ChartConfig>({
    title: "Revenue (€) projections for GraphZen",
    subtitle: "Revenue by year for each scenario",
    type: "horizontal-bar",
    data: [
      { scenario: "Year 1 Conservative", value: 180000 },
      { scenario: "Year 2 Growth Scenario", value: 360000 },
      { scenario: "Year 3 Scale Scenario", value: 690000 },
    ],
    theme: {
      palette: {
        id: 'dashboard-pro',
        name: 'Dashboard Pro',
        colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
        type: 'colorful'
      },
      borderStyle: 'none',
      borderColor: '#6B7280',
      cornerStyle: 'rounded',
      background: 'black',
      // Style defaults
      sortHighToLow: false,
      showDataLabels: true,
      showPercentages: false,
      showGridLines: true,
      // Number format defaults
      abbreviation: 'auto',
      decimalPlaces: 'auto',
      fixedDecimalCount: 0
    }
  })

  const [showExport, setShowExport] = useState(false)

  // Handle URL parameters for sharing and embedding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const embedMode = urlParams.get('embed') === 'true'
    const configParam = urlParams.get('config')
    
    setIsEmbedMode(embedMode)
    
    if (configParam) {
      try {
        const decodedConfig = JSON.parse(decodeURIComponent(escape(atob(configParam))))
        if (decodedConfig && typeof decodedConfig === 'object') {
          setConfig(decodedConfig)
        }
      } catch (error) {
        console.warn('Failed to decode shared chart config:', error)
      }
    }
  }, [])

  // Embed mode - simplified layout
  if (isEmbedMode) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <ChartPreview config={config} />
      </div>
    )
  }

  // Normal mode - full interface
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-[400px] border-r border-gray-800/30 bg-[#161616] flex flex-col">
          <ChartEditor config={config} onChange={setConfig} />
          <div className="p-6 mt-auto">
            <button
              onClick={() => setShowExport(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              Export Chart
            </button>
          </div>
        </div>
        
        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col">
          <ChartPreview config={config} />
        </div>
      </div>
      {showExport && <ExportPanel config={config} onClose={() => setShowExport(false)} />}
    </div>
  )
}
