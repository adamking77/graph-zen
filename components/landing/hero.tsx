"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp } from "lucide-react"
import Image from "next/image"

// Chart images for mosaic grid
const mosaicCharts = [
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_33_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_27_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_35_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_31_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_36_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_28_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_38_PM.png",
  "/landing/charts/GraphZen-Find-Your-Chart-Zen-09-08-2025_09_32_PM.png",
  "/landing/charts/market-share-donut.png",
]

export function Hero() {
  return (
    <section className="relative px-8 sm:px-12 lg:px-16 py-32 sm:py-40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20" />
      
      <div className="relative mx-auto max-w-7xl z-10">
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
              className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Simple, Secure, Sophisticated Data Visualization
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-medium tracking-tight text-foreground sm:text-6xl mb-8"
            >
              Find Your Graph{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Zen
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 lg:mb-10 max-w-2xl"
            >
              Create stunning charts and visualizations in minutes, not hours. Import from CSV, Excel, or paste data directly. Professional results, complete privacy, zero complexity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center lg:justify-start mb-8 lg:mb-10"
            >
              <Button asChild size="lg" className="text-lg px-8 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                <Link href="/" className="group">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 lg:mt-12 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="flex items-center hover:text-foreground transition-colors duration-200 cursor-default">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                No signup required
              </div>
              <div className="flex items-center hover:text-foreground transition-colors duration-200 cursor-default">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Free to use
              </div>
              <div className="flex items-center hover:text-foreground transition-colors duration-200 cursor-default">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Your data stays private
              </div>
              <div className="flex items-center hover:text-foreground transition-colors duration-200 cursor-default">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Export ready
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Chart Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Mosaic Grid - Desktop/Tablet Only */}
            <div className="hidden lg:grid grid-cols-3 gap-3 p-4">
              {mosaicCharts.map((chart, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                  whileHover={{ y: -5 }}
                >
                  <Image
                    src={chart}
                    alt={`Chart example ${index + 1}`}
                    width={250}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>

            {/* Mobile: Interface Image */}
            <div className="lg:hidden rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src="/landing/ui/ui-full-interface.png"
                alt="GraphZen Complete Interface"
                width={800}
                height={550}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}