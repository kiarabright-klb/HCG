import { useApp, getWeekKey } from '../context/AppContext';

const BADGES = [
  { id: 'weed-puller',    label: 'Weed Puller',    emoji: '🌿', desc: 'First to log 3 transactions in a week',   threshold: 3  },
  { id: 'plot-protector', label: 'Plot Protector',  emoji: '🛡️',  desc: 'Kept all plots under 80% for a week',      threshold: 0  },
  { id: 'compost-king',   label: 'Compost King',    emoji: '♻️',  desc: 'Logged 5+ transactions in a single week',  threshold: 5  },
  { id: 'harvest-hero',   label: 'Harvest Hero',    emoji: '🌾', desc: 'Logged a transaction every day this week',  threshold: 7  },
];

export default function CompostHeapScreen() {
  const { state } = useApp();
  const { person1, person2 } = state.settings;

  const week = getWeekKey();
  const weekStats = state.weeklyStats[week] || { person1: 0, person2: 0 };

  const p1Count = weekStats.person1 || 0;
  const p2Count = weekStats.person2 || 0;
  const total   = p1Count + p2Count;

  const fertilizer = total === 0
    ? null
    : p1Count >= p2Count
      ? { name: person1, count: p1Count, person: 'person1' }
      : { name: person2, count: p2Count, person: 'person2' };

  const allWeeks   = Object.values(state.weeklyStats);
  const allTimeP1  = allWeeks.reduce((s, w) => s + (w.person1 || 0), 0);
  const allTimeP2  = allWeeks.reduce((s, w) => s + (w.person2 || 0), 0);

  const p1Badges   = BADGES.filter(b => b.threshold > 0 && p1Count >= b.threshold);
  const p2Badges   = BADGES.filter(b => b.threshold > 0 && p2Count >= b.threshold);
  const weekLabel  = getWeekLabel();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#091608', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        background: '#1A3418',
        borderBottom: '2px solid #2C4E24',
        padding: '12px 16px 10px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#F0E4C0', lineHeight: 1 }}>
            The Compost Heap
          </h1>
          <p style={{ fontSize: 11, color: '#C8A860', marginTop: 3, fontFamily: 'var(--font-sans)' }}>
            Weekly leaderboard — {weekLabel}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 26 }}>♻️</div>
      </div>

      <div className="scroll-area" style={{ flex: 1, padding: '12px 14px 24px' }}>

        {/* Fertilizer of the Week */}
        <FertilizerCard fertilizer={fertilizer} total={total} />

        {/* Weekly scoreboard */}
        <div style={{ marginTop: 14 }}>
          <SectionLabel>This Week's Score</SectionLabel>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <ScoreCard name={person1} count={p1Count} total={total} accentColor="#5A9A28" person="person1" badges={p1Badges} />
            <ScoreCard name={person2} count={p2Count} total={total} accentColor="#D04838" person="person2" badges={p2Badges} />
          </div>
        </div>

        {/* All-time */}
        <div style={{ marginTop: 14 }}>
          <SectionLabel>All-Time Transactions</SectionLabel>
          <div style={{ marginTop: 8, background: '#1A3418', borderRadius: 'var(--radius-md)', padding: '14px 16px', border: '1px solid #2C4E24' }}>
            <AllTimeBar name={person1} count={allTimeP1} other={allTimeP2} color="#5A9A28" />
            <AllTimeBar name={person2} count={allTimeP2} other={allTimeP1} color="#D04838" style={{ marginTop: 12 }} />
          </div>
        </div>

        {/* Badge gallery */}
        <div style={{ marginTop: 14 }}>
          <SectionLabel>Badge Collection</SectionLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BADGES.map(badge => {
              const p1Has  = p1Badges.some(b => b.id === badge.id);
              const p2Has  = p2Badges.some(b => b.id === badge.id);
              const earned = p1Has || p2Has;
              return (
                <BadgeRow
                  key={badge.id}
                  badge={badge}
                  earned={earned}
                  earnedBy={[p1Has ? person1 : null, p2Has ? person2 : null].filter(Boolean)}
                />
              );
            })}
          </div>
        </div>

        {/* Past weeks */}
        <PastWeeksArchive weeklyStats={state.weeklyStats} person1={person1} person2={person2} currentWeek={week} />

      </div>
    </div>
  );
}

function FertilizerCard({ fertilizer, total }) {
  if (total === 0) {
    return (
      <div style={{
        background: '#1A3418',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        textAlign: 'center',
        border: '1.5px dashed #2C4E24',
      }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>🪣</div>
        <p style={{ fontSize: 13, color: '#6A9858', fontStyle: 'italic' }}>
          No transactions logged yet this week.<br/>
          Log some to see who earns Fertilizer of the Week!
        </p>
      </div>
    );
  }

  const isP1   = fertilizer.person === 'person1';
  const glow   = isP1 ? 'rgba(90,154,40,0.15)' : 'rgba(208,72,56,0.15)';
  const border = isP1 ? '#2A5A1A' : '#5A2010';
  const nameColor = isP1 ? '#78BD38' : '#E07050';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${glow}, #1A3418)`,
      border: `1.5px solid ${border}`,
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      textAlign: 'center',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6A9858', marginBottom: 6 }}>
        Fertilizer of the Week
      </div>
      <div style={{ fontSize: 34, marginBottom: 4 }}>🌱</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: nameColor }}>
        {fertilizer.name}
      </div>
      <div style={{ fontSize: 13, color: '#C8A860', marginTop: 3 }}>
        {fertilizer.count} transaction{fertilizer.count !== 1 ? 's' : ''} logged this week
      </div>
    </div>
  );
}

function ScoreCard({ name, count, total, accentColor, badges }) {
  const pct = total > 0 ? count / total : 0.5;
  return (
    <div style={{
      flex: 1,
      background: '#1A3418',
      borderRadius: 'var(--radius-md)',
      padding: '14px 12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      border: '1px solid #2C4E24',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: `rgba(${accentColor === '#5A9A28' ? '90,154,40' : '208,72,56'},0.2)`,
        border: `2px solid ${accentColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, color: accentColor,
        margin: '0 auto 8px',
      }}>{name.charAt(0).toUpperCase()}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 700, color: '#F0E4C0' }}>{name}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accentColor, margin: '6px 0' }}>{count}</div>
      <div style={{ fontSize: 11, color: '#6A9858' }}>transactions</div>
      <div style={{ marginTop: 10, height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: accentColor, borderRadius: 99 }} />
      </div>
      {badges.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {badges.map(b => <span key={b.id} style={{ fontSize: 16 }} title={b.label}>{b.emoji}</span>)}
        </div>
      )}
    </div>
  );
}

function AllTimeBar({ name, count, other, color, style }) {
  const total = count + other;
  const pct   = total > 0 ? count / total : 0.5;
  return (
    <div style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: '#F0E4C0' }}>{name}</span>
        <span style={{ color: '#C8A860' }}>{count} total</span>
      </div>
      <div style={{ height: 7, background: 'rgba(0,0,0,0.35)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function BadgeRow({ badge, earned, earnedBy }) {
  return (
    <div style={{
      background: earned ? '#1A3418' : 'rgba(26,52,24,0.4)',
      border: `1px solid ${earned ? '#2C4E24' : '#1A3018'}`,
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      opacity: earned ? 1 : 0.45,
    }}>
      <span style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }}>{badge.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#F0E4C0' }}>{badge.label}</div>
        <div style={{ fontSize: 11, color: '#6A9858', marginTop: 2 }}>{badge.desc}</div>
      </div>
      {earned && (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {earnedBy.map(name => (
            <div key={name} style={{
              fontSize: 10, fontWeight: 700, color: '#78BD38',
              background: 'rgba(90,154,40,0.15)',
              border: '1px solid #2C4E24',
              padding: '2px 6px', borderRadius: 99, marginBottom: 2,
            }}>{name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function PastWeeksArchive({ weeklyStats, person1, person2, currentWeek }) {
  const pastWeeks = Object.entries(weeklyStats)
    .filter(([k]) => k !== currentWeek)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4);

  if (pastWeeks.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <SectionLabel>Past Weeks</SectionLabel>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pastWeeks.map(([week, stats]) => {
          const p1     = stats.person1 || 0;
          const p2     = stats.person2 || 0;
          const winner = p1 >= p2 ? person1 : person2;
          return (
            <div key={week} style={{
              background: 'rgba(26,52,24,0.5)',
              border: '1px solid #1A3018',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: '#6A9858' }}>{week}</span>
              <span style={{ fontSize: 12, color: '#C8A860' }}>
                {person1} <strong style={{ color: '#F0E4C0' }}>{p1}</strong> · {person2} <strong style={{ color: '#F0E4C0' }}>{p2}</strong>
              </span>
              <span style={{ fontSize: 10, color: '#78BD38', fontWeight: 700 }}>🌱 {winner}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6A9858' }}>
      {children}
    </div>
  );
}

function getWeekLabel() {
  const now        = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const fmt = d => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
}
