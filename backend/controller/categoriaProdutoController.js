import CategoriaProduto from "../models/categoriaProdutoModels.js"
import Produto from "../models/produtoModels.js"

class CategoriaProdutoController{
    async createCategoriaProduto(nomeCategoriaProduto){
        try {
            const categoriaProduto = await CategoriaProduto.create(nomeCategoriaProduto)
            return categoriaProduto
        } catch (error) {
            return error
        }
    }

    async findAndCountAllCategoriaprodutos(){
        try {
            const categoriaProdutos = await CategoriaProduto.findAndCountAll({
                include:{
                    model:Produto
                }
            })
            return categoriaProdutos
        } catch (error) {
            return error
        }
    }

    async updateCategoriaProduto(id, updatedata){
        try {
            const categoriaProduto = await CategoriaProduto.update(updatedata, {
                where: {id:id}
            })
            return categoriaProduto
        } catch (error) {
            return error
        }
    }

    async deleteCategoriaProduto(id){
        try {
            const categoriaProduto = await CategoriaProduto.destroy({
                where: {id: id}
            })
            return categoriaProduto
        } catch (error) {
            return error
        }
    }
}

export default new CategoriaProdutoController()