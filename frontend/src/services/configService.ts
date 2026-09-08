import api from './api';
import { type Config, type UpdateConfigPayload } from '../types/interfaces-types';

export const getConfig = async (): Promise<Config> => {
  const response = await api.get('/config', {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    params: { _ts: Date.now() },
  });
  return response.data;
};

const CONFIG_UPDATE_KEYS: (keyof UpdateConfigPayload)[] = [
  'cnpj',
  'razaoSocial',
  'nomeFantasia',
  'cep',
  'tipoLogadouro',
  'logadouro',
  'numero',
  'quadra',
  'lote',
  'bairro',
  'cidade',
  'estado',
  'telefone',
  'email',
  'taxaEntrega',
  'menuLayout',
  'primaryColor',
  'fontFamily',
  'borderRadius',
  'showBanner',
  'bannerImage',
  'evolutionInstanceName',
  'urlAgenteImpressao',
  'nomeImpressora',
  'horariosFuncionamento',
  'tipoChavePix',
  'chavePix',
];

export const updateConfig = async (payload: UpdateConfigPayload): Promise<Config> => {
  const body: UpdateConfigPayload = {};
  for (const key of CONFIG_UPDATE_KEYS) {
    if (payload[key] !== undefined) {
      (body as any)[key] = payload[key];
    }
  }
  const response = await api.put('/config', body, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  return response.data;
};
