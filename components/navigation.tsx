"use client"

import { useState } from "react"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Upload,
  Palette,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavigationProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function Navigation({ activeSection = "chart", onSectionChange }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      id: "chart",
      label: "Chart Type",
      icon: BarChart3,
      description: "Choose your chart style"
    },
    {
      id: "data", 
      label: "Data",
      icon: Upload,
      description: "Import and manage data"
    },
    {
      id: "design",
      label: "Design",
      icon: Palette,
      description: "Colors and styling"
    },
    {
      id: "layout",
      label: "Layout",
      icon: Layers,
      description: "Size and positioning"
    },
    {
      id: "export",
      label: "Export",
      icon: Download,
      description: "Download your chart"
    }
  ]

  return (
    <nav 
      className={cn(
        "h-full gradient-navy border-r border-premium transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-premium">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-foreground font-semibold text-fluid-lg">GraphZen</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground transition-premium p-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange?.(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-premium group relative",
                "hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none",
                isActive && "bg-primary/10 border border-primary/20"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              
              <Icon 
                className={cn(
                  "w-5 h-5 transition-premium",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className={cn(
                    "text-sm font-medium transition-premium",
                    isActive ? "text-primary" : "text-foreground group-hover:text-foreground"
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-premium rounded-md shadow-premium-lg opacity-0 group-hover:opacity-100 transition-premium pointer-events-none z-50 min-w-max">
                  <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-premium">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg transition-premium hover:bg-secondary/50 group">
          <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          {!isCollapsed && (
            <span className="text-sm text-muted-foreground group-hover:text-foreground">
              Settings
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}