'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categoria_produtos', 'ordem', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Ordem de exibição no cardápio (menor = primeiro)',
    });

    // Inicializa pela ordem de criação (id crescente)
    await queryInterface.sequelize.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) - 1 AS nova_ordem
        FROM "categoria_produtos"
      )
      UPDATE "categoria_produtos" AS c
      SET "ordem" = ranked.nova_ordem
      FROM ranked
      WHERE c.id = ranked.id;
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categoria_produtos', 'ordem');
  },
};
