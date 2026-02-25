export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'other';

export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const { symbol } = CURRENCIES[currency];
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyShort(amount: number, currency: CurrencyCode = 'USD'): string {
  const { symbol } = CURRENCIES[currency];
  if (amount >= 100000) return `${symbol}${(amount / 1000).toFixed(0)}K`;
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string
  type: 'income' | 'expense';
  currencyCode: CurrencyCode;
  imagePath?: string;
  extractedText?: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  sessionId: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  email?: string;
  monthlyIncome: number;
  savingsTarget: number;
  currencyCode: CurrencyCode;
  financialGoal: string;
  goalDeadlineMonths: number;
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

export const CATEGORIES: Record<Category, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Dining', icon: '🍕', color: 'cat-food' },
  transport: { label: 'Transport', icon: '🚗', color: 'cat-transport' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'cat-shopping' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: 'cat-entertainment' },
  bills: { label: 'Bills & Utilities', icon: '💡', color: 'cat-bills' },
  health: { label: 'Health', icon: '🏥', color: 'cat-health' },
  education: { label: 'Education', icon: '📚', color: 'cat-education' },
  other: { label: 'Other', icon: '📌', color: 'cat-other' },
};

export const CATEGORY_KEYWORDS: Record<string, Category> = {
  food: 'food', restaurant: 'food', cafe: 'food', coffee: 'food', lunch: 'food',
  dinner: 'food', breakfast: 'food', pizza: 'food', grocery: 'food', supermarket: 'food',
  chicken: 'food', zomato: 'food', swiggy: 'food', biryani: 'food',
  uber: 'transport', taxi: 'transport', bus: 'transport', metro: 'transport',
  fuel: 'transport', gas: 'transport', parking: 'transport', train: 'transport',
  ola: 'transport', petrol: 'transport', diesel: 'transport',
  amazon: 'shopping', shop: 'shopping', store: 'shopping', mall: 'shopping',
  clothes: 'shopping', shoes: 'shopping', flipkart: 'shopping',
  movie: 'entertainment', netflix: 'entertainment', spotify: 'entertainment',
  game: 'entertainment', concert: 'entertainment', party: 'entertainment',
  electricity: 'bills', water: 'bills', rent: 'bills', internet: 'bills',
  phone: 'bills', insurance: 'bills', recharge: 'bills',
  hospital: 'health', doctor: 'health', medicine: 'health', pharmacy: 'health', gym: 'health',
  school: 'education', course: 'education', book: 'education', tuition: 'education', university: 'education',
};

export function detectCategory(description: string): Category {
  const lower = description.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) return category;
  }
  return 'other';
}

/** Simulated OCR: extract currency symbol + amount from text */
export function extractAmountFromText(text: string): { amount: number; currency: CurrencyCode } | null {
  // Match ₹, $, € followed by numbers
  const patterns: { regex: RegExp; currency: CurrencyCode }[] = [
    { regex: /₹\s*([\d,]+(?:\.\d{1,2})?)/g, currency: 'INR' },
    { regex: /\$\s*([\d,]+(?:\.\d{1,2})?)/g, currency: 'USD' },
    { regex: /€\s*([\d,]+(?:\.\d{1,2})?)/g, currency: 'EUR' },
    { regex: /Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/gi, currency: 'INR' },
  ];

  for (const { regex, currency } of patterns) {
    const match = regex.exec(text);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) return { amount, currency };
    }
  }

  // Try bare number
  const bareMatch = /(\d{1,}(?:,\d{3})*(?:\.\d{1,2})?)/g.exec(text);
  if (bareMatch) {
    const amount = parseFloat(bareMatch[1].replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0) return { amount, currency: 'USD' };
  }

  return null;
}
