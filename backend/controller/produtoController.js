import Produto from "../models/produtoModels.js"
import CategoriaProduto from "../models/categoriaProdutoModels.js"

Produto.belongsTo(CategoriaProduto, {foreignKey:'categoriaProduto_id'})
CategoriaProduto.hasMany(Produto,{foreignKey:'categoriaProduto_id'})

class ProdutoController{

    //funcao para criar produto
    async createProduto(nomeProduto, valorProduto, isAtivo, categoriaProduto_id){

        //verificar se a categoria de produto selecionado existe
        const verificarCategoriaProduto = await CategoriaProduto.findByPk(categoriaProduto_id)
        if (verificarCategoriaProduto){
            console.log("Categoria de produto encontrado, continua a funcao")
        } else {
            return {message: "Essa categoria de produto não está cadastrada no sistema"}
        }

        try {
            const produto = await Produto.create({nomeProduto, valorProduto, isAtivo, categoriaProduto_id})
            return produto
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para encontrar todos os produtos cadastrados no sistema
    async findAndCountAllProdutos(){
        try {
            const produtos = await Produto.findAndCountAll()
            return produtos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para encontrar todos os produtos que estiverem ativos no sistema
    async findAllProdutosAtivos(){
        try {
            const produtos = await Produto.findAll({
                where:{
                    isAtivo: true
                }
            })
            return produtos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar encontrar apenas os produtos ativos", error}
        }
    }

    //funcao para encontrar produto por ID
    async findProduto(id){
        try {
            const produto = await Produto.findByPk(id)
            return produto
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    //funcao para atualizar produto
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

    //funcao para excluir produto
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

    //funcao para ativar ou desativar produto do sistema
    async toggleProdutoAtivo(id){

        const produto = await Produto.findByPk(id)

        //verificando se o produto foi encontrado antes de fazer as alteracoes
        if (produto){
            console.log("Produto encontrado, continua a funcao")
        } else {
            return {message: "Produto nao encontrado no sistema"}
        }

        try {
            //alternando o boolean do produto
            produto.isAtivo = !produto.isAtivo
            //salvando as alteracoes
            await produto.save()
            return produto
        } catch (error) {
            return {message:"Erro ao tentar modificar produto", error}
        }
    }
}

export default new ProdutoController()