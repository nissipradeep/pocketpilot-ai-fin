import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { DollarSign, Target, Flag, Calendar, ArrowRight, ArrowLeft, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const steps = [
  { title: 'Privacy First', subtitle: 'Our security commitment to you', icon: ShieldCheck },
  { title: 'Nationality', subtitle: 'Where are you from?', icon: Globe },
  { title: 'Currency', subtitle: 'Select your preferred currency', icon: Globe },
  { title: 'Monthly Income', subtitle: 'How much do you earn per month?', icon: DollarSign },
  { title: 'Savings Target', subtitle: 'How much do you want to save monthly?', icon: Target },
  { title: 'Financial Goal', subtitle: 'What are you saving for?', icon: Flag },
  { title: 'Goal Deadline', subtitle: 'When do you want to achieve this?', icon: Calendar },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [nationality, setNationality] = useState(state.user?.nationality || '');
  const [income, setIncome] = useState(state.user?.monthlyIncome?.toString() || '');
  const [savings, setSavings] = useState(state.user?.savingsTarget?.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(state.user?.currencyCode || 'USD');
  const [goal, setGoal] = useState(state.user?.financialGoal || '');

  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const [deadlineDate, setDeadlineDate] = useState(state.user?.goalDeadlineDate ? state.user.goalDeadlineDate.split('T')[0] : defaultDate.toISOString().split('T')[0]);

  const canProceed = () => {
    switch (step) {
      case 0: return agreed;
      case 1: return nationality.trim().length > 1;
      case 2: return true;
      case 3: return Number(income) > 0;
      case 4: return Number(savings) > 0;
      case 5: return goal.trim().length > 0;
      case 6: return deadlineDate.length > 0;
      default: return false;
    }
  };

  const handleFinish = async () => {
    const updates = {
      nationality: nationality.trim(),
      monthly_income: Number(income),
      savings_target: Number(savings),
      currency_code: currency,
      financial_goal: goal.trim(),
      goal_deadline_date: new Date(deadlineDate).toISOString(),
      onboarding_complete: true,
    };

    if (state.user) {
      try {
        const { error } = await supabase.from('profiles').update(updates).eq('id', state.user.id);
        if (error) throw error;

        dispatch({ type: 'UPDATE_PROFILE', updates: {
          nationality: nationality.trim(),
          monthlyIncome: Number(income),
          savingsTarget: Number(savings),
          currencyCode: currency,
          financialGoal: goal.trim(),
          goalDeadlineDate: new Date(deadlineDate).toISOString(),
          onboardingComplete: true
        }});

        toast.success("Identity verified. Welcome aboard!");
        navigate('/dashboard');
      } catch (err: any) {
        toast.error(err.message || "Failed to save profile");
      }
    }
  };

  const StepIcon = steps[step].icon;
  const sym = CURRENCIES[currency].symbol;

  return (
    <div className="page-container flex flex-col justify-center" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="mb-8 flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= step ? 'var(--gradient-primary)' : undefined, backgroundColor: i > step ? 'hsl(var(--muted))' : undefined }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <StepIcon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="bg-secondary/50 rounded-3xl p-5 border border-white/5 space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="text-white font-bold">Banking-Grade Security:</span> Your data is protected by Supabase Row Level Security (RLS). No one—not even developers—can access your files.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="text-white font-bold">Privacy-First AI:</span> Our Vision AI is instructed to ignore and never store sensitive bank numbers, CVVs, or card details.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="text-white font-bold">Encryption:</span> Receipts are stored in a private cloud vault and accessed only via expiring temporary links.</p>
                </div>
              </div>
              <button
                onClick={() => setAgreed(!agreed)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${agreed ? 'bg-primary/10 border-primary text-white' : 'bg-secondary border-white/5 text-muted-foreground'}`}
              >
                <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${agreed ? 'bg-primary border-primary' : 'border-white/20'}`}>
                  {agreed && <CheckCircle2 className="h-4 w-4 text-white" />}
                </div>
                <span className="text-sm font-medium">I agree to the Security & Privacy Terms</span>
              </button>
            </div>
          )}

          {step === 1 && (
            <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. Indian, American, British" className="input-finance text-center" />
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              {(Object.entries(CURRENCIES) as [CurrencyCode, typeof CURRENCIES[CurrencyCode]][]).map(([code, cur]) => (
                <button key={code} onClick={() => setCurrency(code)}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 ${currency === code ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}
                >
                  <span className="text-2xl font-bold font-display">{cur.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{code} ({cur.symbol})</p>
                    <p className="text-xs text-muted-foreground">{cur.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{sym}</span>
              <input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="5000" className="input-finance pl-8 text-center text-2xl font-display" min="0" />
            </div>
          )}

          {step === 4 && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{sym}</span>
              <input type="number" value={savings} onChange={e => setSavings(e.target.value)} placeholder="1000" className="input-finance pl-8 text-center text-2xl font-display" min="0" />
            </div>
          )}

          {step === 5 && (
            <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g., Emergency fund, Vacation, New car" className="input-finance text-center" />
          )}

          {step === 6 && (
            <div className="flex flex-col gap-2">
              <input type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} className="input-finance text-center text-lg font-display" min={new Date().toISOString().split('T')[0]} />
              <p className="text-xs text-muted-foreground text-center">Target achievement date</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <button onClick={() => (step < steps.length - 1 ? setStep(s => s + 1) : handleFinish())} disabled={!canProceed()} className="btn-primary-gradient flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
          {step < steps.length - 1 ? (step === 0 ? 'Accept & Continue' : 'Continue') : 'Get Started'}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
