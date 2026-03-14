const canvasExclude = { canvasApp: { exclude: true } }
const canvasPurpose = (purpose) => ({ canvasApp: { purpose } })
const hideUnlessHomepage = ({ document }) => document?.pageType !== 'home'
const isSectionType = (parent, ...types) => types.includes(parent?.type)
const hideUnlessSectionTypes =
  (...types) =>
  ({ parent }) =>
    !isSectionType(parent, ...types)
const previewText = (value, fallback) => {
  if (typeof value !== 'string') return fallback
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return fallback
  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized
}

const hasLegacyAboutPeople = (parent) =>
  Boolean(
    parent?.personName ||
      parent?.profileName ||
      parent?.secondaryPersonName ||
      parent?.secondaryProfileName,
  )

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
      type: 'text',
      options: canvasPurpose('Optional label for the subtitle.'),
    },
    {
      name: 'subtitleValue',
      title: 'Subtitle Value',
      type: 'text',
      options: canvasPurpose('Optional longer description or supporting text for the item.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
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
      type: 'text',
      options: canvasPurpose('Answer text for FAQ-style items.'),
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      options: canvasPurpose('Optional link target for this item when it should open another page.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
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
        ],
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

const sectionContentItemType = {
  name: 'sectionContentItem',
  title: 'Section Item',
  type: 'object',
  fields: [
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short supporting label for the item.'),
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
      type: 'text',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Supporting copy for the item.'),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          { title: 'Check Circle', value: 'CheckCircle' },
          { title: 'Shield', value: 'Shield' },
          { title: 'Hammer', value: 'Hammer' },
          { title: 'Sun / Solar', value: 'SunLight' },
          { title: 'Question Mark', value: 'QuestionMark' },
          { title: 'Info Circle', value: 'InfoCircle' },
          { title: 'Warning Triangle', value: 'WarningTriangle' },
          { title: 'Map Pin', value: 'MapPin' },
        ],
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
      type: 'text',
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
        list: [
          // Solar & Energy
          { title: 'Sun / Solar', value: 'SunLight' },
          { title: 'Cloud Sunny', value: 'CloudSunny' },
          { title: 'Light Bulb', value: 'LightBulbOn' },
          { title: 'Energy Usage', value: 'EnergyUsageWindow' },
          { title: 'Flash / Electricity', value: 'Flash' },
          { title: 'EV Charge', value: 'EvCharge' },
          { title: 'EV Station', value: 'EvStation' },
          // Battery & Storage
          { title: 'Battery Full', value: 'BatteryFull' },
          { title: 'Battery Charging', value: 'BatteryCharging' },
          { title: 'Battery Warning', value: 'BatteryWarning' },
          // Weather & Storm
          { title: 'Thunderstorm', value: 'Thunderstorm' },
          { title: 'Heavy Rain', value: 'HeavyRain' },
          { title: 'Wind', value: 'Wind' },
          { title: 'Cloud', value: 'Cloud' },
          { title: 'Temperature High', value: 'TemperatureHigh' },
          { title: 'Droplet', value: 'Droplet' },
          // Home & Building
          { title: 'Home', value: 'Home' },
          { title: 'Home Shield / Secure', value: 'HomeShield' },
          { title: 'Home Sale', value: 'HomeSale' },
          { title: 'Building', value: 'Building' },
          { title: 'Garage', value: 'Garage' },
          // Roofing & Construction
          { title: 'Hammer', value: 'Hammer' },
          { title: 'Wrench', value: 'Wrench' },
          { title: 'Tools', value: 'Tools' },
          // Climate & HVAC
          { title: 'Air Conditioner', value: 'AirConditioner' },
          { title: 'Heating', value: 'HeatingSquare' },
          { title: 'Cooling', value: 'CoolingSquare' },
          { title: 'Fire Flame', value: 'FireFlame' },
          // Safety & Protection
          { title: 'Shield', value: 'Shield' },
          { title: 'Shield Check', value: 'ShieldCheck' },
          { title: 'Shield Alert', value: 'ShieldAlert' },
          { title: 'Warning Triangle', value: 'WarningTriangle' },
          // Money & Finance
          { title: 'Dollar', value: 'Dollar' },
          { title: 'Cash', value: 'Cash' },
          { title: 'Credit Card', value: 'CreditCard' },
          { title: 'Coins', value: 'Coins' },
          { title: 'Percentage', value: 'Percentage' },
          // People & Status
          { title: 'User', value: 'User' },
          { title: 'Group', value: 'Group' },
          { title: 'Check Circle', value: 'CheckCircle' },
          { title: 'Star', value: 'Star' },
          { title: 'Search', value: 'Search' },
          { title: 'Map Pin', value: 'MapPin' },
          { title: 'Calendar', value: 'Calendar' },
          { title: 'Clock', value: 'Clock' },
          { title: 'Phone', value: 'Phone' },
          { title: 'Leaf', value: 'Leaf' },
        ],
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
      type: 'text',
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
        subtitle: subtitle || 'Homepage resource card',
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
      cardCount: 'items.length',
    },
    prepare({ title, cardCount }) {
      return {
        title: title || 'Resource grid',
        subtitle: `${cardCount || 0} cards`,
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
      type: 'text',
      options: canvasPurpose('Optional supporting copy above the guide grid.'),
    },
    {
      name: 'items',
      title: 'Guide cards',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [{ type: 'pageItem' }],
      options: canvasPurpose('Guide cards shown in the grid.'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      body: 'body',
      cardCount: 'items.length',
    },
    prepare({ title, body, cardCount }) {
      return {
        title: title || 'Guide grid',
        subtitle: previewText(body, `${cardCount || 0} guides`),
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
      type: 'text',
      options: canvasPurpose('Short profile summary for this person.'),
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
      type: 'text',
      options: canvasPurpose('Supporting copy introducing the profile and certification block.'),
    },
    {
      name: 'people',
      title: 'People',
      type: 'array',
      of: [{ type: 'aboutProfilePerson' }],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const count = Array.isArray(value) ? value.length : 0

          if (count > 2) {
            return 'Add no more than 2 people.'
          }

          if (count === 0 && hasLegacyAboutPeople(context.parent)) {
            return true
          }

          return true
        }),
      options: canvasPurpose('Profile cards shown in this section.'),
    },
    {
      name: 'profileImage',
      title: 'Profile image',
      type: 'heroImage',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'profileImageAsset',
      title: 'Uploaded profile image',
      type: 'uploadedImage',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'personLabel',
      title: 'Profile label',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Small label above the person name.'),
    },
    {
      name: 'profileName',
      title: 'Legacy profile name',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'personName',
      title: 'Person name',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Name shown in the profile card.'),
    },
    {
      name: 'profileRole',
      title: 'Legacy profile role',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'personRole',
      title: 'Person role',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Short role or descriptor shown below the name.'),
    },
    {
      name: 'profileBody',
      title: 'Legacy profile blurb',
      type: 'text',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'personBlurb',
      title: 'Profile blurb',
      type: 'text',
      hidden: true,
      options: canvasPurpose('Short profile summary.'),
    },
    {
      name: 'certificationLabel',
      title: 'Certification label',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Small label above the certification title.'),
    },
    {
      name: 'certificationTitle',
      title: 'Certification title',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Certification or credential title.'),
    },
    {
      name: 'badgeImage',
      title: 'Certification badge image',
      type: 'heroImage',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'badgeImageAsset',
      title: 'Uploaded certification badge image',
      type: 'uploadedImage',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'certificationImageUrl',
      title: 'Legacy certification image URL',
      type: 'url',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'secondaryProfileImage',
      title: 'Secondary profile image',
      type: 'heroImage',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'secondaryProfileImageAsset',
      title: 'Uploaded secondary profile image',
      type: 'uploadedImage',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'secondaryPersonLabel',
      title: 'Secondary profile label',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Small label above the secondary profile name.'),
    },
    {
      name: 'secondaryProfileName',
      title: 'Legacy secondary profile name',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'secondaryPersonName',
      title: 'Secondary person name',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Name shown in the secondary profile card.'),
    },
    {
      name: 'secondaryProfileRole',
      title: 'Legacy secondary profile role',
      type: 'string',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'secondaryPersonRole',
      title: 'Secondary person role',
      type: 'string',
      hidden: true,
      options: canvasPurpose('Short role or descriptor shown below the secondary name.'),
    },
    {
      name: 'secondaryProfileBody',
      title: 'Legacy secondary profile blurb',
      type: 'text',
      hidden: true,
      options: canvasExclude,
    },
    {
      name: 'secondaryPersonBlurb',
      title: 'Secondary profile blurb',
      type: 'text',
      hidden: true,
      options: canvasPurpose('Short profile summary for the secondary person.'),
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

const genericSectionFields = [
  { name: 'type', title: 'Section type', type: 'string', options: canvasExclude },
  {
    name: 'eyebrow',
    title: 'Eyebrow',
    type: 'string',
    hidden: hideUnlessSectionTypes('story'),
    options: canvasPurpose('Short overline or kicker text that introduces the section.'),
  },
  {
    name: 'title',
    title: 'Title',
    type: 'string',
    options: canvasPurpose('Primary heading for this section.'),
  },
  {
    name: 'body',
    title: 'Body',
    type: 'text',
    hidden: hideUnlessSectionTypes('story', 'cta'),
    options: canvasPurpose('Main body copy for this section.'),
  },
  {
    name: 'subheadingLabel',
    title: 'Subheading Label',
    type: 'text',
    hidden: true,
    options: canvasPurpose('Optional label for the subheading.'),
  },
  {
    name: 'subheading',
    title: 'Subheading',
    type: 'text',
    hidden: true,
    options: canvasPurpose('Optional subheading or secondary heading for this section.'),
  },
  {
    name: 'items',
    title: 'Items',
    type: 'array',
    hidden: hideUnlessSectionTypes('highlights', 'steps', 'faq'),
    options: canvasPurpose(
      'Repeatable content items like cards, FAQs, or supporting bullets for the section.',
    ),
    of: [{ type: 'pageItem' }],
  },
  {
    name: 'ctaLabel',
    title: 'CTA label',
    type: 'string',
    hidden: hideUnlessSectionTypes('cta'),
    options: canvasPurpose('Label for the main call-to-action button or link.'),
  },
  {
    name: 'ctaHref',
    title: 'CTA href',
    type: 'string',
    hidden: hideUnlessSectionTypes('cta'),
    options: canvasPurpose('Link target or anchor for the call-to-action.'),
  },
]

const heroSpecificFields = [
  { name: 'heroGradient', title: 'Hero gradient', type: 'text', options: canvasExclude },
  { name: 'heroTextColor', title: 'Hero text color', type: 'string', options: canvasExclude },
  { name: 'heroOverlayColor', title: 'Hero overlay color', type: 'string', options: canvasExclude },
  {
    name: 'heroOverlayStartColor',
    title: 'Hero overlay start color',
    type: 'string',
    options: canvasExclude,
  },
  { name: 'heroOverlayEndColor', title: 'Hero overlay end color', type: 'string', options: canvasExclude },
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
  { name: 'heroImage', title: 'Hero image', type: 'heroImage', options: canvasExclude },
  { name: 'heroAsset', title: 'Uploaded hero image', type: 'uploadedImage', options: canvasExclude },
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
  fields: [...genericSectionFields, ...heroSpecificFields],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      body: 'body',
    },
    prepare({ title, eyebrow, body }) {
      return {
        title: title || eyebrow || 'Hero section',
        subtitle: previewText(body, 'hero'),
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
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Primary story heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main explanatory copy for the story section.'),
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
        title: title || eyebrow || 'Story section',
        subtitle: previewText(body, 'story'),
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
      itemCount: 'items.length',
    },
    prepare({ title, itemCount }) {
      return {
        title: title || 'Highlights section',
        subtitle: `${itemCount || 0} items`,
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
      itemCount: 'items.length',
    },
    prepare({ title, itemCount }) {
      return {
        title: title || 'Steps section',
        subtitle: `${itemCount || 0} items`,
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
      itemCount: 'items.length',
    },
    prepare({ title, itemCount }) {
      return {
        title: title || 'FAQ section',
        subtitle: `${itemCount || 0} questions`,
      }
    },
  },
}

const ctaSectionType = {
  name: 'ctaSection',
  title: 'CTA Section',
  type: 'object',
  initialValue: {
    type: 'cta',
  },
  fields: [
    { name: 'type', title: 'Section type', type: 'string', hidden: true, options: canvasExclude },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Main CTA headline.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      options: canvasPurpose('Supporting CTA copy.'),
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Label for the CTA button or link.'),
    },
    {
      name: 'ctaHref',
      title: 'CTA href',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: canvasPurpose('Link target or anchor for the CTA.'),
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

const pageSectionType = {
  name: 'pageSection',
  title: 'Page Section',
  type: 'object',
  fields: [...genericSectionFields, ...heroSpecificFields.map(heroOnlyField)],
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
    name: 'heroEyebrow',
    title: 'Hero Eyebrow',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasPurpose('Short kicker text above the homepage hero headline.'),
  },
  {
    name: 'heroTitle',
    title: 'Hero Title',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasPurpose('Main homepage hero headline.'),
  },
  {
    name: 'heroBody',
    title: 'Hero Body',
    type: 'text',
    hidden: hideUnlessHomepage,
    options: canvasPurpose('Supporting copy under the homepage hero headline.'),
  },
  {
    name: 'heroGradient',
    title: 'Hero Gradient',
    type: 'text',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroTextColor',
    title: 'Hero Text Color',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayColor',
    title: 'Hero Overlay Color',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayStartColor',
    title: 'Hero Overlay Start Color',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayEndColor',
    title: 'Hero Overlay End Color',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayDirection',
    title: 'Hero Overlay Direction',
    type: 'string',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayStartOpacity',
    title: 'Hero Overlay Start Opacity',
    type: 'number',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayEndOpacity',
    title: 'Hero Overlay End Opacity',
    type: 'number',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroOverlayOpacity',
    title: 'Hero Overlay Opacity',
    type: 'number',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroAsset',
    title: 'Uploaded Hero Image',
    type: 'uploadedImage',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroImage',
    title: 'External Hero Image',
    type: 'heroImage',
    hidden: hideUnlessHomepage,
    options: canvasExclude,
  },
  {
    name: 'heroMetrics',
    title: 'Hero Metrics',
    type: 'array',
    hidden: hideUnlessHomepage,
    of: [{ type: 'pageMetric' }],
    options: canvasPurpose('Short proof-point pairs shown in the homepage hero panel.'),
  },
  {
    name: 'heroActions',
    title: 'Hero Actions',
    type: 'array',
    hidden: hideUnlessHomepage,
    of: [{ type: 'pageAction' }],
    options: canvasPurpose('Buttons or links shown in the homepage hero.'),
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
      { type: 'highlightsSection' },
      { type: 'stepsSection' },
      { type: 'faqSection' },
      { type: 'ctaSection' },
      { type: 'resourceGridSection' },
      { type: 'guideGridSection' },
      { type: 'aboutProfileSection' },
      { type: 'pageSection' },
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
  heroImageUrlsType,
  heroImageType,
  uploadedImageType,
  pageMetricType,
  pageActionType,
  pageItemType,
  sectionContentItemType,
  pageFaqItemType,
  resourceCardType,
  heroSectionType,
  storySectionType,
  highlightsSectionType,
  stepsSectionType,
  faqSectionType,
  ctaSectionType,
  resourceGridSectionType,
  guideGridSectionType,
  aboutProfilePersonType,
  aboutProfileSectionType,
  pageSectionType,
  ...pageDocuments,
]
