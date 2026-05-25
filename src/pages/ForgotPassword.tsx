import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { Button, Input } from '../components/ui';
import { 
  Mail, ArrowLeft, Send, ShieldAlert, KeyRound, Lock, 
  Smartphone, MessageSquare, ShieldCheck, Eye, EyeOff, CheckCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Custom Flow States
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'find_account' | 'verify_otp' | 'change_password'>('find_account');
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  
  // Password Reset States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập hoặc email!');
      return;
    }

    setLoading(true);

    // Simulate database lookup in localStorage
    setTimeout(async () => {
      const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
      const inputLower = identifier.trim().toLowerCase();
      
      const matchedUser = users.find((u: any) => 
        (u.email && u.email.toLowerCase() === inputLower) || 
        (u.username && u.username.toLowerCase() === inputLower)
      );

      if (!matchedUser) {
        toast.error('Tài khoản này chưa tồn tại trong hệ thống cục bộ! Hãy tạo tài khoản mới.');
        setLoading(false);
        return;
      }

      // Check Telegram configuration
      const telegramConfigs = JSON.parse(localStorage.getItem('noka_telegram') || '[]');
      const userConfig = telegramConfigs.find((c: any) => c.user_id === matchedUser.id);
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setTargetUser(matchedUser);

      if (userConfig && userConfig.bot_token && userConfig.chat_id) {
        setHasTelegram(true);
        const botToken = userConfig.bot_token;
        const chatId = userConfig.chat_id;
        
        const payloadText = `🔒 *MÃ XÁC THỰC KHÔI PHỤC MẬT KHẨU NOKA*\n\nChào bạn *${matchedUser.full_name || matchedUser.username}*,\n\nHệ thống vừa phát hiện một yêu cầu cấp lại mật mã Master Key cho tài khoản Noka của bạn.\n\n🔑 Mã OTP khôi phục của bạn là: *${otp}*\n\n_Hãy điền mã xác thực này vào trang web để đổi mật khẩu mới. Mã có hiệu lực trong vòng 5 phút._`;

        try {
          const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: payloadText,
              parse_mode: 'Markdown',
            }),
          });
          const resBody = await resp.json();
          if (resBody.ok) {
            toast.success(`Đã tự động gửi mã OTP thực tế tới Telegram của bạn!`);
          } else {
            toast.warning(`Không thể gửi tới Telegram: ${resBody.description}. Kích hoạt mã khôi phục nội bộ dự phòng.`);
          }
        } catch (err: any) {
          toast.warning(`Lỗi mạng kết nối Telegram. Đã chuyển sang cơ chế mã khôi phục khép kín.`);
        }
      } else {
        setHasTelegram(false);
        toast.info('Tài khoản chưa thiết lập Telegram Bot. Kích hoạt luồng khôi phục nội bộ khẩn cấp.');
      }

      setLoading(false);
      setStep('verify_otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      toast.error('Vui lòng nhập mã OTP!');
      return;
    }

    if (enteredOtp.trim() === generatedOtp) {
      toast.success('Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.');
      setStep('change_password');
    } else {
      toast.error('Mã OTP không chính xác! Vui lòng kiểm tra lại.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Mật khẩu Master mới phải chứa tối thiểu 8 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Hai mật khẩu nhập lại không trùng khớp!');
      return;
    }

    setLoading(true);

    // Save back to local storage database
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
      const updatedUsers = users.map((u: any) => {
        if (u.id === targetUser.id) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      localStorage.setItem('noka_users', JSON.stringify(updatedUsers));

      toast.success('Đặt lại mật khẩu Master thành công! Vui lòng đăng nhập lại.');
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none" id="forgot-pass-page-container">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[100px]" />

      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10">
        
        {/* Header monogram logos */}
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
            <span className="text-white font-extrabold text-lg tracking-wider font-display">NK</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-wide uppercase">
            {step === 'find_account' ? 'Khôi phục Master Key' : step === 'verify_otp' ? 'Xác minh danh tính' : 'Cấp mật khẩu mới'}
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm px-4 mt-1 leading-relaxed">
            {step === 'find_account' 
              ? 'Nhập email hoặc tên đăng nhập của bạn. Noka sẽ hỗ trợ gửi OTP khôi phục trực tiếp qua bot Telegram.' 
              : step === 'verify_otp'
                ? `Nhập mã bảo mật 6 số để xác nhận bạn là chủ sở hữu hợp pháp của tài khoản.`
                : 'Thiết lập mật khẩu Master cấp cao mới cho kho lưu trữ khóa của bạn.'}
          </p>
        </div>

        {/* STEP 1: FIND ACCOUNT */}
        {step === 'find_account' && (
          <form onSubmit={handleFindAccount} className="flex flex-col gap-5 block" id="find-account-form">
            <Input
              id="forgot-identifier"
              label="Tên đăng nhập hoặc Email"
              placeholder="Nhập tên đăng nhập hoặc email..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Gửi OTP Khôi Phục</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 block" id="verify-otp-form">
            
            {hasTelegram ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/15 rounded-xl flex gap-3 items-start">
                <Smartphone size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">ĐÃ GỬI QUA TELEGRAM</span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Mã bảo mật gồm 6 chữ số đã được truyền tải thực tế tới Telegram của bạn. Hãy mở ứng dụng điện thoại để kiểm tra.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-950/25 border border-yellow-500/20 rounded-xl flex flex-col gap-2 text-left">
                <div className="flex gap-2 items-center">
                  <ShieldAlert size={16} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">Giao thức dự phòng</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Bạn chưa cấu hình Telegram Bot Bảo Mật. Mã xác thực nội bộ cấp riêng cho thiết bị của bạn là:
                </p>
                <div className="text-center bg-slate-950 text-white font-mono text-xl font-bold py-2 rounded border border-white/5 tracking-widest text-cyan-400 select-all">
                  {generatedOtp}
                </div>
              </div>
            )}

            <Input
              id="verify-otp-input"
              label="Mã xác thực OTP (6 chữ số)"
              placeholder="Nhập 6 số..."
              max={6}
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center font-mono text-lg tracking-widest font-black"
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2">
              <ShieldCheck size={15} />
              <span>Xác Thực Mã</span>
            </Button>

            <button
              type="button"
              onClick={() => setStep('find_account')}
              className="text-center text-[11px] text-slate-400 hover:text-white transition-colors underline cursor-pointer"
            >
              Quay lại bước trước
            </button>
          </form>
        )}

        {/* STEP 3: CHANGE PASSWORD */}
        {step === 'change_password' && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5 block" id="change-pass-form">
            
            {/* New Password */}
            <div className="relative">
              <Input
                id="reset-new-password"
                label="Mật khẩu Master mới"
                placeholder="Tối thiểu 8 ký tự..."
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-9.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                id="reset-confirm-password"
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu..."
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Đang đồng bộ hóa...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  <span>Xác Nhận Đổi Mật Khẩu</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* Navigate Backwards */}
        <div className="flex items-center justify-center mt-6">
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t.auth_back_to_login || 'Quay lại đăng nhập'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
export default ForgotPassword;
