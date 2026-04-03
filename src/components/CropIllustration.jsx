/**
 * CropPlotScene — renders crops as dense illustrated rows inside a soil bed.
 * Three visual states: flourishing | wilting | dead
 */
export default function CropPlotScene({ crop, state }) {
  const Fn = PLOT_FNS[crop] || PLOT_FNS.tomatoes;
  return (
    <svg
      viewBox="0 0 160 110"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid slice"
    >
      <Fn state={state} />
    </svg>
  );
}

/* ─────────────── Soil row lines (texture) ─────────────── */
function SoilRows() {
  return [18, 38, 58, 78, 98].map(y => (
    <line key={y} x1="4" y1={y} x2="156" y2={y}
      stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeDasharray="5,7" />
  ));
}

/* ─────────────── TOMATOES ─────────────── */
function TomatoPlot({ state }) {
  if (state === 'dead') return <DeadPlot />;

  const rows    = state === 'flourishing' ? [32, 68, 102] : [45, 88];
  const cols    = state === 'flourishing' ? [18, 50, 82, 114, 146] : [28, 72, 118];
  const stemH   = state === 'flourishing' ? 28 : 18;
  const stemClr = state === 'flourishing' ? '#4A7A28' : '#8A9A50';
  const leafClr = state === 'flourishing' ? '#5FA030' : '#9AAA60';
  const fruitClr = state === 'flourishing' ? '#D84030' : '#C07840';
  const fr = state === 'flourishing' ? 7.5 : 5.5;

  return (
    <>
      <SoilRows />
      {rows.flatMap((y, ri) =>
        cols.map((x, ci) => (
          <g key={`${ri}-${ci}`}>
            {/* stem */}
            <line x1={x} y1={y} x2={x} y2={y - stemH} stroke={stemClr} strokeWidth="2" strokeLinecap="round" />
            {/* leaves */}
            <ellipse cx={x - 8} cy={y - stemH * 0.45} rx="8" ry="3.5" fill={leafClr} transform={`rotate(-35 ${x - 8} ${y - stemH * 0.45})`} />
            <ellipse cx={x + 8} cy={y - stemH * 0.6} rx="7" ry="3.5" fill={leafClr} transform={`rotate(30 ${x + 8} ${y - stemH * 0.6})`} />
            {/* calyx */}
            <path d={`M${x - 4},${y - stemH + 2} Q${x},${y - stemH - 3} ${x + 4},${y - stemH + 2}`}
              fill={leafClr} opacity="0.8" />
            {/* main fruit */}
            <circle cx={x} cy={y - stemH} r={fr} fill={fruitClr} />
            <circle cx={x - fr * 0.3} cy={y - stemH - fr * 0.2} r={fr * 0.35} fill="rgba(255,255,255,0.2)" />
            {/* side fruits */}
            {state === 'flourishing' && <>
              <circle cx={x - 11} cy={y - stemH * 0.75} r={5.5} fill={fruitClr} />
              <circle cx={x + 11} cy={y - stemH * 0.68} r={5} fill={fruitClr} />
            </>}
          </g>
        ))
      )}
    </>
  );
}

/* ─────────────── SUNFLOWERS ─────────────── */
function SunflowerPlot({ state }) {
  if (state === 'dead') return <DeadPlot />;

  const rows  = state === 'flourishing' ? [38, 90] : [75];
  const cols  = state === 'flourishing' ? [22, 62, 102, 142] : [35, 90];
  const stemH = state === 'flourishing' ? 34 : 22;
  const stemClr = state === 'flourishing' ? '#4A7A28' : '#8A9A50';
  const petalClr = state === 'flourishing' ? '#F0C030' : '#C8A040';
  const centerClr = state === 'flourishing' ? '#5C3A10' : '#7A5A28';
  const pr = state === 'flourishing' ? 10 : 7;
  const petals = state === 'flourishing' ? 10 : 7;

  return (
    <>
      <SoilRows />
      {rows.flatMap((y, ri) =>
        cols.map((x, ci) => {
          const headY = y - stemH;
          return (
            <g key={`${ri}-${ci}`}>
              <line x1={x} y1={y} x2={x} y2={headY} stroke={stemClr} strokeWidth="2.5" strokeLinecap="round" />
              {/* leaf */}
              <ellipse cx={x - 9} cy={y - stemH * 0.5} rx="10" ry="4" fill={stemClr} transform={`rotate(-30 ${x - 9} ${y - stemH * 0.5})`} />
              {/* petals */}
              {Array.from({ length: petals }, (_, i) => {
                const angle = (i / petals) * Math.PI * 2;
                const px = x + Math.cos(angle) * (pr + 4);
                const py = headY + Math.sin(angle) * (pr + 4);
                return (
                  <ellipse key={i}
                    cx={px} cy={py}
                    rx="5" ry="8"
                    fill={petalClr}
                    transform={`rotate(${angle * 180 / Math.PI + 90} ${px} ${py})`}
                    opacity="0.95"
                  />
                );
              })}
              <circle cx={x} cy={headY} r={pr} fill={centerClr} />
              <circle cx={x} cy={headY} r={pr * 0.6} fill={state === 'flourishing' ? '#3A2008' : '#5A3A18'} />
            </g>
          );
        })
      )}
    </>
  );
}

/* ─────────────── LAVENDER ─────────────── */
function LavenderPlot({ state }) {
  if (state === 'dead') return <DeadPlot />;

  const rows  = state === 'flourishing' ? [35, 72, 108] : [55, 95];
  const cols  = state === 'flourishing' ? [16, 48, 80, 112, 144] : [30, 80, 130];
  const stemH = state === 'flourishing' ? 30 : 18;
  const stemClr = state === 'flourishing' ? '#6A8A48' : '#9AAA68';
  const budClr  = state === 'flourishing' ? '#9B6AC8' : '#B89AD8';
  const buds = state === 'flourishing' ? 5 : 3;

  return (
    <>
      <SoilRows />
      {rows.flatMap((y, ri) =>
        cols.map((x, ci) => (
          <g key={`${ri}-${ci}`}>
            <line x1={x} y1={y} x2={x} y2={y - stemH} stroke={stemClr} strokeWidth="1.8" strokeLinecap="round" />
            {/* bud spike */}
            {Array.from({ length: buds }, (_, i) => {
              const by = y - stemH + (i * (stemH * 0.18));
              return (
                <g key={i}>
                  <ellipse cx={x - 4} cy={by} rx="3.5" ry="2.2" fill={budClr} transform={`rotate(-20 ${x - 4} ${by})`} />
                  <ellipse cx={x + 4} cy={by + 1} rx="3.5" ry="2.2" fill={budClr} opacity="0.85" transform={`rotate(20 ${x + 4} ${by + 1})`} />
                </g>
              );
            })}
            {/* side leaves */}
            <ellipse cx={x - 8} cy={y - 8} rx="7" ry="3" fill={stemClr} transform={`rotate(-25 ${x - 8} ${y - 8})`} />
            <ellipse cx={x + 8} cy={y - 6} rx="6" ry="3" fill={stemClr} transform={`rotate(20 ${x + 8} ${y - 6})`} />
          </g>
        ))
      )}
    </>
  );
}

/* ─────────────── SUCCULENTS ─────────────── */
function SucculentPlot({ state }) {
  if (state === 'dead') return <DeadPlot />;

  const rows  = state === 'flourishing' ? [28, 60, 93] : [45, 85];
  const cols  = state === 'flourishing' ? [24, 60, 96, 132] : [40, 110];
  const gr    = state === 'flourishing' ? 14 : 10;
  const outerClr = state === 'flourishing' ? '#5A8A38' : '#8AAA68';
  const innerClr = state === 'flourishing' ? '#3A6A20' : '#6A8A48';
  const tipClr   = state === 'flourishing' ? '#8ACA50' : '#A0B870';
  const petalN   = state === 'flourishing' ? 8 : 6;

  return (
    <>
      <SoilRows />
      {rows.flatMap((y, ri) =>
        cols.map((x, ci) => (
          <g key={`${ri}-${ci}`}>
            {/* rosette petals */}
            {Array.from({ length: petalN }, (_, i) => {
              const angle = (i / petalN) * Math.PI * 2;
              return (
                <ellipse key={i}
                  cx={x + Math.cos(angle) * gr * 0.7}
                  cy={y + Math.sin(angle) * gr * 0.55}
                  rx={gr * 0.55} ry={gr * 0.4}
                  fill={i % 2 === 0 ? outerClr : tipClr}
                  transform={`rotate(${angle * 180 / Math.PI} ${x + Math.cos(angle) * gr * 0.7} ${y + Math.sin(angle) * gr * 0.55})`}
                />
              );
            })}
            {/* inner ring */}
            {Array.from({ length: petalN }, (_, i) => {
              const angle = (i / petalN) * Math.PI * 2 + Math.PI / petalN;
              return (
                <ellipse key={i}
                  cx={x + Math.cos(angle) * gr * 0.38}
                  cy={y + Math.sin(angle) * gr * 0.3}
                  rx={gr * 0.35} ry={gr * 0.28}
                  fill={innerClr}
                  transform={`rotate(${angle * 180 / Math.PI} ${x + Math.cos(angle) * gr * 0.38} ${y + Math.sin(angle) * gr * 0.3})`}
                />
              );
            })}
            <circle cx={x} cy={y} r={gr * 0.22} fill={innerClr} />
          </g>
        ))
      )}
    </>
  );
}

/* ─────────────── WILDFLOWERS ─────────────── */
const FLOWER_COLORS = ['#E06080', '#C850A0', '#9060D0', '#F0A030', '#E05060'];
const PETAL_COLORS  = ['#F090B0', '#E880C0', '#B090E0', '#F8C060', '#F07090'];

function WildflowerPlot({ state }) {
  if (state === 'dead') return <DeadPlot />;

  const rows  = state === 'flourishing' ? [36, 72, 106] : [52, 92];
  const cols  = state === 'flourishing' ? [18, 52, 86, 120, 150] : [30, 80, 130];
  const stemH = state === 'flourishing' ? 28 : 18;
  const stemClr = state === 'flourishing' ? '#4A8A30' : '#8A9A58';
  const pr = state === 'flourishing' ? 7 : 5;
  const petals = state === 'flourishing' ? 7 : 5;

  return (
    <>
      <SoilRows />
      {rows.flatMap((y, ri) =>
        cols.map((x, ci) => {
          const colorIdx = (ri * cols.length + ci) % FLOWER_COLORS.length;
          const headY = y - stemH;
          return (
            <g key={`${ri}-${ci}`}>
              <line x1={x} y1={y} x2={x} y2={headY} stroke={stemClr} strokeWidth="2" strokeLinecap="round" />
              <ellipse cx={x - 8} cy={y - stemH * 0.5} rx="7" ry="3" fill={stemClr} transform={`rotate(-30 ${x - 8} ${y - stemH * 0.5})`} />
              {/* petals */}
              {Array.from({ length: petals }, (_, i) => {
                const angle = (i / petals) * Math.PI * 2;
                return (
                  <ellipse key={i}
                    cx={x + Math.cos(angle) * (pr + 2.5)}
                    cy={headY + Math.sin(angle) * (pr + 2.5)}
                    rx="4.5" ry="7"
                    fill={PETAL_COLORS[colorIdx]}
                    transform={`rotate(${angle * 180 / Math.PI + 90} ${x + Math.cos(angle) * (pr + 2.5)} ${headY + Math.sin(angle) * (pr + 2.5)})`}
                    opacity={state === 'flourishing' ? 1 : 0.65}
                  />
                );
              })}
              <circle cx={x} cy={headY} r={pr * 0.55} fill={FLOWER_COLORS[colorIdx]} />
              <circle cx={x} cy={headY} r={pr * 0.28} fill="#F8E040" />
            </g>
          );
        })
      )}
    </>
  );
}

/* ─────────────── DEAD STATE (shared) ─────────────── */
function DeadPlot() {
  return (
    <>
      {/* cracked soil lines */}
      <path d="M20 30 Q40 35 55 28 Q70 22 85 30" stroke="rgba(180,120,60,0.35)" strokeWidth="1.5" fill="none" />
      <path d="M90 55 Q110 48 130 57 Q145 63 155 50" stroke="rgba(180,120,60,0.3)" strokeWidth="1.5" fill="none" />
      <path d="M15 80 Q35 87 50 75 Q65 63 80 78" stroke="rgba(180,120,60,0.3)" strokeWidth="1.5" fill="none" />
      {/* dry stubs */}
      {[28, 68, 110, 148].map((x, i) => {
        const y = [95, 85, 95, 88][i];
        return (
          <g key={x}>
            <line x1={x} y1={y} x2={x - 2} y2={y - 22} stroke="#7A5A30" strokeWidth="2" strokeLinecap="round" />
            <line x1={x} y1={y - 10} x2={x - 8} y2={y - 18} stroke="#8A6A38" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x - 2} y1={y - 16} x2={x + 7} y2={y - 22} stroke="#7A5A30" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      })}
      {[44, 90, 130].map((x, i) => {
        const y = [75, 100, 70][i];
        return (
          <g key={x}>
            <line x1={x} y1={y} x2={x + 1} y2={y - 14} stroke="#6A4A28" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x + 1} y1={y - 7} x2={x - 6} y2={y - 13} stroke="#7A5830" strokeWidth="1" strokeLinecap="round" />
          </g>
        );
      })}
    </>
  );
}

const PLOT_FNS = {
  tomatoes:    TomatoPlot,
  sunflowers:  SunflowerPlot,
  lavender:    LavenderPlot,
  succulents:  SucculentPlot,
  wildflowers: WildflowerPlot,
};
