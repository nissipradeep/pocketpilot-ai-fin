import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Plus, ArrowDownLeft, ArrowUpRight, Camera, FileText } from 'lucide-react';
import { Category, CATEGORIES, detectCategory, Transaction, extractAmountFromText, CurrencyCode, CURRENCIES } from '@/lib/types';

interface AddTransactionProps {
  open: boolean;
  onClose: () => void;
}

const AddTransaction = ({ open, onClose }: AddTransactionProps) => {
  const { dispatch, currency } = useStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [autoDetected, setAutoDetected] = useState(false);
  const [ocrMode, setOcrMode] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [ocrDetectedAmount, setOcrDetectedAmount] = useState('');
  const [ocrDetectedCurrency, setOcrDetectedCurrency] = useState<CurrencyCode>(currency);
  const fileRef = useRef<HTMLInputElement>(null);

  const sym = CURRENCIES[currency].symbol;

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    const detected = detectCategory(val);
    setCategory(detected);
    setAutoDetected(detected !== 'other');
  };

  const handleOcrProcess = (text: string) => {
    setOcrText(text);
    const result = extractAmountFromText(text);
    if (result) {
      setOcrDetectedAmount(result.amount.toString());
      setOcrDetectedCurrency(result.currency);
      setAmount(result.amount.toString());
    }
    const detected = detectCategory(text);
    setCategory(detected);
    setAutoDetected(detected !== 'other');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate OCR by reading filename + generating receipt text
    const fileName = file.name.toLowerCase();
    let simulatedText = '';

    if (fileName.includes('food') || fileName.includes('restaurant') || fileName.includes('zomato') || fileName.includes('swiggy')) {
      simulatedText = `Restaurant Receipt\nTotal: ${sym}450.00\nFood order - Zomato delivery`;
    } else if (fileName.includes('uber') || fileName.includes('ola') || fileName.includes('transport')) {
      simulatedText = `Uber Ride Receipt\nFare: ${sym}125.50\nTrip completed`;
    } else if (fileName.includes('amazon') || fileName.includes('shop') || fileName.includes('flipkart')) {
      simulatedText = `Amazon Order\nTotal: ${sym}2,499.00\nShopping purchase`;
    } else {
      simulatedText = `Receipt\nAmount: ${sym}${(Math.random() * 500 + 50).toFixed(2)}\nGeneral purchase`;
    }

    handleOcrProcess(simulatedText);
    setOcrMode(true);
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
      currencyCode: currency,
      extractedText: ocrText || undefined,
      note: description.trim() || undefined,
    };

    dispatch({ type: 'ADD_TRANSACTION', transaction });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount(''); setDescription(''); setCategory('other'); setAutoDetected(false);
    setOcrMode(false); setOcrText(''); setOcrDetectedAmount('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px] rounded-t-3xl bg-card p-5 pb-8 overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)', maxHeight: '85vh' }}>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-foreground">Add Transaction</h3>
              <button onClick={() => { resetForm(); onClose(); }} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* OCR Upload */}
            <div className="mb-4 flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/50 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Camera className="h-4 w-4 text-primary" /> Scan Receipt
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>

            {/* OCR Result */}
            {ocrMode && ocrText && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-2xl bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">OCR Detected</span>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap mb-2">{ocrText}</p>
                {ocrDetectedAmount && (
                  <p className="text-sm font-bold text-foreground">
                    Detected: {CURRENCIES[ocrDetectedCurrency].symbol}{ocrDetectedAmount} ({ocrDetectedCurrency})
                  </p>
                )}
              </motion.div>
            )}

            {/* Type toggle */}
            <div className="mb-4 flex rounded-2xl bg-muted p-1">
              <button onClick={() => setType('expense')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${type === 'expense' ? 'bg-card text-destructive' : 'text-muted-foreground'}`}
                style={type === 'expense' ? { boxShadow: 'var(--shadow-sm)' } : undefined}>
                <ArrowUpRight className="h-4 w-4" /> Expense
              </button>
              <button onClick={() => setType('income')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${type === 'income' ? 'bg-card text-income' : 'text-muted-foreground'}`}
                style={type === 'income' ? { boxShadow: 'var(--shadow-sm)' } : undefined}>
                <ArrowDownLeft className="h-4 w-4" /> Income
              </button>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">{sym}</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="input-finance pl-9 text-xl font-display" min="0" step="0.01" />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <input type="text" value={description} onChange={e => handleDescriptionChange(e.target.value)} placeholder="e.g., Lunch at restaurant" className="input-finance" />
              {autoDetected && (
                <p className="mt-1 text-xs text-primary">Auto-detected: {CATEGORIES[category].icon} {CATEGORIES[category].label}</p>
              )}
            </div>

            {/* Category grid */}
            {type === 'expense' && (
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
                    <button key={key} onClick={() => { setCategory(key); setAutoDetected(false); }}
                      className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 text-xs transition-all duration-200 ${category === key ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}>
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-muted-foreground font-medium truncate w-full text-center" style={{ fontSize: '10px' }}>{cat.label.split(' ')[0]}</span>
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
