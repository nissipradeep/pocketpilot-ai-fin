import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORIES, Category, formatCurrency, formatCurrencyShort } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, TrendingDown, Wallet, Target, AlertTriangle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AddTransaction from '@/components/AddTransaction';
import AIChatBot from '@/components/AIChatBot';
import BottomNav from '@/components/BottomNav';

const CHART_COLORS = [
  'hsl(25, 90%, 55%)', 'hsl(210, 80%, 50%)', 'hsl(280, 70%, 55%)', 'hsl(330, 70%, 55%)',
  'hsl(45, 85%, 50%)', 'hsl(0, 70%, 50%)', 'hsl(200, 80%, 45%)', 'hsl(160, 30%, 50%)',
];

const Dashboard = () => {
  const {
    state, totalExpenses, totalIncome, remainingBalance, savingsAmount,
    goalProgress, dailySpendingLimit, categoryTotals, todayExpenses, isOverspending, currency
  } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const user = state.user!;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const pieData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: CATEGORIES[key as Category].label, value, icon: CATEGORIES[key as Category].icon }));

  const recentTransactions = state.transactions.slice(0, 5);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="page-container pt-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-5">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{greeting},</p>
            <h1 className="text-xl font-bold font-display text-foreground">{user.fullName?.split(' ')[0] || user.username} 👋</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex h-10 w-10 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' }}>
            <Plus className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={itemVariants} className="card-elevated">
          <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">Monthly Income</p>
          <p className="text-3xl font-bold font-display text-primary-foreground mt-1">{formatCurrency(totalIncome, currency)}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-primary-foreground/10 p-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="h-3 w-3 text-primary-foreground/70" />
                <span className="text-[10px] text-primary-foreground/70">Spent</span>
              </div>
              <p className="text-sm font-bold text-primary-foreground font-display">{formatCurrencyShort(totalExpenses, currency)}</p>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-1 mb-1">
                <Wallet className="h-3 w-3 text-primary-foreground/70" />
                <span className="text-[10px] text-primary-foreground/70">Left</span>
              </div>
              <p className="text-sm font-bold text-primary-foreground font-display">{formatCurrencyShort(remainingBalance, currency)}</p>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-1 mb-1">
                <Target className="h-3 w-3 text-primary-foreground/70" />
                <span className="text-[10px] text-primary-foreground/70">Saved</span>
              </div>
              <p className="text-sm font-bold text-primary-foreground font-display">{formatCurrencyShort(savingsAmount, currency)}</p>
            </div>
          </div>
        </motion.div>

        {/* Overspending Alert */}
        {isOverspending && (
          <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'var(--gradient-danger)' }}>
            <AlertTriangle className="h-5 w-5 text-destructive-foreground shrink-0" />
            <p className="text-sm text-destructive-foreground">You've exceeded your daily limit of {formatCurrency(dailySpendingLimit, currency)}!</p>
          </motion.div>
        )}

        {/* Goal & Daily Limit */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="card-finance">
            <p className="stat-label">Goal Progress</p>
            <p className="stat-value mt-1">{goalProgress.toFixed(0)}%</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, goalProgress)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: 'var(--gradient-primary)' }} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground truncate">{user.financialGoal}</p>
          </div>
          <div className="card-finance">
            <p className="stat-label">Daily Limit</p>
            <p className="stat-value mt-1">{formatCurrencyShort(dailySpendingLimit, currency)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Today: <span className={todayExpenses > dailySpendingLimit ? 'text-destructive font-semibold' : 'text-foreground font-semibold'}>{formatCurrencyShort(todayExpenses, currency)}</span>
            </p>
          </div>
        </motion.div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <motion.div variants={itemVariants} className="card-finance">
            <p className="stat-label mb-3">Spending by Category</p>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground truncate flex-1">{d.icon} {d.name}</span>
                    <span className="font-medium text-foreground">{formatCurrencyShort(d.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="card-finance">
          <div className="flex items-center justify-between mb-3">
            <p className="stat-label">Recent Transactions</p>
            <a href="/transactions" className="text-xs text-primary font-medium">See All</a>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No transactions yet. Tap + to add one!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentTransactions.map(t => {
                const cat = CATEGORIES[t.category];
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-lg" style={{ boxShadow: 'var(--shadow-sm)' }}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <p className={`text-sm font-bold font-display ${t.type === 'expense' ? 'text-destructive' : 'text-income'}`}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      <AddTransaction open={showAdd} onClose={() => setShowAdd(false)} />
      <AIChatBot />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
