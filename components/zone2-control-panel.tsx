"use client"

import { useState, useRef } from "react"
import type { ChartConfig, ChartData } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Plus, Upload, FileText, BarChart3, BarChart4, TrendingUp, PieChart, CircleDot, Activity } from "lucide-react"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"
import { SizeSelector } from "@/components/size-selector"
import { DataEditorDialog } from "@/components/data-editor-dialog"

interface Zone2ControlPanelProps {
  activeSection: string
  config: ChartConfig
  onChange: (config: ChartConfig) => void
}

export function Zone2ControlPanel({ activeSection, config, onChange }: Zone2ControlPanelProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [pasteInput, setPasteInput] = useState("")
  const [importMode, setImportMode] = useState<'json' | 'csv' | 'paste'>('json')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onChange({ ...config, ...updates })
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
      icon: BarChart4,
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
        <h3 className="text-sm font-normal text-foreground">Chart Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((type) => {
            const Icon = type.icon
            const isSelected = config.type === type.value
            return (
              <button
                key={type.value}
                onClick={() => updateConfig({ type: type.value as any })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 group border ${
                  isSelected
                    ? "bg-primary/10 border-transparent text-primary"
                    : "bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 transition-all duration-200 ${
                  isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`} />
                <div className={`text-xs font-medium transition-all duration-200 text-center ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}>
                  {type.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-3">
        <h3 className="text-sm font-normal text-foreground">Title & Subtitle</h3>
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
    </div>
  )

  const renderData = () => (
    <div className="space-y-6">
      {/* Data Points */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-normal text-foreground">Data Points</h3>
          <DataEditorDialog config={config} onConfigChange={onChange}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Edit Data
            </Button>
          </DataEditorDialog>
        </div>
        
        <div className="bg-secondary/30 border-border rounded-lg p-3">
          <div className="space-y-2">
            {config.data.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="flex gap-2 items-center justify-between p-2 rounded-lg bg-background/50 border border-secondary/50"
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
      </div>

      {/* Quick Import */}
      <div className="space-y-3">
        <h3 className="text-sm font-normal text-foreground">Quick Import</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1 p-2 border border-dashed bg-transparent border-border/40 rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            <span className="text-xs">CSV File</span>
          </button>
          <button
            onClick={() => {
              const sampleData = "Product A\t$2.4M\nProduct B\t$1.8M\nProduct C\t$3.1M\nProduct D\t$850K\nProduct E\t$1.2M\nProduct F\t$640K"
              setPasteInput(sampleData)
              // Parse and import the sample data immediately
              const parsedData = parsePastedData(sampleData)
              if (parsedData.length > 0) {
                updateConfig({ data: parsedData })
              }
            }}
            className="flex items-center justify-center gap-1 p-2 border border-dashed bg-transparent border-border/40 rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">Sample Data</span>
          </button>
        </div>
        <input
          type="file"
          accept=".csv,.txt"
          ref={fileInputRef}
          className="hidden"
        />
      </div>
    </div>
  )

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
        <h3 className="text-sm font-normal text-foreground">Color Palette</h3>
        <ColorPalette 
          theme={config.theme || {
            palette: {
              id: 'dashboard-pro',
              name: 'Dashboard Pro',
              colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
              type: 'colorful'
            },
            borderStyle: 'none',
            cornerStyle: 'rounded',
            background: 'black',
            showChartTotal: false,
            titleAlignment: 'center',
            sortOrder: 'none',
            legendPosition: 'right'
          }}
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
        <h3 className="text-sm font-normal text-foreground">Import Options</h3>
        
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

  return (
    <div className="h-full bg-card shadow-[inset_-1px_0_2px_rgba(0,0,0,0.12)] flex flex-col zone2-width">
      {/* Header */}
      <div className="h-16 px-6 flex flex-col justify-center">
        <h2 className="text-lg font-normal text-foreground capitalize">
          {activeSection}
        </h2>
        <p className="text-xs text-muted-foreground">
          {activeSection === 'essentials' && 'Chart type, title, and basic setup'}
          {activeSection === 'data' && 'Import and manage your data'}
          {activeSection === 'appearance' && 'Colors, sizing, and visual styling'}
          {activeSection === 'advanced' && 'Import options and detailed settings'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" suppressHydrationWarning={true}>
        {renderContent()}
      </div>
    </div>
  )
}