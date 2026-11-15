import express from 'express';
import { createHash } from 'node:crypto';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import Config from '../models/configModels.js';
import {
  getSession,
  getQrDataUri,
  logoutSession,
  restartSession,
  startSession,
  wahaConfigured,
} from '../functions/wahaClient.js';
import { setNoCache } from '../middlewares/cacheHeaders.js';
import logger from '../utils/logger.js';
import WhatsappMensagemLog from '../models/whatsappMensagemLogModel.js';

const router = express.Router();

/** Traduz o status da WAHA para o vocabulário usado pelo painel. */
const toState = (status) => {
  if (status === 'WORKING') return 'open';
  if (status === 'STARTING' || status === 'SCAN_QR_CODE') return 'connecting';
  return 'close'; // STOPPED, FAILED, inexistente
};

/** Impressão curta do QR (para ver nos logs se ele renovou, sem gravar a imagem). */
const qrHash = (qr) => (qr ? createHash('md5').update(qr).digest('hex').slice(0, 8) : null);

/**
 * "Pareando": o celular já leu o QR (motor CONNECTED) mas a WAHA ainda sincroniza (status segue SCAN_QR_CODE).
 * Dura ~30s; nesse intervalo o QR exibido já foi usado e não deve mais ser mostrado.
 */
const isPairing = (s) => s.status === 'SCAN_QR_CODE' && ['OPENING', 'CONNECTED'].includes(s.engine?.state);

/** Inicia a sessão do jeito certo para o estado: STOPPED usa start; FAILED precisa de restart. */
const ensureRunning = async (session, s) => {
  if (s.status === 'FAILED') { await restartSession(session); return 'restart'; }
  if (s.status === 'STOPPED') { await startSession(session); return 'start'; }
  return null;
};

const sessionName = async () => {
  const config = await Config.findOne({ where: { id: 1 } });
  return config?.evolutionInstanceName || null; // campo legado: guarda o nome da sessão WAHA
};

const handle = (fn) => async (req, res) => {
  try {
    if (!wahaConfigured()) return res.status(503).json({ message: 'WAHA não configurada no servidor.' });
    const session = await sessionName();
    if (!session) return res.status(400).json({ message: 'Informe o nome da sessão do WhatsApp primeiro.' });
    return await fn(session, req, res);
  } catch (error) {
    if (error.response?.status === 404) return res.status(200).json({ session: null, state: 'close', status: 'NOT_FOUND' });
    logger.error({ event: 'whatsapp.waha_error', path: req.path, status: error.response?.status, detalhe: error.response?.data || error.message }, 'erro ao falar com a WAHA');
    return res.status(502).json({ message: 'Falha ao comunicar com o servidor de WhatsApp.' });
  }
};

// Estado da conexão (usado pelo indicador do cabeçalho)
router.get('/status', authenticateToken, setNoCache, handle(async (session, req, res) => {
  const s = await getSession(session);
  res.json({ session, state: toState(s.status), status: s.status, pairing: isPairing(s) });
}));

// Inicia a sessão (se parada) e devolve o QR (data URI) quando houver um aguardando leitura
router.post('/connect', authenticateToken, isAdmin, setNoCache, handle(async (session, req, res) => {
  const t0 = Date.now();
  let s = await getSession(session);
  const before = s.status;
  if (s.status === 'WORKING') {
    logger.info({ event: 'whatsapp.connect', session, before, after: before, hasQr: false, ms: Date.now() - t0 }, 'conectar: sessão já está conectada');
    return res.json({ session, state: 'open', status: s.status, qr: null });
  }

  const started = await ensureRunning(session, s);

  // Aguarda o navegador da WAHA gerar o QR (SCAN_QR_CODE), até ~25s
  const seen = [];
  for (let i = 0; i < 25; i++) {
    s = await getSession(session);
    if (seen[seen.length - 1] !== s.status) seen.push(s.status);
    if (s.status === 'SCAN_QR_CODE' || s.status === 'WORKING') break;
    await new Promise((r) => setTimeout(r, 1000));
  }

  const pairing = isPairing(s);
  const qr = s.status === 'SCAN_QR_CODE' && !pairing ? await getQrDataUri(session) : null;
  logger.info({ event: 'whatsapp.connect', session, before, started, transitions: seen.join('>'), after: s.status, engineState: s.engine?.state, pairing, hasQr: Boolean(qr), qrHash: qrHash(qr), ms: Date.now() - t0 }, 'conectar: resultado');
  res.json({ session, state: toState(s.status), status: s.status, pairing, qr });
}));

// Consulta rápida usada pelo modal para renovar o QR (expira em segundos) e detectar a conexão.
// Se a sessão estiver parada, inicia; o QR só vem quando ela já aguarda leitura.
router.get('/qr', authenticateToken, isAdmin, setNoCache, handle(async (session, req, res) => {
  const t0 = Date.now();
  let s = await getSession(session);
  const before = s.status;
  const started = await ensureRunning(session, s);
  if (started) s = await getSession(session);
  const pairing = isPairing(s);
  const qr = s.status === 'SCAN_QR_CODE' && !pairing ? await getQrDataUri(session) : null;
  logger.info({ event: 'whatsapp.qr', session, before, started, after: s.status, engineState: s.engine?.state, pairing, hasQr: Boolean(qr), qrHash: qrHash(qr), ms: Date.now() - t0 }, 'renovar QR');
  res.json({ session, state: toState(s.status), status: s.status, pairing, qr });
}));

// Histórico dos últimos envios (filtros: status=enviada|falha, tipo, pedidoId, limit até 200)
router.get('/mensagens', authenticateToken, isAdmin, setNoCache, async (req, res) => {
  try {
    const where = {};
    if (['enviada', 'falha'].includes(req.query.status)) where.status = req.query.status;
    if (req.query.tipo) where.tipo = String(req.query.tipo);
    if (req.query.pedidoId) where.pedidoId = Number(req.query.pedidoId) || null;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const rows = await WhatsappMensagemLog.findAll({ where, order: [['id', 'DESC']], limit });
    res.json(rows);
  } catch (error) {
    logger.error({ event: 'whatsapp.log.query_failed', err: error }, 'erro ao consultar log de mensagens');
    res.status(500).json({ message: 'Erro ao consultar o log de mensagens.' });
  }
});

// Desconecta o aparelho (a sessão continua existindo)
router.post('/logout', authenticateToken, isAdmin, setNoCache, handle(async (session, req, res) => {
  await logoutSession(session);
  res.json({ session, state: 'close' });
}));

export default router;
