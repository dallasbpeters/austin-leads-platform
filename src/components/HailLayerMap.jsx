'use client'

import 'leaflet/dist/leaflet.css'

import { CircleMarker, LayerGroup, MapContainer, Popup, TileLayer } from 'react-leaflet'

function hailRadius(point) {
  const magnitude = Number(point?.magnitude)

  if (!Number.isFinite(magnitude)) {
    return point?.type === 'storm-report' ? 6 : 8
  }

  return Math.max(6, Math.min(16, magnitude * 5))
}

function hailColor(point) {
  if (point?.type === 'storm-report') {
    return '#67e8f9'
  }

  const magnitude = Number(point?.magnitude)

  if (Number.isFinite(magnitude) && magnitude >= 1.75) {
    return '#f97316'
  }

  return '#f59e0b'
}

export default function HailLayerMap({ center, hailLayer }) {
  const hailSignatures = hailLayer?.hailSignatures || []
  const stormReports = hailLayer?.stormReports || []

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      className="h-full min-h-[22rem] w-full"
      scrollWheelZoom={false}
      zoom={10}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LayerGroup>
        {hailSignatures.map((point) => (
          <CircleMarker
            center={[point.latitude, point.longitude]}
            color={hailColor(point)}
            fillColor={hailColor(point)}
            fillOpacity={0.42}
            key={point.id}
            radius={hailRadius(point)}
            stroke
            weight={1.5}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Radar hail signature</div>
                <div>{point.date || 'Recent event'}</div>
                {point.magnitude ? <div>Max size: {point.magnitude} in</div> : null}
                {point.probability ? <div>Probability: {point.probability}%</div> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {stormReports.map((point) => (
          <CircleMarker
            center={[point.latitude, point.longitude]}
            color={hailColor(point)}
            fillColor={hailColor(point)}
            fillOpacity={0.7}
            key={point.id}
            radius={hailRadius(point)}
            stroke
            weight={1.5}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Storm report</div>
                <div>{point.date || 'Recent report'}</div>
                {point.city ? <div>{point.city}</div> : null}
                {point.magnitude ? <div>Reported hail: {point.magnitude} in</div> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </LayerGroup>
    </MapContainer>
  )
}
