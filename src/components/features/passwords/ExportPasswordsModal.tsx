import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Modal, Button, Input } from '../../ui';
import { Password, Platform } from '../../../types';
import { Download, ShieldCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ExportPasswordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwords: Password[];
  platforms: Platform[];
}

export const ExportPasswordsModal: React.FC<ExportPasswordsModalProps> = ({
  isOpen,
  onClose,
  passwords,
  platforms,
}) => {
  const [exportKey, setExportKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [successMode, setSuccessMode] = useState(false);

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exportKey) {
      toast.error('Vui lòng nhập mã khóa mã hóa xuất tệp!');
      return;
    }

    if (exportKey.length < 6) {
      toast.error('Mã khóa bảo mật xuất tệp tối thiểu phải dài 6 ký tự!');
      return;
    }

    if (exportKey !== confirmKey) {
      toast.error('Xác nhận mã khóa bảo mật không khớp!');
      return;
    }

    try {
      // Build export data
      const exportPayload = {
        app: 'Noka Social Vault',
        exported_at: new Date().toISOString(),
        total_items: passwords.length,
        // Include platforms lookup list for full recovery later
        platforms: platforms.map(p => ({
          id: p.id,
          name: p.name,
          logo_url: p.logo_url
        })),
        passwords: passwords.map(pw => ({
          id: pw.id,
          platform_id: pw.platform_id,
          account_name: pw.account_name,
          password_levels: pw.password_levels,
          notes: pw.notes,
          created_at: pw.created_at,
          updated_at: pw.updated_at
        }))
      };

      // Convert payload to string
      const payloadString = JSON.stringify(exportPayload, null, 2);

      // Encrypt the entire payload with CryptoJS.AES and user-specified exportKey
      const encryptedString = CryptoJS.AES.encrypt(payloadString, exportKey).toString();

      // Wrap inside a secure JSON wrapper so it is readable and structured
      const secureFileContent = {
        info: 'NOKA SOCIAL SAFE VAULT ENCRYPTED EXPORT FILE',
        algorithm: 'AES-256-CBC',
        exported_at: exportPayload.exported_at,
        checksum: CryptoJS.SHA256(encryptedString).toString().slice(0, 16),
        enc_payload: encryptedString,
      };

      // Trigger standard browser download
      const jsonContent = JSON.stringify(secureFileContent, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `noka_credentials_secure_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Xuất bản sao dữ liệu mật khẩu cực kỳ thành công!');
      setSuccessMode(true);
    } catch (err: any) {
      toast.error(`Có lỗi xảy ra khi mã hóa và xuất tệp: ${err.message || 'Lỗi bất định'}`);
    }
  };

  const handleResetAndClose = () => {
    setExportKey('');
    setConfirmKey('');
    setSuccessMode(false);
    onClose();
  };

  return (
    <Modal
      id="export-passwords-modal-view"
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Xuất bản sao mật khẩu bảo mật"
      size="md"
    >
      {!successMode ? (
        <form onSubmit={handleExport} className="flex flex-col gap-5 select-none text-slate-200">
          <div className="bg-blue-500/5 col-span-1 border border-blue-500/10 p-4 rounded-xl flex items-start gap-3">
            <KeyRound size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-blue-300">Mã hóa AES-256 tự động</span>
              <span className="text-[10px] text-slate-400 leading-relaxed font-sans mt-0.5">
                Tất cả mật mã đa tầng của bạn sẽ được đóng gói và mã hóa đầu-cuối. Hãy thiết lập một mật khẩu bảo mật tùy ý để bảo vệ tệp JSON này trước khi tải xuống.
              </span>
            </div>
          </div>

          <div className="bg-yellow-500/5 col-span-1 border border-yellow-500/10 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-yellow-400">Lưu ý cực kỳ quan trọng</span>
              <span className="text-[10px] text-slate-400 leading-relaxed font-sans mt-0.5">
                Bạn <strong>PHẢI</strong> ghi nhớ mật khẩu bảo mật xuất này. Nếu không có nó, không ai (kể cả Noka) có thể giải mã tệp tin dự phòng này để phục hồi lại dữ liệu.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="export-security-key-input"
              label="Mã khóa xuất tệp"
              placeholder="Nhập khóa mã hóa..."
              type="password"
              value={exportKey}
              onChange={(e) => setExportKey(e.target.value)}
              required
            />
            <Input
              id="export-security-confirm-key-input"
              label="Xác nhận mã khóa"
              placeholder="Xác nhận lại khóa..."
              type="password"
              value={confirmKey}
              onChange={(e) => setConfirmKey(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
            <div className="text-[10px] text-slate-500">
              Tổng số bản ghi sẽ xuất: <span className="font-bold text-slate-300">{passwords.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={handleResetAndClose}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" className="flex items-center gap-1.5 font-bold">
                <Download size={14} />
                <span>Xuất tệp Encrypted JSON</span>
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 gap-4 text-center select-none" id="export-success-state">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckIcon />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-sm font-bold text-slate-100">Dữ liệu đã được xuất hoàn hảo!</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
              Điện toán mã hóa AES-256 hoàn tất. Bản sao lưu khóa nén dạng JSON đã được tải về máy của bạn. Hãy bảo lưu khóa mật mã xuất thật cẩn mật.
            </p>
          </div>
          <Button variant="secondary" onClick={handleResetAndClose} className="mt-2 px-6">
            Đóng bảng
          </Button>
        </div>
      )}
    </Modal>
  );
};

// Simple standalone CheckIcon helper to avoid any non-standard icons
const CheckIcon: React.FC = () => (
  <svg
    className="w-8 h-8 text-emerald-400 animate-pulse"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
