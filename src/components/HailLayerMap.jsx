'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect } from 'react'
import { CircleMarker, LayerGroup, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'

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

function formatPointDate(value) {
  if (!value) {
    return 'Recent event'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function FitMapToPoints({ center, points }) {
  const map = useMap()

  useEffect(() => {
    const coordinates = [
      [center.latitude, center.longitude],
      ...points.map((point) => [point.latitude, point.longitude]),
    ].filter(([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude))

    if (coordinates.length > 1) {
      map.fitBounds(coordinates, {
        padding: [36, 36],
        maxZoom: 11,
      })
    } else {
      map.setView([center.latitude, center.longitude], 10)
    }
  }, [center.latitude, center.longitude, map, points])

  return null
}

export default function HailLayerMap({ center, hailLayer }) {
  const hailSignatures = hailLayer?.hailSignatures || []
  const stormReports = hailLayer?.stormReports || []
  const allPoints = [...hailSignatures, ...stormReports]

  return (
    <MapContainer center={[center.latitude, center.longitude]} className="h-full min-h-[24rem] w-full" zoom={10}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitMapToPoints center={center} points={allPoints} />

      <LayerGroup>
        <CircleMarker
          center={[center.latitude, center.longitude]}
          color="#102230"
          fillColor="#f97316"
          fillOpacity={0.95}
          radius={10}
          stroke
          weight={3}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <div className="font-semibold">Property search area</div>
              <div>{center.name || 'Selected location'}</div>
            </div>
          </Popup>
        </CircleMarker>

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
                <div>{formatPointDate(point.date)}</div>
                {point.magnitude ? <div>Max size: {point.magnitude} in</div> : null}
                {point.probability ? <div>Probability: {point.probability}%</div> : null}
                {point.severeProbability ? <div>Severe probability: {point.severeProbability}%</div> : null}
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
                <div>{formatPointDate(point.date)}</div>
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
