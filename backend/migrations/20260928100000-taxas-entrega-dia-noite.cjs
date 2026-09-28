'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'config',
        'taxaEntregaDia',
        {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Taxa de entrega do cardápio do dia (almoço)',
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'config',
        'taxaEntregaNoite',
        {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Taxa de entrega do cardápio da noite (jantar)',
        },
        { transaction }
      );

      // Coluna legada "taxaEntrega" é mantida para não derrubar a versão anterior durante o deploy.
      await queryInterface.sequelize.query(
        `UPDATE "config" SET "taxaEntregaDia" = "taxaEntrega", "taxaEntregaNoite" = "taxaEntrega";`,
        { transaction }
      );

      await queryInterface.addColumn(
        'pedidos',
        'taxaEntrega',
        {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Taxa de entrega aplicada no momento do pedido',
        },
        { transaction }
      );

      // Pedidos antigos: a impressão usava a taxa atual da config; mantém esse valor como histórico.
      await queryInterface.sequelize.query(
        `UPDATE "pedidos"
         SET "taxaEntrega" = COALESCE((SELECT "taxaEntrega" FROM "config" ORDER BY id ASC LIMIT 1), 0)
         WHERE "isRetiradaEstabelecimento" = false;`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `UPDATE "config" SET "taxaEntrega" = "taxaEntregaDia";`,
        { transaction }
      );
      await queryInterface.removeColumn('pedidos', 'taxaEntrega', { transaction });
      await queryInterface.removeColumn('config', 'taxaEntregaNoite', { transaction });
      await queryInterface.removeColumn('config', 'taxaEntregaDia', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
