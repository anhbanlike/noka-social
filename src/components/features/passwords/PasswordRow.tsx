import React from 'react';
import { Password, Platform } from '../../../types';
import { useTranslation } from '../../../lib/i18n';
import { Badge } from '../../ui';
import { Key, Eye, Edit2, Trash2, Calendar, ShieldCheck } from 'lucide-react';

interface PasswordRowProps {
  password: Password;
  platforms: Platform[];
  onView: (password: Password) => void;
  onEdit: (password: Password) => void;
  onDelete: (id: string) => void;
}

export const PasswordRow: React.FC<PasswordRowProps> = ({
  password,
  platforms,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const associatedPlatform = platforms.find((p) => p.id === password.platform_id);

  // Formatting date nicely
  const formattedDate = new Date(password.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id={`password-row-${password.id}`}
      className="group relative rounded-2xl p-4 bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6"
    >
      {/* Platform & Account Info Column */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        
        {/* Brand logo frame */}
        <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-950/40 border border-white/8 flex items-center justify-center overflow-hidden">
          {associatedPlatform && associatedPlatform.logo_url ? (
            <img
              src={associatedPlatform.logo_url}
              alt={associatedPlatform.name}
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/120/active-state.png';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10">
              <Key size={18} className="text-blue-400" />
            </div>
          )}
        </div>

        {/* Account ID / notes preview */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h5 className="font-bold text-slate-100 truncate text-sm tracking-wide">
              {password.account_name}
            </h5>
            {associatedPlatform ? (
              <Badge variant="cyan" className="shrink-0 text-[10px] px-2 py-0">
                {associatedPlatform.name}
              </Badge>
            ) : (
              <Badge variant="glass" className="shrink-0 text-[10px] px-2 py-0">
                Tài khoản lẻ
              </Badge>
            )}
          </div>
          
          <span className="text-xs text-slate-450 flex items-center gap-1">
            <Calendar size={11} />
            <span>Cập nhật ngày {formattedDate}</span>
          </span>
        </div>
      </div>

      {/* Levels counter metrics */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Badge variant={password.password_levels.length > 1 ? 'success' : 'primary'}>
          <ShieldCheck size={11} className="mr-0.5" />
          <span className="font-mono text-xs font-bold leading-none">{password.password_levels.length}</span> Cấp bảo mật
        </Badge>
      </div>

      {/* Actions menu area */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        
        {/* Secondary Details Trigger */}
        <button
          onClick={() => onView(password)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600/15 text-blue-400 border border-blue-500/20 hover:bg-blue-600/25 transition-all cursor-pointer"
        >
          <Eye size={13} />
          <span>{t.pass_view_detail}</span>
        </button>

        {/* Small inline editing controls */}
        <button
          onClick={() => onEdit(password)}
          className="p-2.5 bg-white/3 hover:bg-white/6 text-slate-450 hover:text-white border border-white/5 rounded-xl transition-all cursor-pointer"
          title={t.edit}
        >
          <Edit2 size={13} />
        </button>

        <button
          onClick={() => onDelete(password.id)}
          className="p-2.5 bg-white/3 hover:bg-red-500/15 text-slate-450 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-xl transition-all cursor-pointer"
          title={t.delete}
        >
          <Trash2 size={13} />
        </button>
      </div>

    </div>
  );
};
export default PasswordRow;
