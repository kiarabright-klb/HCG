import { MapPin, Star, Edit2, Trash2, CheckCircle, Heart, MinusCircle } from 'lucide-react'
import StarRating from '../ui/StarRating.jsx'

const STATUS_CONFIG = {
  visited:  { label: 'Visited',  color: 'var(--visited)',  bgClass: 'badge-visited',  Icon: CheckCircle },
  wishlist: { label: 'Wishlist', color: 'var(--wishlist)', bgClass: 'badge-wishlist', Icon: Heart },
  excluded: { label: 'Excluded', color: 'var(--excluded)', bgClass: 'badge-excluded', Icon: MinusCircle },
}

export default function DestinationCard({ dest, onEdit, onDelete }) {
  const cfg = STATUS_CONFIG[dest.status] || STATUS_CONFIG.wishlist
  const Icon = cfg.Icon

  return (
    <div className="dest-card">
      <div className="dest-card-header">
        <div>
          <div className="dest-card-name">{dest.name}</div>
          <div className="dest-card-location">
            {dest.city ? `${dest.city}, ` : ''}{dest.country}
            {dest.continent && <span style={{ color: 'var(--text-3)' }}> · {dest.continent}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(dest) }} title="Edit">
            <Edit2 size={13} />
          </button>
          <button className="btn-icon btn-danger" style={{ border: 'none', background: 'transparent', color: 'var(--text-3)' }}
            onClick={(e) => { e.stopPropagation(); onDelete(dest) }} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className={`badge ${cfg.bgClass}`}>
          <Icon size={10} />
          {cfg.label}
        </span>

        {dest.status === 'visited' && dest.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{dest.rating}/5</span>
          </div>
        )}

        {dest.status === 'wishlist' && (
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: dest.wishlist_priority >= n ? 'var(--wishlist)' : 'var(--border)',
              }} />
            ))}
          </div>
        )}

        {dest.want_to_return && dest.status === 'visited' && (
          <span className="badge badge-wishlist" style={{ fontSize: 10 }}>
            <Heart size={9} /> Return
          </span>
        )}
      </div>

      {(dest.tags || []).length > 0 && (
        <div className="dest-card-tags">
          {dest.tags.map(tag => (
            <span key={tag} className="badge badge-tag">{tag}</span>
          ))}
        </div>
      )}

      {dest.notes && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {dest.notes}
        </div>
      )}

      {dest.status === 'excluded' && dest.excluded_note && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--excluded)', fontStyle: 'italic' }}>
          {dest.excluded_note}
        </div>
      )}

      {dest.visit_date && (
        <div className="dest-card-meta">
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={11} /> {new Date(dest.visit_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  )
}
