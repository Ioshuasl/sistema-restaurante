import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Registro de cada mensagem de WhatsApp enviada (ou que falhou) pelo backend.
 * Não guarda o texto: o conteúdo já existe no pedido e evita acumular dados pessoais à toa.
 */
const WhatsappMensagemLog = sequelize.define('WhatsappMensagemLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sessao: { type: DataTypes.STRING, allowNull: false },
  numero: { type: DataTypes.STRING, allowNull: false },
  // confirmacao_pedido | status_pedido | tempo_espera | resposta_automatica | outro
  tipo: { type: DataTypes.STRING, allowNull: false, defaultValue: 'outro' },
  pedidoId: { type: DataTypes.INTEGER, allowNull: true },
  ordem: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING, allowNull: false }, // enviada | falha
  tentativas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  latenciaMs: { type: DataTypes.INTEGER, allowNull: true },
  erro: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'whatsapp_mensagens_log',
  timestamps: true,
  updatedAt: false,
  indexes: [{ fields: ['createdAt'] }, { fields: ['numero'] }, { fields: ['pedidoId'] }],
});

export default WhatsappMensagemLog;
