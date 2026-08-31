import React from 'react';
import { Wallet, Banknote, AlertCircle } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface FinanceiroTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  inputClasses: string;
  labelClasses: string;
}

export default function FinanceiroTab({ data, onChange, inputClasses, labelClasses }: FinanceiroTabProps) {
  
  // Função auxiliar para definir a máscara baseada no tipo selecionado
  const getMask = () => {
    switch (data.tipoChavePix) {
      case 'cpf': return '000.000.000-00';
      case 'cnpj': return '00.000.000/0000-00';
      case 'telefone': return '(00) 00000-0000';
      default: return null; // 'email' e 'aleatoria' não têm máscara fixa
    }
  };

  const activeMask = getMask();

  return (
    <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header do Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
        <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/20">
            <Wallet size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pagamentos & PIX</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Configure sua chave PIX para que o sistema possa enviá-la automaticamente 
            ao cliente via WhatsApp quando este método for selecionado.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Seleção do Tipo de Chave */}
        <div>
            <label className={labelClasses}>Tipo de Chave PIX</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { id: 'cpf', label: 'CPF' },
                    { id: 'cnpj', label: 'CNPJ' },
                    { id: 'telefone', label: 'Celular' },
                    { id: 'email', label: 'E-mail' },
                    { id: 'aleatoria', label: 'Aleatória' }
                ].map((tipo) => (
                    <button
                        key={tipo.id}
                        type="button"
                        onClick={() => {
                            // Limpa o valor ao trocar de tipo para evitar conflitos de máscara
                            if (data.tipoChavePix !== tipo.id) {
                                onChange('chavePix', '');
                            }
                            onChange('tipoChavePix', tipo.id);
                        }}
                        className={`py-3 px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            data.tipoChavePix === tipo.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-200'
                        }`}
                    >
                        {tipo.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Input da Chave com Máscara Condicional */}
        <div>
          <label className={labelClasses}>Chave PIX</label>
          <div className="relative">
            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            
            {activeMask ? (
                // Renderiza Input com Máscara (CPF, CNPJ, Celular)
                <IMaskInput
                    key={data.tipoChavePix} // Força a recriação do componente ao mudar o tipo
                    mask={activeMask}
                    className={`${inputClasses} pl-12 font-mono text-slate-600 dark:text-slate-300`}
                    value={data.chavePix || ''}
                    onAccept={(value: string) => onChange('chavePix', value)}
                    placeholder={
                        data.tipoChavePix === 'telefone' ? '(00) 90000-0000' :
                        data.tipoChavePix === 'cpf' ? '000.000.000-00' :
                        '00.000.000/0000-00'
                    }
                />
            ) : (
                // Renderiza Input Normal (Email, Aleatória)
                <input 
                    className={`${inputClasses} pl-12 font-mono text-slate-600 dark:text-slate-300`}
                    value={data.chavePix || ''} 
                    onChange={e => onChange('chavePix', e.target.value)} 
                    placeholder={
                        data.tipoChavePix === 'email' ? 'exemplo@pix.com' :
                        'Cole sua chave aleatória aqui...'
                    } 
                />
            )}
          </div>

          {/* Validação Visual Simples */}
          {(!data.chavePix || data.chavePix.length < 5) && (
              <div className="flex items-center gap-2 mt-3 text-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Chave não configurada ou incompleta.</span>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}