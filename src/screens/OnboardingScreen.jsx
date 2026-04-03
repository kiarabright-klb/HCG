import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const { dispatch } = useApp();
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [error, setError] = useState('');

  function handleStart() {
    if (!person1.trim() || !person2.trim()) {
      setError('Please enter both names to start your garden.');
      return;
    }
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { person1: person1.trim(), person2: person2.trim(), onboarded: true },
    });
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #C8DBA0 0%, #F5EDD6 50%, #EAD9BB 100%)',
      padding: '32px 24px',
      gap: 0,
    }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🌻</div>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--green-deep)',
        textAlign: 'center',
        lineHeight: 1.2,
        marginBottom: 8,
      }}>Welcome to<br/>The Hancock Family Garden</h1>
      <p style={{
        fontSize: 14,
        color: 'var(--text-light)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 1.5,
      }}>
        Your shared budget, growing together.<br/>Start by telling us your names.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label>
          <span style={labelStyle}>Gardener 1 (you)</span>
          <input
            type="text"
            placeholder="Your first name"
            value={person1}
            onChange={e => { setPerson1(e.target.value); setError(''); }}
            autoFocus
            style={inputStyle}
          />
        </label>
        <label>
          <span style={labelStyle}>Gardener 2 (your partner)</span>
          <input
            type="text"
            placeholder="Their first name"
            value={person2}
            onChange={e => { setPerson2(e.target.value); setError(''); }}
            style={inputStyle}
          />
        </label>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--terracotta)', textAlign: 'center' }}>{error}</p>
        )}

        <button
          onClick={handleStart}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '15px 0',
            background: 'var(--green-mid)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          Plant the First Seed 🌱
        </button>
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: 'var(--text-light)', textAlign: 'center', opacity: 0.7 }}>
        Everything is saved locally on your device.<br/>You can change names anytime in Settings.
      </p>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-light)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  background: 'rgba(255,255,255,0.8)',
  border: '1.5px solid var(--cream-dark)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 16,
  color: 'var(--text-dark)',
  outline: 'none',
};
