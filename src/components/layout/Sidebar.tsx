import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../lib/i18n';
import {
  LayoutDashboard,
  Layers,
  KeyRound,
  User,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, sidebarExpanded, toggleSidebar } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t.menu_dashboard,
      path: '/dashboard',
    },
    {
      icon: Layers,
      label: t.menu_platforms,
      path: '/platforms',
    },
    {
      icon: KeyRound,
      label: t.menu_passwords,
      path: '/passwords',
    },
    {
      icon: User,
      label: t.menu_account,
      path: '/account',
    },
    {
      icon: Bot,
      label: t.menu_telegram,
      path: '/telegram',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setMobileOpen(false);
  };

  const languagesList = [
    { code: 'vi' as const, label: '🇻🇳 Tiếng Việt' },
    { code: 'en' as const, label: '🇺🇸 English' },
    { code: 'zh' as const, label: '🇨🇳 中文' }
  ];

  // Render Sidebar Items
  const renderNavLinks = () => (
    <nav className="flex-1 flex flex-col gap-1.5 px-3 py-6" id="sidebar-nav">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group text-left relative cursor-pointer ${
              isActive
                ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-4 border-transparent'
            }`}
          >
            <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200 transition-colors'} />
            
            <AnimatePresence mode="wait">
              {(sidebarExpanded || mobileOpen) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap font-semibold uppercase text-[10px] md:text-xs tracking-widest"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip on collapsed state */}
            {!sidebarExpanded && !mobileOpen && (
              <div id={`tooltip-${item.path}`} className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-950 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg z-50 shadow-xl font-display pointer-events-none whitespace-nowrap">
                {item.label}
              </div>
            )}
          </button>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/5 border-l-2 border-transparent transition-all duration-300 font-medium group text-left relative mt-auto cursor-pointer"
      >
        <LogOut size={20} className="text-red-400/70 group-hover:text-red-400 transition-colors" />
        
        <AnimatePresence mode="wait">
          {(sidebarExpanded || mobileOpen) && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-medium text-sm text-red-400"
            >
              {t.menu_logout}
            </motion.span>
          )}
        </AnimatePresence>

        {!sidebarExpanded && !mobileOpen && (
          <div id="tooltip-logout" className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-950 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg z-50 shadow-xl font-display pointer-events-none whitespace-nowrap">
            {t.menu_logout}
          </div>
        )}
      </button>
    </nav>
  );

  return (
    <>
      {/* Sidebar Desktop Container */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:flex flex-col h-screen bg-white/5 border-r border-white/10 relative transition-all duration-300 z-30 ${
          sidebarExpanded ? 'w-[260px]' : 'w-16'
        }`}
      >
        {/* Sidebar Logo Header */}
        <div className="h-20 flex items-center px-4 border-b border-white/10 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-sm tracking-tight font-display">NK</span>
            </div>
            
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-white tracking-wide font-display text-base">NOKA</span>
                  <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest font-display leading-[8px] -mt-0.5">SOCIAL</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Links */}
        {renderNavLinks()}

        {/* Sidebar Footer (Language trigger & Expand Switch) */}
        <div className="p-3 border-t border-white/10 flex flex-col gap-2 relative">
          
          {/* Collapse toggle row */}
          <div className="flex items-center justify-between">
            {/* Language switcher button */}
            <div className="relative w-full">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300 w-full flex items-center gap-2 cursor-pointer ${
                  !sidebarExpanded ? 'justify-center' : 'justify-between'
                }`}
                title={t.language}
              >
                <div className="flex items-center gap-2.5">
                  <Languages size={18} className="text-slate-400 shrink-0" />
                  {sidebarExpanded && (
                    <span className="text-xs font-semibold text-slate-300 font-display">
                      {languagesList.find((l) => l.code === language)?.label.split(' ')[0]}
                    </span>
                  )}
                </div>
                {sidebarExpanded && (
                  <span className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-bold">
                    {language}
                  </span>
                )}
              </button>

              {/* Language list menu */}
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute bottom-14 bg-slate-900 border border-white/10 rounded-xl py-2 z-50 p-1 shadow-2xl ${
                      sidebarExpanded ? 'left-0 right-0' : 'left-0 w-36 shadow-offset-x-4'
                    }`}
                  >
                    {languagesList.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                          language === lang.code
                            ? 'bg-blue-600/10 text-blue-400 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expander Switch */}
            {sidebarExpanded && (
              <button
                onClick={toggleSidebar}
                className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {!sidebarExpanded && (
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300 mx-auto w-full flex justify-center cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          )}

        </div>
      </aside>

      {/* Sidebar Mobile Overlay Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <div id="mobile-sidebar-root" className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Sidebar mobile sheet content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="relative w-[280px] h-full bg-[#0F172A] border-r border-white/10 flex flex-col pt-4 z-10 p-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <span className="text-white font-black text-sm tracking-tight leading-none">NK</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white tracking-widest text-sm leading-none">NOKA</span>
                    <span className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest mt-0.5">SOCIAL</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {renderNavLinks()}

              {/* Language Footer Mobile */}
              <div className="border-t border-white/10 pt-4 mt-auto flex flex-col gap-2 relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Languages size={18} />
                    <span className="text-xs font-semibold">{t.language}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400">
                    {languagesList.find((l) => l.code === language)?.label}
                  </span>
                </button>

                {/* Inline list if open */}
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-950 border border-white/5 rounded-xl py-1 overflow-hidden"
                    >
                      {languagesList.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangOpen(false);
                          }}
                          className={`w-[90%] mx-auto flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                            language === lang.code
                              ? 'text-blue-400 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{lang.label}</span>
                          {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Sidebar;
