'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export type ChartTheme = {
  tooltipBg:     string
  tooltipBorder: string
  tooltipText:   string
  gridStroke:    string
  axisFill:      string
  cursorFill:    string
  donutStroke:   string
}

const DARK: ChartTheme = {
  tooltipBg:     '#10101e',
  tooltipBorder: '#252540',
  tooltipText:   '#f1f5f9',
  gridStroke:    '#1c1c30',
  axisFill:      '#3d4460',
  cursorFill:    '#8b5cf608',
  donutStroke:   '#07070e',
}

const LIGHT: ChartTheme = {
  tooltipBg:     '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText:   '#0f172a',
  gridStroke:    '#e2e8f0',
  axisFill:      '#94a3b8',
  cursorFill:    '#8b5cf610',
  donutStroke:   '#f0f2f8',
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return DARK
  return resolvedTheme === 'light' ? LIGHT : DARK
}
