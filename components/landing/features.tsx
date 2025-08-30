"use client"

import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, BarChart, Download, Palette } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const chartTypes = [
  {
    icon: BarChart3,
    title: "Bar Charts",
    description: "Perfect for comparing categories and showing data relationships clearly.",
    preview: (
      <div className="space-y-2">
        {[60, 80, 45, 90].map((height, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-8 text-xs text-muted-foreground">Q{index + 1}</div>
            <div className="flex-1 bg-secondary/30 rounded-sm h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${height}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-sm"
              />
            </div>
          </div>
        ))}
      </div>
    ),
    color: "from-blue-500 to-blue-400"
  },
  {
    icon: PieChart,
    title: "Pie & Donut Charts",
    description: "Visualize proportions and percentages with elegant circular charts.",
    preview: (
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          <motion.svg
            className="w-24 h-24 transform -rotate-90"
            viewBox="0 0 36 36"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="40, 100"
              className="text-green-500"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="30, 100"
              strokeDashoffset="-40"
              className="text-purple-500"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="30, 100"
              strokeDashoffset="-70"
              className="text-orange-500"
            />
          </motion.svg>
        </div>
      </div>
    ),
    color: "from-green-500 to-green-400"
  },
  {
    icon: TrendingUp,
    title: "Line Charts",
    description: "Track trends and changes over time with smooth, professional lines.",
    preview: (
      <div className="h-16 flex items-end justify-between space-x-1">
        {[20, 35, 25, 45, 40, 60, 55, 70].map((height, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="w-2 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm"
          />
        ))}
      </div>
    ),
    color: "from-purple-500 to-purple-400"
  },
  {
    icon: BarChart,
    title: "Combo Charts",
    description: "Combine multiple chart types for comprehensive data storytelling.",
    preview: (
      <div className="space-y-2">
        <div className="flex justify-between items-end h-12 space-x-1">
          {[40, 60, 35, 80].map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              whileInView={{ height: `${height}%` }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-4 bg-gradient-to-t from-red-500 to-red-400 rounded-t-sm"
            />
          ))}
        </div>
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="w-full h-8 flex items-center"
          >
            <svg viewBox="0 0 100 20" className="w-full h-4">
              <motion.path
                d="M 0,15 Q 25,5 50,10 T 100,8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-yellow-500"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </svg>
          </motion.div>
        </div>
      </div>
    ),
    color: "from-red-500 to-red-400"
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
    description: "Download as PNG, SVG, or PDF. Perfect for reports and presentations."
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${chart.color} text-white`}>
                      <chart.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-lg">{chart.title}</h3>
                  </div>
                  
                  <div className="mb-4 h-20">
                    {chart.preview}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{chart.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
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