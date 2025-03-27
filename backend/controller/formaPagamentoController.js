import FormaPagamento from "../models/formaPagamentoModels.js"

class FormaPagamentoController{
    async createFormaPagamento(nomeFormaPagamento){
        try {
            const formaPagamento = FormaPagamento.create(nomeFormaPagamento)
            return formaPagamento
        } catch (error) {
            return error
        }
    }

    async findAllFormaPagamento(){
        try {
            const formaPagamentos = FormaPagamento.findAll()
            return formaPagamentos
        } catch (error) {
            return error
        }
    }

    async updateFormaPagamento(id,updatedData){
        try {
            const formaPagamento = FormaPagamento.update(updatedData, {
                where:{
                    id:id
                }
            })
            return formaPagamento
        } catch (error) {
            return error
        }
    }

    async deleteFormaPagamento(id){
        try {
            const formaPagamento = FormaPagamento.destroy({
                where:{
                    id:id
                }
            })
            return formaPagamento
        } catch (error) {
            return error
        }
    }
}

export default new FormaPagamentoController()