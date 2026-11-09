import axios from "axios";
import {
  randomBetween,
  resolveWhatsappHumanizedConfig,
  sendTypingPresence,
  sleep,
  typingDurationMs,
} from "./whatsappHumanized.js";

const intEnv = (name, fallback) => {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) ? v : fallback;
};

/** Timeout de cada chamada à Evolution (antes não havia: uma sessão travada pendurava o envio para sempre). */
const SEND_TIMEOUT_MS = () => intEnv("WHATSAPP_SEND_TIMEOUT_MS", 30000);
/** Tentativas por mensagem (1 + retries). */
const SEND_ATTEMPTS = () => Math.max(1, intEnv("WHATSAPP_SEND_ATTEMPTS", 4));
/** Conversas simultâneas (evita enfileirar 20 pedidos de uma vez no mesmo socket Baileys). */
const MAX_CONCURRENCY = () => Math.max(1, intEnv("WHATSAPP_MAX_CONCURRENCY", 3));

// ---------------------------------------------------------------------------
// Controle de concorrência + ordem por destinatário
// ---------------------------------------------------------------------------
let active = 0;
const waiting = [];
const perNumberTail = new Map();

function acquire() {
  if (active < MAX_CONCURRENCY()) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) next(); // repassa o "slot" ao próximo da fila
  else active--;
}

/** Executa `task` respeitando: ordem por número + limite global de conversas simultâneas. */
function schedule(numero, task) {
  const key = String(numero);
  const prev = perNumberTail.get(key) || Promise.resolve();

  const run = prev
    .catch(() => {})
    .then(async () => {
      await acquire();
      try {
        return await task();
      } finally {
        release();
      }
    });

  const tail = run.catch(() => {});
  perNumberTail.set(key, tail);
  tail.then(() => {
    if (perNumberTail.get(key) === tail) perNumberTail.delete(key);
  });

  return run;
}

// ---------------------------------------------------------------------------
// POST com timeout + retry/backoff
// ---------------------------------------------------------------------------
function isRetryable(error) {
  const status = error.response?.status;
  if (!status) return true; // timeout / rede / socket
  return status === 408 || status === 429 || status >= 500;
}

async function postWithRetry(endpoint, body, apikey) {
  const attempts = SEND_ATTEMPTS();
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await axios.post(endpoint, body, {
        headers: { "Content-Type": "application/json", apikey },
        timeout: SEND_TIMEOUT_MS(),
      });
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !isRetryable(error)) break;
      const backoff = Math.min(60000, 3000 * 2 ** (attempt - 1)) + randomBetween(0, 1000);
      console.warn(
        `[whatsapp] falha ao enviar (tentativa ${attempt}/${attempts}): ` +
          `${error.response?.status ?? error.code ?? error.message}. Nova tentativa em ${backoff}ms`
      );
      await sleep(backoff);
    }
  }
  throw lastError;
}

/**
 * Envia mensagens via Evolution API com ritmo humanizado (leitura, lotes, jitter, “digitando”).
 *
 * - Serializa por destinatário e limita conversas simultâneas (WHATSAPP_MAX_CONCURRENCY).
 * - Timeout por chamada + retry com backoff em erros transitórios.
 * - Nunca lança: retorna { enviadas, falhas } para o chamador decidir o que fazer.
 *
 * @param {string} url
 * @param {string} instanceName
 * @param {string} apikey
 * @param {string} numero
 * @param {string[]} mensagens
 * @param {number | Record<string, number | boolean> | null | undefined} humanizedInput
 *        Número = piso do intervalo entre mensagens (comportamento legado, ex.: 2000).
 *        Objeto = sobrescreve opções (mesmas chaves de getDefaultHumanizedWhatsappConfig).
 * @returns {Promise<{ enviadas: number, falhas: number }>}
 */
export async function sendMessageWhatsapp(
  url,
  instanceName,
  apikey,
  numero,
  mensagens,
  humanizedInput
) {
  if (!Array.isArray(mensagens) || mensagens.length === 0) {
    console.error("O parâmetro 'mensagens' deve ser um array com pelo menos uma mensagem.");
    return { enviadas: 0, falhas: 0 };
  }
  if (!url || !apikey || !instanceName || !numero) {
    console.error("[whatsapp] parâmetros ausentes (url/apikey/instância/número); envio abortado.");
    return { enviadas: 0, falhas: mensagens.length };
  }

  return schedule(numero, async () => {
    const endpoint = `${String(url).replace(/\/$/, "")}/message/sendText/${instanceName}`;
    const cfg = resolveWhatsappHumanizedConfig(humanizedInput);
    let enviadas = 0;
    let falhas = 0;

    for (let i = 0; i < mensagens.length; i++) {
      const message = mensagens[i];

      try {
        if (i === 0) {
          await sleep(randomBetween(cfg.readingMsMin, cfg.readingMsMax));
        } else {
          await sleep(randomBetween(cfg.betweenMsMin, cfg.betweenMsMax));
          if (cfg.batchSize > 1 && i % cfg.batchSize === 0) {
            await sleep(randomBetween(cfg.batchPauseMsMin, cfg.batchPauseMsMax));
          }
        }

        const typingMs = typingDurationMs(message, cfg);
        const t0 = Date.now();
        if (cfg.useTypingPresence) {
          await sendTypingPresence(url, instanceName, apikey, numero, typingMs);
        }
        await sleep(Math.max(0, typingMs - (Date.now() - t0)));

        await postWithRetry(endpoint, { number: numero, text: message }, apikey);
        enviadas++;

        if (cfg.postSendJitterMsMax > 0) {
          await sleep(randomBetween(0, cfg.postSendJitterMsMax));
        }
      } catch (error) {
        falhas++;
        console.error(
          `❌ Erro ao enviar a mensagem ${i + 1}/${mensagens.length} para ${numero}:`,
          error.response?.data || error.message
        );
      }
    }

    return { enviadas, falhas };
  });
}
