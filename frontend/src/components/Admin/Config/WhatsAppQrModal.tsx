
import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface WhatsAppQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeBase64: string | null;
}

export default function WhatsAppQrModal({ isOpen, onClose, qrCodeBase64 }: WhatsAppQrModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 sm:p-10 text-center shadow-2xl animate-slide-up transition-colors duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Conectar WhatsApp</h3>
        <p className="text-[10px] text-slate-400 mb-8 uppercase font-black tracking-widest">Abra o WhatsApp - Aparelhos Conectados</p>
        
        <div className="aspect-square bg-white p-4 rounded-[2rem] mb-8 shadow-inner flex items-center justify-center border-2 border-slate-100 dark:border-slate-800">
          {qrCodeBase64 ? (
            <img src={qrCodeBase64} alt="WhatsApp QR Code" className="w-full h-full" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-orange-500" size={40} />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gerando QR Code...</p>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-black dark:hover:bg-slate-600 transition-all active:scale-95"
        >
          Concluir / Fechar
        </button>
      </div>
    </div>
  );
}
