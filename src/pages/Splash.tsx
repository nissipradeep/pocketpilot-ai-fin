import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { WingedWalletLogo } from '@/components/Logo';

const Splash = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const [loadingText, setLoadingText] = useState('Initializing Pilot...');

  useEffect(() => {
    const textSequence = [
      { t: 0, text: 'Initializing Pilot...' },
      { t: 800, text: 'Syncing with Cloud...' },
      { t: 1600, text: 'AI Systems Ready.' }
    ];

    textSequence.forEach(step => {
      setTimeout(() => setLoadingText(step.text), step.t);
    });

    const timer = setTimeout(() => {
      if (state.isAuthenticated) {
        navigate(state.user?.onboardingComplete ? '/dashboard' : '/onboarding');
      } else {
        navigate('/signin');
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, state.user?.onboardingComplete, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] overflow-hidden">
      {/* Background Pulse */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute h-[500px] w-[500px] bg-primary/20 rounded-full blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 relative z-10"
      >
        <div className="relative">
          <WingedWalletLogo className="h-24 w-24" />
          {/* Scan Line Effect */}
          <motion.div
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-primary/50 blur-[2px] z-20 shadow-[0_0_10px_#6366F1]"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold tracking-tighter text-white font-display"
          >
            Pocket<span className="text-primary">Pilot</span>
          </motion.h1>

          <div className="h-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Progress Line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100px' }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-20 h-0.5 bg-primary/30 rounded-full"
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/3 bg-primary"
        />
      </motion.div>
    </div>
  );
};

export default Splash;
