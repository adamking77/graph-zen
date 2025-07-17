"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useGesture } from '@use-gesture/react'
import { useRef, useEffect, useState } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: number[] // Array of heights in vh (e.g., [30, 60, 90])
  initialSnap?: number // Index of initial snap point
  enableBackdropDismiss?: boolean
  enableDragDismiss?: boolean
}

export function ModernBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [75],
  initialSnap = 0,
  enableBackdropDismiss = true,
  enableDragDismiss = true
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [y, setY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const currentHeight = snapPoints[currentSnap]
  const maxHeight = Math.max(...snapPoints)
  
  // Reset position when opening
  useEffect(() => {
    if (isOpen) {
      setY(0)
      setCurrentSnap(initialSnap)
    }
  }, [isOpen, initialSnap])
  
  // Handle haptic feedback (if available)
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const intensity = type === 'light' ? 10 : type === 'medium' ? 20 : 50
      navigator.vibrate(intensity)
    }
  }
  
  // Gesture handling
  const bind = useGesture({
    onDrag: ({ down, movement: [, my], velocity: [, vy], cancel }) => {
      if (!enableDragDismiss) return
      
      setIsDragging(down)
      
      // Calculate drag position
      const dragY = Math.max(0, my)
      setY(dragY)
      
      // Cancel if dragging too far up
      if (my < -50) {
        cancel()
        return
      }
      
      // Handle release
      if (!down) {
        const threshold = window.innerHeight * 0.3
        const shouldDismiss = dragY > threshold || vy > 0.5
        
        if (shouldDismiss) {
          hapticFeedback('light')
          onClose()
        } else {
          // Snap to nearest snap point
          const targetSnap = findNearestSnapPoint(dragY, vy)
          setCurrentSnap(targetSnap)
          if (targetSnap !== currentSnap) {
            hapticFeedback('light')
          }
        }
        setY(0)
      }
    },
    onWheel: ({ event }) => {
      // Prevent background scroll when sheet is open
      if (isOpen) {
        event.preventDefault()
      }
    }
  })
  
  const findNearestSnapPoint = (dragY: number, velocity: number) => {
    const currentVh = window.innerHeight
    const dragPercentage = (dragY / currentVh) * 100
    
    // Factor in velocity for more natural feeling
    const velocityFactor = velocity * 20
    const adjustedDrag = dragPercentage + velocityFactor
    
    let closestIndex = 0
    let closestDistance = Infinity
    
    snapPoints.forEach((snapPoint, index) => {
      const distance = Math.abs(snapPoint - (currentHeight - adjustedDrag))
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    
    return closestIndex
  }
  
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={enableBackdropDismiss ? onClose : undefined}
          />
          
          {/* Sheet */}
          {/* @ts-expect-error - Motion gesture types conflict */}
          <motion.div
            ref={sheetRef}
            {...bind()}
            initial={{ y: "100%" }}
            animate={{ 
              y: y,
              height: `${currentHeight}vh`
            }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              duration: isDragging ? 0 : 0.3
            }}
            className="fixed bottom-0 left-0 right-0 z-50 touch-none"
            style={{
              height: `${currentHeight}vh`,
              transform: `translateY(${y}px)`
            }}
          >
            <div className="h-full bg-card border-t border-border rounded-t-xl shadow-2xl flex flex-col">
              {/* Drag Handle */}
              <div className="flex-shrink-0 flex items-center justify-center py-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full transition-colors duration-200 hover:bg-muted-foreground/50" />
              </div>
              
              {/* Header */}
              {title && (
                <div className="flex-shrink-0 px-4 pb-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-secondary/50 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}