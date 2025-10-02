"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, BarChart3, Shield } from "lucide-react"
import { getAppUrl } from "@/lib/utils"

export function CallToAction() {
  return (
    <section className="px-6 lg:px-8 py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20" />
      
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ready to Get Started?
            </motion.div>
            
            <h2 className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl mb-6">
              Start Creating Beautiful Charts{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Right Now
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No account needed, no setup required. Just paste your data and get professional results instantly.
            </p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="text-lg px-8 py-6 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group">
              <Link href={getAppUrl()} className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Open GraphZen
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-8 justify-center items-center pt-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center hover:text-foreground hover:scale-105 transition-all duration-200 cursor-default">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              Data Never Uploaded
            </div>
            <div className="flex items-center hover:text-foreground hover:scale-105 transition-all duration-200 cursor-default">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              100% Free Forever
            </div>
            <div className="flex items-center hover:text-foreground hover:scale-105 transition-all duration-200 cursor-default">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              No Registration
            </div>
            <div className="flex items-center hover:text-foreground hover:scale-105 transition-all duration-200 cursor-default">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Works Offline
            </div>
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}