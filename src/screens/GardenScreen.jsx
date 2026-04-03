import { useApp, useCategorySpend, getPlotState } from '../context/AppContext';
import CropPlotScene from '../components/CropIllustration';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function GardenScreen({ onPlotTap }) {
  const { state } = useApp();
  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const month = now.toISOString().slice(0, 7);

  const totalBudget = state.categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent  = state.transactions
    .filter(t => t.date.startsWith(month))
    .reduce((s, t) => s + t.amount, 0);
  const overallPct = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#3A7220' }}>

      {/* ── Barn scene ── */}
      <BarnScene monthLabel={monthLabel} />

      {/* ── Budget strip ── */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>
          ${totalSpent.toFixed(0)} / ${totalBudget}
        </span>
        <div style={{ flex: 1, height: 7, background: 'rgba(0,0,0,0.3)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${overallPct * 100}%`,
            background: overallPct >= 1 ? '#E05030' : overallPct >= 0.75 ? '#D4A017' : '#90D050',
            borderRadius: 99,
            transition: 'width 0.5s ease',
            boxShadow: '0 0 6px rgba(255,255,255,0.3)',
          }} />
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>
          {Math.round(overallPct * 100)}%
        </span>
      </div>

      {/* ── Garden (scrollable) ── */}
      <div
        className="scroll-area"
        style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}
      >
        {/* Grass texture */}
        <div style={{
          minHeight: '100%',
          background: `
            radial-gradient(ellipse at 20% 30%, #4A8A28 0%, transparent 50%),
            radial-gradient(ellipse at 80% 60%, #3A7020 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, #4A8A28 0%, transparent 60%),
            #3D7A1E
          `,
          padding: '14px 12px 28px',
        }}>

          {/* Stone path + plot grid */}
          <div style={{ position: 'relative' }}>

            {/* Center stone path (vertical strip between the 2 columns) */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0, bottom: 0,
              width: 14,
              transform: 'translateX(-50%)',
              background: 'repeating-linear-gradient(180deg, #8B7355 0px, #9B8365 18px, #7A6245 18px, #8B7355 36px)',
              borderLeft: '1px solid rgba(0,0,0,0.2)',
              borderRight: '1px solid rgba(0,0,0,0.2)',
            }} />

            {/* Plot grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 14px' }}>
              {state.categories.map((cat, i) => (
                <PlotBed
                  key={cat.id}
                  category={cat}
                  style={i === state.categories.length - 1 && state.categories.length % 2 === 1
                    ? { gridColumn: '1 / -1', maxWidth: 'calc(50% - 7px)', margin: '0 auto' }
                    : {}}
                  onTap={() => onPlotTap(cat.id)}
                />
              ))}
            </div>
          </div>

          {/* Season note */}
          <SeasonNote />
        </div>
      </div>
    </div>
  );
}

/* ─── Barn Scene SVG ─── */
function BarnScene({ monthLabel }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, lineHeight: 0 }}>
      <svg
        viewBox="0 0 390 145"
        style={{ width: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#C8E8F8" />
          </linearGradient>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5AAA28" />
            <stop offset="100%" stopColor="#3A7A18" />
          </linearGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE060" />
            <stop offset="100%" stopColor="#F0B020" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="390" height="145" fill="url(#skyGrad)" />

        {/* Sun */}
        <circle cx="348" cy="30" r="20" fill="url(#sunGrad)" />
        {[0,45,90,135,180,225,270,315].map(a => {
          const r = a * Math.PI / 180;
          return <line key={a}
            x1={348 + Math.cos(r) * 24} y1={30 + Math.sin(r) * 24}
            x2={348 + Math.cos(r) * 30} y2={30 + Math.sin(r) * 30}
            stroke="#F0B020" strokeWidth="2" strokeLinecap="round" />;
        })}

        {/* Clouds */}
        <g opacity="0.9">
          <ellipse cx="58"  cy="32" rx="32" ry="14" fill="white" />
          <ellipse cx="78"  cy="25" rx="24" ry="14" fill="white" />
          <ellipse cx="38"  cy="30" rx="20" ry="12" fill="white" />
        </g>
        <g opacity="0.75">
          <ellipse cx="230" cy="42" rx="26" ry="11" fill="white" />
          <ellipse cx="250" cy="35" rx="19" ry="11" fill="white" />
          <ellipse cx="215" cy="40" rx="16" ry="9"  fill="white" />
        </g>

        {/* ── Left tree ── */}
        <rect x="18" y="78" width="9" height="46" rx="2" fill="#6B4423" />
        <circle cx="22" cy="70" r="26" fill="#3A7A20" />
        <circle cx="10" cy="80" r="17" fill="#4A8A28" />
        <circle cx="35" cy="75" r="15" fill="#4A8A28" />
        <circle cx="22" cy="60" r="16" fill="#5AA030" />

        {/* ── Right tree ── */}
        <rect x="363" y="82" width="9" height="42" rx="2" fill="#6B4423" />
        <circle cx="367" cy="74" r="22" fill="#3A7A20" />
        <circle cx="355" cy="83" r="15" fill="#4A8A28" />
        <circle cx="378" cy="80" r="14" fill="#4A8A28" />

        {/* ── Barn body ── */}
        <rect x="148" y="68" width="86" height="66" rx="1" fill="#C83030" />
        {/* Barn plank lines */}
        {[80, 90, 100, 110, 120].map(y => (
          <line key={y} x1="148" y1={y} x2="234" y2={y} stroke="#A82020" strokeWidth="0.8" opacity="0.5" />
        ))}
        {/* Barn roof (gambrel) */}
        <polygon points="136,68 191,22 254,68" fill="#7A1A1A" />
        <polygon points="152,68 191,38 230,68" fill="#9A2222" />
        {/* Roof ridge cap */}
        <line x1="191" y1="22" x2="191" y2="38" stroke="#5A1010" strokeWidth="2" />
        {/* Loft window */}
        <rect x="178" y="40" width="24" height="18" rx="2" fill="#F0D070" />
        <line x1="190" y1="40" x2="190" y2="58" stroke="#8B4513" strokeWidth="1.5" />
        <line x1="178" y1="49" x2="202" y2="49" stroke="#8B4513" strokeWidth="1.5" />
        <rect x="178" y="40" width="24" height="18" rx="2" fill="none" stroke="#8B4513" strokeWidth="1.5" />
        {/* Barn doors */}
        <rect x="160" y="100" width="28" height="34" fill="#8B4513" />
        <rect x="194" y="100" width="28" height="34" fill="#7A3C10" />
        <line x1="160" y1="100" x2="188" y2="134" stroke="#5C2A08" strokeWidth="1.8" />
        <line x1="188" y1="100" x2="160" y2="134" stroke="#5C2A08" strokeWidth="1.8" />
        <line x1="194" y1="100" x2="222" y2="134" stroke="#5C2A08" strokeWidth="1.8" />
        <line x1="222" y1="100" x2="194" y2="134" stroke="#5C2A08" strokeWidth="1.8" />
        {/* Door gap */}
        <line x1="188" y1="100" x2="194" y2="100" stroke="#3A1A04" strokeWidth="3" />
        <line x1="191" y1="100" x2="191" y2="134" stroke="#3A1A04" strokeWidth="2.5" />

        {/* ── Silos ── */}
        <rect x="238" y="76" width="20" height="58" rx="2" fill="#A8B4BC" />
        <ellipse cx="248" cy="76" rx="10" ry="5" fill="#C4D0D8" />
        <ellipse cx="248" cy="74" rx="10" ry="4" fill="#D0DCE4" />
        {[85,96,107,118].map(y => (
          <line key={y} x1="238" y1={y} x2="258" y2={y} stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
        ))}
        <rect x="262" y="84" width="16" height="50" rx="2" fill="#98A4AC" />
        <ellipse cx="270" cy="84" rx="8" ry="4" fill="#B8C4CC" />
        <ellipse cx="270" cy="82" rx="8" ry="3.5" fill="#C8D4DC" />

        {/* ── White picket fence ── */}
        {Array.from({ length: 20 }, (_, i) => (
          <g key={i}>
            <rect x={5 + i * 19} y="117" width="5" height="20" rx="1.5" fill="white" />
            <polygon points={`${5 + i * 19},117 ${7.5 + i * 19},111 ${10 + i * 19},117`} fill="white" />
          </g>
        ))}
        <rect x="5" y="122" width="380" height="3" rx="1" fill="white" />
        <rect x="5" y="129" width="380" height="3" rx="1" fill="white" />

        {/* ── Grass ── */}
        <rect x="0" y="132" width="390" height="13" fill="url(#grassGrad)" />
      </svg>

      {/* Title overlay */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,0.22)',
          borderRadius: 99,
          padding: '3px 14px',
        }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: 0.3,
          }}>The Hancock Family Garden</span>
          <span style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.65)',
            marginLeft: 8,
          }}>{monthLabel}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Plot Bed ─── */
function PlotBed({ category, onTap, style }) {
  const spent    = useCategorySpend(category.id);
  const plotState = getPlotState(spent, category.budget);
  const pct      = category.budget > 0 ? Math.min(spent / category.budget, 1) : 0;

  const stateColors = {
    flourishing: { sign: '#5A7A2A', signDark: '#3A5A10', bar: '#78C030', border: '#8B5E2A', soil: '#3A2008' },
    wilting:     { sign: '#8B6A00', signDark: '#6A4E00', bar: '#D4A017', border: '#8B5E2A', soil: '#3A2008' },
    dead:        { sign: '#7A3A10', signDark: '#5A2808', bar: '#C05030', border: '#8B5E2A', soil: '#2A1808' },
  };
  const c = stateColors[plotState];

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
        ...style,
      }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96) translateY(2px)'; }}
      onTouchEnd={e   => { e.currentTarget.style.transform = ''; }}
    >
      {/* Wooden frame + soil */}
      <div style={{
        background: `linear-gradient(to bottom, #A06B30, #6B4020)`,
        borderRadius: 5,
        padding: '5px 5px 4px',
        boxShadow: `3px 4px 0px #3A2008, 0 8px 24px rgba(0,0,0,0.55)`,
        border: '1.5px solid #C08040',
        width: '100%',
        position: 'relative',
      }}>
        {/* Corner posts */}
        {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 8, height: 8,
            background: '#D09050',
            borderRadius: '50%',
            border: '1px solid #8B5E2A',
            zIndex: 2,
            ...pos,
            ...(pos.top === 0 ? { top: -2 } : { bottom: -2 }),
            ...(pos.left === 0 ? { left: -2 } : { right: -2 }),
          }} />
        ))}

        {/* Soil area */}
        <div style={{
          background: `
            radial-gradient(ellipse at 30% 40%, #4A2A10 0%, transparent 60%),
            radial-gradient(ellipse at 70% 70%, #3A1A08 0%, transparent 50%),
            ${c.soil}
          `,
          borderRadius: 3,
          overflow: 'hidden',
          aspectRatio: '4/3',
          position: 'relative',
        }}>
          <CropPlotScene crop={category.crop} state={plotState} />

          {/* State glow overlay */}
          {plotState === 'flourishing' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(100,200,50,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}
          {plotState === 'dead' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(100,60,20,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}
        </div>
      </div>

      {/* Wooden sign label */}
      <div style={{
        background: `linear-gradient(to bottom, ${c.sign}, ${c.signDark})`,
        borderRadius: '0 0 6px 6px',
        padding: '6px 10px 8px',
        width: '100%',
        boxShadow: `0 4px 10px rgba(0,0,0,0.4)`,
        border: '1.5px solid rgba(0,0,0,0.2)',
        borderTop: 'none',
        position: 'relative',
      }}>
        {/* Sign post */}
        <div style={{
          position: 'absolute', bottom: -6, left: '50%',
          transform: 'translateX(-50%)',
          width: 6, height: 8,
          background: c.signDark,
          borderRadius: '0 0 2px 2px',
        }} />

        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.95)',
          lineHeight: 1,
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{category.name}</div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 99, overflow: 'hidden', marginBottom: 3 }}>
          <div style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: c.bar,
            borderRadius: 99,
            transition: 'width 0.5s ease',
            boxShadow: '0 0 4px rgba(255,255,255,0.4)',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
            <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>${spent.toFixed(0)}</span>
            {' '}/ ${category.budget}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
            {plotState === 'flourishing' ? '🌿' : plotState === 'wilting' ? '🥀' : '💀'}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Season Note ─── */
function SeasonNote() {
  const month = new Date().getMonth();
  const notes = [
    "January — roots run deep in the quiet cold.",
    "February — first seeds of the year, full of promise.",
    "March — the thaw begins. Plant something new.",
    "April — showers feed the garden.",
    "May — everything blooms at once.",
    "June — long days, full growth.",
    "July — harvest at its height.",
    "August — late summer richness.",
    "September — the harvest winds down.",
    "October — leaves turn, roots deepen.",
    "November — the garden rests.",
    "December — stillness before the new year.",
  ];
  return (
    <div style={{
      marginTop: 20,
      textAlign: 'center',
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 20,
    }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>
        {notes[month]}
      </p>
    </div>
  );
}
