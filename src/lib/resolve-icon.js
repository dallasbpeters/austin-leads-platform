import * as IconoirIcons from 'iconoir-react'

/**
 * Resolve an iconoir icon component from a string name.
 * Returns null if the name is invalid or the icon is not found.
 * Used by section renderers that display icon cards (card grid, solar adoption reasons, etc.).
 */
export function resolveIconoirIcon(iconName) {
  if (!iconName || typeof iconName !== 'string') {
    return null
  }
  const Component = IconoirIcons[iconName]
  return typeof Component === 'function' || typeof Component === 'object' ? Component : null
}
