import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useAuthStore } from '../store/useAuthStore';
import { Button, Input } from '../components/ui';
import { PageLayout } from '../components/layout/PageLayout';
import { AvatarUpload } from '../components/features/account/AvatarUpload';
import { User, ShieldAlert, KeyRound, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const Account: React.FC = () => {
  const { t } = useTranslation();
  const { user, sessionEmail, updateUserProfile, changeMasterPassword } = useAuthStore();

  // Profile forms details state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password forms security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Initialize input values from auth state
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setEmail(sessionEmail || '');
    }
  }, [user, sessionEmail]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Họ và tên không thể để trống!');
      return;
    }

    setUpdatingProfile(true);

    try {
      await updateUserProfile({
        full_name: fullName,
        phone: phone,
      });
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      toast.error(`Cập nhật thất bại: ${err.message || 'Lỗi bất định'}`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Nhập mật khẩu gốc hiện tại!');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Mật khẩu Master mới tối thiểu phải có 8 ký tự!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Xác nhận mật khẩu Master mới không khớp!');
      return;
    }

    setChangingPassword(true);

    try {
      const { success, error } = await changeMasterPassword(currentPassword, newPassword);
      if (success) {
        toast.success('Đã cập nhật mật khẩu Master cực kỳ thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(error || 'Đổi mật khẩu thất bại. Sai mật khẩu hiện tại.');
      }
    } catch (err: any) {
      toast.error('Không đổi được mật khẩu Master!');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-8" id="account-workspace-view">
        
        {/* Page title head */}
        <div className="flex flex-col gap-1 select-none">
          <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-wide">
            {t.menu_account}
          </h1>
          <p className="text-xs text-slate-450 font-medium font-sans">
            Quản lý thông tin tài khoản người dùng và thiết lập khóa bảo vệ master key gốc.
          </p>
        </div>

        {/* Master details split columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Avatar uploading box */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-center items-center py-10">
            <AvatarUpload />
            
            {/* Quick stats indicators */}
            <div className="mt-8 pt-6 border-t border-white/10 w-full flex flex-col gap-3 select-none">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">{t.acc_username}</span>
                <span className="font-mono font-bold text-slate-200">@{user?.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">Vai trò</span>
                <span className="font-bold text-blue-400 uppercase tracking-wider">Premium Member</span>
              </div>
            </div>
          </div>

          {/* Right Columns: Main inputs & Security adjust forms */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Details Update Form Box */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-350 flex items-center gap-2 pb-3.5 border-b border-white/10 mb-5 select-none">
                <User size={15} className="text-blue-400" />
                <span>{t.acc_col_profile}</span>
              </h3>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5" id="update-profile-details-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="profile-fullname-field"
                    label={t.auth_full_name}
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />

                  <Input
                    id="profile-phone-field"
                    label={t.auth_phone}
                    placeholder="0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <Input
                  id="profile-email-field"
                  label={t.auth_email}
                  placeholder="name@noka.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
                
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed select-none -mt-1 italic">
                  * Email của tài khoản dùng làm mã định danh liên kết và không thể sửa sau khi thiết lập hệ thống.
                </p>

                <div className="flex justify-end pt-2 border-t border-white/5 mt-2">
                  <Button type="submit" variant="primary" className="flex items-center gap-2" disabled={updatingProfile}>
                    <Save size={14} />
                    <span>{updatingProfile ? t.loading : t.save}</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Change Master Password Box */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-350 flex items-center gap-2 pb-3.5 border-b border-white/10 mb-5 select-none">
                <Lock size={15} className="text-red-400 animate-pulse" />
                <span>Cấu hình khoá bảo mật Master</span>
              </h3>

              <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-5" id="change-master-key-form">
                
                {/* Visual Alert Notice */}
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-start gap-3 select-none">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-red-400">CẢNH BÁO QUAN TRỌNG</span>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-sans">
                      Khi thay đổi mật khẩu Master, tất cả các dữ liệu mật mã lưu cũ sẽ lập tức được bảo mã mã hóa lại theo chữ ký khóa Master mới. Hãy ghi nhớ khóa Master này cực kỳ an toàn!
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="security-current-password"
                    label="Mật khẩu hiện tại"
                    placeholder="••••••••"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />

                  <Input
                    id="security-new-password"
                    label="Mật khẩu Master mới"
                    placeholder="Min 8 ký tự..."
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <Input
                    id="security-confirm-new-password"
                    label="Xác nhận mật khẩu mới"
                    placeholder="Min 8 ký tự..."
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-white/10 mt-2">
                  <Button type="submit" variant="primary" className="bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30 font-bold" disabled={changingPassword}>
                    <span>{changingPassword ? t.loading : 'Cập nhật khoá bảo mật Master'}</span>
                  </Button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </PageLayout>
  );
};
export default Account;
