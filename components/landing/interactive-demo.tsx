"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, BarChart3, PieChart, TrendingUp, Palette, Download } from "lucide-react"
import Link from "next/link"

const demoSteps = [
  {
    title: "Import Your Data",
    description: "Paste data, upload CSV, or connect to Excel files",
    icon: Download,
    preview: (
      <div className="space-y-2 text-left">
        <div className="text-xs text-muted-foreground font-mono bg-secondary/50 p-2 rounded">
          Product,Sales,Growth<br/>
          Widget A,25000,12%<br/>
          Widget B,18000,8%<br/>
          Widget C,32000,15%
        </div>
      </div>
    )
  },
  {
    title: "Choose Your Style",
    description: "Select chart type and customize colors",
    icon: Palette,
    preview: (
      <div className="flex space-x-2 justify-center">
        <div className="p-2 bg-blue-500 rounded text-white">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div className="p-2 bg-secondary rounded">
          <PieChart className="w-4 h-4" />
        </div>
        <div className="p-2 bg-secondary rounded">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    )
  },
  {
    title: "Get Perfect Results",
    description: "Professional charts ready for any presentation",
    icon: BarChart3,
    preview: (
      <div className="space-y-1">
        {["Widget A", "Widget B", "Widget C"].map((label, index) => {
          const values = [78, 56, 100]
          return (
            <div key={label} className="flex items-center space-x-2">
              <span className="text-xs w-16 text-left">{label}</span>
              <div className="flex-1 bg-secondary/30 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${values[index]}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }
]

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playDemo = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(interval)
          setIsPlaying(false)
          return 0
        }
        return prev + 1
      })
    }, 2000)
  }

  return (
    <section className="px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Interactive Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl mb-4">
                See It In Action
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Watch how easy it is to create professional charts in just three simple steps.
              </p>
              
              <Button 
                onClick={playDemo}
                disabled={isPlaying}
                size="lg"
                className="group"
              >
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {isPlaying ? "Playing Demo..." : "Play Demo"}
              </Button>
            </div>

            <div className="space-y-6">
              {demoSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: currentStep >= index ? 1 : 0.5,
                    scale: currentStep === index ? 1.02 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    setCurrentStep(index)
                    setIsPlaying(false) // Stop auto-play when user clicks
                  }}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 ${
                    currentStep >= index 
                      ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10' 
                      : 'bg-secondary/20 hover:bg-secondary/30'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    currentStep >= index ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{step.title}</h3>
                      {currentStep > index && (
                        <Badge variant="secondary" className="text-xs">
                          Complete
                        </Badge>
                      )}
                      {currentStep === index && (
                        <Badge className="text-xs animate-pulse">
                          Active
                        </Badge>
                      )}
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
            className="relative"
          >
            <Card className="bg-card border-border/50 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Live Preview</h3>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="min-h-[300px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
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
              <p className="text-muted-foreground mb-4">
                Ready to create your own charts?
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/">
                  Try It Now - It's Free
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}