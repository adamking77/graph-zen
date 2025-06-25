"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Save, X } from "lucide-react"
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
      <DialogContent className="max-w-7xl w-[95%] h-[90%] max-h-[800px] flex flex-col bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Chart Data</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
          {/* Data Table */}
          <div className="col-span-2 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-white">Data Table</Label>
              <Button onClick={addRow} size="sm" variant="outline" className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto border border-gray-700 rounded-lg bg-gray-800/50">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-3 bg-gray-800/70 border-b border-gray-700 font-medium text-sm">
                  <div className="col-span-1 text-center text-gray-300">#</div>
                  <div className="col-span-6 text-gray-300">Name</div>
                  <div className="col-span-4 text-gray-300">Value</div>
                  <div className="col-span-1 text-center text-gray-300">Actions</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-gray-700">
                  {editedData.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-800/30">
                      <div className="col-span-1 text-center text-sm text-gray-400">
                        {index + 1}
                      </div>
                      <div className="col-span-6">
                        <Input
                          value={item.scenario}
                          onChange={(e) => updateRow(index, 'scenario', e.target.value)}
                          placeholder="Enter name"
                          className="w-full bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500/50 focus:border-purple-500/50"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          value={item.value === null ? '' : item.value}
                          onChange={(e) => updateRow(index, 'value', e.target.value === '' ? null : parseFloat(e.target.value) || 0)}
                          placeholder="Enter value"
                          className="w-full bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500/50 focus:border-purple-500/50"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(index)}
                          disabled={editedData.length <= 1}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="col-span-1 flex flex-col space-y-4">
            <Label className="text-base font-medium text-white">Live Preview</Label>
            <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden bg-gray-800/30 relative">
              <div className="absolute inset-0">
                <ChartPreview config={{
                  ...previewConfig,
                  dimensions: {
                    width: 400,
                    height: 350,
                    preset: 'preview',
                    aspectRatio: '8:7'
                  },
                  theme: {
                    ...previewConfig.theme,
                    background: 'transparent'
                  }
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={handleCancel} className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}