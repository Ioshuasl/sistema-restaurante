
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Check, Loader2 } from 'lucide-react';
import { 
  getAllCategoriasProdutos, 
  createCategoriaProduto, 
  updateCategoriaProduto, 
  deleteCategoriaProduto 
} from '../../../services/categoriaProdutoService';
import { type CategoriaProduto } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface CategoriaModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ onClose, onRefresh }) => {
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoriasProdutos();
      setCategorias(data);
    } catch (error) {
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    setIsProcessing(true);
    try {
      await createCategoriaProduto({ nomeCategoriaProduto: newCatName });
      setNewCatName('');
      toast.success("Criada!");
      fetchCategorias();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao criar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    setIsProcessing(true);
    try {
      await updateCategoriaProduto(id, { nomeCategoriaProduto: editingName });
      setEditingId(null);
      toast.success("Atualizada!");
      fetchCategorias();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Atenção: excluir uma categoria pode afetar os produtos vinculados. Continuar?")) return;
    try {
      await deleteCategoriaProduto(id);
      toast.success("Removida.");
      fetchCategorias();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 dark:text-slate-100 transition-all";

  return (
    <div className="absolute inset-0 z-[110] bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-8 animate-fade-in transition-colors">
      <div className="w-full sm:max-w-md h-full sm:h-auto bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-full sm:max-h-[80vh] overflow-hidden animate-slide-up transition-colors">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-lg">Categorias</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organização</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-all shrink-0">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar transition-colors">
          <div className="flex gap-2">
            <input 
              type="text" 
              className={inputClasses} 
              placeholder="Nova categoria..." 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              type="button"
              onClick={handleAdd}
              disabled={isProcessing || !newCatName.trim()}
              className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg shrink-0 flex items-center justify-center w-[46px]"
            >
              {isProcessing && !editingId ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : categorias.length === 0 ? (
              <div className="py-10 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Nenhuma encontrada</div>
            ) : (
              categorias.map(cat => (
                <div key={cat.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                  {editingId === cat.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 bg-white dark:bg-slate-800 border border-orange-500 rounded-xl px-3 py-1.5 text-sm outline-none font-bold dark:text-slate-100"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                      <button type="button" onClick={() => handleUpdate(cat.id)} className="text-emerald-500 p-1"><Check size={20}/></button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 p-1"><X size={20}/></button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 ml-2 truncate mr-4">{cat.nomeCategoriaProduto}</span>
                      <div className="flex gap-1 shrink-0">
                        <button 
                          type="button"
                          onClick={() => { setEditingId(cat.id); setEditingName(cat.nomeCategoriaProduto); }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg active:scale-95"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriaModal;
