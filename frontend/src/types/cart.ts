
import type { Produto, SubProduto, CategoriaProduto } from './product';

export interface Menu extends CategoriaProduto {
  Produtos: Produto[];
}

export type CartItem = {
  cartItemId: string;
  product: Produto;
  quantity: number;
  selectedSubProducts: SubProduto[];
  unitPriceWithSubProducts: number;
  observation?: string;
};
