
import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { getMonthlyRevenue, getTotalOrders } from '../../../services/dashboardService';
import { getAllPedidos } from '../../../services/pedidoService';
import { type Pedido } from '../../../types/interfaces-types';
import Sidebar from '../../../components/Admin/Sidebar';
import AdminHeader from '../../../components/Admin/AdminHeader';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

const DashBoard: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  const [revenue, setRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [revData, ordCount, allPedidos] = await Promise.all([
        getMonthlyRevenue(),
        getTotalOrders(),
        getAllPedidos()
      ]);
      setRevenue(revData.totalRevenue || 0);
      setTotalOrders(ordCount || 0);
      
      const ordersArray = Array.isArray(allPedidos) ? allPedidos : (allPedidos as any).rows || [];
      setRecentOrders(ordersArray.slice(0, 5));
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkUnread = () => {
      setHasUnread(localStorage.getItem(UNREAD_ORDERS_KEY) === 'true');
    };
    checkUnread();
    window.addEventListener('storage-update', checkUnread);
    window.addEventListener('storage', checkUnread);
    fetchData();
    return () => {
      window.removeEventListener('storage-update', checkUnread);
      window.removeEventListener('storage', checkUnread);
    };
  }, [fetchData]);

  const stats = [
    { label: 'Receita Mensal', value: `R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20', trend: '+12.5%', isUp: true },
    { label: 'Total de Pedidos', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', trend: '+5.2%', isUp: true },
    { label: 'Novos Clientes', value: '124', icon: Users, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/20', trend: '-2.4%', isUp: false },
    { label: 'Ticket Médio', value: `R$ ${(revenue / (totalOrders || 1)).toFixed(2)}`, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20', trend: '+8.1%', isUp: true },
  ];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Dashboard" 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          showSearch={true}
          hasUnreadNotifications={hasUnread}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Visão Geral do Negócio</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Resumo operacional de hoje.</p>
            </div>
            <Link 
              to="/admin/order" 
              className="w-full sm:w-auto text-center bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              Ver Pedidos
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}><stat.icon className="h-6 w-6" /></div>
                  <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
              <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <Clock size={20} className="text-orange-500" /> Pedidos Recentes
                </h2>
                <Link to="/admin/order" className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest hover:underline">Ver Todos</Link>
              </div>
              <div className="flex-1 overflow-x-auto">
                {recentOrders.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800 min-w-[500px] lg:min-w-0">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate('/admin/order')}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">#{order.id}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.nomeCliente}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.isRetiradaEstabelecimento ? 'Retirada' : 'Entrega'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">R$ {Number(order.valorTotalPedido).toFixed(2)}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700">
                              {order.situacaoPedido}
                            </span>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <ShoppingBag size={48} className="text-slate-300 mb-4" />
                    <p className="font-bold text-slate-500">Sem pedidos</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-600 rounded-[2rem] sm:rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div>
                <div className="bg-white/20 p-4 rounded-3xl w-fit mb-6 backdrop-blur-md">
                   <BarChart3 size={32} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black leading-tight mb-2 uppercase tracking-tight">Gestão Eficiente</h2>
                <p className="text-orange-100 text-sm font-medium leading-relaxed">Mantenha seu estoque em dia e analise suas vendas em tempo real.</p>
              </div>
              <button className="mt-8 bg-white text-orange-600 w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-orange-50 transition-all active:scale-95">Relatórios Completos</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashBoard;
