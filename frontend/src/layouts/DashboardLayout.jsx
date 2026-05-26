import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiCodeBracket,
  HiClock,
  HiBookmark,
  HiArrowLeftOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import Logo from '../components/Logo';
import GradientBlobs from '../components/GradientBlobs';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: HiHome, label: 'Overview', end: true },
  { to: '/dashboard/history', icon: HiClock, label: 'History' },
  { to: '/dashboard/snippets', icon: HiBookmark, label: 'Snippets' },
  { to: '/playground', icon: HiCodeBracket, label: 'Playground' },
];

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
    isActive
      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`;

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen flex bg-bg">
      <GradientBlobs />

      <aside className="fixed left-0 top-0 bottom-0 w-64 glass-strong border-r border-white/5 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Logo />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <HiArrowLeftOnRectangle className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 relative z-10 flex flex-col min-h-screen">
        <header className="lg:hidden glass-strong border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <Logo />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
          </button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-strong border-b border-white/5 overflow-hidden"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={navLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="px-4 pb-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <HiArrowLeftOnRectangle className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
