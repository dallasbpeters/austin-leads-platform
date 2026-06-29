import DigitalCard from '@/components/cards/digital-card'

// TEMP preview route for visual verification — delete after checking.
const mock = {
  fullName: 'Kathie Millen',
  jobTitle: 'Owner',
  business: 'Texas Solar & Roofing Pros',
  bio: 'Texas Solar and Roofing Pros is a leading provider of roofing and solar solutions in Texas. With a commitment to quality craftsmanship and customer satisfaction, the company specializes in both traditional roofing services and innovative solar panel installations.',
  phone: '+15127750561',
  website: 'https://texassolarandroofingpros.com',
  address: {
    street: '1700 Pagedale Cove',
    city: 'Cedar Park',
    state: 'Texas',
    postal: '78613',
    country: 'USA',
  },
  colors: { logoBg: '#01064A', mainBg: '#F9FAFB', buttonBg: '#000033', cardBg: '#E5E7EB' },
  photo: { asset: { url: '/kathie/photo.png' } },
  links: [],
}

const CardPreviewPage = () => <DigitalCard card={mock} />

export default CardPreviewPage
