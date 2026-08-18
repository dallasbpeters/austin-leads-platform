/*
 * Explicit registry for icons that are looked up by name at runtime.
 *
 * Sanity stores icon names as free text, so components resolving them used
 * `import * as IconoirIcons` and indexed the namespace. That defeats
 * tree-shaking entirely: all 1,673 icons ship, roughly 2.3 MB, making the icon
 * set the single largest client dependency in the app.
 *
 * Listing them explicitly keeps name-based lookup working while shipping only
 * what is reachable. A name that is not listed here resolves to `undefined`,
 * which is exactly what an unknown name did before -- callers already fall
 * back to inferring an icon from the surrounding text. To support a new name
 * from the CMS, add it here.
 */

import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Check,
  Clock,
  Copy,
  DotArrowUp,
  Facebook,
  FastArrowRight,
  Flash,
  HomeShield,
  Leaf,
  Linkedin,
  Mail,
  Menu,
  NavArrowDown,
  NavArrowLeft,
  NavArrowRight,
  Page,
  StatUp,
  SunLight,
  Thunderstorm,
  Wallet,
  WindowTabs,
  Wrench,
  X,
  Xmark,
} from 'iconoir-react'

export const iconoirRegistry = {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Check,
  Clock,
  Copy,
  DotArrowUp,
  Facebook,
  FastArrowRight,
  Flash,
  HomeShield,
  Leaf,
  Linkedin,
  Mail,
  Menu,
  NavArrowDown,
  NavArrowLeft,
  NavArrowRight,
  Page,
  StatUp,
  SunLight,
  Thunderstorm,
  Wallet,
  WindowTabs,
  Wrench,
  X,
  Xmark,
}
