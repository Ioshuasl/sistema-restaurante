import FormaPagamento from "../models/formaPagamentoModels.js"
import Pedido from "../models/pedidoModels.js"

Pedido.belongsTo(FormaPagamento, {foreignKey:'formaPagamento_id'})
FormaPagamento.hasMany(Pedido, {foreignKey:'formaPagamento_id'})

class FormaPagamentoController{
    async createFormaPagamento(nomeFormaPagamento){
        try {
            const formaPagamento = FormaPagamento.create(nomeFormaPagamento)
            return {message:"Forma de pagamento criado com sucesso", formaPagamento}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async findAllFormaPagamento(){
        try {
            const formaPagamentos = FormaPagamento.findAll()
            return formaPagamentos
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async updateFormaPagamento(id,updatedData){
        try {
            const formaPagamento = FormaPagamento.update(updatedData, {
                where:{
                    id:id
                }
            })
            return {message:"Forma de pagamento atualizado com sucesso", formaPagamento}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
        }
    }

    async deleteFormaPagamento(id){
        try {
            const formaPagamento = FormaPagamento.destroy({
                where:{
                    id:id
                }
            })
            return {message:"Forma de pagamento excluído com sucesso", formaPagamento}
        } catch (error) {
            return {message: "Erro ao tentar executar a função",error}
        }
    }
}

export default new FormaPagamentoController()