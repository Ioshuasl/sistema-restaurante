
import React from 'react';
import { Plus, Search, Menu as MenuIcon } from 'lucide-react';

interface MobilePreviewProps {
  data: any;
}

const MOCK_PRODUCTS = [
  { id: 1, nome: 'Burger Gourmet', desc: 'Pão brioche, blend 180g, queijo cheddar e bacon.', preco: '38,90', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { id: 2, nome: 'Batata Rústica', desc: 'Crocantes por fora, macias por dentro com alecrim.', preco: '22,00', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' }
];

export default function MobilePreview({ data }: MobilePreviewProps) {
  const radius = data.borderRadius === '9999px' ? '24px' : data.borderRadius;
  const fontFamily = data.fontFamily === 'serif' ? 'serif' : data.fontFamily === 'mono' ? 'monospace' : data.fontFamily === 'poppins' ? 'Poppins, sans-serif' : 'Inter, sans-serif';
  const primaryColor = data.primaryColor || '#dc2626';

  const renderProducts = () => {
    if (data.menuLayout === 'compact') {
      return MOCK_PRODUCTS.map(p => (
        <div 
          key={p.id} 
          className="bg-white dark:bg-slate-800 p-3 shadow-sm flex items-center gap-3 border border-transparent dark:border-slate-800 mb-2" 
          style={{ borderRadius: radius }}
        >
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
            <img src={p.img} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[9px] font-black dark:text-slate-100 truncate">{p.nome}</h5>
            <p className="text-[7px] text-slate-400 truncate">{p.desc}</p>
            <span className="text-[9px] font-black" style={{ color: primaryColor }}>R$ {p.preco}</span>
          </div>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
            <Plus size={12} />
          </div>
        </div>
      ));
    }

    if (data.menuLayout === 'minimalist') {
      return MOCK_PRODUCTS.map(p => (
        <div key={p.id} className="py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h5 className="text-[10px] font-bold dark:text-slate-100">{p.nome}</h5>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 line-clamp-1">{p.desc}</p>
          </div>
          <span className="text-[10px] font-black dark:text-slate-100 whitespace-nowrap">R$ {p.preco}</span>
        </div>
      ));
    }

    // Default: Modern
    return MOCK_PRODUCTS.map(p => (
      <div 
        key={p.id} 
        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm mb-4 overflow-hidden" 
        style={{ borderRadius: radius }}
      >
        <div className="h-24 w-full overflow-hidden">
          <img src={p.img} className="w-full h-full object-cover" />
        </div>
        <div className="p-3">
          <h5 className="text-[10px] font-black dark:text-slate-100">{p.nome}</h5>
          <p className="text-[8px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-2">{p.desc}</p>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black" style={{ color: primaryColor }}>R$ {p.preco}</span>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
              <Plus size={12} />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="lg:col-span-5 flex flex-col items-center justify-start pt-4 lg:pt-10 sticky top-0">
      {/* Moldura do Celular */}
      <div className="relative w-[280px] h-[560px] bg-slate-800 rounded-[3rem] p-3 shadow-2xl border-[6px] border-slate-900 overflow-hidden ring-4 ring-slate-200 dark:ring-slate-800">
        
        {/* Notch do iPhone */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[2rem] overflow-hidden flex flex-col relative transition-colors duration-300" style={{ fontFamily }}>
          
          {/* Header Simulado */}
          <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 transition-colors pt-4">
              <MenuIcon size={14} className="text-slate-400" />
              <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <Search size={10} className="text-slate-400" />
              </div>
          </div>

          {/* Banner Opcional */}
          {data.showBanner && data.bannerImage && (
            <div className="h-24 w-full overflow-hidden shrink-0 border-b border-slate-100 dark:border-slate-800">
              <img src={data.bannerImage} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Conteúdo do Cardápio */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Categorias Simuladas */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
                {['Burgers', 'Bebidas', 'Acompanhamentos'].map((cat, i) => (
                    <div 
                        key={cat} 
                        className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all border`}
                        style={{ 
                            backgroundColor: i === 0 ? primaryColor : 'transparent',
                            color: i === 0 ? '#fff' : '#94a3b8',
                            borderColor: i === 0 ? primaryColor : '#e2e8f0'
                        }}
                    >
                        {cat}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: primaryColor }} />
                <h6 className="text-[10px] font-black dark:text-slate-100 uppercase tracking-widest">Mais Pedidos</h6>
            </div>

            <div key={`${data.menuLayout}-${primaryColor}-${radius}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {renderProducts()}
            </div>
          </div>

          {/* Tab Bar / Footer de Carrinho */}
          <div className="h-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-3 shrink-0 transition-colors flex items-center">
            <div 
                className="w-full h-10 flex items-center justify-center text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95" 
                style={{ backgroundColor: primaryColor, borderRadius: radius }}
            >
                Ver Carrinho (2)
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visualização em Tempo Real</p>
        <div className="flex items-center gap-2 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            <span>{data.menuLayout}</span> • <span>{data.fontFamily}</span>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
