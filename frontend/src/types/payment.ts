
export interface FormaPagamento {
  id: number;
  nomeFormaPagamento: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormaPagamentoPayload {
  nomeFormaPagamento: string;
}

export interface UpdateFormaPagamentoPayload {
  nomeFormaPagamento: string;
}
