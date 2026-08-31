
import api from './api';
import { type Pedido, type CreatePedidoPayload, type UpdatePedidoPayload } from '../types/interfaces-types';

export interface PedidoQueryParams {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  activeOnly?: boolean;
  includeItems?: boolean;
}

export interface PedidoListResponse {
  rows: Pedido[];
  count: number;
}

export interface PedidoPollResponse {
  rows: Pedido[];
  serverTime: string;
}

export const createPedido = async (payload: CreatePedidoPayload): Promise<Pedido> => {
  const response = await api.post('/pedido', payload);
  return response.data;
};

export const printPedido = async (id: number) => {
  const response = await api.post(`/pedido/${id}/print`);
  return response.data;
};

export const getPedidos = async (params: PedidoQueryParams = {}): Promise<PedidoListResponse> => {
  const response = await api.get('/pedido', { params });
  return response.data;
};

export const getAllPedidos = async (params: PedidoQueryParams = {}): Promise<Pedido[]> => {
  const response = await getPedidos(params);
  return response.rows;
};

export const getRecentPedidos = async (limit = 5): Promise<Pedido[]> => {
  const response = await api.get('/pedido/recent', { params: { limit } });
  return response.data;
};

export const pollPedidos = async (since: string): Promise<PedidoPollResponse> => {
  const response = await api.get('/pedido/poll', { params: { since } });
  return response.data;
};

export const getPedidoById = async (id: number): Promise<Pedido> => {
  const response = await api.get(`/pedido/${id}`);
  return response.data;
};

export const getPedidosByFormaPagamento = async (formaPagamentoId: number): Promise<Pedido[]> => {
  const response = await api.get(`/pedido/formaPagamento/${formaPagamentoId}`);
  return response.data;
};

export const updatePedido = async (id: number, payload: UpdatePedidoPayload): Promise<Pedido> => {
  const response = await api.put(`/pedido/${id}`, payload);
  return response.data;
};

export const updateTempoEspera = async (id: number, tempoEspera: string): Promise<Pedido> => {
  const response = await api.patch(`/pedido/${id}/tempo-espera`, { tempoEspera });
  return response.data;
};
