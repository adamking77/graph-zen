import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarLayout } from '@/components/layouts/sidebar-layout'
import { StackedLayout } from '@/components/layouts/stacked-layout'
import { MobileLayout } from '@/components/layouts/mobile-layout'

// Mock the child components
vi.mock('@/components/zone1-navigation', () => ({
  Zone1Navigation: ({ activeSection }: { activeSection: string }) => (
    <div data-testid="zone1-nav">Zone 1 Navigation - {activeSection}</div>
  )
}))

vi.mock('@/components/zone2-control-panel', () => ({
  Zone2ControlPanel: ({ activeSection }: { activeSection: string }) => (
    <div data-testid="zone2-control">Zone 2 Control Panel - {activeSection}</div>
  )
}))

vi.mock('@/components/chart-preview', () => ({
  ChartPreview: () => (
    <div data-testid="chart-preview">Chart Preview</div>
  )
}))

vi.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
}))

const mockConfig = {
  title: "Test Chart",
  subtitle: "",
  type: "vertical-bar" as const,
  data: [
    { scenario: "A", value: 10 },
    { scenario: "B", value: 20 }
  ]
}

const mockLayoutState = {
  showZone1: true,
  showZone2: true
}

const mockProps = {
  layoutState: mockLayoutState,
  activeSection: "essentials",
  onSectionChange: vi.fn(),
  onExportClick: vi.fn(),
  config: mockConfig,
  onConfigChange: vi.fn()
}

describe('Layout Components', () => {
  describe('SidebarLayout', () => {
    it('renders all zones when visible', () => {
      render(<SidebarLayout {...mockProps} />)
      
      expect(screen.getByTestId('zone1-nav')).toBeInTheDocument()
      expect(screen.getByTestId('zone2-control')).toBeInTheDocument()
      expect(screen.getByTestId('chart-preview')).toBeInTheDocument()
    })

    it('hides zones when layoutState indicates they should not be shown', () => {
      const propsWithHiddenZones = {
        ...mockProps,
        layoutState: { showZone1: false, showZone2: false }
      }
      
      render(<SidebarLayout {...propsWithHiddenZones} />)
      
      expect(screen.queryByTestId('zone1-nav')).not.toBeInTheDocument()
      expect(screen.queryByTestId('zone2-control')).not.toBeInTheDocument()
      expect(screen.getByTestId('chart-preview')).toBeInTheDocument() // Chart preview should always be visible
    })

    it('applies correct CSS classes for sidebar layout', () => {
      const { container } = render(<SidebarLayout {...mockProps} />)
      const mainElement = container.querySelector('main')
      
      expect(mainElement).toHaveClass('flex-1', 'flex', 'flex-col', 'bg-background')
    })
  })

  describe('StackedLayout', () => {
    it('renders all zones when visible', () => {
      render(<StackedLayout {...mockProps} />)
      
      expect(screen.getByTestId('zone1-nav')).toBeInTheDocument()
      expect(screen.getByTestId('zone2-control')).toBeInTheDocument()
      expect(screen.getByTestId('chart-preview')).toBeInTheDocument()
    })

    it('applies correct CSS classes for stacked layout', () => {
      const { container } = render(<StackedLayout {...mockProps} />)
      const rootDiv = container.firstChild as HTMLElement
      
      expect(rootDiv).toHaveClass('flex', 'flex-col', 'h-screen')
    })

    it('positions navigation at top and control panel at bottom', () => {
      const { container } = render(<StackedLayout {...mockProps} />)
      const children = Array.from(container.firstChild!.childNodes) as HTMLElement[]
      
      // First child should be navigation (when visible)
      expect(children[0].querySelector('[data-testid="zone1-nav"]')).toBeInTheDocument()
      
      // Last child should be control panel (when visible)
      expect(children[children.length - 1].querySelector('[data-testid="zone2-control"]')).toBeInTheDocument()
    })
  })

  describe('MobileLayout', () => {
    const mobileProps = {
      activeSection: "essentials",
      onShowMobileControls: vi.fn(),
      onShowMobileNav: vi.fn(),
      config: mockConfig
    }

    it('renders chart preview and mobile controls', () => {
      render(<MobileLayout {...mobileProps} />)
      
      expect(screen.getByTestId('chart-preview')).toBeInTheDocument()
      expect(screen.getByText('Open Controls')).toBeInTheDocument()
      expect(screen.getByText('Essentials')).toBeInTheDocument() // Capitalized active section
    })

    it('calls callback functions when buttons are clicked', () => {
      render(<MobileLayout {...mobileProps} />)
      
      const controlsButton = screen.getByText('Open Controls')
      const navButton = screen.getByText('Essentials')
      
      controlsButton.click()
      expect(mobileProps.onShowMobileControls).toHaveBeenCalled()
      
      navButton.click()
      expect(mobileProps.onShowMobileNav).toHaveBeenCalled()
    })

    it('displays active section name with proper capitalization', () => {
      const propsWithDataSection = {
        ...mobileProps,
        activeSection: "data"
      }
      
      render(<MobileLayout {...propsWithDataSection} />)
      expect(screen.getByText('Data')).toBeInTheDocument()
    })
  })
})