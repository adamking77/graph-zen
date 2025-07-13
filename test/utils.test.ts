import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null)).toBe('base')
    })
  })
})