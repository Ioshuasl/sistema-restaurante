// controller/webhookController.js
import WhatsappCliente from '../models/whatsappClienteModel.js';
import { sendMessageWhatsapp } from '../functions/sendMessageWhatsapp.js';
import { resolveLid } from '../functions/wahaClient.js';
import Config from '../models/configModels.js';

import {
  estabelecimentoAbertoAgora,
} from '../utils/cardapioPeriodo.js';

/**
 * Verifica se o estabelecimento está aberto (fuso Brasília).
 */
const estaNoHorarioAtendimento = (horarios) => {
  return estabelecimentoAbertoAgora(horarios);
};

/** Data (YYYY-MM-DD) no fuso de Brasília. Antes usava UTC e "virava o dia" às 21h locais. */
const dataHojeBrasilia = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

/** Idade máxima (s) para responder uma mensagem (após reconexão a sessão pode entregar mensagens atrasadas em rajada). */
const maxMessageAgeSec = () => {
  const v = parseInt(process.env.WHATSAPP_MAX_MESSAGE_AGE_SEC, 10);
  return Number.isFinite(v) ? v : 3600;
};

/** Tipos de evento que não são uma mensagem do cliente e nunca devem disparar resposta automática. */
const IGNORED_MESSAGE_TYPES = new Set([
  'protocol',
  'e2e_notification',
  'notification_template',
  'gp2',
  'call_log',
  'revoked',
  'reaction',
  'poll_vote',
]);

/** Evita processar duas vezes a mesma mensagem (retry do webhook) e corridas por número. */
const recentMessageIds = new Map();
const inFlightNumbers = new Set();
const DEDUPE_TTL_MS = 10 * 60 * 1000;

const jaProcessada = (id) => {
  if (!id) return false;
  const now = Date.now();
  for (const [k, t] of recentMessageIds) {
    if (now - t > DEDUPE_TTL_MS) recentMessageIds.delete(k);
    else break; // Map mantém ordem de inserção
  }
  if (recentMessageIds.has(id)) return true;
  recentMessageIds.set(id, now);
  return false;
};

/**
 * Extrai o número de telefone do chatId da WAHA. "5562...@c.us" → "5562...".
 * Contas migradas para LID chegam como "<id>@lid": tenta resolver o telefone pela WAHA e,
 * se não souber, devolve o JID completo (a WAHA aceita @lid como chatId).
 */
const resolverNumero = async (session, from) => {
  if (typeof from !== 'string') return null;
  if (from.endsWith('@c.us')) return from.replace('@c.us', '');
  if (from.endsWith('@lid')) {
    const pn = await resolveLid(session, from);
    return pn ? pn.replace('@c.us', '') : from;
  }
  return null;
};

const processarMensagem = async (body) => {
  const { event, session } = body || {};

  if (String(event || '').trim().toLowerCase() !== 'message') return;

  const config = await Config.findOne({ where: { id: 1 } });
  if (!config || !config.evolutionInstanceName) {
    console.error('❌ ERRO: Configuração de sessão WhatsApp ausente no banco.');
    return;
  }
  // Ignora eventos de qualquer outra sessão do mesmo servidor WAHA
  if (session !== config.evolutionInstanceName) return;

  const msg = body.payload;
  if (!msg || typeof msg.from !== 'string') return;

  // Só conversas individuais: ignora grupos, status, canais e mensagens enviadas por nós.
  if (msg.fromMe || msg.from.endsWith('@g.us') || msg.from.includes('@broadcast') || msg.from.endsWith('@newsletter')) return;

  if (IGNORED_MESSAGE_TYPES.has(msg._data?.type)) return;
  if (jaProcessada(msg.id)) {
    console.log(`♻️ Mensagem ${msg.id} já processada, ignorando.`);
    return;
  }

  // Mensagem antiga (entrega em rajada após reconexão): não responder, evita spam fora de hora.
  const ts = Number(msg.timestamp);
  if (Number.isFinite(ts) && ts > 0) {
    const idadeSec = Math.floor(Date.now() / 1000) - ts;
    if (idadeSec > maxMessageAgeSec()) {
      console.log(`⌛ Mensagem de ${Math.round(idadeSec / 60)} min atrás ignorada (sessão ${session}).`);
      return;
    }
  }

  const pushName = msg._data?.notifyName || null;
  const numero = await resolverNumero(session, msg.from);
  if (!numero) return;

  if (inFlightNumbers.has(numero)) return;
  inFlightNumbers.add(numero);

  try {
    const hoje = dataHojeBrasilia();
    console.log(`🔎 Cliente: ${numero} | Nome: ${pushName || 'Desconhecido'}`);

    let cliente = await WhatsappCliente.findOne({ where: { numero } });
    let enviarResposta = false;

    if (!cliente) {
      cliente = await WhatsappCliente.create({ numero, nome: pushName, ultima_interacao: hoje });
      enviarResposta = true;
    } else if (cliente.ultima_interacao !== hoje) {
      await cliente.update({ ultima_interacao: hoje, nome: pushName || cliente.nome });
      enviarResposta = true;
    } else {
      console.log('⏳ Cliente já interagiu hoje.');
    }

    if (!enviarResposta) return;

    const abertoAgora = estaNoHorarioAtendimento(config.horariosFuncionamento);
    let mensagensParaEnviar = [];

    if (abertoAgora) {
      const saudacao = cliente.nome ? `Olá, *${cliente.nome}*!` : `Olá!`;
      mensagensParaEnviar = [
        `${saudacao} Tudo bem?`,
        `Para realizar seu pedido, acesse nosso cardápio digital no link: ${process.env.FRONTEND_URL || 'https://gs-sabores.ioshuavps.com.br'}`,
      ];
      console.log(`🚀 Enviando CARDÁPIO para ${cliente.nome || numero}...`);
    } else {
      const diasNomes = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

      const listaHorarios = [...config.horariosFuncionamento]
        .sort((a, b) => a.dia - b.dia)
        .map((h) => {
          if (!h.aberto) return `• *${diasNomes[h.dia]}*: _Fechado_`;
          const p = h.periodos;
          if (p) {
            const partes = [];
            if (p.dia?.ativo) partes.push(`Almoço ${p.dia.inicio}–${p.dia.fim}`);
            if (p.noite?.ativo) partes.push(`Jantar ${p.noite.inicio}–${p.noite.fim}`);
            return `• *${diasNomes[h.dia]}*: ${partes.length ? partes.join(' | ') : '_Fechado_'}`;
          }
          return `• *${diasNomes[h.dia]}*: ${h.inicio} às ${h.fim}`;
        })
        .join('\n');

      mensagensParaEnviar = [
        `Desculpe, no momento não estamos em horário de atendimento.`,
        `Estes são nossos horários de funcionamento:\n\n${listaHorarios}`,
      ];
      console.log(`🌙 Enviando AVISO DE FECHADO para ${cliente.nome || numero}...`);
    }

    const { enviadas, falhas } = await sendMessageWhatsapp(
      config.evolutionInstanceName,
      numero,
      mensagensParaEnviar
    );

    if (falhas > 0 && enviadas === 0) {
      // Nada foi entregue: libera o "já respondi hoje" para a próxima mensagem do cliente tentar de novo.
      await cliente.update({ ultima_interacao: '1970-01-01' }).catch(() => {});
      console.error(`❌ Resposta automática NÃO enviada para ${numero}.`);
    } else {
      console.log(`✅ Resposta enviada (${enviadas}/${mensagensParaEnviar.length}) para ${numero}.`);
    }
  } finally {
    inFlightNumbers.delete(numero);
  }
};

export const handleIncomingMessage = (req, res) => {
  // Responde na hora: o envio humanizado leva dezenas de segundos e a WAHA
  // reenviaria (política de retry) o webhook (duplicando respostas) se esperássemos terminar.
  res.status(200).json({ status: 'received' });

  processarMensagem(req.body).catch((error) => {
    console.error('❌ ERRO WEBHOOK:', error);
  });
};
