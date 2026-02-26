import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORIES, Category, formatCurrency, formatCurrencyShort } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useMemo } from 'react';

const CHART_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#EF4444', '#71717A',
];

const Analytics = () => {
  const { state, totalExpenses, totalIncome, categoryTotals, savingsAmount, goalProgress, currency } = useStore();

  const pieData = useMemo(() => {
    return Object.entries(categoryTotals)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: CATEGORIES[key as Category].label, value, icon: CATEGORIES[key as Category].icon }));
  }, [categoryTotals]);

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
      const key = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in days) days[key] += t.amount;
    });
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  }, [state.transactions]);

  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="page-container pt-6 pb-24">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
          <h1 className="text-2xl font-bold font-display text-white">Analytics</h1>
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </motion.div>

        {/* High Level Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="card-finance border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-destructive" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Spent</p>
            </div>
            <p className="text-xl font-bold text-white font-display">{formatCurrencyShort(totalExpenses, currency)}</p>
          </div>
          <div className="card-finance border-l-4 border-l-income">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-3 w-3 text-income" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Saved</p>
            </div>
            <p className="text-xl font-bold text-white font-display">{formatCurrencyShort(savingsAmount, currency)}</p>
          </div>
        </motion.div>

        {/* Spending Area Chart */}
        <motion.div variants={itemVariants} className="card-finance">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spending Velocity</p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-income bg-income/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              14 DAYS
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161618', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={itemVariants} className="card-finance">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">Expense Distribution</p>
          {pieData.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-muted-foreground">No data available for breakdown</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161618', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[11px] font-medium text-muted-foreground truncate flex-1">{d.icon} {d.name}</span>
                    <span className="text-[11px] font-bold text-white">{formatCurrencyShort(d.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] py-6 opacity-50">
          Analytics Engine • V2.0.4
        </motion.p>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Analytics;
