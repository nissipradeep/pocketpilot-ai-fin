import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, Flag, Calendar, Moon, Sun, LogOut, ChevronRight, Globe, User as UserIcon } from 'lucide-react';
import { formatCurrency, CURRENCIES, CurrencyCode } from '@/lib/types';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Profile = () => {
  const { state, dispatch, currency, syncData } = useStore();
  const navigate = useNavigate();
  const user = state.user!;

  const [editing, setEditing] = useState(false);
  const [income, setIncome] = useState(user.monthlyIncome.toString());
  const [savings, setSavings] = useState(user.savingsTarget.toString());
  const [goal, setGoal] = useState(user.financialGoal);
  const [deadlineDate, setDeadlineDate] = useState(user.goalDeadlineDate ? user.goalDeadlineDate.split('T')[0] : '');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(user.currencyCode);

  const handleSave = async () => {
    const updates = {
      monthly_income: Number(income),
      savings_target: Number(savings),
      financial_goal: goal,
      goal_deadline_date: new Date(deadlineDate).toISOString(),
      currency_code: selectedCurrency,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_PROFILE', updates: {
        monthlyIncome: Number(income),
        savingsTarget: Number(savings),
        financialGoal: goal,
        goalDeadlineDate: new Date(deadlineDate).toISOString(),
        currencyCode: selectedCurrency,
      }});

      toast.success("Profile updated in cloud!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
    navigate('/signin');
  };

  const toggleDark = () => {
    dispatch({ type: 'SET_DARK_MODE', enabled: !user.darkMode });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="page-container pt-6 pb-24">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-5">
        <motion.h1 variants={itemVariants} className="text-2xl font-bold font-display text-foreground px-1">Profile</motion.h1>

        {/* Identity Card */}
        <motion.div variants={itemVariants} className="card-elevated flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white shadow-inner">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-white truncate">{user.fullName}</p>
            <p className="text-sm text-white/70">@{user.username}</p>
          </div>
        </motion.div>

        {/* Financial Info Section */}
        <motion.div variants={itemVariants} className="card-finance flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Financial Setup</p>
            </div>
            <button onClick={() => editing ? handleSave() : setEditing(true)} className="text-sm font-bold text-primary px-3 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Monthly Income</p>
                {editing ? <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="input-finance mt-1 h-10 py-0 text-sm" /> : <p className="text-base font-bold text-foreground">{formatCurrency(Number(income), currency)}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50"><Target className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Savings Target</p>
                {editing ? <input type="number" value={savings} onChange={e => setSavings(e.target.value)} className="input-finance mt-1 h-10 py-0 text-sm" /> : <p className="text-base font-bold text-foreground">{formatCurrency(Number(savings), currency)}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50"><Flag className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Financial Goal</p>
                {editing ? <input type="text" value={goal} onChange={e => setGoal(e.target.value)} className="input-finance mt-1 h-10 py-0 text-sm" /> : <p className="text-base font-bold text-foreground">{goal || 'None set'}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50"><Calendar className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Target Deadline</p>
                {editing ? <input type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} className="input-finance mt-1 h-10 py-0 text-sm" /> : <p className="text-base font-bold text-foreground">{formatDate(deadlineDate)}</p>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div variants={itemVariants} className="card-finance flex flex-col p-2">
          <button onClick={toggleDark} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-2xl transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50">
              {user.darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">Appearance</p>
              <p className="text-[10px] text-muted-foreground uppercase">{user.darkMode ? 'Dark Mode' : 'Light Mode'}</p>
            </div>
            <div className={`h-6 w-11 rounded-full p-1 transition-colors ${user.darkMode ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`h-4 w-4 rounded-full bg-white transition-transform ${user.darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>

          <button onClick={handleLogout} className="flex items-center gap-4 p-3 hover:bg-destructive/5 rounded-2xl transition-colors mt-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-bold text-destructive flex-1 text-left">Sign Out</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] py-4">
          PocketPilot AI • Cloud Secured
        </motion.p>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Profile;
