import { CategoriaProduto, Produto, GrupoOpcao, SubProduto } from "../models/index.js";
import { normalizeMenuCategories } from "../utils/publicUrl.js";

class MenuController{
    //funcao para montar o menu do cardápio com as categorias de produtos e os produtos
    async getMenu() {
        try {
            const categoriaProdutos = await CategoriaProduto.findAll({
                include: {
                    model: Produto,
                    where: {
                        isAtivo: true
                    },
                    include: {
                        model: GrupoOpcao,
                        as: 'gruposOpcoes',
                        required: false,
                        include: {
                            model: SubProduto,
                            as: 'opcoes',
                            where: {
                                isAtivo: true 
                            },
                            required: false 
                        }
                    }
                }
            })

            const plainMenu = categoriaProdutos.map((category) => category.get({ plain: true }));
            return normalizeMenuCategories(plainMenu);
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }
}

export default new MenuController()