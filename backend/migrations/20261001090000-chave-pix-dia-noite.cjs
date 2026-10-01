'use strict';

const TIPOS_PIX = ['cpf', 'cnpj', 'email', 'telefone', 'aleatoria'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tipoColumn = (comment) => ({
        type: Sequelize.ENUM(...TIPOS_PIX),
        allowNull: true,
        defaultValue: 'cnpj',
        comment,
      });
      const chaveColumn = (comment) => ({
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
        comment,
      });

      await queryInterface.addColumn(
        'config',
        'tipoChavePixDia',
        tipoColumn('Tipo da chave PIX do cardápio do dia (almoço)'),
        { transaction }
      );
      await queryInterface.addColumn(
        'config',
        'chavePixDia',
        chaveColumn('Chave PIX do cardápio do dia (almoço)'),
        { transaction }
      );
      await queryInterface.addColumn(
        'config',
        'tipoChavePixNoite',
        tipoColumn('Tipo da chave PIX do cardápio da noite (jantar)'),
        { transaction }
      );
      await queryInterface.addColumn(
        'config',
        'chavePixNoite',
        chaveColumn('Chave PIX do cardápio da noite (jantar)'),
        { transaction }
      );

      // Colunas legadas "tipoChavePix"/"chavePix" são mantidas para não derrubar a versão anterior durante o deploy.
      await queryInterface.sequelize.query(
        `UPDATE "config" SET
           "tipoChavePixDia" = "tipoChavePix",
           "chavePixDia" = "chavePix",
           "tipoChavePixNoite" = "tipoChavePix",
           "chavePixNoite" = "chavePix";`,
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
        `UPDATE "config" SET "tipoChavePix" = "tipoChavePixDia", "chavePix" = "chavePixDia";`,
        { transaction }
      );
      await queryInterface.removeColumn('config', 'chavePixNoite', { transaction });
      await queryInterface.removeColumn('config', 'tipoChavePixNoite', { transaction });
      await queryInterface.removeColumn('config', 'chavePixDia', { transaction });
      await queryInterface.removeColumn('config', 'tipoChavePixDia', { transaction });
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_config_tipoChavePixDia"; DROP TYPE IF EXISTS "enum_config_tipoChavePixNoite";`,
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
