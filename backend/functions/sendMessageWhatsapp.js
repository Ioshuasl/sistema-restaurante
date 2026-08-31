import axios from "axios";
import {
  randomBetween,
  resolveWhatsappHumanizedConfig,
  sendTypingPresence,
  sleep,
  typingDurationMs,
} from "./whatsappHumanized.js";

/**
 * Envia mensagens via Evolution API com ritmo humanizado (leitura, lotes, jitter, “digitando”).
 *
 * @param {string} url
 * @param {string} instanceName
 * @param {string} apikey
 * @param {string} numero
 * @param {string[]} mensagens
 * @param {number | Record<string, number | boolean> | null | undefined} humanizedInput
 *        Número = piso do intervalo entre mensagens (comportamento legado, ex.: 2000).
 *        Objeto = sobrescreve opções (mesmas chaves de getDefaultHumanizedWhatsappConfig).
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
    return;
  }

  const endpoint = `${String(url).replace(/\/$/, "")}/message/sendText/${instanceName}`;
  const cfg = resolveWhatsappHumanizedConfig(humanizedInput);

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

      await axios.post(
        endpoint,
        {
          number: numero,
          text: message,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: apikey,
          },
        }
      );

      if (cfg.postSendJitterMsMax > 0) {
        await sleep(randomBetween(0, cfg.postSendJitterMsMax));
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar a mensagem ${i + 1}:`, error.response?.data || error.message);
    }
  }
}
