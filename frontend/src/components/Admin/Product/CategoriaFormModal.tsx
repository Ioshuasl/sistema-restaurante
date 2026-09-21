import React, { useEffect, useState } from 'react';
import { X, Save, Loader2, Tags } from 'lucide-react';
import {
  createCategoriaProduto,
  updateCategoriaProduto,
} from '../../../services/categoriaProdutoService';
import { type CategoriaProduto, type TipoMenu } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface CategoriaFormModalProps {
  category: CategoriaProduto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TIPO_MENU_OPTIONS: { value: TipoMenu; label: string; description: string }[] = [
  {
    value: 'dia',
    label: 'Almoço',
    description: 'Aparece no cardápio do dia (marmitas).',
  },
  {
    value: 'noite',
    label: 'Jantar',
    description: 'Aparece no cardápio da noite (espetinhos).',
  },
  {
    value: 'ambos',
    label: 'Ambos',
    description: 'Aparece no almoço e no jantar.',
  },
];

const CategoriaFormModal: React.FC<CategoriaFormModalProps> = ({
  category,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!category;
  const [nome, setNome] = useState(category?.nomeCategoriaProduto || '');
  const [tipoMenu, setTipoMenu] = useState<TipoMenu>(category?.tipoMenu || 'dia');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNome(category?.nomeCategoriaProduto || '');
    setTipoMenu(category?.tipoMenu || 'dia');
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.warning('Informe o nome da categoria.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && category) {
        await updateCategoriaProduto(category.id, {
          nomeCategoriaProduto: nome.trim(),
          tipoMenu,
        });
        toast.success('Categoria atualizada!');
      } else {
        await createCategoriaProduto({
          nomeCategoriaProduto: nome.trim(),
          tipoMenu,
        });
        toast.success('Categoria criada!');
      }
      onSuccess();
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar categoria.' : 'Erro ao criar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all';
  const labelClasses =
    'block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1';

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/55 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={!saving ? onClose : undefined}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                <Tags size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-lg">
                  {isEditing ? 'Editar categoria' : 'Nova categoria'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEditing
                    ? 'Altere o nome ou o cardápio desta seção.'
                    : 'Defina o nome e em qual cardápio ela aparece.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-all shrink-0 disabled:opacity-40"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div>
            <label className={labelClasses} htmlFor="categoria-nome">
              Nome da categoria *
            </label>
            <input
              id="categoria-nome"
              type="text"
              className={inputClasses}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Marmitas, Bebidas, Espetinhos..."
              autoFocus
              disabled={saving}
              required
            />
          </div>

          <div>
            <p className={labelClasses} id="categoria-tipo-label">
              Cardápio *
            </p>
            <div
              className="space-y-2"
              role="radiogroup"
              aria-labelledby="categoria-tipo-label"
            >
              {TIPO_MENU_OPTIONS.map((opt) => {
                const selected = tipoMenu === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={saving}
                    onClick={() => setTipoMenu(opt.value)}
                    className={`cursor-pointer w-full text-left rounded-2xl border px-4 py-3 transition-all disabled:opacity-50 ${
                      selected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                    }`}
                  >
                    <span
                      className={`block text-sm font-bold ${
                        selected
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !nome.trim()}
            className="cursor-pointer flex-1 bg-orange-500 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? 'Salvar alterações' : 'Criar categoria'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default CategoriaFormModal;
