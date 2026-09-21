'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Dados atuais pertencem ao cardápio do dia; o da noite ainda será configurado.
    await queryInterface.sequelize.query(`
      UPDATE "produtos"
      SET "tipoMenu" = 'dia'
      WHERE "tipoMenu" IS DISTINCT FROM 'dia';
    `);

    await queryInterface.sequelize.query(`
      UPDATE "categoria_produtos"
      SET "tipoMenu" = 'dia'
      WHERE "tipoMenu" IS DISTINCT FROM 'dia';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "produtos"
      ALTER COLUMN "tipoMenu" SET DEFAULT 'dia';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "categoria_produtos"
      ALTER COLUMN "tipoMenu" SET DEFAULT 'dia';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "produtos"
      ALTER COLUMN "tipoMenu" SET DEFAULT 'ambos';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "categoria_produtos"
      ALTER COLUMN "tipoMenu" SET DEFAULT 'ambos';
    `);

    await queryInterface.sequelize.query(`
      UPDATE "produtos"
      SET "tipoMenu" = 'ambos'
      WHERE "tipoMenu" = 'dia';
    `);

    await queryInterface.sequelize.query(`
      UPDATE "categoria_produtos"
      SET "tipoMenu" = 'ambos'
      WHERE "tipoMenu" = 'dia';
    `);
  },
};
