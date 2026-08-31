
import api from './api';
import { type SubProduto, type CreateSubProdutoPayload, type UpdateSubProdutoPayload } from '../types/interfaces-types';

export const createSubProduto = async (payload: CreateSubProdutoPayload): Promise<SubProduto> => {
  const response = await api.post('/subproduto', payload);
  return response.data;
};

export const getAllSubProdutos = async (): Promise<SubProduto[]> => {
  const response = await api.get('/subproduto');
  return response.data.rows;
};

export const getSubProdutoById = async (id: number): Promise<SubProduto> => {
  const response = await api.get(`/subproduto/${id}`);
  return response.data;
};

export const updateSubProduto = async (id: number, payload: UpdateSubProdutoPayload): Promise<SubProduto> => {
  const response = await api.put(`/subproduto/${id}`, payload);
  return response.data;
};

export const deleteSubProduto = async (id: number): Promise<void> => {
  await api.delete(`/subproduto/${id}`);
};
