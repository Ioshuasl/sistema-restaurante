
import React from 'react';
import { Truck, Sun, Moon, type LucideIcon } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface TaxasTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  inputClasses: string;
  labelClasses: string;
}

interface TaxaCardProps {
  id: string;
  titulo: string;
  subtitulo: string;
  icon: LucideIcon;
  iconClass: string;
  value: string;
  onAccept: (value: string) => void;
  inputClasses: string;
  labelClasses: string;
}

function TaxaCard({ id, titulo, subtitulo, icon: Icon, iconClass, value, onAccept, inputClasses, labelClasses }: TaxaCardProps) {
  return (
    <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">{titulo}</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitulo}</p>
        </div>
      </div>
      <div>
        <label htmlFor={id} className={labelClasses}>Taxa de entrega (R$)</label>
        <IMaskInput
          id={id}
          mask={Number}
          scale={2}
          radix=","
          thousandsSeparator="."
          padFractionalZeros={true}
          normalizeZeros={true}
          min={0}
          className={inputClasses}
          value={value}
          onAccept={(v: string) => onAccept(v)}
          placeholder="0,00"
          inputMode="decimal"
        />
      </div>
    </div>
  );
}

export default function TaxasTab({ data, onChange, inputClasses, labelClasses }: TaxasTabProps) {
  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
        <Truck className="text-blue-500 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Configuração de Entrega</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Defina a taxa cobrada em cada cardápio. O pedido usa a taxa do cardápio ativo no momento da compra;
            retiradas no local não pagam taxa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TaxaCard
          id="taxaEntregaDia"
          titulo="Cardápio do dia"
          subtitulo="Pedidos no horário do almoço"
          icon={Sun}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          value={data.taxaEntregaDia}
          onAccept={(v) => onChange('taxaEntregaDia', v)}
          inputClasses={inputClasses}
          labelClasses={labelClasses}
        />
        <TaxaCard
          id="taxaEntregaNoite"
          titulo="Cardápio da noite"
          subtitulo="Pedidos no horário do jantar"
          icon={Moon}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
          value={data.taxaEntregaNoite}
          onAccept={(v) => onChange('taxaEntregaNoite', v)}
          inputClasses={inputClasses}
          labelClasses={labelClasses}
        />
      </div>
    </div>
  );
}
