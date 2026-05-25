import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../lib/i18n';
import { Avatar } from '../ui';
import { Menu, ChevronDown, User, LogOut, Settings, HelpCircle, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sessionEmail, signOut } = useAuthStore();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute Vietnamese / English translated breadcrumbs recursively
  const getBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Noka Social';
    
    const translatedSegments = segments.map((seg) => {
      switch (seg) {
        case 'dashboard':
          return t.menu_dashboard;
        case 'platforms':
          return t.menu_platforms;
        case 'passwords':
          return t.menu_passwords;
        case 'account':
          return t.menu_account;
        case 'telegram':
          return t.menu_telegram;
        default:
          return seg.charAt(0).toUpperCase() + seg.slice(1);
      }
    });

    return `Noka Social / ${translatedSegments.join(' / ')}`;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white/2 border-b border-white/10 px-6 md:px-8 flex items-center justify-between w-full relative z-20 backdrop-blur-sm" id="main-header">
      {/* Left section: Hamburger (mobile) or Breadcrumb (desktop) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-400 tracking-wide font-display">
            {getBreadcrumbs()}
          </span>
          
          {/* Active status indicator */}
          {!isSupabaseConfigured && (
            <div id="local-mode-pill" className="ml-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
              <Flame size={10} /> Local Mode
            </div>
          )}
        </div>
      </div>

      {/* Right section: Profile Info & Dropdown Trigger */}
      <div className="flex items-center gap-4" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1 rounded-full text-left transition-all duration-300 hover:bg-white/5 outline-none select-none cursor-pointer"
          aria-expanded={dropdownOpen}
        >
          <Avatar src={user?.avatar_url || null} name={user?.full_name || 'Noka User'} size="sm" />
          
          <div className="hidden sm:flex flex-col pr-1 text-right">
            <span className="text-xs font-bold font-display text-white tracking-wide leading-tight">
              {user?.full_name || 'Noka User'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              @{user?.username || 'user'}
            </span>
          </div>

          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Floating Dropdown Card */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-6 top-20 w-64 bg-slate-900/95 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-slate-200"
            >
              {/* Profile Card Summary */}
              <div className="flex flex-col items-center gap-3 pb-3 border-b border-white/5 mb-3 text-center">
                <Avatar src={user?.avatar_url || null} name={user?.full_name || 'Noka'} size="lg" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold font-display text-white">{user?.full_name}</span>
                  <span className="text-xs text-slate-450 truncate max-w-[200px]">{sessionEmail || 'No email set'}</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-0.5" id="header-dropdown-menu">
                <button
                  onClick={() => {
                    navigate('/account');
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-slate-350 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <User size={15} className="text-slate-450 shrink-0" />
                  <span>{t.menu_account}</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // Open a generic system updates dialog mock
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl text-slate-350 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Settings size={15} className="text-slate-450 shrink-0" />
                  <span>{t.acc_col_security}</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 mt-3 border-t border-white/5 text-xs font-bold text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/5 transition-all text-left cursor-pointer"
              >
                <LogOut size={15} className="text-red-450 shrink-0" />
                <span>{t.menu_logout}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
export default Header;
