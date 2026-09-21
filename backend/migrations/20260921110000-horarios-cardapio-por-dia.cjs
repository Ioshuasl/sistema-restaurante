'use strict';

const DEFAULT_PERIODOS = {
  dia: { inicio: '11:00', fim: '15:00' },
  noite: { inicio: '18:00', fim: '23:00' },
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT id, "horariosFuncionamento", "periodosCardapio"
      FROM "config"
    `);

    for (const row of rows) {
      const defaults = {
        dia: row.periodosCardapio?.dia || DEFAULT_PERIODOS.dia,
        noite: row.periodosCardapio?.noite || DEFAULT_PERIODOS.noite,
      };

      const lista = Array.isArray(row.horariosFuncionamento)
        ? row.horariosFuncionamento
        : [];

      const byDia = new Map();
      for (const item of lista) {
        if (item && typeof item.dia === 'number') byDia.set(item.dia, item);
      }

      const migrado = Array.from({ length: 7 }, (_, dia) => {
        const raw = byDia.get(dia) || {
          dia,
          aberto: true,
          inicio: defaults.dia.inicio,
          fim: defaults.noite.fim,
        };

        if (raw.periodos?.dia && raw.periodos?.noite) {
          return {
            dia,
            aberto: raw.aberto !== false,
            inicio: raw.inicio || raw.periodos.dia.inicio,
            fim: raw.fim || raw.periodos.noite.fim,
            periodos: {
              dia: {
                ativo: raw.periodos.dia.ativo ?? raw.aberto !== false,
                inicio: raw.periodos.dia.inicio || defaults.dia.inicio,
                fim: raw.periodos.dia.fim || defaults.dia.fim,
              },
              noite: {
                ativo: raw.periodos.noite.ativo ?? raw.aberto !== false,
                inicio: raw.periodos.noite.inicio || defaults.noite.inicio,
                fim: raw.periodos.noite.fim || defaults.noite.fim,
              },
            },
          };
        }

        const aberto = raw.aberto !== false;
        return {
          dia,
          aberto,
          inicio: raw.inicio || defaults.dia.inicio,
          fim: raw.fim || defaults.noite.fim,
          periodos: {
            dia: {
              ativo: aberto,
              inicio: defaults.dia.inicio,
              fim: defaults.dia.fim,
            },
            noite: {
              ativo: aberto,
              inicio: defaults.noite.inicio,
              fim: defaults.noite.fim,
            },
          },
        };
      });

      await queryInterface.sequelize.query(
        `
          UPDATE "config"
          SET "horariosFuncionamento" = :horarios::jsonb,
              "periodosCardapio" = :periodos::jsonb,
              "updatedAt" = NOW()
          WHERE id = :id
        `,
        {
          replacements: {
            id: row.id,
            horarios: JSON.stringify(migrado),
            periodos: JSON.stringify(defaults),
          },
        }
      );
    }
  },

  async down(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT id, "horariosFuncionamento"
      FROM "config"
    `);

    for (const row of rows) {
      const lista = Array.isArray(row.horariosFuncionamento)
        ? row.horariosFuncionamento
        : [];

      const legado = lista.map((item) => ({
        dia: item.dia,
        aberto: item.aberto !== false,
        inicio: item.inicio || item.periodos?.dia?.inicio || '11:00',
        fim: item.fim || item.periodos?.noite?.fim || '23:00',
      }));

      await queryInterface.sequelize.query(
        `
          UPDATE "config"
          SET "horariosFuncionamento" = :horarios::jsonb,
              "updatedAt" = NOW()
          WHERE id = :id
        `,
        {
          replacements: {
            id: row.id,
            horarios: JSON.stringify(legado),
          },
        }
      );
    }
  },
};
