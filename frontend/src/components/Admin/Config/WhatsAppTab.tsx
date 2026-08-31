
import React from 'react';
import { MessageSquare, QrCode, Loader2 } from 'lucide-react';

interface WhatsAppTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onConnect: () => void;
  isConnecting: boolean;
  inputClasses: string;
  labelClasses: string;
}

export default function WhatsAppTab({ data, onChange, onConnect, isConnecting, inputClasses, labelClasses }: WhatsAppTabProps) {
  return (
    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-3xl border border-green-100 dark:border-green-900/30 flex items-start gap-4">
        <MessageSquare className="text-green-500 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">WhatsApp Evolution API</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conecte seu WhatsApp para enviar notificações automáticas de pedidos aos clientes em tempo real.
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className={labelClasses}>Nome da Instância</label>
          <input 
            className={inputClasses} 
            value={data.evolutionInstanceName || ''} 
            onChange={e => onChange('evolutionInstanceName', e.target.value)} 
            placeholder="Ex: gs_sabores_01" 
          />
          <p className="text-[9px] text-slate-400 mt-2 ml-1 uppercase font-bold tracking-tight">
            * Use apenas letras, números e underscores.
          </p>
        </div>
        
        <button 
          type="button"
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full sm:w-auto bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 shadow-xl shadow-green-100 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
          Conectar WhatsApp
        </button>
      </div>
    </div>
  );
}
