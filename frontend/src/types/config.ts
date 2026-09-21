// types/config.ts

export interface PeriodoCardapio {
  inicio: string;
  fim: string;
}

export interface PeriodosCardapio {
  dia: PeriodoCardapio;
  noite: PeriodoCardapio;
}

/** Período de um cardápio (almoço ou jantar) em um dia da semana. */
export interface PeriodoMenuConfig {
  ativo: boolean;
  inicio: string;
  fim: string;
}

export interface PeriodosDoDia {
  dia: PeriodoMenuConfig;
  noite: PeriodoMenuConfig;
}

export interface HorarioDia {
  dia: number;
  /** Dia fechado por completo (nenhum cardápio aceita pedido). */
  aberto: boolean;
  /**
   * Janela legada (agregada). Mantida p/ compatibilidade;
   * a fonte de verdade é `periodos`.
   */
  inicio: string;
  fim: string;
  /** Horários de Almoço (dia) e Jantar (noite) neste dia. */
  periodos?: PeriodosDoDia;
}

export interface Config {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  tipoLogadouro: string;
  logadouro: string;
  numero: string;
  quadra: string;
  lote: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  taxaEntrega: number;
  menuLayout: 'modern' | 'compact' | 'minimalist';
  primaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'poppins';
  borderRadius: '0px' | '8px' | '16px' | '9999px';
  showBanner: boolean;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  evolutionInstanceName: string;
  urlAgenteImpressao: string;
  nomeImpressora: string;
  horariosFuncionamento?: HorarioDia[];
  /** Defaults / template; horários efetivos ficam em horariosFuncionamento[].periodos */
  periodosCardapio?: PeriodosCardapio;

  tipoChavePix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  chavePix?: string;
}

export interface UpdateConfigPayload {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cep?: string;
  tipoLogadouro?: string;
  logadouro?: string;
  numero?: string;
  quadra?: string;
  lote?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  taxaEntrega?: number;
  menuLayout?: 'modern' | 'compact' | 'minimalist';
  primaryColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'poppins';
  borderRadius?: '0px' | '8px' | '16px' | '9999px';
  showBanner?: boolean;
  bannerImage?: string;
  evolutionInstanceName?: string;
  urlAgenteImpressao?: string;
  nomeImpressora?: string;
  horariosFuncionamento?: HorarioDia[];
  periodosCardapio?: PeriodosCardapio;

  tipoChavePix?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  chavePix?: string;
}
