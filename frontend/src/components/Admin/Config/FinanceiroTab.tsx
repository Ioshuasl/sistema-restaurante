import React from 'react';
import { Wallet, Banknote, AlertCircle, Sun, Moon, type LucideIcon } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface FinanceiroTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  inputClasses: string;
  labelClasses: string;
}

const TIPOS_CHAVE = [
  { id: 'cpf', label: 'CPF' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'telefone', label: 'Celular' },
  { id: 'email', label: 'E-mail' },
  { id: 'aleatoria', label: 'Aleatória' },
];

interface PixCardProps {
  titulo: string;
  subtitulo: string;
  icon: LucideIcon;
  iconClass: string;
  tipo: string;
  chave: string;
  onChangeTipo: (tipo: string) => void;
  onChangeChave: (chave: string) => void;
  inputClasses: string;
  labelClasses: string;
}

function PixCard({
  titulo, subtitulo, icon: Icon, iconClass, tipo, chave,
  onChangeTipo, onChangeChave, inputClasses, labelClasses,
}: PixCardProps) {
  // Máscara baseada no tipo selecionado ('email' e 'aleatoria' não têm máscara fixa)
  const activeMask =
    tipo === 'cpf' ? '000.000.000-00' :
    tipo === 'cnpj' ? '00.000.000/0000-00' :
    tipo === 'telefone' ? '(00) 00000-0000' :
    null;

  return (
    <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5">
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
        <label className={labelClasses}>Tipo de Chave PIX</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIPOS_CHAVE.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                // Limpa o valor ao trocar de tipo para evitar conflitos de máscara
                if (tipo !== t.id) onChangeChave('');
                onChangeTipo(t.id);
              }}
              className={`py-3 px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                tipo === t.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                  : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Chave PIX</label>
        <div className="relative">
          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

          {activeMask ? (
            <IMaskInput
              key={tipo} // Força a recriação do componente ao mudar o tipo
              mask={activeMask}
              className={`${inputClasses} pl-12 font-mono text-slate-600 dark:text-slate-300`}
              value={chave || ''}
              onAccept={(value: string) => onChangeChave(value)}
              placeholder={
                tipo === 'telefone' ? '(00) 90000-0000' :
                tipo === 'cpf' ? '000.000.000-00' :
                '00.000.000/0000-00'
              }
            />
          ) : (
            <input
              className={`${inputClasses} pl-12 font-mono text-slate-600 dark:text-slate-300`}
              value={chave || ''}
              onChange={(e) => onChangeChave(e.target.value)}
              placeholder={tipo === 'email' ? 'exemplo@pix.com' : 'Cole sua chave aleatória aqui...'}
            />
          )}
        </div>

        {(!chave || chave.length < 5) && (
          <div className="flex items-center gap-2 mt-3 text-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Chave não configurada — será usada a do outro cardápio.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FinanceiroTab({ data, onChange, inputClasses, labelClasses }: FinanceiroTabProps) {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
        <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/20">
          <Wallet size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pagamentos & PIX</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Configure uma chave PIX para cada cardápio. O sistema envia ao cliente via WhatsApp a chave
            do cardápio ativo no momento do pedido; se ela estiver vazia, usa a do outro cardápio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PixCard
          titulo="Cardápio do dia"
          subtitulo="Pedidos no horário do almoço"
          icon={Sun}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          tipo={data.tipoChavePixDia}
          chave={data.chavePixDia}
          onChangeTipo={(v) => onChange('tipoChavePixDia', v)}
          onChangeChave={(v) => onChange('chavePixDia', v)}
          inputClasses={inputClasses}
          labelClasses={labelClasses}
        />
        <PixCard
          titulo="Cardápio da noite"
          subtitulo="Pedidos no horário do jantar"
          icon={Moon}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
          tipo={data.tipoChavePixNoite}
          chave={data.chavePixNoite}
          onChangeTipo={(v) => onChange('tipoChavePixNoite', v)}
          onChangeChave={(v) => onChange('chavePixNoite', v)}
          inputClasses={inputClasses}
          labelClasses={labelClasses}
        />
      </div>
    </div>
  );
}
