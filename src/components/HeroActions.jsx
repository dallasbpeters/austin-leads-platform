'use client'

import { Button } from '@/components/ui/button'
import { buildRuntimeKey } from '@/lib/sanity/stega'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

const HERO_ACTION_VARIANT_MAP = {
  default: 'default',
  primary: 'default',
  secondary: 'secondary',
  outline: 'secondary',
  tertiary: 'secondary',
}

const resolveHeroActionVariant = (rawVariant, index) =>
  HERO_ACTION_VARIANT_MAP[rawVariant] || (index === 0 ? 'default' : 'secondary')

export default function HeroActions({ actions, textColor }) {
  const getPagePath = () => (typeof window !== 'undefined' ? window.location.pathname : '/unknown')

  return (
    <>
      {actions.map((action, index) => (
        <Button
          key={buildRuntimeKey('hero-action', action.href, action.label, index)}
          href={action.href}
          variant={resolveHeroActionVariant(action.variant, index)}
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
