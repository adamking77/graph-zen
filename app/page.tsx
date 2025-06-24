"use client"

import { useState } from "react"
import { ChartEditor } from "@/components/chart-editor"
import { ChartPreview } from "@/components/chart-preview"
import { ExportPanel } from "@/components/export-panel"
import { Header } from "@/components/header"

export interface ChartData {
  scenario: string
  value: number
}

export interface ChartConfig {
  title: string
  subtitle: string
  type: "bar" | "line" | "pie"
  data: ChartData[]
}

export default function ChartGeneratorPage() {
  const [config, setConfig] = useState<ChartConfig>({
    title: "Revenue (€) projections for GenZen",
    subtitle: "Revenue by year for each scenario",
    type: "bar",
    data: [
      { scenario: "Year 1 Conservative", value: 180000 },
      { scenario: "Year 2 Growth Scenario", value: 360000 },
      { scenario: "Year 3 Scale Scenario", value: 690000 },
    ],
  })

  const [showExport, setShowExport] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <ChartEditor config={config} onChange={setConfig} />
            <button
              onClick={() => setShowExport(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              Export Chart
            </button>
          </div>
          <div className="xl:col-span-3">
            <ChartPreview config={config} />
          </div>
        </div>
      </div>
      {showExport && <ExportPanel config={config} onClose={() => setShowExport(false)} />}
    </div>
  )
}
