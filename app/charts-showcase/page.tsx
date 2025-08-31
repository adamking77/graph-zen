"use client"

import { useState } from "react"
import { ChartPreview } from "@/components/chart-preview"
import type { ChartConfig } from "@/app/page"
import { Button } from "@/components/ui/button"

// Professional chart examples for landing page screenshots
const chartExamples: { [key: string]: ChartConfig } = {
  "sales-vertical-bar": {
    title: "Q4 2024 Sales Performance",
    subtitle: "Revenue by product category (millions USD)",
    type: "vertical-bar",
    data: [
      { scenario: "Software", value: 12.5 },
      { scenario: "Hardware", value: 8.3 },
      { scenario: "Services", value: 15.8 },
      { scenario: "Support", value: 6.2 },
      { scenario: "Training", value: 4.1 }
    ],
    dimensions: { width: 1200, height: 800, preset: "Custom", aspectRatio: "3:2" },
    theme: {
      palette: {
        id: 'professional-blue',
        name: 'Professional Blue',
        colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
        type: 'colorful'
      },
      borderStyle: 'none',
      borderColor: '#6B7280',
      cornerStyle: 'rounded',
      background: 'white',
      sortHighToLow: true,
      showDataLabels: true,
      showPercentages: false,
      showGridLines: true,
      abbreviation: 'auto',
      decimalPlaces: 'auto',
      fixedDecimalCount: 1
    }
  },
  "performance-horizontal-bar": {
    title: "Team Performance Metrics",
    subtitle: "Project completion rates by department",
    type: "horizontal-bar",
    data: [
      { scenario: "Engineering", value: 94 },
      { scenario: "Design", value: 87 },
      { scenario: "Marketing", value: 91 },
      { scenario: "Sales", value: 83 },
      { scenario: "Support", value: 96 }
    ],
    dimensions: { width: 1200, height: 800, preset: "Custom", aspectRatio: "3:2" },
    theme: {
      palette: {
        id: 'success-gradient',
        name: 'Success Gradient',
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        type: 'colorful'
      },
      borderStyle: 'none',
      borderColor: '#6B7280',
      cornerStyle: 'rounded',
      background: 'white',
      sortHighToLow: true,
      showDataLabels: true,
      showPercentages: true,
      showGridLines: true,
      abbreviation: 'none',
      decimalPlaces: 'auto',
      fixedDecimalCount: 0
    }
  },
  "market-share-donut": {
    title: "Global Market Share 2024",
    subtitle: "Distribution across major competitors",
    type: "donut",
    data: [
      { scenario: "Our Company", value: 28 },
      { scenario: "Competitor A", value: 22 },
      { scenario: "Competitor B", value: 18 },
      { scenario: "Competitor C", value: 15 },
      { scenario: "Others", value: 17 }
    ],
    dimensions: { width: 1200, height: 800, preset: "Custom", aspectRatio: "3:2" },
    theme: {
      palette: {
        id: 'corporate-palette',
        name: 'Corporate Palette',
        colors: ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f0abfc'],
        type: 'colorful'
      },
      borderStyle: 'none',
      borderColor: '#6B7280',
      cornerStyle: 'rounded',
      background: 'white',
      sortHighToLow: true,
      showDataLabels: true,
      showPercentages: true,
      showGridLines: false,
      abbreviation: 'none',
      decimalPlaces: 'auto',
      fixedDecimalCount: 0
    }
  },
  "growth-line-chart": {
    title: "Revenue Growth Trend",
    subtitle: "Monthly revenue over the past 12 months (millions USD)",
    type: "line",
    data: [
      { scenario: "Jan", value: 8.2 },
      { scenario: "Feb", value: 9.1 },
      { scenario: "Mar", value: 8.8 },
      { scenario: "Apr", value: 10.5 },
      { scenario: "May", value: 12.3 },
      { scenario: "Jun", value: 11.9 },
      { scenario: "Jul", value: 13.7 },
      { scenario: "Aug", value: 14.2 },
      { scenario: "Sep", value: 15.8 },
      { scenario: "Oct", value: 16.4 },
      { scenario: "Nov", value: 18.1 },
      { scenario: "Dec", value: 19.3 }
    ],
    dimensions: { width: 1200, height: 800, preset: "Custom", aspectRatio: "3:2" },
    theme: {
      palette: {
        id: 'growth-trend',
        name: 'Growth Trend',
        colors: ['#dc2626', '#ea580c', '#f59e0b', '#84cc16', '#22c55e'],
        type: 'colorful'
      },
      borderStyle: 'none',
      borderColor: '#6B7280',
      cornerStyle: 'rounded',
      background: 'white',
      sortHighToLow: false,
      showDataLabels: true,
      showPercentages: false,
      showGridLines: true,
      abbreviation: 'auto',
      decimalPlaces: 'auto',
      fixedDecimalCount: 1
    }
  },
  "combo-mixed-data": {
    title: "Sales & Customer Satisfaction",
    subtitle: "Revenue vs satisfaction scores by quarter",
    type: "combo",
    series: [
      {
        name: "Revenue (M$)",
        data: [
          { scenario: "Q1", value: 45.2 },
          { scenario: "Q2", value: 52.8 },
          { scenario: "Q3", value: 48.9 },
          { scenario: "Q4", value: 61.3 }
        ],
        color: "#3b82f6"
      },
      {
        name: "Satisfaction Score",
        data: [
          { scenario: "Q1", value: 87 },
          { scenario: "Q2", value: 91 },
          { scenario: "Q3", value: 89 },
          { scenario: "Q4", value: 94 }
        ],
        color: "#10b981"
      }
    ],
    multiSeries: true,
    data: [],
    dimensions: { width: 1200, height: 800, preset: "Custom", aspectRatio: "3:2" },
    theme: {
      palette: {
        id: 'mixed-data',
        name: 'Mixed Data',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        type: 'colorful'
      },
      borderStyle: 'none',
      borderColor: '#6B7280',
      cornerStyle: 'rounded',
      background: 'white',
      sortHighToLow: false,
      showDataLabels: true,
      showPercentages: false,
      showGridLines: true,
      abbreviation: 'auto',
      decimalPlaces: 'auto',
      fixedDecimalCount: 1
    }
  }
}

export default function ChartsShowcasePage() {
  const [activeChart, setActiveChart] = useState("sales-vertical-bar")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Professional Charts Showcase
          </h1>
          <p className="text-muted-foreground mb-4">
            High-quality chart examples for landing page screenshots
          </p>
          
          {/* Chart Selection */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(chartExamples).map((key) => (
              <Button
                key={key}
                variant={activeChart === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart(key)}
                className="text-xs"
              >
                {chartExamples[key].title}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Display */}
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <ChartPreview config={chartExamples[activeChart]} />
        </div>
      </div>

      {/* Chart Info */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-2">{chartExamples[activeChart].title}</h3>
          <p className="text-muted-foreground text-sm mb-2">{chartExamples[activeChart].subtitle}</p>
          <div className="text-xs text-muted-foreground">
            Type: {chartExamples[activeChart].type} | 
            Dimensions: {chartExamples[activeChart].dimensions?.width}x{chartExamples[activeChart].dimensions?.height} |
            Background: {chartExamples[activeChart].theme?.background}
          </div>
        </div>
      </div>
    </div>
  )
}