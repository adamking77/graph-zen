"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, X } from "lucide-react"
import type { ChartData, ChartConfig } from "@/app/page"
import { ChartPreview } from "@/components/chart-preview"

interface DataEditorDialogProps {
  config: ChartConfig
  onConfigChange: (newConfig: ChartConfig) => void
  children: React.ReactNode
}

export function DataEditorDialog({ config, onConfigChange, children }: DataEditorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editedData, setEditedData] = useState<ChartData[]>(config.data)
  const [previewConfig, setPreviewConfig] = useState<ChartConfig>({ ...config, data: editedData })

  const addRow = () => {
    const newRow: ChartData = {
      scenario: `New Item ${editedData.length + 1}`,
      value: null as any
    }
    const newData = [...editedData, newRow]
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    setPreviewConfig({ ...previewConfig, data: validData })
  }

  const removeRow = (index: number) => {
    if (editedData.length <= 1) return // Keep at least one row
    const newData = editedData.filter((_, i) => i !== index)
    setEditedData(newData)
    setPreviewConfig({ ...previewConfig, data: newData })
  }

  const updateRow = (index: number, field: keyof ChartData, value: string | number) => {
    const newData = editedData.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setEditedData(newData)
    
    // Filter out rows with null values for preview
    const validData = newData.filter(item => item.value !== null && item.value !== undefined && item.scenario.trim() !== '')
    setPreviewConfig({ ...previewConfig, data: validData })
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
        className="max-w-6xl w-[90%] h-[85%] max-h-[750px] flex flex-col [&>button]:text-white [&>button]:hover:text-gray-300 [&>button]:opacity-80 [&>button]:hover:opacity-100"
        style={{
          backgroundColor: '#1C1F26',
          backgroundImage: 'linear-gradient(135deg, #1C1F26 0%, #1A1D24 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(255,255,255,0.008) inset',
          border: '1px solid rgba(47, 58, 74, 0.12)'
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-white text-lg font-medium">Edit Chart Data</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-5 gap-6 min-h-0">
          {/* Data Table - Takes up 3/5 of the space */}
          <div className="col-span-3 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white text-sm font-medium flex items-center gap-2">
                <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
                Data Points
              </Label>
              <button 
                onClick={addRow}
                className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-200 text-purple-300 hover:text-white rounded-lg"
                style={{
                  backgroundColor: '#16191E',
                  backgroundImage: 'linear-gradient(135deg, #16191E 0%, #14171C 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0.5px 1px rgba(255,255,255,0.01) inset',
                  border: '1px solid rgba(47, 58, 74, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-0.5px)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(255,255,255,0.015) inset';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 0.5px 1px rgba(255,255,255,0.01) inset';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            </div>
            
            <div 
              className="flex-1 rounded-lg overflow-hidden"
              style={{
                backgroundColor: '#16191E',
                backgroundImage: 'linear-gradient(135deg, #16191E 0%, #14171C 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12), inset 0 0.5px 1px rgba(0,0,0,0.06)',
                border: '1px solid rgba(47, 58, 74, 0.15)',
              }}
            >
              <div className="overflow-auto h-full">
                {/* Table Header */}
                <div 
                  className="grid grid-cols-12 gap-3 p-4 text-sm font-medium border-b sticky top-0"
                  style={{
                    backgroundColor: '#12151A',
                    backgroundImage: 'linear-gradient(135deg, #12151A 0%, #11141A 100%)',
                    borderColor: 'rgba(47, 58, 74, 0.15)',
                  }}
                >
                  <div className="col-span-1 text-center text-gray-400">#</div>
                  <div className="col-span-7 text-gray-300">Label</div>
                  <div className="col-span-3 text-gray-300">Value</div>
                  <div className="col-span-1 text-center text-gray-400">Remove</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y" style={{ borderColor: 'rgba(47, 58, 74, 0.08)' }}>
                  {editedData.map((item, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-12 gap-3 p-4 items-center transition-all duration-200"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(47, 58, 74, 0.05)';
                        e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, rgba(47, 58, 74, 0.05) 0%, rgba(47, 58, 74, 0.02) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.backgroundImage = 'none';
                      }}
                    >
                      <div className="col-span-1 text-center text-sm text-gray-500 font-mono">
                        {index + 1}
                      </div>
                      <div className="col-span-7">
                        <input
                          value={item.scenario}
                          onChange={(e) => updateRow(index, 'scenario', e.target.value)}
                          placeholder="Enter label"
                          className="w-full text-white placeholder-gray-500 bg-transparent border-0 rounded-lg px-3 py-2 text-sm transition-all focus:outline-none"
                          style={{
                            backgroundColor: '#1E2530',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(47, 58, 74, 0.3)'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 2px rgba(139, 92, 246, 0.3)'
                            e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
                            e.target.style.borderColor = 'rgba(47, 58, 74, 0.3)'
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.value === null ? '' : item.value}
                          onChange={(e) => updateRow(index, 'value', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          placeholder="Value"
                          className="w-full text-white placeholder-gray-500 bg-transparent border-0 rounded-lg px-3 py-2 text-sm transition-all focus:outline-none"
                          style={{
                            backgroundColor: '#1E2530',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(47, 58, 74, 0.3)'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 0 2px rgba(139, 92, 246, 0.3)'
                            e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
                            e.target.style.borderColor = 'rgba(47, 58, 74, 0.3)'
                          }}
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => removeRow(index)}
                          disabled={editedData.length <= 1}
                          className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-red-400 hover:text-red-300"
                          style={{
                            backgroundColor: editedData.length <= 1 ? 'transparent' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (editedData.length > 1) {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(239, 68, 68, 0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
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
          <div className="col-span-2 flex flex-col space-y-4">
            <Label className="text-white text-sm font-medium flex items-center gap-2">
              <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
              Live Preview
            </Label>
            <div 
              className="flex-1 rounded-lg p-4 flex items-center justify-center min-h-[300px]"
              style={{
                backgroundColor: '#16191E',
                backgroundImage: 'linear-gradient(135deg, #16191E 0%, #14171C 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12), inset 0 0.5px 1px rgba(0,0,0,0.06)',
                border: '1px solid rgba(47, 58, 74, 0.15)',
              }}
            >
              <div className="w-full h-full">
                <ChartPreview config={{
                  ...previewConfig,
                  dimensions: {
                    width: 320,
                    height: 280,
                    preset: 'preview',
                    aspectRatio: '8:7'
                  },
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
        <div 
          className="flex justify-end gap-3 pt-6 border-t mt-6"
          style={{ borderColor: 'rgba(47, 58, 74, 0.15)' }}
        >
          <button 
            onClick={handleCancel} 
            className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 text-gray-300 hover:text-white rounded-lg"
            style={{
              backgroundColor: '#16191E',
              backgroundImage: 'linear-gradient(135deg, #16191E 0%, #14171C 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0.5px 1px rgba(255,255,255,0.01) inset',
              border: '1px solid rgba(47, 58, 74, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-0.5px)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(255,255,255,0.015) inset';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 0.5px 1px rgba(255,255,255,0.01) inset';
            }}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 text-white rounded-lg"
            style={{
              backgroundColor: '#8B5CF6',
              backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3), 0 1px 3px rgba(255,255,255,0.015) inset',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-0.5px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4), 0 2px 6px rgba(255,255,255,0.02) inset';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3), 0 1px 3px rgba(255,255,255,0.015) inset';
            }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}