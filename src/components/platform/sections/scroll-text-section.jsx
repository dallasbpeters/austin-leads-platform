import ScrollText from '@/components/scroll-text'

export function ScrollTextSection({ section, sectionId }) {
  const textItems = Array.isArray(section?.text)
    ? section.text
    : Array.isArray(section?.texts)
      ? section.texts
      : null
  const hasTextItems = Array.isArray(textItems) && textItems.length > 0
  const shouldShowIcon = Boolean(section?.showIcon || section?.showFlag || section?.icon)
  const resolvedIcon = section?.showFlag ? 'TexasFlag' : section?.icon
  const scrollTexts = hasTextItems
    ? shouldShowIcon && resolvedIcon
      ? textItems.map((text) => ({ text, icon: resolvedIcon }))
      : textItems
    : undefined
  const numCopies = Number.isFinite(section?.numCopies) ? section.numCopies : undefined
  const velocity = Number.isFinite(section?.velocity) ? section.velocity : undefined
  const startPosition = Number.isFinite(section?.startPosition) ? section.startPosition : undefined
  const damping = Number.isFinite(section?.damping) ? section.damping : undefined
  const stiffness = Number.isFinite(section?.stiffness) ? section.stiffness : undefined
  const fontSize = Number.isFinite(section?.fontSize) ? section.fontSize : undefined

  return (
    <section id={sectionId} className="bg-card border-border/60 border-b">
      <ScrollText
        texts={scrollTexts}
        numCopies={numCopies}
        velocity={velocity}
        direction={section.direction}
        startPosition={startPosition}
        damping={damping}
        stiffness={stiffness}
        fontSize={fontSize}
        textColor={section.textColor}
        showIcon={shouldShowIcon}
        showFlag={section.showFlag}
        style={section.style}
      />
    </section>
  )
}
