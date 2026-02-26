import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, UserProfile, Transaction, Category, ChatMessage, CurrencyCode } from './types';
import { supabase } from './supabase';
import { toast } from 'sonner';

const STORAGE_KEY = 'pocketpilot_data';

type Action =
  | { type: 'LOGIN'; user: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; updates: Partial<UserProfile> }
  | { type: 'SET_TRANSACTIONS'; transactions: Transaction[] }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'SET_CHAT_HISTORY'; history: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'SET_DARK_MODE'; enabled: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, transactions: [], chatHistory: [], isAuthenticated: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: state.user ? { ...state.user, ...action.updates } : null };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) };
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.history };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.message] };
    case 'SET_DARK_MODE':
      return { ...state, user: state.user ? { ...state.user, darkMode: action.enabled } : null };
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
  syncData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, transactions: [], chatHistory: [], isAuthenticated: false });

  // 1. INITIAL DATA FETCH ON AUTH
  const syncData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      dispatch({ type: 'LOGIN', user: {
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        monthlyIncome: Number(profile.monthly_income),
        savingsTarget: Number(profile.savings_target),
        currencyCode: profile.currency_code as any,
        financialGoal: profile.financial_goal,
        goalDeadlineDate: profile.goal_deadline_date,
        darkMode: profile.dark_mode,
        onboardingComplete: profile.onboarding_complete,
        createdAt: profile.created_at
      }});
    }

    // Fetch Transactions
    const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (txs) {
      dispatch({ type: 'SET_TRANSACTIONS', transactions: txs.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        category: t.category as any,
        description: t.description,
        date: t.date,
        type: t.type as any,
        currencyCode: t.currency_code as any,
        note: t.note
      }))});
    }

    // Fetch Chat History
    const { data: chats } = await supabase.from('chat_messages').select('*').eq('user_id', user.id).order('timestamp', { ascending: true });
    if (chats) {
      dispatch({ type: 'SET_CHAT_HISTORY', history: chats.map(c => ({
        id: c.id,
        message: c.message,
        isUser: c.is_user,
        timestamp: c.timestamp,
        sessionId: c.session_id
      }))});
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // 2. SYNC PROFILE UPDATES
  useEffect(() => {
    if (state.user?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.user?.darkMode]);

  // DERIVED STATE CALCULATIONS
  const currency: CurrencyCode = state.user?.currencyCode || 'USD';
  const currentMonthTransactions = state.transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
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

  const categoryTotals = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<Category, number>);

  const today = new Date().toDateString();
  const todayExpenses = currentMonthTransactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today).reduce((sum, t) => sum + t.amount, 0);
  const isOverspending = todayExpenses > dailySpendingLimit && dailySpendingLimit > 0;

  const value: StoreContextType = {
    state, dispatch, totalExpenses, totalIncome, remainingBalance,
    savingsAmount: effectiveSavings, goalProgress, dailySpendingLimit,
    categoryTotals, todayExpenses, isOverspending, usableAmount, currency,
    syncData
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
