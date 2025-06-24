"use client"

import { useState, useRef } from "react"
import type { ChartConfig, ChartData } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, BarChart3, TrendingUp, PieChart, Upload, FileText, X, AlertTriangle, CheckCircle } from "lucide-react"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"

interface PreviewDataItem {
  scenario: string
  value: number
  status: 'valid' | 'warning' | 'error'
  message?: string
}

interface ChartEditorProps {
  config: ChartConfig
  onChange: (config: ChartConfig) => void
}

export function ChartEditor({ config, onChange }: ChartEditorProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [pasteInput, setPasteInput] = useState("")
  const [importMode, setImportMode] = useState<'json' | 'csv' | 'paste'>('json')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewDataItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Smart number parsing - handles currency symbols, commas, K/M suffixes
  const parseSmartNumber = (value: string): number => {
    if (typeof value === 'number') return value
    
    // Remove currency symbols and whitespace
    let cleaned = value.toString().replace(/[$€£¥₹,\s]/g, '')
    
    // Handle K/M suffixes
    const lastChar = cleaned.slice(-1).toLowerCase()
    if (lastChar === 'k') {
      return parseFloat(cleaned.slice(0, -1)) * 1000
    } else if (lastChar === 'm') {
      return parseFloat(cleaned.slice(0, -1)) * 1000000
    }
    
    return parseFloat(cleaned) || 0
  }

  // Validate and create preview data
  const validateData = (data: ChartData[]): PreviewDataItem[] => {
    return data.map(item => {
      let status: 'valid' | 'warning' | 'error' = 'valid'
      let message: string | undefined
      
      if (!item.scenario || item.scenario.trim() === '') {
        status = 'error'
        message = 'Missing scenario name'
      } else if (item.value === 0) {
        status = 'warning'
        message = 'Value is zero'
      } else if (item.value < 0) {
        status = 'warning'
        message = 'Negative value'
      } else if (item.value > 1000000000) {
        status = 'warning'
        message = 'Very large value'
      }
      
      return {
        scenario: item.scenario,
        value: item.value,
        status,
        message
      }
    })
  }

  // Parse CSV content
  const parseCSV = (csvText: string): ChartData[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 1) return []
    
    // Skip header row if it looks like a header
    const hasHeader = lines[0] && isNaN(parseSmartNumber(lines[0].split(',')[1] || '0'))
    const dataRows = hasHeader ? lines.slice(1) : lines
    
    return dataRows.map(line => {
      const columns = line.split(',')
      return {
        scenario: columns[0]?.replace(/"/g, '').trim() || 'Unknown',
        value: parseSmartNumber(columns[1] || '0')
      }
    }).filter(item => item.scenario.trim() !== '')
  }

  // Parse pasted spreadsheet data (tab or comma separated)
  const parsePastedData = (pastedText: string): ChartData[] => {
    const lines = pastedText.trim().split('\n')
    if (lines.length < 1) return []
    
    return lines.map(line => {
      // Try tab-separated first (Excel default), then comma-separated
      const columns = line.includes('\t') ? line.split('\t') : line.split(',')
      return {
        scenario: columns[0]?.trim() || 'Unknown',
        value: parseSmartNumber(columns[1] || '0')
      }
    }).filter(item => item.scenario.trim() !== '')
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

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      const parsedData = parseCSV(csvText)
      if (parsedData.length > 0) {
        const validated = validateData(parsedData)
        setPreviewData(validated)
        setShowPreview(true)
      } else {
        alert('No valid data found in CSV file')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePasteImport = () => {
    const parsedData = parsePastedData(pasteInput)
    if (parsedData.length > 0) {
      const validated = validateData(parsedData)
      setPreviewData(validated)
      setShowPreview(true)
    } else {
      alert('No valid data found in pasted content')
    }
  }

  const confirmImport = () => {
    const validData = previewData
      .filter(item => item.status !== 'error')
      .map(item => ({ scenario: item.scenario, value: item.value }))
    
    if (validData.length > 0) {
      updateConfig({ data: validData })
      setShowPreview(false)
      setPreviewData([])
      setPasteInput("")
    }
  }

  const cancelImport = () => {
    setShowPreview(false)
    setPreviewData([])
  }

  const chartTypes = [
    { value: "horizontal-bar", label: "Horizontal Bar", icon: BarChart3 },
    { value: "vertical-bar", label: "Vertical Bar", icon: BarChart3 },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "donut", label: "Donut Chart", icon: PieChart },
    { value: "line", label: "Line Chart", icon: TrendingUp },
    { value: "combo", label: "Combo Chart", icon: TrendingUp },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Configuration Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Chart Configuration */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Chart Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="Enter chart title"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Subtitle</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => updateConfig({ subtitle: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="Enter subtitle"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        {/* Chart Type Selection */}
        <div className="space-y-3">
          
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => updateConfig({ type: type.value as "horizontal-bar" | "vertical-bar" | "pie" | "donut" | "line" | "combo" })}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-xs ${
                    config.type === type.value
                      ? "bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-sm"
                      : "bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="font-medium">{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Data Points */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-normal flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
              Selected the top 3 scenarios by revenue
            </h3>
            <Button onClick={addDataItem} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-2">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="bg-gray-900/30 border border-gray-800/30 rounded-lg p-3">
            <div className="space-y-2">
              {config.data.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center p-2 bg-gray-800/30 rounded border border-gray-700/30"
                >
                  <input
                    type="text"
                    value={item.scenario}
                    onChange={(e) => updateDataItem(index, { scenario: e.target.value })}
                    placeholder="Scenario name"
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded px-2 py-1 text-xs text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    suppressHydrationWarning
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateDataItem(index, { value: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Value"
                    className="w-20 bg-gray-800/50 border border-gray-700/50 rounded px-2 py-1 text-xs text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    suppressHydrationWarning
                  />
                  <span className="text-xs text-purple-300 font-medium w-8 text-center">{formatNumber(item.value)}</span>
                  <Button
                    onClick={() => removeDataItem(index)}
                    size="sm"
                    variant="outline"
                    className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Import Data Section */}
        <div className="space-y-3">
          <h3 className="text-white text-sm font-normal flex items-center gap-2">
            <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
            Import Data
          </h3>
          
          {/* Import Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-gray-800/30 rounded-lg p-1">
            <button
              onClick={() => setImportMode('csv')}
              className={`py-2 px-3 rounded text-xs transition-all ${
                importMode === 'csv'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              CSV File
            </button>
            <button
              onClick={() => setImportMode('paste')}
              className={`py-2 px-3 rounded text-xs transition-all ${
                importMode === 'paste'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Copy/Paste
            </button>
            <button
              onClick={() => setImportMode('json')}
              className={`py-2 px-3 rounded text-xs transition-all ${
                importMode === 'json'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              JSON
            </button>
          </div>
          
          <div className="bg-gray-900/30 border border-gray-800/30 rounded-lg p-3">
            {importMode === 'csv' && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCSVImport}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg text-gray-300 hover:text-white transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Click to upload CSV file</span>
                </button>
                <p className="text-xs text-gray-400">
                  Expected format: First column = labels, Second column = values
                </p>
              </div>
            )}
            
            {importMode === 'paste' && (
              <div className="space-y-3">
                <textarea
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  placeholder="Paste from Excel/Google Sheets:\nYear 1\t180000\nYear 2\t360000\nYear 3\t690000"
                  className="w-full h-20 bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-xs text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                />
                <Button onClick={handlePasteImport} className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3">
                  Import Pasted Data
                </Button>
                <p className="text-xs text-gray-400">
                  Supports tab-separated (Excel) or comma-separated data
                </p>
              </div>
            )}
            
            {importMode === 'json' && (
              <div className="space-y-3">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='[{"scenario": "Year 1", "value": 180000}]'
                  className="w-full h-16 bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-xs text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                />
                <Button onClick={handleJsonImport} className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3">
                  Import JSON Data
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Data Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white text-lg font-medium">Data Preview</h3>
                  <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-sm">
                    {previewData.length} rows found
                  </span>
                </div>
                <button
                  onClick={cancelImport}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary */}
              <div className="mb-4">
                {(() => {
                  const errors = previewData.filter(item => item.status === 'error').length
                  const warnings = previewData.filter(item => item.status === 'warning').length
                  const valid = previewData.filter(item => item.status === 'valid').length
                  
                  return (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>{valid} valid</span>
                      </div>
                      {warnings > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{warnings} warnings</span>
                        </div>
                      )}
                      {errors > 0 && (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{errors} errors</span>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto mb-4">
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg overflow-hidden">
                  <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700/50">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-400">
                      <div className="col-span-5">Scenario</div>
                      <div className="col-span-4">Value</div>
                      <div className="col-span-3">Status</div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {previewData.map((item, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 border-b border-gray-700/30 last:border-b-0 ${
                          item.status === 'error' ? 'bg-red-500/10' :
                          item.status === 'warning' ? 'bg-yellow-500/10' :
                          'hover:bg-gray-800/30'
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center text-sm">
                          <div className="col-span-5 text-white truncate">
                            {item.scenario}
                          </div>
                          <div className="col-span-4 text-gray-300">
                            {item.value.toLocaleString()}
                          </div>
                          <div className="col-span-3 flex items-center gap-1">
                            {item.status === 'valid' && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs">Valid</span>
                              </>
                            )}
                            {item.status === 'warning' && (
                              <>
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 text-xs" title={item.message}>
                                  Warning
                                </span>
                              </>
                            )}
                            {item.status === 'error' && (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-xs" title={item.message}>
                                  Error
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {item.message && (
                          <div className="mt-1 text-xs text-gray-400">
                            {item.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-400">
                  {previewData.filter(item => item.status === 'error').length > 0
                    ? 'Rows with errors will be skipped'
                    : 'All data looks good!'}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={cancelImport}
                    variant="outline"
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmImport}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                    disabled={previewData.filter(item => item.status !== 'error').length === 0}
                  >
                    Import This Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Color Palette */}
        <div>
          <ColorPalette 
            theme={config.theme || {
              mode: 'dark',
              palette: {
                id: 'colorful-rainbow',
                name: 'Colorful',
                colors: ['#8B5CF6', '#06D6A0', '#FFD23F', '#FF6B6B', '#4ECDC4'],
                type: 'preset'
              },
              borderStyle: 'none',
              cornerStyle: 'rounded',
              background: 'black'
            }}
            onChange={(theme) => updateConfig({ theme })}
          />
        </div>

      </div>
    </div>
  )
}
