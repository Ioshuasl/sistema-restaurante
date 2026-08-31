// routes/webhookRoutes.js
import express from 'express';
import { handleIncomingMessage } from '../controller/webhookController.js';

const router = express.Router();

// Rota POST que a Evolution API vai chamar
router.post('/whatsapp', handleIncomingMessage);

export default router;