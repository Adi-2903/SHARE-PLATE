import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// City center coordinates
const CITY_CENTERS = {
  ahmedabad: [23.0225, 72.5714],
  pune:      [18.5204, 73.8567],
  mumbai:    [19.0760, 72.8777],
  delhi:     [28.6139, 77.2090],
  bangalore: [12.9716, 77.5946],
}

// Ahmedabad demo locations for seeds when no donation has coords
const AHM_LOCATIONS = [
  { lat: 23.0395, lng: 72.5268, name: 'SG Highway / Iscon' },
  { lat: 23.0476, lng: 72.5298, name: 'Sindhu Bhavan Road' },
  { lat: 23.0273, lng: 72.5304, name: 'Vastrapur Lake' },
  { lat: 23.0225, lng: 72.5714, name: 'Navrangpura / CG Road' },
  { lat: 23.0656, lng: 72.5793, name: 'Motera Stadium' },
  { lat: 23.0168, lng: 72.6173, name: 'Manek Chowk' },
  { lat: 22.9925, lng: 72.6088, name: 'Maninagar' },
  { lat: 23.0306, lng: 72.5100, name: 'Bodakdev' },
  { lat: 23.0573, lng: 72.5714, name: 'Sabarmati Ashram' },
]

function getLevel(donation) {
  const hrs = (new Date(donation.expiryTime) - new Date()) / 3_600_000
  if (hrs < 0 || donation.priority === 'urgent') return 'urgent'
  if (hrs < 4) return 'urgent'
  if (hrs < 8) return 'moderate'
  return 'safe'
}

const LEVEL_COLOR = {
  urgent:   '#ef4444',
  moderate: '#f59e0b',
  safe:     '#22c55e',
}

// Build HTML pin marker
function buildIcon(level, L) {
  const color = LEVEL_COLOR[level] || '#22c55e'
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:18px; height:18px;
        background:${color};
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        cursor:pointer;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  })
}

export default function RescueMap({ donations = [], user, height = '580px' }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)

  // Determine city from donations or default to Ahmedabad
  const cityKey = (() => {
    const c = (donations[0]?.city || 'ahmedabad').toLowerCase().trim()
    return CITY_CENTERS[c] ? c : 'ahmedabad'
  })()

  const center = CITY_CENTERS[cityKey]

  // Give each donation a lat/lng if not present (seed from demo locations)
  const pinned = donations.map((d, i) => ({
    ...d,
    _lat: d.lat ?? AHM_LOCATIONS[i % AHM_LOCATIONS.length].lat + (Math.random() - 0.5) * 0.012,
    _lng: d.lng ?? AHM_LOCATIONS[i % AHM_LOCATIONS.length].lng + (Math.random() - 0.5) * 0.012,
    level: getLevel(d),
  }))

  // ── Init map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return

    import('leaflet').then((mod) => {
      const L = mod.default ?? mod

      // Fix default icon paths in Vite / Webpack environments
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current, {
        center,
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      // OpenStreetMap — free tiles, no API key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      instanceRef.current = map
      setMapReady(true)
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update markers whenever donations change ──────────────────────────────
  useEffect(() => {
    if (!mapReady || !instanceRef.current) return

    import('leaflet').then((mod) => {
      const L = mod.default ?? mod
      const map = instanceRef.current

      // Clear old markers
      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current = []

      pinned.forEach((d) => {
        const icon = buildIcon(d.level, L)
        const hrs = ((new Date(d.expiryTime) - new Date()) / 3_600_000).toFixed(1)
        const hoursLeft = hrs > 0 ? `${hrs}h left` : 'Expired'
        const levelLabel = d.level === 'urgent' ? '🔴 Urgent' : d.level === 'moderate' ? '🟡 Moderate' : '🟢 Safe'

        const popup = L.popup({ maxWidth: 240, className: 'sp-popup' }).setContent(`
          <div style="font-family:'Inter',sans-serif; font-size:13px; line-height:1.5;">
            <div style="font-weight:700; font-size:14px; color:#131b2e; margin-bottom:4px;">
              ${d.foodType || 'Food Donation'}
            </div>
            <div style="color:#64748b; margin-bottom:6px;">
              ${d.address || d.city || 'Ahmedabad'}
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
              <span style="background:${LEVEL_COLOR[d.level]}22; color:${LEVEL_COLOR[d.level]}; border-radius:99px; padding:2px 8px; font-weight:600; font-size:11px;">
                ${levelLabel}
              </span>
              <span style="background:#f1f5f9; color:#475569; border-radius:99px; padding:2px 8px; font-size:11px;">
                ⏱ ${hoursLeft}
              </span>
            </div>
            <div style="color:#64748b; font-size:12px;">
              Qty: <b>${d.quantity || '—'} ${d.unit || ''}</b>
              &nbsp;|&nbsp; Donor: <b>${d.donorName || d.donor?.firstName || 'Anonymous'}</b>
            </div>
          </div>
        `)

        const marker = L.marker([d._lat, d._lng], { icon }).bindPopup(popup).addTo(map)
        markersRef.current.push(marker)
      })

      // Auto-open first urgent popup if any
      const urgentIdx = pinned.findIndex(d => d.level === 'urgent')
      if (urgentIdx !== -1 && markersRef.current[urgentIdx]) {
        markersRef.current[urgentIdx].openPopup()
      }
    })
  }, [mapReady, donations]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {/* Legend */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontFamily: "'Inter',sans-serif", fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#131b2e' }}>Food Rescue Pins</div>
        {[['urgent','🔴','Urgent (<4h)'],['moderate','🟡','Moderate (4–8h)'],['safe','🟢','Safe (>8h)']].map(([k,e,l]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, color:'#475569' }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background: LEVEL_COLOR[k], display:'inline-block', flexShrink:0 }} />
            {l}
          </div>
        ))}
        <div style={{ marginTop:6, paddingTop:6, borderTop:'1px solid #e2e8f0', color:'#94a3b8', fontSize:11 }}>
          {pinned.length} active donation{pinned.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* OSM Attribution style fix */}
      <style>{`.leaflet-container { font-family: 'Inter', sans-serif; } .sp-popup .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); } .sp-popup .leaflet-popup-tip { background: white; }`}</style>
    </div>
  )
}
