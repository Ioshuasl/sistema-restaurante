
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Header from '../../../components/Public/Header';
import CartDrawer from '../../../components/Public/CartDrawer';
import OptionsModal from '../../../components/Public/OptionsModal';
import { getMenu } from '../../../services/menuService';
import { getConfig } from '../../../services/configService';
import { type Menu, type Produto, type CartItem, type SubProduto, type Config, type HorarioDia } from '../../../types/interfaces-types';
import { Loader2, WifiOff, SearchX, Plus, ChevronRight, Info, Clock, AlertCircle } from 'lucide-react';

interface CardapioProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    isDarkMode: boolean;
    toggleTheme: () => void;
    onCheckout: () => void;
}

export default function Cardapio({ cart, setCart, isDarkMode, toggleTheme, onCheckout }: CardapioProps) {
    const [menuData, setMenuData] = useState<Menu[]>([]);
    const [config, setConfig] = useState<Config | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [menuLayout, setMenuLayout] = useState<'modern' | 'compact' | 'minimalist'>('modern');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

    // Lógica de Estabelecimento Aberto
    const isStoreOpen = useMemo(() => {
        if (!config?.horariosFuncionamento || config.horariosFuncionamento.length === 0) return true;
        
        const agora = new Date();
        const diaSemana = agora.getDay(); // 0-6
        const horaMinuto = agora.getHours() * 60 + agora.getMinutes();
        
        const configHoje = config.horariosFuncionamento.find(h => h.dia === diaSemana);
        
        if (!configHoje || !configHoje.aberto) return false;
        
        const [hIni, mIni] = configHoje.inicio.split(':').map(Number);
        const [hFim, mFim] = configHoje.fim.split(':').map(Number);
        
        const inicioMinutos = hIni * 60 + mIni;
        const fimMinutos = hFim * 60 + mFim;

        // Caso o horário de fechamento seja após a meia-noite (ex: 18:00 às 02:00)
        if (fimMinutos < inicioMinutos) {
            return horaMinuto >= inicioMinutos || horaMinuto <= fimMinutos;
        }
        
        return horaMinuto >= inicioMinutos && horaMinuto <= fimMinutos;
    }, [config]);

    const fetchData = async () => {
        try {
            const [menu, configData] = await Promise.all([
                getMenu(),
                getConfig()
            ]);

            const normalizedMenu = menu.map((cat: any) => ({
                ...cat,
                Produtos: cat.Produtos || cat.produtos || []
            }));
            
            setMenuData(normalizedMenu);
            setConfig(configData);
            if (configData?.menuLayout) setMenuLayout(configData.menuLayout);
            setIsOffline(false);
        } catch (err: any) {
            console.error('Erro ao carregar cardápio', err);
            setIsOffline(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const scrollToCategory = (id: number) => {
        const element = document.getElementById(`cat-${id}`);
        if (element) {
            const offset = 140;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const filteredMenu = useMemo(() => {
        return menuData.map(category => ({
            ...category,
            Produtos: category.Produtos.filter(p =>
                p.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(cat => cat.Produtos.length > 0);
    }, [searchTerm, menuData]);

    const cartTotal = useMemo(() => 
        cart.reduce((sum, item) => sum + item.unitPriceWithSubProducts * item.quantity, 0),
    [cart]);

    const addToCart = useCallback((
        product: Produto,
        selectedSubProducts: SubProduto[],
        quantity: number,
        unitPriceWithSubProducts: number,
        observation?: string
    ) => {
        if (!isStoreOpen) return;

        setCart(prev => {
            const subProductIds = selectedSubProducts.map(op => op.id).sort().join('-');
            const cartItemId = `${product.id}-${subProductIds}-${observation || ''}`;
            const existing = prev.find(item => item.cartItemId === cartItemId);

            if (existing) {
                return prev.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { 
                cartItemId, 
                product, 
                quantity, 
                selectedSubProducts, 
                unitPriceWithSubProducts,
                observation
            }];
        });
        setIsCartOpen(true);
        setIsOptionsModalOpen(false);
    }, [setCart, isStoreOpen]);

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev => 
            prev.map(item => 
                item.cartItemId === cartItemId 
                    ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    const handleProductClick = (product: Produto) => {
        if (!isStoreOpen) return;
        const hasOptions = (product.gruposOpcoes && product.gruposOpcoes.length > 0);
        if (hasOptions) {
            setSelectedProduct(product);
            setIsOptionsModalOpen(true);
        } else {
            addToCart(product, [], 1, Number(product.valorProduto));
        }
    };

    const borderRadiusClass = config?.borderRadius === '9999px' ? 'rounded-full' : 'rounded-[var(--app-border-radius)]';

    const renderProductCard = (product: Produto) => {
        if (menuLayout === 'compact') {
            return (
                <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className={`group bg-white dark:bg-slate-900 p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 cursor-pointer border border-slate-100 dark:border-slate-800 ${borderRadiusClass} ${!isStoreOpen ? 'grayscale' : ''}`}
                >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={product.nomeProduto} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{product.nomeProduto}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">{product.descricao}</p>
                        <span className="text-sm font-black text-[var(--primary-color)]">R$ {Number(product.valorProduto).toFixed(2).replace('.', ',')}</span>
                    </div>
                    {isStoreOpen && (
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[var(--primary-color)] group-hover:text-white transition-all">
                            <Plus size={16} />
                        </div>
                    )}
                </div>
            );
        }

        if (menuLayout === 'minimalist') {
            return (
                <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className={`group py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 -mx-2 rounded-xl transition-all ${!isStoreOpen ? 'opacity-50' : ''}`}
                >
                    <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-[var(--primary-color)] transition-colors">{product.nomeProduto}</h4>
                            <div className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-700 mb-1" />
                            <span className="text-base font-black dark:text-slate-100">R$ {Number(product.valorProduto).toFixed(2).replace('.', ',')}</span>
                        </div>
                        {product.descricao && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">{product.descricao}</p>}
                    </div>
                </div>
            );
        }

        return (
            <div key={product.id} className={`group bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-xl transition-all flex flex-col border border-slate-100 dark:border-slate-800 ${borderRadiusClass} ${!isStoreOpen ? 'grayscale' : ''}`}>
                <div className="relative mb-4 overflow-hidden aspect-[5/4] rounded-2xl">
                    <img src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={product.nomeProduto} />
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">{product.nomeProduto}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-8">{product.descricao}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">R$ {Number(product.valorProduto).toFixed(2).replace('.', ',')}</span>
                    {isStoreOpen && (
                        <button 
                            onClick={() => handleProductClick(product)} 
                            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary-color)] text-slate-900 dark:text-slate-100 hover:text-white rounded-xl flex items-center justify-center transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full animate-spin" style={{ borderTopColor: config?.primaryColor || '#dc2626' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config?.primaryColor || '#dc2626' }}></div>
                    </div>
                </div>
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Carregando Sabores</p>
            </div>
        );
    }

    const dynamicStyles = { 
        fontFamily: config?.fontFamily === 'serif' ? 'serif' : config?.fontFamily === 'mono' ? 'monospace' : config?.fontFamily === 'poppins' ? 'Poppins, sans-serif' : 'Inter, sans-serif',
        '--primary-color': config?.primaryColor || '#dc2626',
        '--primary-color-light': `${config?.primaryColor || '#dc2626'}1a`,
        '--app-border-radius': config?.borderRadius || '1rem'
    } as React.CSSProperties;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20 sm:pb-8" style={dynamicStyles}>
            
            {isOffline && (
                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center flex items-center justify-center gap-2 sticky top-0 z-[60]">
                    <WifiOff size={14} /> Modo Offline - Dados locais sendo exibidos
                </div>
            )}

            {!isStoreOpen && (
                <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-[60] shadow-lg">
                    <AlertCircle size={14} /> Estamos fechados no momento. Volte em breve para fazer seu pedido!
                </div>
            )}
            
            <Header 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
                onOpenCart={() => setIsCartOpen(true)}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                isOpen={isStoreOpen}
            />

            <nav className="sticky top-16 sm:top-20 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 overflow-x-auto hide-scrollbar">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex gap-4">
                    {menuData.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => scrollToCategory(cat.id)}
                            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-slate-400 hover:text-[var(--primary-color)] transition-colors px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-transparent hover:border-[var(--primary-color)]/20"
                        >
                            {cat.nomeCategoriaProduto}
                        </button>
                    ))}
                </div>
            </nav>

            {config?.showBanner && config.bannerImage && (
                <div className="w-full h-40 sm:h-56 overflow-hidden relative border-b border-slate-200 dark:border-slate-800">
                    <img src={config.bannerImage} className="w-full h-full object-cover" alt="Ofertas Especiais" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>Destaque do Dia</span>
                            <h2 className="text-2xl font-black mt-2">Confira nossas ofertas!</h2>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
                {filteredMenu.length > 0 ? (
                    filteredMenu.map(category => (
                        <section key={category.id} id={`cat-${category.id}`} className="mb-12 scroll-mt-40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }} />
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">{category.nomeCategoriaProduto}</h3>
                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase ml-auto">{category.Produtos.length} Itens</span>
                            </div>
                            <div className={`
                                ${menuLayout === 'modern' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' : ''}
                                ${menuLayout === 'compact' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : ''}
                                ${menuLayout === 'minimalist' ? 'grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2' : ''}
                            `}>
                                {category.Produtos.map(product => renderProductCard(product))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                            <SearchX size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Nenhum item encontrado</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">Tente buscar por termos diferentes ou confira outras categorias.</p>
                        <button onClick={() => setSearchTerm('')} className="mt-6 text-[10px] font-black uppercase tracking-widest hover:underline" style={{ color: 'var(--primary-color)' }}>Ver todo o cardápio</button>
                    </div>
                )}
            </main>

            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cart={cart} 
                onIncrement={(id) => updateQuantity(id, 1)} 
                onDecrement={(id) => updateQuantity(id, -1)} 
                total={cartTotal} 
                onCheckout={onCheckout} 
                isDisabled={!isStoreOpen}
            />
            
            {isOptionsModalOpen && selectedProduct && (
                <OptionsModal 
                    product={selectedProduct} 
                    onClose={() => setIsOptionsModalOpen(false)} 
                    onSave={addToCart} 
                />
            )}

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                :root {
                    --primary-color: ${config?.primaryColor || '#dc2626'};
                    --primary-color-light: ${config?.primaryColor || '#dc2626'}1a;
                    --app-border-radius: ${config?.borderRadius || '1rem'};
                }
            `}</style>
        </div>
    );
}