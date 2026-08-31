import { CategoriaProduto, Produto, SubProduto, GrupoOpcao } from "../models/index.js";


class CategoriaProdutoController {

    //funcao para criar categoria de produto
    async createCategoriaProduto(nomeCategoriaProduto) {
        try {
            const categoriaProduto = await CategoriaProduto.create({ nomeCategoriaProduto })
            return { message: "Categoria de produto criado com sucesso", categoriaProduto }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para encontrar todas as categorias de produto cadastrado na aplicacao
    async findAllCategoriaProdutos() {
        try {
            const categoriaProdutos = await CategoriaProduto.findAll({
                include: [{
                    model: Produto,          
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
                }]
            })
            return categoriaProdutos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para encontrar categoria de produto a partir do ID
    async findCategoriaProduto(id) {
        try {
            const categoriaProduto = await CategoriaProduto.findByPk(id)
            return categoriaProduto
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //funcao para atualizar categoria de produto
    async updateCategoriaProduto(id, updatedata) {
        try {
            const categoriaProduto = await CategoriaProduto.update(updatedata, {
                where: { id: id }
            })
            return { message: "Categoria de produto atualizado com sucesso", categoriaProduto }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para deletar categoria de produto
    async deleteCategoriaProduto(id) {
        try {
            const categoriaProduto = await CategoriaProduto.destroy({
                where: { id: id }
            })
            return { message: "Categoria de produto excluído com sucesso", categoriaProduto }
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar executar a função", error }
        }
    }
}

export default new CategoriaProdutoController()