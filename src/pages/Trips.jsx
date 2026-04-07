import { useState, useEffect, useCallback } from 'react'
import { trips as api, destinations as destApi } from '../api/index.js'
import { Plus, Briefcase, Calendar, MapPin, ChevronDown, ChevronUp, Trash2, Edit2, X } from 'lucide-react'
import Modal from '../components/ui/Modal.jsx'
import Toast from '../components/ui/Toast.jsx'

const STATUS_COLORS = {
  planned:   { bg: '#eff6ff', color: '#2563eb', label: 'Planned' },
  active:    { bg: '#f0fdf4', color: '#16a34a', label: 'Active' },
  completed: { bg: '#f8fafc', color: '#64748b', label: 'Completed' },
}

function TripForm({ initial, onSave, saving }) {
  const EMPTY_STOP = { destination_name: '', country: '', start_date: '', end_date: '', notes: '' }
  const [form, setForm] = useState({
    name: '', start_date: '', end_date: '', status: 'planned', notes: '',
    stops: [{ ...EMPTY_STOP }],
    ...(initial || {}),
  })
  useEffect(() => {
    if (initial) setForm({ name: '', start_date: '', end_date: '', status: 'planned', notes: '', stops: [{ ...EMPTY_STOP }], ...initial })
  }, [initial])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setStop = (i, k, v) => setForm(f => ({ ...f, stops: f.stops.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }))
  const addStop = () => setForm(f => ({ ...f, stops: [...f.stops, { ...EMPTY_STOP }] }))
  const removeStop = (i) => setForm(f => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }))
  const handleSubmit = (e) => { e.preventDefault(); onSave(form) }

  return (
    <form id="trip-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Trip Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Japan Spring 2025" required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input className="form-input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input className="form-input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Itinerary Stops</label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addStop}><Plus size={12} /> Add Stop</button>
        </div>
        {form.stops.map((stop, i) => (
          <div key={i} className="trip-stop">
            <div className="trip-stop-number">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="form-row" style={{ marginBottom: 6 }}>
                <input className="form-input" placeholder="Destination name" value={stop.destination_name} onChange={e => setStop(i, 'destination_name', e.target.value)} />
                <input className="form-input" placeholder="Country" value={stop.country} onChange={e => setStop(i, 'country', e.target.value)} />
              </div>
              <div className="form-row">
                <input className="form-input" type="date" value={stop.start_date} onChange={e => setStop(i, 'start_date', e.target.value)} />
                <input className="form-input" type="date" value={stop.end_date} onChange={e => setStop(i, 'end_date', e.target.value)} />
              </div>
            </div>
            {form.stops.length > 1 && (
              <button type="button" className="btn-icon" onClick={() => removeStop(i)}><X size={13} /></button>
            )}
          </div>
        ))}
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Trip notes, reminders..." rows={2} />
      </div>
    </form>
  )
}

function TripCard({ trip, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_COLORS[trip.status] || STATUS_COLORS.planned
  const nights = trip.start_date && trip.end_date
    ? Math.max(0, Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)) : null
  const fmt = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
          <Briefcase size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Playfair Display, serif' }}>{trip.name}</span>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {trip.start_date && <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {fmt(trip.start_date)}{trip.end_date ? ` → ${fmt(trip.end_date)}` : ''}</span>}
            {nights !== null && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{nights} nights</span>}
            {trip.stops?.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {trip.stops.length} stop{trip.stops.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn-icon" onClick={e => { e.stopPropagation(); onEdit(trip) }}><Edit2 size={13} /></button>
          <button className="btn-icon" style={{ color: 'var(--text-3)' }} onClick={e => { e.stopPropagation(); onDelete(trip) }}><Trash2 size={13} /></button>
          {expanded ? <ChevronUp size={16} color="var(--text-3)" /> : <ChevronDown size={16} color="var(--text-3)" />}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-2)', padding: '16px 20px', background: 'var(--surface-2)' }}>
          {trip.stops?.length > 0 ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Itinerary</div>
              {trip.stops.map((stop, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                    {i < trip.stops.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 2, minHeight: 12 }} />}
                  </div>
                  <div style={{ paddingBottom: i < trip.stops.length - 1 ? 8 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{stop.destination_name}{stop.country ? `, ${stop.country}` : ''}</div>
                    {(stop.start_date || stop.end_date) && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{fmt(stop.start_date)}{stop.end_date ? ` → ${fmt(stop.end_date)}` : ''}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No stops added yet.</div>}
          {trip.notes && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Notes</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{trip.notes}</div>
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-2)' }}>
            Budget: <strong style={{ color: 'var(--text)' }}>${(trip.totalActual || 0).toFixed(0)}</strong>
            {trip.totalEstimated > 0 && <> / ${trip.totalEstimated.toFixed(0)} est.</>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Trips() {
  const [tripList, setTripList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(() => {
    setLoading(true)
    api.list().then(setTripList).catch(() => setTripList([])).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editing?.id) await api.update(editing.id, data)
      else await api.create(data)
      setShowForm(false); setEditing(null)
      setToast(editing?.id ? 'Trip updated!' : 'Trip created!')
      load()
    } catch { setToast('Error saving trip.') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try { await api.delete(deleting.id); setDeleting(null); setToast('Trip deleted.'); load() }
    catch { setToast('Error deleting.') }
  }

  const filtered = statusFilter === 'all' ? tripList : tripList.filter(t => t.status === statusFilter)
  const counts = { planned: tripList.filter(t => t.status === 'planned').length, active: tripList.filter(t => t.status === 'active').length, completed: tripList.filter(t => t.status === 'completed').length }

  return (
    <div className="page" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trips</h1>
          <p className="page-subtitle">Plan, track, and relive your adventures</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={15} /> New Trip
        </button>
      </div>

      <div className="tabs">
        {[{ key: 'all', label: 'All Trips' }, { key: 'planned', label: 'Planned' }, { key: 'active', label: 'Active' }, { key: 'completed', label: 'Completed' }].map(({ key, label }) => (
          <button key={key} className={`tab${statusFilter === key ? ' active' : ''}`} onClick={() => setStatusFilter(key)}>
            {label} <span className="tab-count">{key === 'all' ? tripList.length : counts[key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Briefcase />
          <h3>No trips {statusFilter !== 'all' ? `(${statusFilter})` : 'yet'}</h3>
          <p>{statusFilter === 'all' ? 'Start planning your next adventure!' : `No ${statusFilter} trips.`}</p>
          {statusFilter === 'all' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing(null); setShowForm(true) }}>
              <Plus size={14} /> Create First Trip
            </button>
          )}
        </div>
      ) : filtered.map(trip => (
        <TripCard key={trip.id} trip={trip} onEdit={t => { setEditing(t); setShowForm(true) }} onDelete={setDeleting} />
      ))}

      {showForm && (
        <Modal title={editing ? 'Edit Trip' : 'New Trip'} onClose={() => { setShowForm(false); setEditing(null) }} size="lg"
          footer={<>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} type="submit" form="trip-form">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Trip'}</button>
          </>}>
          <TripForm initial={editing} onSave={handleSave} saving={saving} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Trip" onClose={() => setDeleting(null)} size="sm"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>}>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Delete <strong>{deleting.name}</strong>? All budget data will also be removed.</p>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
