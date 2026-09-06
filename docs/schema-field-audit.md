# Schema field audit

Generated 2026-09-06 from 33 published pages.

Code = the renderer (plus its local imports and the shared content helpers) references the field. Data = how many published sections hold a value. **Unused** = no code, no data. **Data only** = content exists but nothing renders it.

## aboutProfileSection (aboutProfile) · 2 in data

Renderer: `src/components/platform/sections/about-profile-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/components/ui/badge.jsx`, `src/components/ui/card.jsx`, `src/lib/platform/imageSource.js`

| Field                       | Type               | Renderer | Helpers | Data | Verdict            |
| --------------------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type                        | string             | yes      | yes     | 2    | shared wrapper     |
| eyebrow                     | string             | yes      | no      | 1    | keep               |
| title                       | string             | yes      | yes     | 2    | keep               |
| body                        | portableTextSimple | yes      | yes     | 2    | keep               |
| people                      | array              | yes      | yes     | 2    | keep               |
| people[].label              | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].name               | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].role               | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].blurb              | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| people[].cardGradientStart  | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].cardGradientEnd    | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].profileImage       | heroImage          | yes      | no      | 0    | keep (no data yet) |
| people[].certificationLabel | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].certificationTitle | string             | yes      | yes     | 0    | keep (no data yet) |
| people[].badgeImage         | heroImage          | yes      | no      | 0    | keep (no data yet) |

## articleSection (article) · 3 in data

Renderer: `src/components/article-section.jsx`, `src/components/guide-share-bar.jsx`, `src/components/portable-text-content.jsx`, `src/components/dev/dev-trace.jsx`

| Field   | Type               | Renderer | Helpers | Data | Verdict        |
| ------- | ------------------ | -------- | ------- | ---- | -------------- |
| type    | string             | no       | yes     | 3    | shared wrapper |
| eyebrow | string             | yes      | no      | 2    | keep           |
| title   | string             | yes      | yes     | 3    | keep           |
| body    | portableTextSimple | yes      | yes     | 3    | keep           |

## bandSection (band) · 6 in data

Renderer: `src/components/platform/sections/band-section.jsx`, `src/components/band.jsx`, `src/components/dev/dev-trace.jsx`

| Field          | Type    | Renderer | Helpers | Data | Verdict                   |
| -------------- | ------- | -------- | ------- | ---- | ------------------------- |
| type           | string  | no       | yes     | 6    | shared wrapper            |
| colors         | array   | yes      | yes     | 4    | keep                      |
| tint           | color   | yes      | yes     | 4    | keep                      |
| minHeight      | number  | yes      | yes     | 6    | keep                      |
| maxHeight      | number  | yes      | yes     | 6    | keep                      |
| rotate         | boolean | yes      | yes     | 6    | keep                      |
| scrollStart    | number  | yes      | yes     | 6    | keep                      |
| scrollEnd      | number  | yes      | yes     | 6    | keep                      |
| reverse        | boolean | yes      | yes     | 6    | keep                      |
| autoAnimate    | boolean | yes      | yes     | 6    | keep                      |
| speed          | number  | yes      | yes     | 6    | keep                      |
| amplitude      | number  | yes      | yes     | 6    | keep                      |
| colors[].color | color   | no       | yes     | 0    | **helpers only, no data** |

## bannerCtaSection (bannerCta) · 5 in data

Renderer: `src/components/platform/sections/banner-cta-section.jsx`, `src/components/cloud-section-background.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/components/ui/button.tsx`, `src/lib/platform/imageSource.js`

| Field    | Type               | Renderer | Helpers | Data | Verdict            |
| -------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type     | string             | yes      | yes     | 5    | shared wrapper     |
| eyebrow  | string             | yes      | no      | 3    | keep               |
| title    | string             | yes      | yes     | 5    | keep               |
| body     | portableTextSimple | yes      | yes     | 3    | keep               |
| ctaLabel | string             | yes      | yes     | 5    | keep               |
| ctaHref  | string             | yes      | yes     | 5    | keep               |
| image    | heroImage          | yes      | yes     | 0    | keep (no data yet) |

## calculatorSection (calculator) · 1 in data

Renderer: `src/components/calculator-section.jsx`, `src/components/ui/button.tsx`, `src/components/ui/slider.jsx`, `src/components/card.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field           | Type               | Renderer | Helpers | Data | Verdict                   |
| --------------- | ------------------ | -------- | ------- | ---- | ------------------------- |
| type            | string             | no       | yes     | 1    | shared wrapper            |
| eyebrow         | string             | yes      | no      | 1    | keep                      |
| title           | string             | yes      | yes     | 1    | keep                      |
| subtitle        | portableTextSimple | yes      | yes     | 1    | keep                      |
| body            | portableTextSimple | yes      | yes     | 1    | keep                      |
| items           | array              | yes      | yes     | 1    | keep                      |
| ctaLabel        | string             | yes      | yes     | 1    | keep                      |
| ctaHref         | string             | yes      | yes     | 1    | keep                      |
| items[].eyebrow | string             | yes      | no      | 0    | keep (no data yet)        |
| items[].title   | string             | yes      | yes     | 4    | keep                      |
| items[].body    | portableTextSimple | yes      | yes     | 4    | keep                      |
| items[].icon    | string             | no       | yes     | 0    | **helpers only, no data** |
| items[].href    | string             | yes      | yes     | 0    | keep (no data yet)        |

## caseStudyGridSection (caseStudyGrid) · 1 in data

Renderer: `src/components/platform/sections/case-study-grid-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/guide-card.jsx`, `src/components/portable-text-content.jsx`, `src/components/ui/grid-container.tsx`, `src/lib/platform/imageSource.js`

| Field    | Type               | Renderer | Helpers | Data | Verdict            |
| -------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type     | string             | yes      | yes     | 1    | shared wrapper     |
| title    | string             | yes      | yes     | 1    | keep               |
| body     | portableTextSimple | yes      | yes     | 1    | keep               |
| layout   | string             | yes      | no      | 1    | keep               |
| maxItems | number             | yes      | no      | 1    | keep               |
| featured | array              | yes      | no      | 0    | keep (no data yet) |

## costsSection (costs) · 2 in data

Renderer: `src/components/costs-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field          | Type               | Renderer | Helpers | Data | Verdict        |
| -------------- | ------------------ | -------- | ------- | ---- | -------------- |
| type           | string             | no       | yes     | 2    | shared wrapper |
| eyebrow        | string             | yes      | no      | 2    | keep           |
| title          | string             | yes      | yes     | 2    | keep           |
| body           | portableTextSimple | yes      | yes     | 2    | keep           |
| subtitle       | portableTextSimple | yes      | yes     | 2    | keep           |
| color          | color              | yes      | yes     | 2    | keep           |
| items          | array              | yes      | yes     | 1    | keep           |
| secondaryTitle | string             | no       | yes     | 2    | helpers only   |
| secondaryItems | array              | yes      | yes     | 2    | keep           |
| items[].number | string             | yes      | no      | 3    | keep           |
| items[].title  | string             | yes      | yes     | 5    | keep           |
| items[].body   | portableTextSimple | yes      | yes     | 5    | keep           |
| items[].title  | string             | yes      | yes     | 5    | keep           |
| items[].body   | portableTextSimple | yes      | yes     | 5    | keep           |

## ctaBannerSection (ctaBanner) · 1 in data

Renderer: `src/components/platform/sections/cta-banner-section.jsx`, `src/components/cloud-section-background.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/lead-capture-form.jsx`, `src/components/portable-text-content.jsx`, `src/components/ui/avatar.jsx`, `src/lib/platform/imageSource.js`, `src/components/platform/public-site-utils.js`

| Field         | Type               | Renderer | Helpers | Data | Verdict            |
| ------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type          | string             | yes      | yes     | 1    | shared wrapper     |
| eyebrow       | string             | yes      | no      | 0    | keep (no data yet) |
| title         | string             | yes      | yes     | 1    | keep               |
| body          | portableTextSimple | yes      | yes     | 1    | keep               |
| ctaLabel      | string             | yes      | yes     | 1    | keep               |
| theme         | string             | yes      | yes     | 0    | keep (no data yet) |
| avatarEyebrow | string             | yes      | yes     | 0    | keep (no data yet) |
| avatarName    | string             | yes      | yes     | 0    | keep (no data yet) |
| avatarRole    | string             | yes      | yes     | 0    | keep (no data yet) |
| avatarBlurb   | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| avatarImage   | heroImage          | yes      | no      | 0    | keep (no data yet) |

## ctaSection (cta) · 24 in data

Renderer: `src/components/platform/sections/cta-section.jsx`, `src/components/booking-form.tsx`, `src/components/consultation-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/lib/platform/service-catalog.js`, `src/components/platform/public-site-utils.js`

| Field          | Type               | Renderer | Helpers | Data | Verdict            |
| -------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type           | string             | yes      | yes     | 24   | shared wrapper     |
| title          | string             | yes      | yes     | 24   | keep               |
| body           | portableTextSimple | yes      | yes     | 24   | keep               |
| ctaLabel       | string             | yes      | yes     | 24   | keep               |
| theme          | string             | yes      | yes     | 1    | keep               |
| avatarEyebrow  | string             | yes      | yes     | 0    | keep (no data yet) |
| avatarName     | string             | yes      | yes     | 3    | keep               |
| avatarRole     | string             | yes      | yes     | 3    | keep               |
| avatarBlurb    | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| avatarImage    | heroImage          | yes      | no      | 0    | keep (no data yet) |
| avatarColor    | color              | yes      | yes     | 0    | keep (no data yet) |
| serviceOptions | array              | no       | no      | 0    | **unused**         |

## energyChartSection (energyChart) · 0 in data

Renderer: `src/components/energy-chart-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field                        | Type               | Renderer | Helpers | Data | Verdict            |
| ---------------------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type                         | string             | no       | yes     | 0    | shared wrapper     |
| eyebrow                      | string             | yes      | no      | 0    | keep (no data yet) |
| title                        | string             | yes      | yes     | 0    | keep (no data yet) |
| body                         | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| chartType                    | string             | yes      | yes     | 0    | keep (no data yet) |
| showGrid                     | boolean            | yes      | yes     | 0    | keep (no data yet) |
| showLegend                   | boolean            | yes      | yes     | 0    | keep (no data yet) |
| showAxisLines                | boolean            | yes      | yes     | 0    | keep (no data yet) |
| chartAreaFillOpacity         | number             | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries              | array              | yes      | no      | 0    | keep (no data yet) |
| chartAreaStacked             | boolean            | yes      | no      | 0    | keep (no data yet) |
| chartPeriodLabel             | string             | yes      | yes     | 0    | keep (no data yet) |
| chartPrimaryLabel            | string             | yes      | yes     | 0    | keep (no data yet) |
| chartSecondaryLabel          | string             | yes      | yes     | 0    | keep (no data yet) |
| chartUnitLabel               | string             | yes      | yes     | 0    | keep (no data yet) |
| chartLineUnitLabel           | string             | yes      | yes     | 0    | keep (no data yet) |
| chartYAxisMax                | number             | yes      | yes     | 0    | keep (no data yet) |
| chartBarColor                | string             | yes      | yes     | 0    | keep (no data yet) |
| chartLineColor               | string             | yes      | yes     | 0    | keep (no data yet) |
| chartPoints                  | array              | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries[].title      | string             | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries[].color      | string             | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries[].label      | string             | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries[].barValue   | number             | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries[].lineValue  | number             | yes      | yes     | 0    | keep (no data yet) |
| chartAreaSeries[].areaValues | array              | yes      | no      | 0    | keep (no data yet) |

## faqSection (faq) · 26 in data

Renderer: `src/components/platform/sections/faq-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/ui/card.jsx`, `src/components/platform/sections/faq-accordion.jsx`

| Field            | Type               | Renderer | Helpers | Data | Verdict        |
| ---------------- | ------------------ | -------- | ------- | ---- | -------------- |
| type             | string             | no       | yes     | 26   | shared wrapper |
| title            | string             | yes      | yes     | 26   | keep           |
| items            | array              | yes      | yes     | 26   | keep           |
| items[].question | string             | yes      | yes     | 86   | keep           |
| items[].answer   | portableTextSimple | yes      | yes     | 86   | keep           |

## gallerySection (gallery) · 1 in data

Renderer: `src/components/platform/sections/gallery-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/lib/platform/imageSource.js`

| Field                 | Type               | Renderer | Helpers | Data | Verdict            |
| --------------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type                  | string             | yes      | yes     | 1    | shared wrapper     |
| eyebrow               | string             | yes      | no      | 1    | keep               |
| title                 | string             | yes      | yes     | 1    | keep               |
| subtitle              | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| images                | array              | yes      | no      | 1    | keep               |
| images[].altText      | string             | yes      | no      | 0    | keep (no data yet) |
| images[].neighborhood | string             | yes      | no      | 16   | keep               |
| images[].year         | number             | yes      | no      | 0    | keep (no data yet) |
| images[].package      | string             | yes      | no      | 16   | keep               |

## guideGridSection (guideGrid) · 1 in data

Renderer: `src/components/platform/sections/guide-grid-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/guide-card.jsx`, `src/components/portable-text-content.jsx`, `src/lib/platform/guides.js`, `src/lib/platform/imageSource.js`

| Field                 | Type               | Renderer | Helpers | Data | Verdict                   |
| --------------------- | ------------------ | -------- | ------- | ---- | ------------------------- |
| type                  | string             | yes      | yes     | 1    | shared wrapper            |
| title                 | string             | yes      | yes     | 1    | keep                      |
| body                  | portableTextSimple | yes      | yes     | 1    | keep                      |
| items                 | array              | yes      | yes     | 1    | keep                      |
| items[].number        | string             | yes      | no      | 13   | keep                      |
| items[].eyebrow       | string             | yes      | no      | 0    | keep (no data yet)        |
| items[].title         | string             | yes      | yes     | 13   | keep                      |
| items[].subtitleLabel | portableTextSimple | no       | no      | 0    | **unused**                |
| items[].subtitleValue | portableTextSimple | no       | no      | 0    | **unused**                |
| items[].body          | portableTextSimple | yes      | yes     | 13   | keep                      |
| items[].question      | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].answer        | portableTextSimple | yes      | yes     | 0    | keep (no data yet)        |
| items[].href          | string             | yes      | yes     | 13   | keep                      |
| items[].ctaLabel      | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].category      | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].color         | string             | yes      | yes     | 13   | keep                      |
| items[].icon          | string             | yes      | yes     | 7    | keep                      |
| items[].image         | heroImage          | yes      | yes     | 9    | keep                      |
| items[].imageUrl      | string             | no       | yes     | 0    | **helpers only, no data** |
| items[].video         | heroVideo          | no       | no      | 0    | **unused**                |
| items[].videoAsset    | uploadedVideo      | no       | no      | 0    | **unused**                |

## guidesSection (guides) · 1 in data

Renderer: `src/components/guides-section.jsx`, `src/lib/platform/guides.js`, `src/lib/platform/imageSource.js`, `src/components/cloud-section-background.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/guide-card.jsx`, `src/components/portable-text-content.jsx`

| Field            | Type               | Renderer | Helpers | Data | Verdict                   |
| ---------------- | ------------------ | -------- | ------- | ---- | ------------------------- |
| type             | string             | yes      | yes     | 1    | shared wrapper            |
| title            | string             | yes      | yes     | 1    | keep                      |
| body             | portableTextSimple | yes      | yes     | 1    | keep                      |
| ctaLabel         | string             | yes      | yes     | 1    | keep                      |
| items            | array              | yes      | yes     | 0    | keep (no data yet)        |
| items[].number   | string             | yes      | no      | 0    | keep (no data yet)        |
| items[].eyebrow  | string             | yes      | no      | 0    | keep (no data yet)        |
| items[].title    | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].body     | portableTextSimple | yes      | yes     | 0    | keep (no data yet)        |
| items[].href     | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].ctaLabel | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].icon     | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].color    | string             | yes      | yes     | 0    | keep (no data yet)        |
| items[].image    | heroImage          | yes      | yes     | 0    | keep (no data yet)        |
| items[].imageUrl | string             | no       | yes     | 0    | **helpers only, no data** |

## hailMapSection (hailMap) · 1 in data

Renderer: `src/components/platform/sections/hail-map-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field | Type               | Renderer | Helpers | Data | Verdict        |
| ----- | ------------------ | -------- | ------- | ---- | -------------- |
| type  | string             | no       | yes     | 1    | shared wrapper |
| title | string             | yes      | yes     | 1    | keep           |
| body  | portableTextSimple | yes      | yes     | 1    | keep           |

## heroSection (hero) · 28 in data

Renderer: `src/components/platform/sections/hero-section.jsx`, `src/components/hero.jsx`, `src/components/platform/public-site-utils.js`

| Field    | Type               | Renderer | Helpers | Data | Verdict            |
| -------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type     | string             | yes      | yes     | 28   | shared wrapper     |
| eyebrow  | string             | yes      | no      | 28   | keep               |
| title    | string             | yes      | yes     | 27   | keep               |
| cardCopy | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| body     | portableTextSimple | yes      | yes     | 28   | keep               |

## highlightsSection (highlights) · 20 in data

Renderer: `src/components/platform/sections/card-grid-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field           | Type               | Renderer | Helpers | Data | Verdict            |
| --------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type            | string             | no       | yes     | 20   | shared wrapper     |
| title           | string             | yes      | yes     | 20   | keep               |
| subtitle        | portableTextSimple | yes      | yes     | 3    | keep               |
| items           | array              | yes      | yes     | 20   | keep               |
| items[].eyebrow | string             | yes      | no      | 6    | keep               |
| items[].title   | string             | yes      | yes     | 60   | keep               |
| items[].body    | portableTextSimple | yes      | yes     | 62   | keep               |
| items[].icon    | string             | yes      | yes     | 16   | keep               |
| items[].href    | string             | yes      | yes     | 0    | keep (no data yet) |

## incentivesSection (incentives) · 1 in data

Renderer: `src/components/incentives-section.jsx`, `src/components/ui/button.tsx`, `src/lib/platform/imageSource.js`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field    | Type               | Renderer | Helpers | Data | Verdict            |
| -------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type     | string             | yes      | yes     | 1    | shared wrapper     |
| title    | string             | yes      | yes     | 1    | keep               |
| body     | portableTextSimple | yes      | yes     | 1    | keep               |
| image    | heroImage          | yes      | yes     | 0    | keep (no data yet) |
| ctaLabel | string             | yes      | yes     | 1    | keep               |
| ctaHref  | string             | yes      | yes     | 1    | keep               |

## installProcessSection (installProcess) · 1 in data

Renderer: `src/components/platform/sections/install-process-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/install-process.jsx`, `src/components/platform/sections/install-process-timeline-client.jsx`

| Field             | Type               | Renderer | Helpers | Data | Verdict        |
| ----------------- | ------------------ | -------- | ------- | ---- | -------------- |
| type              | string             | no       | yes     | 1    | shared wrapper |
| eyebrow           | string             | yes      | no      | 1    | keep           |
| title             | string             | yes      | yes     | 1    | keep           |
| subtitle          | portableTextSimple | yes      | yes     | 1    | keep           |
| items             | array              | yes      | yes     | 1    | keep           |
| items[].title     | string             | yes      | yes     | 9    | keep           |
| items[].body      | portableTextSimple | yes      | yes     | 9    | keep           |
| items[].image     | image              | yes      | yes     | 9    | keep           |
| items[].imageSide | string             | yes      | no      | 9    | keep           |

## logosSection (logos) · 2 in data

Renderer: `src/components/platform/sections/roofing-logo-cloud-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/logo-cloud.jsx`, `src/components/portable-text-content.jsx`

| Field         | Type               | Renderer | Helpers | Data | Verdict        |
| ------------- | ------------------ | -------- | ------- | ---- | -------------- |
| type          | string             | no       | yes     | 2    | shared wrapper |
| internalLabel | string             | no       | no      | 1    | **data only**  |
| title         | string             | yes      | yes     | 2    | keep           |
| body          | portableTextSimple | yes      | yes     | 1    | keep           |
| items         | array              | yes      | yes     | 2    | keep           |
| items[].title | string             | yes      | yes     | 13   | keep           |
| items[].href  | string             | yes      | yes     | 3    | keep           |
| items[].image | heroImage          | yes      | yes     | 6    | keep           |

## pageSection (page) · 0 in data

**No renderer registered.**

| Field | Type | Renderer | Helpers | Data | Verdict |
| ----- | ---- | -------- | ------- | ---- | ------- |

## pricingSection (pricing) · 1 in data

Renderer: `src/components/platform/sections/pricing-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field              | Type               | Renderer | Helpers | Data | Verdict            |
| ------------------ | ------------------ | -------- | ------- | ---- | ------------------ |
| type               | string             | no       | yes     | 1    | shared wrapper     |
| eyebrow            | string             | yes      | no      | 1    | keep               |
| title              | string             | yes      | yes     | 1    | keep               |
| body               | portableTextSimple | yes      | yes     | 1    | keep               |
| notes              | array              | yes      | no      | 1    | keep               |
| notes[].title      | string             | yes      | yes     | 0    | keep (no data yet) |
| notes[].paymentDue | string             | yes      | no      | 0    | keep (no data yet) |
| notes[].amount     | string             | yes      | no      | 0    | keep (no data yet) |
| notes[].body       | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| notes[].variant    | string             | yes      | yes     | 0    | keep (no data yet) |

## quoteSection (quote) · 3 in data

Renderer: `src/components/platform/sections/quote-banner-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/quote-section.jsx`

| Field   | Type               | Renderer | Helpers | Data | Verdict        |
| ------- | ------------------ | -------- | ------- | ---- | -------------- |
| type    | string             | no       | yes     | 3    | shared wrapper |
| eyebrow | string             | yes      | no      | 3    | keep           |
| body    | portableTextSimple | yes      | yes     | 3    | keep           |
| title   | string             | yes      | yes     | 3    | keep           |

## resourceGridSection (resourceGrid) · 2 in data

Renderer: `src/components/resources-section.jsx`, `src/lib/platform/imageSource.js`, `src/components/card.jsx`, `src/components/cloud-section-background.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field         | Type               | Renderer | Helpers | Data | Verdict        |
| ------------- | ------------------ | -------- | ------- | ---- | -------------- |
| type          | string             | yes      | yes     | 2    | shared wrapper |
| title         | string             | yes      | yes     | 2    | keep           |
| body          | portableTextSimple | yes      | yes     | 2    | keep           |
| items         | array              | yes      | yes     | 2    | keep           |
| items[].icon  | string             | yes      | yes     | 5    | keep           |
| items[].title | string             | yes      | yes     | 6    | keep           |
| items[].body  | portableTextSimple | yes      | yes     | 6    | keep           |
| items[].href  | string             | yes      | yes     | 6    | keep           |
| items[].image | heroImage          | yes      | yes     | 3    | keep           |

## scrollTextSection (scrollText) · 1 in data

Renderer: `src/components/platform/sections/scroll-text-section.jsx`, `src/components/scroll-text.jsx`

| Field         | Type    | Renderer | Helpers | Data | Verdict            |
| ------------- | ------- | -------- | ------- | ---- | ------------------ |
| type          | string  | no       | yes     | 1    | shared wrapper     |
| text          | array   | yes      | yes     | 1    | keep               |
| fontSize      | number  | yes      | yes     | 1    | keep               |
| textColor     | color   | yes      | yes     | 0    | keep (no data yet) |
| showIcon      | boolean | yes      | yes     | 1    | keep               |
| showFlag      | boolean | yes      | yes     | 1    | keep               |
| icon          | string  | yes      | yes     | 1    | keep               |
| velocity      | number  | yes      | yes     | 1    | keep               |
| direction     | string  | yes      | yes     | 1    | keep               |
| startPosition | number  | yes      | yes     | 1    | keep               |
| damping       | number  | yes      | yes     | 1    | keep               |
| stiffness     | number  | yes      | yes     | 1    | keep               |
| numCopies     | number  | yes      | yes     | 1    | keep               |

## secondaryCTASection (secondaryCTA) · 0 in data

Renderer: `src/components/platform/sections/secondary-cta-section.jsx`, `src/components/portable-text-content.jsx`

| Field    | Type               | Renderer | Helpers | Data | Verdict            |
| -------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type     | string             | no       | yes     | 0    | shared wrapper     |
| title    | string             | yes      | yes     | 0    | keep (no data yet) |
| body     | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| ctaLabel | string             | yes      | yes     | 0    | keep (no data yet) |
| ctaHref  | string             | yes      | yes     | 0    | keep (no data yet) |
| color    | color              | yes      | yes     | 0    | keep (no data yet) |

## serviceAreaMapSection (serviceAreaMap) · 2 in data

Renderer: `src/components/platform/sections/service-area-map-section.jsx`, `src/components/map-box.tsx`

| Field               | Type   | Renderer | Helpers | Data | Verdict            |
| ------------------- | ------ | -------- | ------- | ---- | ------------------ |
| type                | string | yes      | yes     | 2    | shared wrapper     |
| eyebrow             | string | yes      | no      | 2    | keep               |
| title               | string | yes      | yes     | 2    | keep               |
| description         | text   | yes      | yes     | 1    | keep               |
| accentColor         | color  | yes      | yes     | 1    | keep               |
| backgroundColor     | color  | yes      | yes     | 1    | keep               |
| areas               | array  | yes      | yes     | 2    | keep               |
| areas[].countyKey   | string | yes      | yes     | 0    | keep (no data yet) |
| areas[].displayName | string | yes      | yes     | 0    | keep (no data yet) |

## serviceGridSection (serviceGrid) · 5 in data

Renderer: `src/components/platform/sections/service-grid-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/components/ui/badge.jsx`, `src/components/ui/card.jsx`, `src/lib/platform/imageSource.js`

| Field                 | Type               | Renderer | Helpers | Data | Verdict            |
| --------------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type                  | string             | yes      | yes     | 5    | shared wrapper     |
| eyebrow               | string             | yes      | no      | 3    | keep               |
| title                 | string             | yes      | yes     | 5    | keep               |
| subtitle              | portableTextSimple | yes      | yes     | 2    | keep               |
| body                  | portableTextSimple | yes      | yes     | 4    | keep               |
| items                 | array              | yes      | yes     | 5    | keep               |
| roofingTitle          | string             | yes      | yes     | 1    | keep               |
| roofingItems          | array              | yes      | yes     | 1    | keep               |
| secondaryTitle        | string             | yes      | yes     | 1    | keep               |
| secondaryItems        | array              | yes      | yes     | 0    | keep (no data yet) |
| items[].isRecommended | boolean            | yes      | no      | 1    | keep               |
| items[].title         | string             | yes      | yes     | 18   | keep               |
| items[].eyebrow       | string             | yes      | no      | 7    | keep               |
| items[].number        | string             | yes      | no      | 0    | keep (no data yet) |
| items[].price         | number             | yes      | no      | 3    | keep               |
| items[].body          | portableTextSimple | yes      | yes     | 18   | keep               |
| items[].icon          | string             | yes      | yes     | 15   | keep               |
| items[].href          | string             | yes      | yes     | 15   | keep               |
| items[].imageUrl      | string             | yes      | yes     | 3    | keep               |
| items[].cardColor     | color              | yes      | yes     | 3    | keep               |

## snapshotSection (snapshot) · 2 in data

Renderer: `src/components/snapshot-section.jsx`, `src/lib/platform/card-tones.js`, `src/lib/platform/imageSource.js`, `src/components/card.jsx`, `src/components/cloud-section-background.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`

| Field              | Type               | Renderer | Helpers | Data | Verdict            |
| ------------------ | ------------------ | -------- | ------- | ---- | ------------------ |
| type               | string             | yes      | yes     | 2    | shared wrapper     |
| eyebrow            | string             | yes      | no      | 2    | keep               |
| title              | string             | yes      | yes     | 2    | keep               |
| body               | portableTextSimple | yes      | yes     | 2    | keep               |
| items              | array              | yes      | yes     | 2    | keep               |
| items[].number     | string             | yes      | no      | 4    | keep               |
| items[].title      | string             | yes      | yes     | 4    | keep               |
| items[].body       | portableTextSimple | yes      | yes     | 8    | keep               |
| items[].icon       | string             | yes      | yes     | 6    | keep               |
| items[].color      | string             | yes      | yes     | 0    | keep (no data yet) |
| items[].image      | heroImage          | yes      | yes     | 0    | keep (no data yet) |
| items[].imageUrl   | string             | yes      | yes     | 0    | keep (no data yet) |
| items[].video      | heroVideo          | yes      | no      | 4    | keep               |
| items[].videoAsset | uploadedVideo      | yes      | no      | 0    | keep (no data yet) |

## solarAdoptionSection (solarAdoption) · 1 in data

Renderer: `src/components/solar-adoption-section.jsx`, `src/components/adoption-reason-cards.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/lib/platform/imageSource.js`

| Field           | Type               | Renderer | Helpers | Data | Verdict            |
| --------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type            | string             | yes      | yes     | 1    | shared wrapper     |
| eyebrow         | string             | yes      | no      | 0    | keep (no data yet) |
| title           | string             | yes      | yes     | 1    | keep               |
| body            | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| roofImage       | heroImage          | yes      | no      | 0    | keep (no data yet) |
| panelImage      | heroImage          | yes      | no      | 0    | keep (no data yet) |
| reasons         | array              | yes      | no      | 0    | keep (no data yet) |
| reasons[].title | string             | yes      | yes     | 0    | keep (no data yet) |
| reasons[].icon  | string             | yes      | yes     | 0    | keep (no data yet) |
| reasons[].body  | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |

## solarBenefitsSection (solarBenefits) · 1 in data

Renderer: `src/components/solar-benefits-section.jsx`, `src/components/dev/dev-trace.jsx`

| Field           | Type               | Renderer | Helpers | Data | Verdict                   |
| --------------- | ------------------ | -------- | ------- | ---- | ------------------------- |
| type            | string             | no       | yes     | 1    | shared wrapper            |
| title           | string             | yes      | yes     | 0    | keep (no data yet)        |
| body            | portableTextSimple | yes      | yes     | 0    | keep (no data yet)        |
| items           | array              | yes      | yes     | 1    | keep                      |
| items[].eyebrow | string             | no       | no      | 0    | **unused**                |
| items[].title   | string             | yes      | yes     | 2    | keep                      |
| items[].body    | portableTextSimple | yes      | yes     | 2    | keep                      |
| items[].icon    | string             | yes      | yes     | 2    | keep                      |
| items[].href    | string             | no       | yes     | 0    | **helpers only, no data** |

## solarDifferenceSection (solarDifference) · 2 in data

Renderer: `src/components/solar-difference-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/lib/platform/imageSource.js`

| Field           | Type               | Renderer | Helpers | Data | Verdict        |
| --------------- | ------------------ | -------- | ------- | ---- | -------------- |
| type            | string             | yes      | yes     | 2    | shared wrapper |
| title           | string             | yes      | yes     | 2    | keep           |
| body            | portableTextSimple | yes      | yes     | 1    | keep           |
| items           | array              | yes      | yes     | 2    | keep           |
| items[].number  | string             | yes      | no      | 6    | keep           |
| items[].eyebrow | string             | yes      | no      | 6    | keep           |
| items[].title   | string             | yes      | yes     | 6    | keep           |
| items[].body    | portableTextSimple | yes      | yes     | 6    | keep           |
| items[].color   | color              | yes      | yes     | 5    | keep           |
| items[].image   | heroImage          | yes      | yes     | 1    | keep           |

## solarSwitchSection (solarSwitch) · 1 in data

Renderer: `src/components/platform/sections/solar-switch-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/solar-switch.jsx`

| Field        | Type   | Renderer | Helpers | Data | Verdict        |
| ------------ | ------ | -------- | ------- | ---- | -------------- |
| type         | string | no       | yes     | 1    | shared wrapper |
| leadingWords | array  | yes      | yes     | 1    | keep           |
| accentWord   | string | yes      | yes     | 1    | keep           |
| trailingText | string | yes      | yes     | 1    | keep           |

## stepsSection (steps) · 18 in data

Renderer: `src/components/platform/sections/steps-section.jsx`, `src/components/dev/dev-trace.jsx`, `src/components/portable-text-content.jsx`, `src/components/ui/badge.jsx`, `src/components/ui/card.jsx`

| Field           | Type               | Renderer | Helpers | Data | Verdict                   |
| --------------- | ------------------ | -------- | ------- | ---- | ------------------------- |
| type            | string             | no       | yes     | 18   | shared wrapper            |
| title           | string             | yes      | yes     | 18   | keep                      |
| items           | array              | yes      | yes     | 18   | keep                      |
| items[].eyebrow | string             | no       | no      | 0    | **unused**                |
| items[].title   | string             | yes      | yes     | 55   | keep                      |
| items[].body    | portableTextSimple | yes      | yes     | 55   | keep                      |
| items[].icon    | string             | no       | yes     | 0    | **helpers only, no data** |
| items[].href    | string             | yes      | yes     | 0    | keep (no data yet)        |

## storySection (story) · 24 in data

Renderer: `src/components/platform/sections/story-section.jsx`, `src/components/story-section.jsx`

| Field    | Type               | Renderer | Helpers | Data | Verdict        |
| -------- | ------------------ | -------- | ------- | ---- | -------------- |
| type     | string             | no       | yes     | 24   | shared wrapper |
| eyebrow  | string             | yes      | no      | 23   | keep           |
| title    | string             | yes      | yes     | 23   | keep           |
| body     | portableTextSimple | yes      | yes     | 24   | keep           |
| subtitle | portableTextSimple | yes      | yes     | 9    | keep           |

## testimonialsSection (testimonials) · 2 in data

Renderer: `src/components/testimonials.jsx`, `src/lib/platform/imageSource.js`, `src/components/dev/dev-trace.jsx`

| Field           | Type               | Renderer | Helpers | Data | Verdict            |
| --------------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type            | string             | yes      | yes     | 2    | shared wrapper     |
| title           | string             | no       | yes     | 2    | helpers only       |
| body            | portableTextSimple | no       | yes     | 1    | helpers only       |
| backgroundImage | heroImage          | yes      | no      | 0    | keep (no data yet) |
| reviews         | array              | no       | yes     | 1    | helpers only       |

## videoSection (video) · 1 in data

Renderer: `src/components/platform/sections/video-section.jsx`, `src/components/video-section.jsx`

| Field       | Type               | Renderer | Helpers | Data | Verdict            |
| ----------- | ------------------ | -------- | ------- | ---- | ------------------ |
| type        | string             | no       | yes     | 1    | shared wrapper     |
| eyebrow     | string             | yes      | no      | 1    | keep               |
| title       | string             | yes      | yes     | 1    | keep               |
| body        | portableTextSimple | yes      | yes     | 0    | keep (no data yet) |
| videoUrl    | string             | yes      | no      | 1    | keep               |
| caption     | string             | yes      | no      | 0    | keep (no data yet) |
| autoplay    | boolean            | yes      | no      | 1    | keep               |
| loop        | boolean            | yes      | no      | 1    | keep               |
| muted       | boolean            | yes      | no      | 1    | keep               |
| aspectRatio | string             | yes      | no      | 1    | keep               |

## Totals

321 fields checked. 7 unused. 1 data only.
