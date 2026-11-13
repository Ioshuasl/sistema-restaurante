import {
  randomBetween,
  resolveWhatsappHumanizedConfig,
  sleep,
  typingDurationMs,
} from "./whatsappHumanized.js";
import { checkExists, sendText, startTyping, stopTyping, wahaConfigured } from "./wahaClient.js";
import logger, { maskPhone } from "../utils/logger.js";
import WhatsappMensagemLog from "../models/whatsappMensagemLogModel.js";

const intEnv = (name, fallback) => {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) ? v : fallback;
};

/** Timeout de cada chamada à WAHA (uma sessão travada não pode pendurar o envio para sempre). */
const SEND_TIMEOUT_MS = () => intEnv("WHATSAPP_SEND_TIMEOUT_MS", 30000);
/** Tentativas por mensagem (1 + retries). */
const SEND_ATTEMPTS = () => Math.max(1, intEnv("WHATSAPP_SEND_ATTEMPTS", 4));
/** Conversas simultâneas (evita enfileirar 20 pedidos de uma vez na mesma sessão). */
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
  // Erro permanente do WhatsApp Web: repetir só prende uma vaga de envio e atrasa os outros clientes.
  if (JSON.stringify(error.response?.data ?? "").includes("No LID for user")) return false;
  const status = error.response?.status;
  if (!status) return true; // timeout / rede / socket
  return status === 408 || status === 429 || status >= 500;
}

/** Envia com retry; devolve o nº de tentativas usadas (e anexa em error.attempts quando falha). */
async function sendWithRetry(session, numero, text) {
  const attempts = SEND_ATTEMPTS();
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await sendText(session, numero, text, SEND_TIMEOUT_MS());
      return attempt;
    } catch (error) {
      lastError = error;
      error.attempts = attempt;
      if (attempt === attempts || !isRetryable(error)) break;
      const backoff = Math.min(60000, 3000 * 2 ** (attempt - 1)) + randomBetween(0, 1000);
      logger.warn(
        { event: "whatsapp.send.retry", to: maskPhone(numero), attempt, attempts, backoffMs: backoff, status: error.response?.status ?? error.code ?? error.message },
        "falha ao enviar mensagem; nova tentativa agendada"
      );
      await sleep(backoff);
    }
  }
  throw lastError;
}

/** Grava o resultado no banco sem nunca atrapalhar (nem atrasar) o envio. */
function registrarEnvio(dados) {
  WhatsappMensagemLog.create(dados).catch((err) =>
    logger.error({ event: "whatsapp.log.persist_failed", err: err.message }, "não foi possível gravar o log da mensagem")
  );
}

/**
 * Envia mensagens via WAHA com ritmo humanizado (leitura, lotes, jitter, “digitando”).
 *
 * - Serializa por destinatário e limita conversas simultâneas (WHATSAPP_MAX_CONCURRENCY).
 * - Timeout por chamada + retry com backoff em erros transitórios.
 * - Nunca lança: retorna { enviadas, falhas } para o chamador decidir o que fazer.
 *
 * @param {string} session Nome da sessão WAHA (ex.: "gssabores")
 * @param {string} numero Telefone com DDI ("5562...") ou JID completo
 * @param {string[]} mensagens
 * @param {number | Record<string, number | boolean> | null | undefined} humanizedInput
 *        Número = piso do intervalo entre mensagens (comportamento legado, ex.: 2000).
 *        Objeto = sobrescreve opções (mesmas chaves de getDefaultHumanizedWhatsappConfig).
 * @param {{ tipo?: string, pedidoId?: number | null }} [meta] Contexto gravado no log
 *        (tipo: confirmacao_pedido | status_pedido | tempo_espera | resposta_automatica).
 * @returns {Promise<{ enviadas: number, falhas: number }>}
 */
export async function sendMessageWhatsapp(session, numero, mensagens, humanizedInput, meta = {}) {
  const tipo = meta.tipo || "outro";
  const pedidoId = meta.pedidoId ?? null;

  if (!Array.isArray(mensagens) || mensagens.length === 0) {
    logger.error({ event: "whatsapp.send.invalid" }, "o parâmetro mensagens deve ser um array com pelo menos uma mensagem");
    return { enviadas: 0, falhas: 0 };
  }
  if (!wahaConfigured() || !session || !numero) {
    logger.error({ event: "whatsapp.send.misconfigured", session, tipo }, "WAHA_API_URL/WAHA_API_KEY, sessão ou número ausentes; envio abortado");
    mensagens.forEach((_, i) =>
      registrarEnvio({ sessao: session || "-", numero: String(numero || "-"), tipo, pedidoId, ordem: i, status: "falha", tentativas: 0, erro: "configuração ausente (WAHA/sessão/número)" })
    );
    return { enviadas: 0, falhas: mensagens.length };
  }

  return schedule(numero, async () => {
    const cfg = resolveWhatsappHumanizedConfig(humanizedInput);
    let enviadas = 0;
    let falhas = 0;

    // Resolve o telefone no WhatsApp uma vez por conversa. O chatId devolvido (muitas vezes "@lid")
    // evita o erro "No LID for user"; número inexistente falha na hora, sem gastar tentativas.
    let destino = numero;
    if (!String(numero).includes("@")) {
      try {
        const existe = await checkExists(session, numero);
        if (existe?.numberExists === false) {
          logger.error({ event: "whatsapp.send.not_on_whatsapp", to: maskPhone(numero), tipo, pedidoId, total: mensagens.length }, "número não está no WhatsApp; mensagens não enviadas");
          mensagens.forEach((_, i) =>
            registrarEnvio({ sessao: session, numero: String(numero), tipo, pedidoId, ordem: i, status: "falha", tentativas: 0, erro: "numero_nao_existe_no_whatsapp" })
          );
          return { enviadas: 0, falhas: mensagens.length };
        }
        if (existe?.chatId) destino = existe.chatId;
      } catch (error) {
        // Verificação é uma otimização: se falhar, tenta o envio normal com o número original.
        logger.warn({ event: "whatsapp.check_exists.failed", to: maskPhone(numero), status: error.response?.status, err: error.message }, "não foi possível verificar o número; usando o telefone direto");
      }
    }

    for (let i = 0; i < mensagens.length; i++) {
      const message = mensagens[i];
      const inicio = Date.now();

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
        let typing = false;
        if (cfg.useTypingPresence) {
          // "Digitando..." é cosmético: falha aqui nunca impede o envio.
          typing = await startTyping(session, destino).then(() => true, () => false);
        }
        await sleep(typingMs);
        if (typing) await stopTyping(session, destino).catch(() => {});

        const envioInicio = Date.now();
        const tentativas = await sendWithRetry(session, destino, message);
        enviadas++;
        const latenciaMs = Date.now() - envioInicio;
        logger.info({ event: "whatsapp.send.ok", to: maskPhone(numero), tipo, pedidoId, ordem: i, total: mensagens.length, tentativas, latenciaMs }, "mensagem enviada");
        registrarEnvio({ sessao: session, numero: String(numero), tipo, pedidoId, ordem: i, status: "enviada", tentativas, latenciaMs });

        if (cfg.postSendJitterMsMax > 0) {
          await sleep(randomBetween(0, cfg.postSendJitterMsMax));
        }
      } catch (error) {
        falhas++;
        const detalhe = error.response?.data ? JSON.stringify(error.response.data).slice(0, 500) : error.message;
        logger.error(
          { event: "whatsapp.send.failed", to: maskPhone(numero), tipo, pedidoId, ordem: i, total: mensagens.length, tentativas: error.attempts ?? 1, status: error.response?.status, detalhe, elapsedMs: Date.now() - inicio },
          "falha ao enviar mensagem"
        );
        registrarEnvio({ sessao: session, numero: String(numero), tipo, pedidoId, ordem: i, status: "falha", tentativas: error.attempts ?? 1, erro: String(detalhe).slice(0, 1000) });
      }
    }

    return { enviadas, falhas };
  });
}
