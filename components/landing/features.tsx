"use client"

import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, Activity, Download, Palette, AlignLeft, CircleDot, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const chartTypes = [
  {
    icon: BarChart3,
    title: "Bar Charts",
    description: "Perfect for comparing categories and showing data relationships clearly.",
    preview: (
      <div className="flex justify-center h-full">
        <Image 
          src="/landing/charts/sales-vertical-bar.png" 
          alt="Sales Performance Chart"
          width={200}
          height={120}
          className="w-full h-full object-contain"
        />
      </div>
    )
  },
  {
    icon: PieChart,
    title: "Pie & Donut Charts",
    description: "Visualize proportions and percentages with elegant circular charts.",
    preview: (
      <div className="flex justify-center h-full">
        <Image 
          src="/landing/charts/market-share-donut.png" 
          alt="Market Share Chart"
          width={200}
          height={120}
          className="w-full h-full object-contain"
        />
      </div>
    )
  },
  {
    icon: TrendingUp,
    title: "Line Charts",
    description: "Track trends and changes over time with smooth, professional lines.",
    preview: (
      <div className="flex justify-center h-full">
        <Image 
          src="/landing/charts/revenue-growth-line.png" 
          alt="Revenue Growth Line Chart"
          width={200}
          height={120}
          className="w-full h-full object-contain"
        />
      </div>
    )
  },
  {
    icon: Activity,
    title: "Combo Charts",
    description: "Combine multiple chart types for comprehensive data storytelling.",
    preview: (
      <div className="flex justify-center h-full">
        <Image 
          src="/landing/charts/sales-satisfaction-combo.png" 
          alt="Sales & Satisfaction Combo Chart"
          width={200}
          height={120}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }
]

const features = [
  {
    icon: Download,
    title: "Multiple Data Sources",
    description: "Import from CSV, Excel, or paste data directly. No complex setup required."
  },
  {
    icon: Palette,
    title: "Beautiful Themes",
    description: "Professional color palettes and styling options for any presentation."
  },
  {
    icon: BarChart3,
    title: "Export Ready",
    description: "Download as PNG, SVG, or embed anywhere. Perfect for reports, presentations, and websites."
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your data never leaves your browser. No uploads, no servers, no privacy concerns."
  }
]

export function Features() {
  return (
    <section className="px-6 lg:px-8 py-24 bg-secondary/5">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl mb-4">
            Every Chart Type You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From simple bar charts to complex multi-series visualizations, create professional charts that tell your data's story.
          </p>
        </motion.div>

        {/* Chart Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
          {chartTypes.map((chart, index) => (
            <motion.div
              key={chart.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <chart.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-medium text-lg">{chart.title}</h3>
                  </div>
                  
                  <div className="flex-1 mb-6 h-40 flex items-center">
                    {chart.preview}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-auto">{chart.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}