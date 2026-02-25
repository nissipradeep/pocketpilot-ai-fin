import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Wallet } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (state.isAuthenticated) {
        navigate(state.user?.onboardingComplete ? '/dashboard' : '/onboarding');
      } else {
        navigate('/signin');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, state.user?.onboardingComplete, navigate]);

  if (!show) return null;

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm"
        >
          <Wallet className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-primary-foreground font-display"
        >
          PocketPilot
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-primary-foreground/70 text-sm"
        >
          AI-powered expense tracking
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Splash;
