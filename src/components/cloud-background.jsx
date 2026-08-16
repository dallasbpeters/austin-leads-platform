'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

import { useCloudTone } from './use-cloud-tone'

const cloudPositions = ['one', 'two', 'three', 'four', 'five', 'six']

/**
 * Renders an ambient, non-interactive cloud layer behind a section's content.
 * The layer uses a single local sprite and is safe to insert into any
 * `relative overflow-hidden` section whose content is raised above it. The
 * default tone follows the visitor's local clock and updates hourly.
 *
 * @param {{ className?: string, density?: 'subtle' | 'regular' | 'thick', tone?: 'auto' | 'day' | 'dusk' | 'night' }} props - Visual treatment for the cloud layer.
 * @returns {JSX.Element} A decorative cloud background.
 */
export default function CloudBackground({ className, density = 'subtle', tone = 'auto' }) {
  const resolvedTone = useCloudTone(tone)

  return (
    <div
      aria-hidden="true"
      className={cn(
        'cloud-background',
        `cloud-background--${density}`,
        `cloud-background--${resolvedTone}`,
        className,
      )}
    >
      {cloudPositions.map((position) => (
        <span key={position} className={`cloud-background__cloud cloud-background__cloud--${position}`}>
          <span className="cloud-background__scroll">
            <span className="cloud-background__breathe">
              <span className="cloud-background__motion">
                <Image alt="" src="/clouds/cloud-sprite.png" width={256} height={256} sizes="30vw" />
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
