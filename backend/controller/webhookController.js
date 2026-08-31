// controller/webhookController.js
import WhatsappCliente from '../models/whatsappClienteModel.js';
import { sendMessageWhatsapp } from '../functions/sendMessageWhatsapp.js';
import Config from '../models/configModels.js';

/**
 * Verifica se o estabelecimento está aberto com base nos horários do banco de dados.
 * Considera o fuso horário de Brasília.
 */
const estaNoHorarioAtendimento = (horarios) => {
  // Obtém a data/hora atual no fuso horário de Brasília
  const agora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  
  const diaSemana = agora.getDay(); // 0 (Domingo) a 6 (Sábado)
  const horaAtual = agora.getHours().toString().padStart(2, '0');
  const minutoAtual = agora.getMinutes().toString().padStart(2, '0');
  const horarioAgora = `${horaAtual}:${minutoAtual}`;

  // Localiza a configuração para o dia da semana atual
  const configDia = horarios.find(h => h.dia === diaSemana);

  // Se não houver config ou estiver marcado como fechado
  if (!configDia || !configDia.aberto) return false;

  // Compara strings de horário (HH:mm)
  return horarioAgora >= configDia.inicio && horarioAgora <= configDia.fim;
};

export const handleIncomingMessage = async (req, res) => {
  try {
    console.log('\n--- 🔔 NOVO WEBHOOK RECEBIDO ---');
    
    const { data, event, instance } = req.body;
    
    console.log(`📡 Evento: ${event}`);
    console.log(`🤖 Instância (Webhook): ${instance}`);

    if (event !== 'messages.upsert') {
      return res.status(200).send('Evento ignorado');
    }

    const messageData = data.data || data; 

    if (!messageData || !messageData.key) {
      return res.status(200).send('Sem dados');
    }

    const remoteJid = messageData.key.remoteJid;
    const isFromMe = messageData.key.fromMe;
    const isGroup = remoteJid.includes('@g.us');
    const pushName = messageData.pushName || data.pushName || null;

    if (isFromMe || isGroup) {
      return res.status(200).send('Ignorado');
    }

    const numeroApenasDigitos = remoteJid.replace('@s.whatsapp.net', '');
    const hoje = new Date().toISOString().split('T')[0];

    console.log(`🔎 Cliente: ${numeroApenasDigitos} | Nome: ${pushName || 'Desconhecido'}`);

    // 1. Verifica/Atualiza o cliente no banco
    let cliente = await WhatsappCliente.findOne({ where: { numero: numeroApenasDigitos } });
    let enviarResposta = false;

    if (!cliente) {
      console.log('🆕 Cliente NOVO. Criando registro...');
      cliente = await WhatsappCliente.create({
        numero: numeroApenasDigitos,
        nome: pushName,
        ultima_interacao: hoje
      });
      enviarResposta = true;
    } else {
      if (cliente.ultima_interacao !== hoje) {
        console.log('✅ Retorno em NOVO dia. Atualizando...');
        await cliente.update({ 
            ultima_interacao: hoje,
            nome: pushName || cliente.nome 
        });
        enviarResposta = true;
      } else {
        console.log('⏳ Cliente já interagiu hoje.');
      }
    }

    // 2. Lógica de Resposta Automática baseada no Horário
    if (enviarResposta) {
      const config = await Config.findOne({ where: { id: 1 } });

      if (!config || !config.evolutionInstanceName) {
        console.error('❌ ERRO: Configuração de instância ausente no banco.');
        return res.status(500).send('Erro config');
      }

      const abertoAgora = estaNoHorarioAtendimento(config.horariosFuncionamento);
      let mensagensParaEnviar = [];

      if (abertoAgora) {
        // Fluxo normal: Cardápio
        const saudacao = cliente.nome ? `Olá, *${cliente.nome}*!` : `Olá!`;
        mensagensParaEnviar = [
          `${saudacao} Tudo bem?`,
          `Para realizar seu pedido, acesse nosso cardápio digital no link: ${process.env.FRONTEND_URL || 'https://gs-sabores.ioshuavps.com.br'}`,
        ];
        console.log(`🚀 Enviando CARDÁPIO para ${cliente.nome || numeroApenasDigitos}...`);
      } else {
        // Fluxo: Fora de Horário
        const diasNomes = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        
        const listaHorarios = config.horariosFuncionamento
          .sort((a, b) => a.dia - b.dia) // Garante a ordem dos dias
          .map(h => `• *${diasNomes[h.dia]}*: ${h.aberto ? `${h.inicio} às ${h.fim}` : '_Fechado_'}`)
          .join('\n');

        mensagensParaEnviar = [
          `Desculpe, no momento não estamos em horário de atendimento.`,
          `Estes são nossos horários de funcionamento:\n\n${listaHorarios}`
        ];
        console.log(`🌙 Enviando AVISO DE FECHADO para ${cliente.nome || numeroApenasDigitos}...`);
      }

      await sendMessageWhatsapp(
        process.env.EVOLUTION_API_URL,
        config.evolutionInstanceName,
        process.env.EVOLUTION_API_KEY,
        numeroApenasDigitos,
        mensagensParaEnviar
      );
      
      console.log(`✅ Resposta enviada com sucesso!`);
    }

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('❌ ERRO WEBHOOK:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};