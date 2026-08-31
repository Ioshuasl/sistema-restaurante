
import type { Cargo } from './cargo';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    nome: string;
    username: string;
    cargo: string;
    admin: boolean;
  };
  token: string;
}

export interface User {
  id: number;
  nome: string;
  cargo_id: number;
  username: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  Cargo: Cargo;
}

export interface CreateUserPayload {
  nome: string;
  cargo_id: number;
  username: string;
  password?: string;
}

export interface UpdateUserPayload {
  nome?: string;
  cargo_id?: number;
  username?: string;
  password?: string;
}
