import Produto from "../models/produtoModels.js"
import CategoriaProduto from "../models/categoriaProdutoModels.js"

Produto.belongsTo(CategoriaProduto, {foreignKey:'categoriaProduto_id'})
CategoriaProduto.hasMany(Produto,{foreignKey:'categoriaProduto_id'})

class ProdutoController{
    async createProduto(nomeProduto, valorProduto, isAtivo, categoriaProduto_id){
        try {
            const produto = await Produto.create(nomeProduto, valorProduto, isAtivo, categoriaProduto_id)
            return {message: "Produto criado com sucesso", produto}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async findAndCountAllProdutos(){
        try {
            const produtos = await Produto.findAndCountAll()
            return produtos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async findProduto(id){
        try {
            const produto = await Produto.findByPk(id)
            return produto
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async updateProduto(id, dataUpdate){
        try {
            const produto = await Produto.update(dataUpdate, {
                where: {id:id}
            })
            return {message: "Produto atualizado com sucesso", produto}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async deleteProduto(id){
        try {
            const produto = await Produto.destroy({
                where: {id:id}
            })
            return {message:"Produto excluído com sucesso", produto}
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }
}

export default new ProdutoController()