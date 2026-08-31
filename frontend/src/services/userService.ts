
import api from './api';
import { type User, type LoginPayload, type AuthResponse, type CreateUserPayload, type UpdateUserPayload } from '../types/interfaces-types';

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post('/login', payload);
  return response.data;
};

export const createFirstUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await api.post('/first-user', payload);
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await api.post('/user', payload);
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/user');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<User> => {
  const response = await api.put(`/user/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/user/${id}`);
};
