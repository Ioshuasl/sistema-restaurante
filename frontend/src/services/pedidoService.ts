
import api from './api';
import { type Pedido, type CreatePedidoPayload, type UpdatePedidoPayload } from '../types/interfaces-types';

export const createPedido = async (payload: CreatePedidoPayload): Promise<Pedido> => {
  const response = await api.post('/pedido', payload);
  return response.data;
};

export const printPedido = async (id: number) => {
  const response = await api.post(`/pedido/${id}/print`);
  return response.data;
};

export const getAllPedidos = async (): Promise<Pedido[]> => {
  const response = await api.get('/pedido');
  console.log(response.data);
  return response.data.rows;
};

export const countAllPedidos = async (): Promise<Pedido[]> => {
  const response = await api.get('/pedido/count');
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

/**
 * Atualiza o tempo de espera do pedido para notificação do cliente.
 */
export const updateTempoEspera = async (id: number, tempoEspera: string): Promise<Pedido> => {
  const response = await api.patch(`/pedido/${id}/tempo-espera`, { tempoEspera });
  return response.data;
};
