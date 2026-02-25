import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, UserProfile, Transaction, Category } from './types';

const STORAGE_KEY = 'pocketpilot_data';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, transactions: [], isAuthenticated: false };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type Action =
  | { type: 'LOGIN'; user: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; updates: Partial<UserProfile> }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'MONTHLY_RESET' }
  | { type: 'SET_DARK_MODE'; enabled: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, transactions: [], isAuthenticated: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: state.user ? { ...state.user, ...action.updates } : null };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) };
    case 'MONTHLY_RESET': {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const filtered = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      return { ...state, transactions: filtered };
    }
    case 'SET_DARK_MODE':
      return { ...state, user: state.user ? { ...state.user, darkMode: action.enabled } : null };
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Computed values
  totalExpenses: number;
  totalIncome: number;
  remainingBalance: number;
  savingsAmount: number;
  goalProgress: number;
  dailySpendingLimit: number;
  categoryTotals: Record<Category, number>;
  todayExpenses: number;
  isOverspending: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply dark mode
  useEffect(() => {
    if (state.user?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.user?.darkMode]);

  // Monthly reset check
  useEffect(() => {
    const lastReset = localStorage.getItem('pocketpilot_last_reset');
    const now = new Date();
    const resetKey = `${now.getFullYear()}-${now.getMonth()}`;
    if (lastReset !== resetKey && state.isAuthenticated) {
      dispatch({ type: 'MONTHLY_RESET' });
      localStorage.setItem('pocketpilot_last_reset', resetKey);
    }
  }, [state.isAuthenticated]);

  const currentMonthTransactions = state.transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = state.user?.monthlyIncome || 0;
  const remainingBalance = totalIncome - totalExpenses;
  const savingsTarget = state.user?.savingsTarget || 0;
  const savingsAmount = Math.max(0, remainingBalance - (totalIncome - savingsTarget - totalExpenses > 0 ? 0 : 0));
  const effectiveSavings = Math.max(0, remainingBalance);

  const goalProgress = savingsTarget > 0 ? Math.min(100, (effectiveSavings / savingsTarget) * 100) : 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  const spendableBudget = Math.max(0, totalIncome - savingsTarget - totalExpenses);
  const dailySpendingLimit = daysLeft > 0 ? spendableBudget / daysLeft : 0;

  const categoryTotals = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<Category, number>);

  const today = new Date().toDateString();
  const todayExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const isOverspending = todayExpenses > dailySpendingLimit && dailySpendingLimit > 0;

  const value: StoreContextType = {
    state,
    dispatch,
    totalExpenses,
    totalIncome,
    remainingBalance,
    savingsAmount: effectiveSavings,
    goalProgress,
    dailySpendingLimit,
    categoryTotals,
    todayExpenses,
    isOverspending,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
