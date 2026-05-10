import MapBox from '@/components/MapBox'

export const ServiceAreaMapSection = ({ section }) => {
  if (!section) return null

  return (
    <MapBox
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description}
      areas={Array.isArray(section.areas) ? section.areas : []}
      accentColor={section.accentColor}
      backgroundColor={section.backgroundColor}
    />
  )
}

export default ServiceAreaMapSection
