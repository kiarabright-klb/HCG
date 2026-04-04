import { useState } from 'react';
import { useApp, useCategory, useCategorySpend, useCategoryTransactions, getPlotState } from '../context/AppContext';
import PlotSoilScene from '../components/CropIllustration';

export default function PlotDetailScreen({ categoryId, onBack }) {
  const { state, dispatch } = useApp();
  const category = useCategory(categoryId);
  const spent = useCategorySpend(categoryId);
  const transactions = useCategoryTransactions(categoryId);
  const plotState = getPlotState(spent, category.budget);
  const pct = category.budget > 0 ? Math.min(spent / category.budget, 1) : 0;
  const [showLog, setShowLog] = useState(false);

  if (!category) return null;

  const accentColor = plotState === 'dead'    ? '#D04838'
                    : plotState === 'wilting' ? '#C08010'
                    : '#5A9A28';
  const borderAccent = plotState === 'dead'    ? '#5A1A10'
                     : plotState === 'wilting' ? '#5A4010'
                     : '#1A4A10';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#091608', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '12px 14px 10px', gap: 12, flexShrink: 0,
        background: '#1A3418',
        borderBottom: `2px solid ${borderAccent}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: '#223E1C', border: '1px solid #2C4E24',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="#F0E4C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 700, color: '#F0E4C0', lineHeight: 1 }}>
            {category.name}
          </h2>
          <PlotStateBadge state={plotState} accentColor={accentColor} />
        </div>
        <div style={{
          marginLeft: 'auto', width: 68, height: 60,
          background: '#3A1C0A', border: `2px solid ${borderAccent}`,
          borderRadius: 8, flexShrink: 0, overflow: 'hidden',
        }}>
          <PlotSoilScene crop={category.crop} spent={spent} budget={category.budget} />
        </div>
      </div>

      {/* Budget progress */}
      <div style={{ margin: '12px 14px', background: '#1A3418', borderRadius: 'var(--radius-md)', padding: '14px 16px', border: '1px solid #2C4E24', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, color: '#6A9858' }}>This month</span>
          <div>
            <span style={{ fontSize: 22, fontWeight: 700, color: pct >= 1 ? '#E06040' : '#F0E4C0' }}>
              ${spent.toFixed(2)}
            </span>
            <span style={{ fontSize: 13, color: '#C8A860', marginLeft: 4 }}>/ ${category.budget}</span>
          </div>
        </div>
        <div style={{ height: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct * 100}%`,
            background: accentColor, borderRadius: 99, transition: 'width 0.4s ease',
            boxShadow: `0 0 8px ${accentColor}60`,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#6A9858' }}>${(category.budget - spent).toFixed(2)} remaining</span>
          <span style={{ fontSize: 11, color: '#6A9858' }}>{Math.round(pct * 100)}% used</span>
        </div>
      </div>

      {/* Log button */}
      <div style={{ padding: '0 14px 12px', flexShrink: 0 }}>
        <button
          onClick={() => setShowLog(true)}
          style={{
            width: '100%', padding: '13px 0',
            background: accentColor, color: 'white',
            borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15, letterSpacing: 0.3,
            boxShadow: `0 4px 16px ${accentColor}50`,
          }}
        >+ Log a Transaction</button>
      </div>

      {/* Transactions list header */}
      <div style={{ padding: '0 14px 4px', flexShrink: 0 }}>
        <h3 style={{ fontSize: 11, color: '#6A9858', letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
          Transactions this month
        </h3>
      </div>
      <div className="scroll-area" style={{ flex: 1, padding: '6px 14px 24px' }}>
        {transactions.length === 0 ? (
          <EmptyState cropName={category.name} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.map(tx => (
              <TransactionRow
                key={tx.id} tx={tx}
                person1={state.settings.person1}
                person2={state.settings.person2}
                onDelete={() => dispatch({ type: 'DELETE_TRANSACTION', id: tx.id })}
              />
            ))}
          </div>
        )}
      </div>

      {showLog && (
        <LogSheet
          category={category}
          accentColor={accentColor}
          person1={state.settings.person1}
          person2={state.settings.person2}
          onClose={() => setShowLog(false)}
          onSubmit={data => {
            dispatch({ type: 'ADD_TRANSACTION', payload: { ...data, categoryId: category.id } });
            setShowLog(false);
          }}
        />
      )}
    </div>
  );
}

function PlotStateBadge({ state, accentColor }) {
  const labels = { flourishing: 'Flourishing 🌿', wilting: 'Wilting 🥀', dead: 'Withered 💀' };
  return (
    <span style={{
      display: 'inline-block', marginTop: 3,
      padding: '2px 8px',
      background: `${accentColor}22`,
      color: accentColor,
      border: `1px solid ${accentColor}55`,
      borderRadius: 99, fontSize: 11, fontWeight: 700,
    }}>{labels[state]}</span>
  );
}

function TransactionRow({ tx, person1, person2, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const name    = tx.person === 'person1' ? person1 : person2;
  const date    = new Date(tx.date);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
  const isP1    = tx.person === 'person1';

  return (
    <div style={{
      background: '#1A3418', border: '1px solid #2C4E24',
      borderRadius: 'var(--radius-sm)', padding: '11px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: isP1 ? 'rgba(90,154,40,0.2)' : 'rgba(208,72,56,0.2)',
        border: `2px solid ${isP1 ? '#5A9A28' : '#D04838'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
        color: isP1 ? '#78BD38' : '#E07050', flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#F0E4C0' }}>${tx.amount.toFixed(2)}</span>
          <span style={{ fontSize: 11, color: '#6A9858' }}>{dateStr}</span>
        </div>
        <div style={{ fontSize: 12, color: '#C8A860', marginTop: 1 }}>
          {name}{tx.note ? ` · ${tx.note}` : ''}
        </div>
      </div>
      {confirmDelete ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onDelete} style={{
            padding: '4px 8px', background: '#D04838', color: 'white',
            borderRadius: 6, fontSize: 12, fontWeight: 700,
          }}>Delete</button>
          <button onClick={() => setConfirmDelete(false)} style={{
            padding: '4px 8px', background: '#223E1C', color: '#C8A860',
            border: '1px solid #2C4E24', borderRadius: 6, fontSize: 12,
          }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setConfirmDelete(true)} style={{ padding: '4px 6px', opacity: 0.4, color: '#F0E4C0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function EmptyState({ cropName }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px', opacity: 0.6 }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>🌱</div>
      <p style={{ fontSize: 13, color: '#6A9858' }}>
        No transactions yet.<br/>Tap "Log a Transaction" to start tending your {cropName} plot.
      </p>
    </div>
  );
}

function LogSheet({ category, accentColor, person1, person2, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('person1');
  const [note, setNote]     = useState('');
  const [error, setError]   = useState('');

  function handleSubmit() {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) { setError('Please enter a valid amount.'); return; }
    onSubmit({ amount: val, person, note: note.trim() });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10 }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#1A3418',
        borderTop: `2px solid ${accentColor}60`,
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)',
        zIndex: 11, boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.25s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <div style={{ width: 36, height: 4, background: '#2C4E24', borderRadius: 99, margin: '0 auto 16px' }} />

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#F0E4C0' }}>
          Log to {category.name}
        </h3>

        {/* Amount */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={labelStyle}>Amount ($)</span>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#6A9858', fontWeight: 300 }}>$</span>
            <input
              type="number" inputMode="decimal" placeholder="0.00"
              value={amount} onChange={e => { setAmount(e.target.value); setError(''); }}
              autoFocus
              style={{ ...inputStyle, paddingLeft: 30, fontSize: 20, fontWeight: 700 }}
            />
          </div>
          {error && <span style={{ fontSize: 12, color: '#E07050', marginTop: 4, display: 'block' }}>{error}</span>}
        </label>

        {/* Who */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={labelStyle}>Who logged it?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['person1', person1], ['person2', person2]].map(([val, name]) => (
              <button key={val} onClick={() => setPerson(val)} style={{
                flex: 1, padding: '10px 8px',
                borderRadius: 'var(--radius-sm)',
                border: `2px solid ${person === val ? accentColor : '#2C4E24'}`,
                background: person === val ? `${accentColor}22` : 'transparent',
                fontWeight: person === val ? 700 : 400,
                color: person === val ? '#F0E4C0' : '#C8A860',
                fontSize: 14, transition: 'all 0.15s',
              }}>{name}</button>
            ))}
          </div>
        </label>

        {/* Note */}
        <label style={{ display: 'block', marginBottom: 18 }}>
          <span style={labelStyle}>Note (optional)</span>
          <input
            type="text" placeholder="e.g. Whole Foods run"
            value={note} onChange={e => setNote(e.target.value)}
            style={inputStyle}
          />
        </label>

        <button onClick={handleSubmit} style={{
          width: '100%', padding: '14px 0',
          background: accentColor, color: 'white',
          borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 16,
          boxShadow: `0 4px 16px ${accentColor}50`,
        }}>Add to Garden</button>
      </div>
    </>
  );
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#6A9858', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: '#223E1C', border: '1.5px solid #2C4E24',
  borderRadius: 'var(--radius-sm)', fontSize: 15, color: '#F0E4C0', outline: 'none',
};
