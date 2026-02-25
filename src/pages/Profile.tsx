import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { User, DollarSign, Target, Flag, Calendar, Moon, Sun, LogOut, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Profile = () => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const user = state.user!;

  const [editing, setEditing] = useState(false);
  const [income, setIncome] = useState(user.monthlyIncome.toString());
  const [savings, setSavings] = useState(user.savingsTarget.toString());
  const [goal, setGoal] = useState(user.financialGoal);
  const [deadline, setDeadline] = useState(user.goalDeadline);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      updates: {
        monthlyIncome: Number(income),
        savingsTarget: Number(savings),
        financialGoal: goal,
        goalDeadline: deadline,
      },
    });
    if (state.user) {
      localStorage.setItem(`pocketpilot_profile_${state.user.id}`, JSON.stringify({
        ...state.user,
        monthlyIncome: Number(income),
        savingsTarget: Number(savings),
        financialGoal: goal,
        goalDeadline: deadline,
      }));
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

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="page-container pt-6">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-5">
        <motion.h1 variants={itemVariants} className="text-xl font-bold font-display text-foreground">Profile</motion.h1>

        {/* Avatar & Name */}
        <motion.div variants={itemVariants} className="card-elevated flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20 text-2xl font-bold text-primary-foreground font-display">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-primary-foreground font-display">{user.name}</p>
            <p className="text-sm text-primary-foreground/70">{user.email}</p>
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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <DollarSign className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Monthly Income</p>
                {editing ? (
                  <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="input-finance mt-1 text-sm py-2" />
                ) : (
                  <p className="text-sm font-medium text-foreground">${Number(income).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Target className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Savings Target</p>
                {editing ? (
                  <input type="number" value={savings} onChange={e => setSavings(e.target.value)} className="input-finance mt-1 text-sm py-2" />
                ) : (
                  <p className="text-sm font-medium text-foreground">${Number(savings).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
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

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Calendar className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Goal Deadline</p>
                {editing ? (
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input-finance mt-1 text-sm py-2" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div variants={itemVariants} className="card-finance flex flex-col">
          <p className="stat-label mb-3">Settings</p>

          <button onClick={toggleDark} className="flex items-center gap-3 py-3 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive flex-1 text-left">Logout</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground pb-4">
          PocketPilot v1.0 • Made with ❤️
        </motion.p>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Profile;
