const ALL_TAGS = ['Beach', 'Mountains', 'City', 'Culture', 'Food', 'Adventure', 'Nature', 'History', 'Nightlife', 'Relaxation', 'Road Trip', 'Budget', 'Luxury']

export default function TagSelector({ selected = [], onChange }) {
  const toggle = (tag) => {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {ALL_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          className={`tag-option${selected.includes(tag) ? ' selected' : ''}`}
          onClick={() => toggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
