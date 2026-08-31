
import React from 'react';
import { Truck } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface TaxasTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  inputClasses: string;
  labelClasses: string;
}

export default function TaxasTab({ data, onChange, inputClasses, labelClasses }: TaxasTabProps) {
  return (
    <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4 mb-4">
        <Truck className="text-blue-500 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Configuração de Entrega</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Defina o valor fixo cobrado para entregas em sua região.</p>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Taxa de Entrega (R$)</label>
        <IMaskInput 
          mask={Number} 
          scale={2} 
          radix="," 
          thousandsSeparator="." 
          padFractionalZeros={true} 
          className={inputClasses} 
          value={data.taxaEntrega} 
          onAccept={(v) => onChange('taxaEntrega', v)} 
          placeholder="0,00"
        />
      </div>
    </div>
  );
}
