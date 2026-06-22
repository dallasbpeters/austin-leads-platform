import { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { buildSanityImageUrl } from '@/lib/platform/imageSource'

export default function GenericFooter({ site }) {
  const logoUrl = buildSanityImageUrl(site?.brand?.logo, { width: 200 })
  const logoAlt = site?.brand?.logo?.alt || site?.name || ''
  return (
    <footer
      className="bg-secondary text-secondary-foreground"
      {...getDevSectionAttributes({
        id: 'site-footer',
        markup: 'src/components/platform/shell/GenericFooter.jsx',
        content: 'generic public-site shell footer',
      })}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-10 md:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="space-y-2">
          {logoUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={logoUrl}
                alt={logoAlt}
                width={80}
                height={80}
                className="size-20 w-auto rounded-sm bg-white object-contain p-3 brightness-120 filter"
              />
              <h3 className="text-secondary-foreground text-2xl tracking-normal">{site.name}</h3>
            </div>
          ) : (
            <span aria-hidden className="text-secondary-foreground/70 text-sm tracking-[0.2em] uppercase">
              {(site?.name || 'S').charAt(0)}
            </span>
          )}

          <p className="text-md text-secondary-foreground/70 max-w-2xl leading-6">{site.seo?.description}</p>
        </div>
        <div className="text-md text-secondary-foreground/70 space-y-2">
          <div>{site.organization?.phone}</div>
          <div>{site.organization?.email}</div>
          <div>{site.organization?.serviceArea?.join(' · ')}</div>
        </div>
      </div>
    </footer>
  )
}
