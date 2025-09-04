"use client"

import { ChartPreview } from "@/components/chart-preview"
import { ErrorBoundary } from "@/components/error-boundary"
import { type ChartConfig } from "@/types/chart"

interface MobileLayoutProps {
  activeSection: string
  onShowMobileControls: () => void
  onShowMobileNav: () => void
  config: ChartConfig
}

export function MobileLayout({ 
  activeSection, 
  onShowMobileControls, 
  onShowMobileNav,
  config
}: MobileLayoutProps) {
  return (
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
                onClick={onShowMobileControls}
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
                onClick={onShowMobileNav}
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
    </div>
  )
}