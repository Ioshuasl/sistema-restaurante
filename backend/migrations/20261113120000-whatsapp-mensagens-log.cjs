'use strict';

/** Cria a tabela de log de mensagens de WhatsApp (aditiva: não altera nenhuma tabela existente). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whatsapp_mensagens_log', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sessao: { type: Sequelize.STRING, allowNull: false },
      numero: { type: Sequelize.STRING, allowNull: false },
      tipo: { type: Sequelize.STRING, allowNull: false, defaultValue: 'outro' },
      pedidoId: { type: Sequelize.INTEGER, allowNull: true },
      ordem: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.STRING, allowNull: false },
      tentativas: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      latenciaMs: { type: Sequelize.INTEGER, allowNull: true },
      erro: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('whatsapp_mensagens_log', ['createdAt']);
    await queryInterface.addIndex('whatsapp_mensagens_log', ['numero']);
    await queryInterface.addIndex('whatsapp_mensagens_log', ['pedidoId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('whatsapp_mensagens_log');
  },
};
