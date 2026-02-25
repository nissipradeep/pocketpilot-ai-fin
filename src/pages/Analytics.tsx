import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORIES, Category } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import BottomNav from '@/components/BottomNav';

const CHART_COLORS = [
  'hsl(25, 90%, 55%)', 'hsl(210, 80%, 50%)', 'hsl(280, 70%, 55%)', 'hsl(330, 70%, 55%)',
  'hsl(45, 85%, 50%)', 'hsl(0, 70%, 50%)', 'hsl(200, 80%, 45%)', 'hsl(160, 30%, 50%)',
];

const Analytics = () => {
  const { state, totalExpenses, totalIncome, categoryTotals, savingsAmount, goalProgress } = useStore();

  const pieData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: CATEGORIES[key as Category].label,
      value,
      icon: CATEGORIES[key as Category].icon,
    }));

  // Daily spending trend (last 14 days)
  const dailyData = (() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const key = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (key in days) days[key] += t.amount;
      });
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  })();

  // Savings projection
  const savingsProjection = (() => {
    const target = state.user?.savingsTarget || 0;
    const deadline = state.user?.goalDeadline;
    if (!deadline || !target) return [];

    const now = new Date();
    const end = new Date(deadline);
    const monthsLeft = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + end.getMonth() - now.getMonth());
    const monthlySavings = savingsAmount;

    return Array.from({ length: Math.min(monthsLeft + 1, 12) }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        projected: Math.min(target, monthlySavings * (i + 1)),
        target,
      };
    });
  })();

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="page-container pt-6">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-5">
        <motion.h1 variants={itemVariants} className="text-xl font-bold font-display text-foreground">Analytics</motion.h1>

        {/* Summary cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="card-finance text-center">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value text-destructive">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="card-finance text-center">
            <p className="stat-label">Saved</p>
            <p className="stat-value text-income">${savingsAmount.toLocaleString()}</p>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants} className="card-finance">
          <p className="stat-label mb-3">Category Breakdown</p>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full grid grid-cols-2 gap-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{d.icon} {d.name}</span>
                    <span className="font-medium text-foreground ml-auto">${d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Spending Trend Line Chart */}
        <motion.div variants={itemVariants} className="card-finance">
          <p className="stat-label mb-3">Daily Spending (14 days)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Savings Projection */}
        {savingsProjection.length > 0 && (
          <motion.div variants={itemVariants} className="card-finance">
            <p className="stat-label mb-1">Savings Projection</p>
            <p className="text-xs text-muted-foreground mb-3">Goal: {state.user?.financialGoal} • {goalProgress.toFixed(0)}% done</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="projected" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Projected" />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--accent))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Analytics;
