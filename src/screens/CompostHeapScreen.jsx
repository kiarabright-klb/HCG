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
  const total = p1Count + p2Count;

  const fertilizer = total === 0
    ? null
    : p1Count >= p2Count
      ? { name: person1, count: p1Count, person: 'person1' }
      : { name: person2, count: p2Count, person: 'person2' };

  // Get all-time totals
  const allWeeks = Object.values(state.weeklyStats);
  const allTimeP1 = allWeeks.reduce((s, w) => s + (w.person1 || 0), 0);
  const allTimeP2 = allWeeks.reduce((s, w) => s + (w.person2 || 0), 0);

  // Which badges each person has earned this week
  const p1Badges = BADGES.filter(b => b.threshold > 0 && p1Count >= b.threshold);
  const p2Badges = BADGES.filter(b => b.threshold > 0 && p2Count >= b.threshold);

  const weekLabel = getWeekLabel();

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#F5EDD6',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #EDD9A8 0%, #E5CC90 100%)',
        borderBottom: '3px solid #C8A050',
        padding: '12px 16px 10px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 8px rgba(80,40,0,0.10)',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            fontWeight: 700,
            color: '#5A3008',
            lineHeight: 1,
          }}>The Compost Heap</h1>
          <p style={{ fontSize: 11, color: '#8B6030', marginTop: 3, fontFamily: 'var(--font-sans)' }}>
            Weekly leaderboard — {weekLabel}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 28 }}>♻️</div>
      </div>

      <div className="scroll-area" style={{ flex: 1, padding: '0 16px 24px' }}>

        {/* Fertilizer of the Week */}
        <FertilizerCard fertilizer={fertilizer} total={total} />

        {/* Weekly scoreboard */}
        <div style={{ marginTop: 16 }}>
          <SectionLabel>This Week's Score</SectionLabel>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <ScoreCard
              name={person1}
              count={p1Count}
              total={total}
              color="var(--green-mid)"
              bgColor="#C8DBA0"
              person="person1"
              badges={p1Badges}
            />
            <ScoreCard
              name={person2}
              count={p2Count}
              total={total}
              color="var(--terracotta)"
              bgColor="#F0C8A8"
              person="person2"
              badges={p2Badges}
            />
          </div>
        </div>

        {/* All-time tally */}
        <div style={{ marginTop: 16 }}>
          <SectionLabel>All-Time Transactions</SectionLabel>
          <div style={{
            marginTop: 8,
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}>
            <AllTimeBar name={person1} count={allTimeP1} other={allTimeP2} color="var(--green-mid)" />
            <AllTimeBar name={person2} count={allTimeP2} other={allTimeP1} color="var(--terracotta)" style={{ marginTop: 10 }}/>
          </div>
        </div>

        {/* Badge gallery */}
        <div style={{ marginTop: 16 }}>
          <SectionLabel>Badge Collection</SectionLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BADGES.map(badge => {
              const p1Has = p1Badges.some(b => b.id === badge.id);
              const p2Has = p2Badges.some(b => b.id === badge.id);
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

        {/* Past weeks archive */}
        <PastWeeksArchive weeklyStats={state.weeklyStats} person1={person1} person2={person2} currentWeek={week} />

      </div>
    </div>
  );
}

function FertilizerCard({ fertilizer, total }) {
  if (total === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        textAlign: 'center',
        border: '2px dashed var(--cream-dark)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🪣</div>
        <p style={{ fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic' }}>
          No transactions logged yet this week.<br/>
          Log some to see who earns Fertilizer of the Week!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: fertilizer.person === 'person1'
        ? 'linear-gradient(135deg, #C8DBA0, #E8F4C0)'
        : 'linear-gradient(135deg, #F0C8A8, #FAE0C0)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 6 }}>
        Fertilizer of the Week
      </div>
      <div style={{ fontSize: 36, marginBottom: 4 }}>🌱</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>
        {fertilizer.name}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 3 }}>
        {fertilizer.count} transaction{fertilizer.count !== 1 ? 's' : ''} logged this week
      </div>
    </div>
  );
}

function ScoreCard({ name, count, total, color, bgColor, badges }) {
  const pct = total > 0 ? count / total : 0.5;
  return (
    <div style={{
      flex: 1,
      background: 'rgba(255,255,255,0.65)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 12px',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)',
      border: `2px solid ${bgColor}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700, color,
        margin: '0 auto 8px',
      }}>{name.charAt(0).toUpperCase()}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--text-dark)' }}>{name}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, margin: '6px 0' }}>{count}</div>
      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>transactions</div>
      {/* Contribution bar */}
      <div style={{ marginTop: 10, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 99 }}/>
      </div>
      {/* Badges earned */}
      {badges.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {badges.map(b => (
            <span key={b.id} style={{ fontSize: 16 }} title={b.label}>{b.emoji}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function AllTimeBar({ name, count, other, color, style }) {
  const total = count + other;
  const pct = total > 0 ? count / total : 0.5;
  return (
    <div style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>{name}</span>
        <span style={{ color: 'var(--text-light)' }}>{count} total</span>
      </div>
      <div style={{ height: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 99 }}/>
      </div>
    </div>
  );
}

function BadgeRow({ badge, earned, earnedBy }) {
  return (
    <div style={{
      background: earned ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      opacity: earned ? 1 : 0.5,
    }}>
      <span style={{ fontSize: 24, width: 30, textAlign: 'center', flexShrink: 0 }}>{badge.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{badge.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{badge.desc}</div>
      </div>
      {earned && (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          {earnedBy.map(name => (
            <div key={name} style={{
              fontSize: 11, fontWeight: 700,
              color: 'var(--green-deep)',
              background: 'var(--green-pale)',
              padding: '2px 6px',
              borderRadius: 99,
              marginBottom: 2,
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
    <div style={{ marginTop: 16 }}>
      <SectionLabel>Past Weeks</SectionLabel>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pastWeeks.map(([week, stats]) => {
          const p1 = stats.person1 || 0;
          const p2 = stats.person2 || 0;
          const winner = p1 >= p2 ? person1 : person2;
          return (
            <div key={week} style={{
              background: 'rgba(255,255,255,0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{week}</span>
              <span style={{ fontSize: 12 }}>
                {person1} <strong>{p1}</strong> · {person2} <strong>{p2}</strong>
              </span>
              <span style={{ fontSize: 11, color: 'var(--green-mid)', fontWeight: 700 }}>🌱 {winner}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: 'var(--text-light)',
    }}>{children}</div>
  );
}

function getWeekLabel() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const fmt = d => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
}
