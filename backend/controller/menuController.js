import { CategoriaProduto, Produto, GrupoOpcao, SubProduto, Config } from "../models/index.js";
import { normalizeMenuCategories } from "../utils/publicUrl.js";
import {
    resolverTipoMenuAtivo,
    resolvePeriodosParaAgora,
    pertenceAoMenu,
} from "../utils/cardapioPeriodo.js";

class MenuController {
    /**
     * @param {'auto' | 'dia' | 'noite'} tipoQuery
     */
    async getMenu(tipoQuery = 'auto') {
        try {
            const config = await Config.findByPk(1);
            const periodosHoje = resolvePeriodosParaAgora(config);
            const tipoAtivo = resolverTipoMenuAtivo(periodosHoje);

            let tipoSolicitado = tipoQuery === 'auto' ? tipoAtivo : tipoQuery;
            if (tipoSolicitado !== 'dia' && tipoSolicitado !== 'noite') {
                // Fora do período e auto: fallback para dia (visualização)
                tipoSolicitado = 'dia';
            }

            const pedindoHabilitado = tipoAtivo != null && tipoSolicitado === tipoAtivo;

            const categoriaProdutos = await CategoriaProduto.findAll({
                order: [
                    ['ordem', 'ASC'],
                    ['id', 'ASC'],
                ],
                include: {
                    model: Produto,
                    separate: true,
                    order: [
                        ['id', 'ASC'],
                    ],
                    where: {
                        isAtivo: true,
                    },
                    required: false,
                    include: {
                        model: GrupoOpcao,
                        as: 'gruposOpcoes',
                        required: false,
                        include: {
                            model: SubProduto,
                            as: 'opcoes',
                            where: {
                                isAtivo: true,
                            },
                            required: false,
                        },
                    },
                },
            });

            // Filtro de tipoMenu em JS (Op.in em ENUM no Postgres/Sequelize pode zerar o include)
            const plainMenu = categoriaProdutos
                .map((category) => category.get({ plain: true }))
                .filter((cat) => pertenceAoMenu(cat.tipoMenu, tipoSolicitado))
                .map((cat) => {
                    const produtos = (cat.Produtos || cat.produtos || []).filter((p) =>
                        pertenceAoMenu(p.tipoMenu, tipoSolicitado)
                    );
                    const rest = { ...cat };
                    delete rest.produtos;
                    rest.Produtos = produtos;
                    return rest;
                })
                .filter((cat) => cat.Produtos.length > 0)
                // Garante ordem mesmo após filtros / includes
                .sort((a, b) => {
                    const oa = Number.isFinite(a.ordem) ? a.ordem : a.id;
                    const ob = Number.isFinite(b.ordem) ? b.ordem : b.id;
                    return oa - ob || a.id - b.id;
                });

            const categorias = normalizeMenuCategories(plainMenu);

            return {
                categorias,
                meta: {
                    tipoSolicitado,
                    tipoAtivo,
                    pedindoHabilitado,
                    periodosCardapio: {
                        dia: { inicio: periodosHoje.dia.inicio, fim: periodosHoje.dia.fim },
                        noite: { inicio: periodosHoje.noite.inicio, fim: periodosHoje.noite.fim },
                    },
                },
            };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }
}

export default new MenuController();
