import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Loader2, Tags, GripVertical } from 'lucide-react';
import {
  getAllCategoriasProdutos,
  deleteCategoriaProduto,
  reorderCategoriasProdutos,
} from '../../../services/categoriaProdutoService';
import { type CategoriaProduto, type TipoMenu } from '../../../types/interfaces-types';
import ConfirmationModal from '../../Common/ConfirmationModal';
import CategoriaFormModal from './CategoriaFormModal';
import { toast } from 'react-toastify';

interface CategoriaModalProps {
  onClose: () => void;
  onRefresh: () => void;
  openCreateOnMount?: boolean;
}

const TIPO_MENU_LABELS: Record<TipoMenu, string> = {
  dia: 'Almoço',
  noite: 'Jantar',
  ambos: 'Ambos',
};

function countProdutos(cat: CategoriaProduto): number {
  const anyCat = cat as CategoriaProduto & { produtos?: unknown[] };
  const list = anyCat.Produtos || anyCat.produtos;
  return Array.isArray(list) ? list.length : 0;
}

type FormState =
  | { open: false }
  | { open: true; category: CategoriaProduto | null };

const CategoriaModal: React.FC<CategoriaModalProps> = ({
  onClose,
  onRefresh,
  openCreateOnMount = false,
}) => {
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>(
    openCreateOnMount ? { open: true, category: null } : { open: false }
  );
  const [deleteTarget, setDeleteTarget] = useState<CategoriaProduto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoriasProdutos();
      const list = Array.isArray(data) ? data : [];
      setCategorias(
        [...list].sort((a, b) => (a.ordem ?? a.id) - (b.ordem ?? b.id))
      );
    } catch {
      toast.error('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleFormSuccess = async () => {
    setFormState({ open: false });
    await fetchCategorias();
    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategoriaProduto(deleteTarget.id);
      toast.success('Categoria removida.');
      setDeleteTarget(null);
      await fetchCategorias();
      onRefresh();
    } catch {
      toast.error('Erro ao excluir.');
    } finally {
      setIsDeleting(false);
    }
  };

  const persistOrder = async (next: CategoriaProduto[]) => {
    setIsReordering(true);
    try {
      await reorderCategoriasProdutos({ orderedIds: next.map((c) => c.id) });
      onRefresh();
    } catch {
      toast.error('Não foi possível salvar a nova ordem.');
      await fetchCategorias();
    } finally {
      setIsReordering(false);
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const next = [...categorias];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setCategorias(next);
    setDragIndex(null);
    setDragOverIndex(null);
    await persistOrder(next);
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6">
        <div
          className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        <div className="relative w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[85vh] bg-white dark:bg-slate-900 sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Tags size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-lg">
                    Categorias do cardápio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Arraste para definir a ordem no cardápio público.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-all shrink-0"
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setFormState({ open: true, category: null })}
                className="cursor-pointer bg-orange-500 text-white px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-all"
              >
                <Plus size={16} /> Nova categoria
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="animate-spin text-orange-500" size={28} />
              </div>
            ) : categorias.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Nenhuma categoria cadastrada
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Crie a primeira para organizar os produtos do cardápio.
                </p>
                <button
                  type="button"
                  onClick={() => setFormState({ open: true, category: null })}
                  className="cursor-pointer inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
                >
                  <Plus size={16} /> Criar categoria
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-3 flex items-center gap-2">
                  <GripVertical size={12} />
                  Segure e arraste para reordenar
                  {isReordering && (
                    <Loader2 size={12} className="animate-spin text-orange-500" />
                  )}
                </p>

                {categorias.map((cat, index) => {
                  const isDragging = dragIndex === index;
                  const isOver = dragOverIndex === index && dragIndex !== index;

                  return (
                    <div
                      key={cat.id}
                      draggable={!isReordering}
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverIndex !== index) setDragOverIndex(index);
                      }}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                        isDragging
                          ? 'opacity-40 border-dashed border-orange-300'
                          : isOver
                            ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/20'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-orange-500 shrink-0 p-1"
                        title="Arrastar"
                        aria-hidden="true"
                      >
                        <GripVertical size={18} />
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-slate-400 tabular-nums">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {cat.nomeCategoriaProduto}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {TIPO_MENU_LABELS[cat.tipoMenu || 'dia']}
                          </span>
                          <span className="text-[9px] font-bold text-slate-300">·</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            {countProdutos(cat)} produto{countProdutos(cat) === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFormState({ open: true, category: cat })}
                          className="cursor-pointer p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg"
                          aria-label={`Editar ${cat.nomeCategoriaProduto}`}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cat)}
                          className="cursor-pointer p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                          aria-label={`Excluir ${cat.nomeCategoriaProduto}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer w-full py-3.5 bg-slate-800 dark:bg-slate-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-all active:scale-[0.99]"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {formState.open && (
        <CategoriaFormModal
          category={formState.category}
          onClose={() => setFormState({ open: false })}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Remover categoria?"
        description="Produtos vinculados a esta categoria podem ficar inconsistentes. Confirme apenas se tiver certeza."
        confirmText="Remover"
      />

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
};

export default CategoriaModal;
