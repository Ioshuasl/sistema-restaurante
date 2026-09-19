import type { Produto, SubProduto, CategoriaProduto, TipoMenu } from './product';
import type { PeriodosCardapio } from './config';

export interface Menu extends CategoriaProduto {
  Produtos: Produto[];
}

export interface MenuMeta {
  tipoSolicitado: 'dia' | 'noite';
  tipoAtivo: 'dia' | 'noite' | null;
  pedindoHabilitado: boolean;
  periodosCardapio: PeriodosCardapio;
}

export interface MenuResponse {
  categorias: Menu[];
  meta: MenuMeta;
}

export type CartItem = {
  cartItemId: string;
  product: Produto;
  quantity: number;
  selectedSubProducts: SubProduto[];
  unitPriceWithSubProducts: number;
  observation?: string;
};

export type { TipoMenu };