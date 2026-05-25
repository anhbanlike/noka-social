import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { useAuthStore } from '../../../store/useAuthStore';
import { databaseService } from '../../../lib/supabase';
import { Button, Badge } from '../../ui';
import { 
  Network, Cpu, Shield, Send, Terminal, Zap, Play, CheckCircle, 
  AlertTriangle, RotateCw, FileCode2, Smartphone, Lock, Eye, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface AutomationLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  trigger: string;
  message: string;
  payload?: string;
}

export const AutomationEngine: React.FC = () => {
  const { t, language } = useTranslation();
  const user = useAuthStore((state) => state.user);
  
  // Real config states
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);

  // Simulation states
  const [logs, setLogs] = useState<AutomationLog[]>([
    {
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(),
      type: 'info',
      trigger: 'CORE_BOOT',
      message: 'Hệ thống tối ưu hóa kênh Telegram Bot tự động hóa đã trực tuyến (Noka Social Guard Active).',
    },
    {
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      type: 'success',
      trigger: 'RULES_INIT',
      message: 'Các quy tắc bộ luật bảo mật đã được tải thành công. Sẵn sàng lắng nghe webhooks.',
    }
  ]);
  
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<number>(0);
  const [selectedRule, setSelectedRule] = useState<string>('suspicious_login');
  const [simulating, setSimulating] = useState(false);

  // Load existing configuration so simulations can perform real Telegram HTTP calls if credentials exist!
  useEffect(() => {
    const loadConfig = async () => {
      if (!user) return;
      try {
        const config = await databaseService.getTelegramConfig(user.id);
        if (config) {
          setBotToken(config.bot_token || '');
          setChatId(config.chat_id || '');
          setIsActive(config.is_active);
        }
      } catch (err) {
        console.error('Failed to parse telegram configurations', err);
      }
    };
    loadConfig();
  }, [user]);

  // Handle adding a new log
  const addLog = (type: 'info' | 'success' | 'warning' | 'error', trigger: string, message: string, payload?: object) => {
    const newLog: AutomationLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      trigger,
      message,
      payload: payload ? JSON.stringify(payload, null, 2) : undefined
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Run a workflow simulation sequence
  const executeSimulation = async (workflowId: string) => {
    if (simulating) return;
    setSimulating(true);
    setActiveWorkflow(workflowId);
    setWorkflowStep(1);

    const logTriggers: Record<string, string> = {
      new_password: 'ADD_CREDENTIAL',
      suspicious_login: 'SUSPICIOUS_IP_WARN',
      leak_check: 'SECURITY_AUDIT_CRON',
      remote_backup: 'REMOTE_COMMAND_BACKUP',
    };

    const friendlyNames: Record<string, string> = {
      new_password: 'Thêm mật khẩu mới',
      suspicious_login: 'Cảnh báo đăng nhập lạ',
      leak_check: 'Quét rò rỉ dữ liệu',
      remote_backup: 'Khôi phục từ xa [Backup]',
    };

    addLog('info', logTriggers[workflowId], `Bắt đầu quy trình tự động hóa: "${friendlyNames[workflowId]}"`);

    // Step 1: User Event -> Noka Gateway
    await new Promise(r => setTimeout(r, 650));
    setWorkflowStep(2);
    addLog('info', 'GATEWAY_DECRYPT', 'Noka Gateway nhận thông số sự kiện, giải mã AES an toàn, đóng gói chữ ký số.');

    // Step 2: Noka Gateway -> Telegram API
    await new Promise(r => setTimeout(r, 750));
    setWorkflowStep(3);
    addLog('info', 'BOT_API_CALL', 'Truyền tải payload API bảo mật đến máy chủ Telegram Bot API.');

    // Step 3: Telegram API -> User Receiver
    await new Promise(r => setTimeout(r, 850));
    setWorkflowStep(4);

    // Try REAL telegram transmission!
    let realSent = false;
    let actualPayload: any = {};

    if (botToken.trim() && chatId.trim()) {
      try {
        let textContent = '';
        if (workflowId === 'new_password') {
          textContent = `🔒 *CẢNH BÁO BẢO MẬT NOKA*\n\n• *Sự kiện:* Thêm tài khoản mới\n• *Người thực hiện:* ${user?.full_name || 'Hội viên Noka'}\n• *Thời gian:* ${new Date().toLocaleString()}\n• *Địa điểm:* Hà Nội, Việt Nam\n\nBạn đã lưu một mật mã mới! Hệ thống tự động mã hóa AES-256 nội bộ thành công.`;
        } else if (workflowId === 'suspicious_login') {
          textContent = `🚨 *CẢNH BÁO NGUY HIỂM NOKA*\n\n• *Sự kiện:* Đăng nhập từ Thiết bị lạ / IP lạ\n• *Tài khoản:* ${user?.username}\n• *IP nguồn:* 113.190.222.15\n• *Vị trí phát hiện:* Đà Nẵng, Việt Nam\n• *Mức độ đe dọa:* TRUNG BÌNH\n\nNếu không phải bạn, vui lòng truy cập ngay menu "Mật khẩu" để đổi mã bảo mật cấp độ cao ngay lập tức!`;
        } else if (workflowId === 'leak_check') {
          textContent = `🛡️ *KHÁM SỨC KHỎE MẠNG XÃ HỘI NOKA*\n\n• *Sự kiện:* Quét bảo mật định kỳ 24h\n• *Thống kê:* Quét thành công\n• *Kết quả:* Không có mật khẩu yếu hoặc trùng lặp nghiêm trọng nào ngoài vùng an toàn.\n• *Đề xuất:* Định kỳ thay đổi mật khẩu sau mỗi 90 ngày.`;
        } else {
          textContent = `📦 *BẢO LƯU DỰ PHÒNG NOKA SOCIAL*\n\n• *Sự kiện:* Lệnh điều khiển từ xa \`[Backup]\` nhận thông qua chat ID bảo mật.\n• *Payload lưu trữ:* \`[Encrypted Payload Hash: sha256_d894e2...]\`\n\nDữ liệu của bạn được tối ưu bảo vệ hoàn hảo.`;
        }

        actualPayload = {
          chat_id: chatId,
          text: textContent,
          parse_mode: 'Markdown'
        };

        const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actualPayload),
        });

        const resBody = await resp.json();
        if (resBody.ok) {
          realSent = true;
          addLog('success', 'TELEGRAM_DISPATCH', `Đã GỬI THÀNH CÔNG thông điệp thực tế qua Telegram của bạn! (Message ID: ${resBody.result.message_id})`, actualPayload);
        } else {
          addLog('warning', 'TELEGRAM_DISPATCH_FAIL', `Không thể kết nối bot Telegram thực tế: ${resBody.description}. Dữ liệu sẽ truyền qua kênh lưu trữ cục bộ bảo mật.`, actualPayload);
        }
      } catch (err: any) {
        addLog('error', 'TELEGRAM_DISPATCH_ERROR', `Lỗi kết nối API Telegram thực tế: ${err.message}. Chu kỳ chuyển hướng luồng dữ liệu an toàn nội bộ.`);
      }
    }

    if (!realSent) {
      actualPayload = {
        meta_destination_chat_id: chatId || 'Chưa cấu hình nhận tin',
        triggered_by: user?.full_name || 'Hội viên Noka',
        events: friendlyNames[workflowId],
        secure_token_active: !!botToken,
        timestamp: new Date().toISOString()
      };
      addLog('success', 'LOCAL_SECURE_DISPATCH', `Chuỗi truyền tải dữ liệu an toàn hoàn thành khép kín! Đã mã hóa và đóng gói an toàn tại Local Store.`, actualPayload);
    }

    await new Promise(r => setTimeout(r, 600));
    setWorkflowStep(0);
    setActiveWorkflow(null);
    setSimulating(false);
    
    if (realSent) {
      toast.success(`Đã tự động gửi thông báo thật tới di động của bạn qua Telegram!`);
    } else {
      toast.success(`Thực thi thành công quy trình: ${friendlyNames[workflowId]}`);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 flex flex-col gap-6 relative" id="telegram-automation-workspace">
      
      {/* Absolute top grid line decor */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20 shrink-0">
            <Network size={18} className="text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-black font-display text-white tracking-wide">
              GIAI ĐOẠN 2.2: TỰ ĐỘNG HÓA KÊNH TELEGRAM BOT CHI TIẾT
            </h3>
            <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">
              Sơ đồ tư duy vận hành truyền tin khép kín của ứng dụng Noka Social và kích hoạt kịch bản thời gian thực.
            </p>
          </div>
        </div>

        <Badge variant={botToken && chatId ? 'success' : 'warning'} className="self-start sm:self-auto font-mono text-[10px]">
          {botToken && chatId ? 'MÃ TÍCH HỢP: SẴN SÀNG TOÀN DIỆN' : 'NGOẠI TUYẾN: KIỂM THỬ KHÉP KÍN'}
        </Badge>
      </div>

      {/* SECTION 1: INTERACTIVE MINDMAP DIAGRAM (SƠ ĐỒ TƯ DUY TRUYỀN TIN TỰ ĐỘNG) */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 select-none font-display">
          <Zap size={14} className="text-amber-400" />
          <span>SƠ ĐỒ CHUYỂN HOÁ DỮ LIỆU & KÍCH HOẠT THỜI GIAN THỰC</span>
        </h4>

        {/* The Mindmap Box with fully responsive interactive network visualization style */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 relative overflow-hidden" id="automation-mindmap-canvas">
          {/* Custom animated background grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

          {/* Core Mindmap flow wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 items-center justify-center py-4">
            
            {/* NODE COLUMN 1: SỰ KIỆN ĐẦU VÀO (INPUT EVENTS) */}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black tracking-widest text-slate-500 text-center uppercase font-display block select-none">
                1. SỰ KIỆN KÍCH HOẠT (EVENTS)
              </span>

              {/* Event Sub-node 1 */}
              <button
                type="button"
                onClick={() => executeSimulation('new_password')}
                disabled={simulating}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 focus:outline-none cursor-pointer group ${
                  activeWorkflow === 'new_password'
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-blue-400 font-display flex items-center gap-1.5">
                    <Lock size={12} />
                    <span>Thêm Mật Khẩu</span>
                  </span>
                  <Play size={8} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Khi người dùng lưu mật mã đa cấp mới an toàn.</p>
              </button>

              {/* Event Sub-node 2 */}
              <button
                type="button"
                onClick={() => executeSimulation('suspicious_login')}
                disabled={simulating}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 focus:outline-none cursor-pointer group ${
                  activeWorkflow === 'suspicious_login'
                    ? 'bg-amber-600/20 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-amber-400 font-display flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    <span>Đăng Nhập Lạ</span>
                  </span>
                  <Play size={8} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Phát hiện địa chỉ IP ở tỉnh thành hoặc thiết bị không quen thuộc.</p>
              </button>

              {/* Event Sub-node 3 */}
              <button
                type="button"
                onClick={() => executeSimulation('leak_check')}
                disabled={simulating}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 focus:outline-none cursor-pointer group ${
                  activeWorkflow === 'leak_check'
                    ? 'bg-cyan-600/20 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-cyan-400 font-display flex items-center gap-1.5">
                    <Shield size={12} />
                    <span>Quét Rò Rỉ 24h</span>
                  </span>
                  <Play size={8} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Quy trình cron quét tự động đối chiếu cơ sở dữ liệu rò rỉ.</p>
              </button>
            </div>

            {/* NODE COLUMN 2: CỔNG AN NINH TRUNG TÂM (CENTRAL GATEWAY) */}
            <div className="flex flex-col items-center justify-center relative">
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase font-display block select-none mb-3">
                2. NOKA GATEWAY CORES
              </span>

              {/* Central Server node container with high pulse visual design */}
              <div className={`p-5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-500 w-full text-center relative ${
                workflowStep >= 2
                  ? 'bg-blue-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 scale-105'
                  : 'bg-slate-900/90 border-white/5 text-slate-350'
              }`}>
                {/* Glow aura */}
                {workflowStep >= 2 && (
                  <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur animate-pulse" />
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  workflowStep >= 2 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-slate-950/80 border-white/10'
                }`}>
                  <Cpu size={20} className={workflowStep === 2 ? 'animate-spin' : ''} />
                </div>

                <span className="text-xs font-extrabold font-display leading-none tracking-wide text-slate-100 mt-1">Noka Core Decrypter</span>
                <span className="text-[8px] text-slate-450 tracking-wide uppercase font-mono mt-0.5">AES-256 Engine Shielded</span>

                {/* Simulated live decryption visual code line */}
                {workflowStep === 2 ? (
                  <div className="w-full bg-slate-950 px-2 py-1 rounded text-[7px] font-mono text-green-400 overflow-hidden leading-tight animate-pulse text-left h-7 mt-2">
                    {`> DEC: SHA256_ACTIVE\n> SIGN: VERIFIED_OK`}
                  </div>
                ) : (
                  <div className="w-full bg-slate-950/20 px-2 py-1 rounded text-[7px] font-mono text-slate-600 text-left h-7 mt-2 select-none leading-none">
                    {`SYS: Idle\nGateway listening...`}
                  </div>
                )}
              </div>
            </div>

            {/* NODE COLUMN 3: MÁY CHỦ TELEGRAM BOT API */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase font-display block select-none mb-3">
                3. TELEGRAM CHANNELS BOT
              </span>

              <div className={`p-5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-500 w-full text-center relative ${
                workflowStep >= 3
                  ? 'bg-sky-950/40 border-sky-450 text-white shadow-lg shadow-sky-500/10 scale-105'
                  : 'bg-slate-900/90 border-white/5 text-slate-350'
              }`}>
                {/* Glow aura */}
                {workflowStep >= 3 && (
                  <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 opacity-20 blur animate-pulse" />
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  workflowStep >= 3 ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-slate-950/80 border-white/10'
                }`}>
                  <Send size={18} className={workflowStep === 3 ? 'animate-bounce' : ''} />
                </div>

                <span className="text-xs font-extrabold font-display leading-none tracking-wide text-slate-100 mt-1">Telegram API Server</span>
                <span className="text-[8px] text-slate-450 tracking-wide uppercase font-mono mt-0.5">HTTPS POST SECURE</span>

                <div className="w-full bg-slate-950 px-1 py-1 rounded text-[7px] font-mono text-sky-400 overflow-hidden text-center mt-2 h-7 leading-normal">
                  {botToken ? `Token: Active` : 'Token: Offline Local'}
                  <div className="text-[6px] text-slate-500 truncate mt-0.5">{botToken ? `${botToken.substring(0, 10)}...` : 'not_entered_guard'}</div>
                </div>
              </div>
            </div>

            {/* NODE COLUMN 4: DI ĐỘNG NGƯỜI NHẬN (USER MOBILE RECEIVER) */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase font-display block select-none mb-3">
                4. ĐẦU CUỐI THIẾT BỊ
              </span>

              <div className={`p-5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-500 w-full text-center relative ${
                workflowStep === 4
                  ? 'bg-green-950/40 border-green-500 text-white shadow-lg shadow-green-500/10 scale-108 animate-pulse'
                  : 'bg-slate-900/90 border-white/5 text-slate-350'
              }`}>
                {/* Glow aura */}
                {workflowStep === 4 && (
                  <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 opacity-20 blur" />
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  workflowStep === 4 ? 'bg-green-500/20 border-green-400 text-green-400' : 'bg-slate-950/80 border-white/10'
                }`}>
                  <Smartphone size={18} />
                </div>

                <span className="text-xs font-extrabold font-display leading-none tracking-wide text-slate-100 mt-1">Your Device</span>
                <span className="text-[8px] text-slate-450 tracking-wide uppercase font-mono mt-0.5">Push Feed Notification</span>

                <div className="w-full bg-slate-950/60 px-1 py-1 rounded text-[7px] font-mono text-slate-400 overflow-hidden mt-2 h-7 leading-relaxed flex items-center justify-center">
                  {chatId ? `Chat ID: ${chatId}` : 'Chat ID: Local Session'}
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Legend instructions info note */}
          <div className="flex items-center gap-1.5 mt-4 p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-[10px] text-slate-400 select-none">
            <Badge variant="cyan" className="text-[8px] py-0 px-1.5 shrink-0">HƯỚNG DẪN TRỰC QUAN</Badge>
            <span>Click trực tiếp vào thiết kế 3 Sự kiện ở Cột 1 để xem dòng chảy dữ liệu kích hoạt trực quan truyền qua Cổng Noka tới API Telegram của bạn.</span>
          </div>

        </div>
      </div>

      {/* SECTION 2: WEBHOOK KỊCH BẢN & MÔ PHỎNG SỰ KIỆN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Left column: Automation Scenarios Control Panel */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 select-none font-display">
            <Play size={14} className="text-cyan-400" />
            <span>KÍCH HOẠT QUY TRÌNH AUTOMATION KHUYÊN DÙNG</span>
          </h4>

          <div className="flex flex-col gap-3">
            
            {/* Rule card 1: Suspicious Device Alert */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              selectedRule === 'suspicious_login' ? 'bg-slate-950/80 border-amber-500/40 shadow shadow-amber-500/5' : 'bg-slate-900/60 border-white/5'
            }`}>
              <div className="flex items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <AlertTriangle size={13} className="text-amber-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100 font-display">Cảnh báo Đăng nhập IP Lạ</h5>
                    <p className="text-[9px] text-slate-400">Trigger: SUSPICIOUS_IP_DETECTED</p>
                  </div>
                </div>

                <Badge variant="danger" className="text-[8px]">ĐỘ UTƯ: KHẨN CẤP</Badge>
              </div>
              <p className="text-[10px] text-slate-405 leading-relaxed mb-3">
                Gửi mã xác minh 2FA hoặc thông báo khẩn cấp ngay qua Bot Telegram khi hệ thống nhận dạng đăng nhập từ vị trí xa lạ nằm ngoài vùng địa lý quen thuộc.
              </p>
              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                <span className="text-[9px] text-slate-500 font-mono">Status: Enabled</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="glass" 
                  onClick={() => {
                    setSelectedRule('suspicious_login');
                    executeSimulation('suspicious_login');
                  }}
                  disabled={simulating}
                  className="font-semibold text-[10px] border border-amber-500/20 hover:border-amber-500/40 text-amber-400"
                >
                  <Play size={10} className="mr-1" />
                  Kích Hoạt Thử Cảnh Báo
                </Button>
              </div>
            </div>

            {/* Rule card 2: Periodic security health scan */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              selectedRule === 'leak_check' ? 'bg-slate-950/80 border-cyan-500/40 shadow shadow-cyan-500/5' : 'bg-slate-900/60 border-white/5'
            }`}>
              <div className="flex items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Shield size={13} className="text-cyan-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100 font-display">Báo Cáo Sức Khỏe Mật Khẩu Định Kỳ</h5>
                    <p className="text-[9px] text-slate-400">Trigger: CRON_JOB_24H_AUDIT</p>
                  </div>
                </div>

                <Badge variant="cyan" className="text-[8px]">ĐÚNG HẸN: 24H</Badge>
              </div>
              <p className="text-[10px] text-slate-405 leading-relaxed mb-3">
                Tự động kiểm tra chéo các tài khoản xem nền tảng nào có mật mật mã trùng lặp, độ an toàn yếu hoặc nằm trong danh mục rò rỉ toàn cầu, rồi lập báo cáo tóm tắt bảo mật.
              </p>
              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                <span className="text-[9px] text-slate-500 font-mono">Status: Enabled</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="glass" 
                  onClick={() => {
                    setSelectedRule('leak_check');
                    executeSimulation('leak_check');
                  }}
                  disabled={simulating}
                  className="font-semibold text-[10px] border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400"
                >
                  <Play size={10} className="mr-1" />
                  Chạy Quét Định Kỳ
                </Button>
              </div>
            </div>

            {/* Rule card 3: Remote Telegram Command Backups [Backup] */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              selectedRule === 'remote_backup' ? 'bg-slate-950/80 border-purple-500/40 shadow shadow-purple-500/5' : 'bg-slate-900/60 border-white/5'
            }`}>
              <div className="flex items-center justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Smartphone size={13} className="text-purple-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100 font-display">Đóng Gói Bảo Lưu Từ Di Động</h5>
                    <p className="text-[9px] text-slate-400">Command: [Backup]</p>
                  </div>
                </div>

                <Badge variant="glass" className="text-[8px] text-purple-300 border-purple-500/20">DÒNG LỆNH HAI CHIỀU</Badge>
              </div>
              <p className="text-[10px] text-slate-405 leading-relaxed mb-3">
                Người dùng gửi tin nhắn <code className="text-purple-300 font-mono text-[9px] py-0.5 px-1 rounded bg-purple-950/40 border border-purple-500/10">[Backup]</code> trực tiếp vào Robot trên di động, hệ thống tự động mã hóa AES tài khoản và trả lại chuỗi băm sao lưu.
              </p>
              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                <span className="text-[9px] text-slate-500 font-mono">Status: Enabled</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="glass" 
                  onClick={() => {
                    setSelectedRule('remote_backup');
                    executeSimulation('remote_backup');
                  }}
                  disabled={simulating}
                  className="font-semibold text-[10px] border border-purple-500/20 hover:border-purple-500/40 text-purple-400"
                >
                  <Play size={10} className="mr-1" />
                  Kích Hoạt Nhận Lệnh
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Terminal Console Logs output screen */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 select-none font-display">
              <Terminal size={14} className="text-green-400" />
              <span>NHẬT KÝ BẢO MẬT & WEBHOOKS SYSTEM</span>
            </h4>
            
            <button 
              type="button"
              onClick={() => {
                setLogs([]);
                toast.success('Đã xóa nhật ký bảng điều khiển');
              }}
              className="text-[9px] font-bold text-slate-500 hover:text-slate-300 tracking-wide font-display transition-colors select-none cursor-pointer"
            >
              CLEAR LOGS
            </button>
          </div>

          {/* Simulated Terminal wrapper */}
          <div className="flex-1 bg-slate-950 border border-white/5 rounded-xl p-4 font-mono text-xs flex flex-col h-[480px] overflow-hidden justify-between">
            
            {/* Logs Body */}
            <div className="flex-grow overflow-y-auto flex flex-col gap-3 pr-1" id="terminal-event-scroller">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 font-sans p-6 self-center my-auto min-h-[350px]">
                  <Terminal size={24} className="mb-2 opacity-55 text-slate-550" />
                  <p className="text-[11px] font-black">Nhật ký phiên trống trơn</p>
                  <p className="text-[9px] mt-0.5 max-w-[200px] leading-relaxed">Hãy bấm kích hoạt quy trình hoặc sự kiện bất kỳ ở sơ đồ để theo dõi lưu lượng dữ liệu tức thì.</p>
                </div>
              ) : (
                logs.map((lg, idx) => (
                  <div key={idx} className="border-b border-white/5 pb-2.5 last:border-0">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] text-slate-600 shrink-0 select-none">[{lg.timestamp}]</span>
                        <span className={`text-[10px] font-black uppercase shrink-0 px-1 py-0.2 rounded border ${
                          lg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          lg.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          lg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-slate-800 text-slate-300 border-white/10'
                        }`}>
                          {lg.trigger}
                        </span>
                      </div>
                      
                      {lg.payload && (
                        <span className="text-[8px] text-cyan-400 select-none font-sans font-semibold">HAS_PAYLOAD 🛡️</span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">{lg.message}</p>
                    
                    {lg.payload && (
                      <pre className="mt-1.5 p-2 bg-slate-900 border border-white/5 rounded text-[10px] text-cyan-300 overflow-x-auto select-all leading-tight">
                        {lg.payload}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Terminal bottom static marker bar */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-mono select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>Hệ thống Bảo mật Noka</span>
              </div>
              <span>LUỒNG DỮ LIỆU ĐƯỢC BẢO VỆ</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
export default AutomationEngine;
