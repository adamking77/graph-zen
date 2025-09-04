"use client"

import { useState, useRef } from "react"
import type { ChartConfig, ChartData } from "@/types/chart"
import { Button } from "@/components/ui/button"
import { Plus, Upload, FileText, BarChart3, AlignLeft, TrendingUp, PieChart, CircleDot, Activity, X } from "lucide-react"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"
import { StyleControls } from "@/components/style-controls"
import { LayoutControls } from "@/components/layout-controls"
import { SizeSelector } from "@/components/size-selector"
import { DataEditorDialog } from "@/components/data-editor-dialog"
import { TouchTarget } from "@/components/touch-target"

interface Zone2ControlPanelProps {
  activeSection: string
  config: ChartConfig
  onChange: (config: ChartConfig) => void
  isMobile?: boolean
  onClose?: () => void
  isStacked?: boolean
}

export function Zone2ControlPanel({ activeSection, config, onChange, isMobile = false, onClose, isStacked = false }: Zone2ControlPanelProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [pasteInput, setPasteInput] = useState("")
  const [importMode, setImportMode] = useState<'json' | 'csv' | 'paste'>('json')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onChange({ ...config, ...updates })
  }

  const defaultTheme: ColorTheme = {
    palette: {
      id: 'dashboard-pro',
      name: 'Dashboard Pro',
      colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
      type: 'colorful' as const
    },
    borderStyle: 'none' as const,
    cornerStyle: 'rounded' as const,
    background: 'black' as const,
    showChartTotal: false,
    titleAlignment: 'center' as const,
    sortOrder: 'none' as const,
    legendPosition: 'right' as const
  }

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k"
    }
    return value.toString()
  }

  // Smart number parsing for import functionality
  const parseSmartNumber = (str: string): number => {
    if (!str || typeof str !== 'string') return 0
    
    // Remove common currency symbols and whitespace
    let cleaned = str.replace(/[\$£€¥₹,\s]/g, '')
    
    // Handle percentages
    if (cleaned.includes('%')) {
      const num = parseFloat(cleaned.replace('%', ''))
      return isNaN(num) ? 0 : num
    }
    
    // Handle K, M, B suffixes (case insensitive)
    const lastChar = cleaned.slice(-1).toLowerCase()
    const numPart = cleaned.slice(0, -1)
    
    if (lastChar === 'k') {
      const num = parseFloat(numPart)
      return isNaN(num) ? 0 : num * 1000
    } else if (lastChar === 'm') {
      const num = parseFloat(numPart)
      return isNaN(num) ? 0 : num * 1000000
    } else if (lastChar === 'b') {
      const num = parseFloat(numPart)
      return isNaN(num) ? 0 : num * 1000000000
    }
    
    // Regular number
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  // Parse pasted data (tab or comma separated)
  const parsePastedData = (text: string): ChartData[] => {
    if (!text.trim()) return []
    
    const lines = text.trim().split('\n')
    const data: ChartData[] = []
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      // Try tab-separated first, then comma-separated
      let parts = line.split('\t')
      if (parts.length < 2) {
        parts = line.split(',')
      }
      
      if (parts.length >= 2) {
        const scenario = parts[0].trim()
        const valueStr = parts[1].trim()
        const value = parseSmartNumber(valueStr)
        
        if (scenario && !isNaN(value)) {
          data.push({ scenario, value })
        }
      }
    }
    
    return data
  }

  // Handle importing pasted data
  const handlePasteImport = () => {
    if (!pasteInput.trim()) return
    
    const parsedData = parsePastedData(pasteInput)
    if (parsedData.length > 0) {
      updateConfig({ data: parsedData })
    }
  }

  const chartTypes = [
    { 
      value: "horizontal-bar", 
      label: "Horizontal Bar", 
      icon: AlignLeft,
      description: "Great for comparing categories with long names"
    },
    { 
      value: "vertical-bar", 
      label: "Vertical Bar", 
      icon: BarChart3,
      description: "Perfect for showing values across categories"
    },
    { 
      value: "pie", 
      label: "Pie Chart", 
      icon: PieChart,
      description: "Ideal for showing parts of a whole"
    },
    { 
      value: "donut", 
      label: "Donut Chart", 
      icon: CircleDot,
      description: "Like pie charts, but with space for totals"
    },
    { 
      value: "line", 
      label: "Line Chart", 
      icon: TrendingUp,
      description: "Best for showing trends over time"
    },
    { 
      value: "combo", 
      label: "Combo Chart", 
      icon: Activity,
      description: "Combines bars and lines for rich data stories"
    },
  ]

  const renderEssentials = () => (
    <div className="space-y-6">
      {/* Chart Type */}
      <div className="space-y-3">
        <h3 className="text-fluid-sm font-normal text-foreground">Chart Type</h3>
        <div className="grid grid-cols-responsive gap-2">
          {chartTypes.map((type) => {
            const Icon = type.icon
            const isSelected = config.type === type.value
            return (
              <TouchTarget
                key={type.value}
                variant="custom"
                size="md"
                onClick={() => updateConfig({ type: type.value as any })}
                className={`flex flex-col items-center gap-1 h-16 border transition-all duration-200 ${
                  isSelected
                    ? "bg-primary/10 border-transparent text-primary"
                    : "bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground"
                }`}
                hapticFeedback="light"
              >
                <Icon className={`w-4 h-4 transition-all duration-200 ${
                  isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`} />
                <div className={`text-xs font-medium transition-all duration-200 text-center ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}>
                  {type.label}
                </div>
              </TouchTarget>
            )
          })}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-3">
        <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          Title & Subtitle
        </h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Chart Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              className="w-full bg-input border-border text-foreground placeholder-muted-foreground rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_8px_rgba(99,102,241,0.12)]"
              placeholder="Enter chart title"
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Subtitle (Optional)</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => updateConfig({ subtitle: e.target.value })}
              className="w-full bg-input border-border text-foreground placeholder-muted-foreground rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_8px_rgba(99,102,241,0.12)]"
              placeholder="Enter subtitle (optional)"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>


      {/* Layout Controls */}
      <LayoutControls 
        theme={config.theme || defaultTheme}
        chartType={config.type}
        onChange={(themeUpdates) => updateConfig({ theme: { ...(config.theme || defaultTheme), ...themeUpdates } })}
      />

      {/* Style Controls */}
      <StyleControls 
        theme={config.theme || defaultTheme}
        chartType={config.type}
        onChange={(themeUpdates) => updateConfig({ theme: { ...(config.theme || defaultTheme), ...themeUpdates } })}
      />
    </div>
  )

  const renderData = () => {
    const supportsMultiSeries = ['vertical-bar', 'horizontal-bar', 'line', 'combo'].includes(config.type)
    const isMultiSeries = config.multiSeries && config.series && config.series.length > 0
    const series = config.series || []

    return (
      <div className="space-y-6">
        {/* Multi-Series Data Input */}
        {isMultiSeries ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Comparison Data ({series.length} series)
              </h4>
              <button
                onClick={() => {
                  // Convert back to single series
                  const primaryData = series.length > 0 ? series[0].data : config.data
                  updateConfig({ 
                    multiSeries: false, 
                    series: undefined,
                    data: primaryData
                  })
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Switch to Single Dataset
              </button>
            </div>

            {/* Series Input Areas */}
            <div className="grid grid-cols-1 gap-4">
              {series.map((seriesItem, seriesIndex) => (
                <div key={seriesIndex} className="p-4 border border-border/40 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ 
                          backgroundColor: seriesItem.color || (config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"])[seriesIndex === 0 ? 0 : (seriesIndex % 4) + 1] 
                        }} 
                      />
                      <input
                        type="text"
                        value={seriesItem.name}
                        onChange={(e) => {
                          const updatedSeries = [...series]
                          updatedSeries[seriesIndex] = { ...seriesItem, name: e.target.value }
                          updateConfig({ series: updatedSeries })
                        }}
                        className="bg-transparent text-sm font-medium text-foreground border-none outline-none focus:bg-background/50 rounded px-1 py-0.5"
                        placeholder="Series name"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Series Visibility Toggle */}
                      <button
                        onClick={() => {
                          const updatedSeries = [...series]
                          updatedSeries[seriesIndex] = { 
                            ...seriesItem, 
                            visible: seriesItem.visible !== false ? false : true
                          }
                          updateConfig({ series: updatedSeries })
                        }}
                        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                          seriesItem.visible !== false 
                            ? 'text-foreground hover:bg-muted/50' 
                            : 'text-muted-foreground hover:bg-muted/30'
                        }`}
                        title={seriesItem.visible !== false ? 'Hide series' : 'Show series'}
                      >
                        {seriesItem.visible !== false ? '👁️' : '🙈'}
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {seriesItem.data.length} items
                      </span>
                      {series.length > 1 && (
                        <button
                          onClick={() => {
                            const updatedSeries = series.filter((_, i) => i !== seriesIndex)
                            if (updatedSeries.length === 0) {
                              // If removing all series, switch back to single mode
                              updateConfig({ 
                                multiSeries: false, 
                                series: undefined,
                                data: seriesItem.data
                              })
                            } else {
                              updateConfig({ series: updatedSeries })
                            }
                          }}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Data Preview for this series */}
                  <div className="space-y-2">
                    {seriesItem.data.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-full bg-background/50 border border-border/20 text-foreground rounded px-3 py-1.5 text-xs flex justify-between"
                      >
                        <span className="truncate">{item.scenario}</span>
                        <span className="text-primary font-medium">{formatNumber(item.value)}</span>
                      </div>
                    ))}
                    {seriesItem.data.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{seriesItem.data.length - 3} more items...
                      </div>
                    )}
                  </div>

                  {/* Edit Data Button for each series */}
                  <div className="mt-3">
                    <DataEditorDialog 
                      config={{
                        ...config, 
                        data: seriesItem.data,
                        series: [{ ...seriesItem, data: seriesItem.data }],
                        multiSeries: false, // Force single-series preview mode
                        isSeriesEditingMode: true // Flag to indicate series editing context
                      }} 
                      onConfigChange={(updatedConfig) => {
                        const updatedSeries = [...series]
                        updatedSeries[seriesIndex] = { ...seriesItem, data: updatedConfig.data }
                        updateConfig({ series: updatedSeries })
                      }}
                    >
                      <TouchTarget
                        variant="custom"
                        size="sm"
                        className="w-full flex items-center justify-center gap-1 h-8 bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground transition-all duration-200 border rounded text-xs"
                        hapticFeedback="light"
                      >
                        <Plus className="w-3 h-3" />
                        Edit {seriesItem.name} Data
                      </TouchTarget>
                    </DataEditorDialog>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Series Button */}
            <TouchTarget
              variant="custom"
              size="sm"
              onClick={() => {
                const newSeries = [
                  ...series,
                  {
                    name: `Dataset ${series.length + 1}`,
                    data: [
                      { scenario: "Category A", value: Math.floor(Math.random() * 100) + 20 },
                      { scenario: "Category B", value: Math.floor(Math.random() * 100) + 20 },
                      { scenario: "Category C", value: Math.floor(Math.random() * 100) + 20 }
                    ],
                    color: undefined
                  }
                ]
                updateConfig({ series: newSeries })
              }}
              className="w-full flex items-center justify-center gap-2 h-12 bg-transparent border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 rounded-lg"
              hapticFeedback="light"
            >
              <Plus className="w-4 h-4" />
              Add Another Dataset for Comparison
            </TouchTarget>
          </div>
        ) : (
          <>
            {/* Single Series Data Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Current Data
                </h4>
                <DataEditorDialog config={config} onConfigChange={onChange}>
                  <TouchTarget
                    variant="primary"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                    style={{outline: 'none', boxShadow: 'none'}}
                    onFocus={(e) => e.currentTarget.blur()}
                    hapticFeedback="light"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Edit Data
                  </TouchTarget>
                </DataEditorDialog>
              </div>
              
              <div className="space-y-2">
                {config.data.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="w-full bg-input border-border text-foreground rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary flex gap-2 items-center justify-between"
                  >
                    <div className="text-sm text-foreground truncate">
                      {item.scenario}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      {formatNumber(item.value)}
                    </div>
                  </div>
                ))}
                {config.data.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{config.data.length - 5} more items...
                  </div>
                )}
              </div>
            </div>

            {/* Add Comparison Data Button */}
            {supportsMultiSeries && (
              <div className="space-y-3">
                <TouchTarget
                  variant="custom"
                  size="sm"
                  onClick={() => {
                    // Initialize multi-series with current data as first series
                    const defaultSeries = [
                      {
                        name: "Dataset 1",
                        data: config.data || [],
                        color: undefined
                      },
                      {
                        name: "Dataset 2", 
                        data: [
                          { scenario: "Category A", value: Math.floor(Math.random() * 100) + 20 },
                          { scenario: "Category B", value: Math.floor(Math.random() * 100) + 20 },
                          { scenario: "Category C", value: Math.floor(Math.random() * 100) + 20 }
                        ],
                        color: undefined
                      }
                    ]
                    updateConfig({ multiSeries: true, series: defaultSeries })
                  }}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-transparent border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 rounded-lg"
                  hapticFeedback="light"
                >
                  <Plus className="w-4 h-4" />
                  Add Comparison Data
                </TouchTarget>
                <p className="text-xs text-muted-foreground text-center">
                  Compare multiple datasets side-by-side in the same chart
                </p>
              </div>
            )}

            {/* Quick Import */}
            <div className="space-y-3">
              <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Quick Import
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <TouchTarget
                  variant="custom"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1 h-10 bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground transition-all duration-200 border rounded-lg"
                  hapticFeedback="light"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs">CSV File</span>
                </TouchTarget>
                <TouchTarget
                  variant="custom"
                  size="sm"
                  onClick={() => {
                    const sampleData = "Product A\t$2.4M\nProduct B\t$1.8M\nProduct C\t$3.1M\nProduct D\t$850K\nProduct E\t$1.2M\nProduct F\t$640K"
                    setPasteInput(sampleData)
                    // Parse and import the sample data immediately
                    const parsedData = parsePastedData(sampleData)
                    if (parsedData.length > 0) {
                      if (isMultiSeries && series.length > 0) {
                        // Update the first series if in multi-series mode
                        const updatedSeries = [...series]
                        updatedSeries[0] = { ...updatedSeries[0], data: parsedData }
                        updateConfig({ series: updatedSeries })
                      } else {
                        updateConfig({ data: parsedData })
                      }
                    }
                  }}
                  className="flex items-center justify-center gap-1 h-10 bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground transition-all duration-200 border rounded-lg"
                  hapticFeedback="light"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Sample Data</span>
                </TouchTarget>
              </div>
              <input
                type="file"
                accept=".csv,.txt"
                ref={fileInputRef}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>
    )
  }

  const renderAppearance = () => (
    <div className="space-y-6">
      {/* Size Selector */}
      <div className="space-y-3">
        <SizeSelector 
          value={config.dimensions || { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' }}
          onChange={(dimensions) => updateConfig({ dimensions })}
        />
      </div>

      {/* Color Palette */}
      <div className="space-y-3">
        <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          Color Palette
        </h4>
        <ColorPalette 
          theme={config.theme || defaultTheme}
          chartType={config.type}
          onChange={(theme) => updateConfig({ theme })}
        />
      </div>
    </div>
  )

  const renderAdvanced = () => (
    <div className="space-y-6">
      {/* Import Options */}
      <div className="space-y-3">
        <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          Import Options
        </h4>
        
        {/* Import Mode Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {(['csv', 'paste', 'json'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setImportMode(mode)}
              className={`py-3 px-4 rounded-lg text-sm transition-all duration-200 border ${
                importMode === mode
                  ? 'bg-primary/10 border-transparent text-primary'
                  : 'bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {mode === 'csv' ? 'CSV File' : mode === 'paste' ? 'Copy/Paste' : 'JSON'}
            </button>
          ))}
        </div>
        
        <div className="bg-secondary/20 border-border rounded-lg p-3">
          {importMode === 'csv' && (
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed bg-transparent border-border/40 hover:border-primary/30 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                <span className="text-xs">Click to upload CSV file</span>
              </button>
              <p className="text-xs text-muted-foreground">
                Expected format: First column = labels, Second column = values
              </p>
            </div>
          )}
          
          {importMode === 'paste' && (
            <div className="space-y-2">
              <textarea
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                placeholder="Paste from Excel/Google Sheets:\nQ1 Sales\t$1.2M\nQ2 Sales\t950K\nQ3 Sales\t75%\nQ4 Sales\t2.1B"
                className="w-full h-24 bg-input border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_8px_rgba(99,102,241,0.12)] transition-all duration-200 resize-none"
              />
              <Button onClick={handlePasteImport} className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-xs">
                Import Pasted Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports tab-separated (Excel) or comma-separated data. Auto-detects currency symbols, K/M/B suffixes, and percentages
              </p>
            </div>
          )}
          
          {importMode === 'json' && (
            <div className="space-y-2">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"scenario": "Year 1", "value": 180000}]'
                className="w-full h-20 bg-input border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_8px_rgba(99,102,241,0.12)] transition-all duration-200 resize-none"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-xs">
                Import JSON Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'essentials':
        return renderEssentials()
      case 'data':
        return renderData()
      case 'appearance':
        return renderAppearance()
      case 'advanced':
        return renderAdvanced()
      default:
        return renderEssentials()
    }
  }

  const containerClasses = isStacked 
    ? 'h-full bg-card flex flex-col control-panel-container control-panel-responsive'
    : `h-full bg-card flex flex-col control-panel-container control-panel-responsive ${isMobile ? 'w-full' : 'zone2-width shadow-[inset_-1px_0_2px_rgba(0,0,0,0.12)]'}`

  return (
    <div className={containerClasses}>
      {/* Header - Different layout for stacked mode */}
      {!isMobile && (
        <div className={`${isStacked ? 'h-12 px-4' : 'h-16 px-6'} flex items-center justify-between ${isStacked ? 'border-b border-border' : ''}`}>
          <div className="flex flex-col justify-center">
            <h2 className={`${isStacked ? 'text-base' : 'text-fluid-lg'} font-light text-foreground capitalize`}>
              {activeSection}
            </h2>
            {!isStacked && (
              <p className="text-fluid-sm text-muted-foreground">
                {activeSection === 'essentials' && 'Chart type, title, and basic setup'}
                {activeSection === 'data' && 'Import and manage your data'}
                {activeSection === 'appearance' && 'Colors, sizing, and visual styling'}
                {activeSection === 'advanced' && 'Import options and detailed settings'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : isStacked ? 'p-4' : 'container-responsive'}`} suppressHydrationWarning={true}>
        {renderContent()}
      </div>
    </div>
  )
}