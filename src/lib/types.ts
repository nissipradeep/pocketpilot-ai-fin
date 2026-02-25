export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'other';

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string
  type: 'income' | 'expense';
  receiptUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  savingsTarget: number;
  financialGoal: string;
  goalDeadline: string; // ISO date
  darkMode: boolean;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface AppState {
  user: UserProfile | null;
  transactions: Transaction[];
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
  food: 'food', restaurant: 'food', cafe: 'food', coffee: 'food', lunch: 'food', dinner: 'food', breakfast: 'food', pizza: 'food', grocery: 'food', supermarket: 'food',
  uber: 'transport', taxi: 'transport', bus: 'transport', metro: 'transport', fuel: 'transport', gas: 'transport', parking: 'transport', train: 'transport',
  amazon: 'shopping', shop: 'shopping', store: 'shopping', mall: 'shopping', clothes: 'shopping', shoes: 'shopping',
  movie: 'entertainment', netflix: 'entertainment', spotify: 'entertainment', game: 'entertainment', concert: 'entertainment', party: 'entertainment',
  electricity: 'bills', water: 'bills', rent: 'bills', internet: 'bills', phone: 'bills', insurance: 'bills',
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
