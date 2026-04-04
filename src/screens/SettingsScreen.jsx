import { useState } from 'react';
import { useApp, CROPS } from '../context/AppContext';

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const [saved, setSaved] = useState(false);

  function save(key, value) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#091608', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        background: '#1A3418',
        borderBottom: '2px solid #2C4E24',
        padding: '12px 16px 10px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#F0E4C0', lineHeight: 1 }}>
          Garden Setup
        </h1>
        {saved && (
          <span style={{
            fontSize: 11, color: '#78BD38', fontWeight: 700,
            background: 'rgba(90,154,40,0.15)',
            border: '1px solid #2C4E24',
            padding: '4px 10px', borderRadius: 99,
          }}>Saved ✓</span>
        )}
      </div>

      <div className="scroll-area" style={{ flex: 1, padding: '14px 14px 32px' }}>

        {/* Names */}
        <Section title="Gardeners" icon="👤">
          <div style={{ display: 'flex', gap: 10 }}>
            <NameField label="Gardener 1" value={state.settings.person1} placeholder="Your name"    onChange={v => save('person1', v)} />
            <NameField label="Gardener 2" value={state.settings.person2} placeholder="Partner's name" onChange={v => save('person2', v)} />
          </div>
        </Section>

        {/* Savings goal */}
        <Section title="Shared Savings Goal" icon="🏦">
          <label>
            <span style={labelStyle}>Soft savings target (optional)</span>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#6A9858' }}>$</span>
              <input
                type="number" inputMode="numeric" placeholder="e.g. 5000"
                value={state.settings.savingsGoal}
                onChange={e => save('savingsGoal', e.target.value)}
                style={{ ...inputStyle, paddingLeft: 28 }}
              />
            </div>
            <span style={{ fontSize: 11, color: '#6A9858', marginTop: 4, display: 'block' }}>
              Just a reminder target — no countdown, no pressure.
            </span>
          </label>
        </Section>

        {/* Plot budgets */}
        <Section title="Plot Budgets" icon="🌱">
          <p style={{ fontSize: 12, color: '#6A9858', marginBottom: 12 }}>
            Set your monthly budget for each garden plot. Tap the crop to change it.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {state.categories.map(cat => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onBudgetChange={budget => dispatch({ type: 'UPDATE_CATEGORY_BUDGET', id: cat.id, budget })}
                onCropChange={crop => dispatch({ type: 'UPDATE_CATEGORY_CROP', id: cat.id, crop })}
              />
            ))}
          </div>
        </Section>

        {/* Data */}
        <Section title="Data" icon="🗑️">
          <DangerZone dispatch={dispatch} />
        </Section>

        <div style={{ textAlign: 'center', padding: '14px 0 6px', opacity: 0.4 }}>
          <p style={{ fontSize: 11, fontStyle: 'italic', color: '#6A9858' }}>The Hancock Family Garden · v1.0</p>
          <p style={{ fontSize: 11, color: '#6A9858', marginTop: 2 }}>Data stored locally on your device.</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#6A9858' }}>{title}</span>
      </div>
      <div style={{ background: '#1A3418', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid #2C4E24' }}>
        {children}
      </div>
    </div>
  );
}

function NameField({ label, value, placeholder, onChange }) {
  return (
    <label style={{ flex: 1 }}>
      <span style={labelStyle}>{label}</span>
      <input type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </label>
  );
}

function CategoryRow({ category, onBudgetChange, onCropChange }) {
  const [showCropPicker, setShowCropPicker] = useState(false);
  const crop = CROPS.find(c => c.id === category.crop) || CROPS[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Crop selector */}
        <button
          onClick={() => setShowCropPicker(!showCropPicker)}
          style={{
            width: 42, height: 42,
            borderRadius: 'var(--radius-sm)',
            background: showCropPicker ? 'rgba(90,154,40,0.15)' : '#223E1C',
            border: showCropPicker ? '2px solid #5A9A28' : '1.5px solid #2C4E24',
            fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Change crop"
        >{crop.emoji}</button>

        {/* Name + crop label */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F0E4C0', marginBottom: 1 }}>{category.name}</div>
          <div style={{ fontSize: 11, color: '#6A9858' }}>{crop.label}</div>
        </div>

        {/* Budget input */}
        <div style={{ position: 'relative', width: 88 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6A9858' }}>$</span>
          <input
            type="number" inputMode="numeric"
            value={category.budget}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) onBudgetChange(val);
              else if (e.target.value === '') onBudgetChange(0);
            }}
            style={{ ...inputStyle, paddingLeft: 22, paddingRight: 6, textAlign: 'right', width: '100%', fontWeight: 700 }}
          />
        </div>
      </div>

      {/* Crop picker */}
      {showCropPicker && (
        <div style={{
          marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap',
          padding: '10px', background: '#223E1C',
          borderRadius: 'var(--radius-sm)', border: '1px solid #2C4E24',
        }}>
          {CROPS.map(c => (
            <button
              key={c.id}
              onClick={() => { onCropChange(c.id); setShowCropPicker(false); }}
              style={{
                padding: '6px 10px', borderRadius: 8,
                border: c.id === category.crop ? '2px solid #5A9A28' : '1.5px solid #2C4E24',
                background: c.id === category.crop ? 'rgba(90,154,40,0.2)' : 'rgba(255,255,255,0.04)',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span>{c.emoji}</span>
              <span style={{ fontSize: 11, color: '#C8A860' }}>{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DangerZone({ dispatch }) {
  const [confirm, setConfirm] = useState(false);

  function clearTransactions() {
    const month = new Date().toISOString().slice(0, 7);
    dispatch({ type: 'CLEAR_MONTH', month });
    setConfirm(false);
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: '#6A9858', marginBottom: 10 }}>
        Clear all transactions from this month and start fresh.
      </p>
      {confirm ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={clearTransactions} style={{
            flex: 1, padding: '10px 0',
            background: '#D04838', color: 'white',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 14,
          }}>Yes, clear it</button>
          <button onClick={() => setConfirm(false)} style={{
            flex: 1, padding: '10px 0',
            background: '#223E1C', color: '#C8A860',
            border: '1px solid #2C4E24',
            borderRadius: 'var(--radius-sm)', fontSize: 14,
          }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)} style={{
          padding: '9px 16px',
          border: '1.5px solid #D04838',
          color: '#E07050',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13, fontWeight: 700,
        }}>Clear this month's transactions</button>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#6A9858', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5,
};

const inputStyle = {
  width: '100%', padding: '10px 12px',
  background: '#223E1C',
  border: '1.5px solid #2C4E24',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14, color: '#F0E4C0', outline: 'none',
};
