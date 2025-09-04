'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ChartConfig } from '@/types/chart'
import { SIZE_PRESETS } from '@/lib/chart-constants'

interface UseChartConfigReturn {
  config: ChartConfig
  updateConfig: (updates: Partial<ChartConfig>) => void
  resetConfig: () => void
  loadConfigFromUrl: () => void
}

const DEFAULT_CONFIG: ChartConfig = {
  title: 'Revenue (€) projections for GraphZen',
  subtitle: 'Revenue by year for each scenario',
  type: 'horizontal-bar',
  data: [
    { scenario: 'Year 1 Conservative', value: 180000 },
    { scenario: 'Year 2 Growth Scenario', value: 360000 },
    { scenario: 'Year 3 Scale Scenario', value: 690000 },
  ],
  dimensions: { width: 1920, height: 1080, preset: 'Google Slides / PowerPoint', aspectRatio: '16:9' },
  theme: {
    palette: {
      id: 'dashboard-pro',
      name: 'Dashboard Pro',
      colors: ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
      type: 'colorful'
    },
    borderStyle: 'none',
    borderColor: '#6B7280',
    cornerStyle: 'rounded',
    background: 'black',
    sortHighToLow: false,
    showDataLabels: true,
    showPercentages: false,
    showGridLines: true,
    abbreviation: 'auto',
    decimalPlaces: 'auto',
    fixedDecimalCount: 0
  }
}

export function useChartConfig(): UseChartConfigReturn {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG)

  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...updates }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG)
  }, [])

  const loadConfigFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const configParam = urlParams.get('config')
    
    if (configParam) {
      try {
        const decodedConfig = JSON.parse(decodeURIComponent(escape(atob(configParam))))
        if (decodedConfig && typeof decodedConfig === 'object') {
          setConfig(decodedConfig)
        }
      } catch (error) {
        console.warn('Failed to decode shared chart config:', error)
      }
    }
  }, [])

  useEffect(() => {
    loadConfigFromUrl()
  }, [loadConfigFromUrl])

  return {
    config,
    updateConfig,
    resetConfig,
    loadConfigFromUrl,
  }
}