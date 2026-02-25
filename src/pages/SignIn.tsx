import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Wallet, Eye, EyeOff } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check localStorage for registered users
    const users = JSON.parse(localStorage.getItem('pocketpilot_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);

    if (found) {
      const savedState = localStorage.getItem(`pocketpilot_profile_${found.id}`);
      const profile = savedState ? JSON.parse(savedState) : {
        id: found.id,
        name: found.name,
        email: found.email,
        monthlyIncome: 0,
        savingsTarget: 0,
        financialGoal: '',
        goalDeadline: '',
        darkMode: false,
        onboardingComplete: false,
        createdAt: found.createdAt,
      };
      dispatch({ type: 'LOGIN', user: profile });
      navigate(profile.onboardingComplete ? '/dashboard' : '/onboarding');
    } else {
      setError('Invalid email or password');
    }
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
          <h1 className="text-2xl font-bold font-display text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to PocketPilot</p>
        </div>

        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-finance"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-finance pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary-gradient mt-2 w-full">
            Sign In
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
