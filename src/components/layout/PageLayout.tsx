import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'motion/react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, initialized, initialize } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize and verify authentication
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login');
    }
  }, [initialized, user, navigate]);

  if (!initialized || !user) {
    return (
      <div id="loading-overlay" className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-blue-500/10 border border-cyan-400/30 scale-75 animate-ping" />
        </div>
        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase font-display">
          Noka Vault Initializing...
        </span>
      </div>
    );
  }

  return (
    <div id="dashboard-layout" className="flex h-screen w-screen overflow-hidden bg-[#0F172A] text-slate-200 font-sans antialiased">
      {/* Sidebar nav bar element */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main workspace section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-[320px]">
        
        {/* Top Header bar with search and profile dropdown states */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Dynamic content canvas */}
        <main className="flex-1 overflow-y-auto bg-transparent p-5 md:p-8" id="page-main-canvas">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default PageLayout;
