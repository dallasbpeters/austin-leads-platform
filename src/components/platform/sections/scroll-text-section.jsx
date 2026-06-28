import ScrollText from '@/components/scroll-text'

function resolveNumericProp(value) {
  return Number.isFinite(value) ? value : undefined
}

function buildScrollTexts(section) {
  const textItems = Array.isArray(section?.text)
    ? section.text
    : Array.isArray(section?.texts)
      ? section.texts
      : null
  if (!Array.isArray(textItems) || textItems.length === 0) {
    return
  }
  const resolvedIcon = section?.showFlag ? 'TexasFlag' : section?.icon
  if (!section?.showIcon && !section?.showFlag && !section?.icon) {
    return textItems
  }
  return textItems.map((text) => ({ text, icon: resolvedIcon }))
}

export function ScrollTextSection({ section, sectionId }) {
  const scrollTexts = buildScrollTexts(section)
  const shouldShowIcon = Boolean(section?.showIcon || section?.showFlag || section?.icon)

  return (
    <section id={sectionId} className="bg-card border-border/60 border-b">
      <ScrollText
        texts={scrollTexts}
        numCopies={resolveNumericProp(section?.numCopies)}
        velocity={resolveNumericProp(section?.velocity)}
        direction={section.direction}
        startPosition={resolveNumericProp(section?.startPosition)}
        damping={resolveNumericProp(section?.damping)}
        stiffness={resolveNumericProp(section?.stiffness)}
        fontSize={resolveNumericProp(section?.fontSize)}
        textColor={section.textColor}
        showIcon={shouldShowIcon}
        showFlag={section.showFlag}
        style={section.style}
      />
    </section>
  )
}
