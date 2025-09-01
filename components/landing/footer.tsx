"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="px-6 lg:px-8 py-12 border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-sm text-muted-foreground">
          ©2025 Graph Zen brought to you by{" "}
          <Link 
            href="https://genzenhq.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 hover:decoration-primary/60 underline-offset-2"
          >
            GenZen HQ
          </Link>
          {" "}- Architects of Autonomy. All rights reserved.
        </p>
      </motion.div>
    </footer>
  )
}