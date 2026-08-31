
import api from './api';
import { type Produto, type CreateProdutoPayload, type UpdateProdutoPayload } from '../types/interfaces-types';

export const createProduto = async (payload: CreateProdutoPayload): Promise<Produto> => {
  const response = await api.post('/produto', payload);
  return response.data;
};

export const getAllProdutos = async (): Promise<Produto[]> => {
  const response = await api.get('/produto');
  return response.data.rows;
};

export const getProdutoById = async (id: number): Promise<Produto> => {
  const response = await api.get(`/produto/${id}`);
  return response.data;
};

export const updateProduto = async (id: number, payload: UpdateProdutoPayload): Promise<Produto> => {
  const response = await api.put(`/produto/${id}`, payload);
  return response.data;
};

export const deleteProduto = async (id: number): Promise<void> => {
  await api.delete(`/produto/${id}`);
};

export const toggleProdutoAtivo = async (id: number): Promise<Produto> => {
  const response = await api.put(`/produto/${id}/toggle`);
  return response.data;
};
