export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'gift'
  | 'family'
  | 'other';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'AED' | 'GBP' | 'CAD' | 'SGD';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; flag: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  CAD: { symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  SGD: { symbol: '$', name: 'Singapore Dollar', flag: '🇸🇬' },
};

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO Timestamp
  type: 'income' | 'expense';
  currencyCode: CurrencyCode;
  imagePath?: string; // Link to the 'Proof' in Supabase Storage
  note?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  nationality: string;
  currencyCode: CurrencyCode;
  monthlyIncome: number;
  savingsTarget: number;
  financialGoal: string;
  goalDeadlineDate: string;
  darkMode: boolean;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface AppState {
  user: UserProfile | null;
  transactions: Transaction[];
  chatHistory: ChatMessage[];
  isAuthenticated: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  sessionId: string;
}

export const CATEGORIES: Record<Category, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Dining', icon: '🍕', color: 'cat-food' },
  transport: { label: 'Transport', icon: '🚗', color: 'cat-transport' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'cat-shopping' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: 'cat-entertainment' },
  bills: { label: 'Bills & Utilities', icon: '💡', color: 'cat-bills' },
  health: { label: 'Health', icon: '🏥', color: 'cat-health' },
  education: { label: 'Education', icon: '📚', color: 'cat-education' },
  gift: { label: 'Gift', icon: '🎁', color: 'cat-gift' },
  family: { label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'cat-family' },
  other: { label: 'Other', icon: '📌', color: 'cat-other' },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const { symbol } = CURRENCIES[currency] || { symbol: '$' };
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyShort(amount: number, currency: CurrencyCode = 'USD'): string {
  const { symbol } = CURRENCIES[currency] || { symbol: '$' };
  if (amount >= 100000) return `${symbol}${(amount / 1000).toFixed(0)}K`;
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
