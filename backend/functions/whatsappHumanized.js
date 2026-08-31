import axios from 'axios';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function randomBetween(min, max) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

function intEnv(name, fallback) {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) ? v : fallback;
}

/** Defaults ajustáveis por variáveis de ambiente (prefixo WHATSAPP_*). */
export function getDefaultHumanizedWhatsappConfig() {
  return {
    readingMsMin: intEnv('WHATSAPP_READING_MS_MIN', 2000),
    readingMsMax: intEnv('WHATSAPP_READING_MS_MAX', 5500),
    betweenMsMin: intEnv('WHATSAPP_BETWEEN_MSG_MS_MIN', 2200),
    betweenMsMax: intEnv('WHATSAPP_BETWEEN_MSG_MS_MAX', 4800),
    typingMsPerChar: intEnv('WHATSAPP_TYPING_MS_PER_CHAR', 55),
    typingMsMin: intEnv('WHATSAPP_TYPING_MS_MIN', 800),
    typingMsMax: intEnv('WHATSAPP_TYPING_MS_MAX', 12000),
    batchSize: intEnv('WHATSAPP_BATCH_SIZE', 4),
    batchPauseMsMin: intEnv('WHATSAPP_BATCH_PAUSE_MS_MIN', 4000),
    batchPauseMsMax: intEnv('WHATSAPP_BATCH_PAUSE_MS_MAX', 9000),
    postSendJitterMsMax: intEnv('WHATSAPP_POST_SEND_JITTER_MS_MAX', 450),
    useTypingPresence: process.env.WHATSAPP_USE_TYPING_PRESENCE !== '0',
  };
}

/**
 * @param {number | Record<string, number | boolean> | null | undefined} input
 *        Número legado = piso para o intervalo entre mensagens (com jitter).
 *        Objeto = sobrescreve chaves do config.
 */
export function resolveWhatsappHumanizedConfig(input) {
  const cfg = getDefaultHumanizedWhatsappConfig();

  if (typeof input === 'number' && input > 0) {
    cfg.betweenMsMin = Math.max(cfg.betweenMsMin, Math.round(input * 0.9));
    cfg.betweenMsMax = Math.max(cfg.betweenMsMax, Math.round(input * 1.35));
  } else if (input && typeof input === 'object') {
    Object.assign(cfg, input);
  }

  return cfg;
}

/**
 * Estima tempo de "digitando" a partir do tamanho do texto.
 */
export function typingDurationMs(text, cfg) {
  const len = String(text ?? '').length;
  const raw = len * cfg.typingMsPerChar;
  return Math.min(cfg.typingMsMax, Math.max(cfg.typingMsMin, raw));
}

/**
 * POST /chat/sendPresence/{instance} (Evolution API v1/v2).
 * @returns {Promise<boolean>} true se a requisição completou (o tempo de “digitando” pode ser no servidor ou imediato).
 */
export async function sendTypingPresence(url, instanceName, apikey, numero, delayMs) {
  const base = String(url).replace(/\/$/, '');
  const endpoint = `${base}/chat/sendPresence/${instanceName}`;
  const delay = Math.min(60000, Math.max(500, Math.round(delayMs)));

  try {
    await axios.post(
      endpoint,
      {
        number: numero,
        options: {
          delay,
          presence: 'composing',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey,
        },
        timeout: delay + 15000,
      }
    );
    return true;
  } catch (err) {
    console.warn(
      '[whatsapp] sendPresence indisponível ou erro:',
      err.response?.status ?? err.message
    );
    return false;
  }
}
