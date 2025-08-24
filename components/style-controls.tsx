"use client"

import type { ColorTheme } from "./color-palette"

interface StyleControlsProps {
  theme: ColorTheme
  chartType: string
  onChange: (theme: Partial<ColorTheme>) => void
}

export function StyleControls({ theme, chartType, onChange }: StyleControlsProps) {
  const updateTheme = (updates: Partial<ColorTheme>) => {
    onChange(updates)
  }

  const hasGridLines = ['vertical-bar', 'horizontal-bar', 'line', 'combo'].includes(chartType)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-normal text-foreground mb-3">Data Options</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Data sorting</label>
            <select
              value={theme.sortOrder || 'none'}
              onChange={(e) => updateTheme({ sortOrder: e.target.value as any, sortHighToLow: e.target.value === 'value-desc' })}
              className="w-full bg-background border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              suppressHydrationWarning
            >
              <option value="none">No sorting</option>
              <option value="value-desc">Value: High → Low</option>
              <option value="value-asc">Value: Low → High</option>
              <option value="alpha-asc">Name: A → Z</option>
              <option value="alpha-desc">Name: Z → A</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-sm">🏷️</div>
              <span className="text-foreground text-sm">Data labels</span>
            </div>
            <button
              onClick={() => updateTheme({ showDataLabels: !theme.showDataLabels })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                theme.showDataLabels !== false ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  theme.showDataLabels !== false ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-sm">%</div>
              <span className="text-foreground text-sm">Show percentages</span>
            </div>
            <button
              onClick={() => updateTheme({ showPercentages: !theme.showPercentages })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                theme.showPercentages ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  theme.showPercentages ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {hasGridLines && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground text-sm">⋈</div>
                <span className="text-foreground text-sm">Grid lines</span>
              </div>
              <button
                onClick={() => updateTheme({ showGridLines: !theme.showGridLines })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  theme.showGridLines !== false ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    theme.showGridLines !== false ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-sm">∑</div>
              <span className="text-foreground text-sm">Show chart total</span>
            </div>
            <button
              onClick={() => updateTheme({ showChartTotal: !theme.showChartTotal })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                theme.showChartTotal ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  theme.showChartTotal ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {hasGridLines && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground text-sm">📊</div>
                <span className="text-foreground text-sm">Average line</span>
              </div>
              <button
                onClick={() => {
                  const currentReferenceLines = theme.referenceLines || {}
                  const currentAverage = currentReferenceLines.average || { enabled: false, color: '#6366F1' }
                  updateTheme({ 
                    referenceLines: {
                      ...currentReferenceLines,
                      average: { ...currentAverage, enabled: !currentAverage.enabled }
                    }
                  })
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  theme.referenceLines?.average?.enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    theme.referenceLines?.average?.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-normal text-foreground mb-3">Number format</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Abbreviation</label>
            <select
              value={theme.abbreviation || 'auto'}
              onChange={(e) => updateTheme({ abbreviation: e.target.value as any })}
              className="w-full bg-background border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              suppressHydrationWarning
            >
              <option value="auto">Auto</option>
              <option value="none">None</option>
              <option value="k">K (thousands)</option>
              <option value="m">M (millions)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Decimal places</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateTheme({ decimalPlaces: 'auto' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all duration-200 border ${
                  (theme.decimalPlaces || 'auto') === 'auto'
                    ? 'bg-primary/10 border-transparent text-primary'
                    : 'bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground'
                }`}
              >
                Auto
              </button>
              <button
                onClick={() => updateTheme({ decimalPlaces: 'fixed', fixedDecimalCount: 0 })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all duration-200 border ${
                  theme.decimalPlaces === 'fixed'
                    ? 'bg-primary/10 border-transparent text-primary'
                    : 'bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground'
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
                className="w-full mt-2 bg-background border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                placeholder="0"
              />
            )}
          </div>
        </div>
      </div>

    </div>
  )
}