"use client"

import { useState } from "react"
import type { ChartConfig, ChartData } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, BarChart3, TrendingUp, PieChart } from "lucide-react"

interface ChartEditorProps {
  config: ChartConfig
  onChange: (config: ChartConfig) => void
}

export function ChartEditor({ config, onChange }: ChartEditorProps) {
  const [jsonInput, setJsonInput] = useState("")

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onChange({ ...config, ...updates })
  }

  const updateDataItem = (index: number, updates: Partial<ChartData>) => {
    const newData = [...config.data]
    newData[index] = { ...newData[index], ...updates }
    updateConfig({ data: newData })
  }

  const addDataItem = () => {
    const newData = [...config.data, { scenario: "New Scenario", value: 0 }]
    updateConfig({ data: newData })
  }

  const removeDataItem = (index: number) => {
    const newData = config.data.filter((_, i) => i !== index)
    updateConfig({ data: newData })
  }

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k"
    }
    return value.toString()
  }

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      if (Array.isArray(parsed)) {
        updateConfig({ data: parsed })
        setJsonInput("")
      }
    } catch (error) {
      alert("Invalid JSON format")
    }
  }

  const chartTypes = [
    { value: "bar", label: "Horizontal Bar", icon: BarChart3 },
    { value: "line", label: "Line Chart", icon: TrendingUp },
    { value: "pie", label: "Pie Chart", icon: PieChart },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold">Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Chart Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              placeholder="Enter chart title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => updateConfig({ subtitle: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              placeholder="Enter subtitle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Chart Type</label>
            <div className="grid grid-cols-1 gap-2">
              {chartTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => updateConfig({ type: type.value as "bar" | "line" | "pie" })}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      config.type === type.value
                        ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                        : "bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-semibold">Data Points</CardTitle>
            <Button onClick={addDataItem} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.data.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
            >
              <input
                type="text"
                value={item.scenario}
                onChange={(e) => updateDataItem(index, { scenario: e.target.value })}
                placeholder="Scenario name"
                className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) => updateDataItem(index, { value: Number.parseInt(e.target.value) || 0 })}
                placeholder="Value"
                className="w-28 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              <span className="text-sm text-purple-300 font-medium w-12 text-center">{formatNumber(item.value)}</span>
              <Button
                onClick={() => removeDataItem(index)}
                size="sm"
                variant="outline"
                className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold">Import JSON Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"scenario": "Year 1", "value": 180000}, {"scenario": "Year 2", "value": 360000}]'
            className="w-full h-24 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
          />
          <Button onClick={handleJsonImport} className="bg-purple-600 hover:bg-purple-700 text-white">
            Import Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
