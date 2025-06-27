import Pedido from "../models/pedidoModels.js";
import SituacaoPedido from "../models/situacaoProdutoModel.js";

SituacaoPedido.belongsTo(Pedido, { foreignKey: 'pedido_id' })
Pedido.hasOne(SituacaoPedido, { foreignKey: 'pedido_id' })

class SituacaoPedidoController {
    //função para criar situação de pedido
    async createSituacaoPedido(nome, descricao, pedido_id) {
        try {
            const situacaoPedido = await SituacaoPedido.create({ nome, descricao, pedido_id })
            return situacaoPedido
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para mostrar todas as situações de pedido
    async getAllSituacaoPedido() {
        try {
            const situacaoPedidos = await SituacaoPedido.findAll()
            return situacaoPedidos
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para mostrar situação de pedido pelo id
    async getSituacaoPedido(id) {
        try {
            const situacaoPedido = await SituacaoPedido.findByPk(id)
            return situacaoPedido
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para atualizar situação de pedido
    async updateSituacaoPedido(id, updatedData) {

        const verificar = await SituacaoPedido.findByPk(id)

        if (!verificar) {
            throw new Error(`Não existe situação de pedido com o seguinte id`, id)
        }

        try {
            const situacaoPedido = await SituacaoPedido.update(updatedData, {
                where: {
                    id: id
                }
            })
            return situacaoPedido
        } catch (error) {
            console.error(error)
            return error
        }
    }

    //função para deletar situação de pedido
    async deleteSituacaoPedido(id) {
        const verificar = await SituacaoPedido.findByPk(id)

        if (!verificar) {
            throw new Error(`Não existe situação de pedido com o seguinte id`, id)
        }

        try {
            const situacaoPedido = await SituacaoPedido.destroy({
                where: {
                    id: id
                }
            })
            return situacaoPedido
        } catch (error) {
            console.error(error)
            return error
        }
    }
}

export default new SituacaoPedidoController()