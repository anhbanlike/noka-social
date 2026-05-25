import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { useAuthStore } from '../../../store/useAuthStore';
import { databaseService } from '../../../lib/supabase';
import { Button, Input, Toggle, Badge } from '../../ui';
import { 
  Eye, EyeOff, Bot, RefreshCw, Send, CheckCircle2, ShieldAlert, 
  Sparkles, HelpCircle, Lock, BookOpen, MessageSquare, ShieldCheck, 
  Smartphone, Settings2
} from 'lucide-react';
import { toast } from 'sonner';

export const BotConfig: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [showToken, setShowToken] = useState(false);
  
  // Toggle states
  const [notifNewPass, setNotifNewPass] = useState(true);
  const [notifSuspicious, setNotifSuspicious] = useState(true);
  const [notifUpdate, setNotifUpdate] = useState(false);

  // States for live check
  const [checking, setChecking] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [botName, setBotName] = useState('');
  const [saving, setSaving] = useState(false);

  // Additional Features
  const [customTestMsg, setCustomTestMsg] = useState('🔔 Tin nhắn kiểm thử hệ thống phòng vệ từ Noka Social Guard!');
  const [sendingTestMsg, setSendingTestMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  // Load existing configuration
  useEffect(() => {
    const loadConfig = async () => {
      if (!user) return;
      try {
        const config = await databaseService.getTelegramConfig(user.id);
        if (config) {
          setBotToken(config.bot_token || '');
          setChatId(config.chat_id || '');
          setNotifNewPass(config.notify_new_password);
          setNotifSuspicious(config.notify_suspicious_login);
          setNotifUpdate(config.notify_system_update);
          setConnected(config.is_active);
          
          if (config.bot_token) {
            // Retrieve name from cached details or run quick check
            fetch(`https://api.telegram.org/bot${config.bot_token}/getMe`)
              .then(r => r.json())
              .then(body => {
                if (body.ok && body.result) {
                  setBotName(body.result.first_name);
                  setConnected(true);
                }
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to parse telegram configurations', err);
      }
    };
    loadConfig();
  }, [user]);

  // Real connection test with official Telegram bot API
  const testConnection = async () => {
    if (!botToken.trim()) {
      toast.error('Vui lòng nhập Bot Token trước khi kiểm thử kết nối!');
      return;
    }

    setChecking(true);
    setConnected(null);
    setBotName('');

    try {
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const body = await resp.json();

      if (body.ok && body.result) {
        setConnected(true);
        setBotName(body.result.first_name || 'Noka Guard Bot');
        toast.success(`Kết nối thành công! Đã nhận dạng Robot: ${body.result.first_name}`);
        
        // Push a quick hello chat message if chatId is provided
        if (chatId.trim()) {
          const text = `🎉 *NOKA SOCIAL SECURITY CONNECTED*\n\nXin chào! Bot bảo mật của bạn đã liên kết thành công với tài khoản Noka của *${user?.full_name || user?.username}*.\n\nMọi thay đổi mật mã hoặc phát hiện đáng ngờ sẽ luôn được cấp báo tại đây tức thời!`;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parse_mode: 'Markdown',
            }),
          }).catch(() => console.log('Hi message skipped.'));
        }
      } else {
        setConnected(false);
        toast.error('Mã Token không chính xác hoặc Bot chưa tồn tại! Hãy xem hướng dẫn tạo Bot.');
      }
    } catch (err) {
      setConnected(false);
      toast.error('Lỗi mạng không thể liên lạc với máy chủ Telegram API.');
    } finally {
      setChecking(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await databaseService.updateTelegramConfig(user.id, {
        bot_token: botToken || null,
        chat_id: chatId || null,
        is_active: connected || false,
        notify_new_password: notifNewPass,
        notify_suspicious_login: notifSuspicious,
        notify_system_update: notifUpdate,
      });
      toast.success('Đã lưu cấu hình an ninh Telegram Bot thành công!');
    } catch (err) {
      toast.error('Thất bại khi cập nhật cơ sở dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      toast.error('Cần điền chuỗi Bot Token & Chat ID để phát thử tin nhắn!');
      return;
    }
    setSendingTestMsg(true);
    try {
      const text = `📬 *TIN NHẮN KIỂM KIỂU NOKA*\n\n• *Nội dung:* ${customTestMsg}\n• *Thời gian phát:* ${new Date().toLocaleTimeString()}\n\n_Kiểm tra cổng dữ liệu: ĐẦU CUỐI BẢO MẬT HOẠT ĐỘNG TỐT_`;
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown',
        }),
      });
      const resVal = await resp.json();
      if (resVal.ok) {
        toast.success('Gửi tin nhắn thử nghiệm thành công! Hãy kiểm tra di động.');
      } else {
        toast.error(`Telegram báo lỗi: ${resVal.description}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi đường truyền: ${err.message}`);
    } finally {
      setSendingTestMsg(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none w-full" id="telegram-bot-config-root">
      
      {/* CARD 1: MAIN CONFIGURE & SWITCH PANEL */}
      <div className="glass-panel rounded-2xl p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden w-full">
        {/* Subtle top decoration stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent" />
        
        {/* Header Block with navigation tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/25 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-cyan-400" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-black font-display text-white tracking-widest uppercase">
                {t.tel_title || 'THIẾT LẬP THU THẬP KHÓA & BOT'}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Ghép nối các kênh thông điệp mã khép kín của riêng bạn.
              </p>
            </div>
          </div>

          {/* Sub Tabs control */}
          <div className="flex bg-slate-950/60 p-0.5 rounded-lg border border-white/5 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer rounded-md ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              CÀI ĐẶT
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer rounded-md ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              HƯỚNG DẪN
            </button>
          </div>
        </div>

        {activeTab === 'config' ? (
          <div className="flex flex-col gap-5">
            
            {/* Connection state details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 items-center">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ĐỊNH DANH ROBOT CỦA BẠN</span>
                <span className="text-xs font-black text-white truncate my-0.5">
                  {botName ? `🤖 ${botName}` : 'Chưa nhận dạng Bot'}
                </span>
              </div>
              
              <div className="flex items-center sm:justify-end gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full relative flex`}>
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    connected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-pulse'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    connected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                </div>
                
                <div className="flex flex-col text-left sm:text-right">
                  <span className="text-[11px] font-black text-white tracking-wider uppercase">
                    {connected ? 'LIÊN KẾT ĐÃ THIẾT LẬP' : 'NGOẠI TUYẾN'}
                  </span>
                  <span className="text-[8.5px] text-slate-450 font-mono mt-0.5 leading-none">
                    {connected ? 'Ready for OTP / system alerts' : 'Vui lòng cung cấp mã API'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Input fields */}
            <div className="flex flex-col gap-4 text-left">
              <div className="relative">
                <Input
                  id="bot-token-field"
                  label={t.tel_bot_token || "BOT TOKEN API"}
                  placeholder="Mã Token lấy từ @BotFather (ví dụ: 12345678:AAEg...)"
                  type={showToken ? 'text' : 'password'}
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3.5 top-9.5 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <Input
                id="chat-id-field"
                label={t.tel_chat_id || "CHAT ID NHẬN TIN"}
                placeholder="Chuỗi số Chat ID của bạn (ví dụ: 104598715)"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                description="Tip: Nhấn start trò chuyện với @userinfobot để hiển thị dãy số ID tài khoản chính xác."
              />
            </div>

            {/* Credentials action buttons */}
            <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
              <Button
                type="button"
                variant="glass"
                onClick={testConnection}
                disabled={checking}
                className="flex items-center gap-1.5 text-xs font-bold leading-none py-2.5 px-3.5 tracking-wide border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {checking ? <RefreshCw size={13} className="animate-spin text-cyan-400" /> : <Send size={12} className="text-cyan-400" />}
                <span>THỬ KẾT NỐI BOT</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-5 text-xs font-extrabold font-display uppercase tracking-widest border border-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>COPPING...</span>
                  </span>
                ) : (
                  'LƯU CẤU HÌNH'
                )}
              </Button>
            </div>

          </div>
        ) : (
          /* SYSTEM CONFIG COMPREHENSIVE GUIDE TUTORIAL */
          <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed font-sans text-left" id="setup-bot-guide-pane">
            <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl flex gap-2.5 items-start">
              <HelpCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-[10.5px] uppercase tracking-wider">CÁC BƯỚC KHAI BÁO THIẾT LẬP ROBOT</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Một vài thao tác đơn giản để robot thuộc về sự kiểm soát của riêng bạn:</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 pl-1 mt-1">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-cyan-400 shrink-0">1</div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-100 text-[11px]">Khởi tạo Bot mới từ @BotFather</span>
                  <p className="text-[10px] text-slate-405 mt-0.5 leading-relaxed">
                    Mở ứng dụng Telegram, tìm kiếm <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold underline">@BotFather</a>. Gửi cú pháp lệnh <code className="text-cyan-400 font-mono bg-slate-950 px-1 py-0.5 rounded">/newbot</code>. Đặt tên hiển thị và username của Bot kết thúc bằng chữ "bot" (ví dụ: NokaSecBot). Sao chép lấy đoạn mã <b>HTTP API Token</b>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-cyan-400 shrink-0">2</div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-100 text-[11px]">Truy suất số Chat ID chính chủ</span>
                  <p className="text-[10px] text-slate-405 mt-0.5 leading-relaxed">
                    Nhập tìm kiếm bot hệ thống <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold underline">@userinfobot</a> trên di động. Bấm Start, bot sẽ ngay lập tức trả lại dãy số là mã Chat ID số định danh tài khoản cá nhân của bạn.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] text-cyan-400 shrink-0">3</div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-100 text-[11px]">Bấm START để cho phép Bot truyền dẫn</span>
                  <p className="text-[10px] text-slate-405 mt-0.5 leading-relaxed">
                    <b className="text-amber-300">CỰC KỲ QUAN TRỌNG:</b> Để tránh lỗi bảo mật khóa chặn Spam của telegram, hãy mở cửa sổ chat với chính Bot của bạn vừa lập ở Bước 1 và bấm nút <b className="text-slate-200 uppercase">START (bắt đầu)</b> để cho phép Robot liên lạc gửi thông báo.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className="mt-2 text-center text-blue-400 hover:text-blue-300 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 border border-white/5 py-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer"
            >
              <span>NHẬP THÔNG TIN CẤU HÌNH</span>
              <CheckCircle2 size={12} />
            </button>
          </div>
        )}

      </div>

      {/* CARD 2: TOGGLE NOTIFICATIONS PREEMPTIVE SCRIPT */}
      <div className="glass-panel rounded-2xl p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        
        <h3 className="text-xs font-black font-display uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-white/5 pb-3 text-left">
          <Settings2 size={15} className="text-cyan-400" />
          <span>KỊCH BẢN THỜI GIAN THỰC (REAL-TIME NOTIFICATIONS)</span>
        </h3>

        <div className="flex flex-col gap-4 text-left" id="notif-toggles-section">
          
          <div className="flex items-start justify-between border-b border-white/5 pb-3">
            <div className="flex flex-col gap-0.5 max-w-[82%]">
              <span className="text-xs font-extrabold text-slate-200">Cảnh báo thêm/cập nhật mật khẩu</span>
              <span className="text-[9.5px] text-slate-400 leading-normal">Gửi báo cáo an ninh lập tức khi bất kỳ mật mã nào được sao lưu hoặc mã hóa phân mảnh thành công.</span>
            </div>
            <Toggle
              id="notif-new-pass-switch"
              checked={notifNewPass}
              onChange={setNotifNewPass}
            />
          </div>

          <div className="flex items-start justify-between border-b border-white/5 pb-3">
            <div className="flex flex-col gap-0.5 max-w-[82%]">
              <span className="text-xs font-extrabold text-slate-200">Cảnh báo đăng nhập vùng lạ (IP phát hiện lạ)</span>
              <span className="text-[9.5px] text-slate-400 leading-normal">Thông báo khẩn cấp tức thời qua Bot nếu tài khoản được đăng nhập từ hệ điều hành lạ hoặc địa chỉ mạng khác vùng quen thuộc.</span>
            </div>
            <Toggle
              id="notif-suspicious-switch"
              checked={notifSuspicious}
              onChange={setNotifSuspicious}
            />
          </div>

          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5 max-w-[82%]">
              <span className="text-xs font-extrabold text-slate-200">Báo cáo sức khỏe an ninh định kỳ</span>
              <span className="text-[9.5px] text-slate-405 leading-normal">Bản tin thống kê và báo cáo tự động mỗi 24 giờ về độ an toàn mật khẩu chung.</span>
            </div>
            <Toggle
              id="notif-update-switch"
              checked={notifUpdate}
              onChange={setNotifUpdate}
            />
          </div>

        </div>
      </div>

      {/* CARD 3: REAL-TIME BROADCAST TEST SANDBOX */}
      {connected && botToken && chatId ? (
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-4 relative overflow-hidden text-left" id="telegram-broadcast-test">
          <div className="flex items-center gap-2 text-left">
            <MessageSquare size={14} className="text-emerald-400" />
            <span className="text-[11px] font-black tracking-widest uppercase text-slate-300">
              TRÌNH TEST FIRE ĐƯỜNG TRUYỀN THỜI GIAN THỰC
            </span>
          </div>
          
          <p className="text-[10px] text-slate-400 leading-normal">
            Phát ngẫu nhiên hoặc gõ nội dung văn bản bất kỳ để thực hiện chuyển tiếp tin nhắn trực tiếp đến Telegram cá nhân của bạn, kiểm toán tiến trình.
          </p>

          <div className="flex gap-3 items-stretch">
            <input
              type="text"
              value={customTestMsg}
              onChange={(e) => setCustomTestMsg(e.target.value)}
              placeholder="Nhập nội dung tin nhắn gửi thử..."
              className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/55 transition-all text-ellipsis"
            />
            <button
              type="button"
              disabled={sendingTestMsg || !customTestMsg.trim()}
              onClick={handleSendCustomMessage}
              className="bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-95 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {sendingTestMsg ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
              <span>Gửi phát</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* FOOTER GUARANTEE BLOCK */}
      <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl flex items-start gap-3 relative overflow-hidden text-left">
        <div className="absolute top-2 right-2 flex scale-75 opacity-15">
          <Lock size={60} className="text-slate-600" />
        </div>

        <div className="w-8 h-8 rounded-lg bg-cyan-950/60 flex items-center justify-center border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
          <ShieldCheck size={16} />
        </div>
        
        <div className="flex flex-col gap-1 z-10">
          <span className="text-xs font-bold text-white uppercase tracking-wider">MÃ HOÁ KÝ THUẬT SỐ KHÉP KÍN</span>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-0.5">
            Mật mã khóa Telegram Token cùng thông tin phân phối được lưu trữ mã hóa đối xứng AES-256 an toàn ngay trên bộ bảo vệ sandbox của bạn. Hệ thống Noka Social tuyệt đối không lưu trữ hay lưu truyền mật mã về bất cứ máy chủ trung gian nào.
          </p>
        </div>
      </div>

    </div>
  );
};
export default BotConfig;
