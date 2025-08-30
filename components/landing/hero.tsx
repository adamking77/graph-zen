"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, PieChart, TrendingUp } from "lucide-react"

export function Hero() {
  return (
    <section className="relative px-6 lg:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-8"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Professional Data Visualization
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-medium tracking-tight text-foreground sm:text-6xl mb-6"
            >
              Find Your Chart{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Zen
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              Create stunning charts and visualizations in minutes, not hours. Import from CSV, Excel, or paste data directly. Professional results, zero complexity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/" className="group">
                  Start Creating Charts
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Examples
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                No signup required
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Free to use
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Export ready
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-card rounded-2xl border border-border/50 p-8 shadow-2xl">
              {/* Mock Chart Preview */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Revenue Growth</h3>
                  <div className="flex space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <PieChart className="w-5 h-5 text-muted-foreground" />
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                
                {/* Mock Bar Chart */}
                <div className="space-y-3">
                  {[85, 70, 90, 65, 75].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ width: 0 }}
                      animate={{ width: `${height}%` }}
                      transition={{ duration: 1.2, delay: 0.6 + index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <span className="text-sm text-muted-foreground w-12">
                        Q{index + 1}
                      </span>
                      <div className="flex-1 bg-secondary/30 rounded-full h-8 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${height}%` }}
                        >
                          <span className="text-xs font-medium text-primary-foreground">
                            {height}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 bg-primary rounded-xl p-3 shadow-lg"
              >
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-4 -left-4 bg-secondary border border-border rounded-xl p-3 shadow-lg"
              >
                <PieChart className="w-6 h-6 text-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}