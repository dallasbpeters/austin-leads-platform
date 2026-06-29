import { notFound } from 'next/navigation'

import DigitalCard from '@/components/cards/digital-card'
import { getAllCardSlugs, getCardBySlug } from '@/lib/platform/cards'
import { getImageUrl } from '@/lib/platform/imageSource'

export const dynamic = 'force-dynamic'

export const generateStaticParams = async () => {
  const slugs = await getAllCardSlugs()
  return slugs.filter(Boolean).map((slug) => ({ slug }))
}

export const generateMetadata = async ({ params }) => {
  const { slug } = await params
  const card = await getCardBySlug(slug)
  if (!card) {
    return {}
  }
  const title = [card.fullName, card.business].filter(Boolean).join(' — ')
  const description = card.bio ? card.bio.slice(0, 160) : `Digital business card for ${card.fullName}`
  const image = getImageUrl(card.photo, null, { width: 1200 })
  return {
    title: `${card.fullName}'s Digital Business Card`,
    description,
    // Personal cards stay out of search results, matching the original microsite.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

const CardPage = async ({ params }) => {
  const { slug } = await params
  const card = await getCardBySlug(slug)
  if (!card) {
    notFound()
  }
  return <DigitalCard card={card} />
}

export default CardPage
