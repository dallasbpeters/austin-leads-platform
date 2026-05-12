import ChartPointsJsonInput from '../components/ChartPointsJsonInput'

const canvasExclude = { canvasApp: { exclude: true } }
const canvasPurpose = (purpose) => ({ canvasApp: { purpose } })
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
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''

  return value
    .map((block) => {
      if (typeof block === 'string') return block
      if (Array.isArray(block?.children)) {
        return block.children.map((child) => child?.text || '').join('')
      }

      return ''
    })
    .filter(Boolean)
    .join(' ')
}
const previewText = (value, fallback) => {
  const normalized = richTextToPreviewString(value).replace(/\s+/g, ' ').trim()
  if (!normalized) return fallback
  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized
}
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
      styles: [{ title: 'Normal', value: 'normal' }],
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
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
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
    { name: 'creditUsername', title: 'Photographer username', type: 'string', options: canvasExclude },
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
    prepare({ title, subtitle }) {
      return {
        title: title || 'Hero image',
        subtitle: subtitle ? `Photo by ${subtitle}` : 'Image metadata',
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
      name: 'posterImage',
      title: 'Poster image',
      type: 'uploadedImage',
      options: canvasPurpose('Still frame shown before playback and as a fallback for non-video clients.'),
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
        media: poster,
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
      name: 'posterImage',
      title: 'Poster image',
      type: 'uploadedImage',
      options: canvasPurpose('Optional still frame shown before playback.'),
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
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasExclude,
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

const serviceGridItemType = {
  name: 'serviceGridItem',
  title: 'Service Card',
  type: 'object',
  fields: [
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
      title: 'Price',
      type: 'number',
      options: canvasPurpose('Price of the service.'),
      precision: 2,
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
      name: 'imageAsset',
      title: 'Image',
      type: 'uploadedImage',
      options: canvasExclude,
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
    },
    prepare({ title, eyebrow, subtitle }) {
      return {
        title: title || 'Service card',
        subtitle: previewText(eyebrow || subtitle, 'Service card'),
      }
    },
  },
}

const guideCardItemType = {
  name: 'guideCardItem',
  title: 'Guide Card Item',
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
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasExclude,
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
    },
    prepare({ title, subtitle, href }) {
      return {
        title: title || 'Guide card',
        subtitle: previewText(subtitle, href || 'Guide card content'),
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
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasExclude,
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
      }
    },
  },
}

const heroSlideItemType = {
  name: 'heroSlideItem',
  title: 'Hero Slide',
  type: 'object',
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
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasExclude,
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
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasExclude,
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
      }
    },
  },
}

const resourceGridSectionType = {
  name: 'resourceGridSection',
  title: 'Resource Grid Section',
  type: 'object',
  initialValue: {
    type: 'resourceGrid',
  },
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      body: 'body',
      items: 'items',
    },
    prepare({ title, body, items }) {
      const cardCount = arrayCount(items)
      return {
        title: title || 'Resource grid',
        subtitle: previewText(body, `${cardCount || 0} cards`),
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
  fields: [
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
  ],
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
        subtitle: previewText(body, `${cardCount || 0} guides`),
      }
    },
  },
}

const serviceGridSectionType = {
  name: 'serviceGridSection',
  title: 'Service Grid Section',
  type: 'object',
  initialValue: {
    type: 'serviceGrid',
  },
  fields: [
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
  ],
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
        subtitle: previewText(eyebrow, countSummary),
      }
    },
  },
}

const aboutProfilePersonType = {
  name: 'aboutProfilePerson',
  title: 'About Profile Person',
  type: 'object',
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
      name: 'profileImageAsset',
      title: 'Uploaded profile image',
      type: 'uploadedImage',
      options: canvasExclude,
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
      name: 'badgeImageAsset',
      title: 'Uploaded certification badge image',
      type: 'uploadedImage',
      options: canvasExclude,
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
      }
    },
  },
}

const aboutProfileSectionType = {
  name: 'aboutProfileSection',
  title: 'About Profile Section',
  type: 'object',
  initialValue: {
    type: 'aboutProfile',
  },
  fields: [
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
      validation: (Rule) => Rule.max(2),
      options: canvasPurpose('Profile cards shown in this section.'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'About profiles',
        subtitle: previewText(subtitle, 'Profile cards'),
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
    title: 'Split headline part 1',
    type: 'string',
    options: canvasPurpose('Primary homepage hero word or phrase shown in the solid style.'),
  },
  {
    name: 'titleAccent',
    title: 'Split headline part 2',
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
  { name: 'heroOverlayEndColor', title: 'Hero overlay end color', type: 'color', options: canvasExclude },
  { name: 'heroOverlayDirection', title: 'Hero overlay direction', type: 'string', options: canvasExclude },
  {
    name: 'heroOverlayStartOpacity',
    title: 'Hero overlay start opacity',
    type: 'number',
    options: canvasExclude,
  },
  {
    name: 'heroOverlayEndOpacity',
    title: 'Hero overlay end opacity',
    type: 'number',
    options: canvasExclude,
  },
  { name: 'heroOverlayOpacity', title: 'Hero overlay opacity', type: 'number', options: canvasExclude },
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
    name: 'heroAsset',
    title: 'Uploaded hero image',
    type: 'uploadedImage',
    options: canvasExclude,
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
  fields: [
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
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Hero title used on generic pages and guides.'),
    },
    {
      name: 'cardCopy',
      title: 'Card copy',
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
  ],
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
        subtitle: previewText(body, titleAccent || 'hero'),
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
  fields: [
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
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Subtitle for the story section.'),
    },
  ],
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
        subtitle: previewText(body, subtitle || 'story'),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Calculator section',
        subtitle: previewText(subtitle, 'Solar calculator'),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
      items: 'items',
    },
    prepare({ title, subtitle, items }) {
      const count = arrayCount(items)
      return {
        title: title || 'Costs section',
        subtitle: previewText(subtitle, `${count || 0} cost stats`),
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
  fields: [
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
  ],
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
        subtitle: previewText(subtitle, count ? `${count} guide cards` : 'Guide grid intro'),
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
  fields: [
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
      of: [{ type: 'pageItem' }],
      validation: (Rule) => Rule.max(4),
      options: canvasPurpose('Metric cards with value/title/body and optional icon.'),
    },
  ],
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
        subtitle: previewText(subtitle, `${count || 0} snapshot cards`),
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
  fields: [
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
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasPurpose('Optional image shown beside the roofing and insurance copy.'),
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Incentives section',
        subtitle: previewText(subtitle, 'Incentive guidance'),
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
  fields: [
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
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'review' }],
        },
      ],
      validation: (Rule) => Rule.max(6),
      options: canvasPurpose('Optional review references. If empty, site-level reviews are used.'),
    },
  ],
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
        subtitle: previewText(subtitle, reviewCount ? `${reviewCount} selected reviews` : 'Customer proof'),
      }
    },
  },
}

const highlightsSectionType = {
  name: 'highlightsSection',
  title: 'Highlights Section',
  type: 'object',
  initialValue: {
    type: 'highlights',
  },
  fields: [
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      items: 'items',
    },
    prepare({ title, subtitle, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'Highlights section',
        subtitle: previewText(subtitle, `${itemCount || 0} items`),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({ title, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'Steps section',
        subtitle: `${itemCount || 0} items`,
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

const gallerySectionType = {
  name: 'gallerySection',
  title: 'Gallery Section',
  type: 'object',
  initialValue: {
    type: 'gallery',
  },
  fields: [
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
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'galleryImage' }],
      validation: (Rule) => Rule.required().min(1),
      options: canvasPurpose(
        'Photos to display in the masonry gallery. Each photo can be tagged with neighborhood, year, and package.',
      ),
    },
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      images: 'images',
    },
    prepare({ title, eyebrow, images }) {
      const itemCount = arrayCount(images)
      return {
        title: title || 'Gallery section',
        subtitle: [eyebrow, `${itemCount || 0} images`].filter(Boolean).join(' · '),
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
      variant: 'variant',
    },
    prepare({ title, body, variant }) {
      const label = variant === 'callout' ? 'Callout' : 'Standard'
      return {
        title: title || 'Pricing note',
        subtitle: `${label} · ${previewText(body, 'Supporting copy')}`,
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      notes: 'notes',
    },
    prepare({ title, eyebrow, notes }) {
      const noteCount = arrayCount(notes)
      return {
        title: title || 'Pricing section',
        subtitle: [eyebrow, noteCount ? `${noteCount} note${noteCount === 1 ? '' : 's'}` : null]
          .filter(Boolean)
          .join(' · '),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items',
    },
    prepare({ title, items }) {
      const itemCount = arrayCount(items)
      return {
        title: title || 'FAQ section',
        subtitle: `${itemCount || 0} questions`,
      }
    },
  },
}

const quoteSectionType = {
  name: 'quoteSection',
  title: 'Quote Section',
  type: 'object',
  initialValue: {
    type: 'quote',
  },
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Quote section',
        subtitle: previewText(body, 'Quote'),
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
  fields: [
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
      name: 'avatarImageAsset',
      title: 'Uploaded avatar image',
      type: 'uploadedImage',
      options: canvasExclude,
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'body',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'CTA section',
        subtitle: previewText(subtitle, 'Call to action'),
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
  fields: [
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'text',
      title: 'Texts',
      type: 'array',
      of: [{ type: 'string' }],
      options: canvasPurpose('Texts to scroll.'),
    },
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
  ],
  preview: {
    select: {
      title: 'title',
      text: 'text',
    },
    prepare({ title, text }) {
      return {
        title: title || 'Scroll text section',
        subtitle: previewText(text, 'Texts to scroll'),
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
  fields: [
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
      name: 'avatarImageAsset',
      title: 'Uploaded avatar image',
      type: 'uploadedImage',
      options: canvasExclude,
    },
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Cross-lead banner',
        subtitle: previewText(body, 'Lead banner'),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      body: 'body',
      color: 'color',
    },
    prepare({ title, body }) {
      return {
        title: title || 'Secondary CTA section',
        subtitle: previewText(body, 'Secondary CTA section'),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      body: 'body',
    },
    prepare({ title, body }) {
      return {
        title: title || 'Hail map section',
        subtitle: previewText(body, 'Storm evidence lookup'),
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      areas: 'areas',
    },
    prepare({ title, eyebrow, areas }) {
      const areaCount = arrayCount(areas)
      return {
        title: title || 'Service area map',
        subtitle: [eyebrow, `${areaCount} ${areaCount === 1 ? 'county' : 'counties'}`]
          .filter(Boolean)
          .join(' · '),
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
  fields: [
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
  ],
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
        subtitle: flags || 'Decorative divider',
      }
    },
  },
}

const logosSectionType = {
  name: 'logosSection',
  title: 'Logos Marquee Section',
  type: 'object',
  initialValue: {
    type: 'logos',
    internalLabel: 'Certifications marquee',
  },
  fields: [
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
  ],
  preview: {
    select: {
      internalLabel: 'internalLabel',
      title: 'title',
      items: 'items',
    },
    prepare({ internalLabel, title, items }) {
      const count = arrayCount(items)
      return {
        title: internalLabel || title || 'Logos marquee',
        subtitle: `${count || 0} custom logos${title ? ` • ${title}` : ''}`,
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
  fields: [
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
  ],
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
        subtitle: previewText(trailingText, `${leadingCount || 0} leading words`),
      }
    },
  },
}

const energyChartSectionType = {
  name: 'energyChartSection',
  title: 'Chart Section',
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
  fields: [
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
  ],
  preview: {
    select: {
      title: 'title',
      points: 'chartPoints',
      period: 'chartPeriodLabel',
    },
    prepare({ title, points, period }) {
      const count = arrayCount(points)
      return {
        title: title || 'Energy chart section',
        subtitle: previewText(period, `${count || 0} points`),
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
      subtitle: 'type',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, subtitle, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Untitled section',
        subtitle: previewText(body, subtitle || 'section'),
      }
    },
  },
}

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
    options: { list: ['hero', 'landing'], ...canvasExclude },
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
    of: [
      { type: 'heroSection' },
      { type: 'storySection' },
      { type: 'calculatorSection' },
      { type: 'costsSection' },
      { type: 'guidesSection' },
      { type: 'snapshotSection' },
      { type: 'incentivesSection' },
      { type: 'testimonialsSection' },
      { type: 'highlightsSection' },
      { type: 'stepsSection' },
      { type: 'faqSection' },
      { type: 'gallerySection' },
      { type: 'pricingSection' },
      { type: 'quoteSection' },
      { type: 'ctaSection' },
      { type: 'ctaBannerSection' },
      { type: 'secondaryCTASection' },
      { type: 'scrollTextSection' },
      { type: 'hailMapSection' },
      { type: 'serviceAreaMapSection' },
      { type: 'bandSection' },
      { type: 'logosSection' },
      { type: 'solarSwitchSection' },
      { type: 'energyChartSection' },
      { type: 'serviceGridSection' },
      { type: 'resourceGridSection' },
      { type: 'guideGridSection' },
      { type: 'aboutProfileSection' },
    ],
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
  gallerySectionType,
  pricingNoteItemType,
  pricingSectionType,
  pageMetricType,
  pageActionType,
  pageItemType,
  serviceGridItemType,
  guideCardItemType,
  energyChartPointType,
  energyChartAreaSeriesItemType,
  sectionContentItemType,
  logoMarqueeItemType,
  heroSlideItemType,
  pageFaqItemType,
  resourceCardType,
  heroSectionType,
  storySectionType,
  calculatorSectionType,
  costStatItemType,
  paybackSummaryItemType,
  costsSectionType,
  guidesSectionType,
  snapshotSectionType,
  incentivesSectionType,
  testimonialsSectionType,
  scrollTextSectionType,
  highlightsSectionType,
  stepsSectionType,
  faqSectionType,
  quoteSectionType,
  ctaSectionType,
  ctaBannerSectionType,
  secondaryCTASectionType,
  hailMapSectionType,
  serviceAreaItemType,
  serviceAreaMapSectionType,
  bandSectionType,
  logosSectionType,
  solarSwitchSectionType,
  energyChartSectionType,
  serviceGridSectionType,
  resourceGridSectionType,
  guideGridSectionType,
  aboutProfilePersonType,
  aboutProfileSectionType,
  pageSectionType,
  ...pageDocuments,
]
