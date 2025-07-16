import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1400
const LARGE_DESKTOP_BREAKPOINT = 1600

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop' | 'large' | 'xlarge'>('desktop')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet')
      } else if (width < DESKTOP_BREAKPOINT) {
        setBreakpoint('desktop')
      } else if (width < LARGE_DESKTOP_BREAKPOINT) {
        setBreakpoint('large')
      } else {
        setBreakpoint('xlarge')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

export function useLayoutState() {
  const breakpoint = useBreakpoint()
  
  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isLargeDesktop: breakpoint === 'large' || breakpoint === 'xlarge',
    showZone1: breakpoint !== 'mobile' && breakpoint !== 'tablet',
    showZone2: breakpoint !== 'mobile',
    breakpoint
  }
}

// Enhanced layout state with space-based intelligence
export function useSpaceAwareLayoutState(containerSize: { width: number; height: number }) {
  const baseBreakpoint = useBreakpoint()
  const [spaceAwareState, setSpaceAwareState] = React.useState({
    isMobile: baseBreakpoint === 'mobile',
    isTablet: baseBreakpoint === 'tablet',
    isDesktop: baseBreakpoint === 'desktop',
    isLargeDesktop: baseBreakpoint === 'large' || baseBreakpoint === 'xlarge',
    showZone1: baseBreakpoint !== 'mobile' && baseBreakpoint !== 'tablet',
    showZone2: baseBreakpoint !== 'mobile',
    breakpoint: baseBreakpoint,
    availableChartWidth: 0,
    availableChartHeight: 0,
    zoneWidths: { zone1: 0, zone2: 0 },
    layoutMode: 'sidebar' as 'sidebar' | 'stacked' | 'mobile'
  })

  React.useEffect(() => {
    // Calculate intelligent breakpoints based on available space
    const calculateSpaceBasedLayout = () => {
      const { width, height } = containerSize
      
      // Minimum space required for chart to be usable
      const minChartWidth = 400
      const minChartHeight = 300
      
      // Zone dimensions at different breakpoints
      const zoneConfigs = {
        mobile: { zone1: 0, zone2: 0 },
        tablet: { zone1: 0, zone2: 320 },
        desktop: { zone1: 240, zone2: 360 },
        large: { zone1: 256, zone2: 384 },
        xlarge: { zone1: 272, zone2: 416 }
      }
      
      // Start with base breakpoint
      let effectiveBreakpoint = baseBreakpoint
      let zones = zoneConfigs[baseBreakpoint]
      let layoutMode: 'sidebar' | 'stacked' | 'mobile' = 'sidebar'
      
      // Override based on available space
      if (width > 0 && height > 0) {
        const marginsAndPadding = 40
        const reservedHeight = 180 // UI chrome
        
        // Check if current breakpoint provides enough space for sidebar layout
        const totalZoneWidth = zones.zone1 + zones.zone2 + marginsAndPadding
        const availableChartWidth = width - totalZoneWidth
        const availableChartHeight = height - reservedHeight
        
        // Determine layout mode based on available space
        if (width < 768) {
          // Very narrow screens - mobile layout with overlays
          layoutMode = 'mobile'
          effectiveBreakpoint = 'mobile'
          zones = zoneConfigs.mobile
        } else if (width < 1024 || availableChartWidth < minChartWidth) {
          // Narrow screens - stack zones below chart
          layoutMode = 'stacked'
          effectiveBreakpoint = 'tablet'
          zones = { zone1: 0, zone2: 0 } // No horizontal space taken in stacked mode
        } else {
          // Wide screens - sidebar layout
          layoutMode = 'sidebar'
          // If not enough space for current breakpoint, downgrade
          if (availableChartWidth < minChartWidth || availableChartHeight < minChartHeight) {
            if (baseBreakpoint === 'xlarge' || baseBreakpoint === 'large') {
              effectiveBreakpoint = 'desktop'
              zones = zoneConfigs.desktop
            } else if (baseBreakpoint === 'desktop') {
              effectiveBreakpoint = 'tablet'
              zones = zoneConfigs.tablet
            }
          }
        }
        
        // Recalculate with effective layout
        const effectiveTotalZoneWidth = layoutMode === 'stacked' ? 0 : zones.zone1 + zones.zone2 + marginsAndPadding
        const effectiveChartWidth = width - effectiveTotalZoneWidth
        const effectiveChartHeight = height - reservedHeight
        
        return {
          isMobile: layoutMode === 'mobile',
          isTablet: layoutMode === 'stacked' || effectiveBreakpoint === 'tablet',
          isDesktop: layoutMode === 'sidebar' && effectiveBreakpoint === 'desktop',
          isLargeDesktop: layoutMode === 'sidebar' && (effectiveBreakpoint === 'large' || effectiveBreakpoint === 'xlarge'),
          showZone1: layoutMode !== 'mobile',
          showZone2: layoutMode !== 'mobile',
          breakpoint: effectiveBreakpoint,
          availableChartWidth: Math.max(effectiveChartWidth, minChartWidth),
          availableChartHeight: Math.max(effectiveChartHeight, minChartHeight),
          zoneWidths: zones,
          layoutMode
        }
      }
      
      // Fallback to base breakpoint
      return {
        isMobile: baseBreakpoint === 'mobile',
        isTablet: baseBreakpoint === 'tablet',
        isDesktop: baseBreakpoint === 'desktop',
        isLargeDesktop: baseBreakpoint === 'large' || baseBreakpoint === 'xlarge',
        showZone1: baseBreakpoint !== 'mobile' && baseBreakpoint !== 'tablet',
        showZone2: baseBreakpoint !== 'mobile',
        breakpoint: baseBreakpoint,
        availableChartWidth: 800,
        availableChartHeight: 600,
        zoneWidths: zones,
        layoutMode: baseBreakpoint === 'mobile' ? 'mobile' as const : 'sidebar' as const
      }
    }
    
    setSpaceAwareState(calculateSpaceBasedLayout())
  }, [containerSize.width, containerSize.height, baseBreakpoint])

  return spaceAwareState
}
