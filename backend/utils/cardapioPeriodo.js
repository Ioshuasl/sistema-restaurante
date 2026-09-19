/** @typedef {'dia' | 'noite'} TipoMenuAtivo */
/** @typedef {'dia' | 'noite' | 'ambos'} TipoMenu */

export const DEFAULT_PERIODOS_CARDAPIO = {
    dia: { inicio: '11:00', fim: '15:00' },
    noite: { inicio: '18:00', fim: '23:00' },
};

/**
 * Converte "HH:MM" em minutos desde meia-noite.
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
 * Verifica se `agoraMinutos` está no intervalo [inicio, fim).
 * Suporta intervalos que atravessam meia-noite (ex.: 22:00–02:00).
 * @param {number} agoraMinutos
 * @param {string} inicio
 * @param {string} fim
 */
export function estaNoIntervalo(agoraMinutos, inicio, fim) {
    const inicioMin = parseHoraParaMinutos(inicio);
    const fimMin = parseHoraParaMinutos(fim);
    if (inicioMin == null || fimMin == null) return false;

    if (inicioMin === fimMin) return true; // 24h
    if (inicioMin < fimMin) {
        return agoraMinutos >= inicioMin && agoraMinutos < fimMin;
    }
    // Overnight: ex. 18:00–02:00
    return agoraMinutos >= inicioMin || agoraMinutos < fimMin;
}

/**
 * Resolve o cardápio ativo no instante informado.
 * @param {{ dia?: { inicio: string, fim: string }, noite?: { inicio: string, fim: string } } | null | undefined} periodos
 * @param {Date} [agora]
 * @returns {TipoMenuAtivo | null}
 */
export function resolverTipoMenuAtivo(periodos, agora = new Date()) {
    const p = {
        dia: periodos?.dia ?? DEFAULT_PERIODOS_CARDAPIO.dia,
        noite: periodos?.noite ?? DEFAULT_PERIODOS_CARDAPIO.noite,
    };

    const agoraMinutos = agora.getHours() * 60 + agora.getMinutes();

    const noDia = estaNoIntervalo(agoraMinutos, p.dia.inicio, p.dia.fim);
    const naNoite = estaNoIntervalo(agoraMinutos, p.noite.inicio, p.noite.fim);

    // Preferência: se ambos (overlap mal configurado), prioriza dia
    if (noDia) return 'dia';
    if (naNoite) return 'noite';
    return null;
}

/**
 * Produto/categoria visível no cardápio solicitado.
 * @param {TipoMenu | null | undefined} tipoMenu
 * @param {TipoMenuAtivo} tipoSolicitado
 */
export function pertenceAoMenu(tipoMenu, tipoSolicitado) {
    const t = tipoMenu || 'ambos';
    return t === 'ambos' || t === tipoSolicitado;
}

/**
 * Item pode ser pedido agora (cardápio ativo).
 * @param {TipoMenu | null | undefined} tipoMenu
 * @param {TipoMenuAtivo | null} tipoAtivo
 */
export function podePedirNoPeriodo(tipoMenu, tipoAtivo) {
    if (!tipoAtivo) return false;
    return pertenceAoMenu(tipoMenu, tipoAtivo);
}
