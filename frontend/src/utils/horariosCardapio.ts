import type { HorarioDia, PeriodoMenuConfig, PeriodosCardapio } from '../types/config';

export const DEFAULT_PERIODOS_CARDAPIO: PeriodosCardapio = {
  dia: { inicio: '11:00', fim: '15:00' },
  noite: { inicio: '18:00', fim: '23:00' },
};

export const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const DEFAULT_PERIODO_DIA: PeriodoMenuConfig = {
  ativo: true,
  inicio: DEFAULT_PERIODOS_CARDAPIO.dia.inicio,
  fim: DEFAULT_PERIODOS_CARDAPIO.dia.fim,
};

const DEFAULT_PERIODO_NOITE: PeriodoMenuConfig = {
  ativo: true,
  inicio: DEFAULT_PERIODOS_CARDAPIO.noite.inicio,
  fim: DEFAULT_PERIODOS_CARDAPIO.noite.fim,
};

function asPeriodo(
  value: Partial<PeriodoMenuConfig> | undefined,
  fallback: PeriodoMenuConfig
): PeriodoMenuConfig {
  return {
    ativo: value?.ativo ?? fallback.ativo,
    inicio: value?.inicio || fallback.inicio,
    fim: value?.fim || fallback.fim,
  };
}

/** Normaliza um dia (legado ou novo) para o formato com Almoço/Jantar. */
export function normalizeHorarioDia(
  raw: Partial<HorarioDia> & { dia: number },
  defaults: PeriodosCardapio = DEFAULT_PERIODOS_CARDAPIO
): HorarioDia {
  const aberto = raw.aberto ?? true;
  const periodos = raw.periodos;

  const almoco = asPeriodo(periodos?.dia, {
    ativo: aberto,
    inicio: defaults.dia.inicio,
    fim: defaults.dia.fim,
  });
  const jantar = asPeriodo(periodos?.noite, {
    ativo: aberto,
    inicio: defaults.noite.inicio,
    fim: defaults.noite.fim,
  });

  // Legado: um único início/fim sem periodos → usa como janela geral nos dois
  if (!periodos && raw.inicio && raw.fim) {
    // Mantém defaults de cardápio; aberto/fechado vem do legado
  }

  const inicio = almoco.ativo ? almoco.inicio : jantar.inicio;
  const fim = jantar.ativo ? jantar.fim : almoco.fim;

  return {
    dia: raw.dia,
    aberto,
    inicio: raw.inicio || inicio || defaults.dia.inicio,
    fim: raw.fim || fim || defaults.noite.fim,
    periodos: {
      dia: almoco,
      noite: jantar,
    },
  };
}

export function createDefaultHorarios(
  defaults: PeriodosCardapio = DEFAULT_PERIODOS_CARDAPIO
): HorarioDia[] {
  return Array.from({ length: 7 }, (_, dia) =>
    normalizeHorarioDia(
      {
        dia,
        aberto: true,
        periodos: {
          dia: { ativo: true, ...defaults.dia },
          noite: { ativo: true, ...defaults.noite },
        },
      },
      defaults
    )
  );
}

export function normalizeHorariosList(
  list: HorarioDia[] | undefined | null,
  defaults: PeriodosCardapio = DEFAULT_PERIODOS_CARDAPIO
): HorarioDia[] {
  if (!Array.isArray(list) || list.length === 0) {
    return createDefaultHorarios(defaults);
  }

  const byDia = new Map<number, HorarioDia>();
  list.forEach((item) => {
    if (item && typeof item.dia === 'number') {
      byDia.set(item.dia, normalizeHorarioDia(item, defaults));
    }
  });

  return Array.from({ length: 7 }, (_, dia) => {
    return byDia.get(dia) || createDefaultHorarios(defaults)[dia];
  });
}

/** Recalcula inicio/fim legados a partir dos períodos ativos. */
export function syncLegacyWindow(day: HorarioDia): HorarioDia {
  const ativos = [
    day.periodos?.dia?.ativo ? day.periodos.dia : null,
    day.periodos?.noite?.ativo ? day.periodos.noite : null,
  ].filter(Boolean) as PeriodoMenuConfig[];

  if (ativos.length === 0) {
    return { ...day, aberto: false };
  }

  return {
    ...day,
    aberto: day.aberto,
    inicio: ativos[0].inicio,
    fim: ativos[ativos.length - 1].fim,
  };
}

export function parseHoraParaMinutos(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function estaNoIntervalo(agoraMinutos: number, inicio: string, fim: string): boolean {
  const inicioMin = parseHoraParaMinutos(inicio);
  const fimMin = parseHoraParaMinutos(fim);
  if (inicioMin == null || fimMin == null) return false;
  if (inicioMin === fimMin) return true;
  if (inicioMin < fimMin) {
    return agoraMinutos >= inicioMin && agoraMinutos < fimMin;
  }
  return agoraMinutos >= inicioMin || agoraMinutos < fimMin;
}

export function diaEstaAtendendo(day: HorarioDia, agora = new Date()): boolean {
  if (!day.aberto) return false;
  const min = agora.getHours() * 60 + agora.getMinutes();
  const p = day.periodos;
  if (!p) {
    return estaNoIntervalo(min, day.inicio || '00:00', day.fim || '23:59');
  }
  const noAlmoco = p.dia.ativo && estaNoIntervalo(min, p.dia.inicio, p.dia.fim);
  const noJantar = p.noite.ativo && estaNoIntervalo(min, p.noite.inicio, p.noite.fim);
  return noAlmoco || noJantar;
}

export function formatDuration(inicio: string, fim: string): string {
  const a = parseHoraParaMinutos(inicio);
  const b = parseHoraParaMinutos(fim);
  if (a == null || b == null) return '—';
  let diff = b - a;
  if (diff < 0) diff += 1440;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}
