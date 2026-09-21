import sequelize from '../config/database.js';

async function main() {
  console.log('Testando conexao com o banco...');
  console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    dialect: process.env.DB_DIALECT,
  });

  try {
    await sequelize.authenticate();
    console.log('OK: conexao estabelecida');

    const [rows] = await sequelize.query(`
      SELECT
        current_database() AS db,
        current_user AS db_user,
        version() AS version
    `);

    console.log('Detalhes:', rows[0]);

    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`Tabelas publicas encontradas: ${tables.length}`);
    console.log(tables.map((t) => t.table_name).join(', '));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('FALHA na conexao:', error.message);
    if (error.parent?.code) {
      console.error('Codigo:', error.parent.code);
    }
    try {
      await sequelize.close();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

main();
