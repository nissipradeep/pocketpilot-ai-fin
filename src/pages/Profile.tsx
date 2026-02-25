import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, Flag, Calendar, Moon, Sun, LogOut, ChevronRight, Globe } from 'lucide-react';
import { formatCurrency, CURRENCIES, CurrencyCode } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

const Profile = () => {
  const { state, dispatch, currency } = useStore();
  const navigate = useNavigate();
  const user = state.user!;

  const [editing, setEditing] = useState(false);
  const [income, setIncome] = useState(user.monthlyIncome.toString());
  const [savings, setSavings] = useState(user.savingsTarget.toString());
  const [goal, setGoal] = useState(user.financialGoal);
  const [deadlineMonths, setDeadlineMonths] = useState(user.goalDeadlineMonths.toString());
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(user.currencyCode);

  const handleSave = () => {
    const updates = {
      monthlyIncome: Number(income),
      savingsTarget: Number(savings),
      financialGoal: goal,
      goalDeadlineMonths: Number(deadlineMonths),
      currencyCode: selectedCurrency,
    };
    dispatch({ type: 'UPDATE_PROFILE', updates });
    if (state.user) {
      localStorage.setItem(`pocketpilot_profile_${state.user.id}`, JSON.stringify({ ...state.user, ...updates }));
    }
    setEditing(false);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/signin');
  };

  const toggleDark = () => {
    dispatch({ type: 'SET_DARK_MODE', enabled: !user.darkMode });
  };

  const sym = CURRENCIES[currency].symbol;
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="page-container pt-6">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-5">
        <motion.h1 variants={itemVariants} className="text-xl font-bold font-display text-foreground">Profile</motion.h1>

        {/* Avatar & Name */}
        <motion.div variants={itemVariants} className="card-elevated flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20 text-2xl font-bold text-primary-foreground font-display">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-primary-foreground font-display">{user.fullName}</p>
            <p className="text-sm text-primary-foreground/70">@{user.username}</p>
          </div>
        </motion.div>

        {/* Financial Details */}
        <motion.div variants={itemVariants} className="card-finance flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="stat-label">Financial Details</p>
            <button onClick={() => editing ? handleSave() : setEditing(true)} className="text-xs font-medium text-primary">
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Income */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <DollarSign className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Monthly Income</p>
                {editing ? (
                  <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="input-finance mt-1 text-sm py-2" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{formatCurrency(Number(income), currency)}</p>
                )}
              </div>
            </div>

            {/* Savings Target */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <Target className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Savings Target</p>
                {editing ? (
                  <input type="number" value={savings} onChange={e => setSavings(e.target.value)} className="input-finance mt-1 text-sm py-2" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{formatCurrency(Number(savings), currency)}</p>
                )}
              </div>
            </div>

            {/* Currency */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <Globe className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Currency</p>
                {editing ? (
                  <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value as CurrencyCode)} className="input-finance mt-1 text-sm py-2">
                    {(Object.entries(CURRENCIES) as [CurrencyCode, typeof CURRENCIES[CurrencyCode]][]).map(([code, c]) => (
                      <option key={code} value={code}>{c.symbol} {code} — {c.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-foreground">{CURRENCIES[currency].symbol} {currency}</p>
                )}
              </div>
            </div>

            {/* Goal */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <Flag className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Financial Goal</p>
                {editing ? (
                  <input type="text" value={goal} onChange={e => setGoal(e.target.value)} className="input-finance mt-1 text-sm py-2" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{goal}</p>
                )}
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                <Calendar className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Goal Deadline</p>
                {editing ? (
                  <input type="number" value={deadlineMonths} onChange={e => setDeadlineMonths(e.target.value)} placeholder="months" className="input-finance mt-1 text-sm py-2" min="1" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{deadlineMonths} months</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div variants={itemVariants} className="card-finance flex flex-col">
          <p className="stat-label mb-3">Settings</p>

          <button onClick={toggleDark} className="flex items-center gap-3 py-3 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
              {user.darkMode ? <Moon className="h-5 w-5 text-secondary-foreground" /> : <Sun className="h-5 w-5 text-secondary-foreground" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">{user.darkMode ? 'On' : 'Off'}</p>
            </div>
            <div className={`h-7 w-12 rounded-full p-0.5 transition-colors duration-200 ${user.darkMode ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`h-6 w-6 rounded-full bg-card transition-transform duration-200 ${user.darkMode ? 'translate-x-5' : 'translate-x-0'}`} style={{ boxShadow: 'var(--shadow-sm)' }} />
            </div>
          </button>

          <button onClick={handleLogout} className="flex items-center gap-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive/10">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive flex-1 text-left">Logout</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground pb-4">
          PocketPilot v2.0 • Production Ready 🚀
        </motion.p>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Profile;
