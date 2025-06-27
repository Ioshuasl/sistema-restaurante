import sequelize from '../config/database.js'; // Importe a instância do sequelize
import Pedido from "../models/pedidoModels.js"
import Produto from '../models/produtoModels.js';
import Pedido from '../models/pedidoModels.js';
import ItemPedido from '../models/itemPedidoModels.js';
import FormaPagamento from "../models/formaPagamentoModels.js"

Pedido.belongsTo(FormaPagamento, { foreignKey: 'formaPagamento_id' })
FormaPagamento.hasMany(Pedido, { foreignKey: 'formaPagamento_id' })

// O Pedido tem muitos Itens de Pedido
Pedido.hasMany(ItemPedido, { foreignKey: 'pedidoId' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'pedidoId' });

// O Produto está em muitos Itens de Pedido
Produto.hasMany(ItemPedido, { foreignKey: 'produtoId' });
ItemPedido.belongsTo(Produto, { foreignKey: 'produtoId' });

class PedidoController {

    //funcao para criar pedido
    async createPedido(
        produtosPedido,
        formaPagamento_id,
        isRetiradaEstabelecimento,
        nomeCliente,
        telefoneCliente,
        cepCliente,
        tipoLogadouroCliente,
        logadouroCliente,
        numeroCliente,
        quadraCliente,
        loteCliente,
        bairroCliente,
        cidadeCliente,
        estadoCliente
    ) {
        // Inicia uma transação gerenciada pelo Sequelize
        const t = await sequelize.transaction();

        try {
            const formaPagamento = await FormaPagamento.findByPk(formaPagamento_id);
            if (!formaPagamento) {
                throw new Error('Forma de pagamento não encontrada ou inválida.');
            }

            // Valida se a lista de produtos foi enviada e não está vazia
            if (!produtosPedido || produtosPedido.length === 0) {
                throw new Error('O pedido deve conter pelo menos um item.');
            }

            // Passo 2: Criar o registro principal do Pedido (cabeçalho)
            const pedido = await Pedido.create({
                formaPagamento_id,
                isRetiradaEstabelecimento,
                nomeCliente,
                telefoneCliente,
                cepCliente,
                tipoLogadouroCliente,
                logadouroCliente,
                numeroCliente,
                quadraCliente,
                loteCliente,
                bairroCliente,
                cidadeCliente,
                estadoCliente,
                valorTotalPedido: 0 // Valor inicial provisório
            }, {
                transaction: t
            });

            let valorTotalCalculado = 0;

            // Passo 3: Iterar sobre a lista 'produtosPedido'
            for (const item of produtosPedido) {
                const produto = await Produto.findByPk(item.produtoId);
                if (!produto || !produto.isAtivo) {
                    throw new Error(`Produto com ID ${item.produtoId} não encontrado ou está inativo.`);
                }

                const precoUnitario = produto.valorProduto;
                valorTotalCalculado += precoUnitario * item.quantidade;

                await ItemPedido.create({
                    pedidoId: pedido.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnitario: precoUnitario
                }, {
                    transaction: t
                });
            }

            // Passo 4: Atualizar o pedido com o valor total final
            pedido.valorTotalPedido = valorTotalCalculado;
            await pedido.save({
                transaction: t
            });

            // Passo 5: Se tudo deu certo, confirma a transação
            await t.commit();

            return pedido;

        } catch (error) {
            // Passo 6: Se qualquer passo falhou, desfaz todas as operações
            await t.rollback();

            console.error("Erro ao criar pedido:", error.message);
            throw new Error(`Não foi possível criar o pedido: ${error.message}`);
        }
    }

    //funcao para encontrar e contar todos os pedidos cadastrados na aplicacao
    async findAndCountAllPedidos() {
        try {
            const pedidos = await Pedido.findAndCountAll({
                include: [{
                    model: ItemPedido,
                    include: [{
                        model: Produto,
                        attributes: ['nomeProduto']
                    }]
                }]
            })
            return pedidos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar encontrar pedidos", error }
        }
    }

    //funcao para encontrar todos os pedidos cadastrados na aplicacao
    async findAllPedidos() {
        try {
            const pedidos = await Pedido.findAll({
                include: [{
                    model: ItemPedido,
                    include: [{
                        model: Produto,
                        attributes: ['nomeProduto']
                    }]
                }]
            })
            return pedidos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar encontrar pedidos", error }
        }
    }

    async findPedidoById(id){
        try {
            const pedido = await Pedido.findByPk(id)
            return pedido
        } catch (error) {
            console.error(error)
            return { message: "Erro tentar encontrar o pedido", error}
        }
    }

    //funcao para encontrar pedido que estao vinculados a uma forma de pagamento
    async findPedidosByFormaPagamento(formaPagamento_id) {
        try {
            const pedidos = await Pedido.findAll({
                where: {
                    formaPagamento_id: formaPagamento_id
                }
            })
            return pedidos
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar encontrar os pedidos", error }
        }
    }

    //funcao para atualizar pedido
    async updatePedido(updatedData, id) {
        try {
            const pedido = await Pedido.update(updatedData, {
                where: {
                    id: id
                }
            })
            return pedido
        } catch (error) {
            console.error(error)
            return { message: "Erro ao tentar atualizar um pedido", error }
        }
    }
}

export default new PedidoController()