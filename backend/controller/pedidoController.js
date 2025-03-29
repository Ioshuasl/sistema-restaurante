import Pedido from "../models/pedidoModels.js"
import FormaPagamento from "../models/formaPagamentoModels.js"

Pedido.belongsTo(FormaPagamento, {foreignKey:'formaPagamento_id'})
FormaPagamento.hasMany(Pedido, {foreignKey:'formaPagamento_id'})

class PedidoController{
    async createPedido(produtosPedido, valorPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente){
        try {
            const pedido = Pedido.create(produtosPedido, valorPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente)
            return {message:'Pedido criado com sucesso', pedido}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
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

    async findAllPedidos(){
        try {
            const pedidos = await Pedido.findAll()
            return pedidos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar executar a função",error}
        }
    }
}

export default new PedidoController()