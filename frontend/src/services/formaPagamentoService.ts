
import api from './api';
import { type FormaPagamento, type CreateFormaPagamentoPayload, type UpdateFormaPagamentoPayload } from '../types/interfaces-types';

export const createFormaPagamento = async (payload: CreateFormaPagamentoPayload): Promise<FormaPagamento> => {
  const response = await api.post('/formaPagamento', payload);
  return response.data;
};

export const getAllFormasPagamento = async (): Promise<FormaPagamento[]> => {
  const response = await api.get('/formaPagamento');
  return response.data;
};

export const updateFormaPagamento = async (id: number, payload: UpdateFormaPagamentoPayload): Promise<FormaPagamento> => {
  const response = await api.put(`/formaPagamento/${id}`, payload);
  return response.data;
};

export const deleteFormaPagamento = async (id: number): Promise<void> => {
  await api.delete(`/formaPagamento/${id}`);
};
