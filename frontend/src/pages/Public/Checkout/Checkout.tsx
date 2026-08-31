import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, CheckCircle2, Loader2, MapPin, User as UserIcon, CreditCard, AlertTriangle, MessageSquareMore } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { toast } from 'react-toastify';
import OptionsModal from '../../../components/Public/OptionsModal';
import { 
    type Produto, 
    type FormaPagamento, 
    type CreatePedidoPayload, 
    type ProdutoPedidoPayload, 
    type ISubProdutoPedidoPayload, 
    type CartItem, 
    type SubProduto 
} from "../../../types/interfaces-types";
import { getConfig } from '../../../services/configService';
import { getAllFormasPagamento } from '../../../services/formaPagamentoService';
import { createPedido } from '../../../services/pedidoService';

type Props = {
    cart: CartItem[];
    onBack: () => void;
    onConfirm: () => void;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
    onUpdateItem: (
        cartItemId: string, 
        newConfig: { 
            product: Produto, 
            selectedSubProducts: SubProduto[], 
            quantity: number, 
            unitPriceWithSubProducts: number,
            observation?: string
        }
    ) => void;
    isDarkMode: boolean;
};

const USER_DATA_KEY = 'gs-sabores-user-data-v3'; // Atualizei a versão da key para limpar cache antigo

export default function Checkout({ cart, onBack, onConfirm, onIncrease, onDecrease, onUpdateItem, isDarkMode }: Props) {
    const [name, setName] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    
    // NOVOS ESTADOS
    const [quadra, setQuadra] = useState('');
    const [lote, setLote] = useState('');
    
    const [observacaoGeral, setObservacaoGeral] = useState('');
    
    const [retiradaLocal, setRetiradaLocal] = useState(false);
    const [payment, setPayment] = useState<number | ''>('');
    const [paymentMethods, setPaymentMethods] = useState<FormaPagamento[]>([]);
    const [taxaEntrega, setTaxaEntrega] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);

    const totalProdutos = cart.reduce((acc, item) => acc + item.unitPriceWithSubProducts * item.quantity, 0);
    const valorTotal = retiradaLocal ? totalProdutos : totalProdutos + Number(taxaEntrega);

    // Carregar dados
    useEffect(() => {
        const savedData = localStorage.getItem(USER_DATA_KEY);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                setName(data.name || '');
                setTelefone(data.telefone || '');
                setCep(data.cep || '');
                setLogradouro(data.logradouro || '');
                setNumero(data.numero || '');
                setBairro(data.bairro || '');
                setCidade(data.cidade || '');
                setEstado(data.estado || '');
                setRetiradaLocal(!!data.retiradaLocal);
                
                // Carregar Quadra e Lote
                setQuadra(data.quadra || '');
                setLote(data.lote || '');
            } catch (e) {
                console.error("Erro ao carregar dados do usuário", e);
            }
        }
    }, []);

    // Salvar dados
    useEffect(() => {
        const data = { 
            name, telefone, cep, logradouro, numero, bairro, cidade, estado, 
            quadra, lote, retiradaLocal // Salvando Quadra e Lote
        };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    }, [name, telefone, cep, logradouro, numero, bairro, cidade, estado, quadra, lote, retiradaLocal]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [config, methods] = await Promise.all([
                    getConfig(),
                    getAllFormasPagamento(),
                ]);
                setTaxaEntrega(Number(config.taxaEntrega || 0));
                setPaymentMethods(methods);
            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBuscarCEP = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;
        
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            if (data.erro) {
                toast.error("CEP não encontrado");
                return;
            }
            setLogradouro(data.logradouro || "");
            setNumero('00')
            setBairro(data.bairro || "");
            setCidade(data.localidade || "");
            setEstado(data.uf || "");
        } catch (e) {
            toast.error("Erro ao buscar CEP");
        }
    };

    const validateCartItems = () => {
        for (const item of cart) {
            const groups = item.product.gruposOpcoes || [];
            for (const group of groups) {
                if (group.minEscolhas > 0) {
                    const selectedInGroup = item.selectedSubProducts?.filter(sel => 
                        group.opcoes.some(opt => opt.id === sel.id)
                    ).length || 0;

                    if (selectedInGroup < group.minEscolhas) {
                        return { 
                            valid: false, 
                            message: `O item "${item.product.nomeProduto}" está incompleto. Selecione pelo menos ${group.minEscolhas} opção(ões) em "${group.nomeGrupo}".` 
                        };
                    }
                }
            }
        }
        return { valid: true };
    };

    const validateForm = () => {
        if (!name.trim() || name.trim().length < 3) {
            toast.warning('Por favor, informe seu nome completo.');
            return false;
        }

        const cleanPhone = telefone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            toast.warning('Por favor, informe um telefone válido com DDD (WhatsApp).');
            return false;
        }

        if (!retiradaLocal) {
            const cleanCep = cep.replace(/\D/g, '');
            if (cleanCep.length !== 8) {
                toast.warning('Informe um CEP válido.');
                return false;
            }
            if (!logradouro.trim()) {
                toast.warning('Informe o nome da rua/logradouro.');
                return false;
            }
            if (!bairro.trim()) {
                toast.warning('Informe o bairro.');
                return false;
            }
            if (!numero.trim()) {
                toast.warning('Informe o número do endereço.');
                return false;
            }
            // Validação de Quadra e Lote
            if (!quadra.trim()) {
                toast.warning('Informe a quadra.');
                return false;
            }
            if (!lote.trim()) {
                toast.warning('Informe o lote.');
                return false;
            }
            if (!cidade.trim()) {
                toast.warning('Informe a cidade.');
                return false;
            }
            if (!estado.trim()) {
                toast.warning('Informe o estado (UF).');
                return false;
            }
        }

        if (!payment) {
            toast.warning('Selecione uma forma de pagamento.');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const cartValidation = validateCartItems();
        if (!cartValidation.valid) {
            toast.warning(cartValidation.message, { 
                icon: <AlertTriangle className="text-amber-500" />,
                autoClose: 5000
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const produtosPedido: ProdutoPedidoPayload[] = cart.map(item => {
                const subProdutos: ISubProdutoPedidoPayload[] = item.selectedSubProducts.map(sp => ({
                    subProdutoId: sp.id,
                    quantidade: 1
                }));
                
                return {
                    produtoId: item.product.id,
                    quantidade: item.quantity,
                    subProdutos: subProdutos,
                    observacaoItem: item.observation
                };
            });

            const orderPayload: CreatePedidoPayload = {
                produtosPedido,
                formaPagamento_id: Number(payment),
                situacaoPedido: 'preparando',
                isRetiradaEstabelecimento: retiradaLocal,
                taxaEntrega: retiradaLocal ? 0 : taxaEntrega,
                nomeCliente: name,
                telefoneCliente: telefone,
                cepCliente: retiradaLocal ? "" : cep,
                tipoLogadouroCliente: 'Não informado',
                logadouroCliente: retiradaLocal ? "" : logradouro,
                numeroCliente: retiradaLocal ? "" : numero,
                // Mapeamento CORRETO para o Backend
                quadraCliente: retiradaLocal ? "" : quadra,
                loteCliente: retiradaLocal ? "" : lote,
                bairroCliente: retiradaLocal ? "" : bairro,
                cidadeCliente: retiradaLocal ? "" : cidade,
                estadoCliente: retiradaLocal ? "" : estado,
                observacao: observacaoGeral
            };

            await createPedido(orderPayload);
            toast.success('Pedido enviado com sucesso!');
            onConfirm();
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            toast.error('Ocorreu um erro ao processar seu pedido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Preparando checkout...</h2>
            </div>
        );
    }

    const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-500/10 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
    const labelClasses = "block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold mb-8 transition group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
                    Voltar ao Cardápio
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3 transition-colors">
                                <UserIcon className="text-red-600 dark:text-red-500" /> Seus Dados
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Nome Completo *</label>
                                    <input 
                                        type="text" 
                                        className={inputClasses}
                                        placeholder="Ex: João Silva"
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>WhatsApp *</label>
                                    <IMaskInput 
                                        mask="(00) 00000-0000" 
                                        type="tel" 
                                        className={inputClasses}
                                        placeholder="(00) 00000-0000"
                                        value={telefone} 
                                        onAccept={(value) => setTelefone(value as string)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 transition-colors">
                                    <MapPin className="text-red-600 dark:text-red-500" /> Entrega
                                </h2>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl transition hover:bg-slate-200 dark:hover:bg-slate-700">
                                    <input 
                                        type="checkbox" 
                                        checked={retiradaLocal} 
                                        onChange={(e) => setRetiradaLocal(e.target.checked)} 
                                        className="w-4 h-4 rounded text-red-600 dark:text-red-500 focus:ring-red-500" 
                                    />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Vou retirar</span>
                                </label>
                            </div>

                            {!retiradaLocal ? (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className={labelClasses}>CEP *</label>
                                            <IMaskInput 
                                                mask="00000-000" 
                                                placeholder="00000-000"
                                                onAccept={(v) => setCep(v as string)}
                                                value={cep}
                                                className={inputClasses} 
                                            />
                                        </div>
                                        <button onClick={handleBuscarCEP} className="mt-6 bg-slate-800 dark:bg-slate-700 text-white px-6 rounded-2xl text-xs font-bold hover:bg-black dark:hover:bg-slate-600 transition h-[52px]">Buscar</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className={labelClasses}>Rua *</label>
                                            <input type="text" className={inputClasses} value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Nº *</label>
                                            <input type="text" className={inputClasses} value={numero} onChange={(e) => setNumero(e.target.value)} />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-12 sm:col-span-5">
                                            <label className={labelClasses}>Bairro *</label>
                                            <input type="text" className={inputClasses} value={bairro} onChange={(e) => setBairro(e.target.value)} />
                                        </div>
                                        <div className="col-span-9 sm:col-span-5">
                                            <label className={labelClasses}>Cidade *</label>
                                            <input type="text" className={inputClasses} value={cidade} onChange={(e) => setCidade(e.target.value)} />
                                        </div>
                                        <div className="col-span-3 sm:col-span-2">
                                            <label className={labelClasses}>UF *</label>
                                            <input 
                                                type="text" 
                                                maxLength={2}
                                                placeholder="UF"
                                                className={`${inputClasses.replace('p-4', 'px-1 py-4')} text-center uppercase`} 
                                                value={estado} 
                                                onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))} 
                                            />
                                        </div>
                                    </div>

                                    {/* SUBSTITUIÇÃO DO COMPLEMENTO POR QUADRA E LOTE */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>Quadra *</label>
                                            <input 
                                                type="text" 
                                                placeholder="Qd..." 
                                                className={inputClasses} 
                                                value={quadra} 
                                                onChange={(e) => setQuadra(e.target.value)} 
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Lote *</label>
                                            <input 
                                                type="text" 
                                                placeholder="Lt..." 
                                                className={inputClasses} 
                                                value={lote} 
                                                onChange={(e) => setLote(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/20 flex items-start gap-4 transition-colors">
                                    <CheckCircle2 className="text-red-600 dark:text-red-400 shrink-0" />
                                    <p className="text-sm text-red-800 dark:text-red-300 font-medium transition-colors">Você escolheu retirar no balcão. Avisaremos assim que estiver pronto!</p>
                                </div>
                            )}
                        </div>

                        {/* ... Restante do código (Pagamento, Resumo, etc) permanece igual ... */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3 transition-colors">
                                <CreditCard className="text-red-600 dark:text-red-500" /> Pagamento
                            </h2>
                            <select 
                                className={`${inputClasses} cursor-pointer`}
                                value={payment} 
                                onChange={(e) => setPayment(Number(e.target.value))}
                            >
                                <option value="">Selecione como deseja pagar</option>
                                {paymentMethods.map((method) => (
                                    <option key={method.id} value={method.id}>{method.nomeFormaPagamento}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 tracking-tight transition-colors">Resumo do Pedido</h2>
                            <div className="space-y-4 mb-8">
                                {cart.map((item) => (
                                    <div key={item.cartItemId} className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                                        <img src={item.product.image || `https://picsum.photos/seed/${item.product.id}/200`} className="w-16 h-16 object-cover rounded-2xl" alt={item.product.nomeProduto} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate transition-colors">{item.product.nomeProduto}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.selectedSubProducts && item.selectedSubProducts.length > 0 ? (
                                                    item.selectedSubProducts.map(op => (
                                                        <span key={op.id} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">+ {op.nome}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest italic transition-colors">Sem adicionais</span>
                                                )}
                                            </div>
                                            {item.observation && (
                                                <div className="mt-1 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg border border-red-100 dark:border-red-900/20">
                                                    <MessageSquareMore size={10} className="text-red-500" />
                                                    <p className="text-[9px] font-bold text-red-700 dark:text-red-400 truncate">{item.observation}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                                                    <button onClick={() => onDecrease(item.cartItemId)} className="text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition"><ChevronDown size={14} /></button>
                                                    <span className="text-xs font-black dark:text-slate-200">{item.quantity}</span>
                                                    <button onClick={() => onIncrease(item.cartItemId)} className="text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition"><ChevronUp size={14} /></button>
                                                </div>
                                                <button onClick={() => setItemToEdit(item)} className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest hover:underline transition-colors">Editar</button>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 transition-colors">R$ {(item.unitPriceWithSubProducts * item.quantity).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6 space-y-2">
                                <label className={labelClasses}>Observações do Pedido (Instruções Adicionais)</label>
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/20 dark:text-slate-100 transition-all min-h-[80px] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    placeholder="Ex: Tocar campainha, deixar na portaria, troco para 50 reais..."
                                    value={observacaoGeral}
                                    onChange={(e) => setObservacaoGeral(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6 transition-colors">
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-sm transition-colors">
                                    <span>Subtotal</span>
                                    <span>R$ {totalProdutos.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {!retiradaLocal && (
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-sm transition-colors">
                                        <span>Taxa de Entrega</span>
                                        <span>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-50 dark:border-slate-800/50 mt-2 transition-colors">
                                    <span className="text-lg font-black transition-colors">Total</span>
                                    <span className="text-3xl font-black text-red-600 dark:text-red-400 transition-colors">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || cart.length === 0}
                                className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] mt-8 transition-all flex items-center justify-center gap-3
                                    ${isSubmitting || cart.length === 0 ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-100 dark:shadow-none active:scale-[0.98]'}
                                `}
                            >
                                {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Processando...</> : 'Enviar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {itemToEdit && (
                <OptionsModal
                    product={itemToEdit.product}
                    initialItem={itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    onSave={(prod, subOpts, qty, price, obs) => {
                        onUpdateItem(itemToEdit.cartItemId, { product: prod, selectedSubProducts: subOpts, quantity: qty, unitPriceWithSubProducts: price, observation: obs });
                        setItemToEdit(null);
                    }}
                />
            )}
        </div>
    );
}