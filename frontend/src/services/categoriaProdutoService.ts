
import api from './api';
import { type CategoriaProduto, type CreateCategoriaProdutoPayload, type UpdateCategoriaProdutoPayload } from '../types/interfaces-types';

export const createCategoriaProduto = async (payload: CreateCategoriaProdutoPayload): Promise<CategoriaProduto> => {
  const response = await api.post('/categoriaProduto', payload);
  return response.data;
};

export const getAllCategoriasProdutos = async (): Promise<CategoriaProduto[]> => {
  const response = await api.get('/categoriaProduto');
  return response.data;
};

export const getCategoriaProdutoById = async (id: number): Promise<CategoriaProduto> => {
  const response = await api.get(`/categoriaProduto/${id}`);
  return response.data;
};

export const updateCategoriaProduto = async (id: number, payload: UpdateCategoriaProdutoPayload): Promise<CategoriaProduto> => {
  const response = await api.put(`/categoriaProduto/${id}`, payload);
  return response.data;
};

export const deleteCategoriaProduto = async (id: number): Promise<void> => {
  await api.delete(`/categoriaProduto/${id}`);
};
