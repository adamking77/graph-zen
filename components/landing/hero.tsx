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
            {/* Main Interface Display */}
            <div className="relative">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative rounded-2xl shadow-2xl overflow-hidden"
              >
                <Image 
                  src="/landing/ui/ui-full-interface.png" 
                  alt="GraphZen Complete Interface"
                  width={800}
                  height={550}
                  className="w-full h-auto object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Floating Chart Previews with Scroll Parallax */}

            {/* Bottom Left - Market Share Chart */}
            <motion.div
              animate={{
                y: [0, 4, 0],
                rotate: [0, -0.5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
              className="absolute -bottom-8 -left-8 shadow-lg rounded-lg overflow-hidden hidden sm:block"
              style={{ willChange: "transform" }}
            >
              <Image 
                src="/landing/charts/market-share-donut.png" 
                alt="Market Share Chart Preview"
                width={140}
                height={95}
                className="w-35 h-24 object-cover"
              />
            </motion.div>

            {/* Top Left - Sales Vertical Bar */}
            <motion.div
              animate={{
                y: [0, -6, 0],
                rotate: [0, 0.3, 0]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
              className="absolute -top-4 -left-12 shadow-lg rounded-lg overflow-hidden hidden lg:block"
              style={{ willChange: "transform" }}
            >
              <Image 
                src="/landing/charts/sales-vertical-bar.png" 
                alt="Sales Chart Preview"
                width={120}
                height={80}
                className="w-30 h-20 object-cover"
              />
            </motion.div>


            {/* Bottom Right - Line Chart */}
            <motion.div
              animate={{
                y: [0, 8, 0],
                rotate: [0, -0.4, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3
              }}
              className="absolute -bottom-4 -right-12 shadow-lg rounded-lg overflow-hidden hidden lg:block"
              style={{ willChange: "transform" }}
            >
              <Image 
                src="/landing/charts/revenue-growth-line.png" 
                alt="Revenue Growth Chart Preview"
                width={120}
                height={80}
                className="w-30 h-20 object-cover"
              />
            </motion.div>


          </motion.div>
        </div>
      </div>
    </section>
  )
}