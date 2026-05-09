import { getDevSectionAttributes } from '@/components/dev/DevTrace'

export default function GenericFooter({ site }) {
  return (
    <footer
      className="bg-secondary text-secondary-foreground border-border/60 border-t"
      {...getDevSectionAttributes({
        id: 'site-footer',
        markup: 'src/components/platform/shell/GenericFooter.jsx',
        content: 'generic public-site shell footer',
      })}
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between max-w-7xl gap-6 mx-auto px-3 md:px-6 py-10 lg:px-10">
        <div className="space-y-2">
          <p className="text-secondary-foreground/70 text-sm tracking-[0.2em] uppercase">
            {site.categoryLabel}
          </p>
          <h2 className="text-2xl text-secondary-foreground tracking-tight">{site.name}</h2>
          <p className="max-w-2xl leading-6 text-md text-secondary-foreground/70">
            {site.seo?.description}
          </p>
        </div>
        <div className="space-y-2 text-md text-secondary-foreground/70">
          <div>{site.organization?.phone}</div>
          <div>{site.organization?.email}</div>
          <div>{site.organization?.serviceArea?.join(' · ')}</div>
        </div>
      </div>
    </footer>
  )
}
