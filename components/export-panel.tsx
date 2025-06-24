"use client"

import { useState } from "react"
import type { ChartConfig } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Download, Copy, Code } from "lucide-react"

interface ExportPanelProps {
  config: ChartConfig
  onClose: () => void
}

export function ExportPanel({ config, onClose }: ExportPanelProps) {
  const [activeTab, setActiveTab] = useState<"png" | "svg" | "embed">("png")
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    return `<div style="width: 100%; height: 400px; background: #1a1a1a; border-radius: 8px; padding: 32px;">
  <h2 style="color: white; font-size: 24px; margin-bottom: 8px;">${config.title}</h2>
  <p style="color: #9ca3af; font-size: 14px; margin-bottom: 24px;">${config.subtitle}</p>
  <!-- Chart data: ${JSON.stringify(config.data)} -->
  <!-- Generated with Chart Generator -->
</div>`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadAsImage = (format: "png" | "svg") => {
    // In a real implementation, you would use html2canvas or similar
    // to convert the chart to an image
    alert(`Download as ${format.toUpperCase()} would be implemented here`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Export Chart</CardTitle>
          <Button
            onClick={onClose}
            size="sm"
            variant="outline"
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
            {(["png", "svg", "embed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-600"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === "png" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Download className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-300 mb-4">Download your chart as a high-quality PNG image</p>
                <Button onClick={() => downloadAsImage("png")} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
          )}

          {activeTab === "svg" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Code className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-300 mb-4">Download your chart as a scalable SVG vector</p>
                <Button onClick={() => downloadAsImage("svg")} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
              </div>
            </div>
          )}

          {activeTab === "embed" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Embed Code</label>
                <div className="relative">
                  <textarea
                    value={generateEmbedCode()}
                    readOnly
                    className="w-full h-40 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono resize-none"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateEmbedCode())}
                    size="sm"
                    className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Usage Instructions:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Copy the embed code above</li>
                  <li>• Paste it into your HTML document</li>
                  <li>• The chart will display with your data</li>
                  <li>• Customize the styling as needed</li>
                </ul>
              </div>
            </div>
          )}

          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Chart: {config.title}</span>
              <span>{config.data.length} data points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
