import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { usePlatforms } from '../hooks/usePlatforms';
import { usePasswords } from '../hooks/usePasswords';
import { Button, Input } from '../components/ui';
import { PageLayout } from '../components/layout/PageLayout';
import { PasswordRow } from '../components/features/passwords/PasswordRow';
import { PasswordModal } from '../components/features/passwords/PasswordModal';
import { PasswordDetailModal } from '../components/features/passwords/PasswordDetailModal';
import { ExportPasswordsModal } from '../components/features/passwords/ExportPasswordsModal';
import { Password } from '../types';
import { Search, Plus, SlidersHorizontal, Key, Download } from 'lucide-react';
import { toast } from 'sonner';

export const Passwords: React.FC = () => {
  const { t } = useTranslation();
  
  // Load hooks pipelines
  const { platforms } = usePlatforms();
  const { passwords, loading, addPassword, updatePassword, removePassword } = usePasswords();

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatformId, setSelectedPlatformId] = useState('');

  // Dialog triggers
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);

  // Filter lists interactively
  const filteredPasswords = passwords.filter((pw) => {
    const matchesSearch =
      pw.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pw.notes && pw.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = selectedPlatformId === '' || pw.platform_id === selectedPlatformId;
    
    return matchesSearch && matchesPlatform;
  });

  const handleCreateClick = () => {
    setEditingPassword(null);
    setUpsertOpen(true);
  };

  const handleEditClick = (pw: Password) => {
    setEditingPassword(pw);
    setUpsertOpen(true);
  };

  const handleViewClick = (pw: Password) => {
    setSelectedPassword(pw);
    setDetailOpen(true);
  };

  const handleUpsertSubmit = async (payload: {
    platform_id: string | null;
    account_name: string;
    notes: string | null;
    levels: Array<{ label: string; plainValue: string; alreadyEncrypted?: boolean }>;
  }) => {
    if (editingPassword) {
      await updatePassword(editingPassword.id, {
        platform_id: payload.platform_id,
        account_name: payload.account_name,
        notes: payload.notes,
        levels: payload.levels,
      });
    } else {
      await addPassword(payload);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa mật mã này? Hành động này không thể hoàn tác và dữ liệu sẽ mất vĩnh viễn.')) {
      try {
        await removePassword(id);
        toast.success('Đã xóa mật mã thành công!');
      } catch (err) {
        toast.error('Có lỗi xảy ra khi xóa mật mã.');
      }
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6" id="passwords-page-workspace">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-wide">
              {t.menu_passwords}
            </h1>
            <p className="text-xs text-slate-450 font-medium font-sans">
              Quản lý toàn bộ thông tin đăng nhập và lưu khóa đa phân lớp độc quyền.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10"
              id="export-passwords-btn"
            >
              <Download size={14} className="text-slate-300" />
              <span>Xuất mật khẩu</span>
            </Button>
            <Button variant="primary" onClick={handleCreateClick} className="flex items-center gap-1.5 cursor-pointer">
              <Plus size={14} />
              <span>{t.dash_action_add_password}</span>
            </Button>
          </div>
        </div>

        {/* Dynamic filters selectors */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 glass-panel p-4 rounded-2xl relative select-none">
          {/* Text Input Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3.5 text-slate-550">
              <Search size={16} />
            </span>
            <input
              id="password-search-field"
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/45 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Platform filter dropdown */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <SlidersHorizontal size={14} className="text-slate-500 shrink-0" />
            
            <select
              id="platform-filter-select-field"
              value={selectedPlatformId}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="w-full bg-slate-950/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-950 text-slate-400">-- {t.all_platforms} --</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-950 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Passwords Lists list */}
        {loading ? (
          <div className="flex flex-col gap-4" id="passwords-skeletons-stack">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-18 rounded-2xl bg-white/3 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center select-none" id="passwords-empty-state">
            <div className="p-4 rounded-full bg-white/3 border border-white/5">
              <Key size={28} className="text-slate-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-450 font-medium">
                {t.no_data}
              </span>
              <span className="text-[10px] text-slate-500">
                Hãy bắt đầu tạo chuỗi khóa an toàn cho các nền tảng xã hội của bạn ngay.
              </span>
            </div>
            <Button variant="primary" onClick={handleCreateClick} className="mt-2">
              {t.dash_action_add_password}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5" id="passwords-list">
            {filteredPasswords.map((pw) => (
              <PasswordRow
                key={pw.id}
                password={pw}
                platforms={platforms}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Multi-level Action Dialog Modal Component */}
        <PasswordModal
          isOpen={upsertOpen}
          onClose={() => {
            setUpsertOpen(false);
            setEditingPassword(null);
          }}
          platforms={platforms}
          onSubmit={handleUpsertSubmit}
          editData={editingPassword}
        />

        {/* Expanded detailed Decrypt & OS copy drawer */}
        <PasswordDetailModal
          isOpen={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedPassword(null);
          }}
          password={selectedPassword}
          platforms={platforms}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />

        {/* Encrypted credentials backup serialization and download */}
        <ExportPasswordsModal
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          passwords={passwords}
          platforms={platforms}
        />

      </div>
    </PageLayout>
  );
};
export default Passwords;
