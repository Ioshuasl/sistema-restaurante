
import api from './api';
import { type Config, type UpdateConfigPayload } from '../types/interfaces-types';

export const getConfig = async (): Promise<Config> => {
  const response = await api.get('/config');
  return response.data;
};

export const updateConfig = async (payload: UpdateConfigPayload): Promise<Config> => {
    const response = await api.put('/config', payload);
    return response.data;
};
