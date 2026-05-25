import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/20 active:scale-98 focus:ring-blue-500',
    secondary: 'bg-white/5 hover:bg-white/10 text-slate-100 border border-white/10 hover:border-white/20 active:scale-98 focus:ring-slate-500',
    danger: 'bg-red-600/25 hover:bg-red-600/40 text-red-200 border border-red-500/30 font-medium active:scale-98 focus:ring-red-500',
    ghost: 'hover:bg-white/5 text-slate-400 hover:text-slate-200 focus:ring-slate-500',
    glass: 'glass-panel text-slate-200 hover:bg-white/10 hover:border-white/20 active:scale-98 focus:ring-blue-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================================
// INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string; // Ensure id is present
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-slate-400 font-display uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
            error ? 'border-red-500/50 focus:ring-red-500/30' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-400 font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// MODAL COMPONENT (Fade + Scale Framer Motion)
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  id: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  id,
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full ${sizes[size]} bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden text-slate-100 flex flex-col gap-6 max-h-[90vh]`}
          >
            {/* Top decor glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold font-display text-white tracking-wide">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// TOGGLE SWITCH (Animated Switch)
// ==========================================
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id: string; // Ensure id is present
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, id }) => {
  return (
    <label htmlFor={id} className="inline-flex items-center justify-between w-full cursor-pointer select-none py-1">
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <motion.div
          animate={{
            backgroundColor: checked ? 'var(--color-primary-blue)' : 'rgba(255, 255, 255, 0.1)',
          }}
          className="w-11 h-6 bg-white/10 rounded-full transition-colors duration-200"
        />
        <motion.div
          animate={{
            x: checked ? 20 : 2,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </div>
    </label>
  );
};

// ==========================================
// BADGE COMPONENT
// ==========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'cyan' | 'success' | 'danger' | 'warning' | 'glass';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const styles = {
    primary: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    glass: 'bg-white/5 text-slate-300 border border-white/5',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==========================================
// AVATAR COMPONENT
// ==========================================
interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const fallbackLetter = name ? name.trim().charAt(0).toUpperCase() : 'N';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-white/10 bg-slate-800 text-slate-100 font-bold font-display ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If image fails, clear src to show letter fallback
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{fallbackLetter}</span>
      )}
    </div>
  );
};

// ==========================================
// SKELETON LOADER BAR
// ==========================================
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white/5 border border-white/5 rounded-xl ${className}`} />
  );
};
