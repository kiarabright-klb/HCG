/**
 * Top-down view crop illustrations for each plot.
 * state: 'flourishing' | 'wilting' | 'dead'
 */

export default function CropIllustration({ crop, state, size = 80 }) {
  const Component = CROP_MAP[crop] || CROP_MAP.tomatoes;
  return <Component size={size} state={state} />;
}

function Tomatoes({ size, state }) {
  const alive = state !== 'dead';
  const good = state === 'flourishing';
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* soil */}
      <ellipse cx="40" cy="65" rx="32" ry="10" fill={alive ? '#8B6340' : '#6B4E2A'} opacity="0.4"/>
      {/* stems */}
      {alive && <>
        <line x1="40" y1="62" x2="40" y2="38" stroke="#5A7A3A" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="50" x2="27" y2="42" stroke="#5A7A3A" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40" y1="44" x2="53" y2="38" stroke="#5A7A3A" strokeWidth="2" strokeLinecap="round"/>
      </>}
      {/* tomatoes */}
      {alive ? <>
        <circle cx="40" cy="33" r={good ? 11 : 8} fill={good ? '#E05A3A' : '#C47A5A'}/>
        <circle cx="40" cy="33" r={good ? 8 : 5.5} fill={good ? '#F07050' : '#D08060'}/>
        <path d="M37 27 Q40 24 43 27" stroke="#5A7A3A" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <circle cx="26" cy="38" r={good ? 8 : 6} fill={good ? '#E05A3A' : '#C47A5A'}/>
        <circle cx="26" cy="38" r={good ? 5.5 : 4} fill={good ? '#F07050' : '#D08060'}/>
        <path d="M23 33 Q26 30 29 33" stroke="#5A7A3A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="53" cy="32" r={good ? 7 : 5} fill={good ? '#E05A3A' : '#C47A5A'}/>
        <circle cx="53" cy="32" r={good ? 5 : 3.5} fill={good ? '#F07050' : '#D08060'}/>
      </> : <>
        {/* dead — brown shriveled */}
        <circle cx="40" cy="50" r="7" fill="#8B6340" opacity="0.5"/>
        <circle cx="28" cy="55" r="5" fill="#8B6340" opacity="0.4"/>
        <circle cx="52" cy="52" r="5" fill="#8B6340" opacity="0.4"/>
        <path d="M32 42 Q40 35 48 42" stroke="#6B4E2A" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      </>}
      {/* leaves */}
      {alive && good && <>
        <ellipse cx="29" cy="53" rx="7" ry="4" fill="#7FA050" transform="rotate(-30 29 53)"/>
        <ellipse cx="52" cy="48" rx="7" ry="4" fill="#7FA050" transform="rotate(20 52 48)"/>
      </>}
    </svg>
  );
}

function Sunflowers({ size, state }) {
  const alive = state !== 'dead';
  const good = state === 'flourishing';
  const petals = good ? 12 : 8;
  const r = good ? 14 : 10;
  const cx = 40, cy = 32;
  const petalPath = [];
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * (r - 2);
    const y1 = cy + Math.sin(angle) * (r - 2);
    const x2 = cx + Math.cos(angle) * (r + 8);
    const y2 = cy + Math.sin(angle) * (r + 8);
    petalPath.push({ x1, y1, x2, y2, angle });
  }
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="65" rx="30" ry="9" fill={alive ? '#8B6340' : '#6B4E2A'} opacity="0.4"/>
      {alive && <>
        <line x1="40" y1="63" x2="40" y2={good ? 46 : 48} stroke="#5A7A3A" strokeWidth="3" strokeLinecap="round"/>
        {good && <>
          <line x1="40" y1="56" x2="30" y2="50" stroke="#5A7A3A" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="26" cy="48" rx="8" ry="5" fill="#7FA050" transform="rotate(-20 26 48)"/>
          <line x1="40" y1="52" x2="51" y2="46" stroke="#5A7A3A" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="54" cy="44" rx="8" ry="5" fill="#7FA050" transform="rotate(15 54 44)"/>
        </>}
        {/* petals */}
        {petalPath.map((p, i) => (
          <ellipse key={i}
            cx={(p.x1 + p.x2) / 2}
            cy={(p.y1 + p.y2) / 2}
            rx="4" ry="6"
            fill={good ? '#F0C040' : '#D4A050'}
            transform={`rotate(${(p.angle * 180 / Math.PI) + 90} ${(p.x1 + p.x2) / 2} ${(p.y1 + p.y2) / 2})`}
          />
        ))}
        {/* center */}
        <circle cx={cx} cy={cy} r={good ? 10 : 7} fill={good ? '#5C3D1E' : '#7A5830'}/>
        <circle cx={cx} cy={cy} r={good ? 6 : 4} fill={good ? '#3D2510' : '#5C3D1E'}/>
      </>}
      {!alive && <>
        <line x1="40" y1="63" x2="38" y2="50" stroke="#6B4E2A" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        <circle cx="38" cy="46" r="8" fill="#8B6340" opacity="0.5"/>
        <path d="M30 55 Q40 48 50 55" stroke="#6B4E2A" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
      </>}
    </svg>
  );
}

function Lavender({ size, state }) {
  const alive = state !== 'dead';
  const good = state === 'flourishing';
  const color = good ? '#9B7EB8' : '#B09AC8';
  const stems = [
    { x: 30, bend: -4 }, { x: 37, bend: -1 }, { x: 43, bend: 1 }, { x: 50, bend: 4 }
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="65" rx="30" ry="9" fill={alive ? '#8B6340' : '#6B4E2A'} opacity="0.4"/>
      {alive ? stems.map((s, i) => (
        <g key={i}>
          <line x1={s.x} y1="63" x2={s.x + s.bend} y2={good ? 40 : 44} stroke="#7FA050" strokeWidth="1.8" strokeLinecap="round"/>
          {/* spike buds */}
          {[0,1,2,3].map(j => {
            const fy = good ? 40 + j * 5 : 44 + j * 4;
            const fx = s.x + s.bend;
            return j < (good ? 4 : 3) ? (
              <g key={j}>
                <ellipse cx={fx - 3} cy={fy} rx="3" ry="2" fill={color} transform={`rotate(-15 ${fx - 3} ${fy})`}/>
                <ellipse cx={fx + 3} cy={fy} rx="3" ry="2" fill={color} transform={`rotate(15 ${fx + 3} ${fy})`}/>
              </g>
            ) : null;
          })}
        </g>
      )) : <>
        <path d="M28 62 Q40 50 52 62" stroke="#8B6340" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M32 58 Q40 44 48 58" stroke="#8B6340" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      </>}
    </svg>
  );
}

function Succulents({ size, state }) {
  const alive = state !== 'dead';
  const good = state === 'flourishing';
  const green = good ? '#5A7A3A' : '#7A9A5A';
  const green2 = good ? '#7FA050' : '#9ABA70';
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* pot */}
      <path d="M26 72 L30 55 L50 55 L54 72 Z" fill={alive ? '#C4704A' : '#A05A3A'}/>
      <rect x="28" y="52" width="24" height="5" rx="2" fill={alive ? '#D4804A' : '#B06040'}/>
      {alive ? <>
        {/* rosette leaves */}
        <ellipse cx="40" cy="46" rx="16" ry="8" fill={green2}/>
        <ellipse cx="40" cy="44" rx="12" ry="6" fill={green}/>
        {/* outer petals */}
        {[0,60,120,180,240,300].map((a, i) => {
          const rad = a * Math.PI / 180;
          return (
            <ellipse key={i}
              cx={40 + Math.cos(rad) * (good ? 13 : 10)}
              cy={44 + Math.sin(rad) * (good ? 7 : 5)}
              rx={good ? 7 : 5} ry={good ? 4.5 : 3.5}
              fill={i % 2 === 0 ? green : green2}
              transform={`rotate(${a} ${40 + Math.cos(rad) * (good ? 13 : 10)} ${44 + Math.sin(rad) * (good ? 7 : 5)})`}
            />
          );
        })}
        <circle cx="40" cy="44" r={good ? 7 : 5} fill={good ? '#3D5C28' : '#5A7A3A'}/>
        <circle cx="40" cy="44" r={good ? 3 : 2} fill={good ? '#7FA050' : '#9ABA70'}/>
      </> : <>
        <ellipse cx="40" cy="46" rx="10" ry="5" fill="#8B6340" opacity="0.5"/>
        <path d="M33 52 Q40 42 47 52" stroke="#6B4E2A" strokeWidth="1.5" fill="none" opacity="0.6"/>
      </>}
    </svg>
  );
}

function Wildflowers({ size, state }) {
  const alive = state !== 'dead';
  const good = state === 'flourishing';
  const flowers = [
    { cx: 28, cy: 36, color: '#E07090', r: good ? 8 : 6 },
    { cx: 42, cy: 30, color: '#F0A0C0', r: good ? 9 : 7 },
    { cx: 55, cy: 37, color: '#D06080', r: good ? 7 : 5 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="65" rx="30" ry="9" fill={alive ? '#8B6340' : '#6B4E2A'} opacity="0.4"/>
      {alive ? <>
        {flowers.map((f, i) => (
          <g key={i}>
            <line x1={f.cx} y1="63" x2={f.cx} y2={f.cy + f.r + 2} stroke="#5A7A3A" strokeWidth="2" strokeLinecap="round"/>
            {/* petals */}
            {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((a, j) => {
              const rad = a * Math.PI / 180;
              return (
                <ellipse key={j}
                  cx={f.cx + Math.cos(rad) * f.r}
                  cy={f.cy + Math.sin(rad) * f.r}
                  rx={f.r * 0.55} ry={f.r * 0.35}
                  fill={f.color}
                  transform={`rotate(${a} ${f.cx + Math.cos(rad) * f.r} ${f.cy + Math.sin(rad) * f.r})`}
                />
              );
            })}
            <circle cx={f.cx} cy={f.cy} r={f.r * 0.45} fill={good ? '#F0C040' : '#D4A030'}/>
          </g>
        ))}
        {good && <>
          <ellipse cx="22" cy="50" rx="8" ry="5" fill="#7FA050" transform="rotate(-25 22 50)"/>
          <ellipse cx="58" cy="48" rx="7" ry="4" fill="#7FA050" transform="rotate(20 58 48)"/>
        </>}
      </> : <>
        <path d="M25 62 Q40 50 55 62" stroke="#8B6340" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <circle cx="30" cy="52" r="5" fill="#8B6340" opacity="0.4"/>
        <circle cx="42" cy="47" r="6" fill="#8B6340" opacity="0.4"/>
        <circle cx="53" cy="52" r="4" fill="#8B6340" opacity="0.4"/>
      </>}
    </svg>
  );
}

export const CROP_MAP = {
  tomatoes: Tomatoes,
  sunflowers: Sunflowers,
  lavender: Lavender,
  succulents: Succulents,
  wildflowers: Wildflowers,
};
