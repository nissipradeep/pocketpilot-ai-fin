import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Wallet, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SignIn = () => {
  const navigate = useNavigate();
  const { dispatch, syncData } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. SIGN IN WITH SUPABASE
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // 2. FETCH ALL DATA
      await syncData();

      toast.success("Welcome back!");
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      toast.error(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Could not send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container flex flex-col justify-center" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--gradient-primary)' }}>
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to PocketPilot</p>
        </div>

        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="input-finance pl-10" required disabled={isLoading} />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <button type="button" onClick={handleForgotPassword} className="text-xs text-primary font-medium hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-finance pr-12"
                required
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary-gradient mt-2 w-full flex items-center justify-center gap-2 text-white">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin text-white" /> Signing In...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
