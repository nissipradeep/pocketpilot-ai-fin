import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORIES, Category } from '@/lib/types';
import { Plus, Trash2, Search, Filter } from 'lucide-react';
import AddTransaction from '@/components/AddTransaction';
import BottomNav from '@/components/BottomNav';

const Transactions = () => {
  const { state, dispatch } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');

  const filtered = state.transactions
    .filter(t => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat !== 'all' && t.category !== filterCat) return false;
      return true;
    });

  // Group by date
  const grouped = filtered.reduce((acc, t) => {
    const key = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="page-container pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold font-display text-foreground">Transactions</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary-gradient flex items-center gap-1.5 text-sm px-4 py-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="input-finance pl-10 text-sm"
        />
      </div>

      {/* Category filter */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCat('all')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
            filterCat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          All
        </button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilterCat(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              filterCat === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {cat.icon} {cat.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* List */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground mb-2">{date}</p>
              <div className="flex flex-col gap-2">
                {txns.map((t, i) => {
                  const cat = CATEGORIES[t.category];
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 rounded-2xl bg-card p-3 border border-border"
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-lg">
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{cat.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold font-display ${t.type === 'expense' ? 'text-destructive' : 'text-income'}`}>
                          {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_TRANSACTION', id: t.id })}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTransaction open={showAdd} onClose={() => setShowAdd(false)} />
      <BottomNav />
    </div>
  );
};

export default Transactions;
