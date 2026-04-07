import { useState, useEffect, useCallback } from 'react'
import { budget as budgetApi, trips as tripsApi, currency as currencyApi } from '../api/index.js'
import { Wallet, Plus, Trash2, Edit2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import Modal from '../components/ui/Modal.jsx'
import Toast from '../components/ui/Toast.jsx'

const CATEGORIES = ['flights', 'hotel', 'food', 'activities', 'transport', 'misc']
const CAT_COLORS = {
  flights:    { color: '#7c3aed', bg: '#f5f3ff', label: 'Flights' },
  hotel:      { color: '#db2777', bg: '#fdf2f8', label: 'Hotel' },
  food:       { color: '#d97706', bg: '#fffbeb', label: 'Food' },
  activities: { color: '#059669', bg: '#ecfdf5', label: 'Activities' },
  transport:  { color: '#2563eb', bg: '#eff6ff', label: 'Transport' },
  misc:       { color: '#6b7280', bg: '#f9fafb', label: 'Misc' },
}

function BudgetItemForm({ initial, tripId, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    category: 'flights', description: '', estimated: '', actual: '', currency: 'USD', notes: '', item_date: '',
    ...(initial || {}),
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSubmit = (e) => { e.preventDefault(); onSave({ ...form, estimated: parseFloat(form.estimated) || 0, actual: parseFloat(form.actual) || 0 }) }
  return (
    <form id="budget-item-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_COLORS[c].label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <input className="form-input" value={form.currency} onChange={e => set('currency', e.target.value.toUpperCase())} maxLength={3} placeholder="USD" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Round-trip flights NYC→TYO" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Estimated</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.estimated} onChange={e => set('estimated', e.target.value)} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label className="form-label">Actual Spent</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.actual} onChange={e => set('actual', e.target.value)} placeholder="0.00" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.item_date} onChange={e => set('item_date', e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Notes</label>
          <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional note" />
        </div>
      </div>
    </form>
  )
}

function CurrencyHelper({ baseCurrency = 'USD' }) {
  const [base, setBase] = useState(baseCurrency)
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState('EUR')
  const [amount, setAmount] = useState('100')

  const fetch = async () => {
    setLoading(true)
    try { const r = await currencyApi.rates(base); setRates(r.rates) }
    catch { /* ignore */ }
    setLoading(false)
  }

  const converted = rates && rates[target] ? (parseFloat(amount) * rates[target]).toFixed(2) : null
  const rate = rates && rates[target] ? rates[target].toFixed(4) : null

  const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD', 'THB', 'MXN', 'BRL', 'INR']

  return (
    <div className="card card-padded" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <TrendingUp size={16} color="var(--blue)" />
        <span style={{ fontSize: 15, fontWeight: 600 }}>Currency Helper</span>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div>
          <label className="form-label">From</label>
          <input className="form-input" value={base} onChange={e => setBase(e.target.value.toUpperCase())} maxLength={3} placeholder="USD" />
        </div>
        <div>
          <label className="form-label">To</label>
          <select className="form-select" value={target} onChange={e => setTarget(e.target.value)}>
            {POPULAR.filter(c => c !== base).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Amount</label>
          <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={fetch} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'spin' : ''} /> Get Rates
        </button>
        {converted && (
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {amount} {base} = <span style={{ color: 'var(--blue)' }}>{converted} {target}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>1 {base} = {rate} {target}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function TripBudget({ trip, onRefresh }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    budgetApi.forTrip(trip.id).then(setItems).finally(() => setLoading(false))
  }, [trip.id])

  useEffect(() => { load() }, [load])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editing?.id) await budgetApi.update(editing.id, data)
      else await budgetApi.create(trip.id, data)
      setShowForm(false); setEditing(null); setToast('Saved!'); load(); onRefresh()
    } catch { setToast('Error saving.') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try { await budgetApi.delete(deleting.id); setDeleting(null); setToast('Deleted.'); load(); onRefresh() }
    catch { setToast('Error deleting.') }
  }

  const totalEst = items.reduce((s, i) => s + (i.estimated || 0), 0)
  const totalAct = items.reduce((s, i) => s + (i.actual || 0), 0)
  const diff = totalAct - totalEst
  const pct = totalEst > 0 ? Math.min(100, (totalAct / totalEst) * 100) : 0

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    cfg: CAT_COLORS[cat],
    items: items.filter(i => i.category === cat),
    estimated: items.filter(i => i.category === cat).reduce((s, i) => s + (i.estimated || 0), 0),
    actual: items.filter(i => i.category === cat).reduce((s, i) => s + (i.actual || 0), 0),
  })).filter(c => c.items.length > 0)

  return (
    <div style={{ marginTop: 20 }}>
      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-card-label">Estimated Total</div>
          <div className="stat-card-value">${totalEst.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className="stat-card-sub">{items.length} items</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Actual Spent</div>
          <div className="stat-card-value" style={{ color: diff > 0 ? '#dc2626' : 'var(--visited)' }}>
            ${totalAct.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="stat-card-sub" style={{ color: diff > 0 ? '#dc2626' : 'var(--visited)' }}>
            {diff > 0 ? '+' : ''}{diff.toFixed(0)} vs estimate
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Budget Used</div>
          <div className="stat-card-value">{pct.toFixed(0)}%</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 100 ? '#dc2626' : pct > 80 ? '#f59e0b' : 'var(--visited)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={13} /> Add Item
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>Loading...</div>
      ) : byCategory.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <Wallet />
          <h3>No budget items yet</h3>
          <p>Add flights, hotel, food, and other expenses to track your budget.</p>
        </div>
      ) : byCategory.map(({ cat, cfg, items: catItems, estimated, actual }) => (
        <div key={cat} className="budget-category">
          <div className="budget-row" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{cfg.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>({catItems.length})</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              <span style={{ color: 'var(--text-3)' }}>Est: <strong>${estimated.toFixed(0)}</strong></span>
              <span style={{ color: actual > estimated ? '#dc2626' : 'var(--text-2)' }}>
                Actual: <strong>${actual.toFixed(0)}</strong>
              </span>
            </div>
          </div>
          {catItems.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 6px 18px', borderLeft: `2px solid ${cfg.color}30` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{item.description || cfg.label}</span>
                {item.notes && <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>{item.notes}</span>}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, flexShrink: 0 }}>
                {item.estimated > 0 && <span style={{ color: 'var(--text-3)' }}>${item.estimated.toFixed(0)}</span>}
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>${item.actual.toFixed(0)} {item.currency !== 'USD' ? item.currency : ''}</span>
              </div>
              <button className="btn-icon" style={{ width: 24, height: 24, padding: 4 }} onClick={() => { setEditing(item); setShowForm(true) }}><Edit2 size={11} /></button>
              <button className="btn-icon" style={{ width: 24, height: 24, padding: 4, color: 'var(--text-3)' }} onClick={() => setDeleting(item)}><Trash2 size={11} /></button>
            </div>
          ))}
        </div>
      ))}

      {showForm && (
        <Modal title={editing ? 'Edit Budget Item' : 'Add Budget Item'} onClose={() => { setShowForm(false); setEditing(null) }} size="md"
          footer={<>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} type="submit" form="budget-item-form">{saving ? 'Saving...' : 'Save'}</button>
          </>}>
          <BudgetItemForm initial={editing} tripId={trip.id} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} saving={saving} />
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete Item" onClose={() => setDeleting(null)} size="sm"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>}>
          <p style={{ color: 'var(--text-2)' }}>Remove <strong>{deleting.description || 'this item'}</strong>?</p>
        </Modal>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}

export default function Budget() {
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [annualFunds, setAnnualFunds] = useState([])
  const [year] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [showFundModal, setShowFundModal] = useState(false)
  const [fundAmount, setFundAmount] = useState('')
  const [toast, setToast] = useState(null)
  const [refresh, setRefresh] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([tripsApi.list(), budgetApi.annualFund()])
      .then(([t, f]) => {
        setTrips(t)
        setAnnualFunds(Array.isArray(f) ? f : [])
        if (t.length > 0 && !selectedTrip) setSelectedTrip(t[0])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load, refresh])

  const currentFund = annualFunds.find(f => f.year === year)
  const yearlySpent = trips.reduce((s, t) => s + (t.totalActual || 0), 0)

  const handleSaveFund = async () => {
    try {
      await budgetApi.setAnnualFund({ year, amount: parseFloat(fundAmount) || 0, currency: 'USD' })
      setShowFundModal(false); setToast('Annual fund updated!'); load()
    } catch { setToast('Error saving.') }
  }

  return (
    <div className="page" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Track and plan your travel spending</p>
        </div>
      </div>

      {/* Annual fund */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setFundAmount(currentFund?.amount || ''); setShowFundModal(true) }}>
          <div className="stat-card-label">{year} Annual Fund</div>
          <div className="stat-card-value">{currentFund ? `$${Number(currentFund.amount).toLocaleString()}` : '—'}</div>
          <div className="stat-card-sub" style={{ color: 'var(--blue)' }}>Click to {currentFund ? 'edit' : 'set'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Spent This Year</div>
          <div className="stat-card-value">${yearlySpent.toFixed(0)}</div>
          {currentFund && <div className="stat-card-sub">{((yearlySpent / currentFund.amount) * 100).toFixed(0)}% of fund used</div>}
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Remaining</div>
          <div className="stat-card-value" style={{ color: currentFund && (currentFund.amount - yearlySpent) < 0 ? '#dc2626' : 'var(--visited)' }}>
            {currentFund ? `$${Math.max(0, currentFund.amount - yearlySpent).toFixed(0)}` : '—'}
          </div>
          {currentFund && <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (yearlySpent / currentFund.amount) * 100)}%`, background: 'var(--blue)' }} />
          </div>}
        </div>
      </div>

      {/* Trip selector */}
      {trips.length > 0 && (
        <div className="card card-padded" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', flexShrink: 0 }}>View budget for:</span>
            <select
              className="form-select"
              style={{ maxWidth: 360 }}
              value={selectedTrip?.id || ''}
              onChange={e => setSelectedTrip(trips.find(t => t.id === parseInt(e.target.value)))}
            >
              {trips.map(t => <option key={t.id} value={t.id}>{t.name}{t.start_date ? ` (${t.start_date.slice(0,7)})` : ''}</option>)}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>Loading...</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <Wallet />
          <h3>No trips yet</h3>
          <p>Create a trip first, then add budget items to track your spending.</p>
        </div>
      ) : selectedTrip && (
        <TripBudget key={selectedTrip.id} trip={selectedTrip} onRefresh={() => setRefresh(r => r + 1)} />
      )}

      <CurrencyHelper />

      {showFundModal && (
        <Modal title={`Set ${year} Travel Fund`} onClose={() => setShowFundModal(false)} size="sm"
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowFundModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveFund}>Save</button>
          </>}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Annual Budget (USD)</label>
            <input className="form-input" type="number" min="0" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="10000" autoFocus />
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
