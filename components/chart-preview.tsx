"use client"

import { useRef } from "react"
import type { ChartConfig } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"

interface ChartPreviewProps {
  config: ChartConfig
}

export function ChartPreview({ config }: ChartPreviewProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const isDark = config.theme?.background !== 'white'
  
  // Helper function to get background style
  const getBackgroundStyle = () => {
    const bgType = config.theme?.background || 'black'
    switch (bgType) {
      case 'black': return 'bg-black'
      case 'white': return 'bg-white'
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
      case 'gradient': return 'border-2 border-transparent bg-clip-padding'
      case 'none': return ''
      default: return ''
    }
  }
  
  // Get border color for solid borders
  const getBorderColor = () => {
    const borderType = config.theme?.borderStyle || 'none'
    const borderColor = config.theme?.borderColor || '#6B7280'
    return borderType === 'solid' ? { borderColor } : {}
  }
  
  // For gradient borders, we need a wrapper
  const needsGradientBorder = config.theme?.borderStyle === 'gradient'
  
  // Get dynamic padding based on border presence
  const getChartPadding = () => {
    const hasBorder = config.theme?.borderStyle !== 'none'
    return hasBorder ? 'p-6' : 'p-4'
  }
  
  // Get gradient border style based on selected color
  const getGradientBorderStyle = () => {
    const borderColor = config.theme?.borderColor || '#8B5CF6'
    // Create a more sophisticated gradient with the selected color
    // Convert hex to variations for a richer gradient
    const variations = getColorVariations(borderColor)
    return {
      background: `linear-gradient(45deg, ${variations.dark}, ${borderColor}, ${variations.light})`
    }
  }
  
  // Helper to create color variations
  const getColorVariations = (color: string) => {
    // For common colors, provide predefined variations
    const colorMap: { [key: string]: { dark: string, light: string } } = {
      '#6B7280': { dark: '#374151', light: '#D1D5DB' }, // Gray
      '#8B5CF6': { dark: '#7C3AED', light: '#C4B5FD' }, // Purple
      '#06D6A0': { dark: '#047857', light: '#A7F3D0' }, // Teal
      '#FFD23F': { dark: '#D97706', light: '#FEF3C7' }, // Yellow
      '#FF6B6B': { dark: '#DC2626', light: '#FECACA' }, // Red
      '#4ECDC4': { dark: '#0891B2', light: '#A7F3D0' }, // Cyan
      '#FFFFFF': { dark: '#D1D5DB', light: '#F9FAFB' }, // White
      '#000000': { dark: '#111827', light: '#6B7280' }  // Black
    }
    
    return colorMap[color] || { 
      dark: color + '99', 
      light: color + '40' 
    }
  }

  const formatNumber = (value: number): string => {
    const abbreviation = config.theme?.abbreviation || 'auto'
    const decimalPlaces = config.theme?.decimalPlaces || 'auto'
    const fixedCount = config.theme?.fixedDecimalCount || 0
    
    let formattedValue: string
    
    switch (abbreviation) {
      case 'none':
        formattedValue = value.toString()
        break
      case 'k':
        formattedValue = (value / 1000).toString() + 'k'
        break
      case 'm':
        formattedValue = (value / 1000000).toString() + 'M'
        break
      case 'auto':
      default:
        if (value >= 1000000) {
          formattedValue = (value / 1000000).toFixed(1) + "M"
        } else if (value >= 1000) {
          formattedValue = (value / 1000).toFixed(0) + "k"
        } else {
          formattedValue = value.toString()
        }
    }
    
    // Apply decimal places if fixed
    if (decimalPlaces === 'fixed' && abbreviation !== 'auto') {
      const numberPart = parseFloat(formattedValue.replace(/[kM]/g, ''))
      const suffix = formattedValue.match(/[kM]/)?.[0] || ''
      formattedValue = numberPart.toFixed(fixedCount) + suffix
    }
    
    return formattedValue
  }

  const formatPercentage = (value: number, total: number): string => {
    const percentage = (value / total) * 100
    const decimalPlaces = config.theme?.decimalPlaces || 'auto'
    const fixedCount = config.theme?.fixedDecimalCount || 0
    
    if (decimalPlaces === 'fixed') {
      return percentage.toFixed(fixedCount) + '%'
    }
    return percentage.toFixed(1) + '%'
  }

  const sortData = (data: any[]) => {
    if (config.theme?.sortHighToLow) {
      return [...data].sort((a, b) => b.value - a.value)
    }
    return data
  }

  const renderHorizontalBarChart = () => {
    if (config.data.length === 0) return null

    const sortedData = sortData(config.data)
    const maxValue = Math.max(...sortedData.map((d) => d.value))
    const totalValue = sortedData.reduce((sum, d) => sum + d.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    const showDataLabels = config.theme?.showDataLabels !== false
    const showPercentages = config.theme?.showPercentages || false

    return (
      <div className="space-y-4">
        {sortedData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100

          return (
            <div key={index} className="flex items-center gap-6">
              <div className="w-44 text-right">
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>{item.scenario}</span>
              </div>
              <div className="flex-1 relative">
                <div className={`h-10 ${isDark ? 'bg-gray-800/30' : 'bg-gray-200/50'} rounded-lg overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r rounded-lg transition-all duration-1200 ease-out flex items-center justify-end pr-4 relative hover:brightness-110"
                    style={{
                      width: `${percentage}%`,
                      minWidth: percentage > 0 ? "80px" : "0px",
                      background: `linear-gradient(to right, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)`
                    }}
                  >
                    {showDataLabels && (
                      <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'bg-gray-900/90 text-white border border-gray-700/50' : 'bg-white/95 text-gray-800 border border-gray-200/50'} text-sm font-light tracking-wide px-3 py-2 rounded-lg shadow-sm backdrop-blur-sm`}>
                        {showPercentages ? formatPercentage(item.value, totalValue) : formatNumber(item.value)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {config.theme?.showGridLines !== false && (
          <div className="flex items-center gap-6 mt-8">
            <div className="w-44"></div>
            <div className={`flex-1 flex justify-between text-xs font-light ${isDark ? 'text-gray-400' : 'text-gray-500'} px-2 tracking-widest opacity-70`}>
              <span>0</span>
              <span>{formatNumber(maxValue * 0.2)}</span>
              <span>{formatNumber(maxValue * 0.4)}</span>
              <span>{formatNumber(maxValue * 0.6)}</span>
              <span>{formatNumber(maxValue * 0.8)}</span>
              <span>{formatNumber(maxValue)}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-6">
          <div className="w-44"></div>
          <div className="flex-1 text-center">
            <span className={`text-xs font-light tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Revenue (€)</span>
          </div>
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
    const showDataLabels = config.theme?.showDataLabels !== false
    const showPercentages = config.theme?.showPercentages || false

    return (
      <div className="space-y-8">
        <div className={`relative h-64 ${isDark ? 'bg-gray-800/10' : 'bg-gray-50/30'} rounded-xl p-8`}>
          <div className="flex items-end justify-center gap-4 h-full">
            {sortedData.map((item, index) => {
              const percentage = (item.value / maxValue) * 100
              const barHeight = Math.max((percentage / 100) * 200, 20) // 200px max height, 20px min
              
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="relative flex items-end justify-center">
                    <div
                      className="w-16 bg-gradient-to-t rounded-t-lg transition-all duration-1200 ease-out relative flex items-end justify-center pb-2 hover:brightness-110"
                      style={{
                        height: `${barHeight}px`,
                        background: `linear-gradient(to top, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)`
                      }}
                    >
                      {showDataLabels && (
                        <div className={`${isDark ? 'bg-gray-900/90 text-white border border-gray-700/50' : 'bg-white/95 text-gray-800 border border-gray-200/50'} text-sm font-light tracking-wide px-3 py-2 rounded-lg shadow-sm backdrop-blur-sm`}>
                          {showPercentages ? formatPercentage(item.value, totalValue) : formatNumber(item.value)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className={`flex justify-between text-sm font-light ${isDark ? 'text-gray-300' : 'text-gray-600'} px-8 mt-6`}>
          {sortedData.map((item, index) => (
            <span key={index} className="text-center max-w-24 truncate tracking-wide">
              {item.scenario}
            </span>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <span className={`text-sm font-light tracking-widest uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'} opacity-60`}>Revenue (€)</span>
        </div>
      </div>
    )
  }

  const renderPieChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

    return (
      <div className="flex items-center justify-center space-x-12">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {config.data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (item.value / total) * 360
              const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)

              const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180)
              const x2 = 100 + 80 * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
              const y2 = 100 + 80 * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <path
                  key={index}
                  d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-500 hover:opacity-80"
                />
              )
            })}
          </svg>
        </div>
        <div className="space-y-5">
          {config.data.map((item, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <div className="w-5 h-5 rounded-lg shadow-sm" style={{ backgroundColor: colors[index % colors.length] }} />
              <div className="flex-1">
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-light tracking-wide`}>
                  {item.scenario}
                </span>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-light tracking-wider mt-1`}>
                  {formatNumber(item.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDonutChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

    return (
      <div className="flex items-center justify-center space-x-12">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {config.data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (item.value / total) * 360
              const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)

              const outerRadius = 80
              const innerRadius = 45
              
              const x1 = 100 + outerRadius * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const y1 = 100 + outerRadius * Math.sin(((startAngle - 90) * Math.PI) / 180)
              const x2 = 100 + outerRadius * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
              const y2 = 100 + outerRadius * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)
              
              const x3 = 100 + innerRadius * Math.cos(((startAngle + angle - 90) * Math.PI) / 180)
              const y3 = 100 + innerRadius * Math.sin(((startAngle + angle - 90) * Math.PI) / 180)
              const x4 = 100 + innerRadius * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const y4 = 100 + innerRadius * Math.sin(((startAngle - 90) * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <path
                  key={index}
                  d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-500 hover:opacity-80"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(total)}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {config.data.map((item, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <div className="w-5 h-5 rounded-lg shadow-sm" style={{ backgroundColor: colors[index % colors.length] }} />
              <div className="flex-1">
                <span className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-light tracking-wide`}>
                  {item.scenario}
                </span>
                <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-light tracking-wider mt-1`}>
                  {formatNumber(item.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLineChart = () => {
    if (config.data.length === 0) return null

    const maxValue = Math.max(...config.data.map((d) => d.value))
    const minValue = Math.min(...config.data.map((d) => d.value))
    const range = maxValue - minValue || 1
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    const primaryColor = colors[0]

    return (
      <div className="space-y-8">
        <div className={`relative h-64 ${isDark ? 'bg-gray-800/10' : 'bg-gray-50/30'} rounded-xl p-8`}>
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {config.theme?.showGridLines !== false && [0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke={isDark ? "#374151" : "#E5E7EB"} strokeWidth="0.5" opacity="0.2" />
            ))}

            <path
              d={`${config.data
                .map((item, index) => {
                  const x = config.data.length === 1 ? 200 : (index / (config.data.length - 1)) * 400
                  const y = 200 - ((item.value - minValue) / range) * 200
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")} L ${config.data.length === 1 ? 200 : 400} 200 L 0 200 Z`}
              fill="url(#lineGradient)"
              className="transition-all duration-1000"
            />

            <path
              d={`${config.data
                .map((item, index) => {
                  const x = config.data.length === 1 ? 200 : (index / (config.data.length - 1)) * 400
                  const y = 200 - ((item.value - minValue) / range) * 200
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}`}
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              className="transition-all duration-1000"
            />

            {config.data.map((item, index) => {
              const x = config.data.length === 1 ? 200 : (index / (config.data.length - 1)) * 400
              const y = 200 - ((item.value - minValue) / range) * 200
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={colors[1] || primaryColor}
                    stroke={isDark ? "#ffffff" : "#374151"}
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    className={`${isDark ? 'fill-white' : 'fill-gray-900'} text-xs font-medium`}
                  >
                    {formatNumber(item.value)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className={`flex justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} px-6`}>
          {config.data.map((item, index) => (
            <span key={index} className="text-center max-w-20 truncate">
              {item.scenario}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderComboChart = () => {
    if (config.data.length === 0) return null

    const maxValue = Math.max(...config.data.map((d) => d.value))
    const minValue = Math.min(...config.data.map((d) => d.value))
    const range = maxValue - minValue || 1
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]

    return (
      <div className="space-y-8">
        <div className={`relative h-64 ${isDark ? 'bg-gray-800/10' : 'bg-gray-50/30'} rounded-xl p-8`}>
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <defs>
              <linearGradient id="comboGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors[0]} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={colors[0]} stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {config.theme?.showGridLines !== false && [0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke={isDark ? "#374151" : "#E5E7EB"} strokeWidth="0.5" opacity="0.2" />
            ))}

            {config.data.map((item, index) => {
              const barWidth = 300 / config.data.length * 0.6
              const x = 50 + (index * (300 / config.data.length)) + ((300 / config.data.length) - barWidth) / 2
              const percentage = ((item.value - minValue) / range) * 100
              const height = (percentage / 100) * 180
              
              return (
                <rect
                  key={`bar-${index}`}
                  x={x}
                  y={200 - height}
                  width={barWidth}
                  height={height}
                  fill={colors[index % colors.length]}
                  opacity="0.7"
                  className="transition-all duration-1000 ease-out"
                />
              )
            })}

            <path
              d={`${config.data
                .map((item, index) => {
                  const x = 50 + (index * (300 / config.data.length)) + (300 / config.data.length) / 2
                  const y = 200 - ((item.value - minValue) / range) * 180
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}`}
              fill="none"
              stroke={colors[0]}
              strokeWidth="3"
              className="transition-all duration-1000"
            />

            {config.data.map((item, index) => {
              const x = 50 + (index * (300 / config.data.length)) + (300 / config.data.length) / 2
              const y = 200 - ((item.value - minValue) / range) * 180
              return (
                <g key={`point-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={isDark ? "#ffffff" : "#ffffff"}
                    stroke={colors[0]}
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className={`${isDark ? 'fill-white' : 'fill-gray-900'} text-xs font-medium`}
                  >
                    {formatNumber(item.value)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className={`flex justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} px-6`}>
          {config.data.map((item, index) => (
            <span key={index} className="text-center max-w-20 truncate">
              {item.scenario}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderChart = () => {
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
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Color Theme Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex gap-1">
              {(config.theme?.palette.colors || ['#6366F1', '#8B5CF6', '#06B6D4']).slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{config.theme?.palette.name || 'Default'}</span>
          </div>
          
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-12 overflow-auto">
        {needsGradientBorder ? (
          <div className={`h-full min-h-[500px] p-0.5 ${getCornerStyle()} transition-all duration-300`} style={getGradientBorderStyle()}>
            <div ref={chartRef} className={`h-full ${getBackgroundStyle()} ${getCornerStyle()} shadow-sm`}>
              {config.data.length > 0 ? (
                <div className={`h-full w-full ${getChartPadding()}`}>
                  <div className="h-full flex flex-col">
                    {/* Chart Title and Subtitle */}
                    <div className="mb-10">
                      <h1 className={`text-2xl font-light tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mb-2 leading-tight`}>
                        {config.title}
                      </h1>
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                        {config.subtitle}
                      </p>
                    </div>
                    
                    {/* Chart Content */}
                    <div className="flex-1">
                      {renderChart()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`h-full flex items-center justify-center ${getChartPadding()}`}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-light text-gray-300 mb-2 tracking-wide">No data to display</h3>
                    <p className="text-sm font-light text-gray-500 leading-relaxed">Add some data points to see your chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div ref={chartRef} className={`h-full min-h-[500px] ${getBackgroundStyle()} ${getCornerStyle()} ${getBorderStyle()} shadow-sm transition-all duration-300`} style={getBorderColor()}>
            {config.data.length > 0 ? (
              <div className={`h-full w-full ${getChartPadding()}`}>
                <div className="h-full flex flex-col">
                  {/* Chart Title and Subtitle */}
                  <div className="mb-8">
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
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
            ) : (
              <div className={`h-full flex items-center justify-center ${getChartPadding()}`}>
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
