'use client'

import { Button } from '@/components/ui/button'
import { buildRuntimeKey } from '@/lib/sanity/stega'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

const HERO_ACTION_VARIANT_MAP = {
  default: 'default',
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  tertiary: 'secondary',
}

const resolveHeroActionVariant = (rawVariant, index) =>
  HERO_ACTION_VARIANT_MAP[rawVariant] || (index === 0 ? 'default' : 'secondary')

const getHeroActionClassName = (rawVariant) => {
  if (rawVariant !== 'outline') {
    return null
  }

  return 'border-current bg-transparent text-inherit hover:bg-white/10 hover:text-inherit dark:border-current dark:bg-transparent dark:hover:bg-white/10'
}

const getHeroActionStyle = (rawVariant, textColor) => {
  if (rawVariant !== 'outline' || !textColor) {
    return undefined
  }

  return {
    borderColor: textColor,
    color: textColor,
  }
}

export default function HeroActions({ actions, textColor }) {
  const getPagePath = () => (typeof window !== 'undefined' ? window.location.pathname : '/unknown')

  return (
    <>
      {actions.map((action, index) => (
        <Button
          key={buildRuntimeKey('hero-action', action.href, action.label, index)}
          href={action.href}
          variant={resolveHeroActionVariant(action.variant, index)}
          className={getHeroActionClassName(action.variant)}
          style={getHeroActionStyle(action.variant, textColor)}
          size="lg"
          shape="pill"
          onClick={() =>
            trackAnalyticsEvent('hero_cta_click', {
              action_label: action.label,
              action_href: action.href,
              action_variant: action.variant || 'default',
              action_index: index,
              text_color: textColor || 'default',
              page_path: getPagePath(),
            })
          }
        >
          {action.label}
        </Button>
      ))}
    </>
  )
}
