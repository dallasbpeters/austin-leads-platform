import Link from 'next/link'
import Image from 'next/image'
import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  Thunderstorm,
  WarningTriangle,
  WindowTabs,
  Wrench,
} from 'iconoir-react'
import * as IconoirIcons from 'iconoir-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

const serviceIconMap = {
  audit: AreaSearch,
  insulation: HomeShield,
  ducts: AirConditioner,
  windows: WindowTabs,
  heatpump: AirConditioner,
  solarbattery: BatteryCharging,
  detachreset: Wrench,
  shingles: HomeShield,
  metalroofing: HomeShield,
  stormdamage: Thunderstorm,
  commercialroofing: HomeShield,
  hailinspection: AreaSearch,
  rodent: WarningTriangle,
  electrical: Flash,
  evcharger: Car,
}

const serviceImageMap = {
  audit: { url: '/assets/services/photos/energy-audits.jpg', alt: 'Thermostat control being adjusted during a home energy audit' },
  insulation: { url: '/assets/services/photos/insulation-air-sealing.jpg', alt: 'Residential attic space with reflective insulation installed' },
  ducts: { url: '/assets/services/photos/duct-sealing.jpg', alt: 'Architectural vent detail representing HVAC airflow and duct performance' },
  windows: { url: '/assets/services/photos/window-replacement-flyer.jpg', alt: 'Crew installing new residential windows on a house exterior' },
  heatpump: { url: '/assets/services/photos/heat-pump-upgrades.jpg', alt: 'Residential outdoor heat pump unit mounted beside a home' },
  solarbattery: { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop', alt: 'Solar array installation under a bright sky' },
  detachreset: { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop', alt: 'Solar array on a residential roof ready for coordinated detach and reset work' },
  shingles: { url: 'https://images.unsplash.com/photo-1762726012995-81c2f26e6a4b?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Close-up of weathered roof shingles and eaves' },
  metalroofing: { url: 'https://images.unsplash.com/photo-1718948173667-fbd912b6d1fa?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'House with a standing seam metal roof' },
  stormdamage: { url: 'https://images.unsplash.com/photo-1767385945380-37deed400d81?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Storm-damaged structure with torn metal roofing' },
  commercialroofing: { url: 'https://images.unsplash.com/photo-1737256359080-9354dbcc21ef?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Large commercial building roof under clear sky' },
  hailinspection: { url: 'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Aerial view of a residential roof for inspection' },
  rodent: { url: 'https://images.unsplash.com/photo-1694248581706-a645f65a2f27?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Close-up of rooftop solar panels protected from pest intrusion' },
  electrical: { url: 'https://images.unsplash.com/photo-1759692071712-adc78a8516c8?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Electrical panel and power equipment' },
  evcharger: { url: 'https://images.unsplash.com/photo-1724963914478-77af9eba1c50?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', alt: 'Electric vehicle plugged into a home charger' },
}

function getServiceIcon(item) {
  if (item.icon && serviceIconMap[item.icon]) return serviceIconMap[item.icon]
  if (item.icon && IconoirIcons[item.icon]) return IconoirIcons[item.icon]

  const title = `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''} ${portableTextToPlainText(item.body || item.answer) || ''}`.toLowerCase()

  if (title.includes('audit')) return AreaSearch
  if (title.includes('hail')) return Thunderstorm
  if (title.includes('storm')) return Thunderstorm
  if (title.includes('insurance')) return HomeShield
  if (title.includes('roof')) return HomeShield
  if (title.includes('shingle')) return HomeShield
  if (title.includes('metal')) return HomeShield
  if (title.includes('commercial')) return HomeShield
  if (title.includes('insulation') || title.includes('air sealing')) return HomeShield
  if (title.includes('duct')) return AirConditioner
  if (title.includes('window')) return WindowTabs
  if (title.includes('heat pump')) return AirConditioner
  if (title.includes('warranty')) return HomeShield
  if (title.includes('incentive') || title.includes('rebate')) return Flash
  if (title.includes('electrical')) return Flash
  if (title.includes('charger') || title.includes('ev')) return Car
  if (title.includes('battery') || title.includes('solar')) return BatteryCharging
  return AreaSearch
}

function getServiceImage(item) {
  if (item.imageAsset?.asset?._ref || item.imageAsset?.asset?.url) {
    return { url: getImageUrl(item.imageAsset, item.image), alt: getImageAlt(item.imageAsset, item.image, item.title || item.question) }
  }
  if (item.imageUrl) {
    return { url: cleanRuntimeString(item.imageUrl), alt: cleanRuntimeString(item.imageAlt || item.alt || item.title || item.question) }
  }
  if (item.image) {
    return { url: getImageUrl(null, item.image), alt: getImageAlt(null, item.image, item.title || item.question) }
  }
  if (item.icon && serviceImageMap[item.icon]) return serviceImageMap[item.icon]

  const title = `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''}`.toLowerCase()
  if (title.includes('audit')) return serviceImageMap.audit
  if (title.includes('insulation') || title.includes('air sealing')) return serviceImageMap.insulation
  if (title.includes('duct')) return serviceImageMap.ducts
  if (title.includes('window')) return serviceImageMap.windows
  if (title.includes('heat pump')) return serviceImageMap.heatpump
  if (title.includes('detach') || title.includes('reset')) return serviceImageMap.detachreset
  if (title.includes('battery') || title.includes('solar')) return serviceImageMap.solarbattery
  if (title.includes('shingle')) return serviceImageMap.shingles
  if (title.includes('metal')) return serviceImageMap.metalroofing
  if (title.includes('storm damage') || title.includes('restoration')) return serviceImageMap.stormdamage
  if (title.includes('commercial')) return serviceImageMap.commercialroofing
  if (title.includes('hail') || title.includes('wind damage')) return serviceImageMap.hailinspection
  if (title.includes('rodent')) return serviceImageMap.rodent
  if (title.includes('electrical')) return serviceImageMap.electrical
  if (title.includes('charger') || title.includes('car charger') || title.includes('ev')) return serviceImageMap.evcharger
  return { url: getImageUrl(item.imageAsset, item.image), alt: getImageAlt(item.imageAsset, item.image, item.title || item.question) }
}

function enrichItems(rawItems) {
  return (rawItems || []).map((item) => {
    const serviceImage = getServiceImage(item)
    return { ...item, copy: portableTextToPlainText(item.body || item.answer), imageUrl: serviceImage.url, imageAlt: serviceImage.alt }
  })
}

function ServiceMedia({ item, overlayClassName }) {
  if (!item.imageUrl) return <div className={`absolute inset-0 ${overlayClassName}`} />
  return (
    <>
      <Image
        width={2000}
        height={2000}
        src={item.imageUrl}
        alt={item.imageAlt}
        className="absolute h-full w-full duration-500 transition-transform inset-0 object-cover hover:scale-105"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </>
  )
}

function ServiceCardLink({ item, keyPrefix, children }) {
  if (!item.href) return <div key={buildRuntimeKey(keyPrefix, item.title, item.href)}>{children}</div>
  return (
    <Link key={buildRuntimeKey(keyPrefix, item.title, item.href)} href={cleanRuntimeHref(item.href)}>
      {children}
    </Link>
  )
}

export function ServiceGridSection({ section, sectionId, editAttributes = {} }) {
  const items = enrichItems(section.items)
  const roofingItems = enrichItems(section.roofingItems)
  const secondaryItems = enrichItems(section.secondaryItems)

  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.96))] border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/ServiceGridSection.jsx',
        content: `service grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/ServiceGridSection.jsx"
        content={`service grid from ${section?._type || 'page section'}`}
      />
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-10">
          {section.eyebrow ? (
            <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="mt-5 text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent as="div" value={section.subtitle} className="mt-4 leading-8 text-foreground/80 text-lg" />
          ) : null}
          {section.body ? (
            <PortableTextContent as="div" value={section.body} className="mt-4 leading-8 text-base text-muted-foreground" />
          ) : null}
        </div>

        <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-3">
          {items.map((item) => {
            const Icon = getServiceIcon(item)
            const card = (
              <Card className="relative aspect-3/4" variant="media" radius="lg">
                <ServiceMedia item={item} overlayClassName="bg-[linear-gradient(to_top,var(--color-charade)_30%,rgba(11,59,66,0.1),transparent)]" />
                <div className="absolute p-8 text-white bottom-0 inset-x-0">
                  <div className="items-center justify-center h-16 w-16 mb-4 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                    <Icon className="h-8 w-8" strokeWidth={2} />
                  </div>
                  <div className="font-bold leading-[1.1] text-[1.875rem] type-accent">{item.title}</div>
                  <div className="mt-1 font-semibold text-md text-white/70">{item.copy}</div>
                </div>
              </Card>
            )
            return <ServiceCardLink key={buildRuntimeKey('service-item', item.title, item.href)} item={item} keyPrefix="service-item">{card}</ServiceCardLink>
          })}
        </div>

        {roofingItems.length ? (
          <div className="mt-8 pt-8 border-border/60 border-t">
            {section.roofingTitle ? (
              <h3 className="mb-4 text-foreground text-lg">{section.roofingTitle}</h3>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-3 max-[900px]:grid-cols-1 md:grid-cols-2">
              {roofingItems.map((item) => {
                const Icon = getServiceIcon(item)
                const card = (
                  <Card className="relative aspect-4/5 overflow-hidden" variant="media" radius="lg">
                    <ServiceMedia item={item} overlayClassName="bg-[linear-gradient(to_top,rgba(11,59,66,1)_20%,rgba(11,59,66,0.4),transparent)]" />
                    <div className="absolute p-5 text-white bottom-0 inset-x-0">
                      <div className="items-center justify-center h-10 w-10 mb-3 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="font-bold leading-[1.05] text-[1.375rem] type-accent">{item.title}</div>
                      <p className="mt-2 leading-6 text-md text-white/82">{item.copy}</p>
                    </div>
                  </Card>
                )
                return <ServiceCardLink key={buildRuntimeKey('roofing-item', item.title, item.href)} item={item} keyPrefix="roofing-item">{card}</ServiceCardLink>
              })}
            </div>
          </div>
        ) : null}

        {secondaryItems.length ? (
          <div className="mt-8 pt-8 border-border/60 border-t">
            {section.secondaryTitle ? (
              <h3 className="mb-4 text-foreground text-lg">{section.secondaryTitle}</h3>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-3 max-[900px]:grid-cols-1 md:grid-cols-2">
              {secondaryItems.map((item) => {
                const Icon = getServiceIcon(item)
                const card = (
                  <Card className="relative aspect-square overflow-hidden" variant="media" radius="lg">
                    <ServiceMedia item={item} overlayClassName="bg-[linear-gradient(to_top,rgba(11,59,66,1)_20%,rgba(11,59,66,0.4),transparent)]" />
                    <div className="absolute p-5 text-white bottom-0 inset-x-0">
                      <div className="items-center justify-center h-10 w-10 mb-3 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="font-bold leading-[1.05] text-[1.375rem] type-accent">{item.title}</div>
                      <p className="mt-2 leading-6 text-md text-white/82">{item.copy}</p>
                    </div>
                  </Card>
                )
                return <ServiceCardLink key={buildRuntimeKey('secondary-item', item.title, item.href)} item={item} keyPrefix="secondary-item">{card}</ServiceCardLink>
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
