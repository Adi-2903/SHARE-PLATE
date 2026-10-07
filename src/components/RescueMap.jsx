import { useState, useMemo } from 'react'

// City definitions with regional landmark sectors for demo simulation
const CITY_PROFILES = {
  ahmedabad: {
    name: 'Ahmedabad Heritage & Tech Hub',
    lat: 23.0225,
    lng: 72.5714,
    sectors: [
      { name: 'SG Highway Banquets', x: -32, y: -10, type: 'TGB & Iscon Corridor' },
      { name: 'Sindhu Bhavan SBR', x: -38, y: 14, type: 'Luxury Cafes & Dining' },
      { name: 'Vastrapur Lake / IIM', x: -18, y: -6, type: 'Student & Youth Hub' },
      { name: 'Navrangpura / CG Road', x: -6, y: -20, type: 'Commerce Six Roads' },
      { name: 'Sabarmati Riverfront', x: 0, y: 0, type: 'Central HQ Corridor' },
      { name: 'Manek Chowk Heritage', x: 18, y: 10, type: 'Night Food Market' },
      { name: 'Maninagar / Kankaria', x: 22, y: 32, type: 'Lake Community Caterers' },
      { name: 'Bodakdev / Prahlad Nagar', x: -26, y: 24, type: 'Corporate Dining' },
      { name: 'Motera Stadium Road', x: 8, y: -38, type: 'Stadium Corridor' },
    ],
  },
  pune: {
    name: 'Pune Central Hub',
    lat: 18.5204,
    lng: 73.8567,
    sectors: [
      { name: 'Hinjewadi Tech Park', x: -35, y: -25, type: 'IT Hub' },
      { name: 'Kothrud West', x: -28, y: 15, type: 'Residential' },
      { name: 'Shivajinagar Central', x: 0, y: 0, type: 'HQ Hub' },
      { name: 'Camp Cantonment', x: 18, y: 12, type: 'Commercial' },
      { name: 'Viman Nagar', x: 34, y: -18, type: 'Commercial / Hotels' },
      { name: 'Baner Expressway', x: -22, y: -32, type: 'Restaurant Corridor' },
      { name: 'Hadapsar Magarpatta', x: 38, y: 16, type: 'Industrial / Dining' },
    ],
  },
  mumbai: {
    name: 'Mumbai Coastal Hub',
    lat: 19.0760,
    lng: 72.8777,
    sectors: [
      { name: 'Colaba & Fort', x: -10, y: 38, type: 'South Mumbai' },
      { name: 'Dadar Central', x: -5, y: 15, type: 'Transit Hub' },
      { name: 'BKC Business District', x: 8, y: 0, type: 'Corporate HQ' },
      { name: 'Andheri West', x: -12, y: -22, type: 'Restaurant Cluster' },
      { name: 'Powai Valley', x: 20, y: -18, type: 'Residential / Cafeterias' },
      { name: 'Bandra West', x: -18, y: -5, type: 'Café District' },
    ],
  },
  delhi: {
    name: 'Delhi NCR Hub',
    lat: 28.6139,
    lng: 77.2090,
    sectors: [
      { name: 'Connaught Place', x: 0, y: 0, type: 'Central Ring' },
      { name: 'Hauz Khas', x: -10, y: 22, type: 'Dining Hub' },
      { name: 'Cyber Hub Gurgaon', x: -35, y: 35, type: 'Corporate Cafes' },
      { name: 'Noida Sector 18', x: 32, y: 18, type: 'Commercial Sector' },
      { name: 'Karol Bagh', x: -15, y: -12, type: 'Banquets' },
    ],
  },
  bangalore: {
    name: 'Bengaluru Silicon Hub',
    lat: 12.9716,
    lng: 77.5946,
    sectors: [
      { name: 'Indiranagar 100ft', x: 18, y: -5, type: 'Food Boulevard' },
      { name: 'Koramangala 4th Block', x: 12, y: 18, type: 'Hostels & Eateries' },
      { name: 'MG Road Central', x: 0, y: 0, type: 'Central HQ' },
      { name: 'Whitefield IT Corridor', x: 38, y: -10, type: 'Corporate Cafes' },
      { name: 'HSR Layout', x: 15, y: 30, type: 'Residential & Cloud Kitchens' },
    ],
  },
  pilani: {
    name: 'Pilani Campus Hub',
    lat: 28.3639,
    lng: 75.6010,
    sectors: [
      { name: 'BITS Campus Dining Hall', x: 0, y: 0, type: 'Mess 1 & 2' },
      { name: 'Student Activity Centre', x: -15, y: 10, type: 'Cafeteria' },
      { name: 'Main Gate Market', x: 18, y: -15, type: 'Community Centre' },
      { name: 'Shiv Ganga Enclave', x: 22, y: 20, type: 'Outreach Unit' },
    ],
  },
}

// Generate realistic radial coordinates on our 100x100 radar plane
function projectToRadar(donation, index) {
  const cityKey = (donation.city || 'pune').toLowerCase().trim()
  const profile = CITY_PROFILES[cityKey] || CITY_PROFILES.pune

  // Match sector if address mentions it
  const addr = (donation.address || '').toLowerCase()
  const matchedSector = profile.sectors.find(s => addr.includes(s.name.toLowerCase().split(' ')[0]))

  let x = 0
  let y = 0

  if (matchedSector) {
    const jitterX = ((index % 3) - 1) * 4
    const jitterY = (((index * 7) % 3) - 1) * 4
    x = matchedSector.x + jitterX
    y = matchedSector.y + jitterY
  } else {
    // Deterministic pseudo-random distribution around center
    const angle = ((index * 137.5 + 45) % 360) * (Math.PI / 180)
    const distance = 14 + ((index * 17) % 26) // between 14% and 40% radius
    x = Math.cos(angle) * distance
    y = Math.sin(angle) * distance
  }

  // Calculate distance in km from central dispatch
  const distanceKm = (Math.sqrt(x * x + y * y) * 0.28).toFixed(1)
  const estMins = Math.max(6, Math.round(distanceKm * 3.2))

  return { x, y, distanceKm, estMins, cityKey }
}

export default function RescueMap({
  donations = [],
  onClaim,
  user,
  height = '580px',
}) {
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedPin, setSelectedPin] = useState(null)
  const [radarSweep, setRadarSweep] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showRoute, setShowRoute] = useState(true)

  // Compute urgency level
  const getLevel = (d) => {
    const hrs = (new Date(d.expiryTime) - new Date()) / 3_600_000
    if (hrs < 0) return 'urgent'
    if (d.priority === 'urgent' || hrs < 4) return 'urgent'
    if (hrs < 8) return 'moderate'
    return 'safe'
  }

  // Filter donations by city and urgency
  const visibleDonations = useMemo(() => {
    return donations.filter(d => {
      const matchCity = selectedCity === 'all' || (d.city || 'pune').toLowerCase().includes(selectedCity)
      const level = getLevel(d)
      const matchFilter = activeFilter === 'all' || level === activeFilter
      return matchCity && matchFilter
    })
  }, [donations, selectedCity, activeFilter])

  // Projected nodes
  const nodes = useMemo(() => {
    return visibleDonations.map((d, idx) => ({
      ...d,
      level: getLevel(d),
      proj: projectToRadar(d, idx),
    }))
  }, [visibleDonations])

  // Currently active selected node
  const activeNode = selectedPin ? nodes.find(n => n._id === selectedPin._id) || selectedPin : null

  // Active city profile
  const currentProfile = CITY_PROFILES[selectedCity] || CITY_PROFILES.pune

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#bccac0]/40 shadow-xl flex flex-col"
      style={{
        height,
        background: 'radial-gradient(ellipse at 50% 50%, #0d1e18 0%, #06110d 100%)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}>
      
      {/* ── TOP GIS HUD BAR ── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0a1612]/90 backdrop-blur-md border-b border-emerald-900/40 text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              GIS Food Rescue Radar
            </span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            ⚡ 100% Zero-API Demo Engine
          </span>
        </div>

        {/* City Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {[
            { id: 'all', label: 'All Cities' },
            { id: 'ahmedabad', label: 'Ahmedabad' },
            { id: 'pune', label: 'Pune' },
            { id: 'mumbai', label: 'Mumbai' },
            { id: 'delhi', label: 'Delhi' },
            { id: 'bangalore', label: 'Bengaluru' },
            { id: 'pilani', label: 'Pilani' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedCity(c.id); setSelectedPin(null) }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCity === c.id
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-950/60 text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Radar Sweep Toggle */}
          <button
            onClick={() => setRadarSweep(!radarSweep)}
            title="Toggle Radar Sweep Animation"
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              radarSweep
                ? 'bg-emerald-900/50 border-emerald-600/60 text-emerald-300'
                : 'bg-gray-800/50 border-gray-700 text-gray-400'
            }`}>
            <span className="material-symbols-outlined text-base">radar</span>
            <span className="hidden md:inline">{radarSweep ? 'Sweep ON' : 'Sweep OFF'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg bg-emerald-950/80 border border-emerald-900/60 overflow-hidden">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              className="px-2 py-1 text-emerald-300 hover:bg-emerald-800/50 text-xs font-bold"
              title="Zoom Out">
              −
            </button>
            <span className="px-1 text-[11px] font-mono text-emerald-400">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
              className="px-2 py-1 text-emerald-300 hover:bg-emerald-800/50 text-xs font-bold"
              title="Zoom In">
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── RADAR CANVASES & SVG VECTOR PROJECTION ── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center select-none cursor-crosshair">
        
        {/* Radar Scale Container */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Radial gradient background */}
              <radialGradient id="radarGlow" cx="0%" cy="0%" r="50%" fx="0%" fy="0%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#047857" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
              </radialGradient>

              {/* Conical radar sweep beam */}
              <linearGradient id="sweepBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </linearGradient>

              {/* Pulsing beacon animations */}
              <filter id="glowUrgent" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Radar Fill */}
            <circle cx="0" cy="0" r="46" fill="url(#radarGlow)" />

            {/* Concentric Radar Distance Rings */}
            <circle cx="0" cy="0" r="12" fill="none" stroke="#065f46" strokeWidth="0.3" strokeDasharray="1,1" />
            <circle cx="0" cy="0" r="23" fill="none" stroke="#065f46" strokeWidth="0.35" />
            <circle cx="0" cy="0" r="34" fill="none" stroke="#065f46" strokeWidth="0.3" strokeDasharray="1.5,1.5" />
            <circle cx="0" cy="0" r="46" fill="none" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.6" />

            {/* Distance labels */}
            <text x="0" y="-12.8" textAnchor="middle" fill="#34d399" fontSize="1.8" opacity="0.6" fontFamily="monospace">3 KM</text>
            <text x="0" y="-23.8" textAnchor="middle" fill="#34d399" fontSize="1.8" opacity="0.6" fontFamily="monospace">7 KM</text>
            <text x="0" y="-34.8" textAnchor="middle" fill="#34d399" fontSize="1.8" opacity="0.6" fontFamily="monospace">11 KM</text>
            <text x="0" y="-46.8" textAnchor="middle" fill="#34d399" fontSize="1.8" opacity="0.8" fontFamily="monospace">15 KM RADAR LIMIT</text>

            {/* Crosshair Cardinal Axes */}
            <line x1="-48" y1="0" x2="48" y2="0" stroke="#047857" strokeWidth="0.25" strokeOpacity="0.5" />
            <line x1="0" y1="-48" x2="0" y2="48" stroke="#047857" strokeWidth="0.25" strokeOpacity="0.5" />

            {/* Cardinal Direction Indicators */}
            <text x="0" y="-48.5" textAnchor="middle" fill="#10b981" fontSize="2.2" fontWeight="bold">N</text>
            <text x="48.5" y="0.8" textAnchor="start" fill="#10b981" fontSize="2.2" fontWeight="bold">E</text>
            <text x="0" y="50" textAnchor="middle" fill="#10b981" fontSize="2.2" fontWeight="bold">S</text>
            <text x="-48.5" y="0.8" textAnchor="end" fill="#10b981" fontSize="2.2" fontWeight="bold">W</text>

            {/* Stylized Simulated Metro City Arteries & Contours */}
            <path d="M -40,-15 Q -10,-8 0,0 T 35,22" fill="none" stroke="#047857" strokeWidth="0.4" strokeOpacity="0.4" />
            <path d="M -25,35 Q -8,12 0,0 T 28,-32" fill="none" stroke="#047857" strokeWidth="0.4" strokeOpacity="0.4" />
            <path d="M -30,-30 C -15,-20 15,-25 35,-15" fill="none" stroke="#065f46" strokeWidth="0.3" strokeDasharray="0.8,0.8" strokeOpacity="0.3" />
            <path d="M -35,20 C -10,30 20,25 40,10" fill="none" stroke="#065f46" strokeWidth="0.3" strokeDasharray="0.8,0.8" strokeOpacity="0.3" />

            {/* Regional Sector Landmarks */}
            {currentProfile.sectors.map((sec, idx) => (
              <g key={idx}>
                <circle cx={sec.x} cy={sec.y} r="0.8" fill="#047857" opacity="0.6" />
                <text x={sec.x} y={sec.y + 2.5} textAnchor="middle" fill="#6ee7b7" fontSize="1.5" opacity="0.5" fontFamily="monospace">
                  {sec.name}
                </text>
              </g>
            ))}

            {/* Animated Radar Sweep Beam */}
            {radarSweep && (
              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '0 0' }}>
                <path d="M 0,0 L 46,0 A 46,46 0 0,0 32.5,-32.5 Z" fill="url(#sweepBeam)" opacity="0.35" />
                <line x1="0" y1="0" x2="46" y2="0" stroke="#34d399" strokeWidth="0.6" strokeOpacity="0.8" />
              </g>
            )}

            {/* Central NGO Dispatch Hub Icon */}
            <g>
              <circle cx="0" cy="0" r="3.2" fill="#006948" stroke="#34d399" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
              <text x="0" y="5.2" textAnchor="middle" fill="#a7f3d0" fontSize="1.8" fontWeight="bold">
                NGO DISPATCH HQ
              </text>
            </g>

            {/* Route Vector to Selected Node */}
            {activeNode && showRoute && (
              <g>
                <line
                  x1="0"
                  y1="0"
                  x2={activeNode.proj.x}
                  y2={activeNode.proj.y}
                  stroke={activeNode.level === 'urgent' ? '#ef4444' : '#10b981'}
                  strokeWidth="0.8"
                  strokeDasharray="2,1.5"
                  className="animate-[pulse_1.5s_infinite]"
                />
                {/* Midpoint ETA Tag */}
                <rect
                  x={(activeNode.proj.x / 2) - 8}
                  y={(activeNode.proj.y / 2) - 2}
                  width="16"
                  height="4"
                  rx="1"
                  fill="#0f172a"
                  stroke={activeNode.level === 'urgent' ? '#ef4444' : '#10b981'}
                  strokeWidth="0.3"
                />
                <text
                  x={activeNode.proj.x / 2}
                  y={(activeNode.proj.y / 2) + 0.8}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="1.6"
                  fontWeight="bold">
                  {activeNode.proj.distanceKm} km • {activeNode.proj.estMins}m
                </text>
              </g>
            )}
          </svg>

          {/* ── INTERACTIVE HTML NODES (PINS) ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {nodes.map((node) => {
              const isSelected = selectedPin?._id === node._id
              const isUrgent = node.level === 'urgent'
              const isModerate = node.level === 'moderate'
              const pinColor = isUrgent ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981'

              // Percent coordinates on 100% container
              const leftPercent = 50 + node.proj.x
              const topPercent = 50 + node.proj.y

              return (
                <div
                  key={node._id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPin(node)
                  }}
                  className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-30 group"
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}>
                  
                  {/* Radar Ripple Effect for Urgent nodes */}
                  {isUrgent && (
                    <div className="absolute -inset-2 rounded-full border border-red-500 animate-ping opacity-75 pointer-events-none" />
                  )}

                  {/* Pin Body */}
                  <div
                    className={`relative flex items-center justify-center rounded-full shadow-lg transition-all ${
                      isSelected ? 'ring-4 ring-white scale-110' : ''
                    }`}
                    style={{
                      width: isSelected ? '34px' : '28px',
                      height: isSelected ? '34px' : '28px',
                      backgroundColor: pinColor,
                      boxShadow: `0 0 16px ${pinColor}88`,
                      border: '2px solid white',
                    }}>
                    <span className="material-symbols-outlined text-white" style={{ fontSize: isSelected ? '18px' : '15px' }}>
                      restaurant
                    </span>
                  </div>

                  {/* Compact Quick-Badge */}
                  <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-md pointer-events-none transition-all ${
                    isSelected ? 'opacity-100 bg-white text-gray-900' : 'opacity-80 bg-black/80 text-white group-hover:opacity-100'
                  }`}>
                    {node.foodName?.slice(0, 14)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── FLOATING PIN DETAIL DRAWER / POPUP ── */}
        {activeNode && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 bg-[#0f172a]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl text-white animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                activeNode.level === 'urgent'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : activeNode.level === 'moderate'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                ● {activeNode.level} priority
              </span>

              <button
                onClick={() => setSelectedPin(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
                title="Close Drawer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <h4 className="text-sm font-bold text-white leading-tight mb-1">{activeNode.foodName}</h4>
            <div className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
              <span>🥗 {activeNode.quantity} servings</span>
              <span>•</span>
              <span className="capitalize">{activeNode.foodType || 'Vegetarian'}</span>
            </div>

            <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 space-y-1 text-xs text-gray-300 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Donor:</span>
                <span className="font-semibold text-white truncate">{activeNode.donorName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Location:</span>
                <span className="truncate">{activeNode.address || activeNode.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 font-mono text-[11px] pt-1 border-t border-white/10">
                <span>📍 Distance:</span>
                <span>{activeNode.proj.distanceKm} km ({activeNode.proj.estMins}m ETA)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                  showRoute
                    ? 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}>
                <span className="material-symbols-outlined text-sm">route</span>
                {showRoute ? 'Hide Route' : 'Show Route'}
              </button>

              {onClaim && (
                <button
                  onClick={() => onClaim(activeNode)}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-black transition-all shadow-md bg-emerald-400 hover:bg-emerald-300 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                  Claim Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state when no nodes in filter */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 bg-[#06110d]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-4">
            <span className="material-symbols-outlined text-4xl text-emerald-600/50 mb-2">radar</span>
            <p className="text-sm font-semibold text-emerald-200">No active rescue nodes in this sector.</p>
            <p className="text-xs text-gray-400 mt-1">Switch city filter or select "All Cities" above.</p>
          </div>
        )}
      </div>

      {/* ── BOTTOM HUD STATUS BAR ── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0a1612]/90 backdrop-blur-md border-t border-emerald-900/40 text-[11px] text-gray-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Urgent: <b className="text-white">{nodes.filter(n => n.level === 'urgent').length}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Moderate: <b className="text-white">{nodes.filter(n => n.level === 'moderate').length}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Safe: <b className="text-white">{nodes.filter(n => n.level === 'safe').length}</b></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">Filter Level:</span>
          {['all', 'urgent', 'moderate', 'safe'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                activeFilter === f
                  ? 'bg-emerald-500 text-black'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

