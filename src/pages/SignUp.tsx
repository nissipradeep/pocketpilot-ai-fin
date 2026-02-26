import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Wallet, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    if (fullName.trim().length < 2) errs.push('Full name must be at least 2 characters');
    if (!email.includes('@')) errs.push('Enter a valid email address');
    if (password.length < 6) errs.push('Password must be at least 6 characters');
    if (password !== confirmPassword) errs.push('Passwords do not match');
    return errs;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    setErrors([]);

    try {
      // 1. SIGN UP WITH SUPABASE AUTH
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("Sign up failed");

      // 2. CREATE PROFILE IN DATABASE
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          full_name: fullName.trim(),
          username: email.split('@')[0],
          monthly_income: 0,
          savings_target: 0,
          onboarding_complete: false
        }]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // We don't throw here because the user is still created in Auth
      }

      toast.success("Account created! Check your email for confirmation.");

      const profile = {
        id: data.user.id,
        fullName: fullName.trim(),
        username: email.split('@')[0],
        monthlyIncome: 0,
        savingsTarget: 0,
        currencyCode: 'USD' as const,
        financialGoal: '',
        goalDeadlineDate: new Date().toISOString(),
        darkMode: false,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'LOGIN', user: profile });
      navigate('/onboarding');

    } catch (err: any) {
      setErrors([err.message || 'An error occurred during sign up']);
      toast.error(err.message || "Failed to create account");
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
          <h1 className="text-2xl font-bold font-display text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Start your Full-Stack journey</p>
        </div>

        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
          {errors.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive flex flex-col gap-1">
              {errors.map((e, i) => <span key={i}>• {e}</span>)}
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="input-finance" required disabled={isLoading} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="input-finance pl-10" required disabled={isLoading} />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
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
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="input-finance" required disabled={isLoading} />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary-gradient mt-2 w-full flex items-center justify-center gap-2">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-primary hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
