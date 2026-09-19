/**
 * Garante colunas/enums da feature de cardápio dia/noite.
 * Seguro para rodar várias vezes (IF NOT EXISTS).
 */
export async function ensureCardapioSchema(sequelize) {
    await sequelize.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_produtos_tipo_menu') THEN
                CREATE TYPE "enum_produtos_tipo_menu" AS ENUM ('dia', 'noite', 'ambos');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_categoria_produtos_tipo_menu') THEN
                CREATE TYPE "enum_categoria_produtos_tipo_menu" AS ENUM ('dia', 'noite', 'ambos');
            END IF;
        END
        $$;
    `);

    // Sequelize costuma criar enums com o nome do atributo camelCase
    await sequelize.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_produtos_tipoMenu') THEN
                CREATE TYPE "enum_produtos_tipoMenu" AS ENUM ('dia', 'noite', 'ambos');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_categoria_produtos_tipoMenu') THEN
                CREATE TYPE "enum_categoria_produtos_tipoMenu" AS ENUM ('dia', 'noite', 'ambos');
            END IF;
        END
        $$;
    `);

    await sequelize.query(`
        ALTER TABLE "config"
        ADD COLUMN IF NOT EXISTS "periodosCardapio" JSONB
        NOT NULL
        DEFAULT '{"dia":{"inicio":"11:00","fim":"15:00"},"noite":{"inicio":"18:00","fim":"23:00"}}'::jsonb;
    `);

    // Detecta qual enum existe para produtos
    const [prodEnumRows] = await sequelize.query(`
        SELECT typname FROM pg_type
        WHERE typname IN ('enum_produtos_tipoMenu', 'enum_produtos_tipo_menu')
        ORDER BY typname
        LIMIT 1;
    `);
    const prodEnum = prodEnumRows?.[0]?.typname || 'enum_produtos_tipoMenu';

    const [catEnumRows] = await sequelize.query(`
        SELECT typname FROM pg_type
        WHERE typname IN ('enum_categoria_produtos_tipoMenu', 'enum_categoria_produtos_tipo_menu')
        ORDER BY typname
        LIMIT 1;
    `);
    const catEnum = catEnumRows?.[0]?.typname || 'enum_categoria_produtos_tipoMenu';

    await sequelize.query(`
        ALTER TABLE "produtos"
        ADD COLUMN IF NOT EXISTS "tipoMenu" "${prodEnum}"
        NOT NULL DEFAULT 'ambos';
    `);

    await sequelize.query(`
        ALTER TABLE "categoria_produtos"
        ADD COLUMN IF NOT EXISTS "tipoMenu" "${catEnum}"
        NOT NULL DEFAULT 'ambos';
    `);
}
