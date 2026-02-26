import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORIES, Category, formatCurrency } from '@/lib/types';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import AddTransaction from '@/components/AddTransaction';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Transactions = () => {
  const { state, dispatch, currency } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      dispatch({ type: 'DELETE_TRANSACTION', id });
      toast.success("Transaction deleted");
    } catch (err: any) {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = state.transactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, t) => {
    const key = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="page-container pt-6 pb-24">
      <div className="flex items-center justify-between mb-6 px-1">
        <h1 className="text-2xl font-bold font-display text-white">History</h1>
        <button onClick={() => setShowAdd(true)} className="flex h-10 w-10 items-center justify-center rounded-2xl text-primary-foreground shadow-glow active:scale-95 transition-all" style={{ background: 'var(--gradient-primary)' }}>
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="input-finance pl-11 text-sm h-12" />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
        <button onClick={() => setFilterCat('all')} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${filterCat === 'all' ? 'bg-primary text-white shadow-glow' : 'bg-secondary text-muted-foreground border border-white/5'}`}>All</button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
          <button key={key} onClick={() => setFilterCat(key)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${filterCat === key ? 'bg-primary text-white shadow-glow' : 'bg-secondary text-muted-foreground border border-white/5'}`}>
            <span>{cat.icon}</span> {cat.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-10">
          <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4 border border-white/5">
            <Search className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-bold text-white uppercase tracking-widest">No results</p>
          <p className="text-xs text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">{date}</p>
              <div className="flex flex-col gap-3">
                {txns.map((t, i) => {
                  const cat = CATEGORIES[t.category];
                  const isDeleting = deletingId === t.id;
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 rounded-2xl bg-secondary p-4 border border-white/5 shadow-card hover:border-primary/20 transition-all">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#222] text-xl border border-white/5">{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{t.description}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{cat.label}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-bold font-display ${t.type === 'expense' ? 'text-destructive' : 'text-income'}`}>
                          {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, currency)}
                        </p>
                        <button onClick={() => handleDelete(t.id)} disabled={isDeleting} className="h-9 w-9 flex items-center justify-center rounded-xl bg-destructive/5 text-destructive/40 hover:bg-destructive/10 hover:text-destructive transition-all">
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
