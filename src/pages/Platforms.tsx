import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { usePlatforms } from '../hooks/usePlatforms';
import { Button, Input } from '../components/ui';
import { PageLayout } from '../components/layout/PageLayout';
import { PlatformCard } from '../components/features/platforms/PlatformCard';
import { PlatformModal } from '../components/features/platforms/PlatformModal';
import { Platform } from '../types';
import { Search, Plus, FolderHeart, Info } from 'lucide-react';
import { toast } from 'sonner';

export const Platforms: React.FC = () => {
  const { t } = useTranslation();
  const { platforms, loading, addPlatforms, updatePlatform, removePlatform } = usePlatforms();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

  // Filter lists based on search
  const filteredPlatforms = platforms.filter((plat) =>
    plat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (plat: Platform) => {
    setEditingPlatform(plat);
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingPlatform(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (
    items: Array<{ name: string; logo_url: string | null; tempFile?: File | null }>
  ) => {
    if (editingPlatform) {
      // Single edit mode action
      const data = items[0];
      await updatePlatform(editingPlatform.id, data.name, data.logo_url, data.tempFile);
    } else {
      // Dynamic multiple batch create mode
      await addPlatforms(items);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nền tảng này? Tất cả các mật khẩu tương ứng sẽ mất liên kết.')) {
      try {
        await removePlatform(id);
        toast.success('Xóa nền tảng thành công!');
      } catch (err: any) {
        toast.error('Lỗi khi xóa nền tảng.');
      }
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6" id="platforms-page-root">
        
        {/* Page Head Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-wide">
              {t.menu_platforms}
            </h1>
            <p className="text-xs text-slate-450 font-medium font-sans">
              Kiểm soát các ngăn thư mục liên kết (Ví dụ: Facebook, Gmail, TikTok...).
            </p>
          </div>

          <Button variant="primary" onClick={handleCreateClick} className="flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} />
            <span>{t.dash_action_add_platform}</span>
          </Button>
        </div>

        {/* Search bar & filter layouts row */}
        <div className="flex items-center gap-4 glass-panel p-4 rounded-xl relative select-none">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3.5 text-slate-550">
              <Search size={16} />
            </span>
            <input
              id="platform-search-field"
              type="text"
              placeholder="Tìm nhanh nền tảng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/45 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Platform Grid Catalogs */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" id="plat-skeletons-grid">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-44 rounded-2xl bg-white/3 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredPlatforms.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center select-none" id="plat-empty-state">
            <div className="p-4 rounded-full bg-white/3 border border-white/5">
              <FolderHeart size={28} className="text-slate-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-450 font-medium">
                {t.no_data}
              </span>
              <span className="text-[10px] text-slate-500">
                Hãy bắt đầu tạo nền tảng đầu tiên để chia nhóm mật khẩu khoa học hơn.
              </span>
            </div>
            <Button variant="primary" onClick={handleCreateClick} className="mt-2">
              {t.dash_action_add_platform}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" id="platforms-grid">
            {filteredPlatforms.map((plat) => (
              <PlatformCard
                key={plat.id}
                platform={plat}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Modal Dialog control rendering */}
        <PlatformModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingPlatform(null);
          }}
          onSubmit={handleModalSubmit}
          editData={editingPlatform}
        />

      </div>
    </PageLayout>
  );
};
export default Platforms;
