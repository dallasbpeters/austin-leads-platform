'use client'

import dynamic from 'next/dynamic'

/*
 * Client sections that most pages do not render. The energy chart pulls in
 * recharts. A `dynamic()` call in the Server Component section registry does
 * not split them: Next still runs every client module that a page's Server
 * Components import at startup. Behind this client boundary, each one is a
 * separate chunk that loads only on a page that renders it.
 */
export const EnergyChartSection = dynamic(() => import('@/components/energy-chart-section'))
export const CalculatorSection = dynamic(() => import('@/components/calculator-section'))
export const ArticleSection = dynamic(() => import('@/components/article-section'))
