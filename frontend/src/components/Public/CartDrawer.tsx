
import React from 'react';
import { X, ShoppingBag, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';
import { type CartItem } from '../../types/interfaces-types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onIncrement: (id: string) => void;
    onDecrement: (id: string) => void;
    total: number;
    onCheckout?: () => void;
    isDisabled?: boolean;
}

export default function CartDrawer({ isOpen, onClose, cart, onIncrement, onDecrement, total, onCheckout, isDisabled = false }: CartDrawerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md animate-slide-in">
                    <div className="h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-l-[2rem] overflow-hidden transition-colors border-l border-transparent dark:border-slate-800">
                        <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ backgroundColor: 'var(--primary-color-light, rgba(220, 38, 38, 0.1))', color: 'var(--primary-color, #dc2626)' }}
                                >
                                    <ShoppingBag size={22} />
                                </div>
                                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 transition-colors">Seu Pedido</h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 transition-colors">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                    <ShoppingBag size={48} className="text-slate-400 dark:text-slate-600" />
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Carrinho Vazio</p>
                                    <button onClick={onClose} className="font-bold text-sm" style={{ color: 'var(--primary-color, #dc2626)' }}>Voltar ao cardápio</button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.cartItemId} className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                                        <img src={item.product.image} alt={item.product.nomeProduto} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate transition-colors">{item.product.nomeProduto}</h3>
                                            <div className="mt-1 space-y-0.5">
                                                {item.selectedSubProducts?.map(op => (
                                                    <p key={op.id} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase leading-none transition-colors">+ {op.nome}</p>
                                                ))}
                                            </div>
                                            <p className="mt-2 font-black transition-colors" style={{ color: 'var(--primary-color, #dc2626)' }}>
                                                R$ {(item.unitPriceWithSubProducts * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                                            <button onClick={() => !isDisabled && onIncrement(item.cartItemId)} className="p-1 hover:text-[var(--primary-color)] transition dark:text-slate-400"><Plus size={14}/></button>
                                            <span className="text-xs font-bold px-2 py-0.5 border-y border-slate-100 dark:border-slate-700 dark:text-slate-200">{item.quantity}</span>
                                            <button onClick={() => !isDisabled && onDecrement(item.cartItemId)} className="p-1 hover:text-[var(--primary-color)] transition dark:text-slate-400"><Minus size={14}/></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
                            {isDisabled && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-3 mb-2 animate-pulse">
                                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                                    <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-tight">Estamos fechados no momento. Não é possível finalizar pedidos agora.</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-slate-900 dark:text-slate-100">
                                <span className="text-lg font-extrabold transition-colors">Total</span>
                                <span className="text-2xl font-black transition-colors" style={{ color: 'var(--primary-color, #dc2626)' }}>
                                    R$ {total.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <button
                                onClick={onCheckout}
                                disabled={cart.length === 0 || isDisabled}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all
                                    ${cart.length > 0 && !isDisabled ? 'text-white shadow-xl' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}
                                `}
                                style={{ 
                                    backgroundColor: (cart.length > 0 && !isDisabled) ? 'var(--primary-color, #dc2626)' : '',
                                    borderRadius: 'var(--app-border-radius, 1rem)'
                                }}
                            >
                                {isDisabled ? 'Loja Fechada' : 'Ir para Checkout'}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}