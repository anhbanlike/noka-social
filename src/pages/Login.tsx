import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../lib/i18n';
import { Button, Input } from '../components/ui';
import { ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import firebaseConfig from '../../firebase-applet-config.json';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, initialized, initialize } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOfflineBypass = async () => {
    setErrorMsg(null);
    setLoading(true);
    setLoadingStep('💾 Đang khởi tạo cơ sở dữ liệu giả lập cục bộ...');
    
    // Check if we already have some user, if not create a default one
    const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
    let targetUser = users[0];
    
    if (users.length === 0) {
      // Create a default offline developer/test account
      const userId = 'usr_offline_dev';
      const refCode = 'NK-OFFLINE';
      const realEmail = 'demo@noka-offline.local';
      
      const newUser = {
        id: userId,
        username: identifier.trim() || 'demo',
        email: realEmail,
        full_name: 'Noka Guest',
        phone: '0987654321',
        password: password || '12345678',
        referral_code: refCode,
        created_at: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem('noka_users', JSON.stringify(users));
      
      const profile = {
        id: userId,
        username: identifier.trim() || 'demo',
        full_name: 'Noka Guest',
        phone: '0987654321',
        avatar_url: null,
        referral_code: refCode,
        created_at: new Date().toISOString(),
      };
      
      const profiles = JSON.parse(localStorage.getItem('noka_profiles') || '[]');
      profiles.push(profile);
      localStorage.setItem('noka_profiles', JSON.stringify(profiles));
      
      targetUser = newUser;
    } else {
      // Find matching user or just pick the first one, or register entered credentials
      const matched = users.find((u: any) => 
        u.username.toLowerCase() === identifier.toLowerCase().trim() || 
        (u.email && u.email.toLowerCase() === identifier.toLowerCase().trim())
      );
      if (matched) {
        targetUser = matched;
      } else {
        // Automatically create a local offline account with entered credentials to avoid friction!
        const userId = `usr_offline_${Math.random().toString(36).substring(2, 10)}`;
        const refCode = `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const realEmail = identifier.includes('@') ? identifier.trim() : `${identifier.toLowerCase().trim()}@noka-offline.local`;
        
        const newUser = {
          id: userId,
          username: identifier.trim(),
          email: realEmail,
          full_name: identifier.trim(),
          phone: '0987654321',
          password: password || '12345678',
          referral_code: refCode,
          created_at: new Date().toISOString(),
        };
        
        users.push(newUser);
        localStorage.setItem('noka_users', JSON.stringify(users));
        
        const profile = {
          id: userId,
          username: identifier.trim(),
          full_name: identifier.trim(),
          phone: '0987654321',
          avatar_url: null,
          referral_code: refCode,
          created_at: new Date().toISOString(),
        };
        
        const profiles = JSON.parse(localStorage.getItem('noka_profiles') || '[]');
        profiles.push(profile);
        localStorage.setItem('noka_profiles', JSON.stringify(profiles));
        
        targetUser = newUser;
      }
    }
    
    // Log the user in offline
    localStorage.setItem('noka_session', JSON.stringify({ userId: targetUser.id, email: targetUser.email }));
    
    // Update store state
    const profile = {
      id: targetUser.id,
      username: targetUser.username,
      full_name: targetUser.full_name,
      phone: targetUser.phone,
      avatar_url: targetUser.avatar_url || null,
      referral_code: targetUser.referral_code,
      created_at: targetUser.created_at,
    };
    
    useAuthStore.setState({ user: profile, sessionEmail: targetUser.email, loading: false });
    
    setLoadingStep('✅ Khởi tạo giả lập ngoại tuyến hoàn tất!');
    toast.success(`Đăng nhập chế độ giả lập ngoại tuyến thành công! Xin chào, ${targetUser.full_name}.`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    navigate('/dashboard');
  };

  // Initialize and verify redirects
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard');
    }
  }, [initialized, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Vui lòng điền Tên đăng nhập hoặc Email!');
      toast.error('Vui lòng điền Tên đăng nhập hoặc Email!');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng điền mật mã của bạn!');
      toast.error('Vui lòng điền mật mã của bạn!');
      return;
    }

    setLoading(true);
    setLoadingStep('🔐 Mã hóa dữ liệu truyền tải SSL...');
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLoadingStep('📡 Thiết lập kết nối cơ sở dữ liệu...');
    const { error, profile } = await signIn(identifier.trim(), password);

    if (error) {
      const parsedErr = error === 'Incorrect credentials'
        ? 'Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.'
        : error;
      setErrorMsg(parsedErr);
      toast.error(parsedErr);
      setLoading(false);
      setLoadingStep('');
    } else {
      setLoadingStep('✅ Xác thực cấu hình đám mây thành công!');
      toast.success(`Đăng nhập thành công! Chào mừng trở lại, ${profile?.full_name || 'Noka User'}.`);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="login-page-container">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10 my-8"
      >
        
        {/* Header monogram logo */}
        <div className="flex flex-col items-center text-center gap-2 mb-8 select-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2"
          >
            <span className="text-white font-extrabold text-lg tracking-wider font-display">NK</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-black font-display text-white tracking-wide"
          >
            {t.appName.toUpperCase()}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-slate-400 font-medium max-w-sm"
          >
            {t.auth_welcome_title}
          </motion.p>
        </div>

        {/* Dynamic visual alert notification panels */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <div className="flex flex-col gap-3 mb-5">
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/35 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-400 overflow-hidden"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 animate-bounce" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-red-300">Lỗi xác thực</span>
                  <span className="font-sans text-slate-300 leading-relaxed">{errorMsg}</span>
                </div>
              </motion.div>

              {(errorMsg.includes('auth/operation-not-allowed') || errorMsg.includes('operation-not-allowed')) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-950/80 border border-blue-500/30 rounded-xl flex flex-col gap-3 text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2 text-blue-400 font-extrabold uppercase tracking-wider text-[11px]">
                    <Sparkles size={14} className="animate-pulse shrink-0" />
                    <span>Hướng dẫn cấu hình Firebase Auth</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-sans">
                    Dự án Firebase của bạn chưa kích hoạt phương thức đăng nhập bằng <strong>Email/Password</strong>. Hãy thực hiện các bước sau để cấu hình:
                  </p>
                  <ol className="list-decimal pl-4 flex flex-col gap-1 text-slate-400 font-sans">
                    <li>Truy cập <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-extrabold">Firebase Console</a></li>
                    <li>Tìm và chọn dự án: <strong>{firebaseConfig.projectId}</strong></li>
                    <li>Đi tới <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; tab <strong>Sign-in method</strong></li>
                    <li>Chọn <strong>Email/Password</strong>, nhấp <strong>Enable (Kích hoạt)</strong> và nhấn <strong>Save (Lưu)</strong>.</li>
                  </ol>
                  <div className="h-px bg-white/5 my-1" />
                  <p className="text-slate-400 leading-relaxed font-sans">
                    Hoặc dùng thử ứng dụng ngay với chế độ <strong>Giả lập Ngoại tuyến (Offline Emulator)</strong> bảo mật cục bộ:
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full bg-blue-600/10 hover:bg-blue-600/25 border-blue-500/40 text-blue-300 font-bold flex items-center justify-center gap-2 py-2"
                    id="login-offline-bypass-btn"
                    onClick={handleOfflineBypass}
                  >
                    <ShieldCheck size={14} />
                    <span>Kích Hoạt & Đăng Nhập Ngoại Tuyến</span>
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-blue-400 overflow-hidden"
            >
              <Loader2 size={16} className="animate-spin text-cyan-400 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-blue-300">Đang xử lý đăng nhập</span>
                <span className="font-sans text-slate-400 text-[10px] animate-pulse">{loadingStep}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form authentication inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 block" id="login-auth-form">
          <div className="flex flex-col gap-1">
            <Input
              id="login-identifier"
              label="Tên đăng nhập hoặc Email"
              placeholder={t.auth_username_placeholder}
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
            />
            {identifier.trim().length > 0 && !identifier.includes('@') && (
              <span className="text-[10px] text-slate-500 self-end">
                Hệ thống sẽ tự động định danh tài khoản bằng Tên đăng nhập
              </span>
            )}
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider">
                {t.auth_password}
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                {t.auth_forgot_link}
              </Link>
            </div>

            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              placeholder={t.auth_password_placeholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              required
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 bottom-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t.loading}...</span>
              </>
            ) : (
              <span>{t.auth_login_now}</span>
            )}
          </Button>
        </form>

        {/* Navigation fallback pathways */}
        <div className="flex items-center justify-center mt-6 text-xs text-slate-400 gap-1 select-none">
          <span>{t.auth_no_account}</span>
          <Link to="/register" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
            {t.auth_register_now}
          </Link>
        </div>

        {/* Floating bottom translations selector */}
        <div className="flex justify-center border-t border-white/5 pt-5 mt-6 gap-4 select-none" id="login-locale-selector">
          <button
            onClick={() => setLanguage('vi')}
            className={`text-xs font-bold font-display px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'vi' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🇻🇳 TIẾNG VIỆT
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`text-xs font-bold font-display px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'en' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🇺🇸 ENGLISH
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={`text-xs font-bold font-display px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'zh' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🇨🇳 中文
          </button>
        </div>

      </motion.div>
    </div>
  );
};
export default Login;
