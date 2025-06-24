"use client"

import { useRef, useState } from "react"
import type { ChartConfig } from "@/app/page"
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
      <>
        <style jsx>{`
          @keyframes barGrow {
            from { width: 0%; }
            to { width: var(--target-width); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        <div className="space-y-6">
          {sortedData.map((item, index) => {
            const percentage = (item.value / maxValue) * 100
            const color = colors[index % colors.length]

            return (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-32 text-right">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>{item.scenario}</span>
                </div>
                <div className="flex-1 relative">
                  <div className={`h-8 ${isDark ? 'bg-gray-800/30' : 'bg-gray-200/40'} rounded-sm overflow-hidden`}>
                    <div
                      className="h-full rounded-sm transition-all duration-200 ease-out flex items-center justify-end pr-3 relative cursor-pointer"
                      style={{
                        '--target-width': `${percentage}%`,
                        width: '0%',
                        background: `linear-gradient(90deg, ${color}e6, ${color})`,
                        boxShadow: `0 2px 4px ${color}20`,
                        animation: `barGrow 800ms ease-out ${index * 100}ms forwards`
                      } as any}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          x: rect.right,
                          y: rect.top + rect.height / 2,
                          label: item.scenario,
                          value: item.value,
                          percentage: (item.value / totalValue) * 100,
                          color: color
                        })
                        e.currentTarget.style.transform = 'scaleY(1.05)'
                        e.currentTarget.style.filter = 'brightness(1.15)'
                        e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`
                      }}
                      onMouseLeave={(e) => {
                        setTooltip(null)
                        e.currentTarget.style.transform = 'scaleY(1)'
                        e.currentTarget.style.filter = 'brightness(1)'
                        e.currentTarget.style.boxShadow = `0 2px 4px ${color}20`
                      }}
                      onMouseMove={(e) => {
                        if (tooltip) {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip(prev => prev ? {
                            ...prev,
                            x: rect.right,
                            y: rect.top + rect.height / 2
                          } : null)
                        }
                      }}
                    >
                      {showDataLabels && (
                        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'bg-gray-900/90 text-white' : 'bg-white/95 text-gray-800'} text-xs font-medium px-2 py-1 rounded shadow-sm opacity-0`}
                             style={{ animation: `fadeIn 300ms ease-out ${800 + index * 100}ms forwards` }}>
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
            <div className="flex items-center gap-4 mt-6 opacity-50">
              <div className="w-32"></div>
              <div className={`flex-1 flex justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} px-1`}>
                <span>0</span>
                <span>{formatNumber(maxValue * 0.5)}</span>
                <span>{formatNumber(maxValue)}</span>
              </div>
            </div>
          )}
        </div>
      </>
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
      <>
        <style jsx>{`
          @keyframes barGrowUp {
            from { height: 0px; }
            to { height: var(--target-height); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        <div className="space-y-10">
          <div className={`relative h-96 ${isDark ? 'bg-gray-800/10' : 'bg-gray-50/30'} rounded-xl p-12`}>
            <div className="flex items-end justify-center gap-12 h-full">
              {sortedData.map((item, index) => {
                const percentage = (item.value / maxValue) * 100
                const barHeight = Math.max((percentage / 100) * 280, 15)
                const color = colors[index % colors.length]
                
                return (
                  <div key={index} className="flex flex-col items-center gap-3 group">
                    <div className="relative flex items-end justify-center">
                      <div
                        className="w-8 rounded-t cursor-pointer transition-all duration-200"
                        style={{
                          '--target-height': `${barHeight}px`,
                          height: '0px',
                          background: `linear-gradient(180deg, ${color}f0, ${color})`,
                          boxShadow: `0 2px 8px ${color}25`,
                          animation: `barGrowUp 800ms ease-out ${index * 100}ms forwards`
                        } as any}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            label: item.scenario,
                            value: item.value,
                            percentage: (item.value / totalValue) * 100,
                            color: color
                          })
                          e.currentTarget.style.transform = 'scale(1.05)'
                          e.currentTarget.style.filter = 'brightness(1.15)'
                          e.currentTarget.style.boxShadow = `0 4px 16px ${color}40`
                        }}
                        onMouseLeave={(e) => {
                          setTooltip(null)
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.filter = 'brightness(1)'
                          e.currentTarget.style.boxShadow = `0 2px 8px ${color}25`
                        }}
                        onMouseMove={(e) => {
                          if (tooltip) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setTooltip(prev => prev ? {
                              ...prev,
                              x: rect.left + rect.width / 2,
                              y: rect.top
                            } : null)
                          }
                        }}
                      >
                        {showDataLabels && (
                          <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 ${isDark ? 'bg-gray-900/90 text-white' : 'bg-white/95 text-gray-800'} text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap opacity-0`}
                               style={{ animation: `fadeIn 300ms ease-out ${800 + index * 100}ms forwards` }}>
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
          
          <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} px-12`}>
            {sortedData.map((item, index) => (
              <span key={index} className="text-center max-w-28 truncate">
                {item.scenario}
              </span>
            ))}
          </div>
        </div>
      </>
    )
  }

  const renderPieChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

    return (
      <>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        <div className="flex items-center justify-center space-x-12">
          <div className="relative w-96 h-96">
            <svg viewBox="0 0 200 200" className="w-full h-full">
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
                  <path
                    key={index}
                    d={`M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={color}
                    className="transition-all duration-200 cursor-pointer"
                    style={{ 
                      transformOrigin: '100px 100px',
                      animation: `scaleIn 400ms ease-out ${index * 150}ms both`
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
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.filter = `brightness(1.15) drop-shadow(0 4px 12px ${color}60)`
                    }}
                    onMouseLeave={(e) => {
                      setTooltip(null)
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.filter = 'brightness(1)'
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip(prev => prev ? {
                          ...prev,
                          x: e.clientX,
                          y: e.clientY
                        } : null)
                      }
                    }}
                  />
                )
              })}
            </svg>
          </div>
          <div className="space-y-3">
            {config.data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center gap-3 group cursor-pointer opacity-0" 
                     style={{ animation: `fadeIn 300ms ease-out ${600 + index * 150}ms forwards` }}>
                  <div 
                    className="w-3 h-3 rounded transition-all duration-200 group-hover:scale-110" 
                    style={{ backgroundColor: colors[index % colors.length] }} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>
                        {item.scenario}
                      </span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-semibold`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs mt-0.5`}>
                      {formatNumber(item.value)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  const renderDonutChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

    return (
      <>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        <div className="flex items-center justify-center space-x-12">
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 grid grid-cols-1 grid-rows-1">
              {config.data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
                const color = colors[index % colors.length]
                const percentage = ((item.value / total) * 100).toFixed(1)
                
                // Calculate position for hover area
                const midAngle = startAngle + angle / 2
                const centerX = 50 + 25 * Math.cos(((midAngle - 90) * Math.PI) / 180)
                const centerY = 50 + 25 * Math.sin(((midAngle - 90) * Math.PI) / 180)
                
                return (
                  <div
                    key={`hover-${index}`}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${centerX - 10}%`,
                      top: `${centerY - 10}%`,
                      width: '20%',
                      height: '20%',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      console.log('Donut hover area entered:', item.scenario)
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
                      console.log('Donut hover area left')
                      setTooltip(null)
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip(prev => prev ? {
                          ...prev,
                          x: e.clientX,
                          y: e.clientY
                        } : null)
                      }
                    }}
                  />
                )
              })}
            </div>
            <svg viewBox="0 0 200 200" className="w-full h-full relative">
              {config.data.map((item, index) => {
                const angle = (item.value / total) * 360
                const startAngle = config.data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)
                const color = colors[index % colors.length]

                const outerRadius = 70
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
                    fill={color}
                    className="transition-all duration-200"
                    style={{ 
                      transformOrigin: '100px 100px',
                      animation: `scaleIn 400ms ease-out ${index * 150}ms both`,
                      pointerEvents: 'none'
                    }}
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center opacity-0" style={{ animation: `fadeIn 300ms ease-out ${config.data.length * 150 + 200}ms forwards` }}>
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(total)}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {config.data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center gap-3 group cursor-pointer opacity-0" 
                     style={{ animation: `fadeIn 300ms ease-out ${600 + index * 150}ms forwards` }}>
                  <div 
                    className="w-3 h-3 rounded transition-all duration-200 group-hover:scale-110" 
                    style={{ backgroundColor: colors[index % colors.length] }} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>
                        {item.scenario}
                      </span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-semibold`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs mt-0.5`}>
                      {formatNumber(item.value)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  const renderLineChart = () => {
    if (config.data.length === 0) return null

    const maxValue = Math.max(...config.data.map((d) => d.value))
    const minValue = Math.min(...config.data.map((d) => d.value))
    const range = maxValue - minValue || 1
    const colors = config.theme?.palette.colors || ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]
    const primaryColor = colors[0]

    const pathData = config.data
      .map((item, index) => {
        const x = config.data.length === 1 ? 300 : 60 + (index / (config.data.length - 1)) * 480
        const y = 60 + (1 - (item.value - minValue) / range) * 280
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

    const pathLength = config.data.length * 200 // Increased path length for larger chart

    return (
      <div className="space-y-10">
        <div className={`relative h-[500px] ${isDark ? 'bg-gray-800/10' : 'bg-gray-50/30'} rounded-xl p-16`}>
          <svg viewBox="0 0 600 400" className="w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {config.theme?.showGridLines !== false && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={i} x1="30" y1={30 + i * 50} x2="570" y2={30 + i * 50} stroke={isDark ? "#374151" : "#E5E7EB"} strokeWidth="0.5" opacity="0.3" />
            ))}

            <path
              d={`${pathData} L 540 340 L 60 340 Z`}
              fill="url(#lineGradient)"
              className="opacity-0"
              style={{ animation: 'fadeIn 500ms ease-out 400ms forwards' }}
            />

            <path
              d={pathData}
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              style={{ 
                animation: `drawLine 1000ms ease-out 200ms forwards`
              }}
            />

            <style jsx>{`
              @keyframes drawLine {
                to {
                  stroke-dashoffset: 0;
                }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes popIn {
                from { 
                  opacity: 0;
                  transform: scale(0);
                }
                to { 
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>

            {config.data.map((item, index) => {
              const x = config.data.length === 1 ? 300 : 60 + (index / (config.data.length - 1)) * 480
              const y = 60 + (1 - (item.value - minValue) / range) * 280
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={primaryColor}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer opacity-0"
                    style={{ 
                      animation: `popIn 300ms ease-out ${800 + index * 150}ms forwards`
                    }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        x: x * (400 / 400) + 20, // Adjust for SVG scaling
                        y: (y + 20) * (240 / 240) + 100, // Adjust for container position
                        label: item.scenario,
                        value: item.value,
                        color: primaryColor
                      })
                      e.currentTarget.setAttribute('r', '7')
                      e.currentTarget.style.filter = `brightness(1.2) drop-shadow(0 2px 8px ${primaryColor}60)`
                    }}
                    onMouseLeave={(e) => {
                      setTooltip(null)
                      e.currentTarget.setAttribute('r', '4')
                      e.currentTarget.style.filter = 'brightness(1)'
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip(prev => prev ? {
                          ...prev,
                          x: e.clientX,
                          y: e.clientY
                        } : null)
                      }
                    }}
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className={`${isDark ? 'fill-gray-300' : 'fill-gray-700'} text-xs font-medium opacity-0`}
                    style={{ animation: `fadeIn 300ms ease-out ${1000 + index * 150}ms forwards` }}
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
      <div className="space-y-10">
        <div className={`relative h-[500px] ${isDark ? 'bg-gray-800/10' : 'bg-gray-50/30'} rounded-xl p-16`}>
          <svg viewBox="0 0 600 400" className="w-full h-full">
            <defs>
              <linearGradient id="comboGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors[0]} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={colors[0]} stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {config.theme?.showGridLines !== false && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={i} x1="30" y1={30 + i * 50} x2="570" y2={30 + i * 50} stroke={isDark ? "#374151" : "#E5E7EB"} strokeWidth="0.5" opacity="0.3" />
            ))}

            {config.data.map((item, index) => {
              const barWidth = 32 // Match horizontal bar width (32px = w-8)
              const spacing = 480 / config.data.length
              const x = 60 + (index * spacing) + (spacing - barWidth) / 2
              const percentage = ((item.value - minValue) / range) * 100
              const height = (percentage / 100) * 280
              
              return (
                <rect
                  key={`bar-${index}`}
                  x={x}
                  y={340 - height}
                  width={barWidth}
                  height={height}
                  fill={colors[index % colors.length]}
                  opacity="0.7"
                  className="transition-all duration-200 ease-out cursor-pointer animate-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      label: item.scenario,
                      value: item.value,
                      color: colors[index % colors.length]
                    })
                    e.currentTarget.style.opacity = '0.9'
                    e.currentTarget.style.filter = 'brightness(1.15)'
                  }}
                  onMouseLeave={(e) => {
                    setTooltip(null)
                    e.currentTarget.style.opacity = '0.7'
                    e.currentTarget.style.filter = 'brightness(1)'
                  }}
                  onMouseMove={(e) => {
                    if (tooltip) {
                      setTooltip(prev => prev ? {
                        ...prev,
                        x: e.clientX,
                        y: e.clientY
                      } : null)
                    }
                  }}
                />
              )
            })}

            <path
              d={`${config.data
                .map((item, index) => {
                  const spacing = 480 / config.data.length
                  const x = 60 + (index * spacing) + (spacing / 2)
                  const y = 60 + (1 - (item.value - minValue) / range) * 280
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}`}
              fill="none"
              stroke={colors[0]}
              strokeWidth="3"
              className="transition-all duration-1000 animate-in hover:brightness-110"
              style={{ animationDelay: '600ms' }}
            />

            {config.data.map((item, index) => {
              const spacing = 480 / config.data.length
              const x = 60 + (index * spacing) + (spacing / 2)
              const y = 60 + (1 - (item.value - minValue) / range) * 280
              return (
                <g key={`point-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={isDark ? "#ffffff" : "#ffffff"}
                    stroke={colors[0]}
                    strokeWidth="2"
                    className="transition-all duration-200 cursor-pointer animate-in"
                    style={{ animationDelay: `${800 + index * 150}ms` }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        label: item.scenario,
                        value: item.value,
                        color: colors[0]
                      })
                      e.currentTarget.setAttribute('r', '7')
                      e.currentTarget.style.filter = `brightness(1.2) drop-shadow(0 2px 8px ${colors[0]}60)`
                    }}
                    onMouseLeave={(e) => {
                      setTooltip(null)
                      e.currentTarget.setAttribute('r', '5')
                      e.currentTarget.style.filter = 'brightness(1)'
                    }}
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip(prev => prev ? {
                          ...prev,
                          x: e.clientX,
                          y: e.clientY
                        } : null)
                      }
                    }}
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
    <div className="h-full flex flex-col bg-[#0d0d0d] relative">
      <Tooltip data={tooltip} formatNumber={formatNumber} />
      
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
