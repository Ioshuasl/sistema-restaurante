import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  ClipboardList,
  MessageSquareText,
  Timer,
  Save,
  Zap,
  Store, // Novo ícone para Retirada
  Bike   // Novo ícone para Delivery
} from 'lucide-react';
import { updatePedido, printPedido, updateTempoEspera } from '../../../services/pedidoService';
import { getAllFormasPagamento } from '../../../services/formaPagamentoService';
import { type Pedido, type FormaPagamento } from '../../../types/interfaces-types';
import { toast } from 'react-toastify';

interface OrderDetailProps {
  pedido: Pedido;
  onClose: () => void;
  onStatusUpdate: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ pedido, onClose, onStatusUpdate }) => {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [updating, setUpdating] = useState(false);
  const [savingTempo, setSavingTempo] = useState(false);
  const [tempoEspera, setTempoEspera] = useState(pedido.tempoEspera || '');

  const quickTimes = ["15 min", "30 min", "45 min", "60 min"];
  const quickRanges = ["20 a 40 min", "30 a 50 min", "40 a 60 min", "50 a 70 min"];

  useEffect(() => {
    getAllFormasPagamento().then(setFormasPagamento).catch(() => { });
  }, []);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updatePedido(pedido.id, { situacaoPedido: newStatus as any });
      toast.success(`Status alterado para ${newStatus.toUpperCase()}`);
      onStatusUpdate();
      onClose();
    } catch (error) {
      toast.error("Falha ao atualizar status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTempoEspera = async () => {
    if (!tempoEspera.trim()) {
      toast.warning("Informe um tempo de espera.");
      return;
    }
    setSavingTempo(true);
    try {
      await updateTempoEspera(pedido.id, tempoEspera);
      toast.success("Tempo de espera atualizado e notificado!");
      onStatusUpdate();
    } catch (error) {
      toast.error("Erro ao salvar tempo de espera.");
    } finally {
      setSavingTempo(false);
    }
  };

  const handlePrint = async () => {
    try {
      await printPedido(pedido.id);
      toast.info("Impressão enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao comunicar com a impressora.");
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = pedido.telefoneCliente.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  const formaPagamentoNome = formasPagamento.find(f => f.id === pedido.formaPagamento_id)?.nomeFormaPagamento || `ID: ${pedido.formaPagamento_id}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl h-full bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col animate-slide-in overflow-hidden transition-colors">

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-10 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors ${pedido.isRetiradaEstabelecimento ? 'bg-orange-500 shadow-orange-100' : 'bg-red-600 shadow-red-100'}`}>
              {pedido.isRetiradaEstabelecimento ? <Store size={24} /> : <Bike size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-colors">Pedido #{pedido.numeroDiario || pedido.id}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${pedido.isRetiradaEstabelecimento ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {pedido.isRetiradaEstabelecimento ? 'Retirada' : 'Delivery'}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">
                {new Date(pedido.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white rounded-xl transition-all"
              title="Imprimir Cupom"
            >
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-3 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

          {/* LÓGICA DE EXIBIÇÃO: RETIRADA VS DELIVERY */}
          {pedido.isRetiradaEstabelecimento ? (
            // CARD DE RETIRADA
            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border-2 border-dashed border-orange-200 dark:border-orange-900/30 flex items-center gap-4 transition-colors">
              <div className="bg-white dark:bg-orange-900/20 p-3 rounded-full">
                <Store className="text-orange-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Retirada no Balcão</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">O cliente irá buscar o pedido no estabelecimento.</p>
              </div>
            </div>
          ) : (
            // CARD DE ENDEREÇO (DELIVERY)
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MapPin size={100} />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2 text-rose-500 transition-colors">
                  <MapPin size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest">Endereço de Entrega</h3>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pedido.logadouroCliente}, ${pedido.numeroCliente} - ${pedido.bairroCliente}, ${pedido.cidadeCliente}`)}`}
                  target="_blank" rel="noreferrer"
                  className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1 transition-colors hover:underline"
                >
                  Abrir Maps <ExternalLink size={10} />
                </a>
              </div>
              <div className="text-sm font-medium bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors relative z-10">
                <p className="font-black text-slate-900 dark:text-slate-100 text-lg transition-colors">
                  {pedido.logadouroCliente}, Nº {pedido.numeroCliente}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pedido.quadraCliente && (
                    <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                      Quadra: {pedido.quadraCliente}
                    </span>
                  )}
                  {pedido.loteCliente && (
                    <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                      Lote: {pedido.loteCliente}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors uppercase text-xs font-bold tracking-wide">
                  {pedido.bairroCliente} • {pedido.cidadeCliente}/{pedido.estadoCliente}
                </p>
              </div>
            </div>
          )}

          {/* Info Cards (Cliente e Pagamento) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-orange-500 mb-4 transition-colors">
                <Phone size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Cliente</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{pedido.nomeCliente}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{pedido.telefoneCliente}</p>
                </div>
                <button onClick={openWhatsApp} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-white transition-all">
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-blue-500 mb-4 transition-colors">
                <CreditCard size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Pagamento</h3>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{formaPagamentoNome}</p>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-500 transition-colors">
                    R$ {Number(pedido.valorTotalPedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {!pedido.isRetiradaEstabelecimento && pedido.taxaEntrega && Number(pedido.taxaEntrega) > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                      (Inclui Taxa: R$ {Number(pedido.taxaEntrega).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tempo de Espera */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-indigo-500 transition-colors">
                <Timer size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Estimativa de Preparo</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                <Zap size={10} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Ações Rápidas</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {quickTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setTempoEspera(time)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black border transition-all ${tempoEspera === time ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {quickRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => setTempoEspera(range)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black border transition-all ${tempoEspera === range ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-slate-100 transition-all placeholder:text-slate-400"
                  placeholder="Ou digite algo personalizado..."
                  value={tempoEspera}
                  onChange={(e) => setTempoEspera(e.target.value)}
                />
                <button
                  onClick={handleSaveTempoEspera}
                  disabled={savingTempo}
                  className="bg-indigo-500 text-white px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 active:scale-95"
                  title="Salvar e Notificar WhatsApp"
                >
                  {savingTempo ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Confirmar
                </button>
              </div>
            </div>

            {pedido.tempoEspera && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle size={14} className="text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Notificado com: <span className="text-slate-800 dark:text-slate-200">{pedido.tempoEspera}</span>
                </p>
              </div>
            )}
          </div>

          {/* Observação Geral do Pedido */}
          {pedido.observacao && (
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/20 shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-3 transition-colors">
                <MessageSquareText size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Observações do Pedido</h3>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 italic transition-colors">
                "{pedido.observacao}"
              </p>
            </div>
          )}

          {/* ITENS - PRODUÇÃO */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.2em] pl-2 transition-colors">Itens de Produção</h3>
            <div className="space-y-4">
              {pedido.itensPedido && pedido.itensPedido.length > 0 ? (
                pedido.itensPedido.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm transition-colors">
                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm transition-colors">
                          {item.quantidade}x
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-slate-100 text-lg uppercase transition-colors">{item.produto?.nomeProduto || 'Produto'}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-300 dark:text-slate-700 transition-colors">#ITEM-{idx + 1}</span>
                    </div>

                    <div className="p-6 space-y-4">
                      {item.subItensPedido && item.subItensPedido.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.subItensPedido.map((sub, sidx) => (
                            <div key={sidx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-orange-500" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight transition-colors">
                                {sub.subproduto?.nomeSubProduto || 'Opção'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-600 italic transition-colors">Sem adicionais específicos.</p>
                      )}

                      {/* Observação Individual do Item (observacaoItem) */}
                      {item.observacaoItem && (
                        <div className="mt-4 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border-l-4 border-rose-500 transition-colors">
                          <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-1 transition-colors">Observação do Item:</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors">
                            {item.observacaoItem}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                  <AlertCircle size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2 transition-colors" />
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-600 transition-colors">Nenhum item encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 transition-colors">
          <div className="grid grid-cols-1 gap-3">

            {/* 1. BOTÃO: SAIU PARA ENTREGA 
               - Só aparece se estiver 'preparando' E for Delivery (não for retirada) 
            */}
            {pedido.situacaoPedido === 'preparando' && !pedido.isRetiradaEstabelecimento && (
              <button
                onClick={() => handleStatusUpdate('entrega')}
                disabled={updating}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-3 transition-all"
              >
                {updating ? <Loader2 className="animate-spin" /> : <><Truck size={20} /> Saiu para Entrega</>}
              </button>
            )}

            {/* 2. BOTÃO: FINALIZAR / PRONTO PARA RETIRADA
               - Aparece se estiver 'entrega' (Delivery voltando)
               - OU se estiver 'preparando' E for Retirada (pula etapa de entrega)
            */}
            {(pedido.situacaoPedido === 'entrega' || (pedido.situacaoPedido === 'preparando' && pedido.isRetiradaEstabelecimento)) && (
              <button
                onClick={() => handleStatusUpdate('finalizado')}
                disabled={updating}
                className={`w-full text-white py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-xl dark:shadow-none flex items-center justify-center gap-3 transition-all ${pedido.isRetiradaEstabelecimento
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' // Cor Laranja para Retirada
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' // Cor Verde para Delivery Finalizado
                  }`}
              >
                {updating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {pedido.isRetiradaEstabelecimento ? <Store size={20} /> : <CheckCircle size={20} />}
                    {pedido.isRetiradaEstabelecimento ? 'Pronto para Retirada & Finalizar' : 'Finalizar Pedido'}
                  </>
                )}
              </button>
            )}

            {/* 3. BOTÃO: CANCELAR
               - Aparece sempre, exceto se já finalizado ou cancelado
            */}
            {pedido.situacaoPedido !== 'cancelado' && pedido.situacaoPedido !== 'finalizado' && (
              <button
                onClick={() => handleStatusUpdate('cancelado')}
                disabled={updating}
                className="w-full bg-white dark:bg-slate-800 text-rose-500 border-2 border-rose-100 dark:border-rose-900/30 py-4 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center justify-center gap-3 transition-all"
              >
                {updating ? <Loader2 className="animate-spin" /> : <><XCircle size={18} /> Cancelar Pedido</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default OrderDetail;