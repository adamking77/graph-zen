'use client'

import { useState, useEffect } from 'react'

export function useEmbedMode() {
  const [isEmbedMode, setIsEmbedMode] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const embedMode = urlParams.get('embed') === 'true'
    setIsEmbedMode(embedMode)
  }, [])

  return isEmbedMode
}