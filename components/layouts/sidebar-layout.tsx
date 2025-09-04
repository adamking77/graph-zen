"use client"

import { Zone1Navigation } from "@/components/zone1-navigation"
import { Zone2ControlPanel } from "@/components/zone2-control-panel"
import { ChartPreview } from "@/components/chart-preview"
import { ErrorBoundary } from "@/components/error-boundary"
import { type ChartConfig } from "@/types/chart"

interface SidebarLayoutProps {
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

export function SidebarLayout({ 
  layoutState, 
  activeSection, 
  onSectionChange, 
  onExportClick,
  config,
  onConfigChange
}: SidebarLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Zone 1: Navigation - Space-aware visibility */}
      {layoutState.showZone1 && (
        <div>
          <ErrorBoundary>
            <Zone1Navigation 
              activeSection={activeSection} 
              onSectionChange={onSectionChange}
              onExportClick={onExportClick}
            />
          </ErrorBoundary>
        </div>
      )}
      
      {/* Zone 2: Control Panel - Space-aware visibility */}
      {layoutState.showZone2 && (
        <div>
          <ErrorBoundary>
            <Zone2ControlPanel 
              activeSection={activeSection}
              config={config} 
              onChange={onConfigChange}
            />
          </ErrorBoundary>
        </div>
      )}
      
      {/* Zone 3: Chart Preview Area - Full width on mobile, flex-1 on larger screens */}
      <main className="flex-1 flex flex-col bg-background min-h-0 relative" role="main" aria-label="Chart preview">
        <ErrorBoundary>
          <ChartPreview config={config} />
        </ErrorBoundary>
      </main>
    </div>
  )
}