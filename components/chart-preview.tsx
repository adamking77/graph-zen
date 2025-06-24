"use client"

import { useRef } from "react"
import type { ChartConfig } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"

interface ChartPreviewProps {
  config: ChartConfig
}

export function ChartPreview({ config }: ChartPreviewProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k"
    }
    return value.toString()
  }

  const renderCustomBarChart = () => {
    if (config.data.length === 0) return null

    const maxValue = Math.max(...config.data.map((d) => d.value))

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-400 mb-6">Scenario</div>
        {config.data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100

          return (
            <div key={index} className="flex items-center gap-6">
              <div className="w-44 text-right">
                <span className="text-white text-sm font-medium">{item.scenario}</span>
              </div>
              <div className="flex-1 relative">
                <div className="h-10 bg-gray-800/30 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-4 relative"
                    style={{
                      width: `${percentage}%`,
                      minWidth: percentage > 0 ? "80px" : "0px",
                    }}
                  >
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      {formatNumber(item.value)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* X-axis labels */}
        <div className="flex items-center gap-6 mt-8">
          <div className="w-44"></div>
          <div className="flex-1 flex justify-between text-xs text-gray-400 px-2">
            <span>0</span>
            <span>{formatNumber(maxValue * 0.2)}</span>
            <span>{formatNumber(maxValue * 0.4)}</span>
            <span>{formatNumber(maxValue * 0.6)}</span>
            <span>{formatNumber(maxValue * 0.8)}</span>
            <span>{formatNumber(maxValue)}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-44"></div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-400">Revenue (€)</span>
          </div>
        </div>
      </div>
    )
  }

  const renderSimplePieChart = () => {
    if (config.data.length === 0) return null

    const total = config.data.reduce((sum, item) => sum + item.value, 0)
    const colors = ["#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"]

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
        <div className="space-y-4">
          {config.data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-white text-sm font-medium">
                {item.scenario}: {formatNumber(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSimpleLineChart = () => {
    if (config.data.length === 0) return null

    const maxValue = Math.max(...config.data.map((d) => d.value))
    const minValue = Math.min(...config.data.map((d) => d.value))
    const range = maxValue - minValue

    return (
      <div className="space-y-6">
        <div className="relative h-64 bg-gray-800/20 rounded-lg p-6">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#374151" strokeWidth="1" opacity="0.3" />
            ))}

            {/* Line path */}
            <path
              d={`M ${config.data
                .map((item, index) => {
                  const x = (index / (config.data.length - 1)) * 400
                  const y = 200 - ((item.value - minValue) / range) * 200
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`
                })
                .join(" ")}`}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              className="transition-all duration-1000"
            />

            {/* Data points */}
            {config.data.map((item, index) => {
              const x = (index / (config.data.length - 1)) * 400
              const y = 200 - ((item.value - minValue) / range) * 200
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-500 hover:r-8"
                />
              )
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-400 px-6">
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
      case "bar":
        return renderCustomBarChart()
      case "line":
        return renderSimpleLineChart()
      case "pie":
        return renderSimplePieChart()
      default:
        return <div className="text-white">Unknown chart type</div>
    }
  }

  return (
    <div className="sticky top-24">
      <Card className="bg-black border-gray-800/50 overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div ref={chartRef} className="bg-black p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
              <p className="text-gray-400 text-sm">{config.subtitle}</p>
            </div>

            <div className="py-8">
              {config.data.length > 0 ? (
                renderChart()
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No data to display</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between items-center text-xs text-gray-500">
              <span>⚡ Made with Chart Generator</span>
              <span>{config.data.length} data points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
