
import api from './api';
import { type Menu, type MenuResponse } from '../types/interfaces-types';

export type MenuTipoQuery = 'auto' | 'dia' | 'noite';

export const getMenu = async (tipo: MenuTipoQuery = 'auto'): Promise<MenuResponse> => {
  const response = await api.get('/menu', { params: { tipo } });
  const data = response.data;

  // Compatibilidade com resposta antiga (array puro)
  if (Array.isArray(data)) {
    return {
      categorias: data as Menu[],
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

  return data as MenuResponse;
};
