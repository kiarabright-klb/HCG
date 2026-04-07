import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { destinations as api } from '../api/index.js'
import { Plus, Search, Globe, CheckCircle, Heart, MinusCircle } from 'lucide-react'
import DestinationCard from '../components/destinations/DestinationCard.jsx'
import DestinationForm from '../components/destinations/DestinationForm.jsx'
import Modal from '../components/ui/Modal.jsx'
import Toast from '../components/ui/Toast.jsx'

const TABS = [
  { key: 'all',      label: 'All',      icon: Globe },
  { key: 'visited',  label: 'Visited',  icon: CheckCircle },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'excluded', label: 'Excluded', icon: MinusCircle },
]

const CONTINENTS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']
const ALL_TAGS = ['Beach', 'Mountains', 'City', 'Culture', 'Food', 'Adventure', 'Nature', 'History', 'Nightlife', 'Relaxation', 'Road Trip', 'Budget', 'Luxury']

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [dests, setDests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(searchParams.get('status') || 'all')
  const [search, setSearch] = useState('')
  const [continent, setContinent] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.list().then(setDests).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editing?.id) await api.update(editing.id, data)
      else await api.create(data)
      setShowForm(false)
      setEditing(null)
      setToast(editing?.id ? 'Destination updated!' : 'Destination added!')
      load()
    } catch (e) {
      setToast('Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await api.delete(deleting.id)
      setDeleting(null)
      setToast('Destination deleted.')
      load()
    } catch { setToast('Error deleting.') }
  }

  const filtered = dests.filter(d => {
    if (tab !== 'all' && d.status !== tab) return false
    if (continent && d.continent !== continent) return false
    if (tagFilter && !(d.tags || []).includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        (d.city || '').toLowerCase().includes(q)
    }
    return true
  })

  const counts = {
    all: dests.length,
    visited: dests.filter(d => d.status === 'visited').length,
    wishlist: dests.filter(d => d.status === 'wishlist').length,
    excluded: dests.filter(d => d.status === 'excluded').length,
  }

  return (
    <div className="page" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Destinations</h1>
          <p className="page-subtitle">Manage all the places in your travel world</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={15} /> Add Destination
        </button>
      </div>

      <div className="tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={13} /> {label}
            <span className="tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Search destinations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={continent}
          onChange={e => setContinent(e.target.value)}
        >
          <option value="">All continents</option>
          {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
        >
          <option value="">All tags</option>
          {ALL_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {(continent || tagFilter || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setContinent(''); setTagFilter(''); setSearch('') }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Globe />
          <h3>No destinations found</h3>
          <p>{search || continent || tagFilter ? 'Try adjusting your filters.' : 'Add your first destination to get started!'}</p>
          {!search && !continent && !tagFilter && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing(null); setShowForm(true) }}>
              <Plus size={14} /> Add Destination
            </button>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(dest => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              onEdit={d => { setEditing(d); setShowForm(true) }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? 'Edit Destination' : 'Add Destination'}
          onClose={() => { setShowForm(false); setEditing(null) }}
          size="lg"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={() => document.getElementById('dest-form-submit')?.click()}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Destination'}
              </button>
            </>
          }
        >
          <DestinationForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
          <button id="dest-form-submit" type="submit" style={{ display: 'none' }} form="dest-form" />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Destination" onClose={() => setDeleting(null)} size="sm" footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>
        }>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{deleting.name}</strong>? This cannot be undone.
          </p>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
