import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Default coordinates dictionary for cities & locations
const CITY_COORDS = {
  pune: [18.5204, 73.8567],
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  bangalore: [12.9716, 77.5946],
  pilani: [28.3639, 75.6010],
}

// Offset generator to place pins naturally around cities
function getCoords(d, index) {
  const cityKey = (d.city || 'pune').toLowerCase().trim()
  const base = CITY_COORDS[cityKey] || CITY_COORDS.pune
  
  // Specific offset based on pincode / address hint if available
  const addr = (d.address || '').toLowerCase()
  let latOffset = (index % 5 - 2) * 0.015
  let lngOffset = (Math.floor(index / 2) % 5 - 2) * 0.015

  if (addr.includes('camp')) { latOffset = 0.01; lngOffset = 0.02 }
  else if (addr.includes('andheri')) { latOffset = 0.08; lngOffset = -0.04 }
  else if (addr.includes('colaba')) { latOffset = -0.12; lngOffset = -0.05 }
  else if (addr.includes('hinjewadi')) { latOffset = 0.07; lngOffset = -0.09 }
  else if (addr.includes('kothrud')) { latOffset = -0.02; lngOffset = -0.06 }
  else if (addr.includes('baner')) { latOffset = 0.04; lngOffset = -0.07 }
  else if (addr.includes('viman')) { latOffset = 0.05; lngOffset = 0.06 }

  return [base[0] + latOffset, base[1] + lngOffset]
}

export default function RescueMap({ donations = [], onClaim, user, height = '500px', center = [18.5204, 73.8567], zoom = 11 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersGroupRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Leaflet Map once
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
        zoomControl: true,
      })

      // Clean CartoDB Voyager tiles (100% free, fast, beautiful light theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      markersGroupRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when donations prop changes
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return

    const group = markersGroupRef.current
    group.clearLayers()

    const bounds = []

    donations.forEach((d, idx) => {
      const [lat, lng] = getCoords(d, idx)
      bounds.push([lat, lng])

      // Compute urgency tier
      const diffHrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
      const priority = diffHrs < 4 ? 'urgent' : diffHrs < 8 ? 'moderate' : 'safe'

      const color = priority === 'urgent' ? '#ef4444' : priority === 'moderate' ? '#f59e0b' : '#10b981'
      const pulseClass = priority === 'urgent' ? 'animate-pulse' : ''

      // Custom SVG Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; display: flex; items-center; justify-content: center;">
            <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border: 2.5px solid white;" class="${pulseClass}">
              <span class="material-symbols-outlined" style="font-size: 20px;">restaurant</span>
            </div>
            ${priority === 'urgent' ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #ef4444; opacity: 0.6;" class="animate-ping"></div>` : ''}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      })

      const marker = L.marker([lat, lng], { icon: customIcon })

      // Expiry calculation string
      const hrsLeft = Math.max(0, Math.floor(diffHrs))
      const timeTag = diffHrs > 24 
        ? `${Math.floor(diffHrs / 24)}d ${hrsLeft % 24}h left` 
        : `${hrsLeft}h left`

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="background: ${color}15; color: ${color}; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 99px; text-transform: uppercase;">
              ${priority}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #64748b;">⏱ ${timeTag}</span>
          </div>
          <h4 style="font-weight: 800; font-size: 14px; color: #0f172a; margin: 0 0 4px 0;">${d.foodName}</h4>
          <p style="font-size: 12px; font-weight: 700; color: #006948; margin: 0 0 8px 0;">🥗 ${d.quantity} servings (${d.foodType || 'Vegetarian'})</p>
          
          <div style="font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-bottom: 8px;">
            <div>🏬 <b>${d.donorName}</b></div>
            <div>📍 ${d.address || d.city}</div>
          </div>

          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.address || ''} ${d.city || ''}`)}" target="_blank" rel="noopener noreferrer" 
            style="display: block; width: 100%; text-align: center; background: #006948; color: white; font-weight: 700; font-size: 12px; padding: 6px 0; border-radius: 99px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,105,72,0.25);">
            🗺️ Navigate Route
          </a>
        </div>
      `

      marker.bindPopup(popupHtml)
      group.addLayer(marker)
    })

    // Auto-fit bounds if markers exist
    if (bounds.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
    }
  }, [donations])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-[#e2e8f0]" style={{ height }}>
      <div ref={containerRef} className="w-full h-full z-10" />
      {donations.length === 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
          <p className="text-sm font-semibold text-[#64748b]">No rescue pins to display on map.</p>
        </div>
      )}
    </div>
  )
}
