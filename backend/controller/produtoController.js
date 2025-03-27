import Produto from "../models/produtoModels.js"

class ProdutoController{
    async createProduto(nomeProduto, valorProduto, isAtivo, categoriaProduto_id){
        try {
            const produto = await Produto.create(nomeProduto, valorProduto, isAtivo, categoriaProduto_id)
            return produto
        } catch (error) {
            return error
        }
    }

    async findAndCountAllProdutos(){
        try {
            const produtos = await Produto.findAndCountAll()
            return produtos
        } catch (error) {
            return error
        }
    }

    async findProduto(id){
        try {
            const produto = await Produto.findByPk(id)
            return produto
        } catch (error) {
            
        }
    }

    async updateProduto(id, dataUpdate){
        try {
            const produto = await Produto.update(dataUpdate, {
                where: {id:id}
            })
            return produto
        } catch (error) {
            return error
        }
    }

    async deleteProduto(id){
        try {
            const produto = await Produto.destroy({
                where: {id:id}
            })
        } catch (error) {
            
        }
    }
}

export default new ProdutoController()