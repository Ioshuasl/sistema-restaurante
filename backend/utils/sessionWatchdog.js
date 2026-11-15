import Config from "../models/configModels.js";
import { getSession, restartSession, wahaConfigured } from "../functions/wahaClient.js";
import logger from "./logger.js";
import axios from "axios";

/**
 * Vigia da sessão de WhatsApp (WAHA).
 *
 *  - consulta o estado da sessão a cada WHATSAPP_WATCHDOG_INTERVAL_SEC (padrão 60s);
 *  - registra cada mudança de estado (`whatsapp.session.state_change`);
 *  - se a sessão ficar fora de WORKING por WHATSAPP_ALERT_AFTER_SEC (padrão 180s), emite UM alerta
 *    (`whatsapp.alert`, e POST em WHATSAPP_ALERT_WEBHOOK_URL se definida) e lembretes a cada
 *    WHATSAPP_ALERT_REMIND_MIN (padrão 180 min); avisa também quando voltar;
 *  - sessão em FAILED é reiniciada automaticamente (no máximo WHATSAPP_AUTO_RESTART_MAX por incidente,
 *    com intervalo mínimo entre tentativas). STOPPED (parada de propósito) e SCAN_QR_CODE
 *    (aparelho desvinculado: precisa de QR) NÃO são reiniciadas.
 *
 * Nunca derruba a aplicação: qualquer erro aqui é apenas registrado.
 */

const num = (name, fallback) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export const watchdogConfig = () => ({
  intervalMs: num("WHATSAPP_WATCHDOG_INTERVAL_SEC", 60) * 1000,
  alertAfterMs: num("WHATSAPP_ALERT_AFTER_SEC", 180) * 1000,
  remindMs: num("WHATSAPP_ALERT_REMIND_MIN", 180) * 60 * 1000,
  autoRestart: process.env.WHATSAPP_AUTO_RESTART !== "false",
  maxRestarts: num("WHATSAPP_AUTO_RESTART_MAX", 2),
  restartCooldownMs: num("WHATSAPP_AUTO_RESTART_COOLDOWN_SEC", 300) * 1000,
  unreachableAfter: num("WHATSAPP_WATCHDOG_UNREACHABLE_AFTER", 3),
});

export const newState = () => ({
  lastStatus: null,
  downSince: null,
  alerted: false,
  lastAlertAt: null,
  restarts: 0,
  lastRestartAt: null,
  unreachable: 0,
  unreachableAlerted: false,
});

/**
 * Núcleo puro (sem I/O): recebe o estado anterior, uma observação e o relógio; muta o estado e
 * devolve a lista de ações (log | alert | restart) que o executor deve realizar.
 * @param {ReturnType<typeof newState>} st
 * @param {{ok: true, status: string, engineState?: string} | {ok: false, error?: string}} obs
 * @param {number} now ms
 * @param {ReturnType<typeof watchdogConfig>} cfg
 */
export function evaluate(st, obs, now, cfg) {
  const actions = [];

  if (!obs.ok) {
    st.unreachable += 1;
    if (st.unreachable >= cfg.unreachableAfter && !st.unreachableAlerted) {
      st.unreachableAlerted = true;
      actions.push({ type: "alert", kind: "waha_unreachable", error: obs.error });
    }
    return actions;
  }

  if (st.unreachableAlerted) actions.push({ type: "alert", kind: "waha_back" });
  st.unreachable = 0;
  st.unreachableAlerted = false;

  const { status, engineState } = obs;
  if (status !== st.lastStatus) {
    actions.push({ type: "log", event: "whatsapp.session.state_change", from: st.lastStatus, to: status, engineState });
    st.lastStatus = status;
  }

  if (status === "WORKING") {
    if (st.downSince !== null) {
      actions.push({ type: "alert", kind: "recovered", downMs: now - st.downSince, autoRestarted: st.restarts > 0 });
    }
    st.downSince = null;
    st.alerted = false;
    st.lastAlertAt = null;
    st.restarts = 0;
    st.lastRestartAt = null;
    return actions;
  }

  // Fora de WORKING
  if (st.downSince === null) st.downSince = now;
  const downMs = now - st.downSince;

  if (
    cfg.autoRestart &&
    status === "FAILED" &&
    st.restarts < cfg.maxRestarts &&
    (st.lastRestartAt === null || now - st.lastRestartAt >= cfg.restartCooldownMs)
  ) {
    st.restarts += 1;
    st.lastRestartAt = now;
    actions.push({ type: "restart", attempt: st.restarts, max: cfg.maxRestarts });
  }

  if (!st.alerted && downMs >= cfg.alertAfterMs) {
    st.alerted = true;
    st.lastAlertAt = now;
    actions.push({ type: "alert", kind: "down", status, engineState, downMs, restarts: st.restarts });
  } else if (st.alerted && now - st.lastAlertAt >= cfg.remindMs) {
    st.lastAlertAt = now;
    actions.push({ type: "alert", kind: "still_down", status, engineState, downMs, restarts: st.restarts });
  }

  return actions;
}

const minutes = (ms) => Math.max(1, Math.round(ms / 60000));

const HINTS = {
  FAILED: "A sessão falhou.",
  STOPPED: "A sessão está parada.",
  STARTING: "A sessão está iniciando.",
  SCAN_QR_CODE: "O aparelho está desvinculado ou nunca foi conectado: é preciso escanear o QR em Configurações → Mensageria → Conectar WhatsApp.",
  NOT_FOUND: "A sessão não existe no WAHA.",
};

export function buildAlertText(a, session) {
  switch (a.kind) {
    case "down":
    case "still_down": {
      const base = a.kind === "down" ? "⚠️ WhatsApp do restaurante FORA DO AR" : "⚠️ WhatsApp do restaurante CONTINUA fora do ar";
      const auto = a.restarts > 0 ? ` Reinício automático tentado ${a.restarts}x sem sucesso.` : "";
      return `${base}: sessão "${session}" em ${a.status} há ${minutes(a.downMs)} min. ${HINTS[a.status] || ""}${auto} Confirmações e avisos de pedido NÃO estão sendo enviados.`.replace(/\s+/g, " ").trim();
    }
    case "recovered":
      return `✅ WhatsApp do restaurante voltou: sessão "${session}" conectada após ~${minutes(a.downMs)} min fora${a.autoRestarted ? " (reinício automático)" : ""}.`;
    case "waha_unreachable":
      return `⚠️ Servidor WAHA inacessível pelo backend (${a.error || "sem resposta"}). O WhatsApp pode estar fora do ar.`;
    case "waha_back":
      return "✅ Servidor WAHA voltou a responder.";
    default:
      return `WhatsApp: ${a.kind}`;
  }
}

/** Registra o alerta nos logs (sempre) e envia ao webhook configurado (se houver). Nunca lança. */
export async function sendAlert(a, session) {
  const text = buildAlertText(a, session);
  const level = a.kind === "recovered" || a.kind === "waha_back" ? "info" : "error";
  logger[level]({ event: "whatsapp.alert", kind: a.kind, session, status: a.status, downMs: a.downMs, restarts: a.restarts }, text);

  const url = process.env.WHATSAPP_ALERT_WEBHOOK_URL;
  if (!url) return;
  try {
    // `text` (Slack/Mattermost/n8n) e `content` (Discord) para funcionar com os destinos mais comuns.
    await axios.post(url, { text, content: text, kind: a.kind, session, status: a.status ?? null, service: "backend_restaurante" }, { timeout: 8000 });
  } catch (error) {
    logger.warn({ event: "whatsapp.alert.delivery_failed", kind: a.kind, err: error.message }, "não foi possível entregar o alerta no webhook");
  }
}

// ---------------------------------------------------------------------------
// Executor
// ---------------------------------------------------------------------------
let state = newState();
let currentSession = null;
let running = false;
let lastRunAt = 0;

async function observe(session) {
  try {
    const s = await getSession(session);
    return { ok: true, status: s.status, engineState: s.engine?.state };
  } catch (error) {
    if (error.response?.status === 404) return { ok: true, status: "NOT_FOUND" };
    return { ok: false, error: error.response?.status ? `HTTP ${error.response.status}` : error.code || error.message };
  }
}

export async function tick() {
  if (running) return;
  running = true;
  lastRunAt = Date.now();
  try {
    if (!wahaConfigured()) return;
    const config = await Config.findOne({ where: { id: 1 } });
    const session = config?.evolutionInstanceName; // campo legado: nome da sessão WAHA
    if (!session) return;
    if (session !== currentSession) {
      state = newState();
      currentSession = session;
    }

    const actions = evaluate(state, await observe(session), Date.now(), watchdogConfig());
    for (const a of actions) {
      if (a.type === "log") {
        const level = a.to === "WORKING" ? "info" : "warn";
        logger[level]({ event: a.event, session, from: a.from, to: a.to, engineState: a.engineState }, `sessão ${session}: ${a.from ?? "?"} → ${a.to}`);
      } else if (a.type === "alert") {
        await sendAlert(a, session);
      } else if (a.type === "restart") {
        try {
          await restartSession(session);
          logger.warn({ event: "whatsapp.session.auto_restart", session, attempt: a.attempt, max: a.max, ok: true }, "sessão em FAILED: reinício automático solicitado");
        } catch (error) {
          logger.error({ event: "whatsapp.session.auto_restart", session, attempt: a.attempt, max: a.max, ok: false, err: error.response?.data || error.message }, "falha ao reiniciar a sessão automaticamente");
        }
      }
    }
  } catch (error) {
    logger.error({ event: "whatsapp.watchdog.error", err: error.message }, "erro no vigia da sessão");
  } finally {
    running = false;
  }
}

/** Antecipa uma checagem (ex.: ao receber `session.status` do WAHA), com intervalo mínimo de 10s. */
export function pokeWatchdog() {
  if (Date.now() - lastRunAt < 10000) return;
  tick();
}

export function startWhatsappWatchdog() {
  const enabled = process.env.WHATSAPP_WATCHDOG
    ? process.env.WHATSAPP_WATCHDOG === "true"
    : process.env.NODE_ENV === "production";
  if (!enabled) {
    logger.info({ event: "whatsapp.watchdog.disabled" }, "vigia da sessão desligado (defina WHATSAPP_WATCHDOG=true para ligar fora de produção)");
    return;
  }
  const cfg = watchdogConfig();
  logger.info({ event: "whatsapp.watchdog.started", intervalSec: cfg.intervalMs / 1000, alertAfterSec: cfg.alertAfterMs / 1000, autoRestart: cfg.autoRestart, webhook: Boolean(process.env.WHATSAPP_ALERT_WEBHOOK_URL) }, "vigia da sessão iniciado");
  setTimeout(tick, 15000).unref();
  setInterval(tick, cfg.intervalMs).unref();
}
