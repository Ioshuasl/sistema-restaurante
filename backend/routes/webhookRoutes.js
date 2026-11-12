// routes/webhookRoutes.js
import crypto from 'crypto';
import express from 'express';
import { handleIncomingMessage } from '../controller/webhookController.js';

const router = express.Router();

/**
 * Autenticação do webhook: a WAHA deve enviar o header `x-webhook-secret`
 * com o valor de WEBHOOK_SECRET (session config → webhooks[].customHeaders).
 * Sem isso, qualquer pessoa na internet pode forjar eventos e disparar mensagens
 * de WhatsApp pelo seu número.
 */
const verifyWebhookSecret = (req, res, next) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.warn('⚠️ WEBHOOK_SECRET não definido: webhook aceitando requisições sem autenticação.');
    return next();
  }

  const received = String(req.get('x-webhook-secret') || '');
  const a = Buffer.from(received);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};

// Rota POST que a WAHA vai chamar
router.post('/whatsapp', verifyWebhookSecret, handleIncomingMessage);

export default router;
