import { useApp, useCategorySpend } from '../context/AppContext';
import PlotSoilScene from '../components/CropIllustration';

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
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#1A0E04',
      fontFamily: "'Press Start 2P', monospace",
    }}>

      {/* ── Pixel Art Header ── */}
      <div style={{
        background: '#1C3A10',
        borderBottom: '4px solid #0C1E08',
        padding: '10px 12px 8px',
        flexShrink: 0,
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <div>
            <div style={{
              fontSize: 9,
              color: '#A0D050',
              textShadow: '1px 1px 0 #0C1E08',
              letterSpacing: 0,
              lineHeight: 1.4,
            }}>
              HANCOCK
            </div>
            <div style={{
              fontSize: 7,
              color: '#608830',
              letterSpacing: 0,
              lineHeight: 1.4,
            }}>
              FAMILY GARDEN
            </div>
          </div>
          <div style={{
            fontSize: 6,
            color: '#80A840',
            textAlign: 'right',
            lineHeight: 1.6,
          }}>
            <div>{monthLabel.toUpperCase()}</div>
            <div style={{ color: '#50782A' }}>
              {state.settings.person1} &amp; {state.settings.person2}
            </div>
          </div>
        </div>

        {/* Overall budget bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 6, background: '#0C1E08', position: 'relative', imageRendering: 'pixelated' }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0,
              height: '100%',
              width: `${overallPct * 100}%`,
              background: overallPct >= 1 ? '#C03020' : overallPct >= 0.75 ? '#C0880A' : '#50A020',
              transition: 'width 0.4s steps(20)',
            }} />
          </div>
          <span style={{ fontSize: 5, color: '#608830', whiteSpace: 'nowrap' }}>
            ${Math.round(totalSpent)} / ${Math.round(totalBudget)}
          </span>
        </div>
      </div>

      {/* ── 3×3 Grid ── */}
      <div
        className="scroll-area"
        style={{
          flex: 1,
          padding: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
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
  const pct = category.budget > 0 ? spent / category.budget : 0;

  const signColor = pct >= 1 ? '#C03020' : pct >= 0.75 ? '#A07010' : '#2A6010';
  const signBg    = pct >= 1 ? '#FF6040' : pct >= 0.75 ? '#E0A020' : '#50A020';

  return (
    <button
      onClick={onTap}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Wooden pixel frame + soil bed */}
      <div style={{
        width: '100%',
        aspectRatio: '1 / 0.9',
        background: '#5C3A18',      /* wood frame */
        border: '3px solid #3A2008',
        padding: 3,
        position: 'relative',
        imageRendering: 'pixelated',
      }}>
        {/* inner soil */}
        <div style={{
          width: '100%',
          height: '100%',
          background: '#4A2810',
          overflow: 'hidden',
        }}>
          <PlotSoilScene
            crop={category.crop}
            spent={spent}
            budget={category.budget}
          />
        </div>

        {/* State dot — pixel indicator top-right */}
        <div style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 6,
          height: 6,
          background: signBg,
          border: `1px solid ${signColor}`,
          imageRendering: 'pixelated',
        }} />
      </div>

      {/* Label below the bed */}
      <div style={{
        width: '100%',
        background: '#2A1608',
        borderTop: '2px solid #1A0C04',
        padding: '3px 4px',
        overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 5,
          color: '#A0784A',
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'clip',
        }}>
          {category.name.toUpperCase()}
        </div>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 4,
          color: pct >= 1 ? '#FF6040' : pct >= 0.75 ? '#E0A020' : '#608030',
          lineHeight: 1.5,
          marginTop: 1,
        }}>
          ${Math.round(spent)} / ${category.budget}
        </div>
      </div>
    </button>
  );
}
