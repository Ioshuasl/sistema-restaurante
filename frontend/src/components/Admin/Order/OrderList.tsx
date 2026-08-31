import React, { useEffect, useState } from 'react';
import { Clock, User, DollarSign, ExternalLink, Bike, Store } from 'lucide-react';
import { type Pedido, type FormaPagamento } from '../../../types/interfaces-types';
import { getAllFormasPagamento } from '../../../services/formaPagamentoService';

interface OrderListProps {
  pedidos: Pedido[];
  onViewDetails: (id: number) => void;
}

const OrderList: React.FC<OrderListProps> = ({ pedidos, onViewDetails }) => {
  const [formas, setFormas] = useState<FormaPagamento[]>([]);

  useEffect(() => {
    getAllFormasPagamento().then(setFormas).catch(() => {});
  }, []);

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <Clock size={48} className="mb-4 text-slate-400 dark:text-slate-600" />
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum pedido encontrado</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'preparando': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800';
      case 'entrega': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-500 dark:border-blue-800';
      case 'finalizado': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-800';
      case 'cancelado': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-500 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getFormaNome = (id: number) => {
    return formas.find(f => f.id === id)?.nomeFormaPagamento || `ID: ${id}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">ID</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Cliente / Tipo</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Total</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Pagamento</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Data</th>
            <th className="px-6 py-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {pedidos.map((pedido) => (
            <tr 
              key={pedido.id} 
              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
              onClick={() => onViewDetails(pedido.id)}
            >
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-600">#{pedido.numeroDiario || pedido.id}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {/* Ícone condicional: Bike para Delivery, Store para Retirada */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      pedido.isRetiradaEstabelecimento
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500'
                  }`}>
                    {pedido.isRetiradaEstabelecimento ? <Store size={14} /> : <Bike size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{pedido.nomeCliente}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                        {pedido.isRetiradaEstabelecimento ? 'Retirada' : 'Delivery'} • {pedido.telefoneCliente}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-sm font-black text-slate-900 dark:text-slate-100 transition-colors">
                  <DollarSign size={14} className="text-slate-300 dark:text-slate-700" />
                  {Number(pedido.valorTotalPedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight transition-colors">
                  {getFormaNome(pedido.formaPagamento_id)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider transition-colors ${getStatusStyle(pedido.situacaoPedido)}`}>
                  {pedido.situacaoPedido}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors">
                  <Clock size={14} />
                  <span className="text-xs font-medium">
                    {new Date(pedido.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;