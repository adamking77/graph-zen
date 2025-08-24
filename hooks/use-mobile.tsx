import * as React from "react"

// Enhanced breakpoints for better chart responsiveness
const MOBILE_SM_BREAKPOINT = 480   // Small mobile
const MOBILE_BREAKPOINT = 768      // Standard mobile/tablet portrait
const TABLET_BREAKPOINT = 1024     // Tablet landscape
const DESKTOP_BREAKPOINT = 1280    // Small desktop
const LARGE_DESKTOP_BREAKPOINT = 1536  // Large desktop
const EXTRA_LARGE_DESKTOP_BREAKPOINT = 1920  // Extra large
const ULTRA_WIDE_BREAKPOINT = 2560 // Ultra-wide displays

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
  const [breakpoint, setBreakpoint] = React.useState<'mobile-sm' | 'mobile' | 'tablet' | 'desktop' | 'large' | 'xlarge' | 'ultrawide'>('desktop')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < MOBILE_SM_BREAKPOINT) {
        setBreakpoint('mobile-sm')
      } else if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet')
      } else if (width < DESKTOP_BREAKPOINT) {
        setBreakpoint('desktop')
      } else if (width < LARGE_DESKTOP_BREAKPOINT) {
        setBreakpoint('large')
      } else if (width < EXTRA_LARGE_DESKTOP_BREAKPOINT) {
        setBreakpoint('xlarge')
      } else if (width < ULTRA_WIDE_BREAKPOINT) {
        setBreakpoint('xlarge')
      } else {
        setBreakpoint('ultrawide')
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
    isMobile: breakpoint === 'mobile-sm' || breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isLargeDesktop: breakpoint === 'large' || breakpoint === 'xlarge' || breakpoint === 'ultrawide',
    showZone1: breakpoint !== 'mobile-sm' && breakpoint !== 'mobile' && breakpoint !== 'tablet',
    showZone2: breakpoint !== 'mobile-sm' && breakpoint !== 'mobile',
    breakpoint
  }
}

// Enhanced layout state with space-based intelligence
export function useSpaceAwareLayoutState(containerSize: { width: number; height: number }) {
  const baseBreakpoint = useBreakpoint()
  const [spaceAwareState, setSpaceAwareState] = React.useState({
    isMobile: baseBreakpoint === 'mobile-sm' || baseBreakpoint === 'mobile',
    isTablet: baseBreakpoint === 'tablet',
    isDesktop: baseBreakpoint === 'desktop',
    isLargeDesktop: baseBreakpoint === 'large' || baseBreakpoint === 'xlarge' || baseBreakpoint === 'ultrawide',
    showZone1: baseBreakpoint !== 'mobile-sm' && baseBreakpoint !== 'mobile' && baseBreakpoint !== 'tablet',
    showZone2: baseBreakpoint !== 'mobile-sm' && baseBreakpoint !== 'mobile',
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
      
      // Chart-specific minimum space requirements
      const minChartWidth = baseBreakpoint === 'mobile-sm' ? 280 : baseBreakpoint === 'mobile' ? 320 : 400
      const minChartHeight = baseBreakpoint === 'mobile-sm' ? 200 : baseBreakpoint === 'mobile' ? 240 : 300
      
      // Zone dimensions at different breakpoints
      const zoneConfigs = {
        'mobile-sm': { zone1: 0, zone2: 0 },
        'mobile': { zone1: 0, zone2: 0 },
        'tablet': { zone1: 0, zone2: 320 },
        'desktop': { zone1: 240, zone2: 360 },
        'large': { zone1: 256, zone2: 384 },
        'xlarge': { zone1: 272, zone2: 416 },
        'ultrawide': { zone1: 288, zone2: 480 }
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
        if (width < MOBILE_SM_BREAKPOINT) {
          // Very small mobile - ultra-compact layout
          layoutMode = 'mobile'
          effectiveBreakpoint = 'mobile-sm'
          zones = zoneConfigs['mobile-sm']
        } else if (width < MOBILE_BREAKPOINT) {
          // Standard mobile - compact layout
          layoutMode = 'mobile'
          effectiveBreakpoint = 'mobile'
          zones = zoneConfigs.mobile
        } else if (width < TABLET_BREAKPOINT || availableChartWidth < minChartWidth) {
          // Tablet screens - stack zones below chart
          layoutMode = 'stacked'
          effectiveBreakpoint = 'tablet'
          zones = { zone1: 0, zone2: 0 } // No horizontal space taken in stacked mode
        } else {
          // Desktop and larger screens - sidebar layout
          layoutMode = 'sidebar'
          // If not enough space for current breakpoint, downgrade intelligently
          if (availableChartWidth < minChartWidth || availableChartHeight < minChartHeight) {
            if (baseBreakpoint === 'ultrawide' || baseBreakpoint === 'xlarge' || baseBreakpoint === 'large') {
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
          isLargeDesktop: layoutMode === 'sidebar' && (effectiveBreakpoint === 'large' || effectiveBreakpoint === 'xlarge' || effectiveBreakpoint === 'ultrawide'),
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
        isMobile: baseBreakpoint === 'mobile-sm' || baseBreakpoint === 'mobile',
        isTablet: baseBreakpoint === 'tablet',
        isDesktop: baseBreakpoint === 'desktop',
        isLargeDesktop: baseBreakpoint === 'large' || baseBreakpoint === 'xlarge' || baseBreakpoint === 'ultrawide',
        showZone1: baseBreakpoint !== 'mobile-sm' && baseBreakpoint !== 'mobile' && baseBreakpoint !== 'tablet',
        showZone2: baseBreakpoint !== 'mobile-sm' && baseBreakpoint !== 'mobile',
        breakpoint: baseBreakpoint,
        availableChartWidth: 800,
        availableChartHeight: 600,
        zoneWidths: zones,
        layoutMode: (baseBreakpoint === 'mobile-sm' || baseBreakpoint === 'mobile') ? 'mobile' as const : 'sidebar' as const
      }
    }
    
    setSpaceAwareState(calculateSpaceBasedLayout())
  }, [containerSize.width, containerSize.height, baseBreakpoint])

  return spaceAwareState
}
