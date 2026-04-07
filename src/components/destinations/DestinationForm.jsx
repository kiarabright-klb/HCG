import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import StarRating from '../ui/StarRating.jsx'
import TagSelector from '../ui/TagSelector.jsx'

const CONTINENTS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']
const REGIONS = {
  Africa: ['East Africa', 'West Africa', 'North Africa', 'Southern Africa', 'Central Africa'],
  Asia: ['East Asia', 'Southeast Asia', 'South Asia', 'Central Asia', 'Middle East'],
  Europe: ['Western Europe', 'Eastern Europe', 'Northern Europe', 'Southern Europe', 'Balkans'],
  'North America': ['USA', 'Canada', 'Caribbean', 'Central America', 'Mexico'],
  'South America': ['Andean', 'Brazil', 'Southern Cone', 'Caribbean South America'],
  Oceania: ['Australia & NZ', 'Pacific Islands', 'Melanesia', 'Micronesia'],
  Antarctica: ['Antarctica'],
}

const EMPTY = {
  name: '', city: '', country: '', country_code: '', continent: '',
  region: '', lat: '', lng: '', status: 'wishlist',
  want_to_return: false, rating: 0, visit_date: '',
  notes: '', wishlist_priority: 3, excluded_note: '', tags: [],
}

async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  const data = await res.json()
  return data[0] || null
}

export default function DestinationForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => { if (initial) setForm({ ...EMPTY, ...initial }) }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGeocode = async () => {
    const q = [form.name, form.city, form.country].filter(Boolean).join(', ')
    if (!q) return
    setGeocoding(true)
    try {
      const r = await geocode(q)
      if (r) {
        set('lat', parseFloat(r.lat).toFixed(4))
        set('lng', parseFloat(r.lon).toFixed(4))
      }
    } catch (e) { /* silent */ }
    setGeocoding(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      rating: form.status === 'visited' ? form.rating : null,
      wishlist_priority: form.status !== 'excluded' ? form.wishlist_priority : null,
    }
    onSave(payload)
  }

  const status = form.status

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Place Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Kyoto" required />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">City / Area</label>
          <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Kyoto Prefecture" />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Country *</label>
          <input className="form-input" value={form.country} onChange={e => set('country', e.target.value)} placeholder="Japan" required />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Country Code</label>
          <input className="form-input" value={form.country_code} onChange={e => set('country_code', e.target.value.toUpperCase())} placeholder="JP" maxLength={3} />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Continent</label>
          <select className="form-select" value={form.continent} onChange={e => { set('continent', e.target.value); set('region', '') }}>
            <option value="">Select continent</option>
            {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Region</label>
          <select className="form-select" value={form.region} onChange={e => set('region', e.target.value)}>
            <option value="">Select region</option>
            {(REGIONS[form.continent] || []).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="form-row-3">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Latitude</label>
          <input className="form-input" type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="35.0116" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Longitude</label>
          <input className="form-input" type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="135.7681" />
        </div>
        <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={handleGeocode} disabled={geocoding}>
            {geocoding ? <Loader size={14} className="spin" /> : <Search size={14} />}
            Auto-locate
          </button>
        </div>
      </div>

      <div className="divider" />

      <div className="form-group">
        <label className="form-label">Status</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { v: 'visited', label: 'Visited', color: 'var(--visited)' },
            { v: 'wishlist', label: 'Wishlist', color: 'var(--wishlist)' },
            { v: 'excluded', label: 'Excluded', color: 'var(--excluded)' },
          ].map(({ v, label, color }) => (
            <button
              key={v} type="button"
              onClick={() => set('status', v)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                border: `2px solid ${status === v ? color : 'var(--border)'}`,
                background: status === v ? color + '15' : 'var(--surface)',
                color: status === v ? color : 'var(--text-2)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {status === 'visited' && (
        <>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Visit Date</label>
              <input className="form-input" type="date" value={form.visit_date} onChange={e => set('visit_date', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rating</label>
              <div style={{ paddingTop: 6 }}>
                <StarRating value={form.rating} onChange={v => set('rating', v)} />
              </div>
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={form.want_to_return}
                onChange={e => set('want_to_return', e.target.checked)}
                style={{ width: 14, height: 14 }}
              />
              Also add to wishlist (want to return)
            </label>
          </div>
          <div style={{ height: 12 }} />
        </>
      )}

      {status === 'wishlist' && (
        <div className="form-group">
          <label className="form-label">Priority (1 = low, 5 = high)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n} type="button"
                onClick={() => set('wishlist_priority', n)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: `2px solid ${form.wishlist_priority >= n ? 'var(--wishlist)' : 'var(--border)'}`,
                  background: form.wishlist_priority >= n ? 'var(--wishlist-bg)' : 'var(--surface)',
                  color: form.wishlist_priority >= n ? 'var(--wishlist)' : 'var(--text-3)',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >{n}</button>
            ))}
          </div>
        </div>
      )}

      {status === 'excluded' && (
        <div className="form-group">
          <label className="form-label">Why excluded?</label>
          <input className="form-input" value={form.excluded_note} onChange={e => set('excluded_note', e.target.value)} placeholder="e.g. Safety concerns, not interested" />
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Tags</label>
        <TagSelector selected={form.tags} onChange={v => set('tags', v)} />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything you want to remember about this place..." rows={3} />
      </div>
    </form>
  )
}
