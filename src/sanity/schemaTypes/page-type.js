// oxlint-disable no-nested-ternary, func-style no-eq-null
import { BlockContentIcon } from '@sanity/icons/BlockContent'
import { CircleIcon } from '@sanity/icons/Circle'
import { defineArrayMember, defineField } from 'sanity'

import ChartPointsJsonInput from '../components/chart-points-json-input'

const canvasExclude = { canvasApp: { exclude: true } }
const canvasPurpose = (purpose) => ({ canvasApp: { purpose } })
const portableTextParagraph = (key, text) => [
  {
    _key: key,
    _type: 'block',
    style: 'normal',
    children: [{ _key: `${key}-span`, _type: 'span', text }],
  },
]

/**
 * Generate an inline image field definition with hotspot/crop enabled.
 *
 * Matches the pattern used in reference projects where hotspot works reliably:
 * bare `type: 'image'` with `options: { hotspot: true }`, NOT a named wrapper type.
 * Alt text fields are included inline so the Studio treats it as a direct image type.
 */
const defineUploadedImage = (name, title, extraOptions = {}) => ({
  name,
  title,
  type: 'image',
  options: {
    hotspot: true,
    collapsible: false,
    ...extraOptions,
  },
  fields: [
    { name: 'altText', title: 'Alt text', type: 'string' },
    { name: 'alt', title: 'Legacy alt text', type: 'string', hidden: true },
  ],
})
const sectionBackgroundImageField = {
  name: 'sectionBackgroundImage',
  title: 'Section background image',
  type: 'image',
  options: {
    hotspot: true,
    collapsible: false,
    ...canvasPurpose('Optional shared background image for this section.'),
  },
  fields: [
    { name: 'altText', title: 'Alt text', type: 'string' },
    { name: 'alt', title: 'Legacy alt text', type: 'string', hidden: true },
  ],
}

const sectionBackgroundFields = [
  {
    name: 'sectionBackgroundColor',
    title: 'Section background color',
    type: 'color',
    options: canvasPurpose('Optional shared background color for this section.'),
  },
  sectionBackgroundImageField,
]

const cloudVisibilityField = {
  name: 'cloudVisibility',
  title: 'Cloud background',
  type: 'string',
  initialValue: 'show',
  options: {
    list: [
      { title: 'Show clouds', value: 'show' },
      { title: 'Hide clouds', value: 'hide' },
    ],
    layout: 'dropdown',
    ...canvasPurpose('Show or hide the animated cloud background behind this section.'),
  },
}

const withSectionBackgroundFields = (fields) => [...fields, ...sectionBackgroundFields]
const isSectionType = (parent, ...types) => types.includes(parent?.type)
const hideUnlessSectionTypes =
  (...types) =>
  ({ parent }) =>
    !isSectionType(parent, ...types)
const resolveHeroMediaMode = (parent) =>
  parent?.heroMediaMode ||
  (Array.isArray(parent?.heroSlides) && parent.heroSlides.length ? 'slides' : 'single')
const hideUnlessHeroMediaMode =
  (...modes) =>
  ({ parent }) =>
    !modes.includes(resolveHeroMediaMode(parent))
const richTextToPreviewString = (value) => {
  if (typeof value === 'string') {
    return value
  }
  if (!Array.isArray(value)) {
    return ''
  }

  return value
    .map((block) => {
      if (typeof block === 'string') {
        return block
      }
      if (Array.isArray(block?.children)) {
        return block.children.map((child) => child?.text || '').join('')
      }

      return ''
    })
    .filter(Boolean)
    .join(' ')
}
const previewText = (value, fallback) => {
  const normalized = richTextToPreviewString(value).replaceAll(/\s+/gu, ' ').trim()
  if (!normalized) {
    return fallback
  }
  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized
}
/** Keeps the section block type visible in the Sections array list even when body copy exists. */
const pageSectionListSubtitle = (sectionLabel, ...sources) => {
  for (const source of sources) {
    if (source === null || source === false) {
      continue
    }
    const piece =
      typeof source === 'string' ? source.replaceAll(/\s+/gu, ' ').trim() : previewText(source, '')
    if (piece) {
      return `${sectionLabel} · ${piece}`
    }
  }
  return sectionLabel
}
const LEGACY_PAGE_SECTION_LABELS = {
  hero: 'Hero',
  story: 'Story',
  quote: 'Quote',
  cta: 'CTA',
  ctaBanner: 'Cross-lead banner',
  bannerCta: 'Banner CTA',
  highlights: 'Highlights',
  steps: 'Steps',
  faq: 'FAQ',
  guideGrid: 'Guide grid',
  serviceGrid: 'Service grid',
  resourceGrid: 'Resources',
  hailMap: 'Hail map',
}
const legacyPageSectionTypeLabel = (type) =>
  (type && LEGACY_PAGE_SECTION_LABELS[type]) || (type ? `${type} section` : 'Legacy section')
const arrayCount = (value) => (Array.isArray(value) ? value.length : 0)
const ctaThemeOptions = [
  { title: 'Light', value: 'light' },
  { title: 'Dark', value: 'dark' },
  { title: 'Christmas Lights', value: 'christmasLights' },
]

const portableTextSimpleType = {
  name: 'portableTextSimple',
  title: 'Rich text',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{ name: 'href', type: 'string', title: 'URL or anchor (#)' }],
          },
        ],
      },
    },
  ],
}

const publicSiteServiceIconOptions = [
  { title: 'Audit', value: 'audit' },
  { title: 'Insulation', value: 'insulation' },
  { title: 'Ducts', value: 'ducts' },
  { title: 'Windows', value: 'windows' },
  { title: 'Heat Pump', value: 'heatpump' },
  { title: 'Solar Battery', value: 'solarbattery' },
  { title: 'Detach & Reset', value: 'detachreset' },
  { title: 'Shingles', value: 'shingles' },
  { title: 'Metal Roofing', value: 'metalroofing' },
  { title: 'Storm Damage', value: 'stormdamage' },
  { title: 'Commercial Roofing', value: 'commercialroofing' },
  { title: 'Hail Inspection', value: 'hailinspection' },
  { title: 'Rodent', value: 'rodent' },
  { title: 'Electrical', value: 'electrical' },
  { title: 'EV Charger', value: 'evcharger' },
]

const publicSiteIconoirOptions = [
  // Solar & Energy
  { title: 'Sun / Solar', value: 'SunLight' },
  { title: 'Cloud Sunny', value: 'CloudSunny' },
  { title: 'Light Bulb', value: 'LightBulbOn' },
  { title: 'Energy Usage', value: 'EnergyUsageWindow' },
  { title: 'Web Energy Consumption', value: 'WebWindowEnergyConsumption' },
  { title: 'Flash / Electricity', value: 'Flash' },
  { title: 'Magnet Energy', value: 'MagnetEnergy' },
  { title: 'Brain Electricity', value: 'BrainElectricity' },
  { title: 'EV Charge', value: 'EvCharge' },
  { title: 'EV Plug', value: 'EvPlug' },
  { title: 'EV Station', value: 'EvStation' },
  { title: 'EV Tag', value: 'EvTag' },
  { title: 'Plug Type A', value: 'PlugTypeA' },
  // Battery & Storage
  { title: 'Battery Full', value: 'BatteryFull' },
  { title: 'Battery Charging', value: 'BatteryCharging' },
  { title: 'Battery 75%', value: 'Battery75' },
  { title: 'Battery 50%', value: 'Battery50' },
  { title: 'Battery 25%', value: 'Battery25' },
  { title: 'Battery Empty', value: 'BatteryEmpty' },
  { title: 'Battery Warning', value: 'BatteryWarning' },
  // Weather & Storm
  { title: 'Thunderstorm', value: 'Thunderstorm' },
  { title: 'Heavy Rain', value: 'HeavyRain' },
  { title: 'Rain', value: 'Rain' },
  { title: 'Wind', value: 'Wind' },
  { title: 'Cloud', value: 'Cloud' },
  { title: 'Snow', value: 'Snow' },
  { title: 'Snowflake', value: 'SnowFlake' },
  { title: 'Temperature High', value: 'TemperatureHigh' },
  { title: 'Temperature Low', value: 'TemperatureLow' },
  { title: 'Temperature Up', value: 'TemperatureUp' },
  { title: 'Temperature Down', value: 'TemperatureDown' },
  { title: 'Droplet', value: 'Droplet' },
  { title: 'Sea and Sun', value: 'SeaAndSun' },
  // Home & Building
  { title: 'Home', value: 'Home' },
  { title: 'Home Simple', value: 'HomeSimple' },
  { title: 'Home Simple Door', value: 'HomeSimpleDoor' },
  { title: 'Home Shield / Secure', value: 'HomeShield' },
  { title: 'Home Temperature In', value: 'HomeTemperatureIn' },
  { title: 'Home Temperature Out', value: 'HomeTemperatureOut' },
  { title: 'Home Sale', value: 'HomeSale' },
  { title: 'Home User', value: 'HomeUser' },
  { title: 'House Rooms', value: 'HouseRooms' },
  { title: 'Building', value: 'Building' },
  { title: 'Garage', value: 'Garage' },
  { title: 'Elevator', value: 'Elevator' },
  { title: 'Bed', value: 'Bed' },
  { title: 'Bathroom', value: 'Bathroom' },
  // Roofing & Construction
  { title: 'Hammer', value: 'Hammer' },
  { title: 'Wrench', value: 'Wrench' },
  { title: 'Tools', value: 'Tools' },
  { title: 'Ruler', value: 'Ruler' },
  { title: 'Ruler Combine', value: 'RulerCombine' },
  { title: 'Design Pencil', value: 'DesignPencil' },
  { title: 'Precision Tool', value: 'PrecisionTool' },
  { title: 'Pipe 3D', value: 'Pipe3d' },
  // Climate & HVAC
  { title: 'Air Conditioner', value: 'AirConditioner' },
  { title: 'Heating', value: 'HeatingSquare' },
  { title: 'Cooling', value: 'CoolingSquare' },
  { title: 'Bonfire / Heat', value: 'Bonfire' },
  { title: 'Fire Flame', value: 'FireFlame' },
  // Nature & Eco
  { title: 'Leaf', value: 'Leaf' },
  { title: 'Tree', value: 'Tree' },
  { title: 'Pine Tree', value: 'PineTree' },
  { title: 'Ecology Book', value: 'EcologyBook' },
  { title: 'Watering Soil', value: 'WateringSoil' },
  // Safety & Protection
  { title: 'Shield', value: 'Shield' },
  { title: 'Shield Check', value: 'ShieldCheck' },
  { title: 'Shield Alert', value: 'ShieldAlert' },
  { title: 'Shield Broken', value: 'ShieldBroken' },
  { title: 'Shield Search', value: 'ShieldSearch' },
  { title: 'Shield Question', value: 'ShieldQuestion' },
  { title: 'Health Shield', value: 'HealthShield' },
  { title: 'Lock', value: 'Lock' },
  { title: 'Key', value: 'Key' },
  { title: 'Warning Triangle', value: 'WarningTriangle' },
  { title: 'Warning Circle', value: 'WarningCircle' },
  { title: 'Warning Hexagon', value: 'WarningHexagon' },
  // Money & Finance
  { title: 'Dollar', value: 'Dollar' },
  { title: 'Dollar Circle', value: 'DollarCircle' },
  { title: 'Cash', value: 'Cash' },
  { title: 'Lot of Cash', value: 'LotOfCash' },
  { title: 'Hand Cash', value: 'HandCash' },
  { title: 'Hand Card', value: 'HandCard' },
  { title: 'Credit Card', value: 'CreditCard' },
  { title: 'Coins', value: 'Coins' },
  { title: 'Coins Swap', value: 'CoinsSwap' },
  { title: 'Wallet', value: 'Wallet' },
  { title: 'Piggy Bank', value: 'PiggyBank' },
  { title: 'Bank', value: 'Bank' },
  { title: 'Send Dollars', value: 'SendDollars' },
  { title: 'Receive Dollars', value: 'ReceiveDollars' },
  { title: 'Percentage', value: 'Percentage' },
  { title: 'Percentage Circle', value: 'PercentageCircle' },
  // Communication
  { title: 'Phone', value: 'Phone' },
  { title: 'Mail', value: 'Mail' },
  { title: 'Mail Open', value: 'MailOpen' },
  { title: 'Send', value: 'Send' },
  { title: 'Send Diagonal', value: 'SendDiagonal' },
  { title: 'Chat Bubble', value: 'ChatBubble' },
  { title: 'Chat Lines', value: 'ChatLines' },
  { title: 'Megaphone', value: 'Megaphone' },
  // People & Users
  { title: 'User', value: 'User' },
  { title: 'User Circle', value: 'UserCircle' },
  { title: 'User Badge Check', value: 'UserBadgeCheck' },
  { title: 'User Star', value: 'UserStar' },
  { title: 'People Tag', value: 'PeopleTag' },
  { title: 'Group', value: 'Group' },
  { title: 'Profile Circle', value: 'ProfileCircle' },
  { title: 'Community', value: 'Community' },
  // Documents & Data
  { title: 'Book', value: 'Book' },
  { title: 'Open Book', value: 'OpenBook' },
  { title: 'Book Stack', value: 'BookStack' },
  { title: 'Clipboard Check', value: 'ClipboardCheck' },
  { title: 'Doc Star', value: 'DocStar' },
  { title: 'Doc Magnifying Glass', value: 'DocMagnifyingGlass' },
  { title: 'Submit Document', value: 'SubmitDocument' },
  { title: 'Task List', value: 'TaskList' },
  { title: 'Stats Report', value: 'StatsReport' },
  { title: 'Graph Up', value: 'GraphUp' },
  { title: 'Graph Down', value: 'GraphDown' },
  { title: 'Stat Up', value: 'StatUp' },
  { title: 'Stat Down', value: 'StatDown' },
  // Status & Validation
  { title: 'Check Circle', value: 'CheckCircle' },
  { title: 'Check Square', value: 'CheckSquare' },
  { title: 'Double Check', value: 'DoubleCheck' },
  { title: 'Badge Check', value: 'BadgeCheck' },
  { title: 'Star', value: 'Star' },
  { title: 'Three Stars', value: 'ThreeStars' },
  { title: 'Trophy', value: 'Trophy' },
  { title: 'Medal', value: 'Medal' },
  { title: 'Bright Star', value: 'BrightStar' },
  { title: 'Heart', value: 'Heart' },
  { title: 'Leaderboard Star', value: 'LeaderboardStar' },
  // Search & Navigation
  { title: 'Search', value: 'Search' },
  { title: 'Area Search', value: 'AreaSearch' },
  { title: 'Map', value: 'Map' },
  { title: 'Map Pin', value: 'MapPin' },
  { title: 'Compass', value: 'Compass' },
  { title: 'Globe', value: 'Globe' },
  { title: 'Pin', value: 'Pin' },
  // Scheduling & Time
  { title: 'Calendar', value: 'Calendar' },
  { title: 'Calendar Check', value: 'CalendarCheck' },
  { title: 'Calendar Plus', value: 'CalendarPlus' },
  { title: 'Clock', value: 'Clock' },
  { title: 'Clock Rotate', value: 'ClockRotateRight' },
  // Media & Visual
  { title: 'Camera', value: 'Camera' },
  { title: 'Eye', value: 'Eye' },
  { title: 'Media Image', value: 'MediaImage' },
  { title: 'Info Circle', value: 'InfoCircle' },
  { title: 'Question Mark', value: 'QuestionMark' },
  // Transport & Delivery
  { title: 'Truck', value: 'Truck' },
  { title: 'Delivery Truck', value: 'DeliveryTruck' },
  { title: 'Car', value: 'Car' },
  { title: 'Package', value: 'Package' },
  { title: 'Box', value: 'Box' },
  // Actions
  { title: 'Download', value: 'Download' },
  { title: 'Upload', value: 'Upload' },
  { title: 'Refresh', value: 'Refresh' },
  { title: 'Settings', value: 'Settings' },
  { title: 'Filter', value: 'Filter' },
  { title: 'Sort', value: 'Sort' },
  { title: 'Share', value: 'ShareIos' },
  { title: 'Link', value: 'Link' },
]

const publicSiteIconOptions = [...publicSiteServiceIconOptions, ...publicSiteIconoirOptions]
const guideCardColorOptions = [
  { title: 'Primary', value: 'primary' },
  { title: 'Sweetcorn', value: 'sweetcorn' },
  { title: 'Voodoo', value: 'voodoo' },
  { title: 'Tidal', value: 'tidal' },
  { title: 'Secondary Alt', value: 'secondaryAlt' },
  { title: 'Blue 400', value: 'blue400' },
  { title: 'Secondary', value: 'secondary' },
  { title: 'Tasman', value: 'tasman' },
  { title: 'Chalet Green', value: 'chaletGreen' },
  { title: 'Metterhorn', value: 'metterhorn' },
  { title: 'Heather', value: 'heather' },
  { title: 'Wattle', value: 'wattle' },
  { title: 'Charade', value: 'charade' },
  { title: 'Ceramic', value: 'ceramic' },
  { title: 'Tapa Green', value: 'tapaGreen' },
  { title: 'Sea Mist', value: 'seaMist' },
  { title: 'Black Current', value: 'blackCurrent' },
  { title: 'Confetti', value: 'confetti' },
]

const heroImageUrlsType = {
  name: 'heroImageUrls',
  title: 'Hero Image URLs',
  type: 'object',
  options: canvasExclude,
  fields: [
    { name: 'raw', title: 'Raw', type: 'string', options: canvasExclude },
    { name: 'full', title: 'Full', type: 'string', options: canvasExclude },
    { name: 'regular', title: 'Regular', type: 'string', options: canvasExclude },
    { name: 'small', title: 'Small', type: 'string', options: canvasExclude },
    { name: 'thumb', title: 'Thumb', type: 'string', options: canvasExclude },
  ],
}

const heroImageType = {
  name: 'heroImage',
  title: 'Hero Image',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    { name: 'source', title: 'Source', type: 'string', options: canvasExclude },
    { name: 'unsplashId', title: 'Unsplash ID', type: 'string', options: canvasExclude },
    { name: 'alt', title: 'Alt text', type: 'string', options: canvasExclude },
    { name: 'description', title: 'Description', type: 'text', options: canvasExclude },
    { name: 'color', title: 'Color', type: 'string', options: canvasExclude },
    { name: 'blurHash', title: 'BlurHash', type: 'string', options: canvasExclude },
    { name: 'width', title: 'Width', type: 'number', options: canvasExclude },
    { name: 'height', title: 'Height', type: 'number', options: canvasExclude },
    { name: 'creditName', title: 'Photographer name', type: 'string', options: canvasExclude },
    {
      name: 'creditUsername',
      title: 'Photographer username',
      type: 'string',
      options: canvasExclude,
    },
    { name: 'creditUrl', title: 'Photographer URL', type: 'url', options: canvasExclude },
    { name: 'unsplashUrl', title: 'Unsplash photo URL', type: 'url', options: canvasExclude },
    { name: 'downloadLocation', title: 'Download location', type: 'url', options: canvasExclude },
    { name: 'urls', title: 'Image URLs', type: 'heroImageUrls', options: canvasExclude },
  ],
  preview: {
    select: {
      title: 'alt',
      subtitle: 'creditName',
      media: 'urls.thumb',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Hero image',
        subtitle: subtitle ? `Photo by ${subtitle}` : 'Image metadata',
        media: media ?? BlockContentIcon,
      }
    },
  },
}

const uploadedImageType = {
  name: 'uploadedImage',
  title: 'Uploaded Image',
  type: 'image',
  options: {
    hotspot: true,
    collapsible: false,
  },
  fields: [
    {
      name: 'altText',
      title: 'Alt text',
      type: 'string',
    },
    {
      name: 'alt',
      title: 'Legacy alt text',
      type: 'string',
      hidden: true,
    },
  ],
}

const heroVideoUrlsType = {
  name: 'heroVideoUrls',
  title: 'Hero Video URLs',
  type: 'object',
  options: canvasExclude,
  fields: [
    { name: 'mp4', title: 'MP4 URL', type: 'url', options: canvasExclude },
    { name: 'webm', title: 'WebM URL', type: 'url', options: canvasExclude },
    { name: 'hls', title: 'HLS playlist URL', type: 'url', options: canvasExclude },
    { name: 'poster', title: 'Poster image URL', type: 'url', options: canvasExclude },
  ],
}

const heroVideoType = {
  name: 'heroVideo',
  title: 'Hero Video',
  type: 'object',
  fields: [
    {
      name: 'provider',
      title: 'Provider',
      type: 'string',
      options: {
        list: [
          { title: 'Direct URL / encoded files', value: 'external' },
          { title: 'Sanity upload', value: 'upload' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Mux', value: 'mux' },
          { title: 'Cloudinary', value: 'cloudinary' },
        ],
        layout: 'dropdown',
        ...canvasPurpose('Where this video is hosted. Pick "Sanity upload" to use the file uploaded below.'),
      },
      initialValue: 'external',
    },
    {
      name: 'externalId',
      title: 'External video ID',
      type: 'string',
      options: canvasPurpose(
        'Provider-specific identifier (YouTube/Vimeo ID, Mux playback ID, Cloudinary public ID).',
      ),
    },
    {
      name: 'url',
      title: 'Video URL',
      type: 'url',
      options: canvasPurpose('Direct video URL (used when no encoded files or provider ID is available).'),
    },
    {
      name: 'urls',
      title: 'Encoded URLs',
      type: 'heroVideoUrls',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage(
        'posterImage',
        'Poster image',
        canvasPurpose('Still frame shown before playback and as a fallback for non-video clients.'),
      ),
    },
    {
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      options: canvasPurpose('Short description for accessibility and SEO.'),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      options: canvasExclude,
    },
    { name: 'duration', title: 'Duration (seconds)', type: 'number', options: canvasExclude },
    { name: 'width', title: 'Width', type: 'number', options: canvasExclude },
    { name: 'height', title: 'Height', type: 'number', options: canvasExclude },
    {
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      initialValue: true,
      options: canvasExclude,
    },
    {
      name: 'loop',
      title: 'Loop',
      type: 'boolean',
      initialValue: true,
      options: canvasExclude,
    },
    {
      name: 'muted',
      title: 'Muted',
      type: 'boolean',
      initialValue: true,
      options: canvasPurpose(
        'Required for autoplay in most browsers. Leave on unless the video has narration.',
      ),
    },
    {
      name: 'controls',
      title: 'Show playback controls',
      type: 'boolean',
      initialValue: false,
      options: canvasExclude,
    },
    {
      name: 'playsInline',
      title: 'Plays inline on mobile',
      type: 'boolean',
      initialValue: true,
      options: canvasExclude,
    },
  ],
  preview: {
    select: {
      title: 'alt',
      provider: 'provider',
      externalId: 'externalId',
      url: 'url',
      mp4: 'urls.mp4',
      poster: 'posterImage',
    },
    prepare({ title, provider, externalId, url, mp4, poster }) {
      const subtitle =
        provider === 'upload'
          ? 'Sanity upload'
          : externalId
            ? `${provider || 'external'} · ${externalId}`
            : url || mp4 || 'No source set'

      return {
        title: title || 'Hero video',
        subtitle: previewText(subtitle, 'Video metadata'),
        media: poster ?? BlockContentIcon,
      }
    },
  },
}

const uploadedVideoType = {
  name: 'uploadedVideo',
  title: 'Uploaded Video',
  type: 'file',
  options: {
    accept: 'video/mp4,video/webm,video/quicktime,video/*',
  },
  fields: [
    {
      name: 'altText',
      title: 'Alt text',
      type: 'string',
      options: canvasPurpose('Short description for accessibility and SEO.'),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage(
        'posterImage',
        'Poster image',
        canvasPurpose('Optional still frame shown before playback.'),
      ),
    },
  ],
}

const bandColorStopType = {
  name: 'bandColorStop',
  title: 'Band Color',
  type: 'object',
  fields: [
    {
      name: 'color',
      title: 'Color',
      type: 'color',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      colorHex: 'color.hex',
    },
    prepare({ colorHex }) {
      return {
        title: colorHex || 'Band color',
      }
    },
  },
}

const pageMetricType = {
  name: 'pageMetric',
  title: 'Metric',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      options: canvasPurpose('Metric label.'),
    },
    {
      name: 'value',
      title: 'Value',
      type: 'string',
      options: canvasPurpose('Metric value.'),
    },
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'value',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Metric',
        subtitle: subtitle || 'No value',
      }
    },
  },
}

const pageActionType = {
  name: 'pageAction',
  title: 'Page Action',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Button label or link label for the action.'),
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Link target for the action button.'),
    },
    {
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: ['default', 'secondary', 'outline'],
        ...canvasExclude,
      },
    },
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'href',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Page action',
        subtitle: subtitle || 'No link target',
      }
    },
  },
}

const pageItemType = {
  name: 'pageItem',
  title: 'Content Item',
  type: 'object',
  fields: [
    {
      name: 'number',
      title: 'Number',
      type: 'string',
      options: canvasPurpose('Optional short index label such as 01, 02, or 03.'),
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short overline or supporting label for the item.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Item title or card heading.'),
    },
    {
      name: 'subtitleLabel',
      title: 'Subtitle Label',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional label for the subtitle.'),
    },
    {
      name: 'subtitleValue',
      title: 'Subtitle Value',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional longer description or supporting text for the item.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting text for the item.'),
    },
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      options: canvasPurpose('Question text for FAQ-style items.'),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'portableTextSimple',
      options: canvasPurpose('Answer text for FAQ-style items.'),
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      options: canvasPurpose('Optional link target for this item when it should open another page.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Optional CTA label for guide and card-style items.'),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: canvasPurpose('Optional category label for filtering or grouping card-style items.'),
    },
    {
      name: 'color',
      title: 'Card color',
      type: 'string',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Optional fixed color token for card-style items.'),
      },
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Select the icon that best matches this card or item.'),
      },
    },
    {
      name: 'image',
      title: 'Image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
    {
      name: 'imageUrl',
      title: 'Image URL',
      type: 'string',
      options: canvasPurpose(
        'Optional direct image path or URL for cards that should render a specific image without using Unsplash metadata or an uploaded asset.',
      ),
    },
    {
      name: 'video',
      title: 'Video',
      type: 'heroVideo',
      options: canvasExclude,
    },
    {
      name: 'videoAsset',
      title: 'Uploaded video',
      type: 'uploadedVideo',
      options: canvasExclude,
    },
  ],
  preview: {
    select: {
      title: 'title',
      question: 'question',
      subtitle: 'body',
      eyebrow: 'eyebrow',
      answer: 'answer',
    },
    prepare({ title, question, subtitle, eyebrow, answer }) {
      return {
        title: title || question || 'Content item',
        subtitle: previewText(subtitle || answer || eyebrow, 'Supporting content'),
      }
    },
  },
}

const snapshotItemType = {
  name: 'snapshotItem',
  title: 'Snapshot card',
  type: 'object',
  fields: [
    {
      name: 'number',
      title: 'Big number',
      type: 'string',
      options: canvasPurpose('The figure the card leads with, such as $18k-$28k or 7-9 years.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Shown when there is no big number, or as the label under it.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('One or two sentences that explain the figure.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Select the icon that best matches this card.'),
      },
    },
    {
      name: 'color',
      title: 'Card color',
      type: 'string',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Optional fixed color for the card. Leave empty for the dark glass look.'),
      },
    },
    {
      name: 'image',
      title: 'Background image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded background image', canvasExclude),
    },
    {
      name: 'imageUrl',
      title: 'Background image URL',
      type: 'string',
      options: canvasPurpose('Optional direct image URL used when no image asset is set.'),
    },
    {
      name: 'video',
      title: 'Background video',
      type: 'heroVideo',
      options: canvasExclude,
    },
    {
      name: 'videoAsset',
      title: 'Uploaded background video',
      type: 'uploadedVideo',
      options: canvasExclude,
    },
  ],
  preview: {
    select: { title: 'title', number: 'number', subtitle: 'body', color: 'color' },
    prepare({ title, number, subtitle, color }) {
      return {
        title: [number, title].filter(Boolean).join(' · ') || 'Snapshot card',
        subtitle: previewText(subtitle, color ? `Color: ${color}` : 'Supporting content'),
      }
    },
  },
}

const serviceGridItemType = {
  name: 'serviceGridItem',
  title: 'Service Card',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'isRecommended',
      title: 'Is recommended',
      type: 'boolean',
      initialValue: false,
      options: canvasPurpose('Whether this section is recommended for the page.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Service name shown as the card heading.'),
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short label shown above the title in a smaller accent style.'),
    },
    {
      name: 'number',
      title: 'Number badge',
      type: 'string',
      options: canvasPurpose('Optional large number shown instead of an icon (e.g. 01, 02, 03).'),
    },
    {
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      options: {
        step: 0.01,
        ...canvasPurpose(
          'Dollars. The public site shows two decimal places (e.g. $300.00). The input may not show trailing zeros until you use decimals.',
        ),
      },
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'body',
      title: 'Description',
      type: 'portableTextSimple',
      options: canvasPurpose('Short supporting copy shown below the title on the card.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Icon shown in the card badge. Leave blank to use the number badge instead.'),
      },
    },
    {
      name: 'href',
      title: 'Link',
      type: 'string',
      options: canvasPurpose('Optional URL — makes the entire card a clickable link.'),
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
    {
      name: 'imageUrl',
      title: 'Image URL',
      type: 'string',
      options: canvasPurpose(
        'Fallback image URL when no uploaded image is set. Leave blank to use the auto-matched service image.',
      ),
    },
    {
      name: 'cardColor',
      title: 'Card overlay color',
      type: 'color',
      options: canvasPurpose(
        'Color of the gradient overlay on this card. Defaults to the site dark color when left empty.',
      ),
    },
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      subtitle: 'body',
      price: 'price',
      media: 'imageAsset',
      isRecommended: 'isRecommended',
    },
    prepare({ title, eyebrow, subtitle, price, media, isRecommended }) {
      const line = isRecommended ? 'Recommended' : previewText(eyebrow || subtitle, '')
      const priceLine =
        price !== null && Number.isFinite(Number(price)) ? `$${Number(price).toFixed(2)}` : null
      const subtitleText = [priceLine, line || null].filter(Boolean).join(' · ') || 'Service card'
      return {
        title: title || 'Service card',
        subtitle: subtitleText.trim(),
        media: media ?? BlockContentIcon,
      }
    },
  },
}

const guideCardItemType = {
  name: 'guideCardItem',
  title: 'Guide Card Item',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'number',
      title: 'Number',
      type: 'string',
      options: canvasPurpose('Optional short index label such as 01, 02, or 03.'),
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short overline or supporting label for the guide card.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Guide card title.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Guide card summary copy.'),
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      options: canvasPurpose('Link target for this guide card.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Optional guide-card CTA label.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Select the icon that best matches this guide card.'),
      },
    },
    {
      name: 'color',
      title: 'Card color',
      type: 'string',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Choose a fixed color for this guide card.'),
      },
    },
    {
      name: 'image',
      title: 'External image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
    {
      name: 'imageUrl',
      title: 'Image URL',
      type: 'string',
      options: canvasPurpose('Optional direct image path or URL for this guide card.'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      href: 'href',
      media: 'imageAsset',
    },
    prepare({ title, subtitle, href, media }) {
      return {
        title: title || 'Guide card',
        subtitle: previewText(subtitle, href || 'Guide card content'),
        media: media ?? BlockContentIcon,
      }
    },
  },
}

const energyChartPointType = {
  name: 'energyChartPoint',
  title: 'Chart point',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('X-axis label for this point, such as Jul or Aug.'),
    },
    {
      name: 'barValue',
      title: 'Primary value',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
      options: canvasPurpose(
        'Primary metric for this point. Used by bar/pie charts, and as X for scatter charts (for example: kWh, revenue, count).',
      ),
    },
    {
      name: 'lineValue',
      title: 'Secondary value',
      type: 'number',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose(
        'Secondary metric for this point. Used by line/area charts, and as Y for scatter charts (for example: temperature, rate, score).',
      ),
    },
    {
      name: 'areaValues',
      title: 'Area series values',
      type: 'array',
      of: [{ type: 'number', validation: (Rule) => Rule.min(0) }],
      options: canvasPurpose(
        'Optional. With exactly two area series, the chart uses Primary + Secondary values only—edit those fields as the source of truth. Use this list for three or more series (same order as Area chart series).',
      ),
    },
  ],
  preview: {
    select: {
      title: 'label',
      barValue: 'barValue',
      lineValue: 'lineValue',
      areaValues: 'areaValues',
    },
    prepare({ title, barValue, lineValue, areaValues }) {
      const extra = Array.isArray(areaValues) && areaValues.length ? ` • ${areaValues.length} area vals` : ''
      return {
        title: title || 'Chart point',
        subtitle: `Primary ${barValue ?? 0} • Secondary ${lineValue ?? 0}${extra}`,
      }
    },
  },
}

const energyChartAreaSeriesItemType = {
  name: 'energyChartAreaSeriesItem',
  title: 'Area series',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Legend label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Shown in the legend and tooltips for this area.'),
    },
    {
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Fill and stroke color for this area.'),
      },
    },
  ],
  preview: {
    select: { title: 'title', color: 'color' },
    prepare({ title, color }) {
      return {
        title: title || 'Series',
        subtitle: color || 'default palette',
      }
    },
  },
}

const sectionContentItemType = {
  name: 'sectionContentItem',
  title: 'Section Item',
  type: 'object',
  fields: [
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose(
        'Optional short overline or category label shown above the title (e.g. "Highlight", "Step", "Result").',
      ),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Item title or step heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Supporting copy for the item.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Optional icon for highlight or step items.'),
      },
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      options: canvasPurpose('Optional link target if the item should link somewhere.'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      eyebrow: 'eyebrow',
    },
    prepare({ title, subtitle, eyebrow }) {
      return {
        title: title || 'Section item',
        subtitle: previewText(subtitle || eyebrow, 'Supporting content'),
      }
    },
  },
}

const logoMarqueeItemType = {
  name: 'logoMarqueeItem',
  title: 'Logo Marquee Item',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'title',
      title: 'Logo label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Used as the logo alt text and internal label.'),
    },
    {
      name: 'href',
      title: 'Link',
      type: 'string',
      options: canvasPurpose('Optional external URL for this logo.'),
    },
    {
      name: 'image',
      title: 'External image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
  ],
  preview: {
    select: {
      title: 'title',
      assetUrl: 'imageAsset.asset.url',
      imageAlt: 'image.alt',
      href: 'href',
    },
    prepare({ title, assetUrl, imageAlt, href }) {
      return {
        title: title || 'Logo',
        subtitle: href || assetUrl || imageAlt || 'Marquee logo item',
        media: BlockContentIcon,
      }
    },
  },
}

const heroSlideItemType = {
  name: 'heroSlideItem',
  title: 'Hero Slide',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Internal label for this slide.'),
    },
    {
      name: 'image',
      title: 'External image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
  ],
  preview: {
    select: {
      title: 'title',
      assetUrl: 'imageAsset.asset.url',
      imageAlt: 'image.alt',
    },
    prepare({ title, assetUrl, imageAlt }) {
      return {
        title: title || 'Hero slide',
        subtitle: assetUrl ? 'Uploaded image' : imageAlt || 'External image',
        media: BlockContentIcon,
      }
    },
  },
}

const pageFaqItemType = {
  name: 'pageFaqItem',
  title: 'FAQ Item',
  type: 'object',
  fields: [
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Question shown in the FAQ row.'),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Answer shown when the FAQ item is opened.'),
    },
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'answer',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'FAQ item',
        subtitle: previewText(subtitle, 'Answer'),
      }
    },
  },
}

const resourceCardType = {
  name: 'resourceCard',
  title: 'Resource Card',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Select the card icon.'),
      },
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Card title.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Short supporting copy for the card.'),
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      options: canvasPurpose('Destination URL or anchor for the card.'),
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
    {
      name: 'image',
      title: 'External image',
      type: 'heroImage',
      options: canvasExclude,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Resource card',
        subtitle: previewText(subtitle, 'Homepage resource card'),
        media: BlockContentIcon,
      }
    },
  },
}

const resourceGridSectionType = {
  name: 'resourceGridSection',
  title: 'Resources Section',
  type: 'object',
  icon: BlockContentIcon,
  initialValue: {
    type: 'resourceGrid',
  },
  fields: withSectionBackgroundFields([
    {
      name: 'type',
      title: 'Section type',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy above the resource cards.'),
    },
    {
      name: 'items',
      title: 'Cards',
      type: 'array',
      validation: (Rule) => Rule.min(1).max(6),
      of: [{ type: 'resourceCard' }],
      options: canvasPurpose('Homepage resource cards.'),
    },
    cloudVisibilityField,
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      items: 'items',
    },
    prepare({ title, body, items }) {
      const cardCount = arrayCount(items)
      return {
        title: title || 'Resources section',
        subtitle: pageSectionListSubtitle('Resources section', body, `${cardCount || 0} cards`),
        media: BlockContentIcon,
      }
    },
  },
}

const guideGridSectionType = {
  name: 'guideGridSection',
  title: 'Guide Grid Section',
  type: 'object',
  initialValue: {
    type: 'guideGrid',
  },
  fields: withSectionBackgroundFields([
    {
      name: 'type',
      title: 'Section type',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading for the guide library or guide grid.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy above the guide grid.'),
    },
    {
      name: 'items',
      title: 'Guide cards',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [{ type: 'pageItem' }],
      options: canvasPurpose(
        'Each card image should match that guide’s hero. The site uses the guide hero as the source of truth; use document actions “Sync hero → guides listing” on a guide post, or on the Guides page “Refresh cards from guide heroes” / “Push card images → guide heroes”.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      items: 'items',
    },
    prepare({ title, body, items }) {
      const cardCount = arrayCount(items)
      return {
        title: title || 'Guide grid',
        subtitle: pageSectionListSubtitle('Guide grid', body, `${cardCount || 0} guides`),
      }
    },
  },
}

const serviceGridSectionType = {
  name: 'serviceGridSection',
  title: 'Service Grid Section',
  type: 'object',
  icon: BlockContentIcon,
  initialValue: {
    type: 'serviceGrid',
  },
  fields: withSectionBackgroundFields([
    {
      name: 'type',
      title: 'Section type',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short label above the section heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading for the service grid.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting line above the body copy.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Short supporting copy introducing the service group.'),
    },
    {
      name: 'items',
      title: 'Primary services',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [{ type: 'serviceGridItem' }],
      options: canvasPurpose('Primary service cards shown first in the grid.'),
    },
    {
      name: 'roofingTitle',
      title: 'Roofing group title',
      type: 'string',
      options: canvasPurpose('Optional heading for an additional roofing-related card group.'),
    },
    {
      name: 'roofingItems',
      title: 'Roofing services',
      type: 'array',
      of: [{ type: 'serviceGridItem' }],
      options: canvasPurpose('Optional additional roofing service cards.'),
    },
    {
      name: 'secondaryTitle',
      title: 'Secondary group title',
      type: 'string',
      options: canvasPurpose('Optional heading for a second supporting service group.'),
    },
    {
      name: 'secondaryItems',
      title: 'Secondary services',
      type: 'array',
      of: [{ type: 'serviceGridItem' }],
      options: canvasPurpose('Optional supporting service cards shown after the primary group.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      items: 'items',
      roofingItems: 'roofingItems',
      secondaryItems: 'secondaryItems',
    },
    prepare({ title, eyebrow, items, roofingItems, secondaryItems }) {
      const primaryCount = arrayCount(items)
      const roofingCount = arrayCount(roofingItems)
      const secondaryCount = arrayCount(secondaryItems)
      const countSummary = `${primaryCount || 0} primary / ${roofingCount || 0} roofing / ${secondaryCount || 0} secondary`

      return {
        title: title || 'Service grid',
        subtitle: pageSectionListSubtitle('Service grid', eyebrow, countSummary),
        media: BlockContentIcon,
      }
    },
  },
}

const aboutProfilePersonType = {
  name: 'aboutProfilePerson',
  title: 'About Profile Person',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      options: canvasPurpose('Small overline above the person name.'),
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Person name shown on the card.'),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: canvasPurpose('Short role or descriptor shown below the name.'),
    },
    {
      name: 'blurb',
      title: 'Blurb',
      type: 'portableTextSimple',
      options: canvasPurpose('Short profile summary for this person.'),
    },
    {
      name: 'cardGradientStart',
      title: 'Card gradient start',
      type: 'string',
      initialValue: 'primary',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Theme color token for the start of this person card gradient.'),
      },
    },
    {
      name: 'cardGradientEnd',
      title: 'Card gradient end',
      type: 'string',
      initialValue: 'tidal',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Theme color token for the end of this person card gradient.'),
      },
    },
    {
      name: 'profileImage',
      title: 'Profile image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('profileImageAsset', 'Uploaded profile image', canvasExclude),
    },
    {
      name: 'certificationLabel',
      title: 'Certification label',
      type: 'string',
      options: canvasPurpose('Small label above the certification title.'),
    },
    {
      name: 'certificationTitle',
      title: 'Certification title',
      type: 'string',
      options: canvasPurpose('Certification or credential title for this person.'),
    },
    {
      name: 'badgeImage',
      title: 'Certification badge image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('badgeImageAsset', 'Uploaded certification badge image', canvasExclude),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      cardGradientStart: 'cardGradientStart',
      cardGradientEnd: 'cardGradientEnd',
    },
    prepare({ title, subtitle, cardGradientStart, cardGradientEnd }) {
      return {
        title: title || 'About profile person',
        subtitle: `${subtitle || 'Profile card'} • ${cardGradientStart || 'primary'} to ${cardGradientEnd || 'tidal'}`,
        media: BlockContentIcon,
      }
    },
  },
}

const aboutProfileSectionType = {
  name: 'aboutProfileSection',
  title: 'About Profile Section',
  type: 'object',
  icon: BlockContentIcon,
  initialValue: {
    type: 'aboutProfile',
  },
  fields: withSectionBackgroundFields([
    {
      name: 'type',
      title: 'Section type',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline above the about profile section.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting copy introducing the profile and certification block.'),
    },
    {
      name: 'people',
      title: 'People',
      type: 'array',
      of: [{ type: 'aboutProfilePerson' }],
      options: canvasPurpose('Profile cards shown in this section.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'About profiles',
        subtitle: pageSectionListSubtitle('About profile section', subtitle, 'Profile cards'),
        media: BlockContentIcon,
      }
    },
  },
}

const heroOnlyField = (field) => ({
  ...field,
  hidden: ({ parent }) => parent?.type !== 'hero',
})

const legacyPageSectionFields = [
  { name: 'type', title: 'Section type', type: 'string', options: canvasExclude },
  {
    name: 'eyebrow',
    title: 'Eyebrow',
    type: 'string',
    hidden: hideUnlessSectionTypes('hero', 'story', 'quote', 'ctaBanner'),
    options: canvasPurpose('Short overline or kicker text that introduces the section.'),
  },
  {
    name: 'title',
    title: 'Title',
    type: 'string',
    options: canvasPurpose('Primary heading for this section.'),
  },
  {
    name: 'subtitle',
    title: 'Subtitle',
    type: 'portableTextSimple',
    hidden: hideUnlessSectionTypes('highlights', 'serviceGrid'),
    options: canvasPurpose('Optional supporting line shown above cards or service groups.'),
  },
  {
    name: 'body',
    title: 'Body',
    type: 'portableTextSimple',
    hidden: hideUnlessSectionTypes(
      'hero',
      'story',
      'quote',
      'cta',
      'ctaBanner',
      'guideGrid',
      'serviceGrid',
      'hailMap',
      'resourceGrid',
    ),
    options: canvasPurpose('Main body copy for this section.'),
  },
  {
    name: 'items',
    title: 'Items',
    type: 'array',
    hidden: hideUnlessSectionTypes('highlights', 'steps', 'faq', 'guideGrid', 'serviceGrid'),
    options: canvasPurpose(
      'Repeatable content items like cards, FAQs, or supporting bullets for the section.',
    ),
    of: [{ type: 'pageItem' }],
  },
  {
    name: 'ctaLabel',
    title: 'CTA label',
    type: 'string',
    hidden: hideUnlessSectionTypes('cta', 'ctaBanner'),
    options: canvasPurpose('Label for the main call-to-action button or form submit action.'),
  },
  {
    name: 'roofingTitle',
    title: 'Roofing group title',
    type: 'string',
    hidden: hideUnlessSectionTypes('serviceGrid'),
    options: canvasPurpose('Optional heading for a second roofing service group.'),
  },
  {
    name: 'roofingItems',
    title: 'Roofing services',
    type: 'array',
    hidden: hideUnlessSectionTypes('serviceGrid'),
    of: [{ type: 'pageItem' }],
    options: canvasPurpose('Optional additional roofing service cards.'),
  },
  {
    name: 'secondaryTitle',
    title: 'Secondary group title',
    type: 'string',
    hidden: hideUnlessSectionTypes('serviceGrid'),
    options: canvasPurpose('Optional heading for a second supporting service group.'),
  },
  {
    name: 'secondaryItems',
    title: 'Secondary services',
    type: 'array',
    hidden: hideUnlessSectionTypes('serviceGrid'),
    of: [{ type: 'pageItem' }],
    options: canvasPurpose('Optional supporting service cards shown after the primary group.'),
  },
]

const heroSpecificFields = [
  {
    name: 'heroMediaMode',
    title: 'Hero media mode',
    type: 'string',
    initialValue: 'single',
    options: {
      list: [
        { title: 'Single image', value: 'single' },
        { title: 'Slides only', value: 'slides' },
        { title: 'Video only', value: 'video' },
      ],
      layout: 'radio',
      ...canvasPurpose('Choose whether this hero uses one image, a slides-only background set, or a video.'),
    },
  },
  {
    name: 'titlePrimary',
    title: 'Split headline part 1 (solid)',
    description:
      'First line of a two-line headline, in solid text. Ignored if "Headline — single line" above has any value.',
    type: 'string',
    options: canvasPurpose('Primary homepage hero word or phrase shown in the solid style.'),
  },
  {
    name: 'titleAccent',
    title: 'Split headline part 2 (outlined)',
    description:
      'Second line of the headline, in outlined text. Ignored if "Headline — single line" above has any value.',
    type: 'string',
    options: canvasPurpose('Secondary homepage hero word or phrase shown in the outlined style.'),
  },
  { name: 'heroGradient', title: 'Hero gradient', type: 'text', options: canvasExclude },
  { name: 'heroTextColor', title: 'Hero text color', type: 'color', options: canvasExclude },
  { name: 'heroOverlayColor', title: 'Hero overlay color', type: 'color', options: canvasExclude },
  {
    name: 'heroOverlayStartColor',
    title: 'Hero overlay start color',
    type: 'color',
    options: canvasExclude,
  },
  {
    name: 'heroOverlayEndColor',
    title: 'Hero overlay end color',
    type: 'color',
    options: canvasExclude,
  },
  {
    name: 'heroOverlayDirection',
    title: 'Hero overlay direction',
    type: 'string',
    options: canvasExclude,
  },
  {
    name: 'heroOverlayStartOpacity',
    title: 'Hero overlay start opacity',
    description:
      'How dark the overlay is where the gradient begins. 0 = fully transparent, 1 = fully solid. Leave empty for the default (0.8).',
    type: 'number',
    validation: (Rule) => Rule.min(0).max(1),
    options: canvasExclude,
  },
  {
    name: 'heroOverlayEndOpacity',
    title: 'Hero overlay end opacity',
    description:
      'How dark the overlay is where the gradient ends. 0 = fully transparent, 1 = fully solid. Leave empty for the default (0.12).',
    type: 'number',
    validation: (Rule) => Rule.min(0).max(1),
    options: canvasExclude,
  },
  {
    name: 'heroOverlayOpacity',
    title: 'Hero overlay opacity (flat)',
    description:
      'Single overlay strength used instead of a gradient, from 0 (transparent) to 1 (solid). Only set this if you are not using the start/end values above.',
    type: 'number',
    validation: (Rule) => Rule.min(0).max(1),
    options: canvasExclude,
  },
  {
    name: 'heroImage',
    title: 'Hero image',
    type: 'heroImage',
    options: canvasExclude,
    hidden: hideUnlessHeroMediaMode('single'),
  },
  {
    name: 'heroVideo',
    title: 'Hero video',
    type: 'heroVideo',
    options: canvasPurpose('Optional video shown in the hero section.'),
    hidden: hideUnlessHeroMediaMode('video'),
  },
  {
    name: 'heroVideoAsset',
    title: 'Uploaded hero video',
    type: 'uploadedVideo',
    options: canvasExclude,
    hidden: hideUnlessHeroMediaMode('video'),
  },
  {
    ...defineUploadedImage('heroAsset', 'Uploaded hero image', canvasExclude),
    hidden: hideUnlessHeroMediaMode('single'),
  },
  {
    name: 'heroSlides',
    title: 'Hero slides',
    type: 'array',
    of: [{ type: 'heroSlideItem' }],
    options: canvasPurpose('Optional rotating background images for the homepage hero.'),
    hidden: hideUnlessHeroMediaMode('slides'),
  },
  {
    name: 'metrics',
    title: 'Metrics',
    type: 'array',
    options: canvasPurpose('Short proof-point pairs like payback period, tax credit, or savings.'),
    of: [{ type: 'pageMetric' }],
  },
  {
    name: 'actions',
    title: 'Actions',
    type: 'array',
    options: canvasPurpose('Optional action buttons or links for hero sections.'),
    of: [{ type: 'pageAction' }],
  },
]

const heroSectionType = {
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  initialValue: {
    type: 'hero',
  },
  fields: withSectionBackgroundFields([
    {
      name: 'type',
      title: 'Section type',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline or kicker text above the hero headline.'),
    },
    {
      name: 'title',
      title: 'Headline — single line',
      description:
        'A one-piece headline. If you put anything here it WINS: the two "Split headline" fields below are ignored completely. Leave this empty to use the split headline instead.',
      type: 'string',
      options: canvasPurpose(
        'Single-line hero headline. Takes precedence over titlePrimary/titleAccent when set.',
      ),
    },
    {
      name: 'cardCopy',
      title: 'Card copy',
      description:
        'Shown in the card beside the headline — but only when "Metrics" below is empty. Add any metrics and they replace this card copy.',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting copy shown in the hero card.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting hero copy.'),
    },
    ...heroSpecificFields,
  ]),
  preview: {
    select: {
      title: 'title',
      titlePrimary: 'titlePrimary',
      titleAccent: 'titleAccent',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, titlePrimary, titleAccent, eyebrow, body }) {
      return {
        title: titlePrimary || title || eyebrow || 'Hero section',
        subtitle: pageSectionListSubtitle('Hero section', body, titleAccent),
      }
    },
  },
}

const storySectionType = {
  name: 'storySection',
  title: 'Story Section',
  type: 'object',
  initialValue: {
    type: 'story',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline or kicker text for the story section.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Primary story heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main explanatory copy for the story section.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Subtitle for the story section.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
      subtitle: 'subtitle',
    },
    prepare({ title, eyebrow, body, subtitle }) {
      return {
        title: title || eyebrow || 'Story section',
        subtitle: pageSectionListSubtitle('Story section', body, subtitle),
      }
    },
  },
}

const articleSectionType = {
  name: 'articleSection',
  title: 'Article Section',
  type: 'object',
  initialValue: {
    type: 'article',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline or kicker text for the article section.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Primary article heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main explanatory copy for the article section.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Article section',
        subtitle: pageSectionListSubtitle('Article section', body),
      }
    },
  },
}

const calculatorSectionType = {
  name: 'calculatorSection',
  title: 'Calculator Section',
  type: 'object',
  initialValue: {
    type: 'calculator',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline above the calculator call to action.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main calculator heading.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Short disclaimer shown below the calculator controls.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting copy that introduces the calculator.'),
    },
    {
      name: 'items',
      title: 'Result cards',
      type: 'array',
      of: [{ type: 'sectionContentItem' }],
      validation: (Rule) => Rule.max(4),
      options: canvasPurpose('Optional labels and card details for calculator result cards.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Label for the calculator call-to-action button.'),
    },
    {
      name: 'ctaHref',
      title: 'CTA href',
      type: 'string',
      options: canvasPurpose('Link target for the calculator call-to-action button.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      subtitle: 'subtitle',
    },
    prepare({ title, body, subtitle }) {
      return {
        title: title || 'Calculator section',
        subtitle: pageSectionListSubtitle('Calculator section', body, subtitle),
      }
    },
  },
}

const costStatItemType = {
  name: 'costStatItem',
  title: 'Cost stat',
  type: 'object',
  fields: [
    {
      name: 'number',
      title: 'Stat',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Big stat shown above the label, e.g. "70%", "$0", "$$$".'),
    },
    {
      name: 'title',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Short label shown beneath the stat.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting copy that explains the stat.'),
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'number' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Cost stat',
        subtitle: subtitle || '',
      }
    },
  },
}

const paybackSummaryItemType = {
  name: 'paybackSummaryItem',
  title: 'Payback summary',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('One-line payback summary headline.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy under the payback headline.'),
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'body' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Payback summary',
        subtitle: previewText(subtitle, ''),
      }
    },
  },
}

const costsSectionType = {
  name: 'costsSection',
  title: 'Costs Section',
  type: 'object',
  initialValue: {
    type: 'costs',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline above the costs section heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Primary heading for the costs section.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Main explanatory copy for costs and pricing context.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting line under the main costs intro.'),
    },
    {
      name: 'color',
      title: 'Accent color',
      type: 'color',
      description: 'Drives the section background gradient (light tint), label colors, and the divider line.',
      options: canvasPurpose(
        'Single accent color used to derive the gradient, label colors, and divider for the costs section.',
      ),
    },
    {
      name: 'items',
      title: 'Cost stats',
      type: 'array',
      of: [{ type: 'costStatItem' }],
      validation: (Rule) => Rule.max(6),
      options: canvasPurpose('Cost statistic cards with number, label, and supporting copy.'),
    },
    {
      name: 'secondaryTitle',
      title: 'Payback eyebrow',
      type: 'string',
      options: canvasPurpose('Small label above the payback summary row.'),
    },
    {
      name: 'secondaryItems',
      title: 'Payback details',
      type: 'array',
      of: [{ type: 'paybackSummaryItem' }],
      validation: (Rule) => Rule.max(1),
      options: canvasPurpose('Single payback summary with headline and supporting copy.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      subtitle: 'subtitle',
      items: 'items',
    },
    prepare({ title, body, subtitle, items }) {
      const count = arrayCount(items)
      return {
        title: title || 'Costs section',
        subtitle: pageSectionListSubtitle('Costs section', body, subtitle, `${count || 0} cost stats`),
      }
    },
  },
}

const guidesSectionType = {
  name: 'guidesSection',
  title: 'Guides Section',
  type: 'object',
  initialValue: {
    type: 'guides',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Heading above the guide card grid.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional copy above the guide card grid.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Label for the “Browse all guides” link.'),
    },
    {
      name: 'items',
      title: 'Guide cards',
      type: 'array',
      of: [{ type: 'guideCardItem' }],
      validation: (Rule) => Rule.max(6),
      options: canvasPurpose('Optional guide cards for this section. If empty, app fallback cards are used.'),
    },
    cloudVisibilityField,
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      items: 'items',
    },
    prepare({ title, subtitle, items }) {
      const count = arrayCount(items)
      return {
        title: title || 'Guides section',
        subtitle: pageSectionListSubtitle(
          'Guides section',
          subtitle,
          count ? `${count} guide cards` : 'Guide grid intro',
        ),
      }
    },
  },
}

const adoptionReasonItemType = {
  name: 'adoptionReasonItem',
  title: 'Reason',
  type: 'object',
  icon: CircleIcon,
  fields: [
    {
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Short heading for this reason (e.g. "Lower Energy Bills").'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: publicSiteIconOptions,
        layout: 'dropdown',
        ...canvasPurpose('Iconoir icon name representing this reason.'),
      },
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Short supporting copy describing this adoption reason.'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      icon: 'icon',
    },
    prepare({ title, subtitle, icon }) {
      return {
        title: title || 'Reason',
        subtitle: previewText(subtitle || icon, 'Reason description'),
      }
    },
  },
}

const solarAdoptionSectionType = {
  name: 'solarAdoptionSection',
  title: 'Solar Adoption + Reason Cards',
  type: 'object',
  fieldsets: [
    { name: 'visualAssets', title: 'Visual assets', options: { collapsible: true, collapsed: false } },
  ],
  initialValue: {
    type: 'solarAdoption',
    reasons: [
      {
        _key: 'steady-monthly-payment',
        _type: 'adoptionReasonItem',
        icon: 'Page',
        title: 'Pay the same amount every month',
        body: portableTextParagraph(
          'steady-monthly-payment-body',
          'No more fluctuating power bills. Switching to solar can help replace unpredictable utility costs with a steadier monthly plan.',
        ),
      },
      {
        _key: 'no-upfront-cost',
        _type: 'adoptionReasonItem',
        icon: 'Wallet',
        title: 'No upfront or out-of-pocket cost to switch',
        body: portableTextParagraph(
          'no-upfront-cost-body',
          'Solar financing options can reduce the upfront barrier while the system starts offsetting utility power.',
        ),
      },
      {
        _key: 'states-we-serve',
        _type: 'adoptionReasonItem',
        icon: 'MailOpen',
        title: 'States We Serve',
        body: portableTextParagraph(
          'states-we-serve-body',
          'Texas, Colorado, Virginia, Ohio, Nevada, Oregon, Illinois, South Carolina, New Mexico, and Connecticut.',
        ),
      },
    ],
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Small overline above the large solar adoption heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose(
        'Large editorial heading, e.g. “Why nearly 30 million Americans have switched to solar”.',
      ),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Short supporting copy shown beside the heading.'),
    },
    {
      name: 'roofImage',
      title: 'Roof image metadata',
      type: 'heroImage',
      fieldset: 'visualAssets',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage(
        'roofImageAsset',
        'Upload roof image',
        canvasPurpose('Wide roof image shown across the bottom of the section.'),
      ),
      fieldset: 'visualAssets',
    },
    {
      name: 'panelImage',
      title: 'Solar panel image metadata',
      type: 'heroImage',
      fieldset: 'visualAssets',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage(
        'panelImageAsset',
        'Upload solar panel image',
        canvasPurpose('Transparent or cutout panel image layered over the roof.'),
      ),
      fieldset: 'visualAssets',
    },
    {
      name: 'reasons',
      title: 'Subsection reason cards',
      type: 'array',
      of: [{ type: 'adoptionReasonItem' }],
      validation: (Rule) => Rule.min(1).max(6),
      options: canvasPurpose('Icon cards beneath the roof/panel visual — each with heading, icon, and body.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      media: 'panelImageAsset',
    },
    prepare({ title, body, media }) {
      return {
        title: title || 'Solar adoption section',
        subtitle: pageSectionListSubtitle('Solar adoption section', body, 'Roof + solar panel visual'),
        media,
      }
    },
  },
}

const solarBenefitsSectionType = {
  name: 'solarBenefitsSection',
  title: 'Solar Benefits Section',
  type: 'object',
  initialValue: {
    type: 'solarBenefits',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Optional heading above the benefits grid.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy above the benefits grid.'),
    },
    {
      name: 'items',
      title: 'Benefit items',
      type: 'array',
      of: [{ type: 'sectionContentItem' }],
      validation: (Rule) => Rule.min(1).max(6),
      options: canvasPurpose('Dark icon/copy benefit cards.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      items: 'items',
    },
    prepare({ title, body, items }) {
      const count = arrayCount(items)
      return {
        title: title || 'Solar benefits section',
        subtitle: pageSectionListSubtitle('Solar benefits section', body, `${count || 0} benefits`),
      }
    },
  },
}

const solarFeatureCardItemType = {
  name: 'solarFeatureCardItem',
  title: 'Solar Feature Card',
  type: 'object',
  fields: [
    {
      name: 'number',
      title: 'Number',
      type: 'string',
      options: canvasPurpose('Small card number such as 01, 02, or 03.'),
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short muted label shown in the top row of the card.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Large card heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Supporting card copy.'),
    },
    {
      name: 'color',
      title: 'Card background color',
      type: 'color',
      options: canvasPurpose('Choose a dark background color for this card.'),
    },
    {
      name: 'image',
      title: 'Image metadata',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Image', canvasPurpose('Optional card image.')),
    },
  ],
  preview: {
    select: {
      title: 'title',
      body: 'body',
      number: 'number',
      media: 'imageAsset',
    },
    prepare({ title, body, number, media }) {
      return {
        title: title || 'Solar feature card',
        subtitle: pageSectionListSubtitle(number ? `Card ${number}` : 'Solar feature card', body),
        media,
      }
    },
  },
}

const solarDifferenceSectionType = {
  name: 'solarDifferenceSection',
  title: 'Solar Difference Section',
  type: 'object',
  initialValue: {
    type: 'solarDifference',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Large heading above the stacked difference cards.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Short supporting copy beside the section heading.'),
    },
    {
      name: 'items',
      title: 'Difference cards',
      type: 'array',
      of: [{ type: 'solarFeatureCardItem' }],
      validation: (Rule) => Rule.min(1).max(5),
      options: canvasPurpose('Stacked dark feature cards with optional images.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      items: 'items',
    },
    prepare({ title, body, items }) {
      const count = arrayCount(items)
      return {
        title: title || 'Solar difference section',
        subtitle: pageSectionListSubtitle('Solar difference section', body, `${count || 0} cards`),
      }
    },
  },
}

const snapshotSectionType = {
  name: 'snapshotSection',
  title: 'Snapshot Section',
  type: 'object',
  initialValue: {
    type: 'snapshot',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline above the snapshot heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main snapshot section heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting intro copy for the snapshot metrics.'),
    },
    {
      name: 'items',
      title: 'Snapshot cards',
      type: 'array',
      of: [{ type: 'snapshotItem' }],
      validation: (Rule) => Rule.max(4),
      options: canvasPurpose('Metric cards with value/title/body and optional icon.'),
    },
    cloudVisibilityField,
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      items: 'items',
    },
    prepare({ title, subtitle, items }) {
      const count = arrayCount(items)
      return {
        title: title || 'Snapshot section',
        subtitle: pageSectionListSubtitle('Snapshot section', subtitle, `${count || 0} snapshot cards`),
      }
    },
  },
}

const incentivesSectionType = {
  name: 'incentivesSection',
  title: 'Incentives Section',
  type: 'object',
  initialValue: {
    type: 'incentives',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Headline for the incentives or insurance guidance section.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Long-form supporting copy (multiple paragraphs allowed).'),
    },
    {
      ...defineUploadedImage(
        'imageAsset',
        'Uploaded image',
        canvasPurpose('Optional image shown beside the roofing and insurance copy.'),
      ),
    },
    {
      name: 'image',
      title: 'External image',
      type: 'heroImage',
      options: canvasPurpose('Optional external image fallback for this section.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Button label for the incentives/insurance section.'),
    },
    {
      name: 'ctaHref',
      title: 'CTA href',
      type: 'string',
      options: canvasPurpose('Destination URL for the incentives/insurance section CTA.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Incentives section',
        subtitle: pageSectionListSubtitle('Incentives section', subtitle, 'Incentive guidance'),
      }
    },
  },
}

/**
 * Showcases the `caseStudy` documents belonging to this page's site.
 *
 * Deliberately has no hand-picked list of case studies: a curation array silently
 * hides everything an editor forgets to add to it, which is exactly how reviews
 * went missing from the homepage. Every published case study for the site shows,
 * newest first, and "Maximum shown" is the only limiter.
 */
const caseStudyGridSectionType = {
  name: 'caseStudyGridSection',
  title: 'Case Studies Section',
  type: 'object',
  initialValue: {
    type: 'caseStudyGrid',
    layout: 'featured',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Heading above the case study showcase.'),
    },
    {
      name: 'body',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional intro copy under the case studies heading.'),
    },
    {
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'featured',
      description:
        'Featured lead puts the newest case study in a large card with the rest below it. Even grid gives every case study the same size card.',
      options: {
        list: [
          { title: 'Featured lead + grid', value: 'featured' },
          { title: 'Even grid', value: 'grid' },
        ],
        layout: 'radio',
        ...canvasPurpose('Choose whether the newest case study gets a larger featured card.'),
      },
    },
    {
      name: 'maxItems',
      title: 'Maximum shown',
      type: 'number',
      description:
        'Leave empty to show every published case study for this site. Set a number to cap it, e.g. 3 when featuring recent work on the homepage.',
      validation: (Rule) => Rule.min(1).max(48),
      options: canvasExclude,
    },
    {
      name: 'featured',
      title: 'Pin to the front (optional)',
      description:
        'Case studies listed here show first, in this order. Everything else still shows after them, so nothing is hidden. Use "Add item" then "Create new" to start a new case study without leaving this page.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'caseStudy' }] }],
      // Pinning the same job twice would render it twice.
      validation: (Rule) => Rule.unique().error('That case study is already pinned.'),
      options: canvasPurpose(
        'Optional ordering. References listed here are moved to the front; the rest still render behind them.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      layout: 'layout',
      maxItems: 'maxItems',
    },
    prepare({ title, subtitle, layout, maxItems }) {
      const shown = maxItems ? `newest ${maxItems}` : 'all case studies'
      const shape = layout === 'grid' ? 'even grid' : 'featured lead'
      return {
        title: title || 'Case studies section',
        subtitle: pageSectionListSubtitle('Case studies section', subtitle, `${shown} · ${shape}`),
      }
    },
  },
}

const testimonialsSectionType = {
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  initialValue: {
    type: 'testimonials',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Primary heading above customer testimonials.'),
    },
    {
      name: 'body',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Secondary line shown under the testimonials heading.'),
    },
    {
      name: 'backgroundImage',
      title: 'Background image metadata',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage(
        'backgroundImageAsset',
        'Background image',
        canvasPurpose('Optional full-section background image behind the review cards.'),
      ),
    },
    {
      name: 'reviews',
      title: 'Featured reviews (optional)',
      description:
        'Leave this empty to show every review for this site automatically — new reviews then appear here without editing the page. Only add reviews here if this page should feature a specific subset; anything not listed will be hidden.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'review' }],
        },
      ],
      // Listing the same review twice renders two cards with the same React key,
      // which React refuses to keep stable across updates.
      validation: (Rule) => Rule.unique().error('That review is already in this list.'),
      options: canvasPurpose(
        'Optional review references. Leave empty to show all reviews for the site; any reviews listed here replace that full list.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      reviews: 'reviews',
    },
    prepare({ title, subtitle, reviews }) {
      const reviewCount = arrayCount(reviews)
      return {
        title: title || 'Testimonials section',
        subtitle: pageSectionListSubtitle(
          'Testimonials section',
          subtitle,
          reviewCount
            ? `Only ${reviewCount} featured review${reviewCount === 1 ? '' : 's'} — others hidden`
            : 'Showing all site reviews',
        ),
      }
    },
  },
}

const highlightsSectionType = {
  name: 'highlightsSection',
  title: 'Card Grid Section',
  type: 'object',
  initialValue: {
    type: 'highlights',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Section heading for the highlights block.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting line above the highlight cards.'),
    },
    {
      name: 'items',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'sectionContentItem' }],
      validation: (Rule) => Rule.required().min(1),
      options: canvasPurpose('Highlight items with title and supporting body copy.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      items: 'items',
    },
    prepare({ title, subtitle, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'Card grid section',
        subtitle: pageSectionListSubtitle('Card grid section', subtitle, `${itemCount || 0} items`),
      }
    },
  },
}

const stepsSectionType = {
  name: 'stepsSection',
  title: 'Steps Section',
  type: 'object',
  initialValue: {
    type: 'steps',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading for the steps block.'),
    },
    {
      name: 'items',
      title: 'Steps',
      type: 'array',
      of: [{ type: 'sectionContentItem' }],
      validation: (Rule) => Rule.required().min(1),
      options: canvasPurpose('Sequential or process-oriented items with title and body.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({ title, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'Steps section',
        subtitle: pageSectionListSubtitle('Steps section', `${itemCount || 0} items`),
      }
    },
  },
}

const installProcessStepType = {
  name: 'installProcessStep',
  title: 'Process Step',
  type: 'object',
  icon: CircleIcon,
  fieldsets: [{ name: 'image', title: 'Image', options: { collapsible: true, collapsed: false } }],
  fields: [
    {
      name: 'title',
      title: 'Step Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Heading for this installation step.'),
    },
    {
      name: 'body',
      title: 'Description',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Supporting copy with details and bullet points for this step.'),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      fieldset: 'image',
      options: {
        hotspot: true,
        collapsible: false,
        ...canvasPurpose('Photo or diagram illustrating this installation step.'),
      },
      fields: [
        {
          name: 'altText',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
          options: canvasPurpose('Describes the image for accessibility and SEO.'),
        },
      ],
    },
    {
      name: 'imageSide',
      title: 'Image Side',
      type: 'string',
      initialValue: 'auto',
      options: {
        list: [
          { title: 'Auto (Alternate)', value: 'auto' },
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
        direction: 'horizontal',
        ...canvasPurpose('Which side the image appears on. Auto alternates orientation each step.'),
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Process step',
        subtitle: previewText(subtitle, 'Step description'),
      }
    },
  },
}

const installProcessSectionType = {
  name: 'installProcessSection',
  title: 'Install Process Section',
  type: 'object',
  icon: CircleIcon,
  initialValue: {
    type: 'installProcess',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional prefix label above the section title (e.g. "Our Process").'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading for the installation process.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional intro text before the process steps.'),
    },
    {
      name: 'items',
      title: 'Steps',
      type: 'array',
      of: [{ type: 'installProcessStep' }],
      validation: (Rule) => Rule.required().min(1),
      options: canvasPurpose(
        'Ordered steps in the installation process, shown as alternating image/content rows.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      items: 'items',
    },
    prepare({ title, eyebrow, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'Install process section',
        subtitle: pageSectionListSubtitle(eyebrow || 'Install process section', `${itemCount || 0} steps`),
      }
    },
  },
}

const galleryImageType = {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'image',
  options: {
    hotspot: true,
    collapsible: false,
  },
  fields: [
    {
      name: 'altText',
      title: 'Alt text',
      type: 'string',
      options: canvasPurpose('Describes the image for accessibility and SEO.'),
    },
    {
      name: 'neighborhood',
      title: 'Neighborhood',
      type: 'string',
      options: canvasPurpose(
        'Where this project was completed (e.g. "South Austin", "Westlake"). Shown as a caption.',
      ),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
      options: canvasPurpose('The year this photo was taken or the project was completed.'),
    },
    {
      name: 'package',
      title: 'Package',
      type: 'string',
      options: canvasPurpose(
        'Service package or tier featured in this photo (e.g. "Premium", "Holiday Spectacular").',
      ),
    },
  ],
  preview: {
    select: {
      altText: 'altText',
      neighborhood: 'neighborhood',
      year: 'year',
      package: 'package',
      asset: 'asset',
    },
    prepare({ altText, neighborhood, year, package: pkg, asset }) {
      const meta = [neighborhood, year, pkg].filter(Boolean).join(' · ')
      return {
        title: altText || meta || 'Gallery image',
        subtitle: altText && meta ? meta : undefined,
        media: asset,
      }
    },
  },
}

const galleryPhotoType = {
  name: 'galleryPhoto',
  title: 'Gallery Photo',
  type: 'image',
  options: {
    hotspot: true,
    collapsible: false,
  },
  fields: [
    {
      name: 'altText',
      title: 'Alt text',
      type: 'string',
      validation: (Rule) => Rule.required().error('Every gallery photo needs alt text.'),
      options: canvasPurpose('Describes the photo for screen readers and SEO. Required.'),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      options: canvasPurpose('Optional short caption shown under this photo in the lightbox.'),
    },
  ],
  preview: {
    select: {
      altText: 'altText',
      caption: 'caption',
      asset: 'asset',
    },
    prepare({ altText, caption, asset }) {
      return {
        title: altText || caption || 'Gallery photo',
        subtitle: altText && caption ? caption : undefined,
        media: asset,
      }
    },
  },
}

const galleryProjectType = {
  name: 'galleryProject',
  title: 'Gallery Project',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Project title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Name of this install (e.g. "The Johnson home" or "West Lake roofline").'),
    },
    {
      name: 'neighborhood',
      title: 'Neighborhood',
      type: 'string',
      options: canvasPurpose(
        'Where this project was completed (e.g. "South Austin", "Westlake"). Shown as a caption.',
      ),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
      options: canvasPurpose('The year the project was completed.'),
    },
    {
      name: 'package',
      title: 'Package',
      type: 'string',
      options: canvasPurpose(
        'Service package or tier for this project (e.g. "Premium", "Holiday Spectacular").',
      ),
    },
    {
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [{ type: 'galleryPhoto' }],
      validation: (Rule) => Rule.required().min(1).error('Add at least one photo to the project.'),
      options: canvasPurpose(
        'Ordered photos for this project. The first photo is the cover shown in the gallery grid; the rest open in the lightbox.',
      ),
    },
  ],
  preview: {
    select: {
      title: 'title',
      neighborhood: 'neighborhood',
      year: 'year',
      package: 'package',
      photos: 'photos',
      media: 'photos.0',
    },
    prepare({ title, neighborhood, year, package: pkg, photos, media }) {
      const photoCount = arrayCount(photos)
      const meta = [neighborhood, year, pkg].filter(Boolean).join(' · ')
      const countLabel = `${photoCount} photo${photoCount === 1 ? '' : 's'}`
      return {
        title: title || neighborhood || 'Gallery project',
        subtitle: [meta, countLabel].filter(Boolean).join(' · '),
        media,
      }
    },
  },
}

const gallerySectionType = {
  name: 'gallerySection',
  title: 'Gallery Section',
  type: 'object',
  initialValue: {
    type: 'gallery',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose(
        'Optional short overline or category label shown above the title (e.g. "Our work").',
      ),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading shown above the gallery grid.'),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting line shown above the gallery grid.'),
    },
    {
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{ type: 'galleryProject' }],
      validation: (Rule) =>
        Rule.custom((projects, context) => {
          const legacyImages = arrayCount(context?.parent?.images)
          if (arrayCount(projects) > 0 || legacyImages > 0) {
            return true
          }
          return 'Add at least one project.'
        }),
      options: canvasPurpose(
        "Projects shown in the masonry gallery. Each project holds one or more photos; the first photo is its cover and clicking it opens a lightbox with that project's photos.",
      ),
    },
    {
      name: 'images',
      title: 'Legacy images',
      description:
        'Older single-photo gallery entries. They still render as one-photo projects. Move them into Projects (or run scripts/migrate-gallery-projects.mjs) and clear this list.',
      type: 'array',
      of: [{ type: 'galleryImage' }],
      hidden: ({ parent }) => arrayCount(parent?.images) === 0,
      readOnly: ({ parent }) => arrayCount(parent?.projects) > 0,
      options: canvasExclude,
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      projects: 'projects',
      images: 'images',
    },
    prepare({ title, eyebrow, projects, images }) {
      const projectCount = arrayCount(projects) + arrayCount(images)
      const photoCount =
        (Array.isArray(projects) ? projects : []).reduce(
          (total, project) => total + arrayCount(project?.photos),
          0,
        ) + arrayCount(images)
      const tail = [
        eyebrow,
        `${projectCount} project${projectCount === 1 ? '' : 's'}`,
        `${photoCount} photo${photoCount === 1 ? '' : 's'}`,
      ]
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Gallery section',
        subtitle: pageSectionListSubtitle('Gallery section', tail),
      }
    },
  },
}

const pricingNoteVariantOptions = [
  { title: 'Standard', value: 'standard' },
  { title: 'Callout', value: 'callout' },
]

const pricingNoteItemType = {
  name: 'pricingNoteItem',
  title: 'Pricing Note',
  type: 'object',
  initialValue: { variant: 'standard' },
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Heading for the note (e.g. "Payment methods", "Why we require a deposit").'),
    },
    {
      name: 'paymentDue',
      title: 'Payment due',
      type: 'string',
      options: canvasPurpose('Timeframe for the payment due (e.g. "Due at booking", "Due August 1st").'),
    },
    {
      name: 'amount',
      title: 'Amount',
      type: 'string',
      options: canvasPurpose('Amount for the payment due (e.g. "30%", "½ bal.").'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Supporting copy for the note. Keep it short and concrete.'),
    },
    {
      name: 'variant',
      title: 'Emphasis',
      type: 'string',
      options: {
        list: pricingNoteVariantOptions,
        layout: 'radio',
        ...canvasPurpose(
          'Pick "Callout" when the note describes an important policy that customers should not miss (e.g. deposit terms). Otherwise use "Standard".',
        ),
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      body: 'body',
      paymentDue: 'paymentDue',
      amount: 'amount',
      variant: 'variant',
    },
    prepare({ title, body, paymentDue, amount, variant }) {
      const label = variant === 'callout' ? 'Callout' : 'Standard'
      return {
        title: title || 'Pricing note',
        subtitle: `${label} · ${paymentDue} · ${amount} · ${previewText(body, 'Supporting copy')}`,
      }
    },
  },
}

const pricingSectionType = {
  name: 'pricingSection',
  title: 'Pricing Section',
  type: 'object',
  initialValue: {
    type: 'pricing',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short overline above the title (e.g. "How pricing works").'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading explaining the pricing approach.'),
    },
    {
      name: 'body',
      title: 'Lead copy',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose(
        'Main paragraphs describing how pricing works (what is included, deposit terms, balance due, etc.).',
      ),
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'array',
      of: [{ type: 'pricingNoteItem' }],
      options: canvasPurpose(
        'Supporting notes shown below the lead copy. Use the "Callout" variant for policies that deserve extra attention.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      notes: 'notes',
    },
    prepare({ title, eyebrow, notes }) {
      const noteCount = arrayCount(notes)
      const tail = [eyebrow, noteCount ? `${noteCount} note${noteCount === 1 ? '' : 's'}` : null]
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Pricing section',
        subtitle: pageSectionListSubtitle('Pricing section', tail || 'Pricing copy and notes'),
      }
    },
  },
}

const faqSectionType = {
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  initialValue: {
    type: 'faq',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Section heading for the FAQ block.'),
    },
    {
      name: 'items',
      title: 'FAQ items',
      type: 'array',
      of: [{ type: 'pageFaqItem' }],
      validation: (Rule) => Rule.required().min(1),
      options: canvasPurpose('Frequently asked questions and answers.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({ title, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'FAQ section',
        subtitle: pageSectionListSubtitle('FAQ section', `${itemCount || 0} questions`),
      }
    },
  },
}

const quoteSectionType = {
  name: 'quoteSection',
  title: 'Quote Banner Section',
  type: 'object',
  initialValue: {
    type: 'quote',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Small overline shown above the quote.'),
    },
    {
      name: 'body',
      title: 'Quote',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Quote text shown in the banner.'),
    },
    {
      name: 'title',
      title: 'Attribution',
      type: 'string',
      options: canvasPurpose('Name or attribution shown under the quote.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Quote banner section',
        subtitle: pageSectionListSubtitle('Quote banner section', body, 'Quote'),
      }
    },
  },
}

const ctaSectionType = {
  name: 'ctaSection',
  title: 'Call to Action Section',
  type: 'object',
  initialValue: {
    type: 'cta',
    theme: 'light',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main call-to-action headline.'),
    },
    {
      name: 'body',
      title: 'Copy',
      type: 'portableTextSimple',
      options: canvasPurpose('Short supporting copy below the CTA headline.'),
    },
    {
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Label for the primary CTA button or link.'),
    },
    {
      name: 'theme',
      title: 'Theme',
      type: 'string',
      initialValue: 'light',
      options: {
        list: ctaThemeOptions,
        layout: 'radio',
        ...canvasPurpose('Choose the visual style for this CTA section.'),
      },
    },
    cloudVisibilityField,
    {
      name: 'avatarEyebrow',
      title: 'Avatar eyebrow',
      type: 'string',
      options: canvasPurpose('Optional small label above the avatar name.'),
    },
    {
      name: 'avatarName',
      title: 'Avatar name',
      type: 'string',
      options: canvasPurpose('Optional person name shown with the consultation CTA.'),
    },
    {
      name: 'avatarRole',
      title: 'Avatar role',
      type: 'string',
      options: canvasPurpose('Optional short role shown under the avatar name.'),
    },
    {
      name: 'avatarBlurb',
      title: 'Avatar blurb',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional short note shown next to the consultation CTA.'),
    },
    {
      name: 'avatarImage',
      title: 'Avatar image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      name: 'avatarColor',
      title: 'Avatar color',
      type: 'color',
      options: canvasPurpose('Color of the avatar image.'),
    },
    {
      ...defineUploadedImage('avatarImageAsset', 'Uploaded avatar image', canvasExclude),
    },
    {
      name: 'serviceOptions',
      title: 'Service options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required(),
              options: canvasExclude,
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
              options: canvasPurpose('Display label for this service option in the form dropdown.'),
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        },
      ],
      options: canvasPurpose(
        'Override the default service dropdown options shown in the lead capture form. Leave empty to use the site defaults.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'CTA section',
        subtitle: pageSectionListSubtitle('CTA section', subtitle, 'Call to action'),
      }
    },
  },
}

const scrollTextSectionType = {
  name: 'scrollTextSection',
  title: 'Scroll Text Section',
  type: 'object',
  initialValue: {
    type: 'scrollText',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'text',
      title: 'Texts',
      type: 'array',
      of: [{ type: 'string' }],
      options: canvasPurpose('Texts to scroll.'),
    },
    defineField({
      name: 'linkedItems',
      title: 'Linked city names',
      type: 'array',
      description:
        'Optional single scrolling row. When set, replaces the plain text rows. Names without a published location page remain plain text.',
      of: [
        defineArrayMember({
          name: 'scrollTextItem',
          title: 'City name',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'City name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'page',
              title: 'Location page',
              type: 'reference',
              to: [{ type: 'locationPage' }],
              weak: true,
              options: {
                filter: ({ document }) => ({
                  filter: 'site._ref == $siteId',
                  params: { siteId: document.site?._ref || '' },
                }),
              },
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'page.slug.current' },
            prepare: ({ title, subtitle }) => ({
              title: `City: ${title || 'Untitled'}`,
              subtitle: subtitle ? `/${subtitle}` : 'Plain text',
            }),
          },
        }),
      ],
    }),
    {
      name: 'fontSize',
      title: 'Font size',
      type: 'number',
      options: canvasPurpose('Font size of the text.'),
    },
    {
      name: 'textColor',
      title: 'Text color',
      type: 'color',
      options: canvasPurpose('Color of the text.'),
    },
    {
      name: 'showIcon',
      title: 'Show icon',
      type: 'boolean',
      options: canvasPurpose('Show icon.'),
    },
    {
      name: 'showFlag',
      title: 'Show Texas flag',
      type: 'boolean',
      options: canvasPurpose('Show a Texas flag icon next to each scrolling text item.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: canvasPurpose('Icon to show.'),
    },
    {
      name: 'velocity',
      title: 'Velocity',
      type: 'number',
      options: canvasPurpose('Velocity of the scroll.'),
    },
    {
      name: 'direction',
      title: 'Direction',
      type: 'string',
      options: canvasPurpose('Direction of the scroll.'),
    },
    {
      name: 'startPosition',
      title: 'Start position',
      type: 'number',
      options: canvasPurpose('Start position of the scroll.'),
    },
    {
      name: 'damping',
      title: 'Damping',
      type: 'number',
      options: canvasPurpose('Damping of the scroll.'),
    },
    {
      name: 'stiffness',
      title: 'Stiffness',
      type: 'number',
      options: canvasPurpose('Stiffness of the scroll.'),
    },
    {
      name: 'numCopies',
      title: 'Number of copies',
      type: 'number',
      options: canvasPurpose('Number of copies to show.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      text: 'text',
    },
    prepare({ title, text }) {
      return {
        title: title || 'Scroll text section',
        subtitle: pageSectionListSubtitle('Scroll text section', text, 'Scrolling text'),
      }
    },
  },
}

const ctaBannerSectionType = {
  name: 'ctaBannerSection',
  title: 'Cross-Lead Banner Section',
  type: 'object',
  initialValue: {
    type: 'ctaBanner',
    theme: 'dark',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional label above the banner.'),
    },
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main banner headline.'),
    },
    {
      name: 'body',
      title: 'Copy',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Supporting copy shown beside the lead form.'),
    },
    {
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      options: canvasPurpose('Lead form submit label override.'),
    },
    {
      name: 'theme',
      title: 'Theme',
      type: 'string',
      initialValue: 'dark',
      options: {
        list: ctaThemeOptions,
        layout: 'radio',
        ...canvasPurpose('Choose the visual style for this cross-lead CTA banner.'),
      },
    },
    {
      name: 'avatarEyebrow',
      title: 'Avatar eyebrow',
      type: 'string',
      options: canvasPurpose('Optional small label above the avatar name.'),
    },
    {
      name: 'avatarName',
      title: 'Avatar name',
      type: 'string',
      options: canvasPurpose('Optional person name shown with the cross-lead CTA.'),
    },
    {
      name: 'avatarRole',
      title: 'Avatar role',
      type: 'string',
      options: canvasPurpose('Optional short role shown under the avatar name.'),
    },
    {
      name: 'avatarBlurb',
      title: 'Avatar blurb',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional short note shown next to the cross-lead CTA.'),
    },
    {
      name: 'avatarImage',
      title: 'Avatar image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('avatarImageAsset', 'Uploaded avatar image', canvasExclude),
    },
    cloudVisibilityField,
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Cross-lead banner',
        subtitle: pageSectionListSubtitle('Cross-lead banner', body, 'Lead banner'),
      }
    },
  },
}

const bannerCtaSectionType = {
  name: 'bannerCtaSection',
  title: 'Banner CTA Section',
  type: 'object',
  initialValue: {
    type: 'bannerCta',
    ctaHref: '#consultation',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional label above the banner headline.'),
    },
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main headline shown over the banner image.'),
    },
    {
      name: 'body',
      title: 'Copy',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy shown under the banner headline.'),
    },
    {
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('CTA button text.'),
    },
    {
      name: 'ctaHref',
      title: 'Button URL',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('CTA destination URL or page anchor.'),
    },
    {
      name: 'image',
      title: 'External image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      ...defineUploadedImage('imageAsset', 'Uploaded image', canvasExclude),
    },
    cloudVisibilityField,
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      ctaLabel: 'ctaLabel',
      media: 'imageAsset',
    },
    prepare({ title, body, ctaLabel, media }) {
      return {
        title: title || 'Banner CTA section',
        subtitle: pageSectionListSubtitle('Banner CTA section', ctaLabel, body),
        media: media ?? BlockContentIcon,
      }
    },
  },
}

const secondaryCTASectionType = {
  name: 'secondaryCTASection',
  title: 'Secondary CTA Section',
  type: 'object',
  initialValue: {
    type: 'secondaryCTA',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Heading shown above the secondary CTA.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting copy for the secondary CTA banner.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Label shown in the secondary CTA banner button.'),
    },
    {
      name: 'ctaHref',
      title: 'CTA URL',
      type: 'string',
      options: canvasPurpose('Destination URL for the secondary CTA banner.'),
    },
    {
      name: 'color',
      title: 'Color',
      type: 'color',
      options: canvasPurpose('Color of the secondary CTA.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      color: 'color',
    },
    prepare({ title, body }) {
      return {
        title: title || 'Secondary CTA section',
        subtitle: pageSectionListSubtitle('Secondary CTA section', body, 'Secondary CTA'),
      }
    },
  },
}

const hailMapSectionType = {
  name: 'hailMapSection',
  title: 'Hail Map Section',
  type: 'object',
  initialValue: {
    type: 'hailMap',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Heading shown above the hail lookup.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Short explanation of how to use the map and storm evidence list.'),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
    },
    prepare({ title, body }) {
      return {
        title: title || 'Hail map section',
        subtitle: pageSectionListSubtitle('Hail map section', body, 'Storm evidence lookup'),
      }
    },
  },
}

const serviceAreaItemType = {
  name: 'serviceAreaItem',
  title: 'Service Area',
  type: 'object',
  fields: [
    {
      name: 'countyKey',
      title: 'County',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'Travis County (Austin)', value: 'travis' },
          { title: 'Williamson County (Round Rock)', value: 'williamson' },
          { title: 'Hays County (San Marcos)', value: 'hays' },
          { title: 'Comal County (New Braunfels)', value: 'comal' },
          { title: 'Bexar County (San Antonio)', value: 'bexar' },
          { title: 'Guadalupe County (Seguin)', value: 'guadalupe' },
          { title: 'Caldwell County (Lockhart)', value: 'caldwell' },
          { title: 'Bastrop County', value: 'bastrop' },
          { title: 'Blanco County', value: 'blanco' },
          { title: 'Kendall County (Boerne)', value: 'kendall' },
          { title: 'Kerr County (Kerrville)', value: 'kerr' },
          { title: 'Gillespie County (Fredericksburg)', value: 'gillespie' },
          { title: 'Bell County (Killeen)', value: 'bell' },
          { title: 'McLennan County (Waco)', value: 'mclennan' },
          { title: 'Tarrant County (Fort Worth)', value: 'tarrant' },
          { title: 'Dallas County', value: 'dallas' },
          { title: 'Ellis County (Waxahachie)', value: 'ellis' },
          { title: 'Johnson County (Cleburne)', value: 'johnson' },
          { title: 'Hill County (Hillsboro)', value: 'hill' },
          { title: 'Potter County (Amarillo)', value: 'potter' },
          { title: 'Randall County (Canyon)', value: 'randall' },
          { title: 'Lubbock County', value: 'lubbock' },
        ],
        ...canvasPurpose('Pick the county to add to the service area map.'),
      },
    },
    {
      name: 'displayName',
      title: 'Display name',
      type: 'string',
      description: 'Shown in the map tooltip (e.g. "Travis County — Austin").',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Friendly tooltip label for this county.'),
    },
  ],
  preview: {
    select: { title: 'displayName' },
    prepare({ title }) {
      return {
        title: title || 'Unnamed area',
        subtitle: 'Service area',
      }
    },
  },
}

const serviceAreaMapSectionType = {
  name: 'serviceAreaMapSection',
  title: 'Service Area Map Section',
  type: 'object',
  initialValue: {
    type: 'serviceAreaMap',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short overline above the title (e.g. "Service Area").'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Section heading shown over the choropleth map.'),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      options: canvasPurpose('Optional intro sentence shown beneath the heading.'),
    },
    {
      name: 'accentColor',
      title: 'Accent color',
      type: 'color',
      description:
        'Drives the choropleth ramp (light → dark mix of this color), eyebrow text, and active stroke. Falls back to the site primary when empty.',
    },
    {
      name: 'backgroundColor',
      title: 'Background color',
      type: 'color',
      description:
        'Section background and non-service-county fill. Falls back to the site secondary (dark) when empty.',
    },
    {
      name: 'areas',
      title: 'Service areas',
      type: 'array',
      of: [{ type: 'serviceAreaItem' }],
      options: canvasPurpose(
        'One entry per county we serve. countyKey must match the "key" of a feature in texasCounties.json.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      areas: 'areas',
    },
    prepare({ title, eyebrow, areas }) {
      const areaCount = arrayCount(areas)
      const tail = [eyebrow, `${areaCount} ${areaCount === 1 ? 'county' : 'counties'}`]
        .filter(Boolean)
        .join(' · ')
      return {
        title: title || 'Service area map',
        subtitle: pageSectionListSubtitle('Service area map', tail),
      }
    },
  },
}

const bandSectionType = {
  name: 'bandSection',
  title: 'Band Section',
  type: 'object',
  initialValue: {
    type: 'band',
    minHeight: 2,
    maxHeight: 24,
    rotate: false,
    scrollStart: 0,
    scrollEnd: 0.8,
    reverse: false,
    autoAnimate: false,
    speed: 1,
    amplitude: 10,
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'colors',
      title: 'Band colors',
      type: 'array',
      of: [{ type: 'bandColorStop' }],
      validation: (Rule) => Rule.min(1),
      options: canvasPurpose('Color stops used in the animated band gradient.'),
    },
    {
      name: 'tint',
      title: 'Tint color',
      type: 'color',
      options: canvasPurpose('Tint layered over each band row.'),
    },
    {
      name: 'minHeight',
      title: 'Min height',
      type: 'number',
      options: canvasPurpose('Smallest row height, in rem-equivalent units used by the component.'),
    },
    {
      name: 'maxHeight',
      title: 'Max height',
      type: 'number',
      options: canvasPurpose('Largest row height, in rem-equivalent units used by the component.'),
    },
    {
      name: 'rotate',
      title: 'Rotate 180 degrees',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'scrollStart',
      title: 'Scroll start',
      type: 'number',
      options: canvasPurpose('Scroll progress where the height transition starts, usually between 0 and 1.'),
    },
    {
      name: 'scrollEnd',
      title: 'Scroll end',
      type: 'number',
      options: canvasPurpose('Scroll progress where the height transition ends, usually between 0 and 1.'),
    },
    {
      name: 'reverse',
      title: 'Reverse height transition',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'autoAnimate',
      title: 'Auto animate',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'speed',
      title: 'Animation speed',
      type: 'number',
      options: canvasPurpose('Sine-wave speed used when auto animate is enabled.'),
    },
    {
      name: 'amplitude',
      title: 'Animation amplitude',
      type: 'number',
      options: canvasPurpose('How far the color stops drift when auto animate is enabled.'),
    },
  ]),
  preview: {
    select: {
      colors: 'colors',
      autoAnimate: 'autoAnimate',
      rotate: 'rotate',
    },
    prepare({ colors, autoAnimate, rotate }) {
      const colorCount = arrayCount(colors)
      const flags = [`${colorCount || 0} colors`, autoAnimate ? 'animated' : null, rotate ? 'rotated' : null]
        .filter(Boolean)
        .join(' • ')

      return {
        title: 'Band section',
        subtitle: pageSectionListSubtitle('Band section', flags || 'Decorative divider'),
      }
    },
  },
}

const logosSectionType = {
  name: 'logosSection',
  title: 'Roofing Logo Cloud Section',
  type: 'object',
  initialValue: {
    type: 'logos',
    internalLabel: 'Certifications marquee',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'internalLabel',
      title: 'Internal label',
      type: 'string',
      options: canvasPurpose('Optional internal label for this marquee section.'),
    },
    {
      name: 'title',
      title: 'Headline',
      type: 'string',
      options: canvasPurpose('Optional headline above the marquee.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy above the marquee.'),
    },
    {
      name: 'items',
      title: 'Logos',
      type: 'array',
      of: [{ type: 'logoMarqueeItem' }],
      options: canvasPurpose('Optional custom logos for this marquee. Defaults are used when left empty.'),
    },
  ]),
  preview: {
    select: {
      internalLabel: 'internalLabel',
      title: 'title',
      items: 'items',
    },
    prepare({ internalLabel, title, items }) {
      const count = arrayCount(items)
      const tail = `${count || 0} custom logos${title ? ` • ${title}` : ''}`
      return {
        title: internalLabel || title || 'Roofing logo cloud section',
        subtitle: pageSectionListSubtitle('Roofing logo cloud section', tail),
      }
    },
  },
}

const solarSwitchSectionType = {
  name: 'solarSwitchSection',
  title: 'Solar Switch Section',
  type: 'object',
  initialValue: {
    type: 'solarSwitch',
    leadingWords: ['Protect', 'your', 'home', 'and', 'lower', 'monthly', 'costs', 'with'],
    accentWord: 'solar',
    trailingText: 'without sacrificing roof integrity.',
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'leadingWords',
      title: 'Leading words',
      type: 'array',
      of: [{ type: 'string' }],
      options: canvasPurpose('Words shown before the highlighted solar word.'),
    },
    {
      name: 'accentWord',
      title: 'Highlighted word',
      type: 'string',
      options: canvasPurpose('Word shown inside the animated switch treatment.'),
    },
    {
      name: 'trailingText',
      title: 'Trailing text',
      type: 'string',
      options: canvasPurpose('Closing phrase shown after the highlighted word.'),
    },
  ]),
  preview: {
    select: {
      accentWord: 'accentWord',
      trailingText: 'trailingText',
      leadingWords: 'leadingWords',
    },
    prepare({ accentWord, trailingText, leadingWords }) {
      const leadingCount = arrayCount(leadingWords)
      return {
        title: accentWord ? `Solar switch: ${accentWord}` : 'Solar switch section',
        subtitle: pageSectionListSubtitle(
          'Solar switch section',
          trailingText,
          `${leadingCount || 0} leading words`,
        ),
      }
    },
  },
}

const energyChartSectionType = {
  name: 'energyChartSection',
  title: 'Energy Chart Section',
  type: 'object',
  initialValue: {
    type: 'energyChart',
    title: 'Home energy usage trend',
    chartType: 'composed',
    showGrid: true,
    showLegend: true,
    showAxisLines: true,
    chartAreaFillOpacity: 0.24,
    chartPeriodLabel: 'Jul 2024 - Jul 2025',
    chartPrimaryLabel: 'Primary',
    chartSecondaryLabel: 'Secondary',
    chartUnitLabel: 'kWh',
    chartLineUnitLabel: 'deg',
    chartYAxisMax: 1000,
    chartBarColor: '#006d77',
    chartLineColor: '#7e22ce',
    chartPoints: [
      { _type: 'energyChartPoint', label: 'Jul', barValue: 450, lineValue: 60 },
      { _type: 'energyChartPoint', label: 'Aug', barValue: 470, lineValue: 68 },
      { _type: 'energyChartPoint', label: 'Sep', barValue: 560, lineValue: 65 },
      { _type: 'energyChartPoint', label: 'Oct', barValue: 720, lineValue: 60 },
      { _type: 'energyChartPoint', label: 'Nov', barValue: 700, lineValue: 51 },
      { _type: 'energyChartPoint', label: 'Dec', barValue: 920, lineValue: 43 },
      { _type: 'energyChartPoint', label: 'Jan', barValue: 900, lineValue: 42 },
      { _type: 'energyChartPoint', label: 'Feb', barValue: 890, lineValue: 35 },
      { _type: 'energyChartPoint', label: 'Mar', barValue: 820, lineValue: 38 },
      { _type: 'energyChartPoint', label: 'Apr', barValue: 720, lineValue: 45 },
      { _type: 'energyChartPoint', label: 'May', barValue: 560, lineValue: 52 },
      { _type: 'energyChartPoint', label: 'Jun', barValue: 580, lineValue: 56 },
      { _type: 'energyChartPoint', label: 'Jul', barValue: 460, lineValue: 62 },
    ],
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional overline above the chart heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main heading for the chart section.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Optional supporting copy for chart context.'),
    },
    {
      name: 'chartType',
      title: 'Chart type',
      type: 'string',
      initialValue: 'composed',
      options: {
        list: [
          { title: 'Composed (bar + line)', value: 'composed' },
          { title: 'Bar', value: 'bar' },
          { title: 'Line', value: 'line' },
          { title: 'Area (filled)', value: 'area' },
          { title: 'Pie', value: 'pie' },
          { title: 'Scatter', value: 'scatter' },
        ],
        layout: 'radio',
        direction: 'horizontal',
        ...canvasPurpose('Select which chart style to render for this section.'),
      },
    },
    {
      name: 'showGrid',
      title: 'Show grid',
      type: 'boolean',
      initialValue: true,
      options: canvasPurpose('Show horizontal and vertical chart grid lines.'),
    },
    {
      name: 'showLegend',
      title: 'Show legend',
      type: 'boolean',
      initialValue: true,
      options: canvasPurpose('Show chart legend for series labels.'),
    },
    {
      name: 'showAxisLines',
      title: 'Show axis lines',
      type: 'boolean',
      initialValue: true,
      options: canvasPurpose('Show axis and tick line strokes.'),
    },
    {
      name: 'chartAreaFillOpacity',
      title: 'Area fill opacity',
      description:
        'Only applies when the chart type is Area. 0 = transparent fill, 1 = solid fill. Default is 0.24.',
      type: 'number',
      initialValue: 0.24,
      validation: (Rule) => Rule.min(0).max(1),
      options: canvasPurpose('Opacity used when chart type is Area. Use a value between 0 and 1.'),
    },
    {
      name: 'chartAreaSeries',
      title: 'Area chart series',
      type: 'array',
      of: [{ type: 'energyChartAreaSeriesItem' }],
      options: canvasPurpose(
        'When chart type is Area, add one row per filled area. Leave empty for a single area using Primary values only. For each data point, set “Area series values” in the same order (or rely on Primary/Secondary defaults when you define exactly two series).',
      ),
    },
    {
      name: 'chartAreaStacked',
      title: 'Stack area series',
      type: 'boolean',
      initialValue: false,
      options: canvasPurpose(
        'When on, areas stack vertically. When off, they overlap (lower opacity helps). Only applies when multiple area series are defined.',
      ),
    },
    {
      name: 'chartPeriodLabel',
      title: 'Period label',
      type: 'string',
      options: canvasPurpose('Label shown above the chart date window, such as Jul 2024 - Jul 2025.'),
    },
    {
      name: 'chartPrimaryLabel',
      title: 'Primary series label',
      type: 'string',
      options: canvasPurpose('Display label for the primary series used in legend and tooltip.'),
    },
    {
      name: 'chartSecondaryLabel',
      title: 'Secondary series label',
      type: 'string',
      options: canvasPurpose('Display label for the secondary series used in legend and tooltip.'),
    },
    {
      name: 'chartUnitLabel',
      title: 'Bar unit label',
      type: 'string',
      options: canvasPurpose('Primary axis unit label, e.g. kWh.'),
    },
    {
      name: 'chartLineUnitLabel',
      title: 'Line unit suffix',
      type: 'string',
      options: canvasPurpose('Suffix shown on line values, e.g. deg.'),
    },
    {
      name: 'chartYAxisMax',
      title: 'Y-axis max',
      type: 'number',
      validation: (Rule) => Rule.min(1),
      options: canvasPurpose('Maximum y-axis value for the bars.'),
    },
    {
      name: 'chartBarColor',
      title: 'Bar color',
      type: 'string',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Select the same color tokens used by guide cards.'),
      },
    },
    {
      name: 'chartLineColor',
      title: 'Line color',
      type: 'string',
      options: {
        list: guideCardColorOptions,
        layout: 'dropdown',
        ...canvasPurpose('Select the same color tokens used by guide cards.'),
      },
    },
    {
      name: 'chartPoints',
      title: 'Data points',
      type: 'array',
      of: [{ type: 'energyChartPoint' }],
      components: {
        input: ChartPointsJsonInput,
      },
      options: canvasPurpose(
        'Ordered chart data. Label = category, Bar value = primary metric, Line value = secondary metric/x-y coordinate.',
      ),
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      points: 'chartPoints',
      period: 'chartPeriodLabel',
    },
    prepare({ title, body, points, period }) {
      const count = arrayCount(points)
      return {
        title: title || 'Energy chart section',
        subtitle: pageSectionListSubtitle('Energy chart section', body, period, `${count || 0} points`),
      }
    },
  },
}

const videoSectionType = {
  name: 'videoSection',
  title: 'Video Section',
  type: 'object',
  initialValue: {
    type: 'video',
    autoplay: false,
    loop: false,
    muted: false,
  },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline above the video section heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Primary heading for the video section.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'portableTextSimple',
      options: canvasPurpose('Supporting copy shown alongside the video.'),
    },
    {
      name: 'videoUrl',
      title: 'Video URL',
      type: 'string',
      description: 'Direct URL to an MP4 or WebM file.',
      options: canvasPurpose('Direct URL to an externally hosted video file.'),
    },
    {
      ...defineUploadedImage(
        'posterImage',
        'Poster image',
        canvasPurpose('Still frame shown before playback and as a fallback.'),
      ),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      options: canvasPurpose('Optional text caption displayed below the video player.'),
    },
    {
      name: 'autoplay',
      title: 'Autoplay',
      type: 'boolean',
      options: canvasPurpose('Start playback automatically when the section enters the viewport.'),
    },
    {
      name: 'loop',
      title: 'Loop',
      type: 'boolean',
      options: canvasPurpose('Restart the video from the beginning when it ends.'),
    },
    {
      name: 'muted',
      title: 'Muted',
      type: 'boolean',
      options: canvasPurpose('Mute the audio track by default.'),
    },
    {
      name: 'aspectRatio',
      title: 'Aspect ratio',
      type: 'string',
      initialValue: '16:9',
      options: {
        list: [
          { title: '16:9', value: '16:9' },
          { title: '4:3', value: '4:3' },
          { title: '1:1 (Square)', value: '1:1' },
          { title: '9:16 (Vertical)', value: '9:16' },
        ],
        layout: 'dropdown',
        ...canvasPurpose('Width-to-height ratio of the video player.'),
      },
    },
  ]),
  preview: {
    select: {
      title: 'title',
      body: 'body',
      caption: 'caption',
    },
    prepare({ title, body, caption }) {
      return {
        title: title || 'Video section',
        subtitle: pageSectionListSubtitle('Video section', body, caption),
      }
    },
  },
}

/**
 * A published HyperFrames composition, embedded live.
 *
 * Distinct from `videoSection`, which points at a rendered MP4. This one points
 * at the composition itself: re-publishing the project updates the same URL, so
 * a copy fix ships without a re-render or a re-upload. Use `videoSection` when a
 * file is genuinely wanted (a download, a social cut); use this for the page.
 */
const hyperframesSectionType = {
  name: 'hyperframesSection',
  title: 'HyperFrames video',
  type: 'object',
  initialValue: { type: 'hyperframes', aspectRatio: '16:9' },
  fields: withSectionBackgroundFields([
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline above the video heading.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Primary heading for the video section.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
      options: canvasPurpose('Supporting copy shown above the player.'),
    },
    {
      name: 'project',
      title: 'Video project',
      type: 'reference',
      to: [{ type: 'videoProject' }],
      description: "The document that owns this film's script and figures.",
      options: canvasExclude,
    },
    {
      name: 'embedUrl',
      title: 'Published HyperFrames URL',
      type: 'url',
      description:
        'From `npx hyperframes publish`. Must be public for visitors to play it — a private project shows a sign-in wall.',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Hosted URL of the published composition.'),
    },
    {
      ...defineUploadedImage(
        'posterImage',
        'Poster image',
        canvasPurpose('Still shown before playback. The embed does not load until the visitor presses play.'),
      ),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      options: canvasPurpose('Optional caption below the player.'),
    },
    {
      name: 'fallbackUrl',
      title: 'Fallback link',
      type: 'url',
      description: 'Where to send someone who cannot run the embed — usually the YouTube URL.',
      options: canvasExclude,
    },
    {
      name: 'aspectRatio',
      title: 'Aspect ratio',
      type: 'string',
      initialValue: '16:9',
      options: {
        list: [
          { title: '16:9', value: '16:9' },
          { title: '1:1 (Square)', value: '1:1' },
          { title: '9:16 (Vertical)', value: '9:16' },
        ],
        layout: 'dropdown',
        ...canvasPurpose('Width-to-height ratio of the player.'),
      },
    },
  ]),
  preview: {
    select: { title: 'title', caption: 'caption', url: 'embedUrl' },
    prepare({ title, caption, url }) {
      return {
        title: title || 'HyperFrames video',
        subtitle: caption || url || 'No URL set',
      }
    },
  },
}

const pageSectionType = {
  name: 'pageSection',
  title: 'Legacy Page Section',
  type: 'object',
  fields: [...legacyPageSectionFields, ...heroSpecificFields.map(heroOnlyField)],
  preview: {
    select: {
      title: 'title',
      sectionType: 'type',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, sectionType, eyebrow, body }) {
      const kind = legacyPageSectionTypeLabel(sectionType)
      return {
        title: title || eyebrow || 'Untitled section',
        subtitle: pageSectionListSubtitle(kind, body),
      }
    },
  },
}

/**
 * Every section type a page can hold. Exported so other documents can offer the same
 * page-builder blocks — `caseStudy` appends them beneath its structured article —
 * without a second list that silently drifts out of sync with this one.
 */
export const pageSectionTypes = [
  { type: 'heroSection' },
  { type: 'storySection' },
  { type: 'articleSection' },
  { type: 'calculatorSection' },
  { type: 'costsSection' },
  { type: 'guidesSection' },
  { type: 'solarAdoptionSection' },
  { type: 'solarBenefitsSection' },
  { type: 'solarDifferenceSection' },
  { type: 'snapshotSection' },
  { type: 'incentivesSection' },
  { type: 'testimonialsSection' },
  { type: 'caseStudyGridSection' },
  { type: 'highlightsSection' },
  { type: 'stepsSection' },
  { type: 'faqSection' },
  { type: 'gallerySection' },
  { type: 'pricingSection' },
  { type: 'quoteSection' },
  { type: 'ctaSection' },
  { type: 'ctaBannerSection' },
  { type: 'bannerCtaSection' },
  { type: 'secondaryCTASection' },
  { type: 'scrollTextSection' },
  { type: 'hailMapSection' },
  { type: 'serviceAreaMapSection' },
  { type: 'bandSection' },
  { type: 'logosSection' },
  { type: 'solarSwitchSection' },
  { type: 'energyChartSection' },
  { type: 'videoSection' },
  { type: 'hyperframesSection' },
  { type: 'serviceGridSection' },
  { type: 'resourceGridSection' },
  { type: 'guideGridSection' },
  { type: 'aboutProfileSection' },
  { type: 'installProcessSection' },
]

const baseFields = [
  {
    name: 'title',
    title: 'Title',
    type: 'string',
    validation: (Rule) => Rule.required(),
    options: canvasPurpose('Page title or primary title for this document.'),
  },
  {
    name: 'description',
    title: 'Description',
    type: 'text',
    options: canvasPurpose('Short summary or supporting description for the page.'),
  },
  {
    name: 'heroImage',
    title: 'Hero image (legacy)',
    type: 'heroImage',
    hidden: true,
    options: canvasExclude,
  },
  {
    name: 'seo',
    title: 'SEO',
    type: 'object',
    fields: [
      {
        name: 'title',
        title: 'Meta title',
        type: 'string',
      },
      {
        name: 'description',
        title: 'Meta description',
        type: 'text',
      },
      {
        name: 'canonicalUrl',
        title: 'Canonical URL override',
        type: 'url',
      },
      {
        name: 'ogImage',
        title: 'Open Graph image URL',
        type: 'url',
      },
      {
        name: 'noIndex',
        title: 'No index',
        type: 'boolean',
        initialValue: false,
      },
    ],
    options: canvasPurpose('Search metadata overrides and index controls for this page.'),
  },
  {
    name: 'site',
    title: 'Site',
    type: 'reference',
    to: [{ type: 'site' }],
    validation: (Rule) => Rule.required(),
    options: canvasExclude,
  },
  { name: 'pageType', title: 'Page type', type: 'string', options: canvasExclude },
  {
    name: 'templateLevel',
    title: 'Template level',
    type: 'string',
    description: 'Select the page template family used by this page.',
    options: {
      list: [
        { title: 'Hero', value: 'hero' },
        { title: 'Landing', value: 'landing' },
        { title: 'Install Process Section', value: 'installProcess' },
      ],
      layout: 'radio',
      ...canvasExclude,
    },
  },
  {
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {
      source: 'title',
      ...canvasPurpose("URL path segment for this page. For a homepage, use '/'."),
    },
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'sections',
    title: 'Sections',
    type: 'array',
    options: canvasPurpose(
      'Structured page sections. Map headings, body copy, calls to action, proof points, and FAQ items into the relevant section.',
    ),
    of: [...pageSectionTypes],
  },
]

const pageDocuments = [
  {
    name: 'page',
    title: 'Page',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'General website page for a domain, including homepage and evergreen landing pages.',
      },
    },
    fields: baseFields,
  },
  {
    name: 'servicePage',
    title: 'Service Page',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'Service-specific page focused on one offering for a domain.',
      },
    },
    fields: baseFields,
  },
  {
    name: 'locationPage',
    title: 'Location Page',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'Location-targeted page focused on one city, neighborhood, or service area.',
      },
    },
    fields: baseFields,
  },
  {
    name: 'post',
    title: 'Post',
    type: 'document',
    options: {
      canvasApp: {
        purpose:
          'Editorial or blog content for a domain, including guides, comparisons, and educational posts.',
      },
    },
    fields: baseFields,
  },
]

export default [
  portableTextSimpleType,
  heroImageUrlsType,
  heroImageType,
  uploadedImageType,
  heroVideoUrlsType,
  heroVideoType,
  uploadedVideoType,
  bandColorStopType,
  galleryImageType,
  galleryPhotoType,
  galleryProjectType,
  gallerySectionType,
  pricingNoteItemType,
  pricingSectionType,
  pageMetricType,
  pageActionType,
  pageItemType,
  snapshotItemType,
  serviceGridItemType,
  guideCardItemType,
  energyChartPointType,
  energyChartAreaSeriesItemType,
  sectionContentItemType,
  solarFeatureCardItemType,
  logoMarqueeItemType,
  heroSlideItemType,
  pageFaqItemType,
  resourceCardType,
  heroSectionType,
  storySectionType,
  articleSectionType,
  calculatorSectionType,
  costStatItemType,
  paybackSummaryItemType,
  costsSectionType,
  guidesSectionType,
  adoptionReasonItemType,
  solarAdoptionSectionType,
  solarBenefitsSectionType,
  solarDifferenceSectionType,
  snapshotSectionType,
  incentivesSectionType,
  testimonialsSectionType,
  caseStudyGridSectionType,
  scrollTextSectionType,
  highlightsSectionType,
  stepsSectionType,
  faqSectionType,
  quoteSectionType,
  ctaSectionType,
  ctaBannerSectionType,
  bannerCtaSectionType,
  secondaryCTASectionType,
  hailMapSectionType,
  serviceAreaItemType,
  serviceAreaMapSectionType,
  bandSectionType,
  logosSectionType,
  solarSwitchSectionType,
  energyChartSectionType,
  videoSectionType,
  hyperframesSectionType,
  serviceGridSectionType,
  resourceGridSectionType,
  guideGridSectionType,
  aboutProfilePersonType,
  aboutProfileSectionType,
  installProcessStepType,
  installProcessSectionType,
  pageSectionType,
  ...pageDocuments,
]
