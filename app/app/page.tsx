"use client"

import { useState, useEffect } from "react"
import { ChartPreview } from "@/components/chart-preview"
import { ExportPanel } from "@/components/export-panel"
import { Zone1Navigation } from "@/components/zone1-navigation"
import { Zone2ControlPanel } from "@/components/zone2-control-panel"
import { ErrorBoundary } from "@/components/error-boundary"
import { SidebarLayout } from "@/components/layouts/sidebar-layout"
import { StackedLayout } from "@/components/layouts/stacked-layout"
import { MobileLayout } from "@/components/layouts/mobile-layout"
import { useChartConfig } from "@/hooks/use-chart-config"
import { useEmbedMode } from "@/hooks/use-embed-mode"
import { useSpaceAwareLayoutState } from "@/hooks/use-mobile"
import { ModernBottomSheet } from "@/components/modern-bottom-sheet"
import { type ChartConfig } from "@/types/chart"

export const dynamic = 'force-dynamic'

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

  // Layout component props
  const layoutProps = {
    layoutState,
    activeSection,
    onSectionChange: setActiveSection,
    onExportClick: () => setShowExport(true),
    config,
    onConfigChange: updateConfig
  }

  const mobileLayoutProps = {
    activeSection,
    onShowMobileControls: () => setShowMobileControls(true),
    onShowMobileNav: () => setShowMobileNav(true),
    config
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Render appropriate layout based on layoutMode */}
      {layoutState.layoutMode === 'sidebar' && <SidebarLayout {...layoutProps} />}
      {layoutState.layoutMode === 'stacked' && <StackedLayout {...layoutProps} />}
      {layoutState.layoutMode === 'mobile' && <MobileLayout {...mobileLayoutProps} />}

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
