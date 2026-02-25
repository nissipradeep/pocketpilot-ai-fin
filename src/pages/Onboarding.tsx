import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { DollarSign, Target, Flag, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = [
  { title: 'Monthly Income', subtitle: 'How much do you earn per month?', icon: DollarSign },
  { title: 'Savings Target', subtitle: 'How much do you want to save monthly?', icon: Target },
  { title: 'Financial Goal', subtitle: 'What are you saving for?', icon: Flag },
  { title: 'Goal Deadline', subtitle: 'When do you want to achieve this?', icon: Calendar },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(state.user?.monthlyIncome?.toString() || '');
  const [savings, setSavings] = useState(state.user?.savingsTarget?.toString() || '');
  const [goal, setGoal] = useState(state.user?.financialGoal || '');
  const [deadline, setDeadline] = useState(state.user?.goalDeadline || '');

  const canProceed = () => {
    switch (step) {
      case 0: return Number(income) > 0;
      case 1: return Number(savings) > 0 && Number(savings) <= Number(income);
      case 2: return goal.trim().length > 0;
      case 3: return deadline.length > 0;
      default: return false;
    }
  };

  const handleFinish = () => {
    const updates = {
      monthlyIncome: Number(income),
      savingsTarget: Number(savings),
      financialGoal: goal.trim(),
      goalDeadline: deadline,
      onboardingComplete: true,
    };
    // Save profile to localStorage first so ProtectedRoute sees it
    if (state.user) {
      const updatedProfile = { ...state.user, ...updates };
      localStorage.setItem(`pocketpilot_profile_${state.user.id}`, JSON.stringify(updatedProfile));
    }
    dispatch({ type: 'UPDATE_PROFILE', updates });
    // Use setTimeout to let state propagate before navigation
    setTimeout(() => navigate('/dashboard'), 50);
  };

  const StepIcon = steps[step].icon;

  return (
    <div className="page-container flex flex-col justify-center" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= step ? 'var(--gradient-primary)' : undefined,
              backgroundColor: i > step ? 'hsl(var(--muted))' : undefined,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <StepIcon className="h-7 w-7 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold font-display text-foreground">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  placeholder="5000"
                  className="input-finance pl-8 text-center text-2xl font-display"
                  min="0"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={savings}
                  onChange={e => setSavings(e.target.value)}
                  placeholder="1000"
                  className="input-finance pl-8 text-center text-2xl font-display"
                  min="0"
                  max={income}
                />
              </div>
              {Number(savings) > Number(income) && (
                <p className="text-xs text-destructive text-center">Can't exceed your income</p>
              )}
            </div>
          )}

          {step === 2 && (
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g., Emergency fund, Vacation, New car"
              className="input-finance text-center"
            />
          )}

          {step === 3 && (
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="input-finance text-center"
              min={new Date().toISOString().split('T')[0]}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => (step < 3 ? setStep(s => s + 1) : handleFinish())}
          disabled={!canProceed()}
          className="btn-primary-gradient flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {step < 3 ? 'Continue' : 'Get Started'}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
