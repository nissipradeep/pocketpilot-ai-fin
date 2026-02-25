import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink key={item.to} to={item.to} className="relative flex flex-col items-center gap-0.5 py-1 px-3">
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-0.5 h-0.5 w-8 rounded-full"
                style={{ background: 'var(--gradient-primary)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <item.icon
              className={`h-5 w-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
