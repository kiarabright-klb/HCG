import { useApp, useCategorySpend } from '../context/AppContext';
import PlotSoilScene from '../components/CropIllustration';

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

export default function GardenScreen({ onPlotTap }) {
  const { state } = useApp();
  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const month = now.toISOString().slice(0, 7);

  const totalBudget = state.categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent  = state.transactions
    .filter(t => t.date.startsWith(month))
    .reduce((s, t) => s + t.amount, 0);
  const overallPct  = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
  const remaining   = totalBudget - totalSpent;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#091608' }}>

      {/* ── Dark garden header ── */}
      <div style={{
        background: '#1A3418',
        borderBottom: '2px solid #2C4E24',
        padding: '10px 14px 9px',
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              fontWeight: 700,
              color: '#F0E4C0',
              lineHeight: 1.1,
            }}>
              The Hancock Family Garden
            </div>
            <div style={{ fontSize: 11, color: '#C8A860', marginTop: 2, fontFamily: 'var(--font-sans)' }}>
              {monthLabel} · {state.settings.person1} &amp; {state.settings.person2}
            </div>
          </div>
          {/* Decorative sunflower icon */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            {[0,45,90,135,180,225,270,315].map(a => {
              const r = (a * Math.PI) / 180;
              const px = 18 + Math.cos(r) * 12;
              const py = 18 + Math.sin(r) * 12;
              return <ellipse key={a} cx={px} cy={py} rx="3.5" ry="1.5"
                fill="#F5B820" transform={`rotate(${a}, ${px}, ${py})`} />;
            })}
            <circle cx="18" cy="18" r="7" fill="#6B3808" />
            <circle cx="18" cy="18" r="4" fill="#4A2404" />
            <rect x="17" y="26" width="2" height="9" fill="#4A8820" rx="1" />
          </svg>
        </div>

        {/* Overall budget bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1,
            height: 7,
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${overallPct * 100}%`,
              background: overallPct >= 1 ? '#D04030'
                        : overallPct >= 0.75 ? '#C08010'
                        : '#5A9A28',
              borderRadius: 99,
              transition: 'width 0.5s ease',
              boxShadow: '0 0 8px rgba(90,154,40,0.4)',
            }} />
          </div>
          <span style={{
            fontSize: 10,
            color: overallPct >= 1 ? '#E06040' : '#C8A860',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)',
          }}>
            {remaining >= 0
              ? `$${Math.round(remaining)} left`
              : `$${Math.round(-remaining)} over`}
          </span>
        </div>
      </div>

      {/* ── 3×3 plot grid on grass ── */}
      <div
        className="scroll-area"
        style={{
          flex: 1,
          background: '#091608',
          padding: '10px 8px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          alignContent: 'start',
        }}
      >
        {state.categories.map(cat => (
          <PlotBed key={cat.id} category={cat} onTap={() => onPlotTap(cat.id)} />
        ))}
      </div>
    </div>
  );
}

function PlotBed({ category, onTap }) {
  const spent = useCategorySpend(category.id);
  const pct   = category.budget > 0 ? spent / category.budget : 0;

  const statusColor = pct >= 1    ? '#F07050'
                    : pct >= 0.75 ? '#E0B030'
                    : '#78BD38';
  const statusBg    = pct >= 1    ? 'rgba(208,72,56,0.25)'
                    : pct >= 0.75 ? 'rgba(192,128,16,0.25)'
                    : 'rgba(90,154,40,0.2)';

  return (
    <button
      onClick={onTap}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Wooden raised bed frame */}
      <div style={{
        borderRadius: 13,
        background: '#7A4E18',
        border: '3px solid #4A2E0A',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,160,60,0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Soil + crop area */}
        <div style={{
          background: '#3A1C0A',
          margin: 4,
          borderRadius: 8,
          overflow: 'hidden',
          aspectRatio: '1 / 0.88',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
        }}>
          <PlotSoilScene
            crop={category.crop}
            spent={spent}
            budget={category.budget}
          />
        </div>

        {/* Plot label strip */}
        <div style={{
          padding: '3px 6px 5px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 8,
            fontWeight: 700,
            color: '#F0D8A0',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {category.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 7,
            fontWeight: 700,
            color: statusColor,
            background: statusBg,
            borderRadius: 4,
            padding: '1px 4px',
            alignSelf: 'flex-start',
          }}>
            ${Math.round(spent)} / ${category.budget}
          </div>
        </div>
      </div>
    </button>
  );
}
