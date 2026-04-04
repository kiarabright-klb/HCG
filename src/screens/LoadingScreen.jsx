import { useEffect, useState } from 'react';

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=fade-in, 1=show, 2=fade-out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => onDone(), 2600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#091608',
      opacity: phase === 0 ? 0 : phase === 1 ? 1 : 0,
      transition: phase === 0 ? 'opacity 0.6s ease' : 'opacity 0.5s ease',
      gap: 24,
      padding: 32,
    }}>
      {/* Animated garden scene */}
      <div style={{
        width: 140,
        height: 140,
        position: 'relative',
        animation: 'gentleFloat 3s ease-in-out infinite',
      }}>
        <style>{`
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes growIn {
            0% { transform: scale(0.6); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes petalSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ animation: 'growIn 0.8s ease 0.2s both' }}>
          {/* Ground */}
          <ellipse cx="70" cy="115" rx="55" ry="18" fill="#8B6340" opacity="0.3"/>
          {/* Main stem */}
          <path d="M70 112 Q68 90 70 70 Q72 50 70 35" stroke="#5A7A3A" strokeWidth="4" strokeLinecap="round" fill="none"/>
          {/* Left leaf */}
          <path d="M70 85 Q50 75 45 60 Q58 62 70 75" fill="#7FA050"/>
          {/* Right leaf */}
          <path d="M70 72 Q90 62 95 48 Q82 52 70 65" fill="#5A7A3A"/>
          {/* Sunflower petals */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
            const rad = a * Math.PI / 180;
            return (
              <ellipse key={i}
                cx={70 + Math.cos(rad) * 22}
                cy={35 + Math.sin(rad) * 22}
                rx="7" ry="11"
                fill="#F0C040"
                transform={`rotate(${a} ${70 + Math.cos(rad) * 22} ${35 + Math.sin(rad) * 22})`}
              />
            );
          })}
          <circle cx="70" cy="35" r="14" fill="#5C3D1E"/>
          <circle cx="70" cy="35" r="9" fill="#3D2510"/>
          {/* Little flowers at base */}
          <circle cx="42" cy="108" r="7" fill="#E07090"/>
          <circle cx="42" cy="108" r="4" fill="#F0C040"/>
          <circle cx="98" cy="106" r="6" fill="#9B7EB8"/>
          <circle cx="98" cy="106" r="3.5" fill="#F0C040"/>
          <line x1="42" y1="115" x2="42" y2="108" stroke="#5A7A3A" strokeWidth="2"/>
          <line x1="98" y1="112" x2="98" y2="106" stroke="#5A7A3A" strokeWidth="2"/>
        </svg>
      </div>

      <div style={{ textAlign: 'center', animation: 'growIn 0.8s ease 0.4s both' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 26,
          fontWeight: 700,
          color: '#F0E4C0',
          lineHeight: 1.25,
          letterSpacing: '-0.5px',
          marginBottom: 6,
        }}>
          The Hancock<br/>Family Garden
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: '#6A9858',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          Growing together
        </p>
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: 6, animation: 'growIn 0.8s ease 0.8s both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#5A9A28',
            animation: `gentleFloat 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}
