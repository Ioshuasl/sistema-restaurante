import { CategoriaProduto, Produto, SubProduto, GrupoOpcao, sequelize } from "../models/index.js";

class CategoriaProdutoController {

    async createCategoriaProduto(nomeCategoriaProduto, tipoMenu = 'dia') {
        try {
            const maxOrdem = await CategoriaProduto.max('ordem');
            const nextOrdem = Number.isFinite(maxOrdem) ? Number(maxOrdem) + 1 : 0;

            const categoriaProduto = await CategoriaProduto.create({
                nomeCategoriaProduto,
                tipoMenu: tipoMenu || 'dia',
                ordem: nextOrdem,
            });
            return { message: "Categoria de produto criado com sucesso", categoriaProduto };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }

    async findAllCategoriaProdutos() {
        try {
            const categoriaProdutos = await CategoriaProduto.findAll({
                order: [
                    ['ordem', 'ASC'],
                    ['id', 'ASC'],
                ],
                include: [{
                    model: Produto,
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
                }],
            });
            return categoriaProdutos;
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }

    async findCategoriaProduto(id) {
        try {
            const categoriaProduto = await CategoriaProduto.findByPk(id);
            return categoriaProduto;
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async updateCategoriaProduto(id, updatedata) {
        try {
            const categoriaProduto = await CategoriaProduto.update(updatedata, {
                where: { id: id },
            });
            return { message: "Categoria de produto atualizado com sucesso", categoriaProduto };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }

    /**
     * Reordena categorias conforme a lista de IDs (posição no array = ordem).
     * @param {number[]} orderedIds
     */
    async reorderCategoriaProdutos(orderedIds) {
        const t = await sequelize.transaction();
        try {
            if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
                throw new Error('Lista de IDs inválida.');
            }

            const ids = orderedIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));
            const existing = await CategoriaProduto.findAll({
                attributes: ['id'],
                transaction: t,
            });
            const existingIds = new Set(existing.map((c) => c.id));

            if (ids.length !== existingIds.size || ids.some((id) => !existingIds.has(id))) {
                throw new Error('A lista de categorias não corresponde ao cadastro atual.');
            }

            await Promise.all(
                ids.map((id, index) =>
                    CategoriaProduto.update(
                        { ordem: index },
                        { where: { id }, transaction: t }
                    )
                )
            );

            await t.commit();
            return { message: 'Ordem das categorias atualizada com sucesso.' };
        } catch (error) {
            await t.rollback();
            console.error(error);
            return { message: 'Erro ao reordenar categorias', error: error.message || error };
        }
    }

    async deleteCategoriaProduto(id) {
        try {
            const categoriaProduto = await CategoriaProduto.destroy({
                where: { id: id },
            });
            return { message: "Categoria de produto excluído com sucesso", categoriaProduto };
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar executar a função", error };
        }
    }
}

export default new CategoriaProdutoController();
