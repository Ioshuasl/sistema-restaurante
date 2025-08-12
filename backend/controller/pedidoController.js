import sequelize from '../config/database.js'; // Importe a instância do sequelize
import Pedido from "../models/pedidoModels.js"
import Produto from '../models/produtoModels.js';
import ItemPedido from '../models/itemPedidoModels.js';
import FormaPagamento from "../models/formaPagamentoModels.js"
import formaPagamentoController from './formaPagamentoController.js';
import { Sequelize, Op, fn, col, where, literal } from 'sequelize';

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
    async createPedido({
        produtosPedido,
        formaPagamento_id,
        situacaoPedido,
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
        taxaentrega
    }) {
        // Inicia uma transação gerenciada pelo Sequelize
        const t = await sequelize.transaction();

        try {
            console.log(formaPagamento_id)
            const formaPagamento = await FormaPagamento.findByPk(formaPagamento_id)
            console.log(formaPagamento)
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
                situacaoPedido,
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
            pedido.valorTotalPedido = valorTotalCalculado + taxaentrega;
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

    async countAllPedidos() {
        try {
            const pedidos = Pedido.count()
            return pedidos
        } catch (error) {
            return { message: "Erro ao tentar encontrar pedidos", error }
        }
    }

    // CORREÇÃO: Usando a função EXTRACT() do PostgreSQL
    async getMonthlyRevenue(year, month) {
    try {
        const result = await Pedido.findOne({
            attributes: [
                [fn('SUM', col('valorTotalPedido')), 'totalRevenue']
            ],
            where: {
                [Op.and]: [
                    where(literal('EXTRACT(YEAR FROM "createdAt")'), Number(year)),
                    where(literal('EXTRACT(MONTH FROM "createdAt")'), Number(month))
                ]
            },
            raw: true // retorna objeto simples
        });

        const totalRevenue = parseFloat(result.totalRevenue) || 0;

        return { totalRevenue };
    } catch (error) {
        console.error(error);
        return { message: "Erro ao tentar calcular o rendimento mensal", error };
    }
}

    // CORREÇÃO: Usando a função DATE_TRUNC, que é compatível com PostgreSQL
    async getMonthlyOrderCounts() {
        try {
            const monthlyCounts = await Pedido.findAll({
                attributes: [
                    [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
                order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
            });

            return monthlyCounts;
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar obter a contagem de pedidos mensais", error };
        }
    }

    // CORREÇÃO: Ajustando a consulta para a sintaxe correta com GROUP BY
    async getPaymentMethodDistribution() {
        try {
            const distribution = await FormaPagamento.findAll({
                attributes: [
                    'id',
                    'nomeFormaPagamento',
                    [Sequelize.fn('COUNT', Sequelize.col('pedidos.id')), 'count'] // alias correto
                ],
                include: [
                    {
                        model: Pedido,
                        as: 'pedidos', // garantir que bate com o relacionamento
                        attributes: []
                    }
                ],
                group: ['FormaPagamento.id', 'FormaPagamento.nomeFormaPagamento'],
                order: [['nomeFormaPagamento', 'ASC']]
            });


            // Formata para o frontend
            const formattedDistribution = distribution.map(item => ({
                label: item.nomeFormaPagamento,
                value: parseInt(item.getDataValue('count'), 10)
            }));

            return formattedDistribution;
        } catch (error) {
            console.error(error);
            return { message: "Erro ao tentar obter a distribuição por forma de pagamento", error };
        }
    }

    async findPedidoById(id) {
        try {
            const pedido = await Pedido.findByPk(id)
            return pedido
        } catch (error) {
            console.error(error)
            return { message: "Erro tentar encontrar o pedido", error }
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