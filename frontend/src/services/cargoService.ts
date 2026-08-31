
import api from './api';
import { type Cargo, type CreateCargoPayload, type UpdateCargoPayload } from '../types/interfaces-types';

export const createFirstCargo = async (payload: CreateCargoPayload): Promise<Cargo> => {
  const response = await api.post('/cargo/first', payload);
  return response.data;
};

export const createCargo = async (payload: CreateCargoPayload): Promise<Cargo> => {
  const response = await api.post('/cargo', payload);
  return response.data;
};

export const getCargos = async (): Promise<Cargo[]> => {
  const response = await api.get('/cargo');
  return response.data.rows;
};

export const getCargoById = async (id: number): Promise<Cargo> => {
  const response = await api.get(`/cargo/${id}`);
  return response.data;
};

export const updateCargo = async (id: number, payload: UpdateCargoPayload): Promise<Cargo> => {
  const response = await api.put(`/cargo/${id}`, payload);
  return response.data;
};

export const deleteCargo = async (id: number): Promise<void> => {
  await api.delete(`/cargo/${id}`);
};
