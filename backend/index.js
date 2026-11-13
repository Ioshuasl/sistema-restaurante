import logger, { installConsoleBridge } from "./utils/logger.js";
import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from 'dotenv';
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import sequelize from "./config/database.js";
import "./models/index.js";
import apiRoutes from "./routes/index.js";
import { rateLimit } from "./middlewares/rateLimit.js";

dotenv.config();
installConsoleBridge(); // console.* legado → pino (JSON + OpenObserve)

process.on("unhandledRejection", (reason) => logger.error({ err: reason }, "unhandledRejection"));
process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException");
    setTimeout(() => process.exit(1), 500); // dá tempo de enviar o log antes de reiniciar
});

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(compression());
// Log de cada requisição (método, rota sem query string, status, tempo). Nunca registra headers/corpo.
app.use(pinoHttp({
    logger,
    genReqId: (req, res) => {
        const id = req.headers['x-request-id'] || randomUUID();
        res.setHeader('x-request-id', id);
        return id;
    },
    autoLogging: { ignore: (req) => req.url === '/' || req.url.startsWith('/uploads') },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: String(req.url).split('?')[0] }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
}));
app.use(express.json());
app.use(cors());

// Recursos estáticos com cache agressivo para imagens
app.use('/uploads', express.static('public/uploads', {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders(res) {
        res.set('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
    },
}));

// Prefixando todas as rotas da API com /api de uma só vez
// Limite geral por IP (o webhook da Evolution vem do próprio servidor e é autenticado por segredo)
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 600 }), apiRoutes);

// Conexão com o banco (schema via Sequelize CLI: migrations/seeders)
try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
} catch (error) {
    console.error("Falha ao conectar com o banco de dados:", error);
}

// Retenção do log de mensagens (dados pessoais: não guardar para sempre). Padrão: 60 dias.
const purgeMensagensLog = async () => {
    try {
        const dias = Number(process.env.WHATSAPP_LOG_RETENTION_DAYS) || 60;
        const { default: WhatsappMensagemLog } = await import('./models/whatsappMensagemLogModel.js');
        const { Op } = await import('sequelize');
        const removidos = await WhatsappMensagemLog.destroy({ where: { createdAt: { [Op.lt]: new Date(Date.now() - dias * 864e5) } } });
        if (removidos) logger.info({ event: 'whatsapp.log.purged', removidos, dias }, 'log de mensagens antigo removido');
    } catch (error) {
        logger.warn({ event: 'whatsapp.log.purge_failed', err: error.message }, 'não foi possível limpar o log de mensagens');
    }
};
setTimeout(purgeMensagensLog, 60 * 1000).unref();
setInterval(purgeMensagensLog, 24 * 60 * 60 * 1000).unref();

app.get('/', (req, res) => {
    res.send("API do Restaurante rodando com sucesso!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
