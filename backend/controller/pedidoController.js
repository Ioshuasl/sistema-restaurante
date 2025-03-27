import Pedido from "../models/pedidoModels.js"

class PedidoController{
    async createPedido(produtosPedido, valorPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente){
        try {
            const pedido = Pedido.create(produtosPedido, valorPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente)
            return pedido
        } catch (error) {
            return error
        }
    }

    async findAndCountAllPedidos(){
        try {
            const pedidos = Pedido.findAndCountAll()
            return pedidos
        } catch (error) {
            return error
        }
    }
}

export default new PedidoController()