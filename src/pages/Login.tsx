import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../lib/i18n';
import { Button, Input } from '../components/ui';
import { ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

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
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-5 bg-red-500/10 border border-red-500/35 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-400 overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 animate-bounce" />
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-red-300">Lỗi xác thực</span>
                <span className="font-sans text-slate-300 leading-relaxed">{errorMsg}</span>
              </div>
            </motion.div>
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
