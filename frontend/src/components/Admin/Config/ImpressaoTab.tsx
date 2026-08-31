
import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Loader2, CheckCircle2, ChevronRight, Search, X } from 'lucide-react';

interface ImpressaoTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onFetchPrinters: () => void;
  isSearching: boolean;
  availablePrinters: string[];
  inputClasses: string;
  labelClasses: string;
}

export default function ImpressaoTab({ 
  data, 
  onChange, 
  onFetchPrinters, 
  isSearching, 
  availablePrinters, 
  inputClasses, 
  labelClasses 
}: ImpressaoTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca as impressoras automaticamente ao abrir o modal
  useEffect(() => {
    if (isModalOpen) {
      onFetchPrinters();
    }
  }, [isModalOpen]);

  const handleSelectPrinter = (name: string) => {
    onChange('nomeImpressora', name);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-start gap-4">
        <Printer className="text-orange-500 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors">Impressão Local</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Configure o agente instalado para emitir cupons térmicos automaticamente.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className={labelClasses}>URL do Agente Local</label>
          <input 
            className={inputClasses} 
            value={data.urlAgenteImpressao || ''} 
            onChange={e => onChange('urlAgenteImpressao', e.target.value)} 
            placeholder="http://localhost:5000" 
          />
        </div>

        <div className="space-y-3">
          <label className={labelClasses}>Dispositivo de Saída</label>
          
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] hover:border-orange-500/50 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`p-3 rounded-xl transition-colors ${data.nomeImpressora ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Printer size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">
                  {data.nomeImpressora || "Nenhuma impressora selecionada"}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {data.nomeImpressora ? "Dispositivo Ativo" : "Clique para selecionar"}
                </p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-orange-500 transition-all" size={20} />
          </button>
        </div>
      </div>

      {/* Modal de Seleção de Impressoras */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-zoom-in border border-slate-100 dark:border-slate-800 transition-colors">
            
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Selecionar Saída</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispositivos Detectados</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
              {isSearching && availablePrinters.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buscando impressoras...</p>
                </div>
              ) : availablePrinters.length > 0 ? (
                availablePrinters.map((printer) => {
                  const isSelected = data.nomeImpressora === printer;
                  return (
                    <button
                      key={printer}
                      onClick={() => handleSelectPrinter(printer)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        isSelected 
                        ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-600' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Printer size={18} className={isSelected ? 'text-orange-500' : 'text-slate-300'} />
                        <span className="text-sm font-bold truncate pr-4">{printer}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Lista Vazia</h4>
                  <p className="text-xs text-slate-400 max-w-[200px] mt-1">
                    Certifique-se que o agente está rodando e clique em buscar.
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <button 
                type="button"
                onClick={onFetchPrinters}
                disabled={isSearching}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Atualizar Lista
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoom-in { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}
