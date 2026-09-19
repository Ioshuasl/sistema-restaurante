import { Op } from "sequelize";
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
                where: {
                    tipoMenu: { [Op.in]: [tipoSolicitado, 'ambos'] },
                },
                include: {
                    model: Produto,
                    where: {
                        isAtivo: true,
                        tipoMenu: { [Op.in]: [tipoSolicitado, 'ambos'] },
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

            // Remove categorias sem produtos após o filtro (required: false pode trazer vazias)
            const plainMenu = categoriaProdutos
                .map((category) => category.get({ plain: true }))
                .filter((cat) => Array.isArray(cat.Produtos) && cat.Produtos.length > 0)
                .filter((cat) => pertenceAoMenu(cat.tipoMenu, tipoSolicitado));

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
