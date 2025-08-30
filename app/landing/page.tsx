"use client"

import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { InteractiveDemo } from "@/components/landing/interactive-demo"
import { Benefits } from "@/components/landing/benefits"
import { CallToAction } from "@/components/landing/call-to-action"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/30 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <InteractiveDemo />
        <Benefits />
        <CallToAction />
      </div>
    </div>
  )
}