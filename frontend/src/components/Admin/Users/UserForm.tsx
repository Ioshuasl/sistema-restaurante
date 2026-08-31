
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  User as UserIcon, 
  Lock, 
  Key, 
  Settings,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { 
  type User, 
  type Cargo, 
  type CreateUserPayload, 
  type UpdateUserPayload 
} from '../../../types/interfaces-types';
import { getCargos } from '../../../services/cargoService';
import { createUser, updateUser } from '../../../services/userService';
import { toast } from 'react-toastify';
import CargoModal from './CargoModal';

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const [nome, setNome] = useState(user?.nome || '');
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [cargoId, setCargoId] = useState(user?.cargo_id?.toString() || '');
  
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCargos = async () => {
    try {
      const data = await getCargos();
      setCargos(data);
    } catch (err) {
      toast.error("Erro ao carregar cargos.");
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoId) return toast.warning("Selecione o cargo.");
    setSaving(true);
    try {
      if (user) {
        const payload: UpdateUserPayload = { nome, username, cargo_id: Number(cargoId) };
        if (password) payload.password = password;
        await updateUser(user.id, payload);
        toast.success("Atualizado!");
      } else {
        if (!password) { toast.warning("Senha obrigatória."); setSaving(false); return; }
        const payload: CreateUserPayload = { nome, username, password, cargo_id: Number(cargoId) };
        await createUser(payload);
        toast.success("Criado!");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 sm:p-4 pl-12 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all placeholder:text-slate-400";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1 transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-lg h-full sm:h-auto bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up transition-colors">
        
        {isCargoModalOpen && (
          <CargoModal onClose={() => setIsCargoModalOpen(false)} onRefresh={fetchCargos} />
        )}

        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-colors shrink-0">
                 <UserIcon size={24} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 truncate">
                  {user ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 shrink-0">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
          <div>
            <label className={labelClasses}>Nome Completo</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input type="text" className={inputClasses} required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Pedro Alvares" />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Usuário (Login)</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input type="text" className={inputClasses} required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: pedro_adm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClasses}>Cargo</label>
                  <button type="button" onClick={() => setIsCargoModalOpen(true)} className="text-[9px] font-black text-orange-600 uppercase hover:underline">Editar</button>
              </div>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                <select className={`${inputClasses} appearance-none`} required value={cargoId} onChange={(e) => setCargoId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>{user ? 'Nova Senha (Opcional)' : 'Senha'}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input type="password" className={inputClasses} required={!user} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl flex items-start gap-4 border border-orange-100 dark:border-orange-800">
             <ShieldCheck className="text-orange-500 shrink-0 mt-0.5" size={18} />
             <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold leading-tight">As permissões são controladas pelo cargo selecionado.</p>
          </div>
        </form>

        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 transition-colors">
          <button type="button" onClick={onClose} className="w-full sm:flex-1 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancelar</button>
          <button type="submit" onClick={handleSubmit} disabled={saving} className="w-full sm:flex-[2] bg-orange-500 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {user ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
