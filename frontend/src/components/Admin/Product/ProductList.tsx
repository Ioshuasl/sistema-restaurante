import React from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { type Produto } from '../../../types/interfaces-types';
import { normalizeImageUrl } from '../../../utils/normalizeImageUrl';

interface ProductListProps {
  produtos: Produto[];
  categoriaNomeById: Map<number, string>;
  onEdit: (product: Produto) => void;
  onDelete: (product: Produto) => void;
  onToggleAtivo: (id: number) => void;
}

const TIPO_BADGE: Record<string, string> = {
  dia: 'Almoço',
  noite: 'Jantar',
  ambos: 'Ambos',
};

const ProductList: React.FC<ProductListProps> = ({
  produtos,
  categoriaNomeById,
  onEdit,
  onDelete,
  onToggleAtivo,
}) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[860px]">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Produto
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Categoria
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">
              Cardápio
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">
              Preço
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-center">
              Status
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {produtos.map((produto) => (
            <tr
              key={produto.id}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    <img
                      src={
                        normalizeImageUrl(produto.image) ||
                        `https://picsum.photos/seed/${produto.id}/100`
                      }
                      className="w-full h-full object-cover"
                      alt={produto.nomeProduto}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {produto.nomeProduto}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase">
                      ID: {produto.id}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 truncate block max-w-[180px]">
                  {categoriaNomeById.get(produto.categoriaProduto_id) || '—'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {TIPO_BADGE[produto.tipoMenu || 'ambos']}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                  R${' '}
                  {Number(produto.valorProduto).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAtivo(produto.id);
                    }}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all border ${
                      produto.isAtivo
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-500 dark:border-rose-800'
                    }`}
                  >
                    {produto.isAtivo ? (
                      <>
                        <ToggleRight size={14} /> Ativo
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={14} /> Inativo
                      </>
                    )}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    aria-label={`Editar ${produto.nomeProduto}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(produto);
                    }}
                    className="cursor-pointer p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir ${produto.nomeProduto}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(produto);
                    }}
                    className="cursor-pointer p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
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
