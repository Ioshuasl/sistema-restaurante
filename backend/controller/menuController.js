import CategoriaProduto from "../models/categoriaProdutoModels.js"
import Produto from "../models/produtoModels.js"

Produto.belongsTo(CategoriaProduto, { foreignKey: 'categoriaProduto_id'});
CategoriaProduto.hasMany(Produto, { foreignKey: 'categoriaProduto_id' })

class MenuController{
    //funcao para montar o menu do cardápio com as categorias de produtos e os produtos
    async getMenu() {
        try {
            const categoriaProdutos = await CategoriaProduto.findAll({
                include: {
                    model: Produto,
                    where: {
                        isAtivo: true
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