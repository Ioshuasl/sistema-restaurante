import "dotenv/config";
import { Writable } from "node:stream";
import { format } from "node:util";
import axios from "axios";
import pino from "pino";

/**
 * Logger estruturado (JSON) com:
 *  - saída em stdout (docker logs / Easypanel);
 *  - envio em lote para o OpenObserve quando OPENOBSERVE_URL/USER/PASSWORD estão definidos;
 *  - redação de segredos (headers de autenticação, senhas, tokens, chaves).
 * Nunca derruba a aplicação: falha de envio ao OpenObserve é descartada em silêncio.
 */

const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  'req.headers["x-api-key"]',
  'req.headers["x-webhook-secret"]',
  "res.headers['set-cookie']",
  "*.password",
  "*.senha",
  "*.token",
  "*.apikey",
  "*.apiKey",
  "*.authorization",
];

/** "5562985811479" → "5562*****479" (mantém DDI+DDD e os 3 últimos dígitos). */
export function maskPhone(value) {
  const [local, ...rest] = String(value ?? "").split("@");
  const suffix = rest.length ? `@${rest.join("@")}` : "";
  const d = local.replace(/\D/g, "");
  if (d.length <= 7) return `***${suffix}`;
  return `${d.slice(0, 4)}${"*".repeat(d.length - 7)}${d.slice(-3)}${suffix}`;
}

class OpenObserveStream extends Writable {
  constructor({ url, org, stream, user, password }) {
    super();
    this.endpoint = `${url.replace(/\/$/, "")}/api/${org}/${stream}/_json`;
    this.auth = { username: user, password };
    this.buffer = [];
    this.timer = setInterval(() => this.flush(), 3000);
    this.timer.unref();
  }

  _write(chunk, _enc, cb) {
    try {
      this.buffer.push(JSON.parse(chunk.toString()));
    } catch {
      /* linha que não é JSON: ignora */
    }
    if (this.buffer.length >= 200) this.flush();
    if (this.buffer.length > 5000) this.buffer.splice(0, this.buffer.length - 5000); // teto: descarta os mais antigos
    cb();
  }

  flush() {
    if (!this.buffer.length || this.flushing) return;
    const batch = this.buffer.splice(0, 500);
    this.flushing = true;
    axios
      .post(this.endpoint, batch, { auth: this.auth, timeout: 8000 })
      .catch(() => {
        // Devolve ao buffer uma vez só (evita crescer sem limite se o servidor estiver fora)
        this.buffer.unshift(...batch.slice(-1000));
      })
      .finally(() => {
        this.flushing = false;
      });
  }
}

const streams = [{ stream: process.stdout }];
if (process.env.OPENOBSERVE_URL && process.env.OPENOBSERVE_USER && process.env.OPENOBSERVE_PASSWORD) {
  streams.push({
    stream: new OpenObserveStream({
      url: process.env.OPENOBSERVE_URL,
      org: process.env.OPENOBSERVE_ORG || "default",
      stream: process.env.OPENOBSERVE_STREAM || "backend_restaurante",
      user: process.env.OPENOBSERVE_USER,
      password: process.env.OPENOBSERVE_PASSWORD,
    }),
  });
}

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: { service: process.env.LOG_SERVICE_NAME || "backend_restaurante" },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, censor: "[redacted]" },
    formatters: { level: (label) => ({ level: label }) },
  },
  pino.multistream(streams)
);

/**
 * Faz os console.log/info/warn/error/debug existentes passarem pelo pino, sem reescrever
 * cada arquivo: todos os logs antigos viram JSON com nível e vão para o OpenObserve.
 */
export function installConsoleBridge() {
  const map = { log: "info", info: "info", warn: "warn", error: "error", debug: "debug" };
  for (const [method, level] of Object.entries(map)) {
    console[method] = (...args) => logger[level]({ legacy: true }, format(...args));
  }
}

export default logger;
