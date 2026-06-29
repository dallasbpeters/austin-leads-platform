// oxlint-disable func-style
import Image from 'next/image'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey } from '@/lib/sanity/stega'

const aboutCardThemeColorMap = {
  primary: 'var(--color-primary)',
  sweetcorn: 'var(--color-sweetcorn)',
  voodoo: 'var(--color-voodoo)',
  tidal: 'var(--color-tidal)',
  secondaryAlt: 'var(--color-secondary-alt)',
  blue400: 'var(--color-blue-400)',
  secondary: 'var(--color-secondary)',
  tasman: 'var(--color-tasman)',
  chaletGreen: 'var(--color-chalet-green)',
  metterhorn: 'var(--color-metterhorn)',
  heather: 'var(--color-heather)',
  wattle: 'var(--color-wattle)',
  charade: 'var(--color-charade)',
  ceramic: 'var(--color-ceramic)',
  tapaGreen: 'var(--color-tapa-green)',
  seaMist: 'var(--color-sea-mist)',
  blackCurrent: 'var(--color-black-current)',
  confetti: 'var(--color-confetti)',
}

const defaultAboutCardGradients = [
  { start: 'primary', end: 'tidal' },
  { start: 'primary', end: 'sweetcorn' },
  { start: 'secondary', end: 'tertiary' },
]

export function AboutProfileSection({ section, sectionId }) {
  const people = section.people?.length
    ? section.people
    : [
        {
          label: section.personLabel,
          name: section.personName,
          role: section.personRole,
          blurb: section.personBlurb,
          profileImage: section.profileImage,
          profileImageAsset: section.profileImageAsset,
          certificationLabel: section.certificationLabel,
          certificationTitle: section.certificationTitle,
          badgeImage: section.badgeImage,
          badgeImageAsset: section.badgeImageAsset,
        },
        {
          label: section.secondaryPersonLabel,
          name: section.secondaryPersonName,
          role: section.secondaryPersonRole,
          blurb: section.secondaryPersonBlurb,
          profileImage: section.secondaryProfileImage,
          profileImageAsset: section.secondaryProfileImageAsset,
        },
      ].filter((person) => person?.name)

  return (
    <section
      className="bg-gradient"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/about-profile-section.jsx',
        content: `about profile section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/about-profile-section.jsx"
        content={`about profile section from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-3 py-20 md:grid-cols-[.85fr_1.15fr] md:px-6 lg:px-10">
        <div className="grid grid-cols-1 content-start gap-6">
          {people.map((person, index) => {
            const profileImageUrl = getImageUrl(person.profileImageAsset, person.profileImage)
            const profileImageAlt = getImageAlt(
              person.profileImageAsset,
              person.profileImage,
              person.name || 'Profile image',
            )
            const badgeImageUrl = getImageUrl(person.badgeImageAsset, person.badgeImage)
            const badgeImageAlt = getImageAlt(
              person.badgeImageAsset,
              person.badgeImage,
              person.certificationTitle || 'Certification badge',
            )
            const resolvedBadgeImageUrl =
              badgeImageUrl ||
              (person.certificationTitle?.includes('NABCEP')
                ? 'https://www.nabcep.org/wp-content/uploads/2020/01/PVTS-Registered-Seal.jpg'
                : '')
            const resolvedBadgeImageAlt = badgeImageAlt || person.certificationTitle || 'Certification badge'
            const defaultGradient = defaultAboutCardGradients[index % defaultAboutCardGradients.length]
            const gradientStart =
              aboutCardThemeColorMap[person.cardGradientStart] ||
              aboutCardThemeColorMap[defaultGradient.start]
            const gradientEnd =
              aboutCardThemeColorMap[person.cardGradientEnd] || aboutCardThemeColorMap[defaultGradient.end]
            const profileCardBackground = `linear-gradient(45deg, ${gradientStart}, ${gradientEnd}), url('https://grainy-gradients.vercel.app/noise.svg')`

            return (
              <Card
                key={buildRuntimeKey('about-person', person.name, index)}
                radius="lg"
                className="bg-card grid aspect-3/3 grid-cols-1 content-between items-end pt-8"
                style={{ background: profileCardBackground, backgroundBlendMode: 'multiply' }}
              >
                <Image
                  width={700}
                  height={700}
                  src={profileImageUrl}
                  alt={profileImageAlt}
                  className="absolute inset-0 size-full object-cover grayscale filter"
                />
                <CardHeader className="relative z-10 flex items-center gap-4">
                  <div className="flex items-start">
                    <div className="grid gap-1">
                      <div className="text-xs tracking-[0.2em] text-white uppercase">
                        {person.label || 'Profile'}
                      </div>
                      <CardTitle className="text-3xl leading-10 tracking-normal text-white">
                        {person.name}
                      </CardTitle>
                      {person.role ? (
                        <p className="text-lg leading-4 font-semibold text-white">{person.role}</p>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 grid grid-cols-1 content-end gap-4">
                  {person.blurb ? (
                    <PortableTextContent
                      as="div"
                      value={person.blurb}
                      className="max-w-[34ch] text-sm leading-6 text-white/88"
                    />
                  ) : null}
                  {person.certificationTitle ? (
                    <div className="border-border/80 grid gap-3">
                      <div className="flex items-center gap-3">
                        {resolvedBadgeImageUrl ? (
                          <Image
                            width={100}
                            height={100}
                            src={resolvedBadgeImageUrl}
                            alt={resolvedBadgeImageAlt}
                            className="size-18 rounded-full bg-white object-contain"
                          />
                        ) : null}
                        <div className="grid gap-1">
                          {person.certificationLabel ? (
                            <div className="text-xs tracking-[0.2em] text-white uppercase">
                              {person.certificationLabel}
                            </div>
                          ) : null}
                          <div className="text-[1rem] leading-6 font-semibold text-white">
                            {person.certificationTitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
                <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-black)_15%,rgba(11,59,66,0.2),transparent)]" />
              </Card>
            )
          })}
        </div>
        <div className="mb-10 max-w-3xl">
          {section.eyebrow ? (
            <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="text-foreground mt-5 text-3xl leading-1 tracking-normal md:text-4xl">
            {section.title}
          </h2>
          {section.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="text-muted-foreground mt-2 text-[1rem] leading-8"
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
