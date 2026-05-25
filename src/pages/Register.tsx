import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../lib/i18n';
import { Button, Input } from '../components/ui';
import { ShieldCheck, Eye, EyeOff, Mail, Phone, Lock, User, Sparkles, Languages, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user, initialized, initialize } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggles
  const [hasNoEmail, setHasNoEmail] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Verify redirects
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

  // Handle password strength calculation dynamically
  useEffect(() => {
    if (!password) {
      setStrength('weak');
      return;
    }
    const hasNum = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLong = password.length >= 8;

    if (isLong && hasNum && hasSpecial) {
      setStrength('strong');
    } else if (password.length >= 6) {
      setStrength('medium');
    } else {
      setStrength('weak');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Field Validations
    if (username.length < 3) {
      setErrorMsg('Tên đăng nhập tối thiểu phải có 3 ký tự!');
      toast.error('Tên đăng nhập tối thiểu phải có 3 ký tự!');
      return;
    }
    const nameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nameRegex.test(username)) {
      setErrorMsg('Tên đăng nhập chỉ chấp nhận chữ cái, chữ số và dấu gạch dưới!');
      toast.error('Tên đăng nhập chỉ chấp nhận chữ cái, chữ số và dấu gạch dưới!');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Họ và tên không được để trống!');
      toast.error('Họ và tên không được để trống!');
      return;
    }

    // Clean and validate Vietnamese phone formatting checks
    const cleanPhone = phone.trim().replace(/[\s.\-_()]/g, '');
    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('Số điện thoại không hợp lệ (Định dạng Việt Nam: 0xxxxxxxxx hoặc 84xxxxxxxxx)!');
      toast.error('Số điện thoại không hợp lệ (Định dạng Việt Nam: 0xxxxxxxxx)!');
      return;
    }

    if (!hasNoEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Email chưa đúng định dạng!');
        toast.error('Email chưa đúng định dạng!');
        return;
      }
    }

    if (password.length < 8) {
      setErrorMsg('Mật khẩu tối thiểu phải 8 ký tự!');
      toast.error('Mật khẩu tối thiểu phải 8 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Nhập lại mật khẩu không chính xác!');
      toast.error('Nhập lại mật khẩu không chính xác!');
      return;
    }

    setLoading(true);
    setLoadingStep('🔐 Đang mã hóa mật khẩu bảo mật đa tầng...');
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLoadingStep('🛰️ Đang tạo tài khoản dữ liệu riêng biệt trên đám mây...');
    const { error, profile } = await signUp({
      username,
      email: hasNoEmail ? null : email,
      full_name: fullName,
      phone: cleanPhone,
      password,
    });

    if (error) {
      setErrorMsg(error.message || 'Đăng ký tài khoản không thành công!');
      toast.error(error.message || 'Đăng ký tài khoản không thành công!');
      setLoading(false);
      setLoadingStep('');
    } else {
      setLoadingStep('🎉 Khởi tạo tài khoản và đồng bộ dữ liệu hoàn thành!');
      toast.success('Đăng ký tài khoản thành công! Chào mừng bạn đến với Noka Social.');
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const strengthLabels = {
    weak: { text: t.auth_strength_weak, color: 'bg-red-500', width: 'w-1/3' },
    medium: { text: t.auth_strength_medium, color: 'bg-amber-500', width: 'w-2/3' },
    strong: { text: t.auth_strength_strong, color: 'bg-green-500', width: 'w-full' },
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="register-page-container">
      {/* Background neon ambient gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10 my-8"
      >
        
        {/* Logo and Greeting Header */}
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
                <span className="font-extrabold text-red-300">Không thể đăng ký</span>
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
                <span className="font-extrabold text-blue-300">Đang khởi tạo tài khoản</span>
                <span className="font-sans text-slate-400 text-[10px] animate-pulse">{loadingStep}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Signup inputs Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="register-credentials-form">
          {/* Main profile row (FullName & Username) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="signup-username"
              label={t.auth_username}
              placeholder="noka_user"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                if (errorMsg) setErrorMsg(null);
              }}
              required
            />
            <Input
              id="signup-fullname"
              label={t.auth_full_name}
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
            />
          </div>

          {/* Contact rows (SĐT & Option Email toggle) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="signup-phone"
              label={t.auth_phone}
              placeholder="0987654321"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
            />

            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider">
                  {t.auth_email}
                </span>
                
                {/* No Email Toggle Switche */}
                <button
                  type="button"
                  onClick={() => {
                    setHasNoEmail(!hasNoEmail);
                    if (!hasNoEmail) setEmail('');
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                    hasNoEmail ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {t.auth_no_email}
                </button>
              </div>

              {!hasNoEmail ? (
                <Input
                  id="signup-email"
                  placeholder="name@noka.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  required
                />
              ) : (
                <div className="h-11 border border-white/5 bg-slate-950/20 px-4 flex items-center rounded-xl text-xs font-bold text-slate-500 select-none italic">
                  -- Đăng ký không bằng email --
                </div>
              )}
            </div>
          </div>

          {/* Master Password details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                id="signup-password"
                label={t.auth_password}
                placeholder="Tối thiểu 8 ký tự..."
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-9.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="relative">
              <Input
                id="signup-confirm-password"
                label={t.auth_confirm_password}
                placeholder="Nhập lại mật khẩu..."
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3.5 top-9.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Password Dynamic strength indicator bar */}
          {password && (
            <div id="password-strength-meter" className="flex flex-col gap-1.5 mt-1 pb-1">
              <div className="flex justify-between items-center text-[10px] font-semibold tracking-wider font-display text-slate-400">
                <span>MỨC ĐỘ BẢO MẬT</span>
                <span className="font-bold uppercase text-blue-400">{strengthLabels[strength].text}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${strengthLabels[strength].color} ${strengthLabels[strength].width}`}
                />
              </div>
            </div>
          )}

          {/* Submit register form */}
          <Button type="submit" variant="primary" size="lg" className="mt-4 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t.loading}...</span>
              </>
            ) : (
              <span>{t.auth_register_now}</span>
            )}
          </Button>
        </form>

        {/* Existing login pathways link */}
        <div className="flex items-center justify-center mt-6 text-xs text-slate-400 gap-1 select-none">
          <span>{t.auth_have_account}</span>
          <Link to="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
            {t.auth_login_now}
          </Link>
        </div>

        {/* Floating Bottom Language Selectors */}
        <div className="flex justify-center border-t border-white/5 pt-5 mt-6 gap-4 select-none">
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
export default Register;
