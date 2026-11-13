import express from 'express';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
import Config from '../models/configModels.js';
import {
  getSession,
  getQrDataUri,
  logoutSession,
  startSession,
  wahaConfigured,
} from '../functions/wahaClient.js';
import { setNoCache } from '../middlewares/cacheHeaders.js';

const router = express.Router();

/** Traduz o status da WAHA para o vocabulário usado pelo painel. */
const toState = (status) => {
  if (status === 'WORKING') return 'open';
  if (status === 'STARTING' || status === 'SCAN_QR_CODE') return 'connecting';
  return 'close'; // STOPPED, FAILED, inexistente
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
    console.error('[whatsapp] erro WAHA:', error.response?.data || error.message);
    return res.status(502).json({ message: 'Falha ao comunicar com o servidor de WhatsApp.' });
  }
};

// Estado da conexão (usado pelo indicador do cabeçalho)
router.get('/status', authenticateToken, setNoCache, handle(async (session, req, res) => {
  const s = await getSession(session);
  res.json({ session, state: toState(s.status), status: s.status });
}));

// Inicia a sessão (se parada) e devolve o QR (data URI) quando houver um aguardando leitura
router.post('/connect', authenticateToken, isAdmin, setNoCache, handle(async (session, req, res) => {
  let s = await getSession(session);
  if (s.status === 'WORKING') return res.json({ session, state: 'open', status: s.status, qr: null });

  if (s.status === 'STOPPED' || s.status === 'FAILED') {
    await startSession(session);
  }

  // Aguarda o navegador da WAHA gerar o QR (SCAN_QR_CODE), até ~20s
  for (let i = 0; i < 20; i++) {
    s = await getSession(session);
    if (s.status === 'SCAN_QR_CODE' || s.status === 'WORKING') break;
    await new Promise((r) => setTimeout(r, 1000));
  }

  const qr = s.status === 'SCAN_QR_CODE' ? await getQrDataUri(session) : null;
  res.json({ session, state: toState(s.status), status: s.status, qr });
}));

// Consulta rápida usada pelo modal para renovar o QR (expira em segundos) e detectar a conexão.
// Se a sessão estiver parada, inicia; o QR só vem quando ela já aguarda leitura.
router.get('/qr', authenticateToken, isAdmin, setNoCache, handle(async (session, req, res) => {
  let s = await getSession(session);
  if (s.status === 'STOPPED' || s.status === 'FAILED') {
    await startSession(session);
    s = await getSession(session);
  }
  const qr = s.status === 'SCAN_QR_CODE' ? await getQrDataUri(session) : null;
  res.json({ session, state: toState(s.status), status: s.status, qr });
}));

// Desconecta o aparelho (a sessão continua existindo)
router.post('/logout', authenticateToken, isAdmin, setNoCache, handle(async (session, req, res) => {
  await logoutSession(session);
  res.json({ session, state: 'close' });
}));

export default router;
