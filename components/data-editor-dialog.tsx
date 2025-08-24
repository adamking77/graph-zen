"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, X, Eye, Table } from "lucide-react"
import type { ChartData, ChartConfig } from "@/app/page"
import { ChartPreview } from "@/components/chart-preview"
import { useLayoutState } from "@/hooks/use-mobile"

interface DataEditorDialogProps {
  config: ChartConfig
  onConfigChange: (newConfig: ChartConfig) => void
  children: React.ReactNode
}

// Smart number parsing to handle percentages, currency symbols, and suffixes
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

export function DataEditorDialog({ config, onConfigChange, children }: DataEditorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editedData, setEditedData] = useState<ChartData[]>(config.data)
  
  // Initialize preview config based on editing mode
  const initializePreviewConfig = (initialData: ChartData[]) => {
    if (config.isSeriesEditingMode && config.series) {
      const updatedSeries = config.series.map(s => ({ ...s, data: initialData }))
      return {
        ...config,
        data: initialData,
        series: updatedSeries,
        multiSeries: false,
        isModalContext: true
      }
    } else {
      return { ...config, data: initialData, isModalContext: true }
    }
  }
  
  const [previewConfig, setPreviewConfig] = useState<ChartConfig>(initializePreviewConfig(editedData))
  const [chartKey, setChartKey] = useState(0)
  const [mobileView, setMobileView] = useState<'data' | 'preview'>('data')
  const layoutState = useLayoutState()
  
  // Helper function to build preview config with updated data
  const buildPreviewConfig = (validData: ChartData[]) => {
    if (config.isSeriesEditingMode && config.series) {
      // Series editing mode: update the series data and ensure proper structure
      const updatedSeries = config.series.map(s => ({ ...s, data: validData }))
      return {
        ...config,
        data: validData, // Keep for compatibility
        series: updatedSeries,
        multiSeries: false, // Force single-series preview
        isModalContext: true
      }
    } else {
      // Regular single data mode
      return {
        ...config,
        data: validData,
        isModalContext: true
      }
    }
  }

  const addRow = () => {
    const newRow: ChartData = {
      scenario: `New Item ${editedData.length + 1}`,
      value: null as any,
      displayValue: ''
    }
    const newData = [...editedData, newRow]
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    
    setPreviewConfig(buildPreviewConfig(validData))
    setChartKey(prev => prev + 1)
  }

  const removeRow = (index: number) => {
    if (editedData.length <= 1) return // Keep at least one row
    const newData = editedData.filter((_, i) => i !== index)
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    
    setPreviewConfig(buildPreviewConfig(validData))
    setChartKey(prev => prev + 1)
  }

  const updateRow = (index: number, field: keyof ChartData, value: string | number, displayValue?: string) => {
    const newData = editedData.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'value' && displayValue !== undefined) {
          updatedItem.displayValue = displayValue
        }
        return updatedItem
      }
      return item
    })
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    
    setPreviewConfig(buildPreviewConfig(validData))
    setChartKey(prev => prev + 1)
  }

  const handleSave = () => {
    // Filter out rows with null values and clean up displayValue
    const validData = editedData
      .filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
      .map(item => {
        const cleanedItem = { ...item }
        // Remove displayValue if it's just the number as a string or empty
        if (!item.displayValue || item.displayValue === String(item.value) || item.displayValue.trim() === '') {
          delete cleanedItem.displayValue
        }
        return cleanedItem
      })
    onConfigChange({ ...config, data: validData })
    setIsOpen(false)
  }

  const handleCancel = () => {
    setEditedData(config.data)
    setPreviewConfig(initializePreviewConfig(config.data))
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel()
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="max-w-7xl w-[95%] max-w-[95vw] h-[85vh] max-h-[750px] sm:h-[90vh] sm:max-h-[850px] md:h-[95vh] md:max-h-[950px] flex flex-col bg-card border-border shadow-xl"
      >
        <DialogHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">Edit Chart Data</DialogTitle>
            {layoutState.isMobile && (
              <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg">
                <button
                  onClick={() => setMobileView('data')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mobileView === 'data' 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Data
                </button>
                <button
                  onClick={() => setMobileView('preview')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mobileView === 'preview' 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-7 gap-6 min-h-0 overflow-hidden">
          {/* Data Table - Takes up 3/5 of the space */}
          <div className={`col-span-1 lg:col-span-4 flex flex-col space-y-4 min-w-0 flex-1 ${
            layoutState.isMobile && mobileView !== 'data' ? 'hidden' : ''
          }`}>
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-lg font-medium flex items-center gap-2 font-satoshi">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Edit Chart Data
              </Label>
              <button 
                onClick={addRow}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 bg-transparent border border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground rounded-lg font-satoshi"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            </div>
            
            <div className="rounded-lg bg-input border border-border flex-1 flex flex-col min-h-0">
              <div className="overflow-auto flex-1 min-h-0 max-h-[350px] sm:max-h-[450px] lg:max-h-[600px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 p-2 sm:p-4 text-sm font-medium border-b border-border sticky top-0 bg-secondary/30 font-satoshi">
                  <div className="col-span-1 text-center text-muted-foreground">#</div>
                  <div className="col-span-6 sm:col-span-7 text-foreground">Label</div>
                  <div className="col-span-4 sm:col-span-3 text-foreground">Value</div>
                  <div className="col-span-1 text-center text-muted-foreground">
                    <span className="hidden sm:inline">Remove</span>
                    <span className="sm:hidden">×</span>
                  </div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border/20">
                  {editedData.map((item, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-12 gap-2 sm:gap-3 p-2 sm:p-4 items-center transition-all duration-200 hover:bg-secondary/20"
                    >
                      <div className="col-span-1 text-center text-sm text-muted-foreground font-mono">
                        {index + 1}
                      </div>
                      <div className="col-span-6 sm:col-span-7">
                        <input
                          value={item.scenario}
                          onChange={(e) => updateRow(index, 'scenario', e.target.value)}
                          placeholder="Enter label"
                          className="w-full bg-input border border-border text-foreground placeholder-muted-foreground rounded-lg px-2 sm:px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_8px_rgba(99,102,241,0.12)] font-satoshi"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="text"
                          value={item.displayValue || (item.value === null ? '' : String(item.value))}
                          onChange={(e) => {
                            const inputValue = e.target.value
                            
                            if (inputValue === '') {
                              updateRow(index, 'value', null as any, '')
                            } else {
                              const parsedValue = parseSmartNumber(inputValue)
                              // Store both the parsed numeric value and the display string
                              updateRow(index, 'value', parsedValue, inputValue)
                            }
                          }}
                          placeholder="Enter value (e.g., 100, 50%, $1000, 5K)"
                          className="w-full bg-input border border-border text-foreground placeholder-muted-foreground rounded-lg px-2 sm:px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-[0_0_8px_rgba(99,102,241,0.12)] font-satoshi"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => removeRow(index)}
                          disabled={editedData.length <= 1}
                          className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-red-400 hover:text-red-300 hover:bg-red-500/10 font-satoshi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview - Takes up 2/5 of the space */}
          <div className={`col-span-1 lg:col-span-3 flex flex-col space-y-4 min-w-0 ${
            layoutState.isMobile && mobileView !== 'preview' ? 'hidden' : ''
          }`}>
            <Label className="text-foreground text-sm font-medium flex items-center gap-2 font-satoshi">
              <div className="w-1 h-3 bg-primary rounded-full"></div>
              Live Preview
            </Label>
            <div className="rounded-lg p-1 bg-transparent flex-1 flex flex-col min-h-0">
              <div className="w-full h-full flex-1 min-h-0">
                <ChartPreview 
                  key={chartKey}
                  config={{
                    ...previewConfig,
                    isModalContext: true,
                    theme: {
                      ...previewConfig.theme,
                      background: 'none',
                      palette: previewConfig.theme?.palette || {
                        id: 'default',
                        name: 'Default',
                        colors: ['#6366F1'],
                        type: 'colorful'
                      }
                    } as any
                  }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-border mt-3 flex-shrink-0">
          <button 
            onClick={handleCancel} 
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm transition-all duration-200 bg-transparent border border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground rounded-lg font-satoshi min-h-[44px]"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-satoshi min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}