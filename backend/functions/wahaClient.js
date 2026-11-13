import axios from "axios";

/**
 * Cliente mínimo da WAHA (WhatsApp HTTP API).
 * Variáveis: WAHA_API_URL (ex.: https://waha.coligfamego.com) e WAHA_API_KEY (header X-Api-Key).
 */

const baseUrl = () => String(process.env.WAHA_API_URL || "").replace(/\/$/, "");

export const wahaConfigured = () => Boolean(baseUrl() && process.env.WAHA_API_KEY);

export async function wahaRequest(method, path, { data, params, timeout = 30000, headers = {} } = {}) {
  if (!wahaConfigured()) {
    throw new Error("WAHA_API_URL / WAHA_API_KEY não configurados.");
  }
  const response = await axios({
    method,
    url: `${baseUrl()}${path}`,
    data,
    params,
    timeout,
    headers: { "X-Api-Key": process.env.WAHA_API_KEY, "Content-Type": "application/json", ...headers },
  });
  return response.data;
}

/** Aceita "5562999999999" ou um JID completo (@c.us / @lid) e devolve o chatId da WAHA. */
export function toChatId(numero) {
  const s = String(numero);
  if (s.includes("@")) return s;
  return `${s.replace(/\D/g, "")}@c.us`;
}

export const sendText = (session, numero, text, timeout) =>
  wahaRequest("post", "/api/sendText", {
    data: { session, chatId: toChatId(numero), text },
    timeout,
  });

export const startTyping = (session, numero) =>
  wahaRequest("post", "/api/startTyping", { data: { session, chatId: toChatId(numero) }, timeout: 10000 });

export const stopTyping = (session, numero) =>
  wahaRequest("post", "/api/stopTyping", { data: { session, chatId: toChatId(numero) }, timeout: 10000 });

export const getSession = (session) =>
  wahaRequest("get", `/api/sessions/${encodeURIComponent(session)}`, { timeout: 15000 });

export const startSession = (session) =>
  wahaRequest("post", `/api/sessions/${encodeURIComponent(session)}/start`, { timeout: 30000 });

export const logoutSession = (session) =>
  wahaRequest("post", `/api/sessions/${encodeURIComponent(session)}/logout`, { timeout: 30000 });

/** QR como data URI (png) ou null se a sessão não estiver aguardando leitura. */
export async function getQrDataUri(session) {
  try {
    // Sem "Accept: application/json" a WAHA devolve a imagem binária em vez do JSON {mimetype, data}.
    const qr = await wahaRequest("get", `/api/${encodeURIComponent(session)}/auth/qr`, {
      timeout: 15000,
      headers: { Accept: "application/json" },
    });
    if (!qr?.data) return null;
    return `data:${qr.mimetype || "image/png"};base64,${qr.data}`;
  } catch (error) {
    if (error.response?.status === 422 || error.response?.status === 404) return null;
    throw error;
  }
}

/** Resolve um "<id>@lid" para o telefone ("5562...@c.us"); null se a WAHA não souber. */
export async function resolveLid(session, lid) {
  try {
    const id = String(lid).replace(/@lid$/, "");
    const res = await wahaRequest("get", `/api/${encodeURIComponent(session)}/lids/${encodeURIComponent(id)}`, {
      timeout: 10000,
    });
    return typeof res?.pn === "string" ? res.pn : null;
  } catch {
    return null;
  }
}
