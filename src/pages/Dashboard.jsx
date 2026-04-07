import { useState, useEffect } from 'react'
import { stats as statsApi } from '../api/index.js'
import { Globe, Briefcase, Star, MapPin, TrendingUp, Map } from 'lucide-react'
import { Link } from 'react-router-dom'

const CONTINENTS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-card-label">{label}</div>
          <div className="stat-card-value">{value}</div>
          {sub && <div className="stat-card-sub">{sub}</div>}
        </div>
        {Icon && (
          <div style={{ padding: 10, background: color + '18', borderRadius: 10, color }}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}

function ContinentGrid({ visited = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
      {CONTINENTS.map(c => {
        const done = visited.includes(c)
        return (
          <div key={c} style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${done ? 'var(--visited-border)' : 'var(--border)'}`,
            background: done ? 'var(--visited-bg)' : 'var(--surface-2)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: done ? 'var(--visited)' : 'var(--border)',
            }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: done ? 'var(--visited)' : 'var(--text-3)' }}>
              {c}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.get().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  const d = data || {}

  return (
    <div className="page" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your travel story at a glance</p>
        </div>
        <Link to="/destinations" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          + Add Destination
        </Link>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard label="Countries Visited" value={d.countriesVisited ?? 0} sub={`${d.continentsVisited ?? 0} continents`} icon={Globe} color="#059669" />
        <StatCard label="Places Visited" value={d.totalVisited ?? 0} sub={`${d.totalWishlist ?? 0} on wishlist`} icon={MapPin} color="#2563eb" />
        <StatCard label="Total Trips" value={d.totalTrips ?? 0} sub={`${d.completedTrips ?? 0} completed`} icon={Briefcase} color="#7c3aed" />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card card-padded">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Continents Explored</h2>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {d.continentsVisited ?? 0} / 7
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 16 }}>
            <div className="progress-fill" style={{
              width: `${((d.continentsVisited ?? 0) / 7) * 100}%`,
              background: 'var(--visited)',
            }} />
          </div>
          <ContinentGrid visited={d.continentsList ?? []} />
        </div>

        <div className="card card-padded">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Recent Visits</h2>
            <Link to="/destinations" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>
              View all
            </Link>
          </div>
          {(d.recentVisited ?? []).length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No destinations yet. Start adding places you've visited!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(d.recentVisited ?? []).map(dest => (
                <div key={dest.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border-2)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--visited-bg)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--visited)', flexShrink: 0,
                  }}>
                    <MapPin size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dest.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {dest.city ? `${dest.city}, ` : ''}{dest.country}
                    </div>
                  </div>
                  {dest.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
                      <Star size={12} fill="#f59e0b" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{dest.rating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-padded">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <TrendingUp size={18} color="var(--blue)" />
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Quick Links</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/destinations?status=wishlist" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <MapPin size={14} /> View Wishlist ({d.totalWishlist ?? 0})
          </Link>
          <Link to="/map" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <Map size={14} /> Open World Map
          </Link>
          <Link to="/trips" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <Briefcase size={14} /> Plan a Trip
          </Link>
          <Link to="/budget" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Track Budget
          </Link>
        </div>
      </div>
    </div>
  )
}
