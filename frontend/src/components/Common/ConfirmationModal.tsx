
import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-rose-500 hover:bg-rose-600 shadow-rose-100 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white',
    info: 'bg-blue-500 hover:bg-blue-600 shadow-blue-100 text-white'
  };

  const iconColors = {
    danger: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transition-colors duration-300">
        <div className="p-8 text-center">
          {/* Icon Section */}
          <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 ${iconColors[variant]}`}>
            <AlertTriangle size={40} />
          </div>

          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] disabled:opacity-50 ${colors[variant]}`}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30"
            >
              {cancelText}
            </button>
          </div>
        </div>

        {/* Close Button Top Right */}
        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-300 dark:text-slate-700 hover:text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
