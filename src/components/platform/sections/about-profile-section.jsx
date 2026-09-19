// oxlint-disable func-style
import Image from 'next/image'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cardToneCssVar } from '@/lib/platform/card-tones'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey } from '@/lib/sanity/stega'

const defaultAboutCardGradients = [
  { start: 'primary', end: 'tidal' },
  { start: 'primary', end: 'sweetcorn' },
  { start: 'secondary', end: 'tasman' },
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
      className="about-profile"
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
      <div className="about-profile__copy">
        {section.eyebrow ? (
          <Badge variant="outline" className="about-profile__badge">
            {section.eyebrow}
          </Badge>
        ) : null}
        <h2 className="about-profile__title text-fluid-500">{section.title}</h2>
        {section.body ? (
          <PortableTextContent as="div" value={section.body} className="about-profile__body text-size-100" />
        ) : null}
      </div>
      <div className="about-profile__layout">
        <div className="about-profile__people">
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
              cardToneCssVar(person.cardGradientStart) || cardToneCssVar(defaultGradient.start)
            const gradientEnd = cardToneCssVar(person.cardGradientEnd) || cardToneCssVar(defaultGradient.end)
            const profileCardBackground = `linear-gradient(45deg, ${gradientStart}, ${gradientEnd}), url('https://grainy-gradients.vercel.app/noise.svg')`

            return (
              <Card
                key={buildRuntimeKey('about-person', person.name, index)}
                radius="lg"
                className="about-profile__card"
                style={{ background: profileCardBackground, backgroundBlendMode: 'multiply' }}
              >
                <Image
                  width={700}
                  height={700}
                  src={profileImageUrl}
                  alt={profileImageAlt}
                  className="about-profile__portrait"
                />
                <CardHeader className="about-profile__head">
                  <div>
                    <div className="about-profile__name-group">
                      <div className="about-profile__label text-size-90">{person.label || 'Profile'}</div>
                      <CardTitle className="about-profile__name text-size-400">{person.name}</CardTitle>
                      {person.role ? (
                        <p className="about-profile__role text-size-200">{person.role}</p>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="about-profile__content">
                  {person.blurb ? (
                    <PortableTextContent
                      as="div"
                      value={person.blurb}
                      className="about-profile__blurb text-size-90"
                    />
                  ) : null}
                  {person.certificationTitle ? (
                    <div>
                      <div className="about-profile__cert">
                        {resolvedBadgeImageUrl ? (
                          <Image
                            width={100}
                            height={100}
                            src={resolvedBadgeImageUrl}
                            alt={resolvedBadgeImageAlt}
                            className="about-profile__cert-badge"
                          />
                        ) : null}
                        <div className="about-profile__cert-text">
                          {person.certificationLabel ? (
                            <div className="about-profile__label text-size-90">
                              {person.certificationLabel}
                            </div>
                          ) : null}
                          <div className="about-profile__cert-title text-size-100">
                            {person.certificationTitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
                <div className="about-profile__wash" />
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
