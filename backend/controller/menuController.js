import { CategoriaProduto, Produto, GrupoOpcao, SubProduto } from "../models/index.js";

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
                    // O 'include' aninhado funciona porque o Sequelize
                    // já "sabe" da associação 'gruposOpcoes'
                    include: {
                        model: GrupoOpcao,
                        as: 'gruposOpcoes', // O 'as' deve bater com a associação
                        required: false,   
                        
                        include: {
                            model: SubProduto,
                            as: 'opcoes', // O 'as' deve bater com a associação
                            where: {
                                isAtivo: true 
                            },
                            required: false 
                        }
                    }
                }
            })
            return categoriaProdutos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }
}

export default new MenuController()