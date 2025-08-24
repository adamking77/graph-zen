"use client"

import { useRef, useState, useEffect } from "react"
import type { ChartConfig, ChartData } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"
import { useLayoutState, useSpaceAwareLayoutState } from "@/hooks/use-mobile"

// Inject chart animation styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    @keyframes growHorizontal {
      from { width: 0%; }
      to { width: var(--target-width, 100%); }
    }
    @keyframes growVertical {
      from { transform: scaleY(0); }
      to { transform: scaleY(1); }
    }
    @keyframes pieSegmentReveal {
      0% { 
        opacity: 0;
        transform: scale(0.3);
      }
      50% { 
        opacity: 1;
        transform: scale(0.8);
      }
      100% { 
        transform: scale(1);
      }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
  if (!document.head.querySelector('[data-chart-animations]')) {
    styleSheet.setAttribute('data-chart-animations', 'true')
    document.head.appendChild(styleSheet)
  }
}

interface TooltipData {
  x: number
  y: number
  label: string
  value: number
  displayValue?: string
  percentage?: number
  color: string
}

interface TooltipProps {
  data: TooltipData | null
  formatNumber: (value: number) => string
}

function Tooltip({ data, formatNumber }: TooltipProps) {
  if (!data) return null

  return (
    <div 
      className="fixed z-50 pointer-events-none transition-all duration-200 ease-out"
      style={{
        left: data.x + 10,
        top: data.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/60 rounded-lg px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="text-white text-sm font-medium">{data.label}</span>
        </div>
        <div className="text-gray-300 text-xs">
          <div>Value: {data.displayValue || formatNumber(data.value)}</div>
          {data.percentage && (
            <div>Percentage: {data.percentage.toFixed(1)}%</div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ChartPreviewProps {
  config: ChartConfig
}

export function ChartPreview({ config }: ChartPreviewProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDark = config.theme?.background !== 'white'
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [renderKey, setRenderKey] = useState(0)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const layoutState = useSpaceAwareLayoutState(containerSize)
  
  // Handle data changes to force re-render when config data updates
  useEffect(() => {
    setRenderKey(prev => prev + 1)
  }, [config.data, config.type, config.dimensions])

  // Handle container resize with ResizeObserver for true responsive behavior
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerSize({ width, height })
      }
    })
    
    resizeObserver.observe(container)
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [])
  
  // Get chart dimensions
  const dimensions = config.dimensions || { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' }
  
  // Calculate container dimensions with enhanced responsive sizing
  const getContainerDimensions = () => {
    const aspectRatio = dimensions.width / dimensions.height
    
    // Modal context: use flexible dimensions that work with container
    if (config.isModalContext) {
      const modalWidth = layoutState.isMobile ? 320 : 480
      const modalHeight = layoutState.isMobile ? 240 : 360
      return {
        width: '100%',
        height: 'auto',
        chartWidth: modalWidth,
        chartHeight: modalHeight,
        availableWidth: modalWidth - (layoutState.isMobile ? 16 : 40),
        availableHeight: modalHeight - (layoutState.isMobile ? 16 : 32)
      }
    }
    
    // Reserve space for UI elements with responsive adjustments
    const titleSpace = layoutState.isMobile ? 60 : layoutState.isTablet ? 70 : 80
    const legendSpace = layoutState.isMobile ? 
      ((config.type === 'pie' || config.type === 'donut' || config.type === 'combo') ? 40 : 20) :
      ((config.type === 'pie' || config.type === 'donut' || config.type === 'combo') ? 50 : 30)
    const padding = layoutState.isMobile ? 24 : layoutState.isTablet ? 36 : 48
    const reservedHeight = titleSpace + legendSpace + padding
    
    // Use pre-calculated space-aware values from layoutState
    const availableViewportWidth = layoutState.availableChartWidth
    const availableViewportHeight = layoutState.availableChartHeight
    
    // Content-aware sizing adjustments based on data characteristics
    const getContentAwareAdjustments = () => {
      const dataCount = config.data.length
      const chartType = config.type
      const hasLabels = config.theme?.showDataLabels !== false
      const hasPercentages = config.theme?.showPercentages || false
      
      // Calculate optimal sizing based on content
      let sizeMultiplier = 1.0
      let minSpacePerItem = 0
      
      if (chartType === 'horizontal-bar' || chartType === 'vertical-bar') {
        // Bar charts need space proportional to data count
        minSpacePerItem = chartType === 'horizontal-bar' ? 48 : 80 // min height/width per bar
        if (dataCount > 8) sizeMultiplier *= 1.2 // More space for many bars
        if (hasLabels) sizeMultiplier *= 1.1 // Extra space for labels
      } else if (chartType === 'pie' || chartType === 'donut') {
        // Pie/donut charts need space for external labels
        if (dataCount > 6 && hasLabels) sizeMultiplier *= 1.15
        if (hasPercentages && hasLabels) sizeMultiplier *= 1.05
      } else if (chartType === 'line' || chartType === 'combo') {
        // Line charts benefit from more width with many data points
        if (dataCount > 10) sizeMultiplier *= 1.1
        if (dataCount > 20) sizeMultiplier *= 1.2
      }
      
      return { sizeMultiplier, minSpacePerItem, dataCount }
    }
    
    const contentAdjustments = getContentAwareAdjustments()
    
    // Enhanced responsive max dimensions based on breakpoint and content
    const getResponsiveLimits = () => {
      if (layoutState.breakpoint === 'mobile-sm') {
        return {
          utilization: 0.95,
          minWidth: aspectRatio < 0.8 ? 280 : 320,
          maxWidth: aspectRatio < 0.8 ? 360 : 420,
          minHeight: aspectRatio < 0.8 ? 320 : 240,
          maxHeight: aspectRatio < 0.8 ? 500 : 400
        }
      } else if (layoutState.isMobile) {
        return {
          utilization: 0.96,
          minWidth: aspectRatio < 0.8 ? 320 : 400,
          maxWidth: aspectRatio < 0.8 ? 480 : 600,
          minHeight: aspectRatio < 0.8 ? 400 : 300,
          maxHeight: aspectRatio < 0.8 ? 700 : 500
        }
      } else if (layoutState.isTablet) {
        return {
          utilization: 0.97,
          minWidth: aspectRatio < 0.8 ? 400 : 500,
          maxWidth: aspectRatio < 0.8 ? 550 : 800,
          minHeight: aspectRatio < 0.8 ? 500 : 400,
          maxHeight: aspectRatio < 0.8 ? 800 : 600
        }
      } else {
        // Desktop sizing with content-aware adjustments
        const baseMinWidth = aspectRatio < 0.8 ? 450 : 700
        const baseMaxWidth = aspectRatio < 0.8 ? 600 : 1200
        const baseMinHeight = aspectRatio < 0.8 ? 650 : 550
        const baseMaxHeight = aspectRatio < 0.8 ? 1000 : 800
        
        return {
          utilization: 0.98,
          minWidth: Math.max(baseMinWidth * contentAdjustments.sizeMultiplier, 
                            contentAdjustments.minSpacePerItem * contentAdjustments.dataCount + 200),
          maxWidth: baseMaxWidth * Math.min(contentAdjustments.sizeMultiplier, 1.3),
          minHeight: baseMinHeight * contentAdjustments.sizeMultiplier,
          maxHeight: baseMaxHeight * Math.min(contentAdjustments.sizeMultiplier, 1.2)
        }
      }
    }
    
    const limits = getResponsiveLimits()
    const maxContainerWidth = Math.min(
      Math.max(availableViewportWidth * limits.utilization, limits.minWidth),
      limits.maxWidth
    )
    
    const maxContainerHeight = Math.min(
      Math.max(availableViewportHeight * limits.utilization, limits.minHeight),
      limits.maxHeight
    )
    
    const availableHeight = maxContainerHeight - reservedHeight
    
    // Calculate dimensions maintaining aspect ratio within bounds
    let containerWidth = maxContainerWidth
    let containerHeight = maxContainerWidth / aspectRatio
    
    // If height would exceed available space, scale based on height
    if (containerHeight > availableHeight) {
      containerHeight = availableHeight
      containerWidth = availableHeight * aspectRatio
    }
    
    // Ensure minimum sizes for usability with breakpoint-aware minimums
    containerWidth = Math.max(containerWidth, limits.minWidth)
    containerHeight = Math.max(containerHeight, limits.minHeight)
    
    return {
      width: `${containerWidth}px`,
      height: `${containerHeight + reservedHeight}px`,
      chartWidth: containerWidth,
      chartHeight: containerHeight,
      availableWidth: containerWidth - padding,
      availableHeight: containerHeight - padding
    }
  }
  
  // Helper function to get background style
  const getBackgroundStyle = () => {
    const bgType = config.theme?.background || 'black'
    switch (bgType) {
      case 'black': return 'bg-black'
      case 'white': return 'bg-white'
      case 'midnight': return 'bg-[#1A1B3A]'
      case 'none': return 'bg-transparent'
      default: return 'bg-black'
    }
  }
  
  // Helper function to get corner style
  const getCornerStyle = () => {
    const corners = config.theme?.cornerStyle || 'rounded'
    return corners === 'rounded' ? 'rounded-lg' : 'rounded-none'
  }
  
  // Helper function to get border style
  const getBorderStyle = () => {
    const borderType = config.theme?.borderStyle || 'none'
    const borderColor = config.theme?.borderColor || '#6B7280'
    switch (borderType) {
      case 'solid': return `border-2`
      case 'gradient': return `border-2 border-transparent bg-gradient-to-r bg-clip-border`
      case 'none': return ''
      default: return ''
    }
  }
  
  // Get border color for solid borders and gradient background for gradient borders
  const getBorderStyles = () => {
    const borderType = config.theme?.borderStyle || 'none'
    const borderColor = config.theme?.borderColor || '#6B7280'
    
    if (borderType === 'solid') {
      return { borderColor }
    } else if (borderType === 'gradient') {
      // Create gradient background using the selected border color
      // Generate a lighter variant for the gradient effect
      const lighterColor = borderColor + '80' // Add transparency
      return { 
        backgroundImage: `linear-gradient(135deg, ${borderColor}, ${lighterColor})`
      }
    }
    return {}
  }
  
  // Get gradient border padding (matches border-2 thickness)
  const getGradientPadding = () => {
    return { padding: '2px' } // Match border-2 thickness
  }
  
  // Get dynamic padding based on border presence and modal context
  const getChartPadding = () => {
    if (config.isModalContext) {
      return 'p-2' // Minimal padding for modal preview
    }
    const hasBorder = config.theme?.borderStyle !== 'none'
    return hasBorder ? 'p-6' : 'p-4'
  }

  // Determine if container should use overflow-hidden (avoid clipping external labels)
  const getOverflowBehavior = () => {
    const showDataLabels = config.theme?.showDataLabels !== false
    const isPieOrDonut = config.type === 'pie' || config.type === 'donut'
    
    // For pie/donut charts with data labels, allow overflow to show external labels
    if (isPieOrDonut && showDataLabels) {
      return 'overflow-visible'
    }
    
    // Default behavior for other chart types
    return 'overflow-hidden'
  }

  // Helper function to render chart title with alignment
  const renderChartTitle = () => {
    const alignment = config.theme?.titleAlignment || 'center'
    const alignmentClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center'
    const showTotal = config.theme?.showChartTotal && config.data.length > 0
    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    
    return (
      <div className={`${config.isModalContext ? 'mb-4' : 'mb-8'} ${alignmentClass}`}>
        <h1 className={`${config.isModalContext ? 'text-lg' : 'text-xl'} font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
          {config.title}
          {showTotal && (
            <span className={`ml-3 text-lg font-normal ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              ({formatNumber(total)})
            </span>
          )}
        </h1>
        {config.subtitle && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {config.subtitle}
          </p>
        )}
      </div>
    )
  }

  const formatNumber = (value: number): string => {
    const abbreviation = config.theme?.abbreviation || 'auto'
    
    switch (abbreviation) {
      case 'none':
        return value.toString()
      case 'k':
        return (value / 1000).toString() + 'k'
      case 'm':
        return (value / 1000000).toString() + 'M'
      case 'auto':
      default:
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + "M"
        } else if (value >= 1000) {
          return (value / 1000).toFixed(0) + "k"
        } else {
          return value.toString()
        }
    }
  }

  // Helper function to get display value (user's formatted input or formatted number)
  const getDisplayValue = (item: ChartData): string => {
    return item.displayValue || formatNumber(item.value)
  }

  // Sort data function
  const sortData = (data: ChartData[]) => {
    const sortOrder = config.theme?.sortOrder || (config.theme?.sortHighToLow ? 'value-desc' : 'none')
    
    switch (sortOrder) {
      case 'value-desc':
        return [...data].sort((a, b) => b.value - a.value)
      case 'value-asc':
        return [...data].sort((a, b) => a.value - b.value)
      case 'alpha-asc':
        return [...data].sort((a, b) => a.scenario.localeCompare(b.scenario))
      case 'alpha-desc':
        return [...data].sort((a, b) => b.scenario.localeCompare(a.scenario))
      case 'none':
      default:
        return data
    }
  }

  // Enhanced color distribution for multi-series charts with maximum visual separation
  const getEnhancedSeriesColor = (seriesIndex: number, colors: string[], totalSeries: number) => {
    const paletteSize = colors.length
    
    // Use maximum spacing algorithm for better visual distinction
    if (totalSeries <= paletteSize) {
      // Use evenly spaced colors from the palette for maximum visual separation
      const spacing = Math.max(1, Math.floor(paletteSize / totalSeries))
      return colors[(seriesIndex * spacing) % paletteSize]
    }
    
    // For more series than colors, use alternating pattern with offset
    const baseIndex = seriesIndex % paletteSize
    const cycle = Math.floor(seriesIndex / paletteSize)
    
    // Use prime number offset to avoid clustering similar colors
    const offset = (cycle * 3) % paletteSize // Using 3 as it's prime and gives good distribution
    return colors[(baseIndex + offset) % paletteSize]
  }

  // Unified color assignment function for all chart types - ensures legends match chart elements
  const getUnifiedSeriesColor = (seriesItem: any, allSeries: any[], colors: string[]) => {
    // If series has custom color, use it
    if (seriesItem.color) return seriesItem.color
    
    // Find the original index of this series in the full series array
    const originalIndex = allSeries.findIndex(s => s === seriesItem)
    
    // Use enhanced color distribution based on original position
    return getEnhancedSeriesColor(originalIndex, colors, allSeries.length)
  }

  // Get comprehensive data summary for series legends
  const getSeriesDataSummary = (seriesItem: any) => {
    if (!seriesItem.data || seriesItem.data.length === 0) return null
    
    const validData = seriesItem.data.filter((d: any) => d && typeof d.value === 'number')
    if (validData.length === 0) return null
    
    const total = validData.reduce((sum: number, d: any) => sum + d.value, 0)
    const categoryCount = validData.length
    const avgValue = total / categoryCount
    
    return {
      categoryCount,
      total,
      avgValue,
      formattedTotal: formatNumber(total),
      formattedAvg: formatNumber(avgValue),
      categories: validData.map((d: any) => d.scenario || d.label || 'Unnamed').slice(0, 3).join(', ')
    }
  }

  // Get visual prominence settings for series hierarchy
  const getSeriesVisualHierarchy = (seriesIndex: number) => ({
    opacity: seriesIndex === 0 ? 1.0 : 0.85, // Primary series slightly more prominent
    strokeWidth: seriesIndex === 0 ? 3 : 2.5, // Primary series thicker lines
    zIndex: 10 - seriesIndex // Primary series rendered on top
  })

  // Style options
  const showDataLabels = config.theme?.showDataLabels !== false
  const showPercentages = config.theme?.showPercentages || false
  const showGridLines = config.theme?.showGridLines !== false

  // Data label styling system
  const getDataLabelStyle = (value: number, color: string, position: 'inside' | 'outside' = 'inside', chartType?: string) => {
    const isLightColor = isColorLight(color)
    
    // For both inside and outside labels, use contrast based on bar color
    // This ensures consistent automatic dark/light text behavior
    const textColor = isLightColor ? '#1f2937' : '#ffffff'
    
    // Use appropriate text size for pie and donut charts
    const textSize = (chartType === 'pie' || chartType === 'donut') ? 'text-sm' : 'text-xs'
    const fontWeight = (chartType === 'pie' || chartType === 'donut') ? 'font-medium' : 'font-medium'
    
    return {
      className: `${textSize} ${fontWeight}`,
      style: { 
        color: textColor
      }
    }
  }

  // Helper to determine if color is light
  const isColorLight = (color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)  
    const b = parseInt(hex.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128
  }

  // Reference lines rendering helper
  const renderReferenceLines = (chartType: 'horizontal' | 'vertical', dataValues: number[], chartBounds: { width: number, height: number, padding: number }) => {
    const referenceLines = config.theme?.referenceLines
    if (!referenceLines) return null

    const { width, height, padding } = chartBounds
    const maxValue = Math.max(...dataValues)
    const minValue = Math.min(...dataValues)
    const average = dataValues.reduce((sum, val) => sum + val, 0) / dataValues.length

    const lines: React.ReactNode[] = []

    // Average line
    if (referenceLines.average?.enabled) {
      const color = referenceLines.average.color || '#6366F1'
      if (chartType === 'horizontal') {
        // Horizontal bar charts: vertical line for average
        const xPos = padding + ((average / maxValue) * (width - 2 * padding))
        lines.push(
          <g key="average-line">
            <line
              x1={xPos}
              y1={padding}
              x2={xPos}
              y2={height - padding}
              stroke={color}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
            <text
              x={xPos}
              y={padding - 5}
              textAnchor="middle"
              className="text-xs font-medium"
              fill={color}
            >
              Avg: {formatNumber(average)}
            </text>
          </g>
        )
      } else {
        // Vertical bar charts: horizontal line for average
        const yPos = height - padding - ((average / maxValue) * (height - 2 * padding))
        lines.push(
          <g key="average-line">
            <line
              x1={padding}
              y1={yPos}
              x2={width - padding}
              y2={yPos}
              stroke={color}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
            <text
              x={padding + 5}
              y={yPos - 5}
              className="text-xs font-medium"
              fill={color}
            >
              Avg: {formatNumber(average)}
            </text>
          </g>
        )
      }
    }

    // Custom horizontal lines (target values)
    if (referenceLines.horizontal) {
      referenceLines.horizontal.forEach((line, index) => {
        if (line.value >= minValue && line.value <= maxValue) {
          if (chartType === 'horizontal') {
            // Horizontal bar charts: vertical line for target
            const xPos = padding + ((line.value / maxValue) * (width - 2 * padding))
            lines.push(
              <g key={`horizontal-${index}`}>
                <line
                  x1={xPos}
                  y1={padding}
                  x2={xPos}
                  y2={height - padding}
                  stroke={line.color}
                  strokeWidth="2"
                  strokeDasharray={line.style === 'dashed' ? '5,5' : 'none'}
                  opacity="0.8"
                />
                <text
                  x={xPos}
                  y={padding - 5}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  fill={line.color}
                >
                  {line.label || formatNumber(line.value)}
                </text>
              </g>
            )
          } else {
            // Vertical bar charts: horizontal line for target
            const yPos = height - padding - ((line.value / maxValue) * (height - 2 * padding))
            lines.push(
              <g key={`horizontal-${index}`}>
                <line
                  x1={padding}
                  y1={yPos}
                  x2={width - padding}
                  y2={yPos}
                  stroke={line.color}
                  strokeWidth="2"
                  strokeDasharray={line.style === 'dashed' ? '5,5' : 'none'}
                  opacity="0.8"
                />
                <text
                  x={padding + 5}
                  y={yPos - 5}
                  className="text-xs font-medium"
                  fill={line.color}
                >
                  {line.label || formatNumber(line.value)}
                </text>
              </g>
            )
          }
        }
      })
    }

    return lines.length > 0 ? <g className="reference-lines">{lines}</g> : null
  }

  const renderMultiSeriesHorizontalBars = () => {
    const allSeries = config.series || []
    const series = allSeries.filter(s => s.visible !== false) // Only show visible series
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    if (series.length === 0) return null
    
    // Find max data points across all series for position-based iteration
    const maxDataPoints = Math.max(...series.map(s => s.data?.length || 0))
    
    // Find max value across all series for consistent scaling
    const maxValue = Math.max(...series.flatMap(s => s.data?.map(d => d.value) || []))
    
    const barHeight = 28 // Height of each individual bar
    
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-full space-y-6 relative">
          {/* Interleave data points by position */}
          {Array.from({ length: maxDataPoints }, (_, position) => {
            // Get all data points at this position from all datasets
            const dataPointsAtPosition = series.map((seriesItem, seriesIndex) => ({
              seriesItem,
              seriesIndex,
              dataPoint: seriesItem.data?.[position] || null
            })).filter(item => item.dataPoint !== null) // Only show datasets that have data at this position
            
            if (dataPointsAtPosition.length === 0) return null // Skip if no datasets have data at this position
            
            return (
              <div key={position} className="space-y-2">
                {dataPointsAtPosition.map(({ seriesItem, seriesIndex, dataPoint }) => {
                  const percentage = (dataPoint.value / maxValue) * 100
                  const color = getUnifiedSeriesColor(seriesItem, series, colors)
                  
                  return (
                    <div key={`${position}-${seriesIndex}`} className="flex items-center gap-3">
                      {/* Data point label */}
                      <div className="w-32 text-right flex-shrink-0">
                        <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>
                          {dataPoint.scenario}
                        </span>
                      </div>
                      
                      {/* Bar */}
                      <div 
                        className="relative h-6 bg-muted/30 rounded-sm overflow-hidden"
                        style={{ width: `${Math.max(percentage, 5)}%` }} // Proportional width, minimum 5%
                      >
                        <div
                          className="h-full w-full rounded-sm transition-all duration-700 ease-out flex items-center justify-center px-2 hover:opacity-80 cursor-pointer"
                          style={{
                            background: `linear-gradient(90deg, ${color}f2, ${color}e6, ${color})`,
                            boxShadow: `0 2px 4px ${color}20`,
                            animation: `growHorizontal 800ms ease-out ${(position * series.length + seriesIndex) * 100}ms both`,
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const tooltipWidth = 200
                            const screenWidth = window.innerWidth
                            const wouldOverflow = rect.right + tooltipWidth > screenWidth - 20
                            const xPosition = wouldOverflow ? rect.left - 10 : rect.right + 10
                            
                            setTooltip({
                              x: xPosition,
                              y: rect.top + rect.height / 2,
                              label: `${seriesItem.name}: ${dataPoint.scenario}`,
                              value: dataPoint.value,
                              displayValue: dataPoint.displayValue || formatNumber(dataPoint.value),
                              color: color
                            })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {/* Only show value, no series name */}
                          {showDataLabels && percentage > 15 && (
                            <span className={`text-xs font-medium ${isDark ? 'text-white/90' : 'text-white'} text-center w-full`}>
                              {showPercentages ? `${(dataPoint.value / dataPointsAtPosition.reduce((sum, item) => sum + item.dataPoint.value, 0) * 100).toFixed(1)}%` : formatNumber(dataPoint.value)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
          
          {/* Enhanced Series Legend with data summaries */}
          <div className={`flex justify-center ${layoutState.isMobile ? 'gap-2' : layoutState.isTablet ? 'gap-3' : 'gap-4'} py-2 px-2 min-h-0 flex-wrap`}>
            {series.map((seriesItem, index) => {
              const color = getUnifiedSeriesColor(seriesItem, series, colors)
              const isVisible = seriesItem.visible !== false
              const dataSummary = getSeriesDataSummary(seriesItem)
              const hasMultipleSeries = series.length > 1
              
              return (
                <div key={`legend-${index}`} className={`flex ${layoutState.isMobile ? 'flex-col gap-0.5' : 'items-center gap-2'} ${!isVisible ? 'opacity-50' : ''} ${hasMultipleSeries && dataSummary ? 'bg-background/50 rounded-md px-2 py-1' : ''}`}>
                  <div className={`flex items-center ${layoutState.isMobile ? 'gap-1' : 'gap-2'}`}>
                    <div 
                      className={`${layoutState.isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded flex-shrink-0`}
                      style={{ backgroundColor: color }} 
                    />
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} ${!isVisible ? 'line-through' : ''}`}>
                      {seriesItem.name}
                    </span>
                  </div>
                  
                  {hasMultipleSeries && dataSummary && (
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} ${layoutState.isMobile ? 'ml-3.5' : ''}`}>
                      <span className="font-medium">Total: {dataSummary.formattedTotal}</span>
                      {dataSummary.categoryCount > 1 && (
                        <span className="ml-2">({dataSummary.categoryCount} categories)</span>
                      )}
                      {!layoutState.isMobile && dataSummary.categoryCount > 1 && (
                        <span className="ml-2">Avg: {dataSummary.formattedAvg}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Reference Lines Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {renderReferenceLines('horizontal', series.flatMap(s => s.data?.map(d => d.value) || []), { 
            width: containerSize.width || 800, 
            height: containerSize.height || 600, 
            padding: 160 // Account for labels on left
          })}
        </svg>
      </div>
    )
  }

  const renderHorizontalBarChart = () => {
    const isMultiSeries = config.series && config.series.length > 0
    if (!isMultiSeries && config.data.length === 0) return null
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    if (isMultiSeries) {
      return renderMultiSeriesHorizontalBars()
    }

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const totalValue = sortedData.reduce((sum, d) => sum + d.value, 0)

    return (
      <div className="flex items-center justify-center h-full relative">
        <div className={`w-full max-w-full ${sortedData.length > 8 ? 'space-y-3' : sortedData.length > 6 ? 'space-y-3.5' : 'space-y-4'}`}>
          {sortedData.map((item, index) => {
            const percentage = (item.value / maxValue) * 100
            const color = colors[index % colors.length]

            return (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-32 text-right">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}>{item.scenario}</span>
                </div>
                <div className="flex-1 relative">
                <div className={`h-8 ${isDark ? 'bg-gray-800/30' : 'bg-gray-200/40'} rounded-sm overflow-hidden`}>
                  <div
                    className="h-full rounded-sm transition-all duration-200 ease-out flex items-center justify-end pr-3 relative cursor-pointer hover:opacity-80"
                    style={{
                      '--target-width': `${percentage}%`,
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${color}f2, ${color}e6, ${color})`,
                      boxShadow: `0 2px 4px ${color}20`,
                      animation: `growHorizontal 800ms ease-out ${index * 150}ms both`
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const tooltipWidth = 200 // Approximate tooltip width
                      const screenWidth = window.innerWidth
                      
                      // Smart positioning: if tooltip would go off screen, position it to the left of the bar
                      const wouldOverflow = rect.right + tooltipWidth > screenWidth - 20
                      const xPosition = wouldOverflow ? rect.left - 10 : rect.right + 10
                      
                      setTooltip({
                        x: xPosition,
                        y: rect.top + rect.height / 2,
                        label: item.scenario,
                        value: item.value,
                        displayValue: getDisplayValue(item),
                        percentage: (item.value / totalValue) * 100,
                        color: color
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {showDataLabels && (() => {
                      const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : getDisplayValue(item)
                      // For horizontal bars, always use white text on colored backgrounds
                      // Only use background-based contrast if bar is too small to contain text
                      const isInside = percentage > 15  // Lowered threshold
                      const labelStyle = isInside ? 
                        { className: 'text-xs font-medium', style: { color: '#ffffff' } } :
                        { className: 'text-xs font-medium', style: { color: isDark ? '#f3f4f6' : '#1f2937' } }
                      
                      return (
                        <div 
                          className={labelStyle.className}
                          style={labelStyle.style}
                        >
                          {labelValue}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        </div>
        
        {/* Reference Lines Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {renderReferenceLines('horizontal', sortedData.map(d => d.value), { 
            width: containerSize.width || 800, 
            height: containerSize.height || 600, 
            padding: 160 // Account for labels on left
          })}
        </svg>
      </div>
    )
  }

  const renderMultiSeriesVerticalBars = () => {
    const allSeries = config.series || []
    const series = allSeries.filter(s => s.visible !== false) // Only show visible series
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    if (series.length === 0) return null
    
    // Find max data points across all series for position-based iteration
    const maxDataPoints = Math.max(...series.map(s => s.data?.length || 0))
    
    // Find max value across all series for consistent scaling
    const maxValue = Math.max(...series.flatMap(s => s.data?.map(d => d.value) || []))
    
    // Use deterministic dimensions
    const { availableHeight } = getContainerDimensions()
    const maxBarHeight = availableHeight * 0.65
    const barWidth = 32 // Better width for visibility
    
    return (
      <div className="h-full flex flex-col justify-center relative">
        <div className="flex items-end justify-center gap-10 flex-wrap">
          {/* Interleave data points by position */}
          {Array.from({ length: maxDataPoints }, (_, position) => {
            // Get all data points at this position from all datasets
            const dataPointsAtPosition = series.map((seriesItem, seriesIndex) => ({
              seriesItem,
              seriesIndex,
              dataPoint: seriesItem.data?.[position] || null
            })).filter(item => item.dataPoint !== null) // Only show datasets that have data at this position
            
            if (dataPointsAtPosition.length === 0) return null // Skip if no datasets have data at this position
            
            return (
              <div key={position} className="flex flex-col items-center gap-4">
                {/* Side-by-side bars for datasets at this position */}
                <div className="flex items-end gap-1">
                  {dataPointsAtPosition.map(({ seriesItem, seriesIndex, dataPoint }) => {
                    const percentage = (dataPoint.value / maxValue) * 100
                    const barHeight = Math.max((percentage / 100) * maxBarHeight, 20)
                    const color = getUnifiedSeriesColor(seriesItem, series, colors)
                    
                    return (
                      <div
                        key={`${position}-${seriesIndex}`}
                        className="rounded-t cursor-pointer transition-all duration-200 flex items-end justify-center pb-2 hover:opacity-80 relative"
                        style={{
                          width: `${barWidth}px`,
                          height: `${barHeight}px`,
                          background: `linear-gradient(180deg, ${color}f5, ${color}e8, ${color})`,
                          boxShadow: `0 2px 8px ${color}25`,
                          transformOrigin: 'bottom',
                          animation: `growVertical 800ms ease-out ${(position * series.length + seriesIndex) * 100}ms both`
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: `${seriesItem.name}: ${dataPoint.scenario}`,
                            value: dataPoint.value,
                            displayValue: dataPoint.displayValue || formatNumber(dataPoint.value),
                            color: color
                          })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {showDataLabels && barHeight > 35 && (
                          <div 
                            className="text-xs font-medium text-center w-full px-1"
                            style={{ color: '#ffffff' }}
                          >
                            {showPercentages ? `${(dataPoint.value / dataPointsAtPosition.reduce((sum, item) => sum + item.dataPoint.value, 0) * 100).toFixed(1)}%` : (dataPoint.displayValue || formatNumber(dataPoint.value))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Labels for all data points at this position */}
                <div className="flex gap-2 text-center">
                  {dataPointsAtPosition.map(({ dataPoint }, idx) => (
                    <span key={idx} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-16 truncate`}>
                      {dataPoint.scenario}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Enhanced Series Legend with data summaries */}
        <div className={`flex justify-center ${layoutState.isMobile ? 'gap-2' : layoutState.isTablet ? 'gap-3' : 'gap-4'} py-2 px-2 mt-4 min-h-0 flex-wrap`}>
          {series.map((seriesItem, index) => {
            const color = getUnifiedSeriesColor(seriesItem, series, colors)
            const isVisible = seriesItem.visible !== false
            const dataSummary = getSeriesDataSummary(seriesItem)
            const hasMultipleSeries = series.length > 1
            
            return (
              <div key={`legend-${index}`} className={`flex ${layoutState.isMobile ? 'flex-col gap-0.5' : 'items-center gap-2'} ${!isVisible ? 'opacity-50' : ''} ${hasMultipleSeries && dataSummary ? 'bg-background/50 rounded-md px-2 py-1' : ''}`}>
                <div className={`flex items-center ${layoutState.isMobile ? 'gap-1' : 'gap-2'}`}>
                  <div 
                    className={`${layoutState.isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded flex-shrink-0`}
                    style={{ backgroundColor: color }} 
                  />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} ${!isVisible ? 'line-through' : ''}`}>
                    {seriesItem.name}
                  </span>
                </div>
                
                {hasMultipleSeries && dataSummary && (
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} ${layoutState.isMobile ? 'ml-3.5' : ''}`}>
                    <span className="font-medium">Total: {dataSummary.formattedTotal}</span>
                    {dataSummary.categoryCount > 1 && (
                      <span className="ml-2">({dataSummary.categoryCount} categories)</span>
                    )}
                    {!layoutState.isMobile && dataSummary.categoryCount > 1 && (
                      <span className="ml-2">Avg: {dataSummary.formattedAvg}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Reference Lines Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {renderReferenceLines('vertical', series.flatMap(s => s.data?.map(d => d.value) || []), { 
            width: containerSize.width || 800, 
            height: containerSize.height || 600, 
            padding: 60 // Account for bottom labels
          })}
        </svg>
      </div>
    )
  }

  const renderMultiSeriesLineChart = () => {
    const allSeries = config.series || []
    const series = allSeries.filter(s => s.visible !== false) // Only show visible series
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    // Use position-based approach: find the maximum number of data points across all series
    const maxDataPoints = Math.max(...series.map(s => s.data.length))
    
    // Create unified category labels based on the series with most complete data
    const longestSeries = series.reduce((longest, current) => 
      current.data.length > longest.data.length ? current : longest
    )
    const categoryLabels = longestSeries.data.map(d => d.scenario)
    
    // Find max value across all series
    const maxValue = Math.max(...series.flatMap(s => s.data.map(d => d.value)))
    
    // Use deterministic dimensions
    const { availableWidth, availableHeight } = getContainerDimensions()
    const chartWidth = availableWidth
    const chartHeight = availableHeight
    const padding = 40

    // Create smooth curve path helper
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return ""
      
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        
        if (i === 1) {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        } else {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y + (curr.y - prev.y) * 0.3
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y - (curr.y - prev.y) * 0.3
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        }
      }
      
      return path
    }

    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            className="max-w-full max-h-full"
          >
            <defs>
              {series.map((seriesItem, seriesIndex) => {
                const color = getUnifiedSeriesColor(seriesItem, series, colors)
                return (
                  <g key={`defs-${seriesIndex}`}>
                    <linearGradient id={`lineGradient-${seriesIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                      <stop offset="50%" stopColor={color} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id={`lineStroke-${seriesIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} />
                      <stop offset="50%" stopColor={color} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={color} />
                    </linearGradient>
                  </g>
                )
              })}
              <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Grid lines */}
            {showGridLines && (
              <g opacity="0.1">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                  return (
                    <line
                      key={i}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke={isDark ? "#fff" : "#000"}
                      strokeWidth="1"
                    />
                  )
                })}
              </g>
            )}

            {/* Render each series */}
            {series.filter(s => s.visible !== false).map((seriesItem, seriesIndex) => {
              const color = getUnifiedSeriesColor(seriesItem, series, colors)
              const visualHierarchy = getSeriesVisualHierarchy(seriesIndex)
              
              // Create points for this series using position-based mapping
              const points = seriesItem.data.map((dataPoint, dataIndex) => {
                if (!dataPoint) return null
                
                const x = maxDataPoints > 1 
                  ? padding + (dataIndex / (maxDataPoints - 1)) * (chartWidth - 2 * padding)
                  : chartWidth / 2 // Center single point
                const y = chartHeight - padding - ((dataPoint.value / maxValue) * (chartHeight - 2 * padding))
                return { x, y, dataPoint, categoryIndex: dataIndex }
              }).filter(Boolean) as { x: number; y: number; dataPoint: any; categoryIndex: number }[]

              if (points.length === 0) return null

              const linePath = createSmoothPath(points)
              const areaPath = linePath + ` L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`

              return (
                <g key={`series-${seriesIndex}`}>
                  {/* Area under the curve */}
                  <path
                    d={areaPath}
                    fill={`url(#lineGradient-${seriesIndex})`}
                    className="transition-all duration-700"
                    style={{ 
                      opacity: 0.3,
                      animation: `fadeInUp 1s ease-out ${seriesIndex * 200}ms both`
                    }}
                  />

                  {/* Main line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={`url(#lineStroke-${seriesIndex})`}
                    strokeWidth={visualHierarchy.strokeWidth}
                    filter="url(#lineShadow)"
                    className="transition-all duration-700"
                    style={{
                      opacity: visualHierarchy.opacity,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeDasharray: '1000',
                      strokeDashoffset: '1000',
                      animation: `drawLine 2s ease-out ${seriesIndex * 200}ms forwards`
                    }}
                  />

                  {/* Data points */}
                  {points.map(({ x, y, dataPoint, categoryIndex }, pointIndex) => (
                    <g key={`point-${seriesIndex}-${pointIndex}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill={color}
                        className="cursor-pointer transition-all duration-300 hover:r-8 hover:opacity-80"
                        style={{
                          filter: `drop-shadow(0 2px 4px ${color}40)`,
                          animation: `bounceIn 0.6s ease-out ${(seriesIndex * 200 + pointIndex * 100)}ms backwards`
                        }}
                        onMouseEnter={(e) => {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            label: `${seriesItem.name}: ${dataPoint.scenario}`,
                            value: dataPoint.value,
                            displayValue: dataPoint.displayValue || formatNumber(dataPoint.value),
                            color: color
                          })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        fill="white"
                        className="pointer-events-none"
                      />
                      {showDataLabels && (() => {
                        const totalValue = series.reduce((sum, s) => sum + s.data.reduce((sSum, d) => sSum + d.value, 0), 0)
                        const labelValue = showPercentages ? `${((dataPoint.value / totalValue) * 100).toFixed(1)}%` : (dataPoint.displayValue || formatNumber(dataPoint.value))
                        const labelStyle = {
                          className: 'text-xs font-medium',
                          style: { 
                            color: isDark ? '#f3f4f6' : '#1f2937'
                          }
                        }
                        
                        return (
                          <foreignObject x={x - 30} y={y - 35} width="60" height="25">
                            <div 
                              className={`${labelStyle.className} text-center w-full`}
                              style={labelStyle.style}
                            >
                              {labelValue}
                            </div>
                          </foreignObject>
                        )
                      })()}
                    </g>
                  ))}
                </g>
              )
            })}

            {/* Y-axis labels */}
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                const value = maxValue * ratio
                return (
                  <text
                    key={i}
                    x={padding - 10}
                    y={y + 5}
                    textAnchor="end"
                    className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
                  >
                    {formatNumber(value)}
                  </text>
                )
              })}
            </g>

            {/* Reference Lines */}
            {renderReferenceLines('vertical', series.flatMap(s => s.data.map(d => d.value)), { 
              width: chartWidth, 
              height: chartHeight, 
              padding: padding 
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-center py-1 px-2 min-h-0">
          <div className="flex justify-between" style={{ width: `${chartWidth - 2 * padding}px` }}>
            {categoryLabels.map((category, index) => (
              <span
                key={index}
                className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-20 truncate`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className={`flex justify-center ${layoutState.isMobile ? 'gap-2' : layoutState.isTablet ? 'gap-3' : 'gap-4'} py-1 px-2 min-h-0 flex-wrap`}>
          {series.map((seriesItem, index) => {
            const color = getUnifiedSeriesColor(seriesItem, series, colors)
            const isVisible = seriesItem.visible !== false
            return (
              <div key={index} className={`flex items-center ${layoutState.isMobile ? 'gap-1' : 'gap-2'} ${!isVisible ? 'opacity-50' : ''}`}>
                <div 
                  className={`${layoutState.isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded`}
                  style={{ backgroundColor: color }} 
                />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} ${!isVisible ? 'line-through' : ''} truncate max-w-none`}>
                  {seriesItem.name}
                </span>
              </div>
            )
          })}
        </div>

        <style jsx>{`
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 0.3;
              transform: translateY(0);
            }
          }
          @keyframes bounceIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  const renderVerticalBarChart = () => {
    const isMultiSeries = config.series && config.series.length > 0
    if (!isMultiSeries && config.data.length === 0) return null
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    if (isMultiSeries) {
      return renderMultiSeriesVerticalBars()
    }

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const totalValue = sortedData.reduce((sum, d) => sum + d.value, 0)

    // Use deterministic dimensions
    const { availableHeight } = getContainerDimensions()
    const maxBarHeight = availableHeight * 0.6
    const barWidth = 32 // Narrow width to match horizontal bar chart consistency

    return (
      <div className="h-full flex flex-col justify-center relative">
        <div className={`flex items-end justify-center ${sortedData.length > 6 ? 'gap-8' : sortedData.length > 4 ? 'gap-10' : 'gap-12'}`}>
          {sortedData.map((item, index) => {
            const percentage = (item.value / maxValue) * 100
            const barHeight = Math.max((percentage / 100) * maxBarHeight, 15)
            const color = colors[index % colors.length]
            
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="rounded-t cursor-pointer transition-all duration-200 flex items-end justify-center pb-2 hover:opacity-80"
                  style={{
                    width: `${barWidth}px`,
                    height: `${barHeight}px`,
                    background: `linear-gradient(180deg, ${color}f5, ${color}e8, ${color})`,
                    boxShadow: `0 2px 8px ${color}25`,
                    transformOrigin: 'bottom',
                    animation: `growVertical 800ms ease-out ${index * 150}ms both`
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      label: item.scenario,
                      value: item.value,
                      displayValue: getDisplayValue(item),
                      color: color
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {showDataLabels && (() => {
                    const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : getDisplayValue(item)
                    const isInside = barHeight > 40
                    const labelStyle = isInside ? 
                      { className: 'text-xs font-medium', style: { color: '#ffffff' } } :
                      { className: 'text-xs font-medium', style: { color: isDark ? '#f3f4f6' : '#1f2937' } }
                    
                    return (
                      <div 
                        className={labelStyle.className}
                        style={labelStyle.style}
                      >
                        {labelValue}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
        <div className={`flex justify-center ${sortedData.length > 6 ? 'gap-8' : sortedData.length > 4 ? 'gap-10' : 'gap-12'} mt-2`}>
          {sortedData.map((item, index) => (
            <span key={index} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-20 truncate`}>
              {item.scenario}
            </span>
          ))}
        </div>
        
        {/* Reference Lines Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {renderReferenceLines('vertical', sortedData.map(d => d.value), { 
            width: containerSize.width || 800, 
            height: containerSize.height || 600, 
            padding: 60 // Account for bottom labels
          })}
        </svg>
      </div>
    )
  }

  const renderPieChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]
    
    // Use legend position setting, fallback to aspect ratio logic
    const legendPosition = config.theme?.legendPosition || 'right'
    const aspectRatio = dimensions.width / dimensions.height
    const useVerticalLayout = legendPosition === 'bottom' || (legendPosition === 'right' && aspectRatio < 1)
    
    if (useVerticalLayout) {
      // Portrait layout: stack chart and legend vertically
      return (
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <div className="relative w-full max-w-80 aspect-square">
            <svg 
              viewBox="-100 -100 400 400" 
              className="w-full h-full transform rotate-0"
            >
              <defs>
                <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
                </filter>
                {/* Radial gradients for pie segments */}
                {config.data.map((item, index) => {
                  const color = colors[index % colors.length]
                  return (
                    <radialGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor={`${color}f8`} />
                      <stop offset="50%" stopColor={`${color}e6`} />
                      <stop offset="100%" stopColor={`${color}d4`} />
                    </radialGradient>
                  )
                })}
              </defs>
              {config.data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
                const color = colors[index % colors.length]

                const x1 = 100 + 140 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                const y1 = 100 + 140 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                const x2 = 100 + 140 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
                const y2 = 100 + 140 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)

                const largeArcFlag = angle > 180 ? 1 : 0

                return (
                  <g key={index}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={`url(#pieGradient-${index})`}
                      filter="url(#pieShadow)"
                      className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-105"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: 'scale(1)',
                        animation: `pieSegmentReveal 0.6s ease-out ${index * 0.12}s backwards`
                      }}
                      onMouseEnter={(e) => {
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          label: item.scenario,
                          value: item.value,
                          percentage: (item.value / total) * 100,
                          color: color
                        })
                      }}
                      onMouseLeave={() => {
                        setTooltip(null)
                      }}
                    />
                    {showDataLabels && angle > 15 && (() => {
                      const midAngle = startAngle + angle / 2 - 90
                      const midAngleRad = (midAngle * Math.PI) / 180
                      
                      // Position labels outside the pie
                      const labelDistance = 180 // Distance from center for labels
                      const labelX = 100 + labelDistance * Math.cos(midAngleRad)
                      const labelY = 100 + labelDistance * Math.sin(midAngleRad)
                      
                      const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : getDisplayValue(item)
                      // For external pie labels, use background-based contrast
                      const labelStyle = {
                        className: 'text-sm font-medium',
                        style: { 
                          color: isDark ? '#f3f4f6' : '#1f2937'
                        }
                      }
                      
                      return (
                        <foreignObject x={labelX - 40} y={labelY - 12} width="80" height="24">
                          <div 
                            className={`${labelStyle.className} text-center w-full`}
                            style={labelStyle.style}
                          >
                            {labelValue}
                          </div>
                        </foreignObject>
                      )
                    })()}
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
            {config.data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center gap-3 group cursor-pointer">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110" 
                    style={{ 
                      background: `linear-gradient(135deg, ${colors[index % colors.length]}f8, ${colors[index % colors.length]}e6, ${colors[index % colors.length]}d4)`,
                      boxShadow: `0 2px 4px ${colors[index % colors.length]}40`
                    }} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-900'} transition-colors`}>
                        {item.scenario}
                      </span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-mono`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs font-medium`}>
                      {getDisplayValue(item)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Horizontal layout: chart and legend side by side
    const chartFirst = legendPosition !== 'left'
    return (
      <div className={`flex items-center justify-center gap-8 h-full ${chartFirst ? '' : 'flex-row-reverse'}`}>
        <div className="relative w-full h-full max-w-96 max-h-96">
          <svg 
            viewBox="-100 -100 400 400" 
            className="w-full h-full transform rotate-0"
          >
            <defs>
              <filter id="pieShadowLandscape" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
              </filter>
              {/* Radial gradients for pie segments */}
              {config.data.map((item, index) => {
                const color = colors[index % colors.length]
                return (
                  <radialGradient key={`pieLandscapeGradient-${index}`} id={`pieLandscapeGradient-${index}`} cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={`${color}f8`} />
                    <stop offset="50%" stopColor={`${color}e6`} />
                    <stop offset="100%" stopColor={`${color}d4`} />
                  </radialGradient>
                )
              })}
            </defs>
            {config.data.map((item, index) => {
              const angle = (item.value / total) * 360
              const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
              const color = colors[index % colors.length]

              const x1 = 100 + 140 * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const y1 = 100 + 140 * Math.sin(((startAngle - 90) * Math.PI) / 180)
              const x2 = 100 + 140 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
              const y2 = 100 + 140 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <g key={index}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={`url(#pieLandscapeGradient-${index})`}
                    filter="url(#pieShadowLandscape)"
                    className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-105"
                    style={{
                      transformOrigin: '100px 100px',
                      transform: 'scale(1)',
                      animation: `pieSegmentReveal 0.6s ease-out ${index * 0.12}s backwards`
                    }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        label: item.scenario,
                        value: item.value,
                        displayValue: getDisplayValue(item),
                        percentage: (item.value / total) * 100,
                        color: color
                      })
                    }}
                    onMouseLeave={(e) => {
                      setTooltip(null)
                    }}
                  />
                  {showDataLabels && angle > 15 && (() => {
                    const midAngle = startAngle + angle / 2 - 90
                    const midAngleRad = (midAngle * Math.PI) / 180
                    
                    // Position labels outside the pie
                    const labelDistance = 180 // Distance from center for labels
                    const labelX = 100 + labelDistance * Math.cos(midAngleRad)
                    const labelY = 100 + labelDistance * Math.sin(midAngleRad)
                    
                    const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : getDisplayValue(item)
                    // For external pie labels, use background-based contrast
                    const labelStyle = {
                      className: 'text-sm font-medium',
                      style: { 
                        color: isDark ? '#f3f4f6' : '#1f2937'
                      }
                    }
                    
                    return (
                      <foreignObject x={labelX - 40} y={labelY - 12} width="80" height="24">
                        <div 
                          className={`${labelStyle.className} text-center w-full`}
                          style={labelStyle.style}
                        >
                          {labelValue}
                        </div>
                      </foreignObject>
                    )
                  })()}
                </g>
              )
            })}
          </svg>
        </div>
        <div className="space-y-3">
          {config.data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center gap-3 group cursor-pointer">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110" 
                  style={{ 
                    background: `linear-gradient(135deg, ${colors[index % colors.length]}f8, ${colors[index % colors.length]}e6, ${colors[index % colors.length]}d4)`,
                    boxShadow: `0 2px 4px ${colors[index % colors.length]}40`
                  }} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-900'} transition-colors`}>
                      {item.scenario}
                    </span>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-mono`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs font-medium`}>
                    {getDisplayValue(item)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDonutChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]
    
    // Use legend position setting, fallback to aspect ratio logic
    const legendPosition = config.theme?.legendPosition || 'right'
    const aspectRatio = dimensions.width / dimensions.height
    const useVerticalLayout = legendPosition === 'bottom' || (legendPosition === 'right' && aspectRatio < 1)
    
    if (useVerticalLayout) {
      // Portrait layout: stack chart and legend vertically
      return (
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <div className="relative w-full max-w-80 aspect-square">
            <svg 
              viewBox="-100 -100 400 400" 
              className="w-full h-full"
            >
              <defs>
                <filter id="donutShadowPortrait" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.25"/>
                </filter>
                {/* Radial gradients for donut segments */}
                {config.data.map((item, index) => {
                  const color = colors[index % colors.length]
                  return (
                    <radialGradient key={`donutGradient-${index}`} id={`donutGradient-${index}`} cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor={`${color}f8`} />
                      <stop offset="50%" stopColor={`${color}e6`} />
                      <stop offset="100%" stopColor={`${color}d4`} />
                    </radialGradient>
                  )
                })}
              </defs>
              {config.data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
                const color = colors[index % colors.length]

                const centerX = 100
                const centerY = 100
                const outerRadius = 140
                const innerRadius = 100

                // Calculate angles for the donut segments
                const startAngleRad = ((startAngle - 90) * Math.PI) / 180
                const endAngleRad = ((startAngle + angle - 90) * Math.PI) / 180

                // Outer arc points
                const x1 = centerX + outerRadius * Math.cos(startAngleRad)
                const y1 = centerY + outerRadius * Math.sin(startAngleRad)
                const x2 = centerX + outerRadius * Math.cos(endAngleRad)
                const y2 = centerY + outerRadius * Math.sin(endAngleRad)

                // Inner arc points
                const x3 = centerX + innerRadius * Math.cos(endAngleRad)
                const y3 = centerY + innerRadius * Math.sin(endAngleRad)
                const x4 = centerX + innerRadius * Math.cos(startAngleRad)
                const y4 = centerY + innerRadius * Math.sin(startAngleRad)

                const largeArcFlag = angle > 180 ? 1 : 0

                const pathData = [
                  `M ${x1} ${y1}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `L ${x3} ${y3}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                  'Z'
                ].join(' ')

                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={`url(#donutGradient-${index})`}
                      filter="url(#donutShadowPortrait)"
                      className="cursor-pointer transition-all duration-500 hover:opacity-80 hover:scale-105"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: 'scale(1)',
                        animation: `pieSegmentReveal 0.6s ease-out ${index * 0.12}s backwards`
                      }}
                      onMouseEnter={(e) => {
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          label: item.scenario,
                          value: item.value,
                          percentage: (item.value / total) * 100,
                          color: color
                        })
                      }}
                      onMouseLeave={(e) => {
                          setTooltip(null)
                      }}
                    />
                    {showDataLabels && angle > 15 && (() => {
                      const midAngle = startAngle + angle / 2 - 90
                      const midAngleRad = (midAngle * Math.PI) / 180
                      
                      // Position labels outside the donut
                      const labelDistance = 180 // Distance from center for labels
                      const labelX = centerX + labelDistance * Math.cos(midAngleRad)
                      const labelY = centerY + labelDistance * Math.sin(midAngleRad)
                      
                      // Leader line from outer edge to label
                      const lineStartX = centerX + outerRadius * Math.cos(midAngleRad)
                      const lineStartY = centerY + outerRadius * Math.sin(midAngleRad)
                      
                      const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : getDisplayValue(item)
                      // For external donut labels, use background-based contrast
                      const labelStyle = {
                        className: 'text-sm font-medium',
                        style: { 
                          color: isDark ? '#f3f4f6' : '#1f2937'
                        }
                      }
                      
                      return (
                        <foreignObject x={labelX - 40} y={labelY - 12} width="80" height="24">
                          <div 
                            className={`${labelStyle.className} text-center w-full`}
                            style={labelStyle.style}
                          >
                            {labelValue}
                          </div>
                        </foreignObject>
                      )
                    })()}
                  </g>
                )
              })}
            </svg>
            
            {/* Center content */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ animation: 'fadeInUp 500ms ease-out 1000ms both' }}
            >
              <div className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(total)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
            {config.data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center gap-3 group cursor-pointer">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110" 
                    style={{ 
                      background: `linear-gradient(135deg, ${colors[index % colors.length]}f8, ${colors[index % colors.length]}e6, ${colors[index % colors.length]}d4)`,
                      boxShadow: `0 2px 4px ${colors[index % colors.length]}40`
                    }} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-900'} transition-colors`}>
                        {item.scenario}
                      </span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-mono`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs font-medium`}>
                      {getDisplayValue(item)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Horizontal layout: chart and legend side by side
    const chartFirst = legendPosition !== 'left'
    return (
      <div className={`flex items-center justify-center gap-8 h-full ${chartFirst ? '' : 'flex-row-reverse'}`}>
        <div className="relative w-full h-full max-w-96 max-h-96">
          <svg 
            viewBox="-100 -100 400 400" 
            className="w-full h-full"
          >
            <defs>
              <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.25"/>
              </filter>
              {/* Radial gradients for donut segments */}
              {config.data.map((item, index) => {
                const color = colors[index % colors.length]
                return (
                  <radialGradient key={`donutLandscapeGradient-${index}`} id={`donutLandscapeGradient-${index}`} cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={`${color}f8`} />
                    <stop offset="50%" stopColor={`${color}e6`} />
                    <stop offset="100%" stopColor={`${color}d4`} />
                  </radialGradient>
                )
              })}
            </defs>
            {config.data.map((item, index) => {
              const angle = (item.value / total) * 360
              const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
              const color = colors[index % colors.length]

              const centerX = 100
              const centerY = 100
              const outerRadius = 140
              const innerRadius = 100

              // Calculate angles for the donut segments
              const startAngleRad = ((startAngle - 90) * Math.PI) / 180
              const endAngleRad = ((startAngle + angle - 90) * Math.PI) / 180

              // Outer arc points
              const x1 = centerX + outerRadius * Math.cos(startAngleRad)
              const y1 = centerY + outerRadius * Math.sin(startAngleRad)
              const x2 = centerX + outerRadius * Math.cos(endAngleRad)
              const y2 = centerY + outerRadius * Math.sin(endAngleRad)

              // Inner arc points
              const x3 = centerX + innerRadius * Math.cos(endAngleRad)
              const y3 = centerY + innerRadius * Math.sin(endAngleRad)
              const x4 = centerX + innerRadius * Math.cos(startAngleRad)
              const y4 = centerY + innerRadius * Math.sin(startAngleRad)

              const largeArcFlag = angle > 180 ? 1 : 0

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                'Z'
              ].join(' ')

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={`url(#donutLandscapeGradient-${index})`}
                    filter="url(#donutShadow)"
                    className="cursor-pointer transition-all duration-500 hover:opacity-80 hover:scale-105"
                    style={{
                      transformOrigin: '100px 100px',
                      transform: 'scale(1)',
                      animation: `pieSegmentReveal 0.6s ease-out ${index * 0.12}s backwards`
                    }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        label: item.scenario,
                        value: item.value,
                        displayValue: getDisplayValue(item),
                        percentage: (item.value / total) * 100,
                        color: color
                      })
                    }}
                    onMouseLeave={(e) => {
                      setTooltip(null)
                    }}
                  />
                  {showDataLabels && angle > 15 && (() => {
                    const midAngle = startAngle + angle / 2 - 90
                    const midAngleRad = (midAngle * Math.PI) / 180
                    
                    // Position labels outside the donut
                    const labelDistance = 180 // Distance from center for labels
                    const labelX = centerX + labelDistance * Math.cos(midAngleRad)
                    const labelY = centerY + labelDistance * Math.sin(midAngleRad)
                    
                    // Leader line from outer edge to label
                    const lineStartX = centerX + outerRadius * Math.cos(midAngleRad)
                    const lineStartY = centerY + outerRadius * Math.sin(midAngleRad)
                    
                    const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : getDisplayValue(item)
                    // For external donut labels, use background-based contrast
                    const labelStyle = {
                      className: 'text-sm font-medium',
                      style: { 
                        color: isDark ? '#f3f4f6' : '#1f2937'
                      }
                    }
                    
                    return (
                      <foreignObject x={labelX - 40} y={labelY - 12} width="80" height="24">
                        <div 
                          className={`${labelStyle.className} text-center w-full`}
                          style={labelStyle.style}
                        >
                          {labelValue}
                        </div>
                      </foreignObject>
                    )
                  })()}
                </g>
              )
            })}
          </svg>
          
          {/* Center content */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ animation: 'fadeInUp 500ms ease-out 1000ms both' }}
          >
            <div className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatNumber(total)}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {config.data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center gap-3 group cursor-pointer">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110" 
                  style={{ 
                    background: `linear-gradient(135deg, ${colors[index % colors.length]}f8, ${colors[index % colors.length]}e6, ${colors[index % colors.length]}d4)`,
                    boxShadow: `0 2px 4px ${colors[index % colors.length]}40`
                  }} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium ${isDark ? 'group-hover:text-white' : 'group-hover:text-gray-900'} transition-colors`}>
                      {item.scenario}
                    </span>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-mono`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs font-medium`}>
                    {getDisplayValue(item)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderLineChart = () => {
    const isMultiSeries = config.series && config.series.length > 0
    if (!isMultiSeries && config.data.length === 0) return null
    
    if (isMultiSeries) {
      return renderMultiSeriesLineChart()
    }

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    // Use first color from palette for single series, but support cycling if needed
    const primaryColor = colors[0]

    // Use deterministic dimensions
    const { availableWidth, availableHeight } = getContainerDimensions()
    const chartWidth = availableWidth
    const chartHeight = availableHeight
    const padding = 40

    const points = sortedData.map((item, index) => {
      const x = padding + (index / (config.data.length - 1)) * (chartWidth - 2 * padding)
      const y = chartHeight - padding - ((item.value / maxValue) * (chartHeight - 2 * padding))
      return { x, y, item, index }
    })

    // Create smooth curve path
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return ""
      
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const next = points[i + 1]
        
        if (i === 1) {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        } else {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y + (curr.y - prev.y) * 0.3
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y - (curr.y - prev.y) * 0.3
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        }
      }
      
      return path
    }

    const linePath = createSmoothPath(points)
    const areaPath = linePath + ` L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`

    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            className="max-w-full max-h-full"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
                <stop offset="50%" stopColor={primaryColor} stopOpacity="0.15" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="50%" stopColor={primaryColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={primaryColor} />
              </linearGradient>
              <filter id="lineShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Grid lines */}
            {showGridLines && (
              <g opacity="0.1">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                  return (
                    <line
                      key={i}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke={isDark ? "#fff" : "#000"}
                      strokeWidth="1"
                    />
                  )
                })}
              </g>
            )}

            {/* Area under the curve */}
            <path
              d={areaPath}
              fill="url(#lineGradient)"
              className="transition-all duration-700"
              style={{ 
                opacity: 0.6,
                animation: 'fadeInUp 1s ease-out'
              }}
            />

            {/* Main line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineStroke)"
              strokeWidth="3"
              filter="url(#lineShadow)"
              className="transition-all duration-700"
              style={{
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeDasharray: '1000',
                strokeDashoffset: '1000',
                animation: 'drawLine 2s ease-out forwards'
              }}
            />

            {/* Data points */}
            {points.map(({ x, y, item, index }) => (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={primaryColor}
                  className="cursor-pointer transition-all duration-300 hover:r-8 hover:opacity-80"
                  style={{
                    filter: `drop-shadow(0 2px 4px ${primaryColor}40)`,
                    animation: `bounceIn 0.6s ease-out ${index * 0.1}s backwards`
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: item.scenario,
                      value: item.value,
                      displayValue: getDisplayValue(item),
                      color: primaryColor
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="white"
                  className="pointer-events-none"
                />
                {showDataLabels && (() => {
                  const totalValue = config.data.reduce((sum, d) => sum + d.value, 0)
                  const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : getDisplayValue(item)
                  // For line chart labels, use background-based contrast like pie chart
                  const labelStyle = {
                    className: 'text-xs font-medium',
                    style: { 
                      color: isDark ? '#f3f4f6' : '#1f2937'
                    }
                  }
                  
                  return (
                    <foreignObject x={x - 30} y={y - 35} width="60" height="25">
                      <div 
                        className={`${labelStyle.className} text-center w-full`}
                        style={labelStyle.style}
                      >
                        {labelValue}
                      </div>
                    </foreignObject>
                  )
                })()}
              </g>
            ))}

            {/* Y-axis labels */}
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                const value = maxValue * ratio
                return (
                  <text
                    key={i}
                    x={padding - 10}
                    y={y + 5}
                    textAnchor="end"
                    className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
                  >
                    {formatNumber(value)}
                  </text>
                )
              })}
            </g>

            {/* Reference Lines */}
            {renderReferenceLines('vertical', sortedData.map(d => d.value), { 
              width: chartWidth, 
              height: chartHeight, 
              padding: padding 
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-center py-1 px-2 min-h-0">
          <div className="flex justify-between" style={{ width: `${chartWidth - 2 * padding}px` }}>
            {config.data.map((item, index) => (
              <span
                key={index}
                className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-20 truncate`}
              >
                {item.scenario}
              </span>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 0.6;
              transform: translateY(0);
            }
          }
          @keyframes bounceIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  const renderMultiSeriesComboChart = () => {
    const allSeries = config.series || []
    const series = allSeries.filter(s => s.visible !== false) // Only show visible series
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    // Use position-based approach: find the maximum number of data points across all series
    const maxDataPoints = Math.max(...series.map(s => s.data.length))
    
    // Create unified category labels based on the series with most complete data
    const longestSeries = series.reduce((longest, current) => 
      current.data.length > longest.data.length ? current : longest
    )
    const categoryLabels = longestSeries.data.map(d => d.scenario)
    
    // Find max value across all series
    const maxValue = Math.max(...series.flatMap(s => s.data.map(d => d.value)))
    
    // Use deterministic dimensions
    const { availableWidth, availableHeight } = getContainerDimensions()
    const chartWidth = availableWidth
    const chartHeight = availableHeight
    const padding = 40
    const barWidth = 20 // Narrow width for grouped bars in combo chart

    // Use unified color function for combo chart consistency
    const getSeriesColor = (seriesItem: any, allSeries: any[]) => {
      return getUnifiedSeriesColor(seriesItem, allSeries, colors)
    }
    
    // Simple combo chart: First series as bars, remaining series as lines
    const barSeries = series.slice(0, 1) // Only first series as bars
    const lineSeries = series.slice(1) // All remaining series as lines

    // Create smooth curve path helper
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return ""
      
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y
        const cp2x = curr.x - (curr.x - prev.x) * 0.3
        const cp2y = curr.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }
      
      return path
    }

    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            className="max-w-full max-h-full"
          >
            <defs>
              {/* Bar gradients */}
              {barSeries.map((seriesItem, seriesIndex) => {
                const color = getSeriesColor(seriesItem, allSeries)
                return (
                  <linearGradient key={`barGradient-${seriesIndex}`} id={`barGradient-${seriesIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={`${color}f5`} />
                    <stop offset="50%" stopColor={`${color}e8`} />
                    <stop offset="100%" stopColor={color} />
                  </linearGradient>
                )
              })}
              
              {/* Line gradients */}
              {lineSeries.map((seriesItem, seriesIndex) => {
                const color = getSeriesColor(seriesItem, allSeries)
                return (
                  <g key={`lineDefs-${seriesIndex}`}>
                    <linearGradient id={`lineGradient-${seriesIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                      <stop offset="50%" stopColor={color} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id={`lineStroke-${seriesIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} />
                      <stop offset="50%" stopColor={color} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={color} />
                    </linearGradient>
                  </g>
                )
              })}
              
              <filter id="comboShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Grid lines */}
            {showGridLines && (
              <g opacity="0.1">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                  return (
                    <line
                      key={i}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke={isDark ? "#fff" : "#000"}
                      strokeWidth="1"
                    />
                  )
                })}
              </g>
            )}

            {/* Render bars using position-based mapping */}
            {barSeries.map((seriesItem, seriesIndex) => (
              <g key={`bar-series-${seriesIndex}`}>
                {seriesItem.data.map((dataPoint, dataIndex) => {
                  if (!dataPoint) return null
                  
                  const color = getSeriesColor(seriesItem, allSeries)
                  const totalBars = barSeries.length
                  const categoryWidth = (chartWidth - 2 * padding) / maxDataPoints
                  const groupWidth = totalBars * barWidth + (totalBars - 1) * 2 // 2px gap between bars
                  const groupStartX = padding + dataIndex * categoryWidth + (categoryWidth - groupWidth) / 2
                  const barX = groupStartX + seriesIndex * (barWidth + 2)
                  
                  const barHeight = (dataPoint.value / maxValue) * (chartHeight - 2 * padding)
                  const barY = chartHeight - padding - barHeight

                  return (
                    <rect
                      key={`bar-${dataIndex}-${seriesIndex}`}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={`url(#barGradient-${seriesIndex})`}
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                      style={{
                        filter: `drop-shadow(0 2px 4px ${color}30)`,
                        animation: `slideUp 800ms ease-out ${(dataIndex * totalBars + seriesIndex) * 100}ms both`
                      }}
                      onMouseEnter={(e) => {
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          label: `${seriesItem.name}: ${dataPoint.scenario}`,
                          value: dataPoint.value,
                          displayValue: dataPoint.displayValue || formatNumber(dataPoint.value),
                          color: color
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </g>
            ))}

            {/* Render lines */}
            {lineSeries.map((seriesItem, seriesIndex) => {
              const color = getSeriesColor(seriesItem, allSeries)
              
              // Create points for this line series using position-based mapping
              const points = seriesItem.data.map((dataPoint, dataIndex) => {
                if (!dataPoint) return null
                
                const categoryWidth = (chartWidth - 2 * padding) / maxDataPoints
                const x = maxDataPoints > 1 
                  ? padding + dataIndex * categoryWidth + categoryWidth / 2 // Center of category
                  : chartWidth / 2 // Center single point
                const y = chartHeight - padding - ((dataPoint.value / maxValue) * (chartHeight - 2 * padding))
                return { x, y, dataPoint, categoryIndex: dataIndex }
              }).filter(Boolean) as { x: number; y: number; dataPoint: any; categoryIndex: number }[]

              if (points.length === 0) return null

              const linePath = createSmoothPath(points)

              return (
                <g key={`line-series-${seriesIndex}`}>
                  {/* Main line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={`url(#lineStroke-${seriesIndex})`}
                    strokeWidth="3"
                    filter="url(#comboShadow)"
                    className="transition-all duration-700"
                    style={{
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeDasharray: '1000',
                      strokeDashoffset: '1000',
                      animation: `drawLine 2s ease-out ${(barSeries.length * maxDataPoints * 100 + seriesIndex * 200)}ms forwards`
                    }}
                  />

                  {/* Data points */}
                  {points.map(({ x, y, dataPoint, categoryIndex }, pointIndex) => (
                    <g key={`line-point-${seriesIndex}-${pointIndex}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={color}
                        className="cursor-pointer transition-all duration-300 hover:r-7 hover:opacity-80"
                        style={{
                          filter: `drop-shadow(0 2px 4px ${color}40)`,
                          animation: `bounceIn 0.6s ease-out ${(barSeries.length * maxDataPoints * 100 + seriesIndex * 200 + pointIndex * 100)}ms backwards`
                        }}
                        onMouseEnter={(e) => {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            label: `${seriesItem.name}: ${dataPoint.scenario}`,
                            value: dataPoint.value,
                            displayValue: dataPoint.displayValue || formatNumber(dataPoint.value),
                            color: color
                          })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="white"
                        className="pointer-events-none"
                      />
                    </g>
                  ))}
                </g>
              )
            })}

            {/* Y-axis labels */}
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                const value = maxValue * ratio
                return (
                  <text
                    key={i}
                    x={padding - 10}
                    y={y + 5}
                    textAnchor="end"
                    className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
                  >
                    {formatNumber(value)}
                  </text>
                )
              })}
            </g>

            {/* Reference Lines */}
            {renderReferenceLines('vertical', series.flatMap(s => s.data.map(d => d.value)), { 
              width: chartWidth, 
              height: chartHeight, 
              padding: padding 
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-center py-1 px-2 min-h-0">
          <div className="flex justify-between" style={{ width: `${chartWidth - 2 * padding}px` }}>
            {categoryLabels.map((category, index) => (
              <span
                key={index}
                className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-20 truncate`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Enhanced Legend - Shows all series with comprehensive data information */}
        <div className={`flex justify-center ${layoutState.isMobile ? 'gap-2' : layoutState.isTablet ? 'gap-3' : 'gap-4'} py-2 px-2 min-h-0 flex-wrap`}>
          {allSeries.map((seriesItem, index) => {
            const color = getSeriesColor(seriesItem, allSeries)
            const isVisible = seriesItem.visible !== false
            const dataSummary = getSeriesDataSummary(seriesItem)
            const hasMultipleSeries = allSeries.length > 1
            
            return (
              <div key={`legend-${index}`} className={`flex ${layoutState.isMobile ? 'flex-col gap-0.5' : 'items-center gap-2'} ${!isVisible ? 'opacity-50' : ''} ${hasMultipleSeries && dataSummary ? 'bg-background/50 rounded-md px-2 py-1' : ''}`}>
                <div className={`flex items-center ${layoutState.isMobile ? 'gap-1' : 'gap-2'}`}>
                  <div 
                    className={`${layoutState.isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded flex-shrink-0`}
                    style={{ backgroundColor: color }} 
                  />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} ${!isVisible ? 'line-through' : ''}`}>
                    {seriesItem.name}
                  </span>
                </div>
                
                {hasMultipleSeries && dataSummary && (
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} ${layoutState.isMobile ? 'ml-3.5' : ''}`}>
                    <span className="font-medium">Total: {dataSummary.formattedTotal}</span>
                    {dataSummary.categoryCount > 1 && (
                      <span className="ml-2">({dataSummary.categoryCount} categories)</span>
                    )}
                    {!layoutState.isMobile && dataSummary.categoryCount > 1 && (
                      <span className="ml-2">Avg: {dataSummary.formattedAvg}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes bounceIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  const renderComboChart = () => {
    const isMultiSeries = config.series && config.series.length > 0
    if (!isMultiSeries && config.data.length === 0) return null
    
    if (isMultiSeries) {
      return renderMultiSeriesComboChart()
    }

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    
    // Smart color selection for maximum contrast
    const primaryColor = colors[0]
    
    // Color contrast mapping for better visual distinction
    const getContrastColor = (barColor: string, palette: string[]) => {
      // Predefined contrasting color pairs
      const contrastMap: Record<string, string> = {
        "#6366F1": "#EF4444", // Blue → Red
        "#8B5CF6": "#F59E0B", // Purple → Orange  
        "#06B6D4": "#EC4899", // Cyan → Pink
        "#10B981": "#F59E0B", // Green → Orange
        "#F59E0B": "#6366F1", // Orange → Blue
        "#EF4444": "#10B981", // Red → Green
        "#EC4899": "#06B6D4", // Pink → Cyan
        "#84CC16": "#8B5CF6", // Lime → Purple
      }
      
      // Try to find a predefined contrast color
      if (contrastMap[barColor]) {
        return contrastMap[barColor]
      }
      
      // If palette has enough colors, skip indices for visual separation
      if (palette.length >= 5) {
        return palette[4] // Use 5th color
      } else if (palette.length >= 3) {
        return palette[2] // Use 3rd color
      } else if (palette.length >= 2) {
        return palette[1] // Use 2nd color
      }
      
      // Ultimate fallback - ensure it's different from bar color
      return barColor === "#6366F1" ? "#EF4444" : "#6366F1"
    }
    
    const lineColor = getContrastColor(primaryColor, colors)

    // Use deterministic dimensions
    const { availableWidth, availableHeight } = getContainerDimensions()
    const chartWidth = availableWidth
    const chartHeight = availableHeight
    const padding = 40
    const barWidth = 32 // Narrow width to match horizontal and vertical bar chart consistency

    // Calculate positions for both bars and line points
    const barPositions = sortedData.map((item, index) => {
      const x = padding + (index + 0.5) * ((chartWidth - 2 * padding) / sortedData.length)
      const barHeight = (item.value / maxValue) * (chartHeight - 2 * padding)
      const y = chartHeight - padding - barHeight
      return { x, y, barHeight, item, index }
    })

    const linePoints = sortedData.map((item, index) => {
      const x = padding + (index + 0.5) * ((chartWidth - 2 * padding) / sortedData.length)
      const y = chartHeight - padding - ((item.value / maxValue) * (chartHeight - 2 * padding))
      return { x, y, item, index }
    })

    // Create smooth curve path for line
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return ""
      
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y
        const cp2x = curr.x - (curr.x - prev.x) * 0.3
        const cp2y = curr.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }
      
      return path
    }

    const linePath = createSmoothPath(linePoints)

    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex items-center justify-center p-2">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            className="max-w-full max-h-full"
          >
            <defs>
              <linearGradient id="comboBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={`${primaryColor}f5`} />
                <stop offset="50%" stopColor={`${primaryColor}e8`} />
                <stop offset="100%" stopColor={primaryColor} />
              </linearGradient>
              <linearGradient id="comboLineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={lineColor} />
                <stop offset="50%" stopColor={lineColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={lineColor} />
              </linearGradient>
              <filter id="comboShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Grid lines */}
            {showGridLines && (
              <g opacity="0.1">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                  return (
                    <line
                      key={i}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke={isDark ? "#fff" : "#000"}
                      strokeWidth="1"
                    />
                  )
                })}
              </g>
            )}

            {/* Bars */}
            {barPositions.map(({ x, y, barHeight, item, index }) => (
              <g key={`bar-${index}`}>
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="2"
                  fill="url(#comboBarGradient)"
                  filter="url(#comboShadow)"
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                  style={{
                    animation: `slideUp 0.8s ease-out ${index * 0.15}s backwards`
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: `${item.scenario} (Bar)`,
                      value: item.value,
                      displayValue: getDisplayValue(item),
                      color: primaryColor
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                {showDataLabels && (() => {
                  const totalValue = config.data.reduce((sum, d) => sum + d.value, 0)
                  const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : getDisplayValue(item)
                  const isInside = barHeight > 40
                  
                  return (
                    <foreignObject x={x - 30} y={isInside ? y + barHeight - 25 : y - 30} width="60" height="25">
                      <div 
                        className="text-xs font-medium text-center w-full"
                        style={{ 
                          color: isInside ? '#ffffff' : (isDark ? '#f3f4f6' : '#1f2937')
                        }}
                      >
                        {labelValue}
                      </div>
                    </foreignObject>
                  )
                })()}
              </g>
            ))}

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#comboLineStroke)"
              strokeWidth="3"
              className="transition-all duration-700"
              style={{
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeDasharray: '1000',
                strokeDashoffset: '1000',
                animation: 'drawLine 2s ease-out 0.5s forwards'
              }}
            />

            {/* Line data points */}
            {linePoints.map(({ x, y, item, index }) => (
              <g key={`point-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={lineColor}
                  className="cursor-pointer transition-all duration-300 hover:r-7"
                  style={{
                    filter: `drop-shadow(0 2px 4px ${lineColor}40)`,
                    animation: `bounceIn 0.6s ease-out ${0.5 + index * 0.1}s backwards`
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: `${item.scenario} (Line)`,
                      value: item.value,
                      displayValue: getDisplayValue(item),
                      color: lineColor
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="white"
                  className="pointer-events-none"
                />
                {showDataLabels && (() => {
                  const totalValue = config.data.reduce((sum, d) => sum + d.value, 0)
                  const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : getDisplayValue(item)
                  
                  return (
                    <foreignObject x={x - 30} y={y - 50} width="60" height="25">
                      <div 
                        className="text-xs font-medium text-center w-full"
                        style={{ 
                          color: isDark ? '#f3f4f6' : '#1f2937'
                        }}
                      >
                        {labelValue}
                      </div>
                    </foreignObject>
                  )
                })()}
              </g>
            ))}

            {/* Y-axis labels */}
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding))
                const value = maxValue * ratio
                return (
                  <text
                    key={i}
                    x={padding - 10}
                    y={y + 5}
                    textAnchor="end"
                    className={`text-xs ${isDark ? 'fill-gray-400' : 'fill-gray-600'}`}
                  >
                    {formatNumber(value)}
                  </text>
                )
              })}
            </g>

            {/* Reference Lines */}
            {renderReferenceLines('vertical', sortedData.map(d => d.value), { 
              width: chartWidth, 
              height: chartHeight, 
              padding: padding 
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-center py-1 px-2 min-h-0">
          <div className="flex justify-between" style={{ width: `${chartWidth - 2 * padding}px` }}>
            {config.data.map((item, index) => (
              <span
                key={index}
                className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-20 truncate`}
              >
                {item.scenario}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 py-1 px-2 min-h-0">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: primaryColor }} 
            />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Bars
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: lineColor }} 
            />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Line
            </span>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes bounceIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  const renderChart = () => {
    if (config.data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No data to display</h3>
            <p className="text-sm text-gray-500">Add some data points to see your chart</p>
          </div>
        </div>
      )
    }

    switch (config.type) {
      case "horizontal-bar":
        return renderHorizontalBarChart()
      case "vertical-bar":
        return renderVerticalBarChart()
      case "pie":
        return renderPieChart()
      case "donut":
        return renderDonutChart()
      case "line":
        return renderLineChart()
      case "combo":
        return renderComboChart()
      default:
        return <div className="text-white">Unknown chart type</div>
    }
  }

  return (
    <div 
      className="h-full flex flex-col relative bg-background chart-container"
    >
      <Tooltip data={tooltip} formatNumber={formatNumber} />
      
      {/* Chart Area */}
      <div 
        className={`flex-1 ${getOverflowBehavior()} flex items-start justify-center bg-background border-border rounded-xl chart-responsive ${
          config.isModalContext ? 'p-2' : 'container-responsive'
        }`}
      >
        {config.theme?.borderStyle === 'gradient' ? (
          <div 
            className={`${getCornerStyle()} shadow-sm transition-all duration-300`}
            style={{
              ...getBorderStyles(),
              ...getGradientPadding(),
              width: getContainerDimensions().width,
              height: getContainerDimensions().height
            }}
          >
            <div 
              ref={chartRef} 
              className={`${getBackgroundStyle()} ${getCornerStyle()} w-full h-full`}
            >
              <div className={`h-full w-full ${getChartPadding()}`}>
                <div className="h-full flex flex-col">
                  {/* Chart Title and Subtitle */}
                  {renderChartTitle()}
                  
                  {/* Chart Content */}
                  <div 
                    className="flex-1" 
                    style={{}}
                  >
                    {renderChart()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            ref={chartRef} 
            className={`${getBackgroundStyle()} ${getCornerStyle()} ${getBorderStyle()} shadow-sm transition-all duration-300`} 
            style={{
              ...getBorderStyles(),
              width: getContainerDimensions().width,
              height: getContainerDimensions().height
            }}
          >
            <div className={`h-full w-full ${getChartPadding()}`}>
              <div className="h-full flex flex-col">
                {/* Chart Title and Subtitle */}
                {renderChartTitle()}
                
                {/* Chart Content */}
                <div 
                  className="flex-1" 
                  style={config.isModalContext ? { marginTop: '12px' } : {}}
                >
                  {renderChart()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}