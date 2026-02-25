import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Wallet, Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    if (name.trim().length < 2) errs.push('Name must be at least 2 characters');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Invalid email address');
    if (password.length < 6) errs.push('Password must be at least 6 characters');
    if (password !== confirmPassword) errs.push('Passwords do not match');

    const users = JSON.parse(localStorage.getItem('pocketpilot_users') || '[]');
    if (users.some((u: any) => u.email === email)) errs.push('Email already registered');

    return errs;
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const id = crypto.randomUUID();
    const user = { id, name: name.trim(), email, password, createdAt: new Date().toISOString() };
    const users = JSON.parse(localStorage.getItem('pocketpilot_users') || '[]');
    users.push(user);
    localStorage.setItem('pocketpilot_users', JSON.stringify(users));

    const profile = {
      id,
      name: name.trim(),
      email,
      monthlyIncome: 0,
      savingsTarget: 0,
      financialGoal: '',
      goalDeadline: '',
      darkMode: false,
      onboardingComplete: false,
      createdAt: user.createdAt,
    };

    dispatch({ type: 'LOGIN', user: profile });
    navigate('/onboarding');
  };

  return (
    <div className="page-container flex flex-col justify-center" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--gradient-primary)' }}>
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Start your financial journey</p>
        </div>

        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive flex flex-col gap-1"
            >
              {errors.map((e, i) => <span key={i}>• {e}</span>)}
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="input-finance" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-finance" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input-finance pr-12"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="input-finance"
              required
            />
          </div>

          <button type="submit" className="btn-primary-gradient mt-2 w-full">
            Create Account
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
