'use client'

import { cn } from '@/lib/utils'

import CloudBackground from './cloud-background'
import { useCloudTone } from './use-cloud-tone'

/**
 * Provides a locally-timed, accessible color treatment for an entire section.
 * It can include the decorative cloud layer without coupling cloud visibility
 * to the section's background and text contrast.
 *
 * @param {{ children: React.ReactNode, className?: string, density?: 'subtle' | 'regular' | 'thick', preserveSurfaceWhenCloudsHidden?: boolean, showClouds?: boolean, tone?: 'auto' | 'day' | 'dusk' | 'night' } & React.ComponentPropsWithoutRef<'section'>} props - Section content and cloud presentation options.
 * @returns {JSX.Element} A themed section with optional cloud animation.
 */
export default function CloudSectionBackground({
  children,
  className,
  density = 'subtle',
  preserveSurfaceWhenCloudsHidden = false,
  showClouds = true,
  tone = 'auto',
  ...sectionProps
}) {
  const resolvedTone = useCloudTone(tone)

  return (
    <section
      {...sectionProps}
      className={cn(
        'cloud-theme-section',
        !showClouds && !preserveSurfaceWhenCloudsHidden && 'cloud-theme-section--clouds-hidden',
        className,
      )}
      data-cloud-tone={showClouds ? resolvedTone : undefined}
    >
      {showClouds ? <CloudBackground density={density} tone={resolvedTone} /> : null}
      {children}
    </section>
  )
}
