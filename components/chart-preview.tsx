"use client"

import { useRef, useState } from "react"
import type { ChartConfig, ChartData } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"

interface TooltipData {
  x: number
  y: number
  label: string
  value: number
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
          <div>Value: {formatNumber(data.value)}</div>
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
  const isDark = config.theme?.background !== 'white'
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [renderKey, setRenderKey] = useState(0)
  
  // Get chart dimensions
  const dimensions = config.dimensions || { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' }
  
  // Calculate container dimensions with proper space reservation
  const getContainerDimensions = () => {
    const aspectRatio = dimensions.width / dimensions.height
    
    // Reserve space for UI elements (predictable, not viewport-dependent)
    const titleSpace = 80 // Title + subtitle + margins
    const legendSpace = (config.type === 'pie' || config.type === 'donut' || config.type === 'combo') ? 50 : 30 // Legend/labels
    const padding = 48 // Chart padding
    const reservedHeight = titleSpace + legendSpace + padding
    
    // Available container space (use fixed max dimensions to prevent overflow)
    const maxContainerWidth = 800
    const maxContainerHeight = 600
    const availableHeight = maxContainerHeight - reservedHeight
    
    // Calculate dimensions maintaining aspect ratio within bounds
    let containerWidth = maxContainerWidth
    let containerHeight = maxContainerWidth / aspectRatio
    
    // If height would exceed available space, scale based on height
    if (containerHeight > availableHeight) {
      containerHeight = availableHeight
      containerWidth = availableHeight * aspectRatio
    }
    
    // Ensure minimum sizes for usability
    containerWidth = Math.max(containerWidth, 300)
    containerHeight = Math.max(containerHeight, 200)
    
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
  
  // Get dynamic padding based on border presence
  const getChartPadding = () => {
    const hasBorder = config.theme?.borderStyle !== 'none'
    return hasBorder ? 'p-6' : 'p-4'
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

  // Sort data function
  const sortData = (data: ChartData[]) => {
    if (config.theme?.sortHighToLow) {
      return [...data].sort((a, b) => b.value - a.value)
    }
    return data
  }

  // Style options
  const showDataLabels = config.theme?.showDataLabels !== false
  const showPercentages = config.theme?.showPercentages || false
  const showGridLines = config.theme?.showGridLines !== false

  // Data label styling system
  const getDataLabelStyle = (value: number, color: string, position: 'inside' | 'outside' = 'inside', chartType?: string) => {
    const isLightColor = isColorLight(color)
    let textColor: string
    
    if (position === 'inside') {
      // Inside the bar: use contrasting color based on bar color
      textColor = isLightColor ? '#1f2937' : '#ffffff'
    } else {
      // Outside the bar: use contrasting color based on background
      if (isDark) {
        textColor = '#f3f4f6' // Light text on dark background
      } else {
        // White background: use the bar color itself for better visibility
        textColor = color
      }
    }
    
    // Use smaller text for pie and donut charts
    const textSize = (chartType === 'pie' || chartType === 'donut') ? 'text-xs' : 'text-xs'
    const fontWeight = (chartType === 'pie' || chartType === 'donut') ? 'font-light' : 'font-medium'
    
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
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)  
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128
  }

  const renderHorizontalBarChart = () => {
    if (config.data.length === 0) return null

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const totalValue = sortedData.reduce((sum, d) => sum + d.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]

    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-full space-y-4">
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
                    className="h-full rounded-sm transition-all duration-200 ease-out flex items-center justify-end pr-3 relative cursor-pointer"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${color}e6, ${color})`,
                      boxShadow: `0 2px 4px ${color}20`
                    }}
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
                        percentage: (item.value / totalValue) * 100,
                        color: color
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {showDataLabels && (() => {
                      const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : formatNumber(item.value)
                      const labelStyle = getDataLabelStyle(item.value, color, percentage > 30 ? 'inside' : 'outside')
                      
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
      </div>
    )
  }

  const renderVerticalBarChart = () => {
    if (config.data.length === 0) return null

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const totalValue = sortedData.reduce((sum, d) => sum + d.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]

    // Use deterministic dimensions
    const { availableHeight } = getContainerDimensions()
    const maxBarHeight = availableHeight * 0.6
    const barWidth = 32 // Narrow width to match horizontal bar chart consistency

    return (
      <div className="h-full flex flex-col justify-center">
        <div className="flex items-end justify-center gap-12">
          {sortedData.map((item, index) => {
            const percentage = (item.value / maxValue) * 100
            const barHeight = Math.max((percentage / 100) * maxBarHeight, 15)
            const color = colors[index % colors.length]
            
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="rounded-t cursor-pointer transition-all duration-200 flex items-end justify-center pb-2"
                  style={{
                    width: `${barWidth}px`,
                    height: `${barHeight}px`,
                    background: `linear-gradient(180deg, ${color}f0, ${color})`,
                    boxShadow: `0 2px 8px ${color}25`
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      label: item.scenario,
                      value: item.value,
                      color: color
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {showDataLabels && (() => {
                    const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : formatNumber(item.value)
                    const labelStyle = getDataLabelStyle(item.value, color, barHeight > 40 ? 'inside' : 'outside')
                    
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
        <div className="flex justify-center gap-12 mt-2">
          {sortedData.map((item, index) => (
            <span key={index} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-20 truncate`}>
              {item.scenario}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]
    
    // Check if we're in portrait mode
    const aspectRatio = dimensions.width / dimensions.height
    const isPortrait = aspectRatio < 1
    
    if (isPortrait) {
      // Portrait layout: stack chart and legend vertically
      return (
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <div className="relative w-full max-w-64 aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full transform rotate-0">
              <defs>
                <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
                </filter>
              </defs>
              {config.data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
                const color = colors[index % colors.length]

                const x1 = 100 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                const y1 = 100 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                const x2 = 100 + 70 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
                const y2 = 100 + 70 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)

                const largeArcFlag = angle > 180 ? 1 : 0

                return (
                  <g key={index}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={color}
                      filter="url(#pieShadow)"
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)'
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
                        e.currentTarget.style.transform = 'scale(1)'
                        setTooltip(null)
                      }}
                    />
                    {showDataLabels && angle > 30 && (() => {
                      const midAngle = startAngle + angle / 2 - 90
                      const midAngleRad = (midAngle * Math.PI) / 180
                      const labelRadius = 45
                      const labelX = 100 + labelRadius * Math.cos(midAngleRad)
                      const labelY = 100 + labelRadius * Math.sin(midAngleRad)
                      const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : formatNumber(item.value)
                      const labelStyle = getDataLabelStyle(item.value, color, 'inside', 'pie')
                      
                      return (
                        <foreignObject x={labelX - 25} y={labelY - 10} width="50" height="20">
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
                      background: `linear-gradient(135deg, ${colors[index % colors.length]}ff, ${colors[index % colors.length]}cc)`,
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
                      {formatNumber(item.value)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Landscape layout: chart and legend side by side
    return (
      <div className="flex items-center justify-center gap-8 h-full">
        <div className="relative w-full h-full max-w-80 max-h-80">
          <svg viewBox="0 0 200 200" className="w-full h-full transform rotate-0">
            <defs>
              <filter id="pieShadowLandscape" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
              </filter>
            </defs>
            {config.data.map((item, index) => {
              const angle = (item.value / total) * 360
              const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
              const color = colors[index % colors.length]

              const x1 = 100 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const y1 = 100 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180)
              const x2 = 100 + 70 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
              const y2 = 100 + 70 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <g key={index}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={color}
                    filter="url(#pieShadowLandscape)"
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    style={{
                      transformOrigin: '100px 100px',
                      transform: 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)'
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
                      e.currentTarget.style.transform = 'scale(1)'
                      setTooltip(null)
                    }}
                  />
                  {showDataLabels && angle > 30 && (() => {
                    const midAngle = startAngle + angle / 2 - 90
                    const midAngleRad = (midAngle * Math.PI) / 180
                    const labelRadius = 45
                    const labelX = 100 + labelRadius * Math.cos(midAngleRad)
                    const labelY = 100 + labelRadius * Math.sin(midAngleRad)
                    const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : formatNumber(item.value)
                    const labelStyle = getDataLabelStyle(item.value, color, 'inside', 'pie')
                    
                    return (
                      <foreignObject x={labelX - 25} y={labelY - 10} width="50" height="20">
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
                    background: `linear-gradient(135deg, ${colors[index % colors.length]}ff, ${colors[index % colors.length]}cc)`,
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
                    {formatNumber(item.value)}
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
    
    // Check if we're in portrait mode
    const aspectRatio = dimensions.width / dimensions.height
    const isPortrait = aspectRatio < 1
    
    if (isPortrait) {
      // Portrait layout: stack chart and legend vertically
      return (
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          <div className="relative w-full max-w-64 aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <filter id="donutShadowPortrait" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.25"/>
                </filter>
              </defs>
              {config.data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
                const color = colors[index % colors.length]

                const centerX = 100
                const centerY = 100
                const outerRadius = 80
                const innerRadius = 45

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
                      fill={color}
                      filter="url(#donutShadowPortrait)"
                      className="cursor-pointer transition-all duration-500 hover:opacity-90"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: 'scale(1)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
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
                        e.currentTarget.style.transform = 'scale(1)'
                        setTooltip(null)
                      }}
                    />
                    {showDataLabels && angle > 25 && (() => {
                      const midAngle = startAngle + angle / 2 - 90
                      const midAngleRad = (midAngle * Math.PI) / 180
                      const labelRadius = (outerRadius + innerRadius) / 2
                      const labelX = centerX + labelRadius * Math.cos(midAngleRad)
                      const labelY = centerY + labelRadius * Math.sin(midAngleRad)
                      const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : formatNumber(item.value)
                      const labelStyle = getDataLabelStyle(item.value, color, 'inside', 'donut')
                      
                      return (
                        <foreignObject x={labelX - 30} y={labelY - 10} width="60" height="20">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                      background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}cc)`,
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
                      {formatNumber(item.value)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Landscape layout: chart and legend side by side
    return (
      <div className="flex items-center justify-center gap-8 h-full">
        <div className="relative w-full h-full max-w-80 max-h-80">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.25"/>
              </filter>
            </defs>
            {config.data.map((item, index) => {
              const angle = (item.value / total) * 360
              const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
              const color = colors[index % colors.length]

              const centerX = 100
              const centerY = 100
              const outerRadius = 80
              const innerRadius = 45

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
                    fill={color}
                    filter="url(#donutShadow)"
                    className="cursor-pointer transition-all duration-500 hover:opacity-90"
                    style={{
                      transformOrigin: '100px 100px',
                      transform: 'scale(1)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
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
                      e.currentTarget.style.transform = 'scale(1)'
                      setTooltip(null)
                    }}
                  />
                  {showDataLabels && angle > 25 && (() => {
                    const midAngle = startAngle + angle / 2 - 90
                    const midAngleRad = (midAngle * Math.PI) / 180
                    const labelRadius = (outerRadius + innerRadius) / 2
                    const labelX = centerX + labelRadius * Math.cos(midAngleRad)
                    const labelY = centerY + labelRadius * Math.sin(midAngleRad)
                    const labelValue = showPercentages ? `${((item.value / total) * 100).toFixed(1)}%` : formatNumber(item.value)
                    const labelStyle = getDataLabelStyle(item.value, color, 'inside', 'donut')
                    
                    return (
                      <foreignObject x={labelX - 30} y={labelY - 10} width="60" height="20">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                    background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}cc)`,
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
                    {formatNumber(item.value)}
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
    if (config.data.length === 0) return null

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
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
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.02" />
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
                  className="cursor-pointer transition-all duration-300 hover:r-8"
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
                  const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : formatNumber(item.value)
                  const labelStyle = getDataLabelStyle(item.value, primaryColor, 'outside')
                  
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

  const renderComboChart = () => {
    if (config.data.length === 0) return null

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
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.7" />
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
                  fill="url(#comboBarGradient)"
                  filter="url(#comboShadow)"
                  className="cursor-pointer transition-all duration-300 hover:opacity-80"
                  style={{
                    animation: `slideUp 0.8s ease-out ${index * 0.1}s backwards`
                  }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      label: `${item.scenario} (Bar)`,
                      value: item.value,
                      color: primaryColor
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
                {showDataLabels && (() => {
                  const totalValue = config.data.reduce((sum, d) => sum + d.value, 0)
                  const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : formatNumber(item.value)
                  const labelStyle = getDataLabelStyle(item.value, primaryColor, barHeight > 40 ? 'inside' : 'outside')
                  
                  return (
                    <foreignObject x={x - 30} y={barHeight > 40 ? y + barHeight - 25 : y - 30} width="60" height="25">
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
                  const labelValue = showPercentages ? `${((item.value / totalValue) * 100).toFixed(1)}%` : formatNumber(item.value)
                  const labelStyle = getDataLabelStyle(item.value, lineColor, 'outside')
                  
                  return (
                    <foreignObject x={x - 30} y={y - 50} width="60" height="25">
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
    <div className="h-full flex flex-col bg-[#0d0d0d] relative">
      <Tooltip data={tooltip} formatNumber={formatNumber} />
      
      {/* Chart Area */}
      <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
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
                  <div className="mb-8">
                    <h1 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {config.title}
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {config.subtitle}
                    </p>
                  </div>
                  
                  {/* Chart Content */}
                  <div className="flex-1">
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
                <div className="mb-8">
                  <h1 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {config.title}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {config.subtitle}
                  </p>
                </div>
                
                {/* Chart Content */}
                <div className="flex-1">
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