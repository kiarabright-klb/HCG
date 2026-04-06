import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const { createGarden, joinGarden, dispatch } = useApp();
  const [mode, setMode]       = useState(null); // null | 'create' | 'join'
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [createdCode, setCreatedCode] = useState(null); // shown after creation

  async function handleCreate() {
    if (!person1.trim() || !person2.trim()) {
      setError('Please enter both names.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const newCode = await createGarden(person1.trim(), person2.trim());
      setCreatedCode(newCode);
    } catch (e) {
      setError('Could not create garden. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!code.trim()) { setError('Please enter a garden code.'); return; }
    setLoading(true);
    setError('');
    try {
      await joinGarden(code.trim());
      // AppContext will hydrate state and set onboarded → app navigates automatically
    } catch (e) {
      setError(e.message || 'Could not join garden.');
      setLoading(false);
    }
  }

  // ── After creating: show the code to share ──
  if (createdCode) {
    return (
      <div style={screen}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <h2 style={heading}>Your garden is planted!</h2>
        <p style={sub}>Share this code with your partner so they can join:</p>

        <div style={{
          margin: '20px 0 24px',
          padding: '20px 28px',
          background: '#1A3418',
          border: '2px solid #5A9A28',
          borderRadius: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#6A9858', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
            Garden Code
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#F0E4C0',
            letterSpacing: 8,
            fontFamily: 'monospace',
          }}>
            {createdCode}
          </div>
        </div>

        <p style={{ ...sub, marginBottom: 28 }}>
          They open the app → "Join a Garden" → enter the code above.
        </p>

        <button
          onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { person1, person2, onboarded: true } })}
          style={primaryBtn}
        >
          Start Gardening →
        </button>
      </div>
    );
  }

  // ── Mode select ──
  if (!mode) {
    return (
      <div style={screen}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌻</div>
        <h1 style={heading}>The Hancock<br/>Family Garden</h1>
        <p style={{ ...sub, marginBottom: 36 }}>
          Your shared budget, growing together.
        </p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => setMode('create')} style={primaryBtn}>
            🌱 Create a New Garden
          </button>
          <button onClick={() => setMode('join')} style={secondaryBtn}>
            🔑 Join an Existing Garden
          </button>
        </div>
        <p style={{ marginTop: 24, fontSize: 11, color: '#6A9858', textAlign: 'center' }}>
          One of you creates, the other joins.<br/>Both tend the same garden in real time.
        </p>
      </div>
    );
  }

  // ── Create form ──
  if (mode === 'create') {
    return (
      <div style={screen}>
        <button onClick={() => { setMode(null); setError(''); }} style={backBtn}>← Back</button>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
        <h2 style={heading}>Plant your garden</h2>
        <p style={{ ...sub, marginBottom: 24 }}>Enter both gardeners' names to get started.</p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            <span style={labelStyle}>Your name</span>
            <input
              type="text" placeholder="e.g. Kiara" value={person1}
              onChange={e => { setPerson1(e.target.value); setError(''); }}
              autoFocus style={inputStyle}
            />
          </label>
          <label>
            <span style={labelStyle}>Partner's name</span>
            <input
              type="text" placeholder="e.g. Marcus" value={person2}
              onChange={e => { setPerson2(e.target.value); setError(''); }}
              style={inputStyle}
            />
          </label>

          {error && <p style={errorStyle}>{error}</p>}

          <button onClick={handleCreate} disabled={loading} style={primaryBtn}>
            {loading ? 'Planting...' : 'Create Garden & Get Code'}
          </button>
        </div>
      </div>
    );
  }

  // ── Join form ──
  return (
    <div style={screen}>
      <button onClick={() => { setMode(null); setError(''); }} style={backBtn}>← Back</button>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
      <h2 style={heading}>Join a garden</h2>
      <p style={{ ...sub, marginBottom: 24 }}>
        Enter the 6-character code your partner shared with you.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          <span style={labelStyle}>Garden code</span>
          <input
            type="text"
            placeholder="e.g. ABC123"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            maxLength={6}
            autoFocus
            style={{
              ...inputStyle,
              fontSize: 24,
              letterSpacing: 6,
              textAlign: 'center',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          />
        </label>

        {error && <p style={errorStyle}>{error}</p>}

        <button onClick={handleJoin} disabled={loading} style={primaryBtn}>
          {loading ? 'Joining...' : 'Join Garden'}
        </button>
      </div>
    </div>
  );
}

// ── Shared styles ──
const screen = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#091608',
  padding: '32px 24px',
};

const heading = {
  fontFamily: 'var(--font-serif)',
  fontSize: 24,
  fontWeight: 700,
  color: '#F0E4C0',
  textAlign: 'center',
  lineHeight: 1.25,
  marginBottom: 10,
};

const sub = {
  fontSize: 14,
  color: '#C8A860',
  textAlign: 'center',
  lineHeight: 1.6,
};

const primaryBtn = {
  width: '100%',
  padding: '15px 0',
  background: '#5A9A28',
  color: 'white',
  borderRadius: 'var(--radius-md)',
  fontWeight: 700,
  fontSize: 16,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(90,154,40,0.35)',
};

const secondaryBtn = {
  width: '100%',
  padding: '14px 0',
  background: 'transparent',
  color: '#C8A860',
  borderRadius: 'var(--radius-md)',
  fontWeight: 600,
  fontSize: 15,
  border: '1.5px solid #2C4E24',
  cursor: 'pointer',
};

const backBtn = {
  alignSelf: 'flex-start',
  marginBottom: 20,
  fontSize: 13,
  color: '#6A9858',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#6A9858',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  background: '#1A3418',
  border: '1.5px solid #2C4E24',
  borderRadius: 'var(--radius-sm)',
  fontSize: 16,
  color: '#F0E4C0',
  outline: 'none',
};

const errorStyle = {
  fontSize: 13,
  color: '#E07050',
  textAlign: 'center',
};
