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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#5A9828' }}>

      {/* ── Warm illustrated header ── */}
      <div style={{
        background: 'linear-gradient(180deg, #F5EDD6 0%, #EDD9A8 100%)',
        borderBottom: '3px solid #C8A050',
        padding: '10px 14px 9px',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(80,40,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17,
              fontWeight: 700,
              color: '#5A3008',
              lineHeight: 1.1,
            }}>
              The Hancock Family Garden
            </div>
            <div style={{ fontSize: 11, color: '#8B6030', marginTop: 2, fontFamily: 'var(--font-sans)' }}>
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
            height: 8,
            background: 'rgba(90,48,8,0.15)',
            borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${overallPct * 100}%`,
              background: overallPct >= 1 ? '#C83020'
                        : overallPct >= 0.75 ? '#C08010'
                        : '#5A9820',
              borderRadius: 99,
              transition: 'width 0.5s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
            }} />
          </div>
          <span style={{
            fontSize: 10,
            color: overallPct >= 1 ? '#C03020' : '#7A5020',
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
          background: 'linear-gradient(180deg, #6EB030 0%, #4A8820 100%)',
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

  const statusColor = pct >= 1    ? '#D03020'
                    : pct >= 0.75 ? '#C07810'
                    : '#3A7018';
  const statusBg    = pct >= 1    ? '#F0C0B0'
                    : pct >= 0.75 ? '#F0D898'
                    : '#C8E898';

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
        background: '#C48030',
        border: '3px solid #8B5018',
        boxShadow: '0 3px 8px rgba(60,30,0,0.25), inset 0 1px 0 rgba(255,220,100,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Soil + crop area */}
        <div style={{
          background: '#5A3010',
          margin: 4,
          borderRadius: 8,
          overflow: 'hidden',
          aspectRatio: '1 / 0.88',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
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
            color: '#F5E8C0',
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
