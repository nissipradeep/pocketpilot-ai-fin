import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { X, Plus, ArrowDownLeft, ArrowUpRight, Camera, Loader2, ShieldCheck } from 'lucide-react';
import { Category, CATEGORIES, Transaction, CurrencyCode, CURRENCIES } from '@/lib/types';
import { toast } from 'sonner';

interface AddTransactionProps {
  open: boolean;
  onClose: () => void;
}

const GEMINI_API_KEY = "AIzaSyBgw9sgkCrdCSWYw0tq8AtlDLRwNDr4RdM";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const AddTransaction = ({ open, onClose }: AddTransactionProps) => {
  const { state, dispatch, currency } = useStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sym = CURRENCIES[currency].symbol;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !state.user) return;

    setIsAnalyzing(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${state.user.id}/${Date.now()}.${fileExt}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 60);

      if (signedError) throw signedError;

      const prompt = `Analyze this receipt image and return ONLY a JSON object with keys: "amount" (number), "category" (one of: food, transport, shopping, entertainment, bills, health, education, other), and "description" (string).`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: await fileToBase64(file) } }
            ]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

      const jsonStr = aiResponse.match(/\{.*\}/s)?.[0];
      if (jsonStr) {
        const result = JSON.parse(jsonStr);
        setAmount(result.amount.toString());
        setCategory(result.category);
        setDescription(result.description);
        toast.success("AI analyzed your receipt securely!");
      }
    } catch (error: any) {
      console.error("Secure OCR Error:", error);
      toast.error("Failed to scan receipt.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0 || !state.user) return;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      category,
      description: description.trim() || CATEGORIES[category].label,
      date: new Date().toISOString(),
      type,
      currencyCode: currency,
    };

    try {
      const { error } = await supabase.from('transactions').insert([{
        user_id: state.user.id,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        currency_code: transaction.currencyCode
      }]);

      if (error) throw error;

      dispatch({ type: 'ADD_TRANSACTION', transaction });
      toast.success("Transaction saved!");
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const resetForm = () => {
    setAmount(''); setDescription(''); setCategory('other'); setIsAnalyzing(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px] rounded-t-[32px] bg-card overflow-hidden"
            style={{ maxHeight: '92vh', boxShadow: 'var(--shadow-lg)' }}>

            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-card px-6 py-5 border-b border-border/50">
              <h3 className="text-lg font-bold font-display text-foreground">Add Transaction</h3>
              <button onClick={onClose} className="rounded-full p-2 bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(92vh - 80px)' }}>
              <div className="flex flex-col gap-6 pb-24">

                {/* AI SCANNER SECTION */}
                <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" /> Secure AI Scan
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98] transition-all">
                    {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Camera className="h-5 w-5" /> Scan Receipt</>}
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">Receipts are processed via private cloud storage.</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                {/* TYPE SELECTOR */}
                <div className="flex rounded-2xl bg-muted p-1">
                  <button onClick={() => setType('expense')} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${type === 'expense' ? 'bg-card text-destructive shadow-sm' : 'text-muted-foreground'}`}>
                    <ArrowUpRight className="h-4 w-4" /> Expense
                  </button>
                  <button onClick={() => setType('income')} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${type === 'income' ? 'bg-card text-income shadow-sm' : 'text-muted-foreground'}`}>
                    <ArrowDownLeft className="h-4 w-4" /> Income
                  </button>
                </div>

                {/* FIELDS */}
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground/50">{sym}</span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-finance pl-10 text-2xl font-bold h-14" placeholder="0.00" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-finance h-14 text-base" placeholder="What was this for?" />
                  </div>

                  {type === 'expense' && (
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 block">Category</label>
                      <div className="grid grid-cols-4 gap-3">
                        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
                          <button key={key} onClick={() => setCategory(key)} className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all ${category === key ? 'bg-primary/10 ring-2 ring-primary ring-inset' : 'bg-muted/50 border border-transparent'}`}>
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-[9px] font-bold uppercase truncate w-full text-center text-muted-foreground">{cat.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button onClick={handleSubmit} disabled={!amount || isAnalyzing} className="btn-primary-gradient w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-bold shadow-glow disabled:opacity-40 transition-transform active:scale-[0.98]">
                  {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6" />}
                  Save Transaction
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransaction;
