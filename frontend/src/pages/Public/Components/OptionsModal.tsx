
import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, MessageSquareText } from 'lucide-react';
import { type Produto, type SubProduto, type CartItem } from '../../../types';

interface OptionsModalProps {
    product: Produto;
    initialItem?: CartItem;
    onClose: () => void;
    onSave: (
        product: Produto,
        selectedSubProducts: SubProduto[],
        quantity: number,
        unitPriceWithSubProducts: number,
        observation?: string
    ) => void;
}

export default function OptionsModal({ product, initialItem, onClose, onSave }: OptionsModalProps) {
    const [quantity, setQuantity] = useState(initialItem?.quantity || 1);
    const [selectedOptions, setSelectedOptions] = useState<SubProduto[]>(initialItem?.selectedSubProducts || []);
    const [observation, setObservation] = useState(initialItem?.observation || '');

    const groups = useMemo(() => {
        const rawGroups = product.gruposOpcoes || [];
        return rawGroups.map((g: any) => ({
            id: g.id,
            nomeGrupo: g.nomeGrupo,
            minEscolhas: g.minEscolhas || 0,
            maxEscolhas: g.maxEscolhas || 1,
            opcoes: g.opcoes || []
        }));
    }, [product]);

    const handleToggleOption = (group: any, item: any) => {
        const subProduct: SubProduto = {
            id: item.id,
            nome: item.nomeSubProduto,
            valorAdicional: Number(item.valorAdicional || 0),
            grupoOpcao_id: group.id
        };

        const isSelected = selectedOptions.some(opt => opt.id === item.id);
        const countInGroup = selectedOptions.filter(opt => opt.grupoOpcao_id === group.id).length;

        if (isSelected) {
            setSelectedOptions(prev => prev.filter(opt => opt.id !== item.id));
        } else {
            if (countInGroup < group.maxEscolhas) {
                setSelectedOptions(prev => [...prev, subProduct]);
            } else if (group.maxEscolhas === 1) {
                setSelectedOptions(prev => [
                    ...prev.filter(opt => opt.grupoOpcao_id !== group.id),
                    subProduct
                ]);
            }
        }
    };

    const optionsTotal = selectedOptions.reduce((acc, opt) => acc + Number(opt.valorAdicional), 0);
    const unitPrice = Number(product.valorProduto) + optionsTotal;

    const isValid = groups.every(group => {
        const count = selectedOptions.filter(opt => opt.grupoOpcao_id === group.id).length;
        return count >= group.minEscolhas && count <= group.maxEscolhas;
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col transition-colors duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors">Personalizar Pedido</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{product.nomeProduto}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-slate-900 custom-scrollbar transition-colors">
                    
                    {/* Header do Produto: Imagem e Descrição */}
                    <div className="space-y-4">
                        {product.image && (
                            <div className="w-full aspect-[16/9] rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                                <img 
                                    src={product.image} 
                                    alt={product.nomeProduto} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        )}
                        <div className="px-2">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{product.nomeProduto}</h3>
                            {product.descricao && (
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                    {product.descricao}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />

                    {groups.length > 0 && groups.map(group => (
                        <div key={group.id} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">{group.nomeGrupo}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest transition-colors">
                                        Escolha {group.minEscolhas === group.maxEscolhas ? group.minEscolhas : `${group.minEscolhas} a ${group.maxEscolhas}`}
                                    </p>
                                </div>
                                {selectedOptions.filter(o => o.grupoOpcao_id === group.id).length >= group.minEscolhas && (
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black px-2 py-1 rounded-lg transition-colors">OK</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {group.opcoes.map((item: any) => {
                                    const isSelected = selectedOptions.some(opt => opt.id === item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleToggleOption(group, item)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'bg-[var(--primary-color-light)] border-[var(--primary-color)]/30' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                                        >
                                            <div className="text-left">
                                                <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-[var(--primary-color)]' : 'text-slate-700 dark:text-slate-200'}`}>{item.nomeSubProduto}</p>
                                                {Number(item.valorAdicional) > 0 && <p className="text-xs text-slate-400 font-bold transition-colors">+ R$ {Number(item.valorAdicional).toFixed(2).replace('.', ',')}</p>}
                                            </div>
                                            {isSelected ? (
                                                <div 
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                                                    style={{ backgroundColor: 'var(--primary-color)' }}
                                                >
                                                    <Check size={14} />
                                                </div>
                                            ) : (
                                                <Plus size={18} className="text-slate-300 transition-colors" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 px-2 text-slate-800 dark:text-slate-100">
                            <MessageSquareText size={18} style={{ color: 'var(--primary-color)' }} />
                            <h3 className="font-bold transition-colors">Alguma observação?</h3>
                        </div>
                        <textarea
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-[var(--primary-color)]/10 dark:text-slate-100 transition-all min-h-[100px] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                            placeholder="Ex: Tirar cebola, maionese à parte, ponto da carne..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:text-[var(--primary-color)] transition-colors dark:text-slate-400"><Minus size={18}/></button>
                            <span className="font-black text-slate-800 dark:text-slate-100 min-w-[20px] text-center transition-colors">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="p-1 hover:text-[var(--primary-color)] transition-colors dark:text-slate-400"><Plus size={18}/></button>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase transition-colors">Subtotal</p>
                            <p className="text-2xl font-black transition-colors" style={{ color: 'var(--primary-color)' }}>R$ {(unitPrice * quantity).toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                    <button
                        disabled={!isValid}
                        onClick={() => onSave(product, selectedOptions, quantity, unitPrice, observation)}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${isValid ? 'text-white shadow-xl hover:opacity-90 active:scale-[0.98]' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                        style={{ 
                            backgroundColor: isValid ? 'var(--primary-color)' : '',
                            borderRadius: 'var(--app-border-radius, 1rem)'
                        }}
                    >
                        {initialItem ? 'Atualizar Item' : 'Adicionar ao Pedido'}
                    </button>
                </div>
            </div>
        </div>
    );
}