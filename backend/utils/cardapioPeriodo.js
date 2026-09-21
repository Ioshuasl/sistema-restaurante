/** @typedef {'dia' | 'noite'} TipoMenuAtivo */
/** @typedef {'dia' | 'noite' | 'ambos'} TipoMenu */

export const DEFAULT_PERIODOS_CARDAPIO = {
    dia: { inicio: '11:00', fim: '15:00' },
    noite: { inicio: '18:00', fim: '23:00' },
};

/**
 * @param {string} hhmm
 * @returns {number | null}
 */
export function parseHoraParaMinutos(hhmm) {
    if (!hhmm || typeof hhmm !== 'string') return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) return null;
    return h * 60 + m;
}

/**
 * @param {number} agoraMinutos
 * @param {string} inicio
 * @param {string} fim
 */
export function estaNoIntervalo(agoraMinutos, inicio, fim) {
    const inicioMin = parseHoraParaMinutos(inicio);
    const fimMin = parseHoraParaMinutos(fim);
    if (inicioMin == null || fimMin == null) return false;

    if (inicioMin === fimMin) return true;
    if (inicioMin < fimMin) {
        return agoraMinutos >= inicioMin && agoraMinutos < fimMin;
    }
    return agoraMinutos >= inicioMin || agoraMinutos < fimMin;
}

/**
 * Monta o default semanal com Almoço/Jantar por dia.
 * @param {{ dia?: { inicio: string, fim: string }, noite?: { inicio: string, fim: string } }} [periodos]
 */
export function createDefaultHorariosFuncionamento(periodos = DEFAULT_PERIODOS_CARDAPIO) {
    const p = {
        dia: periodos?.dia ?? DEFAULT_PERIODOS_CARDAPIO.dia,
        noite: periodos?.noite ?? DEFAULT_PERIODOS_CARDAPIO.noite,
    };

    return Array.from({ length: 7 }, (_, dia) => ({
        dia,
        aberto: true,
        inicio: p.dia.inicio,
        fim: p.noite.fim,
        periodos: {
            dia: { ativo: true, inicio: p.dia.inicio, fim: p.dia.fim },
            noite: { ativo: true, inicio: p.noite.inicio, fim: p.noite.fim },
        },
    }));
}

/**
 * Normaliza um dia legado → formato com periodos.dia / periodos.noite.
 * @param {any} raw
 * @param {{ dia: { inicio: string, fim: string }, noite: { inicio: string, fim: string } }} defaults
 */
export function normalizeHorarioDia(raw, defaults = DEFAULT_PERIODOS_CARDAPIO) {
    if (!raw || typeof raw.dia !== 'number') return null;
    const aberto = raw.aberto !== false;
    const periodosRaw = raw.periodos || {};

    const almoco = {
        ativo: periodosRaw.dia?.ativo ?? aberto,
        inicio: periodosRaw.dia?.inicio || defaults.dia.inicio,
        fim: periodosRaw.dia?.fim || defaults.dia.fim,
    };
    const jantar = {
        ativo: periodosRaw.noite?.ativo ?? aberto,
        inicio: periodosRaw.noite?.inicio || defaults.noite.inicio,
        fim: periodosRaw.noite?.fim || defaults.noite.fim,
    };

    return {
        dia: raw.dia,
        aberto,
        inicio: raw.inicio || almoco.inicio,
        fim: raw.fim || jantar.fim,
        periodos: { dia: almoco, noite: jantar },
    };
}

/**
 * Resolve os períodos efetivos do cardápio para o instante informado
 * (respeita o dia da semana e toggles de Almoço/Jantar).
 *
 * @param {{
 *   horariosFuncionamento?: any[],
 *   periodosCardapio?: { dia?: { inicio: string, fim: string }, noite?: { inicio: string, fim: string } }
 * } | null | undefined} config
 * @param {Date} [agora]
 */
export function resolvePeriodosParaAgora(config, agora = new Date()) {
    const defaults = {
        dia: config?.periodosCardapio?.dia ?? DEFAULT_PERIODOS_CARDAPIO.dia,
        noite: config?.periodosCardapio?.noite ?? DEFAULT_PERIODOS_CARDAPIO.noite,
    };

    const diaSemana = agora.getDay();
    const lista = Array.isArray(config?.horariosFuncionamento)
        ? config.horariosFuncionamento
        : [];
    const rawHoje = lista.find((h) => h?.dia === diaSemana);
    const hoje = normalizeHorarioDia(rawHoje || { dia: diaSemana, aberto: true }, defaults);

    if (!hoje || !hoje.aberto) {
        return {
            dia: { ...defaults.dia, ativo: false },
            noite: { ...defaults.noite, ativo: false },
        };
    }

    return {
        dia: {
            ativo: !!hoje.periodos.dia.ativo,
            inicio: hoje.periodos.dia.inicio,
            fim: hoje.periodos.dia.fim,
        },
        noite: {
            ativo: !!hoje.periodos.noite.ativo,
            inicio: hoje.periodos.noite.inicio,
            fim: hoje.periodos.noite.fim,
        },
    };
}

/**
 * Resolve o cardápio ativo no instante informado.
 * Aceita períodos já resolvidos (com ou sem `ativo`) OU o objeto config completo.
 *
 * @param {any} periodosOuConfig
 * @param {Date} [agora]
 * @returns {TipoMenuAtivo | null}
 */
export function resolverTipoMenuAtivo(periodosOuConfig, agora = new Date()) {
    const pareceConfig =
        periodosOuConfig &&
        (Array.isArray(periodosOuConfig.horariosFuncionamento) ||
            periodosOuConfig.periodosCardapio != null) &&
        !periodosOuConfig.dia?.inicio;

    const p = pareceConfig
        ? resolvePeriodosParaAgora(periodosOuConfig, agora)
        : {
              dia: {
                  ativo: periodosOuConfig?.dia?.ativo !== false,
                  inicio:
                      periodosOuConfig?.dia?.inicio ?? DEFAULT_PERIODOS_CARDAPIO.dia.inicio,
                  fim: periodosOuConfig?.dia?.fim ?? DEFAULT_PERIODOS_CARDAPIO.dia.fim,
              },
              noite: {
                  ativo: periodosOuConfig?.noite?.ativo !== false,
                  inicio:
                      periodosOuConfig?.noite?.inicio ?? DEFAULT_PERIODOS_CARDAPIO.noite.inicio,
                  fim: periodosOuConfig?.noite?.fim ?? DEFAULT_PERIODOS_CARDAPIO.noite.fim,
              },
          };

    const agoraMinutos = agora.getHours() * 60 + agora.getMinutes();

    const noDia =
        p.dia.ativo !== false && estaNoIntervalo(agoraMinutos, p.dia.inicio, p.dia.fim);
    const naNoite =
        p.noite.ativo !== false && estaNoIntervalo(agoraMinutos, p.noite.inicio, p.noite.fim);

    if (noDia) return 'dia';
    if (naNoite) return 'noite';
    return null;
}

/**
 * Estabelecimento aceita pedido agora (qualquer cardápio ativo no dia).
 * @param {any[]} horarios
 * @param {Date} [agora]
 */
export function estabelecimentoAbertoAgora(horarios, agora = new Date()) {
    if (!Array.isArray(horarios) || horarios.length === 0) return true;
    const diaSemana = agora.getDay();
    const raw = horarios.find((h) => h?.dia === diaSemana);
    const hoje = normalizeHorarioDia(raw || { dia: diaSemana, aberto: false });
    if (!hoje?.aberto) return false;

    const min = agora.getHours() * 60 + agora.getMinutes();
    const p = hoje.periodos;
    return (
        (p.dia.ativo && estaNoIntervalo(min, p.dia.inicio, p.dia.fim)) ||
        (p.noite.ativo && estaNoIntervalo(min, p.noite.inicio, p.noite.fim))
    );
}

/**
 * @param {TipoMenu | null | undefined} tipoMenu
 * @param {TipoMenuAtivo} tipoSolicitado
 */
export function pertenceAoMenu(tipoMenu, tipoSolicitado) {
    const t = tipoMenu || 'ambos';
    return t === 'ambos' || t === tipoSolicitado;
}

/**
 * @param {TipoMenu | null | undefined} tipoMenu
 * @param {TipoMenuAtivo | null} tipoAtivo
 */
export function podePedirNoPeriodo(tipoMenu, tipoAtivo) {
    if (!tipoAtivo) return false;
    return pertenceAoMenu(tipoMenu, tipoAtivo);
}
