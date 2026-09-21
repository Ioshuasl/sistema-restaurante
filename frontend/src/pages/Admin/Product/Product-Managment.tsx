import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Tags,
  Image as ImageIcon,
} from 'lucide-react';
import Sidebar from '../../../components/Admin/Sidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import ProductList from '../../../components/Admin/Product/ProductList';
import ProductForm from '../../../components/Admin/Product/ProductForm';
import CategoriaModal from '../../../components/Admin/Product/CategoriaModal';
import ConfirmationModal from '../../../components/Common/ConfirmationModal';
import { getAllProdutos, deleteProduto, toggleProdutoAtivo } from '../../../services/produtoService';
import { getAllCategoriasProdutos } from '../../../services/categoriaProdutoService';
import { type Produto, type CategoriaProduto, type TipoMenu } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

const TIPO_FILTER_OPTIONS: { value: 'todos' | TipoMenu; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'dia', label: 'Almoço' },
  { value: 'noite', label: 'Jantar' },
  { value: 'ambos', label: 'Ambos' },
];

const ProductManagment: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'todos' | TipoMenu>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<'todas' | number>('todas');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [openCategoryCreateOnMount, setOpenCategoryCreateOnMount] = useState(false);
  const [categoriasVersion, setCategoriasVersion] = useState(0);
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
      setProdutos(Array.isArray(data) ? data : (data as { rows?: Produto[] }).rows || []);
    } catch {
      toast.error('Erro ao carregar lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getAllCategoriasProdutos();
      setCategorias(Array.isArray(data) ? data : []);
      setCategoriasVersion((v) => v + 1);
    } catch {
      toast.error('Erro ao carregar categorias.');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategorias();
  }, [fetchProducts, fetchCategorias]);

  const categoriaNomeById = useMemo(() => {
    const map = new Map<number, string>();
    categorias.forEach((c) => map.set(c.id, c.nomeCategoriaProduto));
    return map;
  }, [categorias]);

  const handleDeleteClick = (product: Produto) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduto(productToDelete.id);
      toast.success('Produto removido!');
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch {
      toast.error('Falha ao excluir.');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleToggleAtivo = async (id: number) => {
    try {
      await toggleProdutoAtivo(id);
      setProdutos((p) => p.map((x) => (x.id === id ? { ...x, isAtivo: !x.isAtivo } : x)));
    } catch {
      toast.error('Erro ao alterar status!');
    }
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const filteredProdutos = produtos.filter((p) => {
    const matchName = p.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase());
    const tipo = p.tipoMenu || 'ambos';
    const matchTipo = tipoFilter === 'todos' || tipo === tipoFilter;
    const matchCategoria =
      categoriaFilter === 'todas' || p.categoriaProduto_id === categoriaFilter;
    return matchName && matchTipo && matchCategoria;
  });

  const hasActiveFilters =
    searchTerm.trim() !== '' || tipoFilter !== 'todos' || categoriaFilter !== 'todas';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader
          title="Cardápio"
          onMenuClick={() => setIsMobileMenuOpen(true)}
          hasUnreadNotifications={hasUnread}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar produto pelo nome..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none dark:text-slate-100 shadow-sm transition-all focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenCategoryCreateOnMount(false);
                      setIsCategoryModalOpen(true);
                    }}
                    className="cursor-pointer bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <Tags size={18} /> Categorias
                  </button>
                  <button
                    type="button"
                    onClick={openNewProduct}
                    className="cursor-pointer bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    <Plus size={20} /> Novo produto
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro de cardápio">
                  {TIPO_FILTER_OPTIONS.map((opt) => {
                    const pressed = tipoFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={pressed}
                        onClick={() => setTipoFilter(opt.value)}
                        className={`cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          pressed
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-orange-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <select
                  value={categoriaFilter === 'todas' ? 'todas' : String(categoriaFilter)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCategoriaFilter(v === 'todas' ? 'todas' : Number(v));
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 outline-none dark:text-slate-100 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 sm:ml-auto max-w-xs"
                  aria-label="Filtrar por categoria"
                >
                  <option value="todas">Todas as categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nomeCategoriaProduto}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto min-h-[400px] transition-colors">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <RefreshCw className="animate-spin text-orange-500" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase">Carregando cardápio...</p>
                </div>
              ) : filteredProdutos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ImageIcon size={28} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {hasActiveFilters ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {hasActiveFilters
                        ? 'Ajuste os filtros ou limpe a busca para ver o cardápio completo.'
                        : 'Comece cadastrando o primeiro item do cardápio.'}
                    </p>
                  </div>
                  {!hasActiveFilters && (
                    <button
                      type="button"
                      onClick={openNewProduct}
                      className="cursor-pointer mt-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-all"
                    >
                      <Plus size={18} /> Criar primeiro produto
                    </button>
                  )}
                </div>
              ) : (
                <ProductList
                  produtos={filteredProdutos}
                  categoriaNomeById={categoriaNomeById}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setIsFormOpen(true);
                  }}
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
          categoriasRefreshKey={categoriasVersion}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchProducts();
          }}
          onManageCategories={() => {
            setOpenCategoryCreateOnMount(true);
            setIsCategoryModalOpen(true);
          }}
        />
      )}

      {isCategoryModalOpen && (
        <CategoriaModal
          openCreateOnMount={openCategoryCreateOnMount}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setOpenCategoryCreateOnMount(false);
          }}
          onRefresh={() => {
            fetchCategorias();
            fetchProducts();
          }}
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
