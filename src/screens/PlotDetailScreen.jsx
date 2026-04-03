import { useState } from 'react';
import { useApp, useCategory, useCategorySpend, useCategoryTransactions, getPlotState, CROPS } from '../context/AppContext';
import CropIllustration from '../components/CropIllustration';

export default function PlotDetailScreen({ categoryId, onBack }) {
  const { state, dispatch } = useApp();
  const category = useCategory(categoryId);
  const spent = useCategorySpend(categoryId);
  const transactions = useCategoryTransactions(categoryId);
  const plotState = getPlotState(spent, category.budget);
  const pct = category.budget > 0 ? Math.min(spent / category.budget, 1) : 0;
  const [showLog, setShowLog] = useState(false);

  if (!category) return null;

  const stateConfig = {
    flourishing: { bg: 'linear-gradient(160deg, #D6E8A8 0%, #F5EDD6 50%)', accent: 'var(--green-mid)' },
    wilting:     { bg: 'linear-gradient(160deg, #F4E8A8 0%, #F5EDD6 50%)', accent: '#C4A000' },
    dead:        { bg: 'linear-gradient(160deg, #F4D0A8 0%, #F5EDD6 50%)', accent: 'var(--terracotta)' },
  };
  const cfg = stateConfig[plotState];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: cfg.bg,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 16px 12px',
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="var(--text-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>
            {category.name}
          </h2>
          <PlotStateBadge state={plotState} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <CropIllustration crop={category.crop} state={plotState} size={64} />
        </div>
      </div>

      {/* Budget progress */}
      <div style={{
        margin: '0 16px 12px',
        background: 'rgba(255,255,255,0.65)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>This month</span>
          <div>
            <span style={{ fontSize: 22, fontWeight: 700, color: pct >= 1 ? 'var(--terracotta)' : 'var(--text-dark)' }}>
              ${spent.toFixed(2)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-light)', marginLeft: 4 }}>/ ${category.budget}</span>
          </div>
        </div>
        <div style={{ height: 10, background: 'rgba(0,0,0,0.1)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: plotState === 'dead' ? 'var(--terracotta)' : plotState === 'wilting' ? 'var(--amber)' : cfg.accent,
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
            ${(category.budget - spent).toFixed(2)} remaining
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
            {Math.round(pct * 100)}% used
          </span>
        </div>
      </div>

      {/* Log transaction button */}
      <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
        <button
          onClick={() => setShowLog(true)}
          style={{
            width: '100%',
            padding: '13px 0',
            background: cfg.accent,
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 0.3,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          + Log a Transaction
        </button>
      </div>

      {/* Transactions list */}
      <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
        <h3 style={{ fontSize: 13, color: 'var(--text-light)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
          Transactions this month
        </h3>
      </div>
      <div className="scroll-area" style={{ flex: 1, padding: '6px 16px 24px' }}>
        {transactions.length === 0 ? (
          <EmptyState cropName={category.name} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.map(tx => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                person1={state.settings.person1}
                person2={state.settings.person2}
                onDelete={() => dispatch({ type: 'DELETE_TRANSACTION', id: tx.id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Log transaction sheet */}
      {showLog && (
        <LogSheet
          category={category}
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

function PlotStateBadge({ state }) {
  const config = {
    flourishing: { label: 'Flourishing 🌿', color: 'var(--green-deep)', bg: '#C8DBA0' },
    wilting:     { label: 'Wilting 🥀',     color: '#7A5A00',           bg: '#F0D880' },
    dead:        { label: 'Withered 💀',    color: 'var(--terracotta)', bg: '#F0C0A0' },
  };
  const c = config[state];
  return (
    <span style={{
      display: 'inline-block',
      marginTop: 3,
      padding: '2px 8px',
      background: c.bg,
      color: c.color,
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
    }}>{c.label}</span>
  );
}

function TransactionRow({ tx, person1, person2, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const name = tx.person === 'person1' ? person1 : person2;
  const date = new Date(tx.date);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)',
      borderRadius: 'var(--radius-sm)',
      padding: '11px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: tx.person === 'person1' ? 'var(--green-pale)' : 'var(--terracotta-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: tx.person === 'person1' ? 'var(--green-deep)' : 'var(--brown-dark)',
        flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>${tx.amount.toFixed(2)}</span>
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{dateStr}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 1 }}>
          {name}{tx.note ? ` · ${tx.note}` : ''}
        </div>
      </div>
      {confirmDelete ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onDelete} style={{
            padding: '4px 8px', background: 'var(--terracotta)', color: 'white',
            borderRadius: 6, fontSize: 12, fontWeight: 700,
          }}>Delete</button>
          <button onClick={() => setConfirmDelete(false)} style={{
            padding: '4px 8px', background: 'rgba(0,0,0,0.08)',
            borderRadius: 6, fontSize: 12,
          }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setConfirmDelete(true)} style={{ padding: '4px 6px', opacity: 0.3 }}>
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
      <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
      <p style={{ fontSize: 14, color: 'var(--text-light)' }}>
        No transactions yet.<br/>Tap "Log a Transaction" to start tending your {cropName} plot.
      </p>
    </div>
  );
}

function LogSheet({ category, person1, person2, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('person1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    onSubmit({ amount: val, person, note: note.trim() });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 10,
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: 'var(--white)',
        borderRadius: '24px 24px 0 0',
        padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)',
        zIndex: 11,
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.25s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{
          width: 36, height: 4, background: 'var(--cream-dark)',
          borderRadius: 99, margin: '0 auto 18px',
        }}/>

        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 18,
          color: 'var(--text-dark)',
        }}>Log to {category.name}</h3>

        {/* Amount */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={labelStyle}>Amount ($)</span>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 18, color: 'var(--text-light)', fontWeight: 300,
            }}>$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              autoFocus
              style={{ ...inputStyle, paddingLeft: 30, fontSize: 20, fontWeight: 700 }}
            />
          </div>
          {error && <span style={{ fontSize: 12, color: 'var(--terracotta)', marginTop: 4, display: 'block' }}>{error}</span>}
        </label>

        {/* Who */}
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={labelStyle}>Who logged it?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['person1', person1], ['person2', person2]].map(([val, name]) => (
              <button
                key={val}
                onClick={() => setPerson(val)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${person === val ? 'var(--green-mid)' : 'var(--cream-dark)'}`,
                  background: person === val ? 'var(--green-pale)' : 'transparent',
                  fontWeight: person === val ? 700 : 400,
                  color: person === val ? 'var(--green-deep)' : 'var(--text-mid)',
                  fontSize: 14,
                  transition: 'all 0.15s',
                }}
              >{name}</button>
            ))}
          </div>
        </label>

        {/* Note */}
        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={labelStyle}>Note (optional)</span>
          <input
            type="text"
            placeholder="e.g. Whole Foods run"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={inputStyle}
          />
        </label>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '14px 0',
            background: 'var(--green-mid)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          Add to Garden
        </button>
      </div>
    </>
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
  padding: '11px 14px',
  background: 'var(--cream)',
  border: '1.5px solid var(--cream-dark)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 15,
  color: 'var(--text-dark)',
  outline: 'none',
};
