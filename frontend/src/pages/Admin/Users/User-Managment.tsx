
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Users as UsersIcon,
  ShieldAlert
} from 'lucide-react';
import Sidebar from '../../../components/Admin/Sidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import UserList from '../../../components/Admin/Users/UserList';
import UserForm from '../../../components/Admin/Users/UserForm';
import ConfirmationModal from '../../../components/Common/ConfirmationModal';
import { getUsers, deleteUser } from '../../../services/userService';
import { type User } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

const UserManagment: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkUnread = () => {
      setHasUnread(localStorage.getItem(UNREAD_ORDERS_KEY) === 'true');
    };
    checkUnread();
    window.addEventListener('storage-update', checkUnread);
    return () => window.removeEventListener('storage-update', checkUnread);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || !userToDelete.id) {
      toast.error("ID inválido.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success(`Acesso removido!`);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover.");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Controle de Acessos" 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          hasUnreadNotifications={hasUnread}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="bg-orange-600 rounded-[2rem] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transition-all">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                     <UsersIcon size={32} />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Equipe e Colaboradores</h2>
                    <p className="text-orange-100 text-sm">Gerencie permissões e acessos ao painel administrativo.</p>
                  </div>
               </div>
               <button onClick={handleAdd} className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-50 transition-all shadow-lg active:scale-95 w-full md:w-auto">
                  <Plus size={16} className="inline mr-2" /> Novo Usuário
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou login..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none dark:text-slate-100 shadow-sm transition-all focus:ring-4 focus:ring-orange-500/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-2 transition-colors">
                   <ShieldAlert size={16} className="text-slate-400" />
                   <span className="text-[10px] font-black uppercase text-slate-400">{users.length} Registros</span>
                </div>
                <button onClick={fetchUsers} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-colors">
                  <RefreshCw size={20} className={loading ? 'animate-spin text-orange-500' : ''} />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto transition-colors">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Carregando equipe...</p>
                </div>
              ) : (
                <UserList users={filteredUsers} onEdit={handleEdit} onDelete={handleDeleteClick} />
              )}
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <UserForm 
          user={editingUser} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchUsers(); }} 
        />
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir Usuário?"
        description="Esta pessoa perderá imediatamente o acesso a todas as funções do painel."
      />
    </div>
  );
};

export default UserManagment;
