import { Star } from 'lucide-react'

export default function StarRating({ value, onChange, readOnly }) {
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={18}
          className={`star${value >= n ? ' filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(n === value ? 0 : n)}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
          fill={value >= n ? '#f59e0b' : 'none'}
          color={value >= n ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  )
}
