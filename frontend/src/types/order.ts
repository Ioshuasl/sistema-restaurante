
import { type FormaPagamento } from './payment';

export type situacaoPedido = 'preparando' | 'entrega' | 'finalizado' | 'cancelado';

export interface ISubProdutoPedidoPayload {
  subProdutoId: number;
  quantidade: number;
}

export interface ProdutoPedidoPayload {
  produtoId: number;
  quantidade: number;
  subProdutos?: ISubProdutoPedidoPayload[];
  observacaoItem?: string;
}

export interface CreatePedidoPayload {
  produtosPedido: ProdutoPedidoPayload[];
  formaPagamento_id: number;
  situacaoPedido: string;
  isRetiradaEstabelecimento: boolean;
  taxaEntrega: number;
  nomeCliente: string;
  telefoneCliente: string;
  cepCliente: string;
  tipoLogadouroCliente: string;
  logadouroCliente: string;
  numeroCliente: string;
  quadraCliente: string;
  loteCliente: string;
  bairroCliente: string;
  cidadeCliente: string;
  estadoCliente: string;
  observacao?: string;
}

export interface UpdatePedidoPayload {
  situacaoPedido: situacaoPedido;
}

export interface Pedido {
  taxaEntrega: boolean;
  id: number;
  numeroDiario?: number;
  formaPagamento_id: number;
  isRetiradaEstabelecimento: boolean;
  situacaoPedido: situacaoPedido;
  nomeCliente: string;
  telefoneCliente: string;
  cepCliente: string;
  tipoLogadouroCliente: string;
  logadouroCliente: string;
  numeroCliente: string;
  quadraCliente: string;
  loteCliente: string;
  bairroCliente: string;
  cidadeCliente: string;
  estadoCliente: string;
  valorTotalPedido: string | number;
  observacao?: string;
  tempoEspera?: string | null; // Adicionado campo de tempo de espera
  createdAt: string;
  updatedAt: string;
  FormaPagamento?: FormaPagamento;
  itensPedido?: ItemPedido[];
}

export interface ItemPedido {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: string | number;
  observacaoItem?: string;
  produto?: {
    nomeProduto: string;
  };
  subItensPedido?: SubItemPedido[];
}

export interface SubItemPedido {
  id: number;
  itemPedidoId: number;
  subProdutoId: number;
  quantidade: number;
  precoAdicional: string | number;
  subproduto?: {
    nomeSubProduto: string;
  };
}
