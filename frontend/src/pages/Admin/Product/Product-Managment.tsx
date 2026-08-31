
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw
} from 'lucide-react';
import Sidebar from '../../../components/Admin/Sidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import ProductList from '../../../components/Admin/Product/ProductList';
import ProductForm from '../../../components/Admin/Product/ProductForm';
import ConfirmationModal from '../../../components/Common/ConfirmationModal';
import { getAllProdutos, deleteProduto, toggleProdutoAtivo } from '../../../services/produtoService';
import { type Produto } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

const ProductManagment: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Produto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = () => {
      setHasUnread(localStorage.getItem(UNREAD_ORDERS_KEY) === 'true');
    };
    checkUnread();
    window.addEventListener('storage-update', checkUnread);
    return () => window.removeEventListener('storage-update', checkUnread);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProdutos();
      setProdutos(Array.isArray(data) ? data : (data as any).rows || []);
    } catch (error) { 
        toast.error("Erro ao carregar lista."); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDeleteClick = (product: Produto) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try { 
      await deleteProduto(productToDelete.id); 
      toast.success(`Produto removido!`); 
      setIsDeleteModalOpen(false);
      fetchProducts(); 
    } catch (error) { 
      toast.error("Falha ao excluir."); 
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleToggleAtivo = async (id: number) => {
    try { 
      await toggleProdutoAtivo(id); 
      setProdutos(p => p.map(x => x.id === id ? { ...x, isAtivo: !x.isAtivo } : x)); 
    } catch (e) { 
      toast.error("Erro ao alterar status!"); 
    }
  };

  const filteredProdutos = produtos.filter(p => p.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Gestão de Estoque" 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          hasUnreadNotifications={hasUnread}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar produto pelo nome..." 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none dark:text-slate-100 shadow-sm transition-all focus:ring-4 focus:ring-orange-500/10" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => { setEditingProduct(null); setIsFormOpen(true); }} 
                className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <Plus size={20} /> Adicionar Produto
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto min-h-[400px] transition-colors">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <RefreshCw className="animate-spin text-orange-500" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase">Carregando catálogo...</p>
                </div>
              ) : (
                <ProductList 
                    produtos={filteredProdutos} 
                    onEdit={p => { setEditingProduct(p); setIsFormOpen(true); }} 
                    onDelete={handleDeleteClick} 
                    onToggleAtivo={handleToggleAtivo} 
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <ProductForm 
            product={editingProduct} 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => { setIsFormOpen(false); fetchProducts(); }} 
        />
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Remover Produto?"
        description="Esta ação ocultará o item permanentemente do cardápio público."
      />
    </div>
  );
};

export default ProductManagment;
