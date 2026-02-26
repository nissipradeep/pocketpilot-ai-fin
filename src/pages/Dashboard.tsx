import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORIES, Category, formatCurrency, formatCurrencyShort } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Plus, TrendingDown, Wallet, Target, AlertTriangle, Sparkles, BarChart3, PlaneTakeoff, Info, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import AddTransaction from '@/components/AddTransaction';
import AIChatBot from '@/components/AIChatBot';
import BottomNav from '@/components/BottomNav';
import { useNavigate, Navigate } from 'react-router-dom';

const CHART_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#EF4444', '#71717A',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    state, totalExpenses, totalIncome, remainingBalance, savingsAmount,
    goalProgress, dailySpendingLimit, categoryTotals, todayExpenses, isOverspending, currency
  } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  // SAFETY GUARD: If state is loading or user is null, show a loader instead of crashing
  if (!state.isAuthenticated) return <Navigate to="/signin" replace />;
  if (!state.user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Loading Profile...</p>
      </div>
    );
  }

  const user = state.user;

  const aiInsight = useMemo(() => {
    if (state.transactions.length === 0) return "Your financial flight is ready. Scan your first receipt to take off! 🦅";
    if (isOverspending) return "Daily limit exceeded! Skip the non-essentials today to stay on track for your goal. 📉";
    if (goalProgress > 80) return "You're almost there! Your goal is within reach. Keep the momentum! 🚀";
    if (totalExpenses < (totalIncome * 0.3)) return "Great job! You've spent less than 30% of your income so far. 💎";
    return "Your spending is stable. Want to see if you can save an extra 5% this month? 🧠";
  }, [state.transactions.length, isOverspending, goalProgress, totalExpenses, totalIncome]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const pieData = useMemo(() => {
    return Object.entries(categoryTotals)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: CATEGORIES[key as Category].label, value, icon: CATEGORIES[key as Category].icon }));
  }, [categoryTotals]);

  const last7Days = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const amount = state.transactions
        .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === d.toDateString())
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: dayName, amount };
    });
  }, [state.transactions]);

  const recentTransactions = state.transactions.slice(0, 5);
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="page-container pt-6">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-5 pb-24">

        <motion.div variants={itemVariants} className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3 items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs font-medium text-primary-foreground leading-relaxed">
            {aiInsight}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{greeting}</p>
            <h1 className="text-2xl font-bold font-display text-white mt-0.5">{user.fullName?.split(' ')[0] || user.username} 👋</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-glow active:scale-95 transition-all" style={{ background: 'var(--gradient-primary)' }}>
            <Plus className="h-6 w-6" />
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="card-elevated group cursor-pointer overflow-hidden">
          <motion.div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all" />
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Monthly Income</p>
          <p className="text-4xl font-bold font-display text-white mt-1.5">{formatCurrency(totalIncome, currency)}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/5">
              <span className="text-[9px] font-bold text-white/50 block mb-1 uppercase tracking-tighter">Spent</span>
              <p className="text-sm font-bold text-white font-display">{formatCurrencyShort(totalExpenses, currency)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/5">
              <span className="text-[9px] font-bold text-white/50 block mb-1 uppercase tracking-tighter">Left</span>
              <p className="text-sm font-bold text-white font-display">{formatCurrencyShort(remainingBalance, currency)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/5">
              <span className="text-[9px] font-bold text-white/50 block mb-1 uppercase tracking-tighter">Saved</span>
              <p className="text-sm font-bold text-white font-display">{formatCurrencyShort(savingsAmount, currency)}</p>
            </div>
          </div>
        </motion.div>

        {state.transactions.length > 0 && (
          <motion.div variants={itemVariants} className="card-finance">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Trends</p>
              </div>
              <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717A', fontWeight: 600 }} dy={10} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }}
                    contentStyle={{ backgroundColor: '#161618', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 6, 6]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="card-finance">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Goal Progress</p>
            <div className="flex items-end justify-between mb-1">
              <span className="text-2xl font-bold text-white">{goalProgress.toFixed(0)}%</span>
              <span className="text-[10px] text-muted-foreground uppercase">{user.financialGoal}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, goalProgress)}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full" style={{ background: 'var(--gradient-primary)' }} />
            </div>
          </motion.div>

          {pieData.length > 0 && (
            <motion.div variants={itemVariants} className="card-finance">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Breakdown</p>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div variants={itemVariants} className="card-finance flex flex-col min-h-[200px]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</p>
            {state.transactions.length > 0 && (
              <button onClick={() => navigate('/transactions')} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">See All</button>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center px-6">
              <div className="h-16 w-16 rounded-3xl bg-secondary/50 flex items-center justify-center">
                <PlaneTakeoff className="h-8 w-8 text-primary/40" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Ready for Takeoff</p>
                <p className="text-xs text-muted-foreground mt-1">Your transaction history is empty. Scan a receipt to start your journey.</p>
              </div>
              <button onClick={() => setShowAdd(true)} className="mt-2 text-xs font-bold text-primary underline underline-offset-4">Scan Receipt Now</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {CATEGORIES[t.category]?.icon || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{t.description}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.type === 'expense' ? 'text-destructive' : 'text-income'}`}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrencyShort(t.amount, currency)}
                    </p>
                  </div>
                </div>
              ))}
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
