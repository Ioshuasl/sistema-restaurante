import sequelize from '../config/database.js';
import {
  resolvePeriodosParaAgora,
  resolverTipoMenuAtivo,
  estabelecimentoAbertoAgora,
} from '../utils/cardapioPeriodo.js';
import { Config } from '../models/index.js';

const config = await Config.findByPk(1);
const agoraServer = new Date();
const agoraSp = new Date(
  new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
);

console.log('Server now:', agoraServer.toISOString(), agoraServer.toString());
console.log('SP now via locale:', agoraSp.toString());
console.log(
  'SP parts:',
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(new Date())
);

const periodos = resolvePeriodosParaAgora(config, agoraServer);
console.log('periodos (server Date):', periodos);
console.log('tipoAtivo (server Date):', resolverTipoMenuAtivo(periodos, agoraServer));
console.log('tipoAtivo (config):', resolverTipoMenuAtivo(config, agoraServer));
console.log('aberto:', estabelecimentoAbertoAgora(config.horariosFuncionamento, agoraServer));

const hoje = agoraServer.getDay();
const dia = (config.horariosFuncionamento || []).find((h) => h.dia === hoje);
console.log('diaSemana server getDay():', hoje);
console.log('horario hoje:', JSON.stringify(dia, null, 2));

await sequelize.close();
