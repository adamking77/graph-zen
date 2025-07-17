"use client"

import { motion } from 'framer-motion'
import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TouchTargetProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'custom'
  size?: 'sm' | 'md' | 'lg'
  isPressed?: boolean
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none'
  children: React.ReactNode
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export const TouchTarget = forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isPressed = false,
    hapticFeedback = 'light',
    className,
    children,
    disabled = false,
    type = 'button',
    onClick,
    ...props
  }, ref) => {
    
    // Handle haptic feedback
    const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        const intensity = type === 'light' ? 10 : type === 'medium' ? 20 : 50
        navigator.vibrate(intensity)
      }
    }
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      
      if (hapticFeedback !== 'none') {
        triggerHaptic(hapticFeedback)
      }
      
      onClick?.(e)
    }
    
    const baseClasses = cn(
      // Ensure minimum touch target size (44px)
      'min-w-[44px] min-h-[44px]',
      'relative inline-flex items-center justify-center',
      'font-medium text-sm',
      'transition-all duration-200',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none'
    )
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      custom: '' // No default styling, allows className to handle everything
    }
    
    const sizeClasses = {
      sm: 'h-11 px-4 text-sm rounded-md', // 44px minimum height
      md: 'h-12 px-6 text-sm rounded-lg', // 48px height
      lg: 'h-14 px-8 text-base rounded-lg' // 56px height
    }
    
    return (
      // @ts-expect-error - Motion gesture types conflict
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

TouchTarget.displayName = 'TouchTarget'

// Specialized components for common use cases
export const TouchIconButton = forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ children, className, ...props }, ref) => (
    <TouchTarget
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn('w-11 h-11 p-0', className)}
      {...props}
    >
      {children}
    </TouchTarget>
  )
)

TouchIconButton.displayName = 'TouchIconButton'

export const TouchFab = forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ children, className, ...props }, ref) => (
    <TouchTarget
      ref={ref}
      variant="primary"
      size="lg"
      className={cn(
        'w-14 h-14 rounded-full shadow-lg hover:shadow-xl',
        'fixed bottom-6 right-6 z-40',
        className
      )}
      {...props}
    >
      {children}
    </TouchTarget>
  )
)

TouchFab.displayName = 'TouchFab'