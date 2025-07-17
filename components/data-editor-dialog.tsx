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

export function DataEditorDialog({ config, onConfigChange, children }: DataEditorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editedData, setEditedData] = useState<ChartData[]>(config.data)
  const [previewConfig, setPreviewConfig] = useState<ChartConfig>({ ...config, data: editedData })
  const [chartKey, setChartKey] = useState(0)
  const [mobileView, setMobileView] = useState<'data' | 'preview'>('data')
  const layoutState = useLayoutState()

  const addRow = () => {
    const newRow: ChartData = {
      scenario: `New Item ${editedData.length + 1}`,
      value: null as any
    }
    const newData = [...editedData, newRow]
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    
    // Calculate dynamic dimensions based on data volume
    const dataLength = validData.length
    const baseDimensions = { width: 500, height: 400 }
    let dynamicHeight = baseDimensions.height
    
    if (config.type === 'vertical-bar' || config.type === 'horizontal-bar') {
      dynamicHeight = Math.min(600, Math.max(400, dataLength * 35 + 250))
    } else if (config.type === 'line') {
      dynamicHeight = Math.min(550, Math.max(400, dataLength * 25 + 300))
    }
    
    setPreviewConfig({
      ...config,
      data: validData,
      dimensions: {
        width: baseDimensions.width,
        height: dynamicHeight,
        preset: 'modal-preview',
        aspectRatio: `${baseDimensions.width}:${dynamicHeight}`
      },
      isModalContext: true
    })
    setChartKey(prev => prev + 1)
  }

  const removeRow = (index: number) => {
    if (editedData.length <= 1) return // Keep at least one row
    const newData = editedData.filter((_, i) => i !== index)
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    
    // Calculate dynamic dimensions based on data volume
    const dataLength = validData.length
    const baseDimensions = { width: 500, height: 400 }
    let dynamicHeight = baseDimensions.height
    
    if (config.type === 'vertical-bar' || config.type === 'horizontal-bar') {
      dynamicHeight = Math.min(600, Math.max(400, dataLength * 35 + 250))
    } else if (config.type === 'line') {
      dynamicHeight = Math.min(550, Math.max(400, dataLength * 25 + 300))
    }
    
    setPreviewConfig({
      ...config,
      data: validData,
      dimensions: {
        width: baseDimensions.width,
        height: dynamicHeight,
        preset: 'modal-preview',
        aspectRatio: `${baseDimensions.width}:${dynamicHeight}`
      },
      isModalContext: true
    })
    setChartKey(prev => prev + 1)
  }

  const updateRow = (index: number, field: keyof ChartData, value: string | number) => {
    const newData = editedData.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    
    // Calculate dynamic dimensions based on data volume
    const dataLength = validData.length
    const baseDimensions = { width: 500, height: 400 }
    let dynamicHeight = baseDimensions.height
    
    if (config.type === 'vertical-bar' || config.type === 'horizontal-bar') {
      dynamicHeight = Math.min(600, Math.max(400, dataLength * 35 + 250))
    } else if (config.type === 'line') {
      dynamicHeight = Math.min(550, Math.max(400, dataLength * 25 + 300))
    }
    
    setPreviewConfig({
      ...config,
      data: validData,
      dimensions: {
        width: baseDimensions.width,
        height: dynamicHeight,
        preset: 'modal-preview',
        aspectRatio: `${baseDimensions.width}:${dynamicHeight}`
      },
      isModalContext: true
    })
    setChartKey(prev => prev + 1)
  }

  const handleSave = () => {
    // Filter out rows with null values before saving
    const validData = editedData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    onConfigChange({ ...config, data: validData })
    setIsOpen(false)
  }

  const handleCancel = () => {
    setEditedData(config.data)
    setPreviewConfig({ ...config, data: config.data })
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
        className="max-w-7xl w-[95%] max-w-[95vw] h-[90vh] max-h-[900px] sm:h-[85vh] sm:max-h-[800px] md:h-[80vh] md:max-h-[700px] flex flex-col bg-card border-border shadow-xl"
      >
        <DialogHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground text-lg font-medium font-satoshi">Edit Chart Data</DialogTitle>
            {layoutState.isMobile && (
              <div className="flex gap-2">
                <button
                  onClick={() => setMobileView('data')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    mobileView === 'data' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Data
                </button>
                <button
                  onClick={() => setMobileView('preview')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    mobileView === 'preview' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 overflow-hidden">
          {/* Data Table - Takes up 3/5 of the space */}
          <div className={`col-span-1 lg:col-span-3 flex flex-col space-y-4 min-w-0 ${
            layoutState.isMobile && mobileView !== 'data' ? 'hidden' : ''
          }`}>
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium flex items-center gap-2 font-satoshi">
                <div className="w-1 h-3 bg-primary rounded-full"></div>
                Data Points
              </Label>
              <button 
                onClick={addRow}
                className="flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 bg-transparent border border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground rounded-lg font-satoshi"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            </div>
            
            <div className="rounded-lg bg-input border border-border">
              <div className="overflow-auto h-full max-h-[300px] sm:max-h-[400px] lg:max-h-[500px]">
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
                          type="number"
                          value={item.value === null ? '' : item.value}
                          onChange={(e) => updateRow(index, 'value', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          placeholder="Value"
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
          <div className={`col-span-1 lg:col-span-2 flex flex-col space-y-4 min-w-0 ${
            layoutState.isMobile && mobileView !== 'preview' ? 'hidden' : ''
          }`}>
            <Label className="text-foreground text-sm font-medium flex items-center gap-2 font-satoshi">
              <div className="w-1 h-3 bg-primary rounded-full"></div>
              Live Preview
            </Label>
            <div className="rounded-lg p-1 bg-transparent min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] overflow-auto">
              <div className="w-full h-full">
                <ChartPreview 
                  key={chartKey}
                  config={{
                    ...previewConfig,
                    dimensions: previewConfig.dimensions,
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