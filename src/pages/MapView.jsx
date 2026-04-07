import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { destinations as api } from '../api/index.js'
import { CheckCircle, Heart, MinusCircle, MapPin, Star, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const STATUS_COLORS = {
  visited:  { fill: '#059669', stroke: '#047857', label: 'Visited',  Icon: CheckCircle },
  wishlist: { fill: '#f59e0b', stroke: '#d97706', label: 'Wishlist', Icon: Heart },
  excluded: { fill: '#9ca3af', stroke: '#6b7280', label: 'Excluded', Icon: MinusCircle },
}

function Legend({ counts }) {
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 1000,
      background: 'white', borderRadius: 12, padding: '14px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 160,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Map Legend</div>
      {Object.entries(STATUS_COLORS).map(([key, { fill, label, Icon }]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: fill, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>{counts[key] || 0}</span>
        </div>
      ))}
    </div>
  )
}

function DetailPanel({ dest, onClose }) {
  if (!dest) return null
  const cfg = STATUS_COLORS[dest.status]
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, background: 'white', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.16)', minWidth: 320, maxWidth: 420,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: 'Playfair Display, serif' }}>
            {dest.name}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {dest.city ? `${dest.city}, ` : ''}{dest.country}
            {dest.continent && <> · {dest.continent}</>}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6,
          cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center',
        }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: cfg.fill + '18', color: cfg.fill,
        }}>
          {cfg.label}
        </span>
        {dest.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{dest.rating}/5</span>
          </div>
        )}
        {dest.tags?.map(t => (
          <span key={t} style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, background: '#f1f5f9', color: '#64748b' }}>{t}</span>
        ))}
      </div>
      {dest.notes && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          {dest.notes}
        </div>
      )}
      {dest.excluded_note && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
          {dest.excluded_note}
        </div>
      )}
    </div>
  )
}

export default function MapView() {
  const [dests, setDests] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.list().then(setDests).catch(console.error)
  }, [])

  const mapped = dests.filter(d => d.lat && d.lng)
  const unmapped = dests.filter(d => !d.lat || !d.lng)

  const visible = mapped.filter(d => filter === 'all' || d.status === filter)

  const counts = {
    visited: mapped.filter(d => d.status === 'visited').length,
    wishlist: mapped.filter(d => d.status === 'wishlist').length,
    excluded: mapped.filter(d => d.status === 'excluded').length,
  }

  return (
    <div className="map-page">
      {/* Toolbar */}
      <div style={{
        padding: '12px 20px',
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <MapPin size={16} color="#2563eb" />
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#0f172a' }}>World Map</span>
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
            {mapped.length} pinned · {unmapped.length} without coordinates
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'visited', 'wishlist', 'excluded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: `1px solid ${filter === f ? (STATUS_COLORS[f]?.fill || '#2563eb') : '#e2e8f0'}`,
                background: filter === f ? ((STATUS_COLORS[f]?.fill || '#2563eb') + '15') : 'white',
                color: filter === f ? (STATUS_COLORS[f]?.fill || '#2563eb') : '#64748b',
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit',
              }}
            >
              {f === 'all' ? `All (${mapped.length})` : `${f} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="map-container" style={{ position: 'relative' }}>
        <MapContainer
          center={[20, 10]}
          zoom={2}
          minZoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {visible.map(dest => {
            const cfg = STATUS_COLORS[dest.status]
            const isSelected = selected?.id === dest.id
            return (
              <CircleMarker
                key={dest.id}
                center={[dest.lat, dest.lng]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  fillColor: cfg.fill,
                  color: cfg.stroke,
                  weight: isSelected ? 2.5 : 1.5,
                  fillOpacity: isSelected ? 1 : 0.85,
                }}
                eventHandlers={{ click: () => setSelected(isSelected ? null : dest) }}
              />
            )
          })}
        </MapContainer>

        <Legend counts={counts} />
        <DetailPanel dest={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  )
}
