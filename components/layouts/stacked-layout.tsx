"use client"

import { Zone1Navigation } from "@/components/zone1-navigation"
import { Zone2ControlPanel } from "@/components/zone2-control-panel"
import { ChartPreview } from "@/components/chart-preview"
import { ErrorBoundary } from "@/components/error-boundary"
import { type ChartConfig } from "@/types/chart"

interface StackedLayoutProps {
  layoutState: {
    showZone1: boolean
    showZone2: boolean
  }
  activeSection: string
  onSectionChange: (section: string) => void
  onExportClick: () => void
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

export function StackedLayout({ 
  layoutState, 
  activeSection, 
  onSectionChange, 
  onExportClick,
  config,
  onConfigChange
}: StackedLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* Zone 1: Navigation - Horizontal bar at top */}
      {layoutState.showZone1 && (
        <div className="flex-shrink-0 h-16 border-b border-border">
          <ErrorBoundary>
            <Zone1Navigation 
              activeSection={activeSection} 
              onSectionChange={onSectionChange}
              onExportClick={onExportClick}
              isHorizontal={true}
            />
          </ErrorBoundary>
        </div>
      )}
      
      {/* Zone 3: Chart Preview Area - Takes available space */}
      <main className="flex-1 flex flex-col bg-background min-h-0 relative" role="main" aria-label="Chart preview">
        <ErrorBoundary>
          <ChartPreview config={config} />
        </ErrorBoundary>
      </main>
      
      {/* Zone 2: Control Panel - Stacked below chart */}
      {layoutState.showZone2 && (
        <div className="flex-shrink-0 max-h-80 border-t border-border">
          <ErrorBoundary>
            <Zone2ControlPanel 
              activeSection={activeSection}
              config={config} 
              onChange={onConfigChange}
              isStacked={true}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}