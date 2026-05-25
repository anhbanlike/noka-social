import React, { useState, useRef } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Camera, RefreshCw } from 'lucide-react';
import { Avatar } from '../../ui';
import { useAuthStore } from '../../../store/useAuthStore';
import { databaseService } from '../../../lib/supabase';
import { toast } from 'sonner';

export const AvatarUpload: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file || !user) return;

    // Check size under 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh đại diện phải nhỏ hơn 2MB!');
      return;
    }

    setUploading(true);
    toast.info('Đang tải ảnh đại diện lên...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const avatarUrl = await databaseService.uploadFile('avatars', filePath, file);
      
      // Update global user profile
      await updateUserProfile({ avatar_url: avatarUrl });

      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      toast.error(`Cập nhật ảnh thất bại: ${err.message || 'Lỗi bất định'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center select-none" id="avatar-uploader-root">
      
      {/* Circle Avatar Wrapper with absolute hover mask */}
      <div
        onClick={triggerSelect}
        className="relative cursor-pointer group rounded-full overflow-hidden w-24 h-24 border-2 border-blue-500/20 hover:border-blue-500 transition-all duration-300 shadow-xl shadow-blue-500/5 select-none"
      >
        <Avatar src={user?.avatar_url || null} name={user?.full_name || 'Noka'} size="xl" className="border-0 w-full h-full" />
        
        {/* Hover Camera icon overlay */}
        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
          {uploading ? (
            <RefreshCw size={18} className="text-white animate-spin" />
          ) : (
            <>
              <Camera size={18} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-200 mt-0.5 font-display uppercase tracking-widest leading-none">
                {t.acc_avatar_hover}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hidden File input tag */}
      <input
        id="avatar-file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div className="flex flex-col gap-0.5">
        <h4 className="font-bold text-slate-100 tracking-wide font-display text-base">
          {user?.full_name}
        </h4>
        <span className="text-xs text-slate-450">
          @{user?.username || 'user'}
        </span>
      </div>

    </div>
  );
};
export default AvatarUpload;
