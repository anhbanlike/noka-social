import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Password, Platform } from '../../../types';
import { Button, Modal, Badge } from '../../ui';
import { Key, Eye, EyeOff, Copy, Edit3, Trash2, Calendar, FileText, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { decryptPassword } from '../../../lib/crypto';
import { useAuthStore } from '../../../store/useAuthStore';

interface PasswordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: Password | null;
  platforms: Platform[];
  onEdit: (pw: Password) => void;
  onDelete: (id: string) => void;
}

export const PasswordDetailModal: React.FC<PasswordDetailModalProps> = ({
  isOpen,
  onClose,
  password,
  platforms,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  
  // Track open eye toggle indexes
  const [revealedLevels, setRevealedLevels] = useState<Record<number, boolean>>({});
  // Track copy active states to give quick visual check checks
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Storage for clipboard wipe timers
  const clipboardTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear states when index/password changes
  useEffect(() => {
    setRevealedLevels({});
    setCopiedIndex(null);
    return () => {
      if (clipboardTimerRef.current) {
        clearTimeout(clipboardTimerRef.current);
      }
    };
  }, [password, isOpen]);

  if (!password || !user) return null;

  const associatedPlatform = platforms.find((p) => p.id === password.platform_id);
  
  const toggleReveal = (index: number) => {
    setRevealedLevels((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopy = async (index: number, cipherText: string) => {
    const decrypted = decryptPassword(cipherText, user.id);
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(decrypted);

        // Visual success state
        setCopiedIndex(index);
        toast.success('Mật khẩu đã sao chép! Sẽ tự động xóa clipboard sau 30 giây bảo mật.');

        // Wipe visual feedback after 2s
        setTimeout(() => setCopiedIndex(null), 2000);

        // Cancel existing timer if any
        if (clipboardTimerRef.current) {
          clearTimeout(clipboardTimerRef.current);
        }

        // AUTO WIPE CLIPBOARD AFTER 30 SECONDS
        clipboardTimerRef.current = setTimeout(async () => {
          try {
            await navigator.clipboard.writeText('');
            toast.warning('Clipboard đã được làm sạch tự động để bảo vệ quyền riêng tư!');
          } catch (err) {
            console.warn('Failed to auto-wipe clipboard', err);
          }
        }, 30000);
      } else {
        toast.error('Trình duyệt không hỗ trợ sao chép tự động!');
      }
    } catch (e) {
      toast.error('Lỗi sao chép cơ sở dữ liệu!');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.pass_detail_modal_title}
      id="password-detail-modal"
      size="md"
    >
      <div className="flex flex-col gap-6" id="password-detail-canvas">
        
        {/* Platform Identity card header */}
        <div className="p-5 bg-white/4 border border-white/6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 py-1 px-3 bg-blue-600/10 border-l border-b border-white/10 text-[10px] font-bold tracking-widest text-blue-400 rounded-bl-xl uppercase font-display flex items-center gap-1">
            <Lock size={10} /> Local Crypt
          </div>

          <div className="w-14 h-14 rounded-xl bg-slate-950/40 border border-white/10 p-2 flex items-center justify-center">
            {associatedPlatform && associatedPlatform.logo_url ? (
              <img
                src={associatedPlatform.logo_url}
                alt={associatedPlatform.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 flex items-center justify-center rounded-lg border border-blue-500/10">
                <Key size={20} className="text-blue-400" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-white tracking-wide font-display">
              {password.account_name}
            </span>
            <span className="text-xs text-slate-400">
              {associatedPlatform ? `${t.menu_platforms}: ${associatedPlatform.name}` : 'Tài khoản lẻ'}
            </span>
          </div>
        </div>

        {/* Security level list */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider pb-1 border-b border-white/5">
            Các tầng mật mã bảo vệ
          </span>

          <div className="flex flex-col gap-3">
            {password.password_levels.map((lvl, idx) => {
              const isRevealed = revealedLevels[idx] || false;
              const decryptedVal = isRevealed ? decryptPassword(lvl.value, user.id) : '••••••••••••••••';
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/30 border border-white/5 rounded-xl flex items-center justify-between gap-4 group/item hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-xs font-bold font-display text-blue-400 uppercase tracking-widest text-[9px] leading-tight">
                      {lvl.label || `CẤP ${idx + 1}`}
                    </span>
                    <span className="font-mono text-xs text-white truncate tracking-wide bg-slate-950/20 py-1 rounded inline-block">
                      {decryptedVal}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleReveal(idx)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isRevealed ? 'Che mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    
                    <button
                      onClick={() => handleCopy(idx, lvl.value)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Sao chép"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* File markdown notes section */}
        {password.notes && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider pb-1 border-b border-white/5">
              {t.pass_notes_label}
            </span>
            <div className="p-4 bg-slate-950/20 border border-white/5 rounded-xl text-xs text-slate-350 leading-relaxed font-sans whitespace-pre-wrap flex items-start gap-2">
              <FileText size={14} className="text-slate-500 shrink-0 mt-0.5" />
              <span>{password.notes}</span>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-2">
          {/* Action to delete right away */}
          <button
            onClick={() => {
              onDelete(password.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Xóa mục này</span>
          </button>

          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onEdit(password);
                onClose();
              }}
              className="flex items-center gap-2"
            >
              <Edit3 size={14} />
              <span>Chỉnh sửa</span>
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
export default PasswordDetailModal;
