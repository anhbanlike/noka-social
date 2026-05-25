import React from 'react';
import { Platform } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Badge } from '../../ui';
import { Edit2, Trash2, Shield } from 'lucide-react';

interface PlatformCardProps {
  platform: Platform;
  onEdit: (platform: Platform) => void;
  onDelete: (id: string) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div
      id={`platform-card-${platform.id}`}
      className="group relative rounded-2xl p-5 bg-white/4 border border-white/8 backdrop-blur-md transition-all duration-300 hover:bg-white/8 hover:border-white/12 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col items-center gap-4 text-center select-none"
    >
      {/* Top action floating buttons (appear on hover/desktop-friendly) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onEdit(platform)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-600/35 border border-white/10 hover:border-blue-500/30 text-slate-350 hover:text-blue-400 transition-all cursor-pointer"
          title={t.edit}
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(platform.id)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600/35 border border-white/10 hover:border-red-500/30 text-slate-350 hover:text-red-400 transition-all cursor-pointer"
          title={t.delete}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Brand logo image or elegant monogram fallback */}
      <div className="w-16 h-16 rounded-2xl bg-slate-950/40 border border-white/10 p-2.5 flex items-center justify-center relative shadow-inner overflow-hidden">
        {platform.logo_url ? (
          <img
            src={platform.logo_url}
            alt={platform.name}
            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.2)]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/120/active-state.png';
            }}
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10">
            <Shield size={24} className="text-blue-400" />
          </div>
        )}
      </div>

      {/* Branding information */}
      <div className="flex flex-col gap-1">
        <h4 className="font-bold font-display text-slate-100 group-hover:text-white transition-colors text-sm tracking-wide leading-tight">
          {platform.name}
        </h4>
        <div className="mt-1 flex justify-center">
          <Badge variant={platform.password_count && platform.password_count > 0 ? 'cyan' : 'glass'}>
            <span className="font-mono text-xs font-bold mr-0.5">{platform.password_count || 0}</span> {t.plat_password_badge}
          </Badge>
        </div>
      </div>
    </div>
  );
};
export default PlatformCard;
