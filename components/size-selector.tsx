"use client"

import { useState } from "react"
import { ChevronDown, Monitor, Smartphone, Globe, Users, Video, MessageSquare, Presentation } from "lucide-react"
import { SIZE_PRESETS } from "@/lib/chart-constants"
import { type ChartDimensions } from "@/app/page"

interface SizeSelectorProps {
  value: ChartDimensions
  onChange: (dimensions: ChartDimensions) => void
}

const PRESET_ICONS = {
  'presentation': Presentation,
  'web': Globe,
  'linkedin': Users,
  'instagram': MessageSquare,
  'story': Video,
  'twitter': MessageSquare,
  'mobile': Smartphone
}

export function SizeSelector({ value, onChange }: SizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePresetSelect = (presetKey: string) => {
    const preset = SIZE_PRESETS[presetKey as keyof typeof SIZE_PRESETS]
    onChange(preset)
    setIsOpen(false)
  }

  const currentPresetKey = Object.keys(SIZE_PRESETS).find(
    key => SIZE_PRESETS[key as keyof typeof SIZE_PRESETS].preset === value.preset
  ) || 'presentation'

  const CurrentIcon = PRESET_ICONS[currentPresetKey as keyof typeof PRESET_ICONS] || Monitor

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Chart Size
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <CurrentIcon className="w-4 h-4 text-gray-400" />
            <div className="text-left">
              <div className="font-medium text-gray-200">{value.preset}</div>
              <div className="text-xs text-gray-400">{value.width} × {value.height}</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-700/60 rounded-lg shadow-xl overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-400 px-3 py-2 uppercase tracking-wider">
                Presets
              </div>
              
              {Object.entries(SIZE_PRESETS).map(([key, preset]) => {
                const Icon = PRESET_ICONS[key as keyof typeof PRESET_ICONS] || Monitor
                const isSelected = value.preset === preset.preset
                
                return (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isSelected ? 'text-purple-200' : 'text-gray-200'}`}>
                        {preset.preset}
                      </div>
                      <div className="text-xs text-gray-400">
                        {preset.width} × {preset.height} ({preset.aspectRatio})
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  )
}