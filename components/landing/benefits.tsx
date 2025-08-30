"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, Zap, Shield, Users, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const benefits = [
  {
    icon: Clock,
    title: "Save Hours of Work",
    description: "What used to take hours in Excel or complex tools now takes minutes. Focus on insights, not formatting.",
    stat: "10x",
    statLabel: "Faster"
  },
  {
    icon: Zap,
    title: "No Learning Curve",
    description: "Intuitive interface that works immediately. No tutorials, no complicated menus, just results.",
    stat: "0",
    statLabel: "Training Required"
  },
  {
    icon: Shield,
    title: "Your Data Stays Private",
    description: "All processing happens in your browser. No data uploaded to servers, no privacy concerns.",
    stat: "100%",
    statLabel: "Private"
  },
  {
    icon: Users,
    title: "Perfect for Teams",
    description: "Export in multiple formats that work everywhere. Share charts that look professional in any presentation.",
    stat: "PNG/SVG/PDF",
    statLabel: "Export Formats"
  }
]

const useCases = [
  {
    title: "Business Reports",
    description: "Quarterly reviews, sales performance, and KPI dashboards",
    users: ["Executives", "Managers", "Analysts"]
  },
  {
    title: "Academic Research", 
    description: "Research findings, survey results, and data analysis",
    users: ["Researchers", "Students", "Professors"]
  },
  {
    title: "Marketing Campaigns",
    description: "Campaign performance, conversion rates, and audience insights", 
    users: ["Marketers", "Agencies", "Consultants"]
  },
  {
    title: "Financial Analysis",
    description: "Budget tracking, expense reports, and financial forecasting",
    users: ["CFOs", "Accountants", "Finance Teams"]
  }
]

const testimonials = [
  {
    text: "Finally, a chart tool that just works. I've saved hours every week since switching.",
    author: "Sarah Chen",
    role: "Data Analyst at TechCorp",
    rating: 5
  },
  {
    text: "The best part? My data never leaves my computer. Perfect for sensitive business information.",
    author: "Michael Rodriguez", 
    role: "CFO at StartupXYZ",
    rating: 5
  },
  {
    text: "I can create presentation-ready charts in under 2 minutes. Game changer for client meetings.",
    author: "Emily Johnson",
    role: "Marketing Director",
    rating: 5
  }
]

export function Benefits() {
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
            Why Teams Choose GraphZen
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their data visualization workflow.
          </p>
        </motion.div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-medium text-primary">{benefit.stat}</div>
                      <div className="text-sm text-muted-foreground">{benefit.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="font-medium text-xl mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-medium text-center mb-12">Perfect For Any Industry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-border/50">
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-3">{useCase.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.users.map((user) => (
                        <Badge key={user} variant="secondary" className="text-xs">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-medium text-center mb-12">What Users Are Saying</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                    </div>
                    <blockquote className="text-foreground mb-4 italic">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="border-t border-border pt-4">
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Checkmarks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              "No signup required",
              "Works in any browser", 
              "Data stays private",
              "Export to any format",
              "Professional themes",
              "Mobile responsive"
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}