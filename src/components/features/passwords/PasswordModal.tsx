import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Button, Input, Modal } from '../../ui';
import { Platform, Password } from '../../../types';
import { Plus, Trash2, Key, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { decryptPassword } from '../../../lib/crypto';
import { useAuthStore } from '../../../store/useAuthStore';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  onSubmit: (payload: {
    platform_id: string | null;
    account_name: string;
    notes: string | null;
    levels: Array<{ label: string; plainValue: string; alreadyEncrypted?: boolean }>;
  }) => Promise<void>;
  editData?: Password | null;
}

interface FormLevelRow {
  label: string;
  plainValue: string;
  showPass: boolean;
  alreadyEncrypted?: boolean; // track if we are editing and they didn't touch this field
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  platforms,
  onSubmit,
  editData,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [platformId, setPlatformId] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [levels, setLevels] = useState<FormLevelRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize or Prefill form fields
  useEffect(() => {
    if (isOpen) {
      if (editData && user) {
        setPlatformId(editData.platform_id || '');
        setAccountName(editData.account_name);
        setNotes(editData.notes || '');
        
        // Decrypt password levels to prefill the edit form cleanly
        const decryptedLevels = editData.password_levels.map((lvl) => {
          const decrypted = decryptPassword(lvl.value, user.id);
          return {
            label: lvl.label,
            plainValue: decrypted,
            showPass: false,
            alreadyEncrypted: false, // will re-encrypt on save
          };
        });
        setLevels(decryptedLevels);
      } else {
        // Mode create: start with a standard single "Cấp 1" level
        setPlatformId('');
        setAccountName('');
        setNotes('');
        setLevels([
          {
            label: 'Cấp 1',
            plainValue: '',
            showPass: false,
          },
        ]);
      }
    }
  }, [isOpen, editData, user]);

  const addLevel = () => {
    if (levels.length >= 10) {
      toast.warning('Noka Social hỗ trợ tối đa 10 cấp độ bảo mật!');
      return;
    }
    const nextNum = levels.length + 1;
    setLevels([
      ...levels,
      {
        label: `Cấp ${nextNum}`,
        plainValue: '',
        showPass: false,
      },
    ]);
  };

  const removeLevel = (index: number) => {
    if (levels.length === 1) {
      toast.error('Nội dung bảo mật tối thiểu phải có 1 cấp độ mật khẩu!');
      return;
    }
    setLevels(levels.filter((_, i) => i !== index));
  };

  const updateLevelField = (index: number, field: keyof FormLevelRow, value: any) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    setLevels(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountName.trim()) {
      toast.error('Vui lòng điền tên tài khoản!');
      return;
    }

    // Verify all level values are filled
    const emptyLevels = levels.filter((lvl) => !lvl.plainValue.trim());
    if (emptyLevels.length > 0) {
      toast.error('Mật khẩu ở các cấp độ không được để trống!');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        platform_id: platformId || null,
        account_name: accountName,
        notes: notes || null,
        levels: levels.map((l) => ({
          label: l.label,
          plainValue: l.plainValue,
          alreadyEncrypted: l.alreadyEncrypted,
        })),
      });

      toast.success(editData ? 'Mật khẩu đã được mã hóa và cập nhật!' : 'Đã thêm mật khẩu an toàn thành công!');
      onClose();
    } catch (err: any) {
      toast.error(`Có lỗi xảy ra: ${err.message || 'Lưu thất bại'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? t.pass_edit_modal_title : t.pass_add_modal_title}
      id="password-upsert-modal"
      size="md"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-5" id="password-upsert-form">
        
        {/* Platform Selection */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plat-select-field" className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider">
            {t.pass_select_platform}
          </label>
          <select
            id="plat-select-field"
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            className="w-full bg-slate-950/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-950 text-slate-300">
              -- Chọn nền tảng sở hữu (Nếu có) --
            </option>
            {platforms.map((plat) => (
              <option key={plat.id} value={plat.id} className="bg-slate-950 text-white">
                {plat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Name */}
        <Input
          id="account-name-field"
          label={t.pass_account_name_label}
          placeholder={t.pass_account_name_placeholder}
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
        />

        {/* Multi-level passwords listing */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider">
              {t.pass_levels_title}
            </span>
            <span className="text-[10px] text-blue-400/80 font-bold tracking-widest uppercase">
              {levels.length} / 10 LEVELS
            </span>
          </div>

          <div className="flex flex-col gap-4 max-h-[28vh] overflow-y-auto pr-1">
            {levels.map((lvl, index) => (
              <div
                key={index}
                className="p-3.5 bg-white/3 border border-white/5 rounded-xl flex flex-col gap-3 relative"
              >
                <div className="flex items-center gap-3">
                  {/* Custom Label input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={lvl.label}
                      onChange={(e) => updateLevelField(index, 'label', e.target.value)}
                      placeholder={t.pass_level_label}
                      className="w-full bg-transparent text-sm font-bold text-slate-200 outline-none border-b border-transparent hover:border-white/10 focus:border-blue-500/50 pb-0.5 tracking-wide"
                      title="Sửa tên cấp độ"
                    />
                  </div>

                  {/* Delete Level (if index > 0) */}
                  {levels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLevel(index)}
                      className="p-1 rounded bg-white/5 hover:bg-red-500/10 text-slate-450 hover:text-red-400 transition-colors cursor-pointer"
                      title="Xóa cấp"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Password field with absolute masked eye toggler */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500">
                    <Key size={14} />
                  </span>
                  <input
                    type={lvl.showPass ? 'text' : 'password'}
                    value={lvl.plainValue}
                    onChange={(e) => updateLevelField(index, 'plainValue', e.target.value)}
                    placeholder={t.pass_level_value_placeholder}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => updateLevelField(index, 'showPass', !lvl.showPass)}
                    className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={lvl.showPass ? 'Hide password' : 'Show password'}
                  >
                    {lvl.showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Level Trigger */}
          <button
            type="button"
            onClick={addLevel}
            disabled={levels.length >= 10}
            className="w-full mt-1.5 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/3 font-semibold text-xs text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus size={14} />
            <span>{t.pass_add_level_btn}</span>
          </button>
        </div>

        {/* Optional Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes-field" className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider">
            {t.pass_notes_label}
          </label>
          <textarea
            id="notes-field"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.pass_notes_placeholder}
            rows={2}
            className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all duration-300"
          />
        </div>

        {/* Modal actions footer */}
        <div className="flex justify-end gap-3 border-t border-white/10 pt-5 mt-2">
          <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
            {t.cancel}
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? t.loading : t.save}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
export default PasswordModal;
