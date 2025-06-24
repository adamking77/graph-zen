"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

export interface ColorPalette {
  id: string
  name: string
  colors: string[]
  type: 'monochrome' | 'colorful' | 'neon'
}

export interface ColorTheme {
  palette: ColorPalette
  borderStyle: 'none' | 'gradient' | 'solid'
  borderColor?: string
  cornerStyle: 'rounded' | 'sharp'
  background: 'black' | 'white' | 'none'
  // Style options
  sortHighToLow?: boolean
  showDataLabels?: boolean
  showPercentages?: boolean
  showGridLines?: boolean
  // Number format options
  abbreviation?: 'auto' | 'none' | 'k' | 'm'
  decimalPlaces?: 'auto' | 'fixed'
  fixedDecimalCount?: number
}

interface ColorPaletteProps {
  theme: ColorTheme
  onChange: (theme: ColorTheme) => void
}

const colorPalettes: ColorPalette[] = [
  // Monochrome - Professional, single-color families
  {
    id: 'monochrome-blue',
    name: 'Classic Blue',
    colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
    type: 'monochrome'
  },
  {
    id: 'corporate-blue',
    name: 'Corporate',
    colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD'],
    type: 'monochrome'
  },
  {
    id: 'startup-purple',
    name: 'Professional',
    colors: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD'],
    type: 'monochrome'
  },
  {
    id: 'monochrome-green',
    name: 'Fresh Green',
    colors: ['#166534', '#16A34A', '#4ADE80', '#86EFAC'],
    type: 'monochrome'
  },
  {
    id: 'monochrome-yellow',
    name: 'Golden Yellow',
    colors: ['#A16207', '#CA8A04', '#EAB308', '#FDE047'],
    type: 'monochrome'
  },
  {
    id: 'monochrome-orange',
    name: 'Warm Orange',
    colors: ['#C2410C', '#EA580C', '#F97316', '#FB923C'],
    type: 'monochrome'
  },
  
  // Colorful - Vibrant, multi-color themes
  {
    id: 'colorful-rainbow',
    name: 'Rainbow', 
    colors: ['#8B5CF6', '#06D6A0', '#FFD23F', '#FF6B6B', '#4ECDC4'],
    type: 'colorful'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean',
    colors: ['#0891B2', '#06B6D4', '#22D3EE', '#67E8F9'],
    type: 'colorful'
  },
  {
    id: 'forest-green',
    name: 'Forest',
    colors: ['#15803D', '#22C55E', '#4ADE80', '#86EFAC'],
    type: 'colorful'
  },
  {
    id: 'autumn-colors',
    name: 'Autumn',
    colors: ['#B45309', '#D97706', '#F59E0B', '#FBBF24'],
    type: 'colorful'
  },
  {
    id: 'berry-mix',
    name: 'Berry',
    colors: ['#BE185D', '#EC4899', '#F472B6', '#F9A8D4'],
    type: 'colorful'
  },
  
  // Neon - Bright, high-contrast, energetic
  {
    id: 'neon-bright',
    name: 'Electric',
    colors: ['#FF3366', '#33FF66', '#3366FF', '#FF33FF', '#66FF33'],
    type: 'neon'
  },
  {
    id: 'sunset-warm',
    name: 'Sunset',
    colors: ['#DC2626', '#F97316', '#FACC15', '#FDE047'],
    type: 'neon'
  },
  {
    id: 'neon-cyberpunk',
    name: 'Cyberpunk',
    colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0080', '#8000FF'],
    type: 'neon'
  },
  {
    id: 'neon-Miami',
    name: 'Miami Vice',
    colors: ['#FF1493', '#00CED1', '#FFD700', '#FF4500', '#9400D3'],
    type: 'neon'
  }
]


export function ColorPalette({ theme, onChange }: ColorPaletteProps) {
  const [activeTab, setActiveTab] = useState<'monochrome' | 'colorful' | 'neon'>('colorful')

  const updateTheme = (updates: Partial<ColorTheme>) => {
    onChange({ ...theme, ...updates })
  }

  // Border color options
  const borderColors = [
    '#6B7280', // Gray
    '#8B5CF6', // Purple  
    '#06D6A0', // Teal
    '#FFD23F', // Yellow
    '#FF6B6B', // Red
    '#4ECDC4', // Cyan
    '#FFFFFF', // White
    '#000000'  // Black
  ]

  const monochromePalettes = colorPalettes.filter(p => p.type === 'monochrome')
  const colorfulPalettes = colorPalettes.filter(p => p.type === 'colorful')
  const neonPalettes = colorPalettes.filter(p => p.type === 'neon')

  return (
    <Card className="bg-gray-900/30 border-gray-800/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-sm font-normal">
          <Palette className="w-4 h-4 text-purple-400" />
          Theme
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Palette Section */}
        <div>
          <h3 className="text-white text-sm font-normal mb-3">Palette</h3>
          
          {/* Palette Category Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setActiveTab('monochrome')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'monochrome'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              Monochrome
            </button>
            <button
              onClick={() => setActiveTab('colorful')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'colorful'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              Colorful
            </button>
            <button
              onClick={() => setActiveTab('neon')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'neon'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              Neon
            </button>
          </div>

          {/* Palette Options */}
          <div className="space-y-3">
            {activeTab === 'monochrome' && (
              <div className="grid grid-cols-1 gap-2">
                {monochromePalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => updateTheme({ palette })}
                    className={`p-3 rounded-lg border transition-all ${
                      theme.palette.id === palette.id
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-300">{palette.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'colorful' && (
              <div className="grid grid-cols-1 gap-2">
                {colorfulPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => updateTheme({ palette })}
                    className={`p-3 rounded-lg border transition-all ${
                      theme.palette.id === palette.id
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-300">{palette.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'neon' && (
              <div className="grid grid-cols-1 gap-2">
                {neonPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => updateTheme({ palette })}
                    className={`p-3 rounded-lg border transition-all ${
                      theme.palette.id === palette.id
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex gap-1 mb-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-300">{palette.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Chart Border */}
        <div>
          <h3 className="text-white text-sm font-normal mb-3">Chart border</h3>
          <div className="grid grid-cols-3 gap-2">
            {['none', 'gradient', 'solid'].map((style) => (
              <button
                key={style}
                onClick={() => updateTheme({ borderStyle: style as any })}
                className={`py-2 px-3 rounded-lg text-xs transition-all ${
                  theme.borderStyle === style
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Border Color Selection - Show only when solid or gradient is selected */}
          {(theme.borderStyle === 'solid' || theme.borderStyle === 'gradient') && (
            <div className="mt-3">
              <h4 className="text-white text-xs font-normal mb-2">Border Color</h4>
              <div className="flex gap-2 flex-wrap">
                {borderColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => updateTheme({ borderColor: color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                      theme.borderColor === color
                        ? 'border-white shadow-md shadow-white/25'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Border color ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Corner Style */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateTheme({ cornerStyle: 'rounded' })}
            className={`py-2 px-3 rounded-lg text-xs transition-all ${
              theme.cornerStyle === 'rounded'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Rounded corners
          </button>
          <button
            onClick={() => updateTheme({ cornerStyle: 'sharp' })}
            className={`py-2 px-3 rounded-lg text-xs transition-all ${
              theme.cornerStyle === 'sharp'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Sharp corners
          </button>
        </div>

        {/* Chart Background */}
        <div>
          <h3 className="text-white text-sm font-normal mb-3">Chart background</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'black', label: 'Black', color: '#000000' },
              { id: 'white', label: 'White', color: '#FFFFFF' },
              { id: 'none', label: 'None', color: 'transparent' }
            ].map((bg) => (
              <button
                key={bg.id}
                onClick={() => updateTheme({ background: bg.id as any })}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                  theme.background === bg.id
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div
                  className="w-6 h-6 rounded border border-gray-600"
                  style={{ 
                    background: bg.id === 'custom' ? bg.color : bg.color,
                    backgroundImage: bg.id === 'none' ? 'url("data:image/svg+xml,%3csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cdefs%3e%3cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'8\' height=\'8\'%3e%3cpath d=\'m0 0h4v4h-4zm4 4h4v4h-4z\' fill=\'%23ffffff\' opacity=\'.1\'/%3e%3c/pattern%3e%3c/defs%3e%3crect width=\'100%25\' height=\'100%25\' fill=\'url(%23a)\'/%3e%3c/svg%3e")' : undefined
                  }}
                />
                <span className="text-xs text-gray-300">{bg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Section */}
        <div>
          <h3 className="text-white text-sm font-normal mb-3">Style</h3>
          <div className="space-y-3">
            {/* Sort high to low */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-gray-300 text-sm">📊</div>
                <span className="text-white text-sm">Sort high → low</span>
              </div>
              <button
                onClick={() => updateTheme({ sortHighToLow: !theme.sortHighToLow })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  theme.sortHighToLow ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    theme.sortHighToLow ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Data labels */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-gray-300 text-sm">🏷️</div>
                <span className="text-white text-sm">Data labels</span>
              </div>
              <button
                onClick={() => updateTheme({ showDataLabels: !theme.showDataLabels })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  theme.showDataLabels !== false ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    theme.showDataLabels !== false ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Show percentages */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-gray-300 text-sm">%</div>
                <span className="text-white text-sm">Show percentages</span>
              </div>
              <button
                onClick={() => updateTheme({ showPercentages: !theme.showPercentages })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  theme.showPercentages ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    theme.showPercentages ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Grid lines */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-gray-300 text-sm">⋈</div>
                <span className="text-white text-sm">Grid lines</span>
              </div>
              <button
                onClick={() => updateTheme({ showGridLines: !theme.showGridLines })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  theme.showGridLines !== false ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    theme.showGridLines !== false ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Number Format Section */}
        <div>
          <h3 className="text-white text-sm font-normal mb-3">Number format</h3>
          <div className="space-y-3">
            {/* Abbreviation */}
            <div>
              <label className="block text-white text-sm mb-2">Abbreviation</label>
              <select
                value={theme.abbreviation || 'auto'}
                onChange={(e) => updateTheme({ abbreviation: e.target.value as any })}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              >
                <option value="auto">Auto</option>
                <option value="none">None</option>
                <option value="k">K (thousands)</option>
                <option value="m">M (millions)</option>
              </select>
            </div>

            {/* Decimal places */}
            <div>
              <label className="block text-white text-sm mb-2">Decimal places</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateTheme({ decimalPlaces: 'auto' })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                    (theme.decimalPlaces || 'auto') === 'auto'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Auto
                </button>
                <button
                  onClick={() => updateTheme({ decimalPlaces: 'fixed', fixedDecimalCount: 0 })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                    theme.decimalPlaces === 'fixed'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Fixed
                </button>
              </div>
              {theme.decimalPlaces === 'fixed' && (
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={theme.fixedDecimalCount || 0}
                  onChange={(e) => updateTheme({ fixedDecimalCount: parseInt(e.target.value) || 0 })}
                  className="w-full mt-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="0"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}