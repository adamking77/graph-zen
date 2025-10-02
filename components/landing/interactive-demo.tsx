"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, Activity, Palette, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getAppUrl } from "@/lib/utils"

// Chart pool for the interactive grid - using colorful GraphZen screenshots
const chartPool = [
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_33_PM.png",
    alt: "Colorful Analytics Dashboard", 
    type: "Analytics Dashboard"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_27_PM.png",
    alt: "Business Performance Chart",
    type: "Performance Chart"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_35_PM.png", 
    alt: "Data Visualization Chart",
    type: "Data Visualization"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_31_PM.png",
    alt: "Sales Metrics Chart",
    type: "Sales Metrics"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_36_PM.png",
    alt: "Marketing Analytics Chart", 
    type: "Marketing Analytics"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_28_PM.png",
    alt: "Financial Report Chart", 
    type: "Financial Report"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_38_PM.png",
    alt: "KPI Dashboard Chart", 
    type: "KPI Dashboard"
  },
  {
    src: "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_32_PM.png",
    alt: "Growth Analysis Chart", 
    type: "Growth Analysis"
  }
]

// Interactive Chart Grid Component
function InteractiveChartGrid() {
  const [displayedCharts, setDisplayedCharts] = useState([0, 1, 2, 3]) // Initial 4 charts
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    if (isHovered) return // Pause rotation when hovered
    
    const interval = setInterval(() => {
      setDisplayedCharts(prev => {
        const newCharts = [...prev]
        const randomPosition = Math.floor(Math.random() * 4) // Random grid position
        const availableCharts = chartPool.map((_, idx) => idx).filter(idx => !prev.includes(idx))
        
        if (availableCharts.length > 0) {
          const randomChart = availableCharts[Math.floor(Math.random() * availableCharts.length)]
          newCharts[randomPosition] = randomChart
        }
        
        return newCharts
      })
    }, 4500) // Rotate every 4.5 seconds
    
    return () => clearInterval(interval)
  }, [isHovered])
  
  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-2 gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayedCharts.map((chartIndex, position) => (
        <motion.div
          key={`${position}-${chartIndex}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative group cursor-pointer overflow-hidden rounded-lg bg-card/20 border border-border/30"
          whileHover={{ 
            scale: 1.12, 
            y: -8,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          whileTap={{ scale: 1.08 }}
        >
          <Image
            src={chartPool[chartIndex].src}
            alt={chartPool[chartIndex].alt}
            width={140}
            height={120}
            className="w-full h-full object-cover"
          />
          
          {/* Chart Type Badge on Hover */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-xs text-white font-semibold tracking-wide">
              {chartPool[chartIndex].type}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const demoSteps = [
  {
    title: "Import Your Data",
    description: "Paste data, upload CSV, or connect to Excel files - all processed locally in your browser",
    icon: Download,
    preview: (
      <div className="relative bg-card/20 rounded-lg border border-border/30 overflow-hidden max-w-sm mx-auto">
        <Image 
          src="/landing/ui/ui-data-panel.png" 
          alt="Data Import Interface"
          width={300}
          height={500}
          className="w-full h-[500px] object-cover object-top"
        />
      </div>
    )
  },
  {
    title: "Choose Your Style",
    description: "Select chart type and customize colors",
    icon: Palette,
    preview: (
      <div className="grid grid-cols-2 gap-4">
        <div className="relative bg-card/20 rounded-lg border border-border/30 overflow-hidden">
          <Image 
            src="/landing/ui/ui-essentials-panel.png" 
            alt="Chart Type Selection Interface"
            width={280}
            height={200}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="relative bg-card/20 rounded-lg border border-border/30 overflow-hidden">
          <Image 
            src="/landing/ui/ui-appearance-panel.png" 
            alt="Color Palette Selection Interface"
            width={280}
            height={200}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    )
  },
  {
    title: "Get Perfect Results",
    description: "Professional charts ready for any presentation",
    icon: Activity,
    preview: <InteractiveChartGrid />
  }
]

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <section className="px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Interactive Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Create professional charts in just three simple steps.
              </p>
            </div>

            <div className="space-y-6">
              {demoSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: currentStep >= index ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                    currentStep >= index 
                      ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/30' 
                      : 'bg-secondary/20 hover:bg-secondary/30 hover:border-border/50'
                  }`}
                >
                  <div className={`p-2 rounded-full transition-all duration-200 ${
                    currentStep === index 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : currentStep > index 
                      ? 'bg-secondary text-primary' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-1">
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative lg:sticky lg:top-24"
          >
            <Card className="bg-card border-none shadow-2xl">
              <CardContent className="p-6">
                <div className="min-h-[300px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full"
                    >
                      {demoSteps[currentStep].preview}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {demoSteps.length}
                  </span>
                  
                  <div className="flex space-x-2">
                    {demoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index <= currentStep ? 'bg-primary' : 'bg-secondary'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <p className="text-lg font-medium text-foreground mb-4">
                Ready to create your own charts?
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-6 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group">
                <Link href={getAppUrl()} className="flex items-center">
                  Start Creating Now
                  <BarChart3 className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}