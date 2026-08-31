import React from 'react';
import { Clock, User, DollarSign, ChevronRight, Package, MapPin, Bike, Store } from 'lucide-react';
import { type Pedido } from '../../../types/interfaces-types';

interface OrderGridProps {
  pedidos: Pedido[];
  onViewDetails: (id: number) => void;
}

const OrderGrid: React.FC<OrderGridProps> = ({ pedidos, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparando': return 'bg-amber-500';
      case 'entrega': return 'bg-blue-500';
      case 'finalizado': return 'bg-emerald-500';
      case 'cancelado': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {pedidos.map((pedido) => (
        <div 
          key={pedido.id}
          onClick={() => onViewDetails(pedido.id)}
          className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
        >
          {/* Status Indicator Bar */}
          <div className={`absolute top-0 left-0 w-full h-1.5 ${getStatusColor(pedido.situacaoPedido)}`} />
          
          <div className="flex justify-between items-start mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black text-slate-400 dark:text-slate-500 transition-colors">
              #{pedido.numeroDiario || pedido.id}
            </div>
            <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-sm ${getStatusColor(pedido.situacaoPedido)}`}>
              {pedido.situacaoPedido}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              {/* Avatar Diferenciado por Tipo */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  pedido.isRetiradaEstabelecimento 
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500' 
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {pedido.isRetiradaEstabelecimento ? <Store size={18} /> : <User size={18} />}
              </div>
              
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate transition-colors">{pedido.nomeCliente}</p>
                
                {/* Badge de Tipo de Pedido */}
                <div className="flex items-center gap-1 mt-0.5">
                    {pedido.isRetiradaEstabelecimento ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-500 flex items-center gap-1">
                            <Store size={10} /> Retirada
                        </span>
                    ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 flex items-center gap-1">
                            <Bike size={10} /> Delivery
                        </span>
                    )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold">{new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
               
               {/* Só mostra endereço se NÃO for retirada */}
               {!pedido.isRetiradaEstabelecimento && (
                 <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors">
                    <MapPin size={14} />
                    <span className="text-[10px] font-bold truncate">
                        {pedido.bairroCliente}
                    </span>
                 </div>
               )}
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-500">
                <DollarSign size={16} />
                <span className="text-lg font-black">{Number(pedido.valorTotalPedido).toFixed(2).replace('.', ',')}</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderGrid;