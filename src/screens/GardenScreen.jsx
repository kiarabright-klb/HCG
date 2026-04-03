import { useApp, useCategorySpend, getPlotState } from '../context/AppContext';
import CropIllustration from '../components/CropIllustration';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function GardenScreen({ onPlotTap }) {
  const { state } = useApp();
  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const totalBudget = state.categories.reduce((s, c) => s + c.budget, 0);
  const month = now.toISOString().slice(0, 7);
  const totalSpent = state.transactions
    .filter(t => t.date.startsWith(month))
    .reduce((s, t) => s + t.amount, 0);
  const overallPct = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #D6E8A8 0%, #F5EDD6 35%)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 10px',
        background: 'transparent',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--green-deep)',
            lineHeight: 1,
          }}>
            The Garden
          </h1>
          <span style={{
            fontSize: 12,
            color: 'var(--text-light)',
            fontWeight: 400,
            letterSpacing: 0.5,
          }}>{monthLabel}</span>
        </div>

        {/* Overall budget bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 5,
            fontSize: 12,
          }}>
            <span style={{ color: 'var(--text-light)' }}>Monthly budget</span>
            <span style={{ fontWeight: 700, color: overallPct >= 1 ? 'var(--terracotta)' : 'var(--green-deep)' }}>
              ${totalSpent.toFixed(0)} / ${totalBudget.toFixed(0)}
            </span>
          </div>
          <div style={{
            height: 8,
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${overallPct * 100}%`,
              background: overallPct >= 1
                ? 'var(--terracotta)'
                : overallPct >= 0.75
                  ? 'var(--amber)'
                  : 'var(--green-mid)',
              borderRadius: 99,
              transition: 'width 0.4s ease',
            }}/>
          </div>
        </div>
      </div>

      {/* Garden grid */}
      <div className="scroll-area" style={{ flex: 1, padding: '8px 16px 16px' }}>
        <GardenGrid categories={state.categories} onPlotTap={onPlotTap} />

        {/* Seasonal flavor text */}
        <SeasonNote />
      </div>
    </div>
  );
}

function GardenGrid({ categories, onPlotTap }) {
  // 2-column grid with last item centered if odd
  const rows = [];
  for (let i = 0; i < categories.length; i += 2) {
    rows.push(categories.slice(i, i + 2));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{
          display: 'flex',
          gap: 12,
          justifyContent: row.length === 1 ? 'center' : 'stretch',
        }}>
          {row.map(cat => (
            <PlotCard key={cat.id} category={cat} onTap={() => onPlotTap(cat.id)} solo={row.length === 1}/>
          ))}
        </div>
      ))}
    </div>
  );
}

function PlotCard({ category, onTap, solo }) {
  const spent = useCategorySpend(category.id);
  const plotState = getPlotState(spent, category.budget);
  const pct = category.budget > 0 ? Math.min(spent / category.budget, 1) : 0;

  const stateConfig = {
    flourishing: { bg: '#E8F4D0', border: '#A8C870', label: 'Flourishing', labelColor: 'var(--green-deep)' },
    wilting:     { bg: '#FFF4D0', border: '#D4A017', label: 'Wilting',      labelColor: '#8B6000' },
    dead:        { bg: '#F4E0D0', border: '#C4704A', label: 'Withered',     labelColor: 'var(--terracotta)' },
  };
  const cfg = stateConfig[plotState];

  return (
    <button
      onClick={onTap}
      style={{
        flex: solo ? '0 0 calc(50% - 6px)' : 1,
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 10px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        cursor: 'pointer',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* State badge */}
      <div style={{
        position: 'absolute',
        top: 7,
        right: 8,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: cfg.labelColor,
        opacity: 0.8,
      }}>{cfg.label}</div>

      {/* Crop illustration */}
      <div style={{ marginTop: 4 }}>
        <CropIllustration crop={category.crop} state={plotState} size={80} />
      </div>

      {/* Category name */}
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-dark)',
        lineHeight: 1.2,
      }}>{category.name}</div>

      {/* Budget amount */}
      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
        <span style={{ fontWeight: 700, color: pct >= 1 ? 'var(--terracotta)' : 'var(--text-dark)' }}>
          ${spent.toFixed(0)}
        </span>
        {' '}/{' '}${category.budget}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: 5,
        background: 'rgba(0,0,0,0.1)',
        borderRadius: 99,
        overflow: 'hidden',
        marginTop: 2,
      }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: plotState === 'dead'
            ? 'var(--terracotta)'
            : plotState === 'wilting'
              ? 'var(--amber)'
              : 'var(--green-mid)',
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }}/>
      </div>
    </button>
  );
}

function SeasonNote() {
  const month = new Date().getMonth();
  const notes = [
    "January — quiet days, root growth below.", // 0
    "February — first seeds of intention.", // 1
    "March — the thaw begins, time to plant.", // 2
    "April — showers feed the garden.", // 3
    "May — everything blooms at once.", // 4
    "June — long light, full growth.", // 5
    "July — harvest at its height.", // 6
    "August — late summer richness.", // 7
    "September — the harvest winds down.", // 8
    "October — leaves turn, roots deepen.", // 9
    "November — the garden rests.", // 10
    "December — stillness before the new year.", // 11
  ];
  return (
    <div style={{
      marginTop: 16,
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.5)',
      borderRadius: 'var(--radius-sm)',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic' }}>
        {notes[month]}
      </p>
    </div>
  );
}
