
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  Volume2,
  VolumeX,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  FilterX
} from 'lucide-react';
import { getAllPedidos } from '../../../services/pedidoService';
import { type Pedido } from '../../../types/interfaces-types';
import OrderList from '../../../components/Admin/Order/OrderList';
import OrderGrid from '../../../components/Admin/Order/OrderGrid';
import OrderDetail from '../../../components/Admin/Order/OrderDetail';
import Sidebar from '../../../components/Admin/Sidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';
import DateRangePicker from '../../../components/Common/DateRangePicker';
import { toast } from 'react-toastify';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';
const VIEW_MODE_KEY = 'gs-sabores-order-view-mode';
const ITEMS_PER_PAGE = 8;

export default function OrderManagment({ isDarkMode, toggleTheme }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [silentLoading, setSilentLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return (saved as 'table' | 'grid') || 'grid';
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const lastOrderIds = useRef<Set<number>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(UNREAD_ORDERS_KEY, 'false');
    window.dispatchEvent(new Event('storage-update'));
    setHasUnread(false);
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.error(e); }
  }, [soundEnabled]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (silent) setSilentLoading(true);
    else setLoading(true);

    try {
      const data = await getAllPedidos();
      const ordersArray = Array.isArray(data) ? data : (data as any).rows || [];
      const sorted = [...ordersArray].sort((a, b) => Number(b.id) - Number(a.id));
      const currentIds = new Set(sorted.map(p => p.id));
      
      if (!isInitialLoad.current && lastOrderIds.current.size > 0) {
        const newOrders = sorted.filter(p => !lastOrderIds.current.has(p.id));
        if (newOrders.length > 0) {
          playNotificationSound();
          toast.info('🔔 Novo pedido recebido!', { autoClose: 5000 });
          localStorage.setItem(UNREAD_ORDERS_KEY, 'true');
          window.dispatchEvent(new Event('storage-update'));
          setHasUnread(true);
        }
      }

      lastOrderIds.current = currentIds;
      isInitialLoad.current = false;
      setPedidos(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSilentLoading(false);
    }
  }, [playNotificationSound]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(p => {
      const term = searchTerm.toLowerCase();
      
      // LOGICA DE BUSCA ATUALIZADA
      const matchesSearch = 
        p.nomeCliente?.toLowerCase().includes(term) || 
        p.id.toString().includes(term) ||
        p.numeroDiario?.toString().includes(term); // <--- Adicionado busca por senha

      const matchesStatus = statusFilter === 'todos' || p.situacaoPedido === statusFilter;
      // ... datas
      let matchesDate = true;
      const orderDate = new Date(p.createdAt).toISOString().split('T')[0];
      if (dateRange.start && orderDate < dateRange.start) matchesDate = false;
      if (dateRange.end && orderDate > dateRange.end) matchesDate = false;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [pedidos, searchTerm, statusFilter, dateRange]);

  const totalPages = Math.ceil(filteredPedidos.length / ITEMS_PER_PAGE);
  const currentPedidos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPedidos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPedidos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Operação de Pedidos" 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          hasUnreadNotifications={hasUnread}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-5 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pesquisar</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nome ou ID..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-orange-500/10 dark:text-slate-100 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 overflow-hidden">
                  <DateRangePicker range={dateRange} onChange={setDateRange} label="Período" />
                </div>

                <div className="lg:col-span-3 flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center shadow-inner h-[52px]">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      <List size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl transition-all border h-[52px] w-[52px] flex items-center justify-center ${soundEnabled ? 'text-orange-500 border-orange-100 bg-orange-50 dark:bg-orange-900/20' : 'text-slate-400 border-slate-200 dark:border-slate-800'}`}
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  
                  <button onClick={clearFilters} className="w-[52px] h-[52px] bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all">
                    <FilterX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 border-t border-slate-50 dark:border-slate-800">
                {['todos', 'preparando', 'entrega', 'finalizado', 'cancelado'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      statusFilter === status ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
                {silentLoading && (
                  <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    <RefreshCw size={12} className="animate-spin" /> Atualizando...
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <RefreshCw className="animate-spin text-orange-500" size={32} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando...</p>
                </div>
              ) : currentPedidos.length > 0 ? (
                <>
                  {viewMode === 'table' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto transition-colors">
                      <OrderList pedidos={currentPedidos} onViewDetails={(id) => setSelectedPedido(pedidos.find(p => p.id === id) || null)} />
                    </div>
                  ) : (
                    <OrderGrid pedidos={currentPedidos} onViewDetails={(id) => setSelectedPedido(pedidos.find(p => p.id === id) || null)} />
                  )}

                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors">
                        Mostrando {currentPedidos.length} de {filteredPedidos.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronLeft size={20} /></button>
                        <span className="text-sm font-black dark:text-slate-200">{currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronRight size={20} /></button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 py-32 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-6 transition-colors border border-slate-100 dark:border-slate-800">
                  <Search size={40} className="text-slate-200 mb-4" />
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Nenhum pedido</h3>
                  <button onClick={clearFilters} className="mt-4 text-xs font-black text-orange-500 uppercase hover:underline">Limpar filtros</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedPedido && (
        <OrderDetail pedido={selectedPedido} onClose={() => setSelectedPedido(null)} onStatusUpdate={() => fetchOrders(true)} />
      )}
    </div>
  );
}
