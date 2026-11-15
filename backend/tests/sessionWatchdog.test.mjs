import { test } from "node:test";
import assert from "node:assert/strict";

// O módulo importa models/Sequelize; sem banco aqui, só o núcleo puro é exercitado.
process.env.DB_HOST = "127.0.0.1";
process.env.DB_PORT = "1";
const { evaluate, newState, buildAlertText } = await import("../utils/sessionWatchdog.js");

const cfg = {
  alertAfterMs: 180000,
  remindMs: 180 * 60000,
  autoRestart: true,
  maxRestarts: 2,
  restartCooldownMs: 300000,
  unreachableAfter: 3,
};
const ok = (status, engineState) => ({ ok: true, status, engineState });
const kinds = (acts) => acts.filter((a) => a.type === "alert").map((a) => a.kind);
const types = (acts) => acts.map((a) => a.type);

test("sessão saudável: só registra a primeira observação, sem alerta", () => {
  const st = newState();
  const a1 = evaluate(st, ok("WORKING"), 0, cfg);
  assert.deepEqual(types(a1), ["log"]);
  assert.deepEqual(evaluate(st, ok("WORKING"), 60000, cfg), []);
});

test("alerta só depois de alertAfterMs fora do ar, e uma única vez", () => {
  const st = newState();
  evaluate(st, ok("WORKING"), 0, cfg);
  assert.deepEqual(kinds(evaluate(st, ok("SCAN_QR_CODE", "UNPAIRED"), 60000, cfg)), []);
  assert.deepEqual(kinds(evaluate(st, ok("SCAN_QR_CODE", "UNPAIRED"), 120000, cfg)), []);
  assert.deepEqual(kinds(evaluate(st, ok("SCAN_QR_CODE", "UNPAIRED"), 240000, cfg)), ["down"]);
  assert.deepEqual(kinds(evaluate(st, ok("SCAN_QR_CODE", "UNPAIRED"), 300000, cfg)), []);
});

test("lembrete só após remindMs; recuperação avisa e zera o incidente", () => {
  const st = newState();
  evaluate(st, ok("WORKING"), 0, cfg);
  evaluate(st, ok("STOPPED"), 1000, cfg);
  assert.deepEqual(kinds(evaluate(st, ok("STOPPED"), 200000, cfg)), ["down"]);
  assert.deepEqual(kinds(evaluate(st, ok("STOPPED"), 200000 + 179 * 60000, cfg)), []);
  assert.deepEqual(kinds(evaluate(st, ok("STOPPED"), 200000 + 181 * 60000, cfg)), ["still_down"]);
  const back = evaluate(st, ok("WORKING"), 200000 + 190 * 60000, cfg);
  assert.deepEqual(kinds(back), ["recovered"]);
  assert.equal(st.downSince, null);
  // novo incidente volta a alertar do zero
  evaluate(st, ok("STOPPED"), 400000 * 100, cfg);
  assert.deepEqual(kinds(evaluate(st, ok("STOPPED"), 400000 * 100 + 200000, cfg)), ["down"]);
});

test("FAILED é reiniciada automaticamente, no máximo maxRestarts, respeitando o cooldown", () => {
  const st = newState();
  evaluate(st, ok("WORKING"), 0, cfg);
  assert.deepEqual(types(evaluate(st, ok("FAILED"), 60000, cfg)).filter((t) => t === "restart"), ["restart"]);
  // dentro do cooldown: não repete
  assert.deepEqual(types(evaluate(st, ok("FAILED"), 120000, cfg)).filter((t) => t === "restart"), []);
  // após o cooldown: 2ª tentativa
  assert.deepEqual(types(evaluate(st, ok("FAILED"), 400000, cfg)).filter((t) => t === "restart"), ["restart"]);
  // limite atingido: nunca mais
  assert.deepEqual(types(evaluate(st, ok("FAILED"), 900000, cfg)).filter((t) => t === "restart"), []);
  assert.equal(st.restarts, 2);
});

test("STOPPED e SCAN_QR_CODE nunca são reiniciadas automaticamente", () => {
  for (const status of ["STOPPED", "SCAN_QR_CODE", "STARTING", "NOT_FOUND"]) {
    const st = newState();
    evaluate(st, ok("WORKING"), 0, cfg);
    const acts = [60000, 600000, 1200000].flatMap((t) => evaluate(st, ok(status), t, cfg));
    assert.equal(acts.filter((a) => a.type === "restart").length, 0, status);
  }
});

test("autoRestart=false desliga o reinício", () => {
  const st = newState();
  evaluate(st, ok("WORKING"), 0, cfg);
  assert.equal(types(evaluate(st, ok("FAILED"), 60000, { ...cfg, autoRestart: false })).includes("restart"), false);
});

test("recuperação após reinício automático é sinalizada", () => {
  const st = newState();
  evaluate(st, ok("WORKING"), 0, cfg);
  evaluate(st, ok("FAILED"), 60000, cfg);
  evaluate(st, ok("STARTING"), 90000, cfg);
  const acts = evaluate(st, ok("WORKING"), 120000, cfg);
  const rec = acts.find((a) => a.kind === "recovered");
  assert.ok(rec && rec.autoRestarted === true);
  assert.match(buildAlertText(rec, "gssabores"), /reinício automático/);
});

test("WAHA inacessível: alerta após N falhas seguidas e avisa quando volta; não mexe no incidente da sessão", () => {
  const st = newState();
  evaluate(st, ok("WORKING"), 0, cfg);
  assert.deepEqual(kinds(evaluate(st, { ok: false, error: "ECONNREFUSED" }, 60000, cfg)), []);
  assert.deepEqual(kinds(evaluate(st, { ok: false, error: "ECONNREFUSED" }, 120000, cfg)), []);
  assert.deepEqual(kinds(evaluate(st, { ok: false, error: "ECONNREFUSED" }, 180000, cfg)), ["waha_unreachable"]);
  assert.deepEqual(kinds(evaluate(st, { ok: false, error: "ECONNREFUSED" }, 240000, cfg)), []);
  assert.deepEqual(kinds(evaluate(st, ok("WORKING"), 300000, cfg)), ["waha_back"]);
  assert.equal(st.downSince, null);
});

test("texto do alerta orienta conforme o estado", () => {
  const t = buildAlertText({ kind: "down", status: "SCAN_QR_CODE", downMs: 5 * 60000, restarts: 0 }, "gssabores");
  assert.match(t, /FORA DO AR/);
  assert.match(t, /escanear o QR/);
  assert.match(t, /5 min/);
  const f = buildAlertText({ kind: "down", status: "FAILED", downMs: 4 * 60000, restarts: 2 }, "gssabores");
  assert.match(f, /Reinício automático tentado 2x/);
});
