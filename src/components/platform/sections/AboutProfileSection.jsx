import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
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

export function AboutProfileSection({ section, sectionId, editAttributes = {} }) {
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
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/AboutProfileSection.jsx',
        content: `about profile section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/AboutProfileSection.jsx"
        content={`about profile section from ${section?._type || 'page section'}`}
      />
      <div className="grid max-w-7xl gap-6 mx-auto px-3 md:px-6 py-20 lg:px-10 grid-cols-1 md:grid-cols-[.85fr_1.15fr]">
        <div className="grid content-start gap-6 grid-cols-1">
          {people.map((person, index) => {
            const profileImageUrl = getImageUrl(person.profileImageAsset, person.profileImage)
            const profileImageAlt = getImageAlt(person.profileImageAsset, person.profileImage, person.name || 'Profile image')
            const badgeImageUrl = getImageUrl(person.badgeImageAsset, person.badgeImage)
            const badgeImageAlt = getImageAlt(person.badgeImageAsset, person.badgeImage, person.certificationTitle || 'Certification badge')
            const resolvedBadgeImageUrl =
              badgeImageUrl ||
              (person.certificationTitle?.includes('NABCEP')
                ? 'https://www.nabcep.org/wp-content/uploads/2020/01/PVTS-Registered-Seal.jpg'
                : '')
            const resolvedBadgeImageAlt = badgeImageAlt || person.certificationTitle || 'Certification badge'
            const defaultGradient = defaultAboutCardGradients[index % defaultAboutCardGradients.length]
            const gradientStart = aboutCardThemeColorMap[person.cardGradientStart] || aboutCardThemeColorMap[defaultGradient.start]
            const gradientEnd = aboutCardThemeColorMap[person.cardGradientEnd] || aboutCardThemeColorMap[defaultGradient.end]
            const profileCardBackground = `linear-gradient(45deg, ${gradientStart}, ${gradientEnd}), url('https://grainy-gradients.vercel.app/noise.svg')`

            return (
              <Card
                key={buildRuntimeKey('about-person', person.name, index)}
                radius="lg"
                className="grid content-between items-end pt-8 bg-card aspect-3/3 grid-cols-1"
                style={{ background: profileCardBackground, backgroundBlendMode: 'multiply' }}
              >
                <Image
                  width={700}
                  height={700}
                  src={profileImageUrl}
                  alt={profileImageAlt}
                  className="absolute filter grayscale inset-0 object-cover size-full"
                />
                <CardHeader className="flex relative items-center gap-4 z-10">
                  <div className="flex items-start">
                    <div className="grid gap-1">
                      <div className="text-white text-xs tracking-[0.2em] uppercase">
                        {person.label || 'Profile'}
                      </div>
                      <CardTitle className="leading-4 text-3xl text-white tracking-tight">
                        {person.name}
                      </CardTitle>
                      {person.role ? (
                        <p className="font-semibold leading-4 text-lg text-white">{person.role}</p>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid relative content-end h-30 gap-4 grid-cols-1 z-10">
                  {person.certificationTitle ? (
                    <div className="grid gap-3 border-border/80">
                      <div className="flex items-center gap-3">
                        {resolvedBadgeImageUrl ? (
                          <Image
                            width={100}
                            height={100}
                            src={resolvedBadgeImageUrl}
                            alt={resolvedBadgeImageAlt}
                            className="bg-white rounded-full object-contain size-18"
                          />
                        ) : null}
                        <div className="grid gap-1">
                          {person.certificationLabel ? (
                            <div className="text-white text-xs tracking-[0.2em] uppercase">
                              {person.certificationLabel}
                            </div>
                          ) : null}
                          <div className="font-semibold leading-6 text-base text-white">
                            {person.certificationTitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
                <div className="absolute bg-[linear-gradient(to_top,var(--color-black)_15%,rgba(11,59,66,0.2),transparent)] inset-0" />
              </Card>
            )
          })}
        </div>
        <div className="max-w-3xl mb-10">
          {section.eyebrow ? (
            <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="mt-5 text-3xl text-foreground leading-1 tracking-tight md:text-4xl">
            {section.title}
          </h2>
          {section.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="mt-2 leading-8 text-base text-muted-foreground"
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
