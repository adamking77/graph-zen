"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AppShowcase() {
  return (
    <section className="relative px-6 lg:px-8 py-24 bg-black/10">
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
            Everything You Need in One Place
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A powerful yet simple interface designed for speed and clarity. Create professional charts without the complexity.
          </p>
        </motion.div>

        {/* App Interface Screenshot with Scroll Reveal */}
        <motion.div
          initial={{
            opacity: 0,
            y: 60,
            scale: 0.9,
            rotateX: 15,
            rotateY: -8
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0
          }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-2xl shadow-2xl overflow-hidden border border-border/50"
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d"
          }}
        >
          <Image
            src="/landing/ui/ui-full-interface.png"
            alt="GraphZen Complete Interface - Full Application View"
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
