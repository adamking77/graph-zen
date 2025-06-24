"use client"

import { useState } from "react"
import type { ChartConfig } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Download, Copy, Code, Link, Share } from "lucide-react"

interface ExportPanelProps {
  config: ChartConfig
  onClose: () => void
}

export function ExportPanel({ config, onClose }: ExportPanelProps) {
  const [activeTab, setActiveTab] = useState<"png" | "svg" | "embed" | "link">("png")
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    const embedUrl = generateEmbedLink()
    return `<iframe 
  src="${embedUrl}"
  width="800" 
  height="600" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  title="${config.title} - Created with GraphZen">
</iframe>`
  }

  const getBaseUrl = () => {
    // Use environment variable in production, localhost in development
    return process.env.NEXT_PUBLIC_BASE_URL || 
           (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  }

  const generateEmbedLink = () => {
    try {
      const encodedConfig = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      return `${getBaseUrl()}?embed=true&config=${encodedConfig}`
    } catch (error) {
      console.warn('Failed to encode config for embed link:', error)
      return `${getBaseUrl()}?embed=true&error=encoding`
    }
  }

  const generateShareableLink = () => {
    try {
      const encodedConfig = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      return `${getBaseUrl()}?config=${encodedConfig}`
    } catch (error) {
      console.warn('Failed to encode config for shareable link:', error)
      return `${getBaseUrl()}?error=encoding`
    }
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
            {(["png", "svg", "embed", "link"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-600"
                }`}
              >
                {tab === "link" ? "SHARE" : tab.toUpperCase()}
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

          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Shareable Link</label>
                <div className="relative">
                  <input
                    value={generateShareableLink()}
                    readOnly
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm pr-20"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateShareableLink())}
                    size="sm"
                    className="absolute top-1 right-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Embed Link</label>
                <div className="relative">
                  <input
                    value={generateEmbedLink()}
                    readOnly
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm pr-20"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateEmbedLink())}
                    size="sm"
                    className="absolute top-1 right-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share className="w-4 h-4 text-purple-400" />
                    <h4 className="text-white font-medium">Shareable Link</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Direct link to view and edit the chart</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="w-4 h-4 text-purple-400" />
                    <h4 className="text-white font-medium">Embed Link</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Direct link for embedding in iframes</p>
                </div>
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
