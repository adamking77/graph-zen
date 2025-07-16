"use client"

import { useState, useRef } from "react"
import type { ChartConfig, ChartData } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, BarChart3, TrendingUp, PieChart, Upload, FileText, X, AlertTriangle, CheckCircle } from "lucide-react"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"
import { SizeSelector } from "@/components/size-selector"
import { DataEditorDialog } from "@/components/data-editor-dialog"

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

  // Smart number parsing - handles currency symbols, commas, K/M/B suffixes, percentages
  const parseSmartNumber = (value: string): number => {
    if (typeof value === 'number') return value
    
    const originalValue = value.toString().trim()
    if (!originalValue) return 0
    
    // Handle percentage values
    if (originalValue.includes('%')) {
      const numericPart = originalValue.replace('%', '').replace(/[$€£¥₹,\s]/g, '')
      return parseFloat(numericPart) || 0
    }
    
    // Remove currency symbols and whitespace
    let cleaned = originalValue.replace(/[$€£¥₹,\s]/g, '')
    
    // Handle suffixes (case insensitive)
    const lastChar = cleaned.slice(-1).toLowerCase()
    if (lastChar === 'k') {
      return parseFloat(cleaned.slice(0, -1)) * 1000
    } else if (lastChar === 'm') {
      return parseFloat(cleaned.slice(0, -1)) * 1000000
    } else if (lastChar === 'b') {
      return parseFloat(cleaned.slice(0, -1)) * 1000000000
    }
    
    // Handle decimal numbers with proper error checking
    const result = parseFloat(cleaned)
    return isNaN(result) ? 0 : result
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
    { 
      value: "horizontal-bar", 
      label: "Horizontal Bar", 
      icon: BarChart3,
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
      icon: PieChart,
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
      icon: TrendingUp,
      description: "Combines bars and lines for rich data stories"
    },
  ]

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    essentials: true,
    data: true,
    appearance: true,
    advanced: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Render section header with expand/collapse
  const SectionHeader = ({ 
    title, 
    icon, 
    section, 
    description
  }: { 
    title: string
    icon: React.ReactNode
    section: keyof typeof expandedSections
    description?: string
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group hover:bg-secondary/30"
    >
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div className="text-left">
          <h3 className="text-foreground text-base font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className={`transform transition-transform duration-200 ${expandedSections[section] ? 'rotate-180' : ''}`}>
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  )

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Configuration Sections */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* ESSENTIALS SECTION */}
        <div className="space-y-4">
          <SectionHeader 
            title="Essentials" 
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            section="essentials"
            description="Chart type, title, and basic setup"
          />
          
          {expandedSections.essentials && (
            <div className="space-y-6">
              {/* Chart Type Selection */}
              <div className="space-y-4">
                <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Chart Type
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {chartTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = config.type === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => updateConfig({ type: type.value as "horizontal-bar" | "vertical-bar" | "pie" | "donut" | "line" | "combo" })}
                        className={`flex items-center gap-3 p-4 rounded-lg transition-premium border group ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-secondary/30 border-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-secondary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{type.label}</div>
                          <div className="text-xs opacity-70">{type.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Contextual help for selected chart type */}
                {(() => {
                  const selectedType = chartTypes.find(t => t.value === config.type)
                  if (selectedType) {
                    return (
                      <div className="rounded-lg p-3 bg-card border border-border">
                        <p className="text-xs text-muted-foreground">{selectedType.description}</p>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Chart Configuration */}
              <div className="space-y-4">
                <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Title & Subtitle
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Chart Title</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      className="w-full bg-input border-premium text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 text-sm transition-premium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter chart title"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={config.subtitle}
                      onChange={(e) => updateConfig({ subtitle: e.target.value })}
                      className="w-full bg-input border-premium text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 text-sm transition-premium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter subtitle (optional)"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DATA SECTION */}
        <div className="space-y-3">
          <SectionHeader 
            title="Data" 
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            section="data"
            description={`${config.data.length} data ${config.data.length === 1 ? 'point' : 'points'}`}
          />
          
          {expandedSections.data && (
            <div className="space-y-6">
              {/* Data Points */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    Data Points
                  </h4>
                  <DataEditorDialog config={config} onConfigChange={onChange}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3">
                      <Plus className="w-3 h-3 mr-1" />
                      Edit Data
                    </Button>
                  </DataEditorDialog>
                </div>
                
                <div className="bg-secondary/30 border-premium rounded-lg p-4">
                  <div className="space-y-2">
                    {config.data.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center p-3 rounded-lg bg-background/50 border border-secondary/50"
                      >
                        <div className="flex-1 text-sm text-foreground truncate">
                          {item.scenario}
                        </div>
                        <div className="text-sm text-primary font-medium">
                          {formatNumber(item.value)}
                        </div>
                      </div>
                    ))}
                    {config.data.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        +{config.data.length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Import */}
              <div className="space-y-4">
                <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Quick Import
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-secondary/50 rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-premium text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    CSV File
                  </button>
                  <button
                    onClick={() => {
                      const sampleData = "Q1 Sales\t$1.2M\nQ2 Sales\t950K\nQ3 Sales\t75%"
                      setPasteInput(sampleData)
                      handlePasteImport()
                    }}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-secondary/50 rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-premium text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Sample Data
                  </button>
                </div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCSVImport}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* APPEARANCE SECTION */}
        <div className="space-y-3">
          <SectionHeader 
            title="Appearance" 
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>}
            section="appearance"
            description="Colors, layout, and visual styling"
          />
          
          {expandedSections.appearance && (
            <div className="space-y-6">
              {/* Size Selector */}
              <div className="mb-4">
                <SizeSelector 
                  value={config.dimensions || { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' }}
                  onChange={(dimensions) => updateConfig({ dimensions })}
                />
              </div>

              {/* Color Palette */}
              <div>
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
          )}
        </div>

        {/* ADVANCED SECTION */}
        <div className="space-y-3">
          <SectionHeader 
            title="Advanced" 
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>}
            section="advanced"
            description="Import options and detailed settings"
          />
          
          {expandedSections.advanced && (
            <div className="space-y-6">
              {/* Import Data Options */}
              <div className="space-y-4">
                <h4 className="text-foreground text-sm font-semibold flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Import Options
                </h4>
                
                {/* Import Mode Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-secondary/30 rounded-lg p-1">
                  <button
                    onClick={() => setImportMode('csv')}
                    className={`py-2 px-3 rounded text-sm transition-premium ${
                      importMode === 'csv'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    CSV File
                  </button>
                  <button
                    onClick={() => setImportMode('paste')}
                    className={`py-2 px-3 rounded text-sm transition-premium ${
                      importMode === 'paste'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Copy/Paste
                  </button>
                  <button
                    onClick={() => setImportMode('json')}
                    className={`py-2 px-3 rounded text-sm transition-premium ${
                      importMode === 'json'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    JSON
                  </button>
                </div>
                
                <div className="bg-gray-900/30 border border-gray-800/30 rounded-lg p-3">
                  {importMode === 'csv' && (
                    <div className="space-y-3">
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
                        placeholder="Paste from Excel/Google Sheets:\nQ1 Sales\t$1.2M\nQ2 Sales\t950K\nQ3 Sales\t75%\nQ4 Sales\t2.1B"
                        className="w-full h-20 bg-gray-800/50 border border-gray-700/50 rounded px-3 py-2 text-xs text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                      />
                      <Button onClick={handlePasteImport} className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3">
                        Import Pasted Data
                      </Button>
                      <p className="text-xs text-gray-400">
                        Supports tab-separated (Excel) or comma-separated data. Auto-detects currency symbols, K/M/B suffixes, and percentages
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
            </div>
          )}
        </div>

        {/* Data Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white text-lg font-light tracking-wide">Data Preview</h3>
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
                    <div className="grid grid-cols-12 gap-4 text-xs font-light text-gray-400 tracking-wide">
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
                    : previewData.filter(item => item.status === 'warning').length > 0
                    ? ''
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

      </div>
    </div>
  )
}
