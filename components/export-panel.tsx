"use client"

import { useState } from "react"
import type { ChartConfig } from "@/types/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Download, Copy, Code, Link, Share, Check, Clipboard } from "lucide-react"

interface ExportPanelProps {
  config: ChartConfig
  onClose: () => void
}

export function ExportPanel({ config, onClose }: ExportPanelProps) {
  const [activeTab, setActiveTab] = useState<"png" | "svg" | "embed" | "link">("png")
  const [copiedEmbedCode, setCopiedEmbedCode] = useState(false)
  const [copiedShareableLink, setCopiedShareableLink] = useState(false)
  const [copiedEmbedLink, setCopiedEmbedLink] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [exportQuality, setExportQuality] = useState("2x")
  const [isExporting, setIsExporting] = useState(false)

  const generateEmbedCode = () => {
    const embedUrl = generateEmbedLink()
    const dimensions = config.dimensions || { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' }
    return `<div style="position: relative; width: 100%; max-width: ${dimensions.width}px; aspect-ratio: ${dimensions.width}/${dimensions.height};">
  <iframe 
    src="${embedUrl}"
    width="100%" 
    height="100%" 
    frameborder="0" 
    style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: absolute; top: 0; left: 0;"
    title="${config.title} - Created with Chart Maker">
  </iframe>
</div>`
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

  const copyToClipboard = async (text: string, type: 'embedCode' | 'shareableLink' | 'embedLink') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'embedCode') {
        setCopiedEmbedCode(true)
        setTimeout(() => setCopiedEmbedCode(false), 2000)
      } else if (type === 'shareableLink') {
        setCopiedShareableLink(true)
        setTimeout(() => setCopiedShareableLink(false), 2000)
      } else if (type === 'embedLink') {
        setCopiedEmbedLink(true)
        setTimeout(() => setCopiedEmbedLink(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadAsImage = async (format: "png" | "svg") => {
    setIsExporting(true)
    try {
      // Get the chart element
      const chartElement = document.querySelector('[data-chart-container]') as HTMLElement
      if (!chartElement) {
        alert('Chart not found. Please try again.')
        return
      }

      const quality = exportQuality === "1x" ? 1 : exportQuality === "2x" ? 2 : 3
      
      if (format === "png") {
        // For PNG, we'll need to implement actual image conversion
        // For now, showing the quality would be applied
        alert(`Download PNG at ${quality}x quality would be implemented here`)
      } else {
        // For SVG, quality doesn't matter as much since it's vector
        alert(`Download SVG would be implemented here`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const copyImageToClipboard = async () => {
    setIsExporting(true)
    try {
      // This would implement actual image-to-clipboard functionality
      // For now, showing the concept
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing
      
      setCopiedImage(true)
      setTimeout(() => setCopiedImage(false), 2000)
      
      // In real implementation, would copy actual image data
      alert('Copy to clipboard would be implemented here')
    } catch (error) {
      console.error('Copy failed:', error)
      alert('Copy to clipboard failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-card border-border w-full max-w-2xl max-h-[700px] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground font-satoshi font-medium text-fluid-lg">Export Chart</CardTitle>
          <Button
            onClick={onClose}
            size="sm"
            variant="outline"
            className="bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-1 bg-secondary/30 rounded-lg p-1">
            {(["png", "svg", "embed", "link"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border font-satoshi ${
                  activeTab === tab ? "bg-primary/10 border-transparent text-primary" : "bg-transparent border-transparent text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {tab === "link" ? "SHARE" : tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === "png" && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 font-satoshi">Export Quality</label>
                  <Select value={exportQuality} onValueChange={setExportQuality}>
                    <SelectTrigger className="w-full bg-input border-border text-foreground font-satoshi">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1x" className="text-foreground hover:bg-secondary/20 font-satoshi">Standard (1x)</SelectItem>
                      <SelectItem value="2x" className="text-foreground hover:bg-secondary/20 font-satoshi">High Quality (2x)</SelectItem>
                      <SelectItem value="3x" className="text-foreground hover:bg-secondary/20 font-satoshi">Ultra HD (3x)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1 font-satoshi">Higher quality creates larger file sizes</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-secondary/30 border border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Download className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4 font-satoshi">Download your chart as a high-quality PNG image</p>
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => downloadAsImage("png")} 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi"
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PNG
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={copyImageToClipboard}
                      variant="outline"
                      className="bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground font-satoshi"
                      disabled={isExporting}
                    >
                      {copiedImage ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "svg" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-secondary/30 border border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Code className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4 font-satoshi">Download your chart as a scalable SVG vector</p>
                
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => downloadAsImage("svg")} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download SVG
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={copyImageToClipboard}
                    variant="outline"
                    className="bg-transparent border-border/40 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground font-satoshi"
                    disabled={isExporting}
                  >
                    {copiedImage ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "embed" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-satoshi">Embed Code</label>
                <div className="relative">
                  <textarea
                    value={generateEmbedCode()}
                    readOnly
                    className="w-full h-40 bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm font-mono resize-none font-satoshi"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateEmbedCode(), 'embedCode')}
                    size="sm"
                    className="absolute top-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copiedEmbedCode ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "link" && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-satoshi">Shareable Link</label>
                <div className="relative">
                  <input
                    value={generateShareableLink()}
                    readOnly
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm pr-20 font-satoshi"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateShareableLink(), 'shareableLink')}
                    size="sm"
                    className="absolute top-1 right-1 bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copiedShareableLink ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-satoshi">Embed Link</label>
                <div className="relative">
                  <input
                    value={generateEmbedLink()}
                    readOnly
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm pr-20 font-satoshi"
                  />
                  <Button
                    onClick={() => copyToClipboard(generateEmbedLink(), 'embedLink')}
                    size="sm"
                    className="absolute top-1 right-1 bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copiedEmbedLink ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground font-satoshi">
              <span>Chart: {config.title}</span>
              <span>{config.data.length} data points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
