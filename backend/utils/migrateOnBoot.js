import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "./logger.js";

/**
 * Aplica migrations pendentes na inicialização (só com RUN_MIGRATIONS_ON_BOOT=true).
 * Existe porque o banco só é acessível por dentro da rede do Easypanel.
 *
 * Trava de segurança: antes de migrar, lê `db:migrate:status`. Se houver mais migrations
 * pendentes que MIGRATIONS_BOOT_MAX_PENDING (padrão 2), assume que a tabela SequelizeMeta
 * está dessincronizada (e rodar reexecutaria migrations antigas) e NÃO executa nada.
 * Nunca derruba a aplicação: qualquer falha é registrada e a API sobe normalmente.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "node_modules", "sequelize-cli", "lib", "sequelize");

const run = (args) =>
  new Promise((resolve) => {
    execFile(process.execPath, [cli, ...args], { cwd: root, env: process.env, timeout: 120000 }, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout: String(stdout || ""), stderr: String(stderr || ""), error });
    });
  });

export async function migrateOnBoot() {
  if (process.env.RUN_MIGRATIONS_ON_BOOT !== "true") return;

  const status = await run(["db:migrate:status"]);
  if (!status.ok) {
    logger.error({ event: "migrate.status_failed", stderr: status.stderr.slice(0, 800) }, "não foi possível ler o status das migrations; nada executado");
    return;
  }

  const pending = status.stdout.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("down "));
  logger.info({ event: "migrate.status", pending: pending.map((l) => l.slice(5)) }, `${pending.length} migration(s) pendente(s)`);
  if (pending.length === 0) return;

  const max = Number(process.env.MIGRATIONS_BOOT_MAX_PENDING) || 2;
  if (pending.length > max) {
    logger.error(
      { event: "migrate.refused", pending: pending.length, max },
      "pendências demais: a tabela SequelizeMeta pode estar dessincronizada; migrations NÃO executadas"
    );
    return;
  }

  const result = await run(["db:migrate"]);
  if (result.ok) {
    logger.info({ event: "migrate.done", output: result.stdout.slice(-800) }, "migrations aplicadas");
  } else {
    logger.error({ event: "migrate.failed", stdout: result.stdout.slice(-800), stderr: result.stderr.slice(0, 800) }, "falha ao aplicar migrations (a API sobe mesmo assim)");
  }
}
