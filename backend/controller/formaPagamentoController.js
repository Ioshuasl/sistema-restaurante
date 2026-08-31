import { FormaPagamento, Pedido } from "../models/index.js";

class FormaPagamentoController {

    //funcao para criar forma de pagamento
    async createFormaPagamento(nomeFormaPagamento) {
        try {
            const formaPagamento = await FormaPagamento.create(nomeFormaPagamento)
            return { formaPagamento }
        } catch (error) {
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para encontrar todas as formas de pagamento
    async findAllFormaPagamento() {
        try {
            const formaPagamentos = await FormaPagamento.findAll({
                include: [Pedido]
            })
            return formaPagamentos
        } catch (error) {
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    async findFormaPagamento(id) {
        try {
            const formaPagamento = await FormaPagamento.findByPk(id);
            return formaPagamento
        } catch (error) {
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para atualizar forma de pagamento
    async updateFormaPagamento(id, updatedData) {
        try {
            const formaPagamento = await FormaPagamento.update(updatedData, {
                where: {
                    id: id
                }
            })
            return { message: "Forma de pagamento atualizado com sucesso", formaPagamento }
        } catch (error) {
            return { message: "Erro ao tentar executar a função", error }
        }
    }

    //funcao para deletar forma de pagamento
    async deleteFormaPagamento(id) {
        try {
            const formaPagamento = await FormaPagamento.destroy({
                where: {
                    id: id
                }
            })
            return { message: "Forma de pagamento excluído com sucesso", formaPagamento }
        } catch (error) {
            return { message: "Erro ao tentar executar a função", error }
        }
    }
}

export default new FormaPagamentoController()