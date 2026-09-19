
export type TipoMenu = 'dia' | 'noite' | 'ambos';

export interface CategoriaProduto {
  id: number;
  nomeCategoriaProduto: string;
  tipoMenu?: TipoMenu;
  createdAt: string;
  updatedAt: string;
  Produtos?: Produto[];
}

export interface CreateCategoriaProdutoPayload {
  nomeCategoriaProduto: string;
  tipoMenu?: TipoMenu;
}

export interface UpdateCategoriaProdutoPayload {
  nomeCategoriaProduto?: string;
  tipoMenu?: TipoMenu;
}

export type SubProduto = {
  id: number;
  nome: string;
  valorAdicional: number;
  grupoOpcao_id?: number;
};

export interface IItemOpcao {
  id: number;
  nomeSubProduto: string;
  valorAdicional: string | number;
  isAtivo: boolean;
  grupoOpcao_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGrupoOpcao {
  id: number;
  nomeGrupo: string;
  minEscolhas: number;
  maxEscolhas: number;
  produto_id: number;
  createdAt: string;
  updatedAt: string;
  opcoes: IItemOpcao[];
}

export interface Produto {
  id: number;
  nomeProduto: string;
  valorProduto: string | number;
  descricao?: string;
  image: string;
  isAtivo: boolean;
  tipoMenu?: TipoMenu;
  categoriaProduto_id: number;
  isPromo?: boolean;
  createdAt: string;
  updatedAt: string;
  gruposOpcoes?: IGrupoOpcao[];
}

export interface OpcaoPayload {
  id?: number;
  nomeSubProduto: string;
  valorAdicional: number;
  isAtivo: boolean;
}

export interface GrupoOpcaoPayload {
  id?: number;
  nomeGrupo: string;
  minEscolhas: number;
  maxEscolhas: number;
  opcoes: OpcaoPayload[];
}

export interface CreateProdutoPayload {
  nomeProduto: string;
  valorProduto: number;
  image?: string;
  descricao?: string;
  isAtivo?: boolean;
  tipoMenu?: TipoMenu;
  categoriaProduto_id: number;
  gruposOpcoes?: GrupoOpcaoPayload[];
}

export interface UpdateProdutoPayload {
  nomeProduto?: string;
  valorProduto?: number;
  image?: string;
  descricao?: string;
  isAtivo?: boolean;
  tipoMenu?: TipoMenu;
  categoriaProduto_id?: number;
  gruposOpcoes?: GrupoOpcaoPayload[];
}

export interface CreateSubProdutoPayload {
  nomeSubProduto: string;
  valorAdicional: number;
  grupoOpcao_id: number;
  isAtivo?: boolean;
}

export interface UpdateSubProdutoPayload {
  nomeSubProduto?: string;
  valorAdicional?: number;
  isAtivo?: boolean;
}
