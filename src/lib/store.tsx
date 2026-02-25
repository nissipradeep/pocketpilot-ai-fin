import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, UserProfile, Transaction, Category, ChatMessage, CurrencyCode } from './types';

const STORAGE_KEY = 'pocketpilot_data';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migration: add chatHistory if missing
      if (!parsed.chatHistory) parsed.chatHistory = [];
      // Migration: ensure currency fields
      if (parsed.user && !parsed.user.currencyCode) parsed.user.currencyCode = 'USD';
      if (parsed.user && !parsed.user.fullName && parsed.user.name) {
        parsed.user.fullName = parsed.user.name;
      }
      if (parsed.user && !parsed.user.username) {
        parsed.user.username = parsed.user.email || 'user';
      }
      if (parsed.transactions) {
        parsed.transactions = parsed.transactions.map((t: any) => ({
          ...t,
          currencyCode: t.currencyCode || 'USD',
        }));
      }
      return parsed;
    }
  } catch {}
  return { user: null, transactions: [], chatHistory: [], isAuthenticated: false };
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
  | { type: 'SET_DARK_MODE'; enabled: boolean }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'CLEAR_CHAT_SESSION'; sessionId: string }
  | { type: 'NEW_CHAT_SESSION' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, transactions: [], chatHistory: [], isAuthenticated: false };
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
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.message] };
    case 'CLEAR_CHAT_SESSION':
      return { ...state, chatHistory: state.chatHistory.filter(m => m.sessionId !== action.sessionId) };
    case 'NEW_CHAT_SESSION':
      return state; // Session ID managed in component
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  totalExpenses: number;
  totalIncome: number;
  remainingBalance: number;
  savingsAmount: number;
  goalProgress: number;
  dailySpendingLimit: number;
  categoryTotals: Record<Category, number>;
  todayExpenses: number;
  isOverspending: boolean;
  usableAmount: number;
  currency: CurrencyCode;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (state.user?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.user?.darkMode]);

  useEffect(() => {
    const lastReset = localStorage.getItem('pocketpilot_last_reset');
    const now = new Date();
    const resetKey = `${now.getFullYear()}-${now.getMonth()}`;
    if (lastReset !== resetKey && state.isAuthenticated) {
      dispatch({ type: 'MONTHLY_RESET' });
      localStorage.setItem('pocketpilot_last_reset', resetKey);
    }
  }, [state.isAuthenticated]);

  const currency: CurrencyCode = state.user?.currencyCode || 'USD';

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
  const usableAmount = totalIncome - savingsTarget;
  const effectiveSavings = Math.max(0, remainingBalance);
  const goalProgress = savingsTarget > 0 ? Math.min(100, (effectiveSavings / savingsTarget) * 100) : 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  const spendableBudget = Math.max(0, usableAmount - totalExpenses);
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
    state, dispatch, totalExpenses, totalIncome, remainingBalance,
    savingsAmount: effectiveSavings, goalProgress, dailySpendingLimit,
    categoryTotals, todayExpenses, isOverspending, usableAmount, currency,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
