
import React from 'react';
import { Edit2, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { type Produto } from '../../../types/interfaces-types';

interface ProductListProps {
  produtos: Produto[];
  onEdit: (product: Produto) => void;
  onDelete: (product: Produto) => void;
  onToggleAtivo: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ produtos, onEdit, onDelete, onToggleAtivo }) => {
  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <ImageIcon size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum produto cadastrado</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Produto</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">Preço</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">Status</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {produtos.map((produto) => (
            <tr key={produto.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    <img 
                        src={produto.image || `https://picsum.photos/seed/${produto.id}/100`} 
                        className="w-full h-full object-cover" 
                        alt={produto.nomeProduto} 
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{produto.nomeProduto}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase">ID: {produto.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                  R$ {Number(produto.valorProduto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleAtivo(produto.id); }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${
                        produto.isAtivo 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-800' 
                        : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-500 dark:border-rose-800'
                    }`}
                  >
                    {produto.isAtivo ? <><ToggleRight size={14} /> Ativo</> : <><ToggleLeft size={14} /> Inativo</>}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(produto); }}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(produto); }}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
