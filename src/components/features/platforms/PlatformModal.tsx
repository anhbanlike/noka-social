import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { Button, Input, Modal } from '../../ui';
import { Plus, Trash2, Globe, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (items: Array<{ name: string; logo_url: string | null; tempFile?: File | null }>) => Promise<void>;
  editData?: { id: string; name: string; logo_url: string | null } | null;
}

interface PlatformFormRow {
  localId: string;
  name: string;
  logoType: 'url' | 'upload';
  logoUrl: string;
  tempFile: File | null;
  filePreview: string;
}

export const PlatformModal: React.FC<PlatformModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
}) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PlatformFormRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset or prefill form depending on edit mode vs batch create
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setRows([
          {
            localId: editData.id,
            name: editData.name,
            logoType: editData.logo_url?.startsWith('data:') || editData.logo_url?.includes('localhost') ? 'upload' : 'url',
            logoUrl: editData.logo_url || '',
            tempFile: null,
            filePreview: editData.logo_url || '',
          },
        ]);
      } else {
        // Start with one blank row for additions
        setRows([
          {
            localId: `row-${Date.now()}-0`,
            name: '',
            logoType: 'url',
            logoUrl: '',
            tempFile: null,
            filePreview: '',
          },
        ]);
      }
    }
  }, [isOpen, editData]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        localId: `row-${Date.now()}-${rows.length}`,
        name: '',
        logoType: 'url',
        logoUrl: '',
        tempFile: null,
        filePreview: '',
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1 && !editData) {
      toast.warning('Cần có ít nhất một nền tảng!');
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRowField = (index: number, field: keyof PlatformFormRow, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  // Safe client-side file reader simulator
  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    
    // Quick size validation (under 2MB recommended)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...rows];
      updated[index] = {
        ...updated[index],
        tempFile: file,
        filePreview: reader.result as string,
      };
      setRows(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const invalidRows = rows.filter((r) => !r.name.trim());
    if (invalidRows.length > 0) {
      toast.error('Tên nền tảng không thể bỏ trống!');
      return;
    }

    setLoading(true);
    const payload = rows.map((r) => ({
      name: r.name,
      logo_url: r.logoType === 'url' ? (r.logoUrl || null) : (r.filePreview || null),
      tempFile: r.tempFile,
    }));

    try {
      await onSubmit(payload);
      toast.success(editData ? 'Đã cập nhật nền tảng thành công!' : 'Đã thêm nền tảng cực kỳ bảo mật!');
      onClose();
    } catch (err: any) {
      toast.error(`Có lỗi xảy ra: ${err.message || 'Thao tác thất bại'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? t.plat_edit_modal_title : t.plat_add_modal_title}
      id="platform-upsert-modal"
      size={rows.length > 1 ? 'lg' : 'md'}
    >
      <form onSubmit={handleSave} className="flex flex-col gap-6" id="platform-upsert-form">
        
        {/* Helper batch insertion tip */}
        {!editData && (
          <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 -mt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-100 font-display">
                {t.plat_add_multiple}
              </span>
              <span className="text-[11px] text-slate-450 font-medium font-sans">
                Tạo nhanh các ngăn bảo bảo mật cho Facebook, TikTok, WhatsApp...
              </span>
            </div>
          </div>
        )}

        {/* Rows wrapper list */}
        <div className="flex flex-col gap-5 max-h-[50vh] overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div
              key={row.localId}
              className="relative p-5 bg-white/3 border border-white/6 rounded-xl flex flex-col md:flex-row gap-5 items-stretch md:items-start"
              id={`platform-modal-row-${index}`}
            >
              {/* Image Preview Thumb */}
              <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-950/40 border border-white/8 flex items-center justify-center overflow-hidden mx-auto md:mx-0">
                {(row.logoType === 'url' && row.logoUrl) || (row.logoType === 'upload' && row.filePreview) ? (
                  <img
                    src={row.logoType === 'url' ? row.logoUrl : row.filePreview}
                    alt="Preview Brand"
                    className="w-full h-full object-contain p-1.5"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/120/active-state.png';
                    }}
                  />
                ) : (
                  <ImageIcon size={20} className="text-slate-500" />
                )}
              </div>

              {/* Input details column */}
              <div className="flex-1 flex flex-col gap-4">
                <Input
                  id={`plat-name-input-${index}`}
                  label={t.plat_name_label}
                  placeholder={t.plat_name_placeholder}
                  value={row.name}
                  onChange={(e) => updateRowField(index, 'name', e.target.value)}
                  required
                />

                {/* Logo Type Tabs Selectors */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold text-slate-450 font-display uppercase tracking-wider">
                    {t.plat_logo_preview}
                  </span>
                  
                  {/* Small tabs buttons bar */}
                  <div className="flex gap-1.5 p-1 bg-slate-950/40 border border-white/5 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() => updateRowField(index, 'logoType', 'url')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        row.logoType === 'url' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe size={12} />
                      <span>{t.plat_logo_tab_url}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRowField(index, 'logoType', 'upload')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        row.logoType === 'upload' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload size={12} />
                      <span>{t.plat_logo_tab_upload}</span>
                    </button>
                  </div>

                  {/* Render Tab Inputs */}
                  {row.logoType === 'url' ? (
                    <Input
                      id={`plat-logo-url-${index}`}
                      placeholder={t.plat_logo_url_placeholder}
                      value={row.logoUrl}
                      onChange={(e) => updateRowField(index, 'logoUrl', e.target.value)}
                    />
                  ) : (
                    <div className="relative border border-dashed border-white/10 hover:border-white/20 transition-colors rounded-xl p-3 bg-slate-950/20 flex flex-col items-center justify-center gap-1.5">
                      <input
                        id={`plat-file-field-${index}`}
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(index, e.target.files ? e.target.files[0] : null)}
                      />
                      <Upload size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-300">
                        {row.tempFile ? row.tempFile.name : t.plat_select_file}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row delete action button (only in batch mode) */}
              {!editData && rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="p-1.5 md:mt-2.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-all cursor-pointer self-center md:self-start shrink-0"
                  aria-label="Remove platform row"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Modal actions panel footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-2">
          {!editData ? (
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              <Plus size={14} />
              <span>{t.plat_add_item_btn}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              {t.cancel}
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? t.loading : (editData ? t.save : t.plat_save_all)}
            </Button>
          </div>
        </div>

      </form>
    </Modal>
  );
};
export default PlatformModal;
