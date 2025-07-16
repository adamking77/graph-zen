"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { TouchFab, TouchIconButton } from './touch-target'
import { cn } from '@/lib/utils'

interface FabAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  actions: FabAction[]
  mainIcon?: React.ReactNode
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({
  actions,
  mainIcon,
  className,
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }
  
  const expandDirection = position.includes('bottom') ? 'up' : 'down'
  
  const handleMainClick = () => {
    if (actions.length === 1) {
      actions[0].onClick()
    } else {
      setIsExpanded(!isExpanded)
    }
  }
  
  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      <div className="relative">
        {/* Action buttons */}
        <AnimatePresence>
          {isExpanded && actions.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'absolute flex flex-col gap-3',
                expandDirection === 'up' 
                  ? 'bottom-full mb-4 items-center' 
                  : 'top-full mt-4 items-center',
                position.includes('right') ? 'right-0' : 'left-0'
              )}
            >
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ 
                    opacity: 0, 
                    y: expandDirection === 'up' ? 20 : -20,
                    scale: 0.8 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1 
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: expandDirection === 'up' ? 20 : -20,
                    scale: 0.8 
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className={cn(
                      'bg-card text-card-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap',
                      position.includes('right') ? 'mr-2' : 'ml-2'
                    )}
                  >
                    {action.label}
                  </motion.div>
                  
                  {/* Action button */}
                  <TouchIconButton
                    onClick={() => {
                      action.onClick()
                      setIsExpanded(false)
                    }}
                    className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 shadow-lg"
                    hapticFeedback="medium"
                  >
                    {action.icon}
                  </TouchIconButton>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main FAB */}
        <TouchFab
          onClick={handleMainClick}
          className={cn(
            'transition-all duration-200',
            isExpanded && 'rotate-45'
          )}
          hapticFeedback="medium"
        >
          {mainIcon || (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          )}
        </TouchFab>
      </div>
      
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Quick export button specifically for charts
export function ChartExportFab({ onExport }: { onExport: () => void }) {
  return (
    <TouchFab
      onClick={onExport}
      className="bg-primary hover:bg-primary/90"
      hapticFeedback="medium"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    </TouchFab>
  )
}