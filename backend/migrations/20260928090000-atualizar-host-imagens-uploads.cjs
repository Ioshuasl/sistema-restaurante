'use strict';

const OLD_HOST = 'https://projeto-backend-restaurante.lwcbm0.easypanel.host';
const NEW_HOST = 'https://api-gs-sabores.ioshuavps.com.br';

async function replaceHost(queryInterface, from, to) {
  await queryInterface.sequelize.query(
    `UPDATE "produtos" SET "image" = REPLACE("image", :from, :to) WHERE "image" LIKE :pattern;`,
    { replacements: { from, to, pattern: `${from}/%` } }
  );

  await queryInterface.sequelize.query(
    `UPDATE "config" SET "bannerImage" = REPLACE("bannerImage", :from, :to) WHERE "bannerImage" LIKE :pattern;`,
    { replacements: { from, to, pattern: `${from}/%` } }
  );
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await replaceHost(queryInterface, OLD_HOST, NEW_HOST);
  },

  async down(queryInterface) {
    await replaceHost(queryInterface, NEW_HOST, OLD_HOST);
  },
};
