"use client"

import { useState } from "react"
import { 
  BarChart3, 
  Upload,
  Palette,
  Settings,
  Download,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Zone1NavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  onExportClick: () => void
  isMobile?: boolean
  onClose?: () => void
  isHorizontal?: boolean
}

export function Zone1Navigation({ 
  activeSection, 
  onSectionChange, 
  onExportClick, 
  isMobile = false, 
  onClose, 
  isHorizontal = false 
}: Zone1NavigationProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const navigationItems = [
    {
      id: "essentials",
      label: "Essentials",
      icon: BarChart3,
      description: "Chart type, title, and data formatting"
    },
    {
      id: "data", 
      label: "Data",
      icon: Upload,
      description: "Import and manage data"
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Colors and visual styling"
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: Settings,
      description: "Import options and settings"
    }
  ]

  if (isHorizontal) {
    return (
      <nav className="h-full bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 280 280" className="text-foreground">
              <path fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" d="M 233 140.5 C 233 88.861374 191.138626 47 139.5 47 C 87.861374 47 46 88.861374 46 140.5 C 46 192.138626 87.861374 234 139.5 234 C 191.138626 234 233 192.138626 233 140.5 Z"/>
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M 223 139.999969 L 11.000009 139.998459"/>
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M 266 140.000061 L 240 139.999954"/>
            </svg>
          </div>
          <span className="text-foreground font-medium text-lg">GraphZen</span>
        </div>
        
        <div className="flex items-center gap-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={onExportClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </nav>
    )
  }

  return (
    <nav 
      className={`h-full bg-card/95 shadow-[inset_-1px_0_2px_rgba(0,0,0,0.12)] transition-all duration-200 ease-in-out flex flex-col ${
        isMobile ? 'w-full' : isExpanded ? 'zone1-expanded' : 'zone1-collapsed'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {(isExpanded || isMobile) && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 280 280" className="text-foreground">
                <path fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" d="M 233 140.5 C 233 88.861374 191.138626 47 139.5 47 C 87.861374 47 46 88.861374 46 140.5 C 46 192.138626 87.861374 234 139.5 234 C 191.138626 234 233 192.138626 233 140.5 Z"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M 223 139.999969 L 11.000009 139.998459"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M 266 140.000061 L 240 139.999954"/>
              </svg>
            </div>
            <span className="text-foreground font-medium text-lg">GraphZen</span>
          </div>
        )}
        {isMobile && onClose ? (
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 relative group",
                "bg-transparent border border-transparent hover:bg-primary/5 hover:border-primary/30 hover:text-foreground hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] focus:outline-none active:shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
                isActive && "bg-primary/10 border-transparent text-primary"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              
              {(isExpanded || isMobile) && (
                <div className="flex-1 text-left">
                  <div className={cn(
                    "text-sm font-medium transition-all duration-200",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              )}
              
              {/* Tooltip for collapsed state - not needed on mobile */}
              {!isExpanded && !isMobile && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 min-w-max">
                  <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Export Button */}
      <div className={`${isExpanded || isMobile ? 'p-4' : 'p-2'}`}>
        <button
          onClick={onExportClick}
          className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card flex items-center justify-center gap-2 ${
            isExpanded || isMobile ? 'px-4 py-3' : 'px-2 py-2'
          }`}
        >
          <Download className="w-4 h-4" />
          {(isExpanded || isMobile) && <span>Export Chart</span>}
        </button>
      </div>
    </nav>
  )
}