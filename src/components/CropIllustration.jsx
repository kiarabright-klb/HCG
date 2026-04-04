import { CROPS_PER_PLOT } from '../context/AppContext';

/**
 * PlotSoilScene — warm illustrated SVG showing 10 crops in a 5×2 grid.
 * The Cellar (daisies) gets a special single-daisy petal-plucking scene.
 */
export default function PlotSoilScene({ crop, spent = 0, budget = 100 }) {
  const cropValue    = budget > 0 ? budget / CROPS_PER_PLOT : 1;
  const rawPlucked   = budget > 0 ? spent / cropValue : 0;
  const fullyPlucked = Math.min(Math.floor(rawPlucked), CROPS_PER_PLOT);
  const partialPct   = rawPlucked - Math.floor(rawPlucked);
  const overBudget   = spent > budget;

  // The Cellar: one single daisy with 10 pluckable petals
  if (crop === 'daisies') {
    return <SingleDaisyScene fullyPlucked={fullyPlucked} partialPct={partialPct} overBudget={overBudget} />;
  }

  // Standard 5×2 crop grid
  const cols = [10, 29, 48, 67, 86];
  const rows = [42, 70];
  const items = [];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 5; c++)
      items.push({ idx: r * 5 + c, x: cols[c], y: rows[r] });

  const CropFn   = CROP_FNS[crop] || CROP_FNS.tomatoes;
  const animClass = ANIM_CLASS[crop] || 'plantBob';

  return (
    <svg viewBox="0 0 96 80" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Warm rich soil */}
      <rect x="0" y="0" width="96" height="80" fill="#6B3F18" />
      <rect x="0" y="0" width="96" height="2"  fill="#7A4B20" />
      <rect x="0" y="52" width="96" height="1" fill="#4A2B10" opacity="0.5" />

      {overBudget ? (
        <CrackedSoil />
      ) : (
        items.map(({ idx, x, y }) => {
          let state;
          if (idx < fullyPlucked) state = 'plucked';
          else if (idx === fullyPlucked && partialPct > 0.05) state = 'plucking';
          else state = 'standing';

          return (
            <CropItem
              key={idx}
              x={x} y={y} idx={idx}
              state={state}
              partialPct={partialPct}
              CropFn={CropFn}
              animClass={animClass}
            />
          );
        })
      )}
    </svg>
  );
}

function CropItem({ x, y, idx, state, partialPct, CropFn, animClass }) {
  const delay = `${(idx * 0.2).toFixed(1)}s`;

  if (state === 'plucked') {
    return (
      <>
        <ellipse cx={x} cy={y - 1} rx={3} ry={1.5} fill="#3A1C08" />
        <rect x={x - 1} y={y - 5} width={2} height={5} fill="#5A3010" rx={1} />
      </>
    );
  }

  if (state === 'plucking') {
    return (
      <g transform={`rotate(${partialPct * 58}, ${x}, ${y})`} opacity={1 - partialPct * 0.4}>
        <CropFn x={x} y={y} />
      </g>
    );
  }

  // standing — animated
  return (
    <g className={animClass} style={{ '--delay': delay }}>
      <CropFn x={x} y={y} />
    </g>
  );
}

/* ── Cracked dry soil for over-budget ── */
function CrackedSoil() {
  return (
    <>
      <rect x="0" y="0" width="96" height="80" fill="#3A1C08" />
      <rect x="0" y="0" width="96" height="80" fill="#4A2410" opacity="0.7" />
      {/* crack network */}
      <line x1="8"  y1="10" x2="28" y2="22" stroke="#2A1208" strokeWidth="1.5" />
      <line x1="28" y1="22" x2="38" y2="18" stroke="#2A1208" strokeWidth="1" />
      <line x1="28" y1="22" x2="24" y2="36" stroke="#2A1208" strokeWidth="1.2" />
      <line x1="48" y1="6"  x2="62" y2="20" stroke="#2A1208" strokeWidth="1.5" />
      <line x1="62" y1="20" x2="76" y2="16" stroke="#2A1208" strokeWidth="1" />
      <line x1="62" y1="20" x2="58" y2="38" stroke="#2A1208" strokeWidth="1.2" />
      <line x1="12" y1="48" x2="36" y2="56" stroke="#2A1208" strokeWidth="1.5" />
      <line x1="50" y1="44" x2="68" y2="58" stroke="#2A1208" strokeWidth="1.5" />
      <line x1="68" y1="58" x2="80" y2="50" stroke="#2A1208" strokeWidth="1" />
      <line x1="78" y1="28" x2="88" y2="46" stroke="#2A1208" strokeWidth="1.2" />
      {/* dry stubs */}
      {[12, 32, 52, 72].map(x => (
        <g key={x}>
          <ellipse cx={x} cy={68} rx={3} ry={1.5} fill="#2A1208" />
          <rect x={x - 1} y={60} width={2} height={8} fill="#3A2008" rx={1} />
        </g>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   SINGLE DAISY SCENE — The Cellar
   10 petals plucked one by one as spending rises
   ═══════════════════════════════════════════════════ */
function SingleDaisyScene({ fullyPlucked, partialPct, overBudget }) {
  const cx = 48, cy = 42; // flower center
  const petalDist = 16;
  const petalAngles = Array.from({ length: 10 }, (_, i) => (i * 36) - 90); // 10 evenly spaced

  if (overBudget) {
    return (
      <svg viewBox="0 0 96 80" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect x="0" y="0" width="96" height="80" fill="#4A2410" />
        {/* bare drooping stem */}
        <line x1={cx} y1="80" x2={cx} y2={cy} stroke="#3A6018" strokeWidth="2" />
        {/* wilted center - grey */}
        <circle cx={cx} cy={cy} r="8" fill="#6B5830" />
        <circle cx={cx} cy={cy} r="4" fill="#4A3820" />
        {/* fallen petals on soil */}
        {[15, 35, 58, 72, 82, 25, 66, 45].map((px, i) => (
          <ellipse key={i} cx={px} cy={65 + (i % 3) * 4} rx="3" ry="1.2"
            fill="#C8C0A0" opacity={0.5} transform={`rotate(${px * 7}, ${px}, ${65 + (i%3)*4})`} />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 80" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Soil */}
      <rect x="0" y="0" width="96" height="80" fill="#6B3F18" />
      <rect x="0" y="0" width="96" height="2" fill="#7A4B20" />

      {/* Stem */}
      <rect x={cx - 1} y={cy} width="2" height="38" fill="#4A8220" rx="1" />
      {/* Leaves */}
      <ellipse cx={cx - 7} cy={cy + 12} rx="7" ry="2.5" fill="#5A9A30"
        transform={`rotate(-30, ${cx - 7}, ${cy + 12})`} />
      <ellipse cx={cx + 7} cy={cy + 22} rx="7" ry="2.5" fill="#4A8820"
        transform={`rotate(25, ${cx + 7}, ${cy + 22})`} />

      {/* Petals — standing ones animated */}
      {petalAngles.map((angleDeg, i) => {
        const rad = (angleDeg * Math.PI) / 180;
        const px  = cx + Math.cos(rad) * petalDist;
        const py  = cy + Math.sin(rad) * petalDist;

        if (i < fullyPlucked) {
          // fallen petal on soil
          const fx = 15 + (i * 8) % 70;
          const fy = 65 + (i % 2) * 6;
          return (
            <ellipse key={i} cx={fx} cy={fy} rx="3.5" ry="1.5"
              fill="#D8D0A8" opacity={0.6}
              transform={`rotate(${fx * 5}, ${fx}, ${fy})`} />
          );
        }

        const isPlucking = (i === fullyPlucked && partialPct > 0.05);
        const opacity    = isPlucking ? 1 - partialPct * 0.7 : 1;
        const tiltAngle  = isPlucking ? `rotate(${angleDeg + partialPct * 40}, ${cx}, ${cy})` : '';

        const petalEl = (
          <ellipse
            key={i}
            cx={px} cy={py}
            rx="4" ry="8"
            fill="#F0EDD8"
            stroke="#D8D0A8" strokeWidth="0.5"
            opacity={opacity}
            transform={`rotate(${angleDeg + 90}, ${px}, ${py})`}
          />
        );

        if (isPlucking) {
          return <g key={i} transform={tiltAngle}>{petalEl}</g>;
        }

        return (
          <g key={i} className="plantSway" style={{ '--delay': `${i * 0.22}s` }}>
            {petalEl}
          </g>
        );
      })}

      {/* Daisy center */}
      <circle cx={cx} cy={cy} r="9" fill="#E8B820" />
      <circle cx={cx} cy={cy} r="6" fill="#D4A010" />
      <circle cx={cx} cy={cy} r="3" fill="#B88808" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   ANIMATION CLASS ASSIGNMENTS
   ═══════════════════════════════════════════ */
const ANIM_CLASS = {
  sunflowers:  'plantBob',
  cabbages:    'plantBob',
  tomatoes:    'plantBob',
  watermelon:  'plantBob',
  carrots:     'plantBob',
  wheat:       'plantSway',
  grapevines:  'plantRustle',
  wildflowers: 'plantSway',
};

/* ═══════════════════════════════════════════
   ILLUSTRATED CROP SPRITES
   Each takes (x, y) where y = ground line.
   Uses circles, ellipses, rounded rects —
   warm Farmville 2 illustrated aesthetic.
   ═══════════════════════════════════════════ */

function Sunflower({ x, y }) {
  // Petals: 8 ellipses radiating from center
  const headY  = y - 20;
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a   = (i * 45 * Math.PI) / 180;
    const px  = x + Math.cos(a) * 7;
    const py  = headY + Math.sin(a) * 7;
    return { px, py, angle: i * 45 };
  });

  return (
    <>
      {/* stem */}
      <rect x={x - 1} y={headY} width={2} height={y - headY} fill="#4A8220" rx={1} />
      {/* leaves */}
      <ellipse cx={x - 5} cy={y - 13} rx={5} ry={2}
        fill="#5A9A30" transform={`rotate(-30, ${x - 5}, ${y - 13})`} />
      <ellipse cx={x + 5} cy={y - 8} rx={5} ry={2}
        fill="#5A9A30" transform={`rotate(30, ${x + 5}, ${y - 8})`} />
      {/* petals */}
      {petals.map(({ px, py, angle }) => (
        <ellipse key={angle} cx={px} cy={py} rx={2.5} ry={1.2}
          fill="#F5B820" transform={`rotate(${angle}, ${px}, ${py})`} />
      ))}
      {/* center */}
      <circle cx={x} cy={headY} r={4.5} fill="#3A1808" />
      <circle cx={x} cy={headY} r={2.5} fill="#2A1004" />
      <circle cx={x - 1} cy={headY - 1} r={1} fill="#4A2808" />
    </>
  );
}

function Cabbage({ x, y }) {
  return (
    <>
      {/* Outer leaves — pale green */}
      <ellipse cx={x - 3} cy={y - 7} rx={7} ry={4.5}
        fill="#A0C850" transform={`rotate(-18, ${x - 3}, ${y - 7})`} />
      <ellipse cx={x + 3} cy={y - 7} rx={7} ry={4.5}
        fill="#A0C850" transform={`rotate(18, ${x + 3}, ${y - 7})`} />
      {/* Mid leaves */}
      <ellipse cx={x} cy={y - 9} rx={6} ry={4}
        fill="#78B040" />
      <ellipse cx={x - 2} cy={y - 11} rx={4.5} ry={3.2}
        fill="#5A9030" />
      {/* Center head */}
      <circle cx={x} cy={y - 13} r={3.5} fill="#3A6828" />
      <circle cx={x - 1} cy={y - 14} r={1.5} fill="#4A7838" />
    </>
  );
}

function Grapevine({ x, y }) {
  return (
    <>
      {/* Post */}
      <rect x={x - 1} y={y - 22} width={2} height={22} fill="#8B5818" rx={1} />
      {/* Wire */}
      <rect x={x - 9} y={y - 17} width={18} height={1.5} fill="#7A4A10" rx={0.5} />
      {/* Left vine */}
      <rect x={x - 7} y={y - 17} width={1.5} height={10} fill="#4A8020" rx={0.5} />
      {/* Right vine */}
      <rect x={x + 5} y={y - 17} width={1.5} height={8}  fill="#4A8020" rx={0.5} />
      {/* Leaves */}
      <ellipse cx={x - 5} cy={y - 14} rx={4} ry={3.5} fill="#5A9830" />
      <ellipse cx={x + 7} cy={y - 13} rx={3.5} ry={3}  fill="#4A8828" />
      {/* Left grape cluster */}
      <circle cx={x - 7} cy={y - 10} r={2.2} fill="#7030A0" />
      <circle cx={x - 5} cy={y - 9}  r={2.2} fill="#8040B0" />
      <circle cx={x - 6} cy={y - 7}  r={2}   fill="#7030A0" />
      {/* Right grape cluster */}
      <circle cx={x + 5} cy={y - 9}  r={2.2} fill="#7030A0" />
      <circle cx={x + 7} cy={y - 8}  r={2}   fill="#8040B0" />
      <circle cx={x + 6} cy={y - 6}  r={1.8} fill="#7030A0" />
    </>
  );
}

function Wheat({ x, y }) {
  return (
    <>
      {/* Stem */}
      <rect x={x - 0.75} y={y - 24} width={1.5} height={24} fill="#A07828" rx={0.5} />
      {/* Nodes */}
      <ellipse cx={x} cy={y - 8}  rx={1.5} ry={1} fill="#B08830" />
      <ellipse cx={x} cy={y - 16} rx={1.5} ry={1} fill="#B08830" />
      {/* Side blades */}
      <rect x={x - 6} y={y - 11} width={6}  height={1.5} fill="#A08830" rx={0.5} />
      <rect x={x + 0.5} y={y - 7} width={5.5} height={1.5} fill="#A08830" rx={0.5} />
      {/* Grain head */}
      <ellipse cx={x} cy={y - 27} rx={2.8} ry={5} fill="#C8A030" />
      <ellipse cx={x} cy={y - 29} rx={1.8} ry={3} fill="#D8B840" />
      {/* Awns */}
      <rect x={x - 5} y={y - 28} width={4} height={1} fill="#C8A030" rx={0.5}
        transform={`rotate(-18, ${x - 3}, ${y - 28})`} />
      <rect x={x + 1} y={y - 26} width={4} height={1} fill="#C8A030" rx={0.5}
        transform={`rotate(18, ${x + 3}, ${y - 26})`} />
    </>
  );
}

function Tomato({ x, y }) {
  return (
    <>
      {/* Stem */}
      <rect x={x - 0.75} y={y - 18} width={1.5} height={12} fill="#4A8220" rx={0.5} />
      {/* Calyx leaves */}
      <ellipse cx={x - 2} cy={y - 20} rx={2.5} ry={1}
        fill="#5A9830" transform={`rotate(-35, ${x - 2}, ${y - 20})`} />
      <ellipse cx={x + 2} cy={y - 20} rx={2.5} ry={1}
        fill="#5A9830" transform={`rotate(35, ${x + 2}, ${y - 20})`} />
      <ellipse cx={x} cy={y - 21} rx={1.5} ry={2} fill="#5A9830" />
      {/* Fruit body */}
      <circle cx={x} cy={y - 26} r={6} fill="#D02A18" />
      <circle cx={x} cy={y - 26} r={5} fill="#E03020" />
      {/* Highlight */}
      <ellipse cx={x - 2} cy={y - 29} rx={1.5} ry={1} fill="#F05838" />
    </>
  );
}

function Watermelon({ x, y }) {
  // Whole round watermelon sitting on soil
  return (
    <>
      {/* Stem tendril */}
      <rect x={x - 0.5} y={y - 16} width={1} height={3} fill="#4A8020" rx={0.5} />
      {/* Main body */}
      <circle cx={x} cy={y - 8} r={8} fill="#2E8020" />
      {/* Stripes */}
      <ellipse cx={x - 2.5} cy={y - 8} rx={0.8} ry={7.5} fill="#1A5A12" />
      <ellipse cx={x + 2.5} cy={y - 8} rx={0.8} ry={7.5} fill="#1A5A12" />
      <ellipse cx={x}       cy={y - 8} rx={0.6} ry={7.5} fill="#1A5A12" />
      {/* Light underside */}
      <ellipse cx={x} cy={y - 2} rx={6} ry={2} fill="#A8C870" opacity={0.5} />
      {/* Shine */}
      <ellipse cx={x + 2} cy={y - 13} rx={1.5} ry={1} fill="#60B840" opacity={0.7} />
    </>
  );
}

function Carrot({ x, y }) {
  // Orange root emerging from soil, feathery green tops
  return (
    <>
      {/* Root body — tapering rect below ground */}
      <rect x={x - 3} y={y - 14} width={6} height={18} fill="#E06020" rx={3} />
      {/* Highlight stripe */}
      <rect x={x - 1} y={y - 13} width={2} height={14} fill="#F07828" rx={1} />
      {/* Root tip shadow */}
      <ellipse cx={x} cy={y + 3} rx={2} ry={1} fill="#B84810" opacity={0.5} />
      {/* Feathery tops */}
      <ellipse cx={x - 3} cy={y - 20} rx={2} ry={5.5}
        fill="#4A8820" transform={`rotate(-20, ${x - 3}, ${y - 20})`} />
      <ellipse cx={x} cy={y - 22} rx={2} ry={6}
        fill="#5A9A30" transform={`rotate(5, ${x}, ${y - 22})`} />
      <ellipse cx={x + 3} cy={y - 20} rx={2} ry={5}
        fill="#4A8820" transform={`rotate(25, ${x + 3}, ${y - 20})`} />
    </>
  );
}

function Wildflower({ x, y }) {
  // Color variety based on x position
  const palettes = [
    ['#F04080', '#F87090'],
    ['#E0A020', '#F0C040'],
    ['#8040C0', '#A060D8'],
    ['#3090D8', '#50B0F0'],
    ['#E05030', '#F07050'],
  ];
  const [petal, center] = palettes[Math.round(x * 0.37) % palettes.length];

  const petals = Array.from({ length: 5 }, (_, i) => {
    const a  = ((i * 72 - 90) * Math.PI) / 180;
    const px = x + Math.cos(a) * 6;
    const py = (y - 18) + Math.sin(a) * 6;
    return { px, py, angle: i * 72 - 90 };
  });

  return (
    <>
      {/* Stem */}
      <rect x={x - 0.75} y={y - 16} width={1.5} height={16} fill="#4A8220" rx={0.5} />
      {/* Side leaf */}
      <ellipse cx={x - 4} cy={y - 10} rx={4} ry={1.5}
        fill="#5A9A30" transform={`rotate(-25, ${x - 4}, ${y - 10})`} />
      {/* Petals */}
      {petals.map(({ px, py, angle }) => (
        <ellipse key={angle} cx={px} cy={py} rx={2} ry={3.5}
          fill={petal}
          transform={`rotate(${angle + 90}, ${px}, ${py})`} />
      ))}
      {/* Center */}
      <circle cx={x} cy={y - 18} r={2.5} fill="#F0D020" />
    </>
  );
}

const CROP_FNS = {
  sunflowers:  Sunflower,
  cabbages:    Cabbage,
  grapevines:  Grapevine,
  wheat:       Wheat,
  tomatoes:    Tomato,
  watermelon:  Watermelon,
  carrots:     Carrot,
  wildflowers: Wildflower,
};
