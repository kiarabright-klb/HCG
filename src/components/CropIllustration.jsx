import { CROPS_PER_PLOT } from '../context/AppContext';

/**
 * PlotSoilScene — pixel art SVG showing 10 crops in a 5×2 grid.
 * Each crop can be: standing (animated), plucking (tilting), plucked (stub), or dead (cracked soil).
 */
export default function PlotSoilScene({ crop, spent = 0, budget = 100 }) {
  const cropValue  = budget > 0 ? budget / CROPS_PER_PLOT : 1;
  const rawPlucked = budget > 0 ? spent / cropValue : 0;
  const fullyPlucked = Math.min(Math.floor(rawPlucked), CROPS_PER_PLOT);
  const partialPct   = rawPlucked - Math.floor(rawPlucked);
  const overBudget   = spent > budget;

  // Grid: 5 cols × 2 rows = 10 items
  const cols = [10, 29, 48, 67, 86];
  const rows = [38, 70];
  const items = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      items.push({ idx: r * 5 + c, x: cols[c], y: rows[r] });
    }
  }

  const CropFn = CROP_FNS[crop] || CROP_FNS.tomatoes;

  return (
    <svg
      viewBox="0 0 96 80"
      style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
      shapeRendering="crispEdges"
    >
      {/* Soil background */}
      <rect x="0" y="0" width="96" height="80" fill="#3A1F08" />
      <rect x="0" y="0" width="96" height="80" fill="#4A2810" />
      {/* Soil rows */}
      <rect x="2" y="48" width="92" height="2" fill="#3A1F08" />
      <rect x="2" y="16" width="92" height="1" fill="#5A3418" opacity="0.5" />
      <rect x="2" y="58" width="92" height="1" fill="#5A3418" opacity="0.5" />

      {overBudget ? (
        <CrackedSoil />
      ) : (
        items.map(({ idx, x, y }) => {
          let itemState;
          if (idx < fullyPlucked) itemState = 'plucked';
          else if (idx === fullyPlucked && partialPct > 0.05) itemState = 'plucking';
          else itemState = 'standing';

          return (
            <CropItem
              key={idx}
              x={x} y={y} idx={idx}
              state={itemState}
              partialPct={partialPct}
              CropFn={CropFn}
              crop={crop}
            />
          );
        })
      )}
    </svg>
  );
}

function CropItem({ x, y, idx, state, partialPct, CropFn, crop }) {
  const animClass = ANIM_CLASS[crop] || 'pixelBob';
  const delay = `${(idx * 0.18).toFixed(2)}s`;

  if (state === 'plucked') {
    // bare brown stub
    return <rect x={x - 1} y={y - 5} width={3} height={5} fill="#5C3A18" />;
  }

  if (state === 'plucking') {
    const tiltAngle = partialPct * 65;
    const opacity   = 1 - partialPct * 0.4;
    return (
      <g
        transform={`rotate(${tiltAngle}, ${x}, ${y})`}
        opacity={opacity}
      >
        <CropFn x={x} y={y} />
      </g>
    );
  }

  // standing — animated
  return (
    <g
      className={animClass}
      style={{ '--delay': delay }}
    >
      <CropFn x={x} y={y} />
    </g>
  );
}

/* ── Animation class assignments ── */
const ANIM_CLASS = {
  sunflowers:  'pixelBob',
  tomatoes:    'pixelBob',
  daisies:     'pixelBob',
  roses:       'pixelBob',
  lavender:    'pixelSway',
  wheat:       'pixelSway',
  chamomile:   'pixelSway',
  grapevines:  'pixelRustle',
  wildflowers: 'pixelRustle',
};

/* ── Cracked soil for over-budget ── */
function CrackedSoil() {
  return (
    <>
      <rect x="0" y="0" width="96" height="80" fill="#2A1008" />
      <rect x="0" y="0" width="96" height="80" fill="#3A1C08" />
      {/* Crack lines */}
      <rect x="10" y="12" width="18" height="2" fill="#1A0C04" />
      <rect x="27" y="14" width="2"  height="10" fill="#1A0C04" />
      <rect x="27" y="22" width="12" height="2"  fill="#1A0C04" />
      <rect x="50" y="8"  width="2"  height="14" fill="#1A0C04" />
      <rect x="52" y="8"  width="12" height="2"  fill="#1A0C04" />
      <rect x="70" y="18" width="16" height="2"  fill="#1A0C04" />
      <rect x="70" y="20" width="2"  height="8"  fill="#1A0C04" />
      <rect x="16" y="44" width="20" height="2"  fill="#1A0C04" />
      <rect x="36" y="44" width="2"  height="12" fill="#1A0C04" />
      <rect x="55" y="38" width="2"  height="16" fill="#1A0C04" />
      <rect x="55" y="52" width="14" height="2"  fill="#1A0C04" />
      <rect x="74" y="48" width="14" height="2"  fill="#1A0C04" />
      <rect x="74" y="50" width="2"  height="10" fill="#1A0C04" />
      {/* Dry stubs */}
      {[14, 34, 54, 74].map(x => (
        <g key={x}>
          <rect x={x}   y={66} width={2} height={8}  fill="#5C3A18" />
          <rect x={x-2} y={68} width={4} height={2}  fill="#3A2010" />
        </g>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════
   PIXEL ART CROP SPRITES
   Each sprite: (x, y) = base ground point
   All shapes drawn relative to (x, y)
   ═══════════════════════════════════════════ */

/* ── SUNFLOWERS ── */
function Sunflower({ x, y }) {
  const stemColor  = '#4A7820';
  const petalColor = '#D4A017';
  const centerColor = '#3A1A06';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-18} width={2} height={18} fill={stemColor} />
      {/* leaves */}
      <rect x={x-5} y={y-12} width={5} height={2} fill={stemColor} />
      <rect x={x+1}  y={y-8}  width={4} height={2} fill={stemColor} />
      {/* petals */}
      <rect x={x-4} y={y-24} width={2} height={4} fill={petalColor} />
      <rect x={x+2}  y={y-24} width={2} height={4} fill={petalColor} />
      <rect x={x-6} y={y-20} width={4} height={2} fill={petalColor} />
      <rect x={x+2}  y={y-20} width={4} height={2} fill={petalColor} />
      <rect x={x-4} y={y-20} width={2} height={2} fill={petalColor} />
      <rect x={x+2}  y={y-22} width={2} height={2} fill={petalColor} />
      {/* center */}
      <rect x={x-2} y={y-22} width={4} height={4} fill={centerColor} />
      <rect x={x-1} y={y-23} width={2} height={6} fill={centerColor} />
    </>
  );
}

/* ── LAVENDER ── */
function Lavender({ x, y }) {
  const stemColor = '#607840';
  const budColor  = '#9060C8';
  const budLight  = '#B080E0';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-16} width={2} height={16} fill={stemColor} />
      {/* side stems */}
      <rect x={x-3} y={y-12} width={3} height={2} fill={stemColor} />
      <rect x={x+1}  y={y-9}  width={3} height={2} fill={stemColor} />
      {/* buds on main */}
      {[0,2,4,6].map(i => (
        <rect key={i} x={x + (i%2===0 ? -2 : 1)} y={y-16+i} width={2} height={2} fill={i<3 ? budColor : budLight} />
      ))}
      {/* left spike */}
      <rect x={x-4} y={y-14} width={2} height={2} fill={budColor} />
      <rect x={x-4} y={y-12} width={2} height={2} fill={budLight} />
      {/* right spike */}
      <rect x={x+2}  y={y-11} width={2} height={2} fill={budColor} />
      <rect x={x+2}  y={y-9}  width={2} height={2} fill={budLight} />
    </>
  );
}

/* ── GRAPEVINES ── */
function Grapevine({ x, y }) {
  const vineColor  = '#4A6020';
  const grapeColor = '#602080';
  const grapeLight = '#8040A0';
  return (
    <>
      {/* post */}
      <rect x={x-1} y={y-20} width={2} height={20} fill="#7A5020" />
      {/* horizontal wire */}
      <rect x={x-8} y={y-16} width={16} height={1} fill="#5A3810" />
      {/* vines */}
      <rect x={x-6} y={y-16} width={2} height={10} fill={vineColor} />
      <rect x={x+4}  y={y-16} width={2} height={8}  fill={vineColor} />
      <rect x={x-8} y={y-14} width={4} height={2}  fill={vineColor} />
      <rect x={x+4}  y={y-12} width={4} height={2}  fill={vineColor} />
      {/* grape clusters */}
      <rect x={x-8} y={y-12} width={4} height={2} fill={grapeColor} />
      <rect x={x-7} y={y-10} width={2} height={2} fill={grapeLight} />
      <rect x={x+4}  y={y-10} width={4} height={2} fill={grapeColor} />
      <rect x={x+5}  y={y-8}  width={2} height={2} fill={grapeLight} />
      <rect x={x-2}  y={y-6}  width={4} height={2} fill={grapeColor} />
      <rect x={x-1}  y={y-4}  width={2} height={2} fill={grapeLight} />
    </>
  );
}

/* ── WHEAT ── */
function Wheat({ x, y }) {
  const stemColor  = '#A07828';
  const grainColor = '#C4A030';
  const grainLight = '#E8C040';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-20} width={2} height={20} fill={stemColor} />
      {/* nodes */}
      <rect x={x-1} y={y-7}  width={2} height={2} fill={grainColor} />
      <rect x={x-1} y={y-14} width={2} height={2} fill={grainColor} />
      {/* leaf blades */}
      <rect x={x-6} y={y-10} width={6} height={2} fill={stemColor} />
      <rect x={x+1}  y={y-6}  width={5} height={2} fill={stemColor} />
      {/* grain head */}
      <rect x={x-2} y={y-26} width={4} height={8} fill={grainColor} />
      <rect x={x-1} y={y-28} width={2} height={4} fill={grainLight} />
      {/* awns */}
      <rect x={x-4} y={y-26} width={2} height={1} fill={grainLight} />
      <rect x={x+2}  y={y-24} width={2} height={1} fill={grainLight} />
      <rect x={x-4} y={y-22} width={2} height={1} fill={grainColor} />
      <rect x={x+2}  y={y-20} width={2} height={1} fill={grainColor} />
    </>
  );
}

/* ── TOMATOES ── */
function Tomato({ x, y }) {
  const stemColor  = '#4A7820';
  const leafColor  = '#3A6018';
  const fruitColor = '#C04028';
  const fruitLight = '#E06040';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-20} width={2} height={20} fill={stemColor} />
      {/* leaves */}
      <rect x={x-6} y={y-14} width={6} height={2} fill={leafColor} />
      <rect x={x-6} y={y-16} width={4} height={2} fill={leafColor} />
      <rect x={x+1}  y={y-10} width={5} height={2} fill={leafColor} />
      <rect x={x+1}  y={y-12} width={3} height={2} fill={leafColor} />
      {/* calyx */}
      <rect x={x-3} y={y-22} width={6} height={2} fill={leafColor} />
      {/* main fruit */}
      <rect x={x-4} y={y-28} width={8} height={6} fill={fruitColor} />
      <rect x={x-5} y={y-26} width={10} height={2} fill={fruitColor} />
      <rect x={x-3} y={y-30} width={6} height={2} fill={fruitColor} />
      {/* highlight */}
      <rect x={x-3} y={y-29} width={2} height={2} fill={fruitLight} />
    </>
  );
}

/* ── WILDFLOWERS ── */
function Wildflower({ x, y }) {
  const stemColor   = '#4A8030';
  const petalColors = ['#E06080', '#C850A0', '#9060D0', '#F0A030', '#E05060'];
  // use x as seed for color variety
  const ci = Math.abs(Math.round(x * 3.7)) % petalColors.length;
  const petal = petalColors[ci];
  const center = '#F8E040';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-16} width={2} height={16} fill={stemColor} />
      {/* leaf */}
      <rect x={x-5} y={y-10} width={5} height={2} fill={stemColor} />
      {/* petals (4 directions) */}
      <rect x={x-1} y={y-24} width={2} height={4} fill={petal} />
      <rect x={x-1} y={y-20} width={2} height={4} fill={petal} />
      <rect x={x-6} y={y-21} width={4} height={2} fill={petal} />
      <rect x={x+2}  y={y-21} width={4} height={2} fill={petal} />
      {/* diagonal hints */}
      <rect x={x-4} y={y-23} width={2} height={2} fill={petal} opacity={0.8} />
      <rect x={x+2}  y={y-23} width={2} height={2} fill={petal} opacity={0.8} />
      {/* center */}
      <rect x={x-1} y={y-22} width={2} height={2} fill={center} />
    </>
  );
}

/* ── DAISIES ── */
function Daisy({ x, y }) {
  const stemColor  = '#4A7020';
  const petalColor = '#F8F8E0';
  const center     = '#E0B020';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-14} width={2} height={14} fill={stemColor} />
      {/* leaf */}
      <rect x={x-4} y={y-9} width={4} height={2} fill={stemColor} />
      {/* petals */}
      <rect x={x-1} y={y-22} width={2} height={4} fill={petalColor} />
      <rect x={x-1} y={y-18} width={2} height={4} fill={petalColor} />
      <rect x={x-5} y={y-19} width={4} height={2} fill={petalColor} />
      <rect x={x+1}  y={y-19} width={4} height={2} fill={petalColor} />
      {/* diagonals */}
      <rect x={x-4} y={y-22} width={2} height={2} fill={petalColor} />
      <rect x={x+2}  y={y-22} width={2} height={2} fill={petalColor} />
      <rect x={x-4} y={y-18} width={2} height={2} fill={petalColor} />
      <rect x={x+2}  y={y-18} width={2} height={2} fill={petalColor} />
      {/* center */}
      <rect x={x-2} y={y-21} width={4} height={4} fill={center} />
    </>
  );
}

/* ── CHAMOMILE ── */
function Chamomile({ x, y }) {
  const stemColor  = '#608840';
  const petalColor = '#F0EED8';
  const center     = '#D8C040';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-14} width={2} height={14} fill={stemColor} />
      {/* feathery leaves */}
      <rect x={x-5} y={y-10} width={4} height={2} fill={stemColor} />
      <rect x={x-6} y={y-8}  width={4} height={2} fill={stemColor} />
      <rect x={x+1}  y={y-7}  width={4} height={2} fill={stemColor} />
      {/* petals — slightly drooping */}
      <rect x={x-1} y={y-22} width={2} height={6} fill={petalColor} />
      <rect x={x-5} y={y-20} width={4} height={2} fill={petalColor} />
      <rect x={x+1}  y={y-20} width={4} height={2} fill={petalColor} />
      <rect x={x-4} y={y-22} width={2} height={4} fill={petalColor} />
      <rect x={x+2}  y={y-22} width={2} height={4} fill={petalColor} />
      {/* center dome */}
      <rect x={x-2} y={y-20} width={4} height={4} fill={center} />
      <rect x={x-1} y={y-22} width={2} height={2} fill={center} />
    </>
  );
}

/* ── ROSES ── */
function Rose({ x, y }) {
  const stemColor  = '#386020';
  const leafColor  = '#3A5A18';
  const petalOuter = '#A01840';
  const petalInner = '#C02050';
  const petalLight = '#E04070';
  return (
    <>
      {/* stem */}
      <rect x={x-1} y={y-18} width={2} height={18} fill={stemColor} />
      {/* thorns */}
      <rect x={x-3} y={y-12} width={2} height={2} fill={stemColor} />
      <rect x={x+1}  y={y-8}  width={2} height={2} fill={stemColor} />
      {/* leaves */}
      <rect x={x-5} y={y-14} width={5} height={2} fill={leafColor} />
      <rect x={x-6} y={y-16} width={4} height={2} fill={leafColor} />
      <rect x={x+1}  y={y-10} width={4} height={2} fill={leafColor} />
      {/* outer petals */}
      <rect x={x-4} y={y-26} width={8} height={6} fill={petalOuter} />
      <rect x={x-5} y={y-24} width={10} height={4} fill={petalOuter} />
      {/* inner petals */}
      <rect x={x-3} y={y-28} width={6} height={6} fill={petalInner} />
      <rect x={x-2} y={y-30} width={4} height={4} fill={petalInner} />
      {/* highlight */}
      <rect x={x-1} y={y-30} width={2} height={2} fill={petalLight} />
      <rect x={x-3} y={y-27} width={2} height={2} fill={petalLight} />
    </>
  );
}

const CROP_FNS = {
  sunflowers:  Sunflower,
  lavender:    Lavender,
  grapevines:  Grapevine,
  wheat:       Wheat,
  tomatoes:    Tomato,
  wildflowers: Wildflower,
  daisies:     Daisy,
  chamomile:   Chamomile,
  roses:       Rose,
};
