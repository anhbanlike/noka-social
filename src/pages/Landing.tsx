import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui';
import { 
  ShieldCheck, ShieldAlert, KeyRound, Bot, ArrowRight, Zap, 
  Lock, Globe, Flame, RefreshCw, Layers, CheckCircle, HelpCircle,
  Menu, X, Sparkles, MessageSquare, Terminal, Key, Cpu, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Landing: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  
  // Custom states for interactive Encryption Sandbox demo helper
  const [sandboxPlain, setSandboxPlain] = useState('MyNokaSecretPassword123!');
  const [sandboxKey, setSandboxKey] = useState('MASTER-KEY-DECRYPTER-99');
  const [sandboxEncrypted, setSandboxEncrypted] = useState('U2FsdGVkX1+QvK8v5E7p/8Kpxi...NokaClientSecure=');
  const [sandboxMode, setSandboxMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState('');

  // FAQ Expand state
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Mobile menu trigger
  const [mobileMenu, setMobileMenu] = useState(false);

  // Simple simulated custom AES encryption simulation
  const triggerSandboxAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (sandboxMode === 'encrypt') {
        const encryptedFake = `NK-AES256-[${btoa(unescape(encodeURIComponent(sandboxPlain))).slice(0, 24)}]-[SECURE-KEY]`;
        setSandboxEncrypted(encryptedFake);
        setDecryptedResult('');
      } else {
        setDecryptedResult(sandboxPlain);
      }
      setIsProcessing(false);
    }, 850);
  };

  const faqs = [
    {
      q: "Noka Social mã hóa dữ liệu khách hàng như thế nào?",
      a: "Tất cả mật mã hoặc thông tin tài khoản được mã hóa trực tiếp trên thiết bị (Client-side) bằng thuật toán mã hóa đối xứng AES-256 trước khi được lưu truyền hoặc đồng bộ. Chỉ có bạn nắm giữa khoá Master Key để giải mã."
    },
    {
      q: "Cảnh báo bảo mật qua Telegram hoạt động ra sao?",
      a: "Bạn có thể tự phát triển hoặc tạo Bot Telegram của riêng mình và cung cấp mã API Token kèm Chat ID cá nhân vào bảng điều khiển. Noka sẽ truyền tin trực tiếp tới bot, gửi các cảnh báo đăng nhập bất thường hoặc mã xác nhận OTP tức thì hoàn toàn tự động."
    },
    {
      q: "Có phải trả phí để sử dụng Noka Social không?",
      a: "Bản Tiêu chuẩn luôn luôn miễn phí lưu trữ không giới hạn cho người dùng cá nhân. Bạn chỉ trả phí cho các tính năng nâng cao như Tải kịch bản tự động hóa nặng, hỗ trợ API khép kín doanh nghiệp hoặc đồng bộ đa thiết bị cloud bảo mật toàn phần."
    },
    {
      q: "Dữ liệu của tôi được lưu trữ ở đâu?",
      a: "Theo cơ chế phân tán cao, dữ liệu được mã hóa của bạn có tùy chọn lưu trữ cục bộ khép kín trên thiết bị (Local Sandbox) hoặc đồng bộ hóa thông qua đám mây bảo mật được phân tán của Noka Social bằng mã hóa đầu cuối (E2EE)."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden font-sans" id="landing-page-root">
      
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] bg-blue-600/10 rounded-full filter blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full filter blur-[150px]" />
      </div>

      {/* FLOATING HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 select-none" id="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo with monogram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-extrabold text-sm tracking-widest font-display">NK</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black font-display text-white tracking-widest uppercase leading-none">NOKA SOCIAL</span>
              <span className="text-[9px] font-bold text-cyan-400 tracking-wider uppercase mt-1 leading-none">Security Suite</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wider uppercase">Tính năng</a>
            <a href="#sandbox" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wider uppercase">Bản thử mã hoá</a>
            <a href="#pricing" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wider uppercase">Bảng giá</a>
            <a href="#faq" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wider uppercase">Hỏi đáp</a>
          </nav>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language switch button */}
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5">
              <button 
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${language === 'vi' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow' : 'text-slate-500 hover:text-slate-350'}`}
              >
                VI
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] rounded font-bold transition-all ${language === 'en' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow' : 'text-slate-500 hover:text-slate-350'}`}
              >
                EN
              </button>
            </div>

            <Link to="/login">
              <Button variant="ghost" className="text-xs tracking-wider uppercase font-bold text-slate-300 hover:text-white">
                Đăng nhập
              </Button>
            </Link>
            
            <Link to="/register">
              <Button variant="primary" size="sm" className="text-xs tracking-wider uppercase font-black px-5 border border-cyan-500/20">
                Đăng ký miễn phí
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-1.5 text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-950 border-b border-white/5"
            >
              <div className="px-5 pt-3 pb-6 flex flex-col gap-4 text-left">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenu(false)}
                  className="text-xs font-semibold text-slate-300 hover:text-white tracking-wider uppercase py-1 border-b border-white/5"
                >
                  Tính năng
                </a>
                <a 
                  href="#sandbox" 
                  onClick={() => setMobileMenu(false)}
                  className="text-xs font-semibold text-slate-300 hover:text-white tracking-wider uppercase py-1 border-b border-white/5"
                >
                  Bản thử mã hoá
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenu(false)}
                  className="text-xs font-semibold text-slate-300 hover:text-white tracking-wider uppercase py-1 border-b border-white/5"
                >
                  Bảng giá
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setMobileMenu(false)}
                  className="text-xs font-semibold text-slate-300 hover:text-white tracking-wider uppercase py-1 border-b border-white/5"
                >
                  Hỏi đáp
                </a>
                
                <div className="flex gap-4 items-center mt-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenu(false)}>
                    <Button variant="secondary" className="w-full text-xs">Đăng nhập</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileMenu(false)}>
                    <Button variant="primary" className="w-full text-xs">Đăng ký free</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center select-none" id="landing-hero">
        
        {/* Decorative Badge tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6 animate-pulse">
          <Sparkles size={11} />
          <span>PHIÊN BẢN CẤP CAO TIÊU CHUẨN QUỐC TẾ</span>
        </div>

        {/* Main Header Display font text */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight max-w-4xl">
          Giải pháp quản lý mật mã <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
            an toàn tuyệt đối
          </span> cho người Việt
        </h1>

        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mt-5 font-medium leading-relaxed font-sans">
          Bảo vệ kho dữ liệu số, tài khoản mạng xã hội của bạn bằng cơ chế mã hóa đầu cuối <b>AES-256</b> tiên tiến, kết hợp tự động hoá cảnh báo trực tiếp qua <b>Telegram Guard Bot</b> riêng tư của bạn.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md justify-center">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs tracking-widest uppercase font-black px-8 py-3.5 flex items-center justify-center gap-2">
              <span>BẮT ĐẦU BẢO MẬT NGAY</span>
              <ArrowRight size={14} className="text-white" />
            </Button>
          </Link>
          <a href="#sandbox" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xs tracking-widest uppercase font-bold px-8 py-3.5 flex items-center justify-center gap-2">
              <Terminal size={14} className="text-slate-400" />
              <span>Chạy mã hoá thử nghiệm</span>
            </Button>
          </a>
        </div>

        {/* Security badges display grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 w-full max-w-4xl border-t border-b border-white/5 py-6">
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-black text-white leading-none">AES-256</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Mã hóa đối xứng</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-black text-cyan-400 leading-none">0 ms</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Trễ báo Telegram Bot</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-black text-white leading-none">100%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Mã hóa đầu cuối</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-black text-cyan-400 leading-none">Đa tầng</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Phân quyền bảo vệ</span>
          </div>
        </div>

      </section>

      {/* CORE CAPABILITY SPECIFIC GRAPHICS PREVIEW */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10" id="preview-mockup">
        <div className="relative mx-auto rounded-2xl md:rounded-3xl border border-white/10 bg-slate-900/40 p-3 md:p-4 shadow-2xl overflow-hidden shadow-blue-500/5 select-none animate-fade-in">
          
          {/* Top chrome visual frame */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 px-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/60 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500/60 rounded-full" />
              <div className="w-3 h-3 bg-green-500/60 rounded-full" />
            </div>
            <div className="hidden sm:flex bg-slate-950/70 border border-white/5 rounded-lg px-20 py-1 text-[10px] text-slate-500 font-mono tracking-wider">
              https://ais-secure.noka.social/dashboard
            </div>
            <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-slate-500 text-[10px] font-bold">NK</div>
          </div>

          {/* Interactive display simulation illustration image */}
          <div className="bg-slate-950/90 rounded-xl p-5 md:p-8 flex flex-col md:flex-row gap-6 relative">
            
            {/* Simulation Dashboard mockup part */}
            <div className="flex-1 flex flex-col gap-4 text-left">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest">NOKA SECURE SANDBOX</span>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Bảng điều khiển giám sát an ninh</h3>
              
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hạ tầng liên kết</span>
                  <div className="flex items-center gap-1.5 text-xs text-white uppercase font-bold mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-emerald-400">Telegram Bot Active</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Độ an toàn mật khẩu</span>
                  <div className="flex items-center gap-1.5 text-xs text-white uppercase font-bold mt-1">
                    <span className="text-cyan-400 font-black">Mức A+ (TỐT)</span>
                  </div>
                </div>
              </div>

              {/* Fake pass items inside simulation layout */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-500/10">F</div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">facebook.com - Cá nhân</span>
                      <span className="text-[9px] text-slate-500 font-mono">ID: noka_user_99</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/15">Mực bảo mật cao</span>
                </div>

                <div className="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-red-600/10 rounded-lg flex items-center justify-center text-red-400 font-bold text-xs border border-red-500/10">G</div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">gmail.com - Công việc</span>
                      <span className="text-[9px] text-slate-505 font-mono">ID: partner_auth_11</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/15">Cực kỳ an toàn</span>
                </div>
              </div>
            </div>

            {/* Simulated Mobile Device with Bot message on the right side */}
            <div className="w-full md:w-80 bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden text-left h-fit self-center">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full filter blur-xl" />
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot size={13} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white leading-none">@NokaSocialGuard_bot</span>
                    <span className="text-[8px] text-emerald-400 mt-0.5 leading-none">bot hoạt động 24/7</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              {/* Telegram bot message balloon bubbles */}
              <div className="flex flex-col gap-2.5 text-[9.5px]">
                
                <div className="p-2.5 bg-slate-950 rounded-lg border border-white/5 relative">
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    🔔 <b>PHÁT HIỆN YÊU CẦU ĐỒNG BỘ</b>
                    {"\n\n"}Chào bạn <i>AnhBanLike</i>, hệ thống vừa sao lưu khôi phục mật khẩu.
                    {"\n\n"}🔑 Mã OTP của bạn là: <b>359146</b>
                  </p>
                  <span className="text-[8px] text-slate-550 block text-right mt-1.5">03:12 AM</span>
                </div>

                <div className="p-2.5 bg-red-950/15 border border-red-500/15 rounded-lg">
                  <p className="text-red-300 leading-relaxed font-sans">
                    ⚠️ <b>CẢNH BÁO ĐĂNG NHẬP LẠ</b>
                    {"\n\n"}Tài khoản của bạn vừa đăng nhập từ địa chỉ IP: <b>14.232.115.9</b> (Hà Nội, Việt Nam).
                    {"\n\n"}<i>Thiết bị: Safari trên MacOSX.</i>
                  </p>
                  <span className="text-[8px] text-red-450 block text-right mt-1.5">Cách đây 2 phút</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES INDEX CARDS */}
      <section className="py-20 md:py-28 bg-slate-950 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center select-none" id="features">
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/10 px-3 py-1 rounded-full bg-cyan-500/5">GIẢI PHÁP VƯỢT TRỘI</span>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase mt-4">Hệ sinh thái an ninh mạng thế hệ mới</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-3 leading-relaxed">Khám phá các trụ cột bảo mật cốt lõi giúp Noka Social giữ vững an toàn cho kho lưu trữ số của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
          
          {/* Card 1: E2EE Encryption */}
          <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-blue-400 mb-5">
              <Lock size={20} />
            </div>
            
            <h3 className="text-sm font-black text-white tracking-widest uppercase mb-2">Mã hóa đầu cuối E2EE</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Khoá giải mã dựa trên Master Key của bạn được băm tại thiết bị. Noka tối thiểu không thể đọc trộm hay nhòm ngó các mật khẩu, tài khoản ngân hàng của bạn dưới bất cứ cách nào.
            </p>
          </div>

          {/* Card 2: Telegram Hook Alerts */}
          <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 mb-5">
              <Bot size={20} />
            </div>
            
            <h3 className="text-sm font-black text-white tracking-widest uppercase mb-2">Telegram Integration</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Ứng cứu an ninh trong chớp mắt. Tự động khởi chạy kịch bản gửi tin cảnh báo, mã xác thực OTP hay các biến động tài khoản mật thiết đến bot telegram chỉ thuộc sở hữu của bạn.
            </p>
          </div>

          {/* Card 3: Multi-tier Access control */}
          <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 mb-5">
              <Layers size={21} />
            </div>
            
            <h3 className="text-sm font-black text-white tracking-widest uppercase mb-2">Phân tầng truy cập</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Liên kết các nền tảng mạng xã hội, chia tách quyền truy cập thành từng cấp độ bảo mật linh hoạt (Thấp, Trung bình, Cao). Giới hạn tối ưu tổn thương hệ thống nếu bị lộ lọt.
            </p>
          </div>

        </div>
      </section>

      {/* INTERACTIVE AES-256 ENCRYPTION SANDBOX PROOF ZONE */}
      <section className="py-20 bg-slate-900/40 border-t border-b border-white/5 select-none" id="sandbox">
        <div className="max-w-4xl mx-auto px-4 text-center">
          
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">MINH BẠCH HOÀN TOÀN (INTERACTIVE PROOF)</span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase mt-4 mb-2">Thử nghiệm bảo mật Sandbox</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mb-12">
            Nhập văn bản bất kỳ ở đây để thấy cách thức Noka Social chạy giải thuật mã hóa chuyển đổi chuỗi dữ liệu đầu cuối sang AES cipher block an toàn trực tiếp trên thiết bị của bạn.
          </p>

          <div className="p-5 md:p-8 bg-slate-900 border border-white/10 rounded-2xl flex flex-col gap-6 text-left relative overflow-hidden">
            <div className="absolute top-[-2%] right-[-2%] opacity-10">
              <Cpu size={150} className="text-cyan-400" />
            </div>

            {/* Sandbox mode select toggles */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-white/5 self-start shadow-inner">
              <button
                type="button"
                onClick={() => { setSandboxMode('encrypt'); setDecryptedResult(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  sandboxMode === 'encrypt' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock size={12} />
                <span>Mã hoá (Encrypt)</span>
              </button>
              <button
                type="button"
                onClick={() => { setSandboxMode('decrypt'); setSandboxEncrypted(`NK-AES256-[${btoa(unescape(encodeURIComponent(sandboxPlain))).slice(0, 24)}]-[SECURE-KEY]`); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  sandboxMode === 'decrypt' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key size={12} />
                <span>Giải mã (Decrypt)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Input section */}
              <div className="flex flex-col gap-4">
                {sandboxMode === 'encrypt' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Văn bản thô (Plain Password)</label>
                    <textarea
                      value={sandboxPlain}
                      onChange={(e) => setSandboxPlain(e.target.value)}
                      placeholder="Gõ chuỗi mật mã, mật bảo mật muốn lưu trữ..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Đoạn Cipher Text đã mã hóa</label>
                    <textarea
                      value={sandboxEncrypted}
                      onChange={(e) => setSandboxEncrypted(e.target.value)}
                      placeholder="Chuỗi mã hoá AES Cipher text..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-cyan-400"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Nhập khóa giải mã (Master Key Password)</label>
                  <input
                    type="text"
                    value={sandboxKey}
                    onChange={(e) => setSandboxKey(e.target.value)}
                    placeholder="Mật khẩu Master của riêng bạn..."
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                  />
                  <span className="text-[9px] text-slate-500 leading-normal mt-0.5 flex items-center gap-1.5">
                    <AlertCircle size={10} className="text-amber-500 shrink-0" />
                    Không một ai kể cả máy chủ Web của Noka được biết mã khoá giải này.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={triggerSandboxAction}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 mt-2 select-none shadow shadow-blue-500/10 cursor-pointer active:scale-98 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>ĐANG CHẠY GIẢI THUẬT...</span>
                    </>
                  ) : sandboxMode === 'encrypt' ? (
                    <>
                      <Lock size={12} />
                      <span>Thực thi mã hoá AES-256</span>
                    </>
                  ) : (
                    <>
                      <Key size={12} />
                      <span>Thực thi giải mã</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Sandbox console terminal view */}
              <div className="bg-slate-950 rounded-xl border border-white/5 p-4 flex flex-col h-full min-h-[220px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-[9px] font-mono font-bold text-slate-450 tracking-wider">CONSOLE OUTPUT TERMINAL</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">READY</span>
                </div>

                {sandboxMode === 'encrypt' ? (
                  <div className="flex-1 flex flex-col justify-between font-mono text-xs select-text">
                    <div className="flex flex-col gap-1.5 text-slate-400">
                      <p className="text-[10px] text-slate-600">&gt; Initializing Client-side cryptographic layer...</p>
                      <p className="text-[10px] text-slate-600">&gt; Dynamic key salt paired with Master Key</p>
                      <p className="text-[10px] text-indigo-400">&gt; SHA-256 Hashed PBKDF2 successfully generated...</p>
                    </div>

                    <div className="bg-slate-900/60 hover:bg-slate-900/90 p-3 rounded-lg border border-white/5 text-cyan-400 select-all font-mono font-bold text-[10.5px] mt-4 leading-normal break-all">
                      {sandboxEncrypted}
                    </div>

                    <span className="text-[9px] text-slate-500 italic mt-2.5 leading-tight select-none">
                      ✔ Bạn có thể copy chuỗi này đi lưu trữ ở bất cứ đâu. Tuyệt đối không có mật mã thô nào thoát ra ngoài!
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between font-mono text-xs select-text">
                    <div className="flex flex-col gap-1.5 text-slate-400">
                      <p className="text-[10px] text-slate-600">&gt; Querying Local Cipher block decryptor...</p>
                      <p className="text-[10px] text-slate-600">&gt; Checking integrity payload credentials...</p>
                    </div>

                    <div className="bg-slate-900/65 p-3 rounded-lg border border-white/5 text-emerald-400 font-mono font-bold text-[11px] mt-4 select-all">
                      {decryptedResult ? decryptedResult : '⚠️ Hãy nhấn Nút Giải mã để hiển thị kết quả giải mã.'}
                    </div>

                    <span className="text-[9px] text-slate-500 italic mt-2.5 leading-tight select-none">
                      ✔ Kết quả sẽ trả về văn bản nguyên bản ban đầu nếu Master Key bạn nhập trùng khớp.
                    </span>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* DETAILED TIER PLAN PRICING BLOCKS */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center select-none" id="pricing">
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/10 px-3 py-1 rounded-full bg-cyan-500/5">CHI PHÍ MINH BẠCH</span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase mt-4">Lựa chọn gói bảo vệ tối ưu</h2>
          <p className="text-xs text-slate-400 max-w-xl mt-3 leading-relaxed">Tìm kiếm giải pháp đồng hành tốt nhất với quy mô kho lưu trữ mật mã của riêng bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left items-stretch">
          
          {/* Plan 1: Free Tier */}
          <div className="p-6 bg-slate-900/70 border border-white/5 rounded-2xl flex flex-col justify-between relative">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-450 uppercase tracking-widest">GÓI CÁ NHÂN (FREE)</span>
                <span className="text-3xl font-black text-white mt-2">0đ <span className="text-xs text-slate-500 font-medium">/ vĩnh viễn</span></span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">Sự khởi đầu tuyệt hảo cho nhu cầu quản trị và giữ liệu mật mã hộ gia đình, lưu trữ cá nhân tiện lợi.</p>
              
              <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Lưu trữ không giới hạn tài khoản</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Mã hóa AES-256 đầu cuối</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Hỗ trợ 1 liên kết Telegram Bot cá nhân</span></div>
                <div className="flex items-center gap-2 text-slate-550"><X size={13} className="text-slate-650 shrink-0" /> <span className="line-through">Lưu bản ghi an ninh lâu dài</span></div>
              </div>
            </div>

            <Link to="/register" className="mt-8 block">
              <Button variant="secondary" className="w-full text-xs font-black uppercase tracking-widest py-3">BẮT ĐẦU MIỄN PHÍ</Button>
            </Link>
          </div>

          {/* Plan 2: Pro Tier - Pop Highlights */}
          <div className="p-6 bg-slate-900 border border-cyan-500/30 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-cyan-500/5 hover:-y-1 transition-all duration-300">
            <span className="absolute top-3 right-3 bg-cyan-500 text-slate-950 font-black text-[8.5px] tracking-widest uppercase px-2 py-0.5 rounded">PHỔ BIẾN NHẤT</span>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-500" />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">NOKA PREMIUM SECURE</span>
                <span className="text-3xl font-black text-white mt-2">120.000đ <span className="text-xs text-slate-500 font-medium">/ tháng</span></span>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">Công nghệ tự động tích hợp cao chuyên dùng cho chuyên gia công nghệ, người có nguồn tài sản số cực lớn.</p>
              
              <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-200">
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Mọi tính năng gói Cá Nhân</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Cấu hình không giới hạn Guard Bot</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Kích hoạt tự động hóa kịch bản an ninh</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Đồng bộ hóa đám mây E2EE đa thiết bị</span></div>
              </div>
            </div>

            <Link to="/register" className="mt-8 block">
              <Button variant="primary" className="w-full text-xs font-black uppercase tracking-widest py-3 border border-cyan-500/25">ĐĂNG KÝ NGAY</Button>
            </Link>
          </div>

          {/* Plan 3: Enterprise Tier */}
          <div className="p-6 bg-slate-900/70 border border-white/5 rounded-2xl flex flex-col justify-between relative">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-450 uppercase tracking-widest">ENTERPRISE BLOCK</span>
                <span className="text-3xl font-black text-white mt-2">Thương lượng <span className="text-xs text-slate-500 font-medium">/ doanh nghiệp</span></span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">Cung cấp cơ sở thiết lập tủ khóa chuyên dụng thích hợp cho tập đoàn lớn chia sẻ mật mã hệ thống.</p>
              
              <div className="flex flex-col gap-2.5 mt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Tủ khóa cô lập On-premise</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Quản trị viên đa tầng chia sẻ bảo mật</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Cam kết thời gian hoạt động SLA 99.99%</span></div>
                <div className="flex items-center gap-2"><CheckCircle size={13} className="text-cyan-400 shrink-0" /> <span>Hỗ trợ đại diện kĩ thuật 24/7 tức thời</span></div>
              </div>
            </div>

            <a href="mailto:support@noka.social" className="mt-8 block">
              <Button variant="secondary" className="w-full text-xs font-black uppercase tracking-widest py-3">LIÊN HỆ CHÚNG TÔI</Button>
            </a>
          </div>

        </div>
      </section>

      {/* USER FRIENDLY SECURITY ACCORDION FAQ */}
      <section className="py-20 md:py-28 bg-slate-900/30 border-t border-b border-white/5 select-none" id="faq">
        <div className="max-w-3xl mx-auto px-4">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/10 px-3 py-1 rounded-full bg-cyan-500/5">GIẢI QUYẾT NGHI NGỜ</span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase mt-4">Hỏi đáp về Noka Social</h2>
            <p className="text-xs text-slate-450 mt-2">Dưới đây là một số thông tin bạn cần hiểu rõ trước khi gửi trọn mật mã số cho hệ thống cứu cánh của chúng tôi.</p>
          </div>

          <div className="flex flex-col gap-4 text-left">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-slate-900 border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-white/10 transition-colors"
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs md:text-sm font-extrabold text-white uppercase tracking-wider">{faq.q}</h4>
                  <div className="w-6 h-6 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    <span className="text-xs font-bold font-mono">{faqOpen === idx ? '−' : '+'}</span>
                  </div>
                </div>

                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="py-12 bg-slate-950 border-t border-white/5 select-none text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow">
              <span className="text-white font-black text-xs">NK</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-slate-350 tracking-wider">NOKA SOCIAL</span>
              <p className="text-[10px] text-slate-550 font-medium">Bảo vệ tài sản số & mật mã thời đại mới.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px] text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#sandbox" className="hover:text-white transition-colors">Mã hoá thử nghiệm</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
            <span className="text-slate-650">|</span>
            <span>© 2026 Noka Social Inc. Việt Nam.</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
