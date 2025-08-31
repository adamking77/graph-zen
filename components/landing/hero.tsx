"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, PieChart, TrendingUp, Activity } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative px-6 lg:px-8 py-32 sm:py-40 overflow-hidden">
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
              className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-8"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Simple, Secure, Sophisticated Data Visualization
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
              Create stunning charts and visualizations in minutes, not hours. Import from CSV, Excel, or paste data directly. Professional results, complete privacy, zero complexity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="text-lg px-8 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
                <Link href="/" className="group">
                  Start Creating Charts
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
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
            {/* Main Interface Display */}
            <div className="relative bg-card/30 rounded-2xl border border-border/20 shadow-2xl overflow-hidden">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Image 
                  src="/landing/ui/ui-full-interface.png" 
                  alt="GraphZen Complete Interface"
                  width={600}
                  height={400}
                  className="w-full h-full object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Floating Chart Previews */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -right-6 bg-card/40 rounded-xl border border-border/20 shadow-lg overflow-hidden p-2"
            >
              <Image 
                src="/landing/charts/performance-horizontal-bar.png" 
                alt="Performance Chart Preview"
                width={120}
                height={80}
                className="w-30 h-20 object-cover"
              />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 12, 0],
                rotate: [0, -1, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2
              }}
              className="absolute -bottom-6 -left-6 bg-card/40 rounded-xl border border-border/20 shadow-lg overflow-hidden p-2"
            >
              <Image 
                src="/landing/charts/market-share-donut.png" 
                alt="Market Share Chart Preview"
                width={120}
                height={80}
                className="w-30 h-20 object-cover"
              />
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{
                y: [0, -5, 0],
                x: [0, 2, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute top-1/2 -right-4 bg-primary rounded-full p-3 shadow-lg"
            >
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 8, 0],
                x: [0, -2, 0]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-1/4 -left-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 shadow-lg"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}