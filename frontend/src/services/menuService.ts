import api from './api';
import { type Menu, type MenuResponse } from '../types/interfaces-types';

export type MenuTipoQuery = 'auto' | 'dia' | 'noite';

function sortCategoriasByOrdem<T extends { id: number; ordem?: number }>(categorias: T[]): T[] {
  return [...categorias].sort((a, b) => {
    const oa = Number.isFinite(a.ordem) ? Number(a.ordem) : a.id;
    const ob = Number.isFinite(b.ordem) ? Number(b.ordem) : b.id;
    return oa - ob || a.id - b.id;
  });
}

export const getMenu = async (tipo: MenuTipoQuery = 'auto'): Promise<MenuResponse> => {
  const response = await api.get('/menu', {
    params: { tipo },
    headers: { 'Cache-Control': 'no-cache' },
  });
  const data = response.data;

  // Compatibilidade com resposta antiga (array puro)
  if (Array.isArray(data)) {
    return {
      categorias: sortCategoriasByOrdem(data as Menu[]),
      meta: {
        tipoSolicitado: tipo === 'noite' ? 'noite' : 'dia',
        tipoAtivo: null,
        pedindoHabilitado: false,
        periodosCardapio: {
          dia: { inicio: '11:00', fim: '15:00' },
          noite: { inicio: '18:00', fim: '23:00' },
        },
      },
    };
  }

  const parsed = data as MenuResponse;
  return {
    ...parsed,
    categorias: sortCategoriasByOrdem(parsed.categorias || []),
  };
};
