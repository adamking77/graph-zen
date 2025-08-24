"use client"

import { useState, useEffect } from "react"
import { ChartEditor } from "@/components/chart-editor"
import { ChartPreview } from "@/components/chart-preview"
import { ExportPanel } from "@/components/export-panel"
import { Zone1Navigation } from "@/components/zone1-navigation"
import { Zone2ControlPanel } from "@/components/zone2-control-panel"
import { Header } from "@/components/header"
import { ColorPalette, type ColorTheme } from "@/components/color-palette"
import { ErrorBoundary } from "@/components/error-boundary"
import { useChartConfig } from "@/hooks/use-chart-config"
import { useEmbedMode } from "@/hooks/use-embed-mode"
import { useSpaceAwareLayoutState } from "@/hooks/use-mobile"
import { SIZE_PRESETS } from "@/lib/chart-constants"
import { ModernBottomSheet } from "@/components/modern-bottom-sheet"

export interface ChartData {
  scenario: string
  value: number
  displayValue?: string
}

export interface ChartDataSeries {
  name: string
  data: ChartData[]
  color?: string
  visible?: boolean  // Toggle visibility of this series
}

export interface ChartDimensions {
  width: number
  height: number
  preset: string
  aspectRatio: string
}

export interface ChartConfig {
  title: string
  subtitle: string
  type: "horizontal-bar" | "vertical-bar" | "pie" | "donut" | "line" | "combo"
  data: ChartData[]
  series?: ChartDataSeries[]  // Multi-series support
  multiSeries?: boolean       // Toggle for multi-series mode
  dimensions?: ChartDimensions
  theme?: ColorTheme
  isModalContext?: boolean
  isSeriesEditingMode?: boolean // Flag for series editing context
}


export default function ChartGeneratorPage() {
  const isEmbedMode = useEmbedMode()
  const { config, updateConfig } = useChartConfig()
  const [showExport, setShowExport] = useState(false)
  const [activeSection, setActiveSection] = useState("essentials")
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const layoutState = useSpaceAwareLayoutState(containerSize)
  
  // Track container size for space-aware layout
  useEffect(() => {
    const updateContainerSize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [])

  // Embed mode - simplified layout
  if (isEmbedMode) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <ErrorBoundary>
          <main role="main" aria-label="Chart display">
            <ChartPreview config={config} />
          </main>
        </ErrorBoundary>
      </div>
    )
  }

  // Normal mode - adaptive layout based on available space
  const renderSidebarLayout = () => (
    <div className="flex h-screen">
      {/* Zone 1: Navigation - Space-aware visibility */}
      {layoutState.showZone1 && (
        <div>
          <ErrorBoundary>
            <Zone1Navigation 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              onExportClick={() => setShowExport(true)}
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
              onChange={updateConfig}
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

  const renderStackedLayout = () => (
    <div className="flex flex-col h-screen">
      {/* Zone 1: Navigation - Horizontal bar at top */}
      {layoutState.showZone1 && (
        <div className="flex-shrink-0 h-16 border-b border-border">
          <ErrorBoundary>
            <Zone1Navigation 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              onExportClick={() => setShowExport(true)}
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
              onChange={updateConfig}
              isStacked={true}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )

  const renderMobileLayout = () => (
    <div className="flex h-screen">
      {/* Zone 3: Chart Preview Area - Full screen */}
      <main className="flex-1 flex flex-col bg-background min-h-0 relative" role="main" aria-label="Chart preview">
        <ErrorBoundary>
          <ChartPreview config={config} />
        </ErrorBoundary>
        
        {/* Mobile Controls Bottom Sheet - Only show when zones are hidden */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-card border-t border-border">
            <div className="px-4 py-2">
              <button
                onClick={() => setShowMobileControls(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                </svg>
                Open Controls
              </button>
            </div>
            
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowMobileNav(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Action Button for Mobile - Removed as redundant */}
      {/* <FloatingActionButton
        actions={[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
            ),
            label: "Chart Controls",
            onClick: () => setShowMobileControls(true)
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            ),
            label: "Navigation",
            onClick: () => setShowMobileNav(true)
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            ),
            label: "Export Chart",
            onClick: () => setShowExport(true)
          }
        ]}
        mainIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        }
      /> */}
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Render appropriate layout based on layoutMode */}
      {layoutState.layoutMode === 'sidebar' && renderSidebarLayout()}
      {layoutState.layoutMode === 'stacked' && renderStackedLayout()}
      {layoutState.layoutMode === 'mobile' && renderMobileLayout()}

      {/* Mobile Navigation Overlay */}
      {showMobileNav && layoutState.isMobile && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileNav(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] sm:max-w-[75vw] bg-card border-r border-border">
            <ErrorBoundary>
              <Zone1Navigation 
                activeSection={activeSection} 
                onSectionChange={(section) => {
                  setActiveSection(section)
                  setShowMobileNav(false)
                }}
                onExportClick={() => {
                  setShowExport(true)
                  setShowMobileNav(false)
                }}
                isMobile={true}
                onClose={() => setShowMobileNav(false)}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* Modern Mobile Controls Bottom Sheet */}
      <ModernBottomSheet
        isOpen={showMobileControls && layoutState.isMobile}
        onClose={() => setShowMobileControls(false)}
        title="Chart Controls"
        snapPoints={[60, 85]}
        initialSnap={0}
        enableBackdropDismiss={true}
        enableDragDismiss={true}
      >
        <ErrorBoundary>
          <Zone2ControlPanel 
            activeSection={activeSection}
            config={config} 
            onChange={updateConfig}
            isMobile={true}
            onClose={() => setShowMobileControls(false)}
          />
        </ErrorBoundary>
      </ModernBottomSheet>
      
      {/* Export Dialog */}
      {showExport && (
        <div role="dialog" aria-modal="true" aria-label="Export chart dialog">
          <ExportPanel config={config} onClose={() => setShowExport(false)} />
        </div>
      )}
    </div>
  )
}
