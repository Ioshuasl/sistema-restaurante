
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Check, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { 
  getCargos, 
  createCargo, 
  updateCargo, 
  deleteCargo 
} from '../../../services/cargoService';
import { type Cargo } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface CargoModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

const CargoModal: React.FC<CargoModalProps> = ({ onClose, onRefresh }) => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [editingIsAdmin, setEditingIsAdmin] = useState(false);

  const fetchCargos = async () => {
    setLoading(true);
    try {
      const data = await getCargos();
      setCargos(data);
    } catch (error) {
      toast.error("Erro ao carregar cargos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setIsProcessing(true);
    try {
      await createCargo({ nome: newName, descricao: newDesc, admin: newIsAdmin });
      setNewName(''); setNewDesc(''); setNewIsAdmin(false);
      toast.success("Cargo criado!");
      fetchCargos();
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
      await updateCargo(id, { nome: editingName, descricao: editingDesc, admin: editingIsAdmin });
      setEditingId(null);
      toast.success("Atualizado!");
      fetchCargos();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja excluir este cargo?")) return;
    try {
      await deleteCargo(id);
      toast.success("Removido.");
      fetchCargos();
      onRefresh();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 dark:text-slate-100 transition-all";

  return (
    <div className="absolute inset-0 z-[110] bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-8 animate-fade-in">
      <div className="w-full sm:max-w-xl h-full sm:h-auto bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-full sm:max-h-[85vh] overflow-hidden animate-slide-up transition-colors">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-lg">Cargos</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Níveis de Acesso</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-all shrink-0">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar transition-colors">
          <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 sm:p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" className={inputClasses} placeholder="Nome do cargo..." value={newName} onChange={(e) => setNewName(e.target.value)} />
              <label className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-[46px] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-orange-500" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} />
                <span className="text-[10px] font-black uppercase text-slate-500">Master/Admin</span>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" className={inputClasses} placeholder="Descrição..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              <button type="button" onClick={handleAdd} disabled={isProcessing || !newName.trim()} className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center">
                {isProcessing && !editingId ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : cargos.map(cargo => (
              <div key={cargo.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 group">
                {editingId === cargo.id ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input className={inputClasses} value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                      <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 border border-slate-200 h-[46px]">
                        <input type="checkbox" className="w-4 h-4 text-orange-500" checked={editingIsAdmin} onChange={(e) => setEditingIsAdmin(e.target.checked)} />
                        <span className="text-[10px] font-black uppercase text-slate-500">Admin</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input className={inputClasses} value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} />
                      <button onClick={() => handleUpdate(cargo.id)} className="text-emerald-500 p-2"><Check size={20}/></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 p-2"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cargo.admin ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        {cargo.admin ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{cargo.nome}</span>
                          {cargo.admin && <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase">Master</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{cargo.descricao || 'Sem descrição'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingId(cargo.id); setEditingName(cargo.nome); setEditingDesc(cargo.descricao); setEditingIsAdmin(cargo.admin); }} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(cargo.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <button type="button" onClick={onClose} className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg active:scale-95">Concluir</button>
        </div>
      </div>
    </div>
  );
};

export default CargoModal;
