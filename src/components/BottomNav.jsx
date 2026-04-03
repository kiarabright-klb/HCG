export default function BottomNav({ screen, onNavigate }) {
  const tabs = [
    { id: 'garden',   label: 'Garden',   icon: GardenIcon  },
    { id: 'compost',  label: 'Compost',  icon: CompostIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav style={{
      display: 'flex',
      background: 'var(--white)',
      borderTop: '1.5px solid var(--cream-dark)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      flexShrink: 0,
      boxShadow: '0 -2px 12px rgba(60,40,10,0.08)',
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = screen === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              flex: 1,
              padding: '10px 0 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: active ? 'var(--green-mid)' : 'var(--text-light)',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={22} filled={active} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function GardenIcon({ size, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="11" width="20" height="10" rx="2" fill={filled ? 'var(--green-mid)' : 'none'} stroke={filled ? 'var(--green-mid)' : 'currentColor'} strokeWidth="1.8"/>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke={filled ? 'var(--green-mid)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 3v2M6.5 5.5l1 1M17.5 5.5l-1 1" stroke={filled ? 'var(--green-mid)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function CompostIcon({ size, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3 6H9l3-6z" fill={filled ? 'var(--terracotta)' : 'none'} stroke={filled ? 'var(--terracotta)' : 'currentColor'} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="4" y="10" width="16" height="12" rx="2" fill={filled ? 'var(--brown-light)' : 'none'} stroke={filled ? 'var(--brown-light)' : 'currentColor'} strokeWidth="1.8"/>
      <path d="M8 15h8M8 18h5" stroke={filled ? 'var(--white)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function SettingsIcon({ size, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill={filled ? 'var(--green-mid)' : 'none'} stroke={filled ? 'var(--green-mid)' : 'currentColor'} strokeWidth="1.8"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={filled ? 'var(--green-mid)' : 'currentColor'} strokeWidth="1.8" fill={filled ? 'var(--green-pale)' : 'none'}/>
    </svg>
  );
}
