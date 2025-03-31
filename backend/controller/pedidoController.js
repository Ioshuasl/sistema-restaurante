import Pedido from "../models/pedidoModels.js"
import FormaPagamento from "../models/formaPagamentoModels.js"

Pedido.belongsTo(FormaPagamento, {foreignKey:'formaPagamento_id'})
FormaPagamento.hasMany(Pedido, {foreignKey:'formaPagamento_id'})

class PedidoController{

    //funcao para criar pedido
    async createPedido(produtosPedido, valorPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente){
        
        //verificar se a forma de pagamento usada existe no sistema
        const verificarFormaPagamento = FormaPagamento.findByPk(formaPagamento_id)
        if (verificarFormaPagamento){
            console.log("Forma de pagamento encontrado, continua a funcao")
        } else {
            return {message: "Forma de pagamento não está cadastrada"}
        }
        
        try {
            const pedido = Pedido.create(produtosPedido, valorPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente)
            return pedido
        } catch (error) {
            return {message: "Erro ao tentar criar pedido",error}
        }
    }

    //funcao para encontrar e contar todos os pedidos cadastrados na aplicacao
    async findAndCountAllPedidos(){
        try {
            const pedidos = Pedido.findAndCountAll()
            return pedidos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar encontrar pedidos",error}
        }
    }

    //funcao para encontrar todos os pedidos cadastrados na aplicacao
    async findAllPedidos(){
        try {
            const pedidos = await Pedido.findAll()
            return pedidos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar encontrar pedidos",error}
        }
    }

    //funcao para encontrar pedido que estao vinculados a uma forma de pagamento
    async findPedidosByFormaPagamento(formaPagamento_id){
        try {
            const pedidos = await Pedido.findAll({
                where:{
                    formaPagamento_id: formaPagamento_id
                }
            })
            return pedidos
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar encontrar os pedidos",error}
        }
    }

    //funcao para atualizar pedido
    async updatePedido(updatedData,id){
        try {
            const pedido = Pedido.update(updatedData,{
                where:{
                    id:id
                }
            })
            return pedido
        } catch (error) {
            console.error(error)
            return {message: "Erro ao tentar atualizar um pedido",error}
        }
    }
}

export default new PedidoController()