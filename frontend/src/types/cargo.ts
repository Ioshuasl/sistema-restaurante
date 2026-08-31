
export interface Cargo {
  id: number;
  nome: string;
  descricao: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCargoPayload {
  nome: string;
  descricao: string;
  admin: boolean;
}

export interface UpdateCargoPayload {
  nome?: string;
  descricao?: string;
  admin?: boolean;
}
