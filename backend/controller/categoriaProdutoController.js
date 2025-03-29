import CategoriaProduto from "../models/categoriaProdutoModels.js"
import Produto from "../models/produtoModels.js"

Produto.belongsTo(CategoriaProduto, {foreignKey:'categoriaProduto_id'})
CategoriaProduto.hasMany(Produto,{foreignKey:'categoriaProduto_id'})

class CategoriaProdutoController{
    async createCategoriaProduto(nomeCategoriaProduto){
        try {
            const categoriaProduto = await CategoriaProduto.create(nomeCategoriaProduto)
            return {message:"Categoria de produto criado com sucesso",categoriaProduto}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
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
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async findCategoriaProduto(id) {
        try {
            const categoriaProduto = await CategoriaProduto.findByPk(id)
            return categoriaProduto
        } catch (error) {
            console.error(error)
            return error
        }
    }
    async updateCategoriaProduto(id, updatedata){
        try {
            const categoriaProduto = await CategoriaProduto.update(updatedata, {
                where: {id:id}
            })
            return {message:"Categoria de produto atualizado com sucesso", categoriaProduto}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async deleteCategoriaProduto(id){
        try {
            const categoriaProduto = await CategoriaProduto.destroy({
                where: {id: id}
            })
            return {message:"Categoria de produto excluído com sucesso", categoriaProduto}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
        }
    }
}

export default new CategoriaProdutoController()