"use client"

import type { ColorTheme } from "./color-palette"

interface LayoutControlsProps {
  theme: ColorTheme
  chartType: string
  onChange: (theme: Partial<ColorTheme>) => void
}

export function LayoutControls({ theme, chartType, onChange }: LayoutControlsProps) {
  const updateTheme = (updates: Partial<ColorTheme>) => {
    onChange(updates)
  }

  // Check if chart type supports legend position
  const isPieOrDonut = chartType === 'pie' || chartType === 'donut'

  return (
    <div className="space-y-6">
      {/* Layout Section */}
      <div>
        <div className="space-y-3">
          {/* Title alignment */}
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Title alignment</label>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((alignment) => (
                <button
                  key={alignment}
                  onClick={() => updateTheme({ titleAlignment: alignment as any })}
                  className={`py-2 px-3 rounded-lg text-xs transition-all duration-200 border ${
                    (theme.titleAlignment || 'center') === alignment
                      ? 'bg-primary/10 border-transparent text-primary'
                      : 'bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend position - only for pie/donut charts */}
          {isPieOrDonut && (
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Legend position</label>
              <div className="grid grid-cols-3 gap-2">
                {['left', 'bottom', 'right'].map((position) => (
                  <button
                    key={position}
                    onClick={() => updateTheme({ legendPosition: position as any })}
                    className={`py-2 px-3 rounded-lg text-xs transition-all duration-200 border ${
                      (theme.legendPosition || 'right') === position
                        ? 'bg-primary/10 border-transparent text-primary'
                        : 'bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}