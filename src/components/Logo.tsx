import { motion } from 'framer-motion';

export const WingedWalletLogo = ({ className = "h-12 w-12", glow = true }: { className?: string, glow?: boolean }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {glow && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"
        />
      )}
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full">
        {/* Wallet Body */}
        <rect x="20" y="35" width="60" height="40" rx="8" fill="white" fillOpacity="0.9" />
        {/* The Wing Flap */}
        <motion.path
          d="M20 40C20 40 40 20 80 25C80 25 60 45 20 45V40Z"
          fill="url(#logo-grad)"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Card Detail */}
        <rect x="28" y="48" width="12" height="4" rx="2" fill="#0A0A0B" fillOpacity="0.2" />
        <defs>
          <linearGradient id="logo-grad" x1="20" y1="20" x2="80" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default WingedWalletLogo;
