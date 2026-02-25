import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Plus, Camera, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Category, CATEGORIES, detectCategory, Transaction } from '@/lib/types';

interface AddTransactionProps {
  open: boolean;
  onClose: () => void;
}

const AddTransaction = ({ open, onClose }: AddTransactionProps) => {
  const { dispatch } = useStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [autoDetected, setAutoDetected] = useState(false);

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    const detected = detectCategory(val);
    setCategory(detected);
    setAutoDetected(detected !== 'other');
  };

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      category,
      description: description.trim() || CATEGORIES[category].label,
      date: new Date().toISOString(),
      type,
    };

    dispatch({ type: 'ADD_TRANSACTION', transaction });
    setAmount('');
    setDescription('');
    setCategory('other');
    setAutoDetected(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px] rounded-t-3xl bg-card p-5 pb-8"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-foreground">Add Transaction</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Type toggle */}
            <div className="mb-4 flex rounded-xl bg-muted p-1">
              <button
                onClick={() => setType('expense')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  type === 'expense' ? 'bg-card text-destructive' : 'text-muted-foreground'
                }`}
                style={type === 'expense' ? { boxShadow: 'var(--shadow-sm)' } : undefined}
              >
                <ArrowUpRight className="h-4 w-4" /> Expense
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
                  type === 'income' ? 'bg-card text-income' : 'text-muted-foreground'
                }`}
                style={type === 'income' ? { boxShadow: 'var(--shadow-sm)' } : undefined}
              >
                <ArrowDownLeft className="h-4 w-4" /> Income
              </button>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-finance pl-9 text-xl font-display"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => handleDescriptionChange(e.target.value)}
                placeholder="e.g., Lunch at restaurant"
                className="input-finance"
              />
              {autoDetected && (
                <p className="mt-1 text-xs text-primary">
                  Auto-detected: {CATEGORIES[category].icon} {CATEGORIES[category].label}
                </p>
              )}
            </div>

            {/* Category grid */}
            {type === 'expense' && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => { setCategory(key); setAutoDetected(false); }}
                      className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs transition-all duration-200 ${
                        category === key
                          ? 'bg-primary/10 ring-2 ring-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-muted-foreground font-medium truncate w-full text-center" style={{ fontSize: '10px' }}>
                        {cat.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={!amount || Number(amount) <= 0} className="btn-primary-gradient w-full disabled:opacity-40">
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;
