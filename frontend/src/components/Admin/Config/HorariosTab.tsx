
import React, { useState, useEffect } from 'react';
import { 
  Clock, Moon, Sun, ToggleLeft, ToggleRight, 
  Copy, CalendarDays, Zap, Timer, X, 
  ChevronUp, ChevronDown, Check
} from 'lucide-react';
import type { HorarioDia } from '../../../types/config';
import { toast } from 'react-toastify';

interface HorariosTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  labelClasses: string;
}

// --- Componente: Seletor de Tempo em Roda (Wheel Picker) ---
const TimeWheelPicker = ({ 
  value, 
  onSave, 
  onClose, 
  label 
}: { 
  value: string; 
  onSave: (val: string) => void; 
  onClose: () => void; 
  label: string 
}) => {
  const [h, m] = value.split(':').map(Number);
  const [hours, setHours] = useState(h);
  const [minutes, setMinutes] = useState(m);

  const handleConfirm = () => {
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onSave(formatted);
    onClose();
  };

  const adjust = (type: 'h' | 'm', delta: number) => {
    if (type === 'h') setHours(prev => (prev + delta + 24) % 24);
    else setMinutes(prev => (prev + delta + 60) % 60);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[300px] rounded-[3.5rem] p-10 shadow-2xl animate-zoom-in border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">{label}</h4>
        
        <div className="flex items-center justify-center gap-6 mb-10">
          {/* Coluna Horas */}
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => adjust('h', 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all"><ChevronUp size={20} /></button>
            <div className="text-5xl font-black text-slate-800 dark:text-slate-100 select-none tabular-nums tracking-tighter">{hours.toString().padStart(2, '0')}</div>
            <button onClick={() => adjust('h', -1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all"><ChevronDown size={20} /></button>
          </div>
          
          <div className="text-3xl font-black text-slate-300 animate-pulse">:</div>

          {/* Coluna Minutos */}
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => adjust('m', 5)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all"><ChevronUp size={20} /></button>
            <div className="text-5xl font-black text-slate-800 dark:text-slate-100 select-none tabular-nums tracking-tighter">{minutes.toString().padStart(2, '0')}</div>
            <button onClick={() => adjust('m', -5)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all"><ChevronDown size={20} /></button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleConfirm} 
            className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={3} /> Salvar Horário
          </button>
          <button onClick={onClose} className="w-full py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Voltar</button>
        </div>
      </div>
    </div>
  );
};

export default function HorariosTab({ data, onChange, labelClasses }: HorariosTabProps) {
  const [activePicker, setActivePicker] = useState<{ idx: number; type: 'inicio' | 'fim' } | null>(null);

  const horarios: HorarioDia[] = data.horariosFuncionamento || Array.from({ length: 7 }, (_, i) => ({
    dia: i, aberto: true, inicio: '08:00', fim: '22:00'
  }));

  const updateDia = (index: number, changes: Partial<HorarioDia>) => {
    const newHorarios = [...horarios];
    newHorarios[index] = { ...newHorarios[index], ...changes };
    onChange('horariosFuncionamento', newHorarios);
  };

  const calculateDuration = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 1440; 
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  const handleReplicateAll = (baseIndex: number) => {
    const base = horarios[baseIndex];
    const newHorarios = horarios.map(h => ({ ...h, inicio: base.inicio, fim: base.fim }));
    onChange('horariosFuncionamento', newHorarios);
    toast.success("Todos os dias sincronizados com sucesso!");
  };

  const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const hoje = new Date().getDay();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner de Info */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Clock size={140} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-500/20">
                <CalendarDays size={24} />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tight">Expediente</h4>
            </div>
            <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
              Gerencie os horários de operação automática. O sistema monitora essas janelas para liberar ou bloquear pedidos no cardápio.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-[2rem] border border-white/10">
            <div className="text-center px-4">
              <span className="block text-[10px] font-black uppercase text-slate-500">Hoje é</span>
              <span className="text-sm font-black text-orange-400 uppercase">{DIAS_SEMANA[hoje]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-1 gap-4">
        {horarios.map((h, idx) => {
          const isHoje = hoje === idx;
          const duration = calculateDuration(h.inicio, h.fim);
          
          return (
            <div 
              key={idx} 
              className={`group flex flex-col lg:flex-row items-center gap-6 p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
                h.aberto 
                ? isHoje 
                  ? 'bg-white dark:bg-slate-900 border-orange-500 shadow-2xl shadow-orange-500/10' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-orange-200' 
                : 'bg-slate-50/50 dark:bg-slate-950/40 border-transparent grayscale opacity-60'
              }`}
            >
              {/* Dia e Toggle */}
              <div className="flex items-center gap-4 w-full lg:w-48 shrink-0">
                <button 
                  type="button" 
                  onClick={() => updateDia(idx, { aberto: !h.aberto })} 
                  className={`transition-all duration-500 hover:scale-110 ${h.aberto ? 'text-orange-500' : 'text-slate-300'}`}
                >
                  {h.aberto ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                </button>
                <div className="flex flex-col">
                  <span className={`text-sm font-black uppercase tracking-tight ${h.aberto ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                    {DIAS_SEMANA[idx].split('-')[0]}
                  </span>
                  {isHoje && h.aberto && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Atual</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seletor Visual e Timeline */}
              {h.aberto ? (
                <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-6">
                  {/* Cápsulas de Tempo */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                    <button 
                      type="button"
                      onClick={() => setActivePicker({ idx, type: 'inicio' })}
                      className="flex items-center gap-3 px-5 py-3 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-500 transition-all group/time"
                    >
                      <Sun size={14} className="text-amber-500 group-hover/time:rotate-12 transition-transform" />
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{h.inicio}</span>
                    </button>
                    <div className="w-4 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <button 
                      type="button"
                      onClick={() => setActivePicker({ idx, type: 'fim' })}
                      className="flex items-center gap-3 px-5 py-3 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-500 transition-all group/time"
                    >
                      <Moon size={14} className="text-indigo-400 group-hover/time:-rotate-12 transition-transform" />
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{h.fim}</span>
                    </button>
                  </div>

                  {/* Visual 24h Timeline */}
                  <div className="flex-1 w-full flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">00h</span>
                      <div className="flex items-center gap-1.5 px-3 py-0.5 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                        <Timer size={10} className="text-orange-500" />
                        <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase">{duration} total</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">24h</span>
                    </div>
                    <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      {(() => {
                        const [sH, sM] = h.inicio.split(':').map(Number);
                        const [eH, eM] = h.fim.split(':').map(Number);
                        const startMin = sH * 60 + sM;
                        const endMin = eH * 60 + eM;
                        
                        const startPct = (startMin / 1440) * 100;
                        const endPct = (endMin / 1440) * 100;
                        
                        if (endMin > startMin) {
                          // Caso normal
                          return (
                            <div 
                              className="absolute inset-y-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                            />
                          );
                        } else {
                          // Caso vira o dia
                          return (
                            <>
                              <div className="absolute inset-y-0 bg-orange-500/50" style={{ left: `${startPct}%`, right: 0 }} />
                              <div className="absolute inset-y-0 bg-orange-500/50" style={{ left: 0, width: `${endPct}%` }} />
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center h-16 bg-slate-100/30 dark:bg-slate-800/20 rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Folga Semanal</span>
                </div>
              )}

              {/* Botão de Replicação */}
              <div className="shrink-0">
                {h.aberto && (
                  <button 
                    type="button" 
                    onClick={() => handleReplicateAll(idx)} 
                    className="p-3 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-2xl transition-all flex items-center gap-2 group/copy"
                    title="Copiar para todos os dias"
                  >
                    <Copy size={18} className="group-hover/copy:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest lg:hidden xl:block">Clonar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-orange-50 dark:bg-orange-900/10 rounded-[3rem] border border-orange-100 dark:border-orange-800/30 flex items-center gap-6 shadow-sm">
        <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
          <Zap size={28} fill="currentColor" />
        </div>
        <div>
          <h5 className="text-sm font-black text-orange-900 dark:text-orange-400 uppercase tracking-tight">Sincronização Inteligente</h5>
          <p className="text-xs font-bold text-orange-800/60 dark:text-orange-500/60 mt-1">
            Ao replicar um horário, todos os dias marcados como "Abertos" serão atualizados com os mesmos horários de início e fim instantaneamente.
          </p>
        </div>
      </div>

      {/* Modal do Picker */}
      {activePicker && (
        <TimeWheelPicker 
          label={`Horário de ${activePicker.type === 'inicio' ? 'Abertura' : 'Fechamento'}`}
          value={horarios[activePicker.idx][activePicker.type]}
          onClose={() => setActivePicker(null)}
          onSave={(val) => updateDia(activePicker.idx, { [activePicker.type]: val })}
        />
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { 
          from { opacity: 0; transform: scale(0.95) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
