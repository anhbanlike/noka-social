import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { PageLayout } from '../components/layout/PageLayout';
import { BotConfig } from '../components/features/telegram/BotConfig';
import { ChatMini } from '../components/features/telegram/ChatMini';
import { AutomationEngine } from '../components/features/telegram/AutomationEngine';
import { useAuthStore } from '../store/useAuthStore';
import { databaseService } from '../lib/supabase';
import { ShieldCheck, ShieldAlert, Server } from 'lucide-react';

export const Telegram: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [isBotActive, setIsBotActive] = useState(false);
  const [botName, setBotName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const config = await databaseService.getTelegramConfig(user.id);
        if (config && config.bot_token && config.chat_id) {
          setIsBotActive(true);
          // Query name
          const r = await fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`);
          const body = await r.json();
          if (body.ok && body.result) {
            setBotName(body.result.first_name);
          } else {
            setBotName('Noka Guard Bot');
          }
        } else {
          setIsBotActive(false);
          setBotName('');
        }
      } catch (err) {
        setIsBotActive(false);
        setBotName('');
      } finally {
        setLoading(false);
      }
    };
    checkStatus();

    const interval = setInterval(checkStatus, 8000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <PageLayout>
      <div className="flex flex-col gap-8" id="telegram-workspace-canvas">
        
        {/* Header section with page descriptions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div className="flex flex-col gap-1 text-left">
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-wide uppercase flex items-center gap-2">
              <Server size={22} className="text-cyan-400 animate-pulse" />
              <span>{t.menu_telegram}</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium font-sans">
              Tích hợp Robot bảo mật Telegram thời gian thực và quản lý kịch bản tự động bảo vệ kho dữ liệu.
            </p>
          </div>
        </div>

        {/* Dynamic Global Security Defense State Banner */}
        {!loading && (
          isBotActive ? (
            <div className="p-4.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/5 relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl" />
              <div className="flex gap-3.5 items-center z-10 w-full">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck size={22} className="animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-emerald-400 tracking-wider uppercase font-display flex items-center gap-1.5 leading-none">
                    HỆ THỐNG PHÒNG THỦ ACTIVE
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded text-[9px] font-mono tracking-normal shrink-0 font-bold">ONLINE</span>
                  </span>
                  <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed font-sans">
                    Đã liên kết thành công Noka Robot <b className="text-emerald-350 font-semibold">{botName ? `@${botName}` : 'Hộ vệ'}</b>. Thiết bị của bạn được giám sát an ninh 24/7. Mọi biến động mật khẩu và phiên đăng nhập đáng ngờ sẽ được gửi trực tiếp về Telegram cá nhân.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-amber-950/5 relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-xl" />
              <div className="flex gap-3.5 items-center z-10 w-full">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldAlert size={22} className="animate-bounce" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-amber-400 tracking-wider uppercase font-display flex items-center gap-1.5 leading-none">
                    CHẾ ĐỘ GIÁM SÁT CHƯA HOẠT ĐỘNG
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-mono tracking-normal shrink-0 font-bold">OFFLINE</span>
                  </span>
                  <p className="text-xs text-slate-350 mt-1 max-w-4xl leading-relaxed font-sans mt-1.5">
                    Tài khoản chưa được kích hoạt chế độ cảnh báo khẩn cấp đầu cuối. Vui lòng hoàn thành ghép nối Token & ID chat với Bot tự lập của bạn ở bảng bên dưới để khởi chạy hệ thống phòng ngự.
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* Side-by-side: Bot configuration form (left, 7cols) & Chat Interface client (right, 5cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel layout (BotConfig handles credentials verification) */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            <BotConfig />
          </div>

          {/* Right panel layout (ChatMini hosts Gemini-powered AI responses) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            <ChatMini />
          </div>

        </div>

        {/* Phase 2.2 Dashboard: Automation Engine (full width bottom) */}
        <div className="flex flex-col mt-4">
          <AutomationEngine />
        </div>

      </div>
    </PageLayout>
  );
};
export default Telegram;
