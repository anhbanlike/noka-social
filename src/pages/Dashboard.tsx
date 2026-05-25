import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { usePlatforms } from '../hooks/usePlatforms';
import { usePasswords } from '../hooks/usePasswords';
import { Button, Badge, Skeleton } from '../components/ui';
import { PageLayout } from '../components/layout/PageLayout';
import { PlatformModal } from '../components/features/platforms/PlatformModal';
import { PasswordModal } from '../components/features/passwords/PasswordModal';
import { SecurityAuditPanel } from '../components/features/dashboard/SecurityAuditPanel';
import {
  Layers,
  KeyRound,
  Clock,
  ShieldCheck,
  Plus,
  Key,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  
  // Custom Hooks data pipelines
  const { platforms, loading: loadingPlats, addPlatforms } = usePlatforms();
  const { passwords, loading: loadingPass, addPassword } = usePasswords();

  // Dialog triggers
  const [platformOpen, setPlatformOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Time formatting helper
  const calculateTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return new Date(dateStr).toLocaleDateString();
  };

  const loadingAll = loadingPlats || loadingPass;

  // Compute latest platform/password brand name
  const latestEntry = passwords[0];
  const latestInfo = latestEntry
    ? `${latestEntry.account_name} (${platforms.find((p) => p.id === latestEntry.platform_id)?.name || 'Khác'})`
    : 'Chưa có dữ liệu';

  const latestDate = latestEntry
    ? calculateTimeAgo(latestEntry.created_at)
    : '';

  const recentActivities = passwords.slice(0, 5);

  return (
    <PageLayout>
      <div className="flex flex-col gap-8" id="dashboard-root-view">
        
        {/* Top welcome layout card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950/20 p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full filter blur-[80px]" />
          
          <div className="flex flex-col gap-1.5 z-10 max-w-xl">
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-wide flex items-center gap-2">
              <span>Bảo vệ quyền kỹ thuật số tối ưu</span>
              <Award size={20} className="text-blue-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
              Chào mừng đến với Noka Social. Trình quản lý biểu mật cao cấp tích hợp phân mảnh đa lớp và bảo mật AES-256 cục bộ. Tiết kiệm thời gian, nhân ba an tâm!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            <Button
              variant="secondary"
              onClick={() => setPlatformOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{t.dash_action_add_platform}</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setPasswordOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{t.dash_action_add_password}</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Security Assessment Diagnostics Panel */}
        <SecurityAuditPanel 
          passwords={passwords}
          platforms={platforms}
          loading={loadingAll}
        />

        {/* 4 Stats Cards Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-grid-row">
          
          {/* Card 1: Platforms Count */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-450 uppercase tracking-widest font-display">
                {t.dash_stats_platforms}
              </span>
              {loadingAll ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <span className="text-2xl font-black text-white font-mono mt-1 leading-none">
                  {platforms.length}
                </span>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-blue-400">
              <Layers size={21} />
            </div>
          </div>

          {/* Card 2: Password Count */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-450 uppercase tracking-widest font-display">
                {t.dash_stats_passwords}
              </span>
              {loadingAll ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <span className="text-2xl font-black text-white font-mono mt-1 leading-none">
                  {passwords.length}
                </span>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400">
              <KeyRound size={21} />
            </div>
          </div>

          {/* Card 3: Latest Added platform/account */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4 lg:col-span-1">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-450 uppercase tracking-widest font-display">
                {t.dash_stats_latest}
              </span>
              {loadingAll ? (
                <Skeleton className="h-8 w-32 mt-1.5" />
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-200 mt-1.5 truncate leading-tight">
                    {latestInfo}
                  </span>
                  {latestDate && (
                    <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wide mt-1">
                      {latestDate}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-500/15 flex items-center justify-center text-yellow-500 shrink-0">
              <Clock size={21} />
            </div>
          </div>

          {/* Card 4: Global Crypt Security Level */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-450 uppercase tracking-widest font-display">
                {t.dash_stats_security}
              </span>
              <div className="mt-2.5">
                <Badge variant="success" className="text-[10px] py-1 font-extrabold uppercase tracking-widest">
                  AES-256 SAFE
                </Badge>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-600/10 border border-green-500/15 flex items-center justify-center text-green-400">
              <ShieldCheck size={21} />
            </div>
          </div>

        </div>

        {/* Recent Activity lists & Quick Actions side-by-side split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="recent-split-view">
          
          {/* Recent Listings card list (takes 2 cols) */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold font-display uppercase tracking-widest text-slate-350 flex items-center gap-2 pb-2.5 border-b border-white/5 select-none">
              <Clock size={15} className="text-blue-400" />
              <span>{t.dash_recent_activity}</span>
            </h3>

            {loadingAll ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center gap-3 select-none">
                <div className="p-4 rounded-full bg-white/3 border border-white/5">
                  <Key size={24} className="text-slate-500" />
                </div>
                <span className="text-xs text-slate-450 font-medium">
                  {t.no_data}
                </span>
                <Button variant="secondary" onClick={() => setPasswordOpen(true)} className="mt-2">
                  {t.dash_action_add_password}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5" id="recent-activities-list">
                {recentActivities.map((act) => {
                  const plat = platforms.find((p) => p.id === act.platform_id);
                  return (
                    <div
                      key={act.id}
                      className="p-3.5 bg-slate-950/20 border border-white/5 rounded-xl hover:bg-slate-950/40 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 p-1.5 flex items-center justify-center shrink-0">
                          {plat && plat.logo_url ? (
                            <img
                              src={plat.logo_url}
                              alt={plat.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Key size={14} className="text-slate-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-200 truncate font-display">
                            {act.account_name}
                          </span>
                          <span className="text-[10px] text-slate-450 font-semibold tracking-wider font-display uppercase mt-0.5">
                            {plat ? plat.name : 'Khác'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500 font-bold shrink-0 uppercase tracking-widest font-mono">
                        {calculateTimeAgo(act.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips / Brand indicators widget */}
          <div className="lg:col-span-1 flex flex-col gap-6 select-none">
            
            {/* Quick action shortcuts */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold font-display uppercase tracking-widest text-slate-350 flex items-center gap-2 pb-2 border-b border-white/5">
                <TrendingUp size={15} className="text-cyan-400" />
                <span>{t.dash_quick_actions}</span>
              </h3>

              <div className="flex flex-col gap-3">
                <Button
                  variant="glass"
                  onClick={() => setPlatformOpen(true)}
                  className="w-full justify-between"
                >
                  <span className="text-xs font-bold tracking-wide">THÊM NỀN TẢNG BẤT KỲ</span>
                  <ChevronRight size={14} className="text-slate-450" />
                </Button>

                <Button
                  variant="glass"
                  onClick={() => setPasswordOpen(true)}
                  className="w-full justify-between"
                >
                  <span className="text-xs font-bold tracking-wide">THÊM MẬT KHẨU KỸ THUẬT</span>
                  <ChevronRight size={14} className="text-slate-450" />
                </Button>
              </div>
            </div>

            {/* Micro security tip card */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-gradient-to-tr from-blue-900/10 to-transparent flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                  <ShieldCheck size={14} />
                </div>
                <span className="text-xs font-bold font-display text-white tracking-wide">KHUYẾN NGHỊ BẢO MẬT</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Tránh sử dụng cùng một mật mã cho các liên kết khác nhau. Nâng cấp các biểu mục quan trọng lên cấp độ 2 (MFA codes/Backup cookies) để chặn đứng mọi xâm nhập lừa đảo!
              </p>
            </div>

          </div>

        </div>

        {/* Modal additions components rendering */}
        <PlatformModal
          isOpen={platformOpen}
          onClose={() => setPlatformOpen(false)}
          onSubmit={addPlatforms}
        />

        <PasswordModal
          isOpen={passwordOpen}
          onClose={() => setPasswordOpen(false)}
          platforms={platforms}
          onSubmit={addPassword}
        />

      </div>
    </PageLayout>
  );
};
export default Dashboard;
