import React, { useMemo, useState } from 'react';
import {
  Clock,
  Moon,
  Sun,
  Copy,
  ChevronUp,
  ChevronDown,
  Check,
  Power,
} from 'lucide-react';
import type { HorarioDia, PeriodoMenuConfig, PeriodosDoDia } from '../../../types/config';
import {
  DIAS_SEMANA,
  DIAS_SEMANA_CURTO,
  DEFAULT_PERIODOS_CARDAPIO,
  normalizeHorariosList,
  syncLegacyWindow,
  formatDuration,
} from '../../../utils/horariosCardapio';
import { toast } from 'react-toastify';

interface HorariosTabProps {
  data: {
    horariosFuncionamento?: HorarioDia[];
    periodosCardapio?: typeof DEFAULT_PERIODOS_CARDAPIO;
  };
  onChange: (field: string, value: unknown) => void;
  labelClasses: string;
}

type PeriodoKey = 'dia' | 'noite';

const TimeWheelPicker = ({
  value,
  onSave,
  onClose,
  label,
}: {
  value: string;
  onSave: (val: string) => void;
  onClose: () => void;
  label: string;
}) => {
  const [h, m] = value.split(':').map(Number);
  const [hours, setHours] = useState(h || 0);
  const [minutes, setMinutes] = useState(m || 0);

  const handleConfirm = () => {
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    onSave(formatted);
    onClose();
  };

  const adjust = (type: 'h' | 'm', delta: number) => {
    if (type === 'h') setHours((prev) => (prev + delta + 24) % 24);
    else setMinutes((prev) => (prev + delta + 60) % 60);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-[300px] rounded-[2.5rem] p-8 shadow-2xl animate-zoom-in border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 text-center">
          {label}
        </h4>

        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => adjust('h', 1)}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all focus:ring-2 focus:ring-orange-500"
              aria-label="Aumentar hora"
            >
              <ChevronUp size={20} />
            </button>
            <div className="text-5xl font-black text-slate-800 dark:text-slate-100 select-none tabular-nums tracking-tighter">
              {hours.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => adjust('h', -1)}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all focus:ring-2 focus:ring-orange-500"
              aria-label="Diminuir hora"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          <div className="text-3xl font-black text-slate-300">:</div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => adjust('m', 5)}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all focus:ring-2 focus:ring-orange-500"
              aria-label="Aumentar minutos"
            >
              <ChevronUp size={20} />
            </button>
            <div className="text-5xl font-black text-slate-800 dark:text-slate-100 select-none tabular-nums tracking-tighter">
              {minutes.toString().padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => adjust('m', -5)}
              className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-all focus:ring-2 focus:ring-orange-500"
              aria-label="Diminuir minutos"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="cursor-pointer w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Check size={16} strokeWidth={3} /> Confirmar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

function PeriodoRow({
  titulo,
  subtitulo,
  icon: Icon,
  iconClass,
  periodo,
  disabled,
  onToggle,
  onPick,
}: {
  titulo: string;
  subtitulo: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  periodo: PeriodoMenuConfig;
  disabled: boolean;
  onToggle: () => void;
  onPick: (field: 'inicio' | 'fim') => void;
}) {
  const ativo = !disabled && periodo.ativo;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        ativo
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
          : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 opacity-70'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              ativo ? iconClass : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {titulo}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {subtitulo}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          aria-label={`${titulo} ${ativo ? 'ativo' : 'inativo'}`}
          disabled={disabled}
          onClick={onToggle}
          className={`cursor-pointer relative w-12 h-7 rounded-full transition-colors disabled:opacity-40 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            ativo ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              ativo ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {ativo ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPick('inicio')}
            className="cursor-pointer flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black tabular-nums hover:border-orange-500 transition-all focus:ring-2 focus:ring-orange-500"
          >
            {periodo.inicio}
          </button>
          <span className="text-slate-300 text-xs font-bold">até</span>
          <button
            type="button"
            onClick={() => onPick('fim')}
            className="cursor-pointer flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black tabular-nums hover:border-orange-500 transition-all focus:ring-2 focus:ring-orange-500"
          >
            {periodo.fim}
          </button>
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-slate-400 w-14 text-right">
            {formatDuration(periodo.inicio, periodo.fim)}
          </span>
        </div>
      ) : (
        <p className="text-xs text-slate-400 font-medium">
          {disabled ? 'Dia fechado — nenhum cardápio aceita pedidos.' : 'Desligado neste dia.'}
        </p>
      )}
    </div>
  );
}

export default function HorariosTab({ data, onChange }: HorariosTabProps) {
  const defaults = data.periodosCardapio || DEFAULT_PERIODOS_CARDAPIO;
  const horarios = useMemo(
    () => normalizeHorariosList(data.horariosFuncionamento, defaults),
    [data.horariosFuncionamento, defaults]
  );

  const [picker, setPicker] = useState<{
    idx: number;
    menu: PeriodoKey;
    field: 'inicio' | 'fim';
  } | null>(null);

  const hoje = new Date().getDay();

  const commit = (next: HorarioDia[]) => {
    const synced = next.map(syncLegacyWindow);
    onChange('horariosFuncionamento', synced);

    // Mantém template global alinhado ao dia de hoje (ou segunda) para novos defaults
    const ref = synced.find((d) => d.aberto) || synced[1] || synced[0];
    if (ref?.periodos) {
      onChange('periodosCardapio', {
        dia: { inicio: ref.periodos.dia.inicio, fim: ref.periodos.dia.fim },
        noite: { inicio: ref.periodos.noite.inicio, fim: ref.periodos.noite.fim },
      });
    }
  };

  const updateDia = (index: number, changes: Partial<HorarioDia>) => {
    const next = [...horarios];
    next[index] = syncLegacyWindow({ ...next[index], ...changes });
    commit(next);
  };

  const updatePeriodo = (
    index: number,
    menu: PeriodoKey,
    changes: Partial<PeriodoMenuConfig>
  ) => {
    const day = horarios[index];
    const periodos: PeriodosDoDia = {
      dia: { ...day.periodos!.dia },
      noite: { ...day.periodos!.noite },
      [menu]: { ...day.periodos![menu], ...changes },
    };

    const algumAtivo = periodos.dia.ativo || periodos.noite.ativo;
    updateDia(index, {
      periodos,
      aberto: algumAtivo,
    });
  };

  const toggleDiaAberto = (index: number) => {
    const day = horarios[index];
    if (day.aberto) {
      updateDia(index, { aberto: false });
    } else {
      const periodos = day.periodos!;
      const nenhumAtivo = !periodos.dia.ativo && !periodos.noite.ativo;
      updateDia(index, {
        aberto: true,
        periodos: nenhumAtivo
          ? {
              dia: { ...periodos.dia, ativo: true },
              noite: { ...periodos.noite, ativo: true },
            }
          : periodos,
      });
    }
  };

  const handleReplicate = (baseIndex: number) => {
    const base = horarios[baseIndex];
    const next = horarios.map((h, i) =>
      i === baseIndex
        ? h
        : syncLegacyWindow({
            ...h,
            aberto: base.aberto,
            periodos: {
              dia: { ...base.periodos!.dia },
              noite: { ...base.periodos!.noite },
            },
          })
    );
    commit(next);
    toast.success(`Horários de ${DIAS_SEMANA_CURTO[baseIndex]} aplicados a todos os dias.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <div className="flex items-start gap-3">
            <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                Horários do cardápio
              </h4>
              <p className="text-slate-500 text-sm font-medium mt-1 max-w-xl leading-relaxed">
                Defina, para cada dia, quando o <strong>Almoço</strong> e o <strong>Jantar</strong>{' '}
                aceitam pedidos. Fora desses horários o cliente só visualiza o cardápio.
              </p>
            </div>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
              Hoje
            </span>
            <span className="text-sm font-black text-orange-500">{DIAS_SEMANA[hoje]}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
            <Sun size={12} /> Almoço = cardápio do dia
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300">
            <Moon size={12} /> Jantar = cardápio da noite
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {horarios.map((day, idx) => {
          const isHoje = hoje === idx;
          const periodos = day.periodos!;

          return (
            <section
              key={day.dia}
              className={`rounded-[1.75rem] border-2 p-4 sm:p-5 transition-all ${
                day.aberto
                  ? isHoje
                    ? 'bg-white dark:bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  : 'bg-slate-50/70 dark:bg-slate-950/50 border-transparent'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.aberto}
                    aria-label={`${DIAS_SEMANA[idx]} ${day.aberto ? 'aberto' : 'fechado'}`}
                    onClick={() => toggleDiaAberto(idx)}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all focus:ring-2 focus:ring-orange-500 ${
                      day.aberto
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900'
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    <Power size={14} />
                    {day.aberto ? 'Aberto' : 'Fechado'}
                  </button>
                  <div>
                    <h5 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      {DIAS_SEMANA[idx]}
                    </h5>
                    {isHoje && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">
                        Dia atual
                      </span>
                    )}
                  </div>
                </div>

                {day.aberto && (
                  <button
                    type="button"
                    onClick={() => handleReplicate(idx)}
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all focus:ring-2 focus:ring-orange-500"
                    title="Copiar este dia para toda a semana"
                  >
                    <Copy size={14} />
                    Aplicar a todos os dias
                  </button>
                )}
              </div>

              {day.aberto ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <PeriodoRow
                    titulo="Almoço"
                    subtitulo="Cardápio do dia"
                    icon={Sun}
                    iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                    periodo={periodos.dia}
                    disabled={false}
                    onToggle={() =>
                      updatePeriodo(idx, 'dia', { ativo: !periodos.dia.ativo })
                    }
                    onPick={(field) => setPicker({ idx, menu: 'dia', field })}
                  />
                  <PeriodoRow
                    titulo="Jantar"
                    subtitulo="Cardápio da noite"
                    icon={Moon}
                    iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
                    periodo={periodos.noite}
                    disabled={false}
                    onToggle={() =>
                      updatePeriodo(idx, 'noite', { ativo: !periodos.noite.ativo })
                    }
                    onPick={(field) => setPicker({ idx, menu: 'noite', field })}
                  />
                </div>
              ) : (
                <div className="py-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Fechado o dia todo
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-[1.75rem] border border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-200">Dica:</strong> use
          “Aplicar a todos os dias” depois de configurar um dia modelo (ex.: segunda). Depois
          ajuste só o domingo ou a sexta, se forem diferentes.
        </p>
      </div>

      {picker && (
        <TimeWheelPicker
          label={`${picker.menu === 'dia' ? 'Almoço' : 'Jantar'} — ${
            picker.field === 'inicio' ? 'Início' : 'Fim'
          } (${DIAS_SEMANA_CURTO[picker.idx]})`}
          value={horarios[picker.idx].periodos![picker.menu][picker.field]}
          onClose={() => setPicker(null)}
          onSave={(val) => updatePeriodo(picker.idx, picker.menu, { [picker.field]: val })}
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
      `}</style>
    </div>
  );
}
