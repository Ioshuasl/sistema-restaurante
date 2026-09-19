import { CategoriaProduto, Produto, GrupoOpcao, SubProduto, Config } from "../models/index.js";
import { normalizeMenuCategories } from "../utils/publicUrl.js";
import {
    DEFAULT_PERIODOS_CARDAPIO,
    resolverTipoMenuAtivo,
    pertenceAoMenu,
} from "../utils/cardapioPeriodo.js";

class MenuController {
    async getPeriodosCardapio() {
        const config = await Config.findByPk(1);
        return config?.periodosCardapio ?? DEFAULT_PERIODOS_CARDAPIO;
    }

    /**
     * @param {'auto' | 'dia' | 'noite'} tipoQuery
     */
    async getMenu(tipoQuery = 'auto') {
        try {
            const periodos = await this.getPeriodosCardapio();
            const tipoAtivo = resolverTipoMenuAtivo(periodos);

            let tipoSolicitado = tipoQuery === 'auto' ? tipoAtivo : tipoQuery;
            if (tipoSolicitado !== 'dia' && tipoSolicitado !== 'noite') {
                // Fora do período e auto: fallback para dia (visualização)
                tipoSolicitado = 'dia';
            }

            const pedindoHabilitado = tipoAtivo != null && tipoSolicitado === tipoAtivo;

            const categoriaProdutos = await CategoriaProduto.findAll({
                include: {
                    model: Produto,
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
                .filter((cat) => cat.Produtos.length > 0);

            const categorias = normalizeMenuCategories(plainMenu);

            return {
                categorias,
                meta: {
                    tipoSolicitado,
                    tipoAtivo,
                    pedindoHabilitado,
                    periodosCardapio: periodos,
                },
            };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }
}

export default new MenuController();
