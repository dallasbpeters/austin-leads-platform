import CanonicalStorySection from '@/components/StorySection'

/**
 * Multi-tenant section renderer for `_type: 'storySection'`.
 *
 * Thin forwarder over the canonical StorySection so the karaoke word-by-word
 * reveal stays in one place. Per-tenant theming flows through the active
 * `<slug>-theme` CSS class on the document root, not through duplicated logic.
 */
export function StorySection({ section, sectionId }) {
  return <CanonicalStorySection section={section} sectionId={sectionId} />
}

export default StorySection
