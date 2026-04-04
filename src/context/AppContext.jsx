import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const CROPS_PER_PLOT = 10;

const CROPS = [
  { id: 'sunflowers',  label: 'Sunflowers',  emoji: '🌻', color: '#F0B020' },
  { id: 'cabbages',    label: 'Cabbages',    emoji: '🥬', color: '#5A9A3A' },
  { id: 'grapevines',  label: 'Grapevines',  emoji: '🍇', color: '#7040A0' },
  { id: 'wheat',       label: 'Wheat',       emoji: '🌾', color: '#C4A030' },
  { id: 'tomatoes',    label: 'Tomatoes',    emoji: '🍅', color: '#D03020' },
  { id: 'watermelon',  label: 'Watermelon',  emoji: '🍉', color: '#2A8020' },
  { id: 'carrots',     label: 'Carrots',     emoji: '🥕', color: '#E06020' },
  { id: 'wildflowers', label: 'Wildflowers', emoji: '🌸', color: '#E07090' },
  { id: 'daisies',     label: 'Daisy',       emoji: '🌼', color: '#F5F0C8' },
];

const DEFAULT_CATEGORIES = [
  { id: 'homestead',  name: 'The Homestead',    crop: 'sunflowers',  budget: 2000 },
  { id: 'utility',    name: 'The Utility Patch', crop: 'cabbages',    budget: 300  },
  { id: 'vine',       name: 'The Vine',          crop: 'grapevines',  budget: 150  },
  { id: 'fuel',       name: 'The Fuel Row',      crop: 'wheat',       budget: 200  },
  { id: 'pantry',     name: 'The Pantry Plot',   crop: 'tomatoes',    budget: 600  },
  { id: 'fun',        name: 'The Fun Garden',    crop: 'watermelon',  budget: 200  },
  { id: 'littleones', name: 'The Little Ones',   crop: 'carrots',     budget: 200  },
  { id: 'wild',       name: 'The Wild Patch',    crop: 'wildflowers', budget: 100  },
  { id: 'cellar',     name: 'The Cellar',        crop: 'daisies',     budget: 100  },
];

const INITIAL_STATE = {
  version: 3,
  settings: {
    person1: 'Person 1',
    person2: 'Person 2',
    savingsGoal: '',
    onboarded: false,
  },
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  weeklyStats: {},
};

// Stable device ID — persists in localStorage so this device is always recognized
const DEVICE_ID = (() => {
  let id = localStorage.getItem('hcg-device-id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    localStorage.setItem('hcg-device-id', id);
  }
  return id;
})();

function generateGardenCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // Strip internal Firestore fields before storing in state
      const { _device, ...loaded } = action.payload;
      if (!loaded.version || loaded.version < 3) {
        return { ...INITIAL_STATE, settings: { ...INITIAL_STATE.settings, ...(loaded.settings || {}) } };
      }
      return { ...INITIAL_STATE, ...loaded };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'UPDATE_CATEGORY_BUDGET': {
      const categories = state.categories.map(c =>
        c.id === action.id ? { ...c, budget: action.budget } : c
      );
      return { ...state, categories };
    }

    case 'UPDATE_CATEGORY_CROP': {
      const categories = state.categories.map(c =>
        c.id === action.id ? { ...c, crop: action.crop } : c
      );
      return { ...state, categories };
    }

    case 'ADD_TRANSACTION': {
      const tx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...action.payload,
        date: new Date().toISOString(),
      };
      const week = getWeekKey();
      const weekStats = state.weeklyStats[week] || { person1: 0, person2: 0 };
      const person = action.payload.person === 'person1' ? 'person1' : 'person2';
      return {
        ...state,
        transactions: [tx, ...state.transactions],
        weeklyStats: {
          ...state.weeklyStats,
          [week]: { ...weekStats, [person]: (weekStats[person] || 0) + 1 },
        },
      };
    }

    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) };

    case 'CLEAR_MONTH':
      return { ...state, transactions: state.transactions.filter(t => !t.date.startsWith(action.month)) };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [gardenCode, setGardenCodeState] = useState(
    () => localStorage.getItem('hcg-garden-code')
  );
  // Prevents writing back to Firestore when the state change came FROM Firestore
  const fromFirestore = useRef(false);

  // ── Subscribe to real-time Firestore updates ──
  useEffect(() => {
    if (!gardenCode) return;
    const docRef = doc(db, 'gardens', gardenCode);
    const unsub = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      // Ignore updates that originated from this device (we already have them)
      if (data._device === DEVICE_ID) return;
      fromFirestore.current = true;
      dispatch({ type: 'HYDRATE', payload: data });
    });
    return unsub;
  }, [gardenCode]);

  // ── Write state to Firestore whenever it changes ──
  useEffect(() => {
    if (fromFirestore.current) {
      fromFirestore.current = false;
      return; // this change came from Firestore — don't echo it back
    }
    if (!gardenCode || !state.settings.onboarded) return;
    setDoc(doc(db, 'gardens', gardenCode), { ...state, _device: DEVICE_ID })
      .catch(() => {}); // silently ignore offline errors
  }, [state, gardenCode]);

  // ── Create a brand-new shared garden ──
  async function createGarden(person1, person2) {
    const code = generateGardenCode();
    const initialData = {
      ...INITIAL_STATE,
      settings: { ...INITIAL_STATE.settings, person1, person2, onboarded: true },
    };
    await setDoc(doc(db, 'gardens', code), { ...initialData, _device: DEVICE_ID });
    localStorage.setItem('hcg-garden-code', code);
    setGardenCodeState(code);
    dispatch({ type: 'HYDRATE', payload: initialData });
    return code;
  }

  // ── Join an existing garden by code ──
  async function joinGarden(code) {
    const upper = code.toUpperCase().trim();
    const snap = await getDoc(doc(db, 'gardens', upper));
    if (!snap.exists()) throw new Error('Garden not found. Check the code and try again.');
    localStorage.setItem('hcg-garden-code', upper);
    setGardenCodeState(upper);
    fromFirestore.current = true; // the HYDRATE below came "from Firestore", don't write back
    dispatch({ type: 'HYDRATE', payload: snap.data() });
  }

  return (
    <AppContext.Provider value={{ state, dispatch, CROPS, gardenCode, createGarden, joinGarden }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }

export function useCategory(id) {
  const { state } = useApp();
  return state.categories.find(c => c.id === id);
}

export function useCategorySpend(id) {
  const { state } = useApp();
  const month = new Date().toISOString().slice(0, 7);
  return state.transactions
    .filter(t => t.categoryId === id && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function useCategoryTransactions(id) {
  const { state } = useApp();
  const month = new Date().toISOString().slice(0, 7);
  return state.transactions
    .filter(t => t.categoryId === id && t.date.startsWith(month))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPlotState(spent, budget) {
  if (budget <= 0) return 'flourishing';
  const pct = spent / budget;
  if (pct >= 1.0) return 'dead';
  if (pct >= 0.75) return 'wilting';
  return 'flourishing';
}

export { CROPS, DEFAULT_CATEGORIES, getWeekKey };
