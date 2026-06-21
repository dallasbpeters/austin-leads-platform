'use client'

import { useEffect } from 'react'

// Two SVG favicon variants: bulbs "on" and bulbs dimmed.
// Built from the same ornament geometry as tx-christmas-logo-alt.svg.
// Encoding is done at runtime to avoid base64 bloat in the bundle.
const SVG_BULBS: [on: string, dim: string][] = [
  ['rgb(6,102,53)', 'rgb(3,50,25)'], // green
  ['rgb(85,127,248)', 'rgb(40,65,130)'], // blue
  ['rgb(222,76,17)', 'rgb(110,38,8)'], // orange
  ['rgb(85,127,248)', 'rgb(40,65,130)'], // blue
  ['rgb(222,76,17)', 'rgb(110,38,8)'], // orange
]

// Shared SVG structure from tx-christmas-logo-alt.svg, parameterised by bulb fills.
function buildSvg(fills: string[]): string {
  const [c1, c2, c3, c4, c5] = fills
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 711 705">
  <g transform="translate(-4205.8,-611.994)">
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(2.234308,0.735628,-0.858398,2.607195,-5196.796,-4890.079)">
        <path d="M4820,805L4820,862.475C4789.017,882.392 4764.117,880.864 4744,862.475L4744,805Z"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(5.015499,1.644686,-1.926145,5.873811,80.224,-5009.215)">
        <path d="M1189.478,549.353C1202.985,549.353 1230,582.126 1230,623.792C1230,643.673 1211.843,659.814 1189.478,659.814C1167.113,659.814 1148.956,643.673 1148.956,623.792C1148.956,582.126 1175.971,549.353 1189.478,549.353Z" fill="${c1}"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(-0.090965,2.350533,-2.742817,-0.106147,7947.797,-10550.229)">
        <path d="M4820,805L4820,862.475C4789.017,882.392 4764.117,880.864 4744,862.475L4744,805Z"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(-0.197827,5.27457,-6.177217,-0.231681,9517.52,-5510.674)">
        <path d="M1189.478,549.353C1202.985,549.353 1230,582.126 1230,623.792C1230,643.673 1211.843,659.814 1189.478,659.814C1167.113,659.814 1148.956,643.673 1148.956,623.792C1148.956,582.126 1175.971,549.353 1189.478,549.353Z" fill="${c2}"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(-2.184038,0.873645,-1.019449,-2.548536,16831.33,-1071.15)">
        <path d="M4820,805L4820,862.475C4789.017,882.392 4764.117,880.864 4744,862.475L4744,805Z"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(-4.898394,1.966204,-2.302684,-5.736666,12867.046,2413.903)">
        <path d="M1189.478,549.353C1202.985,549.353 1230,582.126 1230,623.792C1230,643.673 1211.843,659.814 1189.478,659.814C1167.113,659.814 1148.956,643.673 1148.956,623.792C1148.956,582.126 1175.971,549.353 1189.478,549.353Z" fill="${c3}"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(-1.663057,-1.663587,1.941226,-1.940607,11630.377,10919.053)">
        <path d="M4820,805L4820,862.475C4789.017,882.392 4764.117,880.864 4744,862.475L4744,805Z"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(-3.73616,-3.728449,4.366506,-4.375536,6865.89,8647.314)">
        <path d="M1189.478,549.353C1202.985,549.353 1230,582.126 1230,623.792C1230,643.673 1211.843,659.814 1189.478,659.814C1167.113,659.814 1148.956,643.673 1148.956,623.792C1148.956,582.126 1175.971,549.353 1189.478,549.353Z" fill="${c4}"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(1.036479,-2.111632,2.464046,1.209458,-2196.958,10322.757)">
        <path d="M4820,805L4820,862.475C4789.017,882.392 4764.117,880.864 4744,862.475L4744,805Z"/>
      </g>
    </g>
    <g transform="matrix(0.425117,0,0,0.425117,2413.019,539)">
      <g transform="matrix(2.320089,-4.741034,5.552377,2.717131,-1587.831,5079.657)">
        <path d="M1189.478,549.353C1202.985,549.353 1230,582.126 1230,623.792C1230,643.673 1211.843,659.814 1189.478,659.814C1167.113,659.814 1148.956,643.673 1148.956,623.792C1148.956,582.126 1175.971,549.353 1189.478,549.353Z" fill="${c5}"/>
      </g>
    </g>
  </g>
</svg>`
}

function toDataUri(svg: string): string {
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

export function ChristmasFaviconBlinker() {
  useEffect(() => {
    // Build data URIs lazily inside the effect — keeps large strings out of
    // webpack's module-level cache to avoid the "big strings" serialization warning.
    const frameOn = toDataUri(buildSvg(SVG_BULBS.map(([on]) => on)))
    const frameDim = toDataUri(buildSvg(SVG_BULBS.map(([, dim]) => dim)))

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/svg+xml'
      document.head.appendChild(link)
    }

    let lit = true
    link.href = frameOn

    const id = setInterval(() => {
      lit = !lit
      link!.href = lit ? frameOn : frameDim
    }, 800)

    return () => {
      clearInterval(id)
      link!.href = '/favicon-txchristmaslights.svg'
    }
  }, [])

  return null
}
