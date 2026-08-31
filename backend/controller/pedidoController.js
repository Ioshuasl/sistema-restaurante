import sequelize from '../config/database.js'; // Importe a instância do sequelize
import { FormaPagamento, Pedido, ItemPedido, SubItemPedido, Produto, SubProduto, Config } from '../models/index.js';
import { Sequelize, Op, fn, col, where, literal } from 'sequelize';
import { formatTelefone } from '../functions/formatTelefone.js';
import { sendMessageWhatsapp } from '../functions/sendMessageWhatsapp.js';
import { sendToAutomaticPrint } from '../functions/automatic-print.js';

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
        taxaEntrega,
        tempoEspera,
        observacao
    }) {
        const t = await sequelize.transaction();

        try {
            // 1. Validação da forma de pagamento
            const formaPagamento = await FormaPagamento.findByPk(formaPagamento_id);
            if (!formaPagamento) {
                throw new Error("Forma de pagamento não encontrada ou inválida.");
            }

            // 2. Validação da lista de produtos
            if (!produtosPedido || produtosPedido.length === 0) {
                throw new Error("O pedido deve conter pelo menos um produto.");
            }

            // --- LÓGICA DO NÚMERO DIÁRIO (NOVA) ---

            // 1. Definir o início e fim do dia atual
            const hoje = new Date();
            const inicioDoDia = new Date(hoje.setHours(0, 0, 0, 0));
            const fimDoDia = new Date(hoje.setHours(23, 59, 59, 999));

            // 2. Buscar o último pedido feito hoje para pegar o maior número
            const ultimoPedidoDoDia = await Pedido.findOne({
                where: {
                    createdAt: {
                        [Op.between]: [inicioDoDia, fimDoDia] // Busca entre 00:00 e 23:59
                    }
                },
                order: [['numeroDiario', 'DESC']], // Pega o maior número
                transaction: t,
                lock: true // Opcional: Bloqueia leitura para evitar duplicidade em alta concorrência
            });

            // 3. Se tiver pedido hoje, soma +1. Se não, começa do 1.
            const proximoNumero = ultimoPedidoDoDia ? ultimoPedidoDoDia.numeroDiario + 1 : 1;

            // 3. Criação do pedido principal
            const pedido = await Pedido.create({
                numeroDiario: proximoNumero,
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
                tempoEspera,
                observacao,
                valorTotalPedido: 0
            }, { transaction: t });

            let valorTotalCalculado = 0;

            // 4. Loop dos produtos
            for (const item of produtosPedido) {
                const produto = await Produto.findByPk(item.produtoId);
                if (!produto || !produto.isAtivo) {
                    throw new Error(`Produto com ID ${item.produtoId} não encontrado ou inativo.`);
                }

                const precoProduto = Number(produto.valorProduto);
                const subtotalProduto = precoProduto * item.quantidade;
                valorTotalCalculado += subtotalProduto;

                const itemPedido = await ItemPedido.create({
                    pedidoId: pedido.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnitario: precoProduto,
                    observacaoItem: item.observacaoItem
                }, { transaction: t });

                // 5. Subprodutos vinculados a esse item
                if (item.subProdutos && item.subProdutos.length > 0) {
                    for (const sub of item.subProdutos) {
                        const subProduto = await SubProduto.findByPk(sub.subProdutoId);
                        if (!subProduto || !subProduto.isAtivo) {
                            throw new Error(`Subproduto com ID ${sub.subProdutoId} não encontrado ou inativo.`);
                        }

                        const precoSub = Number(subProduto.valorAdicional) || 0;
                        const subtotalSub = precoSub * sub.quantidade;
                        valorTotalCalculado += subtotalSub;

                        await SubItemPedido.create({
                            itemPedidoId: itemPedido.id,
                            subProdutoId: sub.subProdutoId,
                            quantidade: sub.quantidade,
                            precoAdicional: precoSub
                        }, { transaction: t });
                    }
                }
            }

            // 6. Adiciona taxa de entrega
            valorTotalCalculado += Number(taxaEntrega);

            // 7. Atualiza total do pedido
            pedido.valorTotalPedido = valorTotalCalculado;
            await pedido.save({ transaction: t });

            // 8. Confirma a transação
            await t.commit();

            // 9. Envia pedido para impressão
            try {
                await this.printPedido(pedido.id)
            } catch (error) {
                console.error("Erro na chamada de impressão:", error);
            }

            // 9. Envia mensagem no whatsapp do cliente para confirmação do pedido
            try {
                // Buscar a configuração para pegar o nome da instância Evolution API
                const config = await Config.findOne({ where: { id: 1 } }); // ajuste o id conforme seu caso

                if (!config || !config.evolutionInstanceName) {
                    console.warn("Configuração da Evolution API não encontrada. Mensagem WhatsApp não será enviada.");
                } else {
                    // Montar mensagem para o cliente
                    const mensagens = [
                        `Olá ${nomeCliente}, seu pedido #${pedido.numeroDiario} foi criado com sucesso! 🧾`,
                        `Valor total: R$ ${valorTotalCalculado.toFixed(2)}`
                    ];

                    // Se a forma de pagamento for PIX (id = 2)
                    if (formaPagamento_id === 2) {
                        mensagens.push(
                            `💳 *Pagamento via PIX*`,
                            `Tipo de chave: ${config.tipoChavePix}`,
                            `Chave PIX: ${config.chavePix}`,
                            `Após o pagamento, envie o comprovante. ✅`
                        );
                    }

                    mensagens.push(`Obrigado pela preferência! 🍽️`);

                    const telefoneFormatado = formatTelefone(telefoneCliente)

                    // Enviar mensagem
                    sendMessageWhatsapp(
                        process.env.EVOLUTION_API_URL,
                        config.evolutionInstanceName,
                        process.env.EVOLUTION_API_KEY,
                        telefoneFormatado,
                        mensagens
                    )
                        .then(() => {
                            console.log(`Mensagem WhatsApp enviada para o cliente ${telefoneCliente} sobre o pedido #${pedido.id}`);
                        })
                        .catch(err => {
                            console.error("Erro ao enviar mensagem WhatsApp:", err.message);
                        });
                }
            } catch (err) {
                // Log de erro, mas não impacta a resposta do pedido
                console.error("Erro ao enviar mensagem WhatsApp:", err.message);
            }

            return pedido;

        } catch (error) {
            await t.rollback();
            console.error("Erro ao criar pedido:", error.message);
            throw new Error(`Erro ao criar pedido: ${error.message}`);
        }
    }

    async printPedido(id) {
        try {
            // 1. Busca o pedido com todos os seus relacionamentos
            const pedido = await Pedido.findByPk(id, {
                include: [{
                    model: ItemPedido,
                    as: 'itensPedido',
                    include: [
                        { model: Produto },
                        {
                            model: SubItemPedido,
                            as: 'subItensPedido',
                            include: [{ model: SubProduto }]
                        }
                    ]
                }]
            });

            if (!pedido) {
                throw new Error("Pedido não encontrado.");
            }

            // 2. Busca a taxa de entrega nas configurações
            const config = await Config.findOne();
            const taxaEntrega = config ? config.taxaEntrega : 0;

            // 3. Reconstrói o array 'produtosPedido' no formato esperado pela função de impressão
            const produtosPedido = pedido.itensPedido.map(item => {
                return {
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    subProdutos: item.subItensPedido.map(subItem => {
                        return {
                            subProdutoId: subItem.subProdutoId,
                            quantidade: subItem.quantidade
                        };
                    })
                };
            });

            // 4. Chama a função de impressão
            await sendToAutomaticPrint(pedido, produtosPedido, taxaEntrega);

            return { success: true, message: `Pedido #${id} enviado para impressão.` };

        } catch (error) {
            console.error("Erro ao tentar imprimir pedido:", error.message);
            return { success: false, message: error.message };
        }
    }

    //funcao para encontrar e contar todos os pedidos cadastrados na aplicacao
    async findAndCountAllPedidos() {
        try {
            const pedidos = await Pedido.findAndCountAll({
                include: [{
                    model: ItemPedido,
                    as: 'itensPedido',  // use o alias correto
                    include: [
                        {
                            model: Produto,
                            attributes: ['nomeProduto']
                        },
                        {
                            model: SubItemPedido,
                            as: 'subItensPedido',  // alias para subItensPedido
                            include: [
                                {
                                    model: SubProduto,
                                    attributes: ['nomeSubProduto']
                                }
                            ]
                        }
                    ]
                }],
                order: [['id', 'DESC']]  // Ordena por ID de forma decrescente
            });
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
                    as: 'itensPedido',  // use o alias correto
                    include: [
                        {
                            model: Produto,
                            attributes: ['nomeProduto']
                        },
                        {
                            model: SubItemPedido,
                            as: 'subItensPedido',  // alias para subItensPedido
                            include: [
                                {
                                    model: SubProduto,
                                    attributes: ['nomeSubProduto']
                                }
                            ]
                        }
                    ]
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

    async setWaitingNotification(id, tempoEspera) {
        try {
            const pedido = await Pedido.findByPk(id);

            if (!pedido) {
                return { success: false, message: "Pedido não encontrado." };
            }

            // Atualiza o atributo no banco de dados
            pedido.tempoEspera = tempoEspera;
            await pedido.save();

            // Dispara a notificação via WhatsApp
            try {
                const config = await Config.findOne({ where: { id: 1 } }); //

                if (config?.evolutionInstanceName) {
                    const mensagens = [
                        `⏳ *Tempo de espera do seu pedido estimado:* ${tempoEspera}`
                    ];

                    const telefoneFormatado = formatTelefone(pedido.telefoneCliente); //

                    await sendMessageWhatsapp(
                        process.env.EVOLUTION_API_URL,
                        config.evolutionInstanceName,
                        process.env.EVOLUTION_API_KEY,
                        telefoneFormatado,
                        mensagens
                    );
                }
            } catch (whatsappError) {
                console.error("Erro ao enviar WhatsApp de tempo de espera:", whatsappError.message);
                // Não bloqueamos a resposta, pois o banco já foi atualizado
            }

            return {
                success: true,
                message: "Tempo de espera registrado e cliente notificado.",
                pedido
            };
        } catch (error) {
            console.error(error);
            throw new Error("Erro ao processar informativo de tempo de espera.");
        }
    }

    //funcao para atualizar pedido
    async updatePedido(updatedData, id) {
        try {
            // 1. Busca o pedido antes de atualizar
            const pedido = await Pedido.findByPk(id);

            if (!pedido) {
                return { message: "Pedido não encontrado" };
            }

            // 2. Realiza a atualização no banco (o objeto 'pedido' em memória é atualizado aqui)
            await pedido.update(updatedData);

            // 3. Verifica se deve enviar notificação
            // Verificamos se houve mudança de situação OU tempo de espera
            if (updatedData.situacaoPedido || updatedData.tempoEspera) {
                try {
                    const config = await Config.findOne({ where: { id: 1 } });

                    // Só prossegue se tiver configuração e instância ativa
                    if (config && config.evolutionInstanceName) {

                        let mensagemStatus = "";
                        const isRetirada = pedido.isRetiradaEstabelecimento; // Boolean

                        // Lógica de mensagem baseada na Situação ATUAL do pedido
                        switch (pedido.situacaoPedido) {
                            case 'preparando':
                                mensagemStatus = `Seu pedido está sendo preparado! 👨‍🍳`;
                                break;

                            case 'entrega':
                                // Só envia mensagem de "Saiu para entrega" se NÃO for retirada
                                if (!isRetirada) {
                                    mensagemStatus = `Seu pedido está em rota de entrega! 🚚`;
                                }
                                break;

                            case 'finalizado':
                                if (isRetirada) {
                                    // MENSAGEM ESPECÍFICA PARA RETIRADA
                                    mensagemStatus = `Seu pedido está pronto para retirada no balcão! 🥡.`;
                                } else {
                                    // Mensagem padrão para finalização de delivery
                                    mensagemStatus = `Seu pedido foi entregue e finalizado. Bom apetite! 🍽️`;
                                }
                                break;

                            case 'cancelado':
                                mensagemStatus = `Seu pedido foi cancelado! ❌`;
                                break;
                        }

                        // Se houver tempo de espera na atualização, adiciona à mensagem
                        const mensagemTempo = updatedData.tempoEspera
                            ? `⏳ *Tempo de espera estimado:* ${updatedData.tempoEspera}`
                            : "";

                        // Filtra mensagens vazias (caso caia num case sem mensagem)
                        const mensagens = [mensagemStatus, mensagemTempo].filter(m => m !== "");

                        if (mensagens.length > 0) {
                            const telefoneFormatado = formatTelefone(pedido.telefoneCliente);

                            sendMessageWhatsapp(
                                process.env.EVOLUTION_API_URL,
                                config.evolutionInstanceName,
                                process.env.EVOLUTION_API_KEY,
                                telefoneFormatado,
                                mensagens
                            )
                            .then(() => {console.log(`Notificação enviada para pedido #${pedido.id} (Status: ${pedido.situacaoPedido})`);})
                            
                        }
                    }
                } catch (err) {
                    // Log de erro de notificação não deve parar o fluxo de resposta da API
                    console.error("Erro ao enviar notificação de atualização:", err.message);
                }
            }

            return { message: "Pedido atualizado com sucesso", pedido };
        } catch (error) {
            console.error("Erro no updatePedido:", error);
            return { message: "Erro ao tentar atualizar um pedido", error };
        }
    }

    async cancelPedido(id) {
        try {
            const pedido = await Pedido.findByPk(id);

            if (!pedido) {
                return { success: false, message: "Pedido não encontrado." };
            }

            // Atualiza apenas a situação
            pedido.situacaoPedido = 'cancelado';
            await pedido.save();

            return {
                success: true,
                message: `Pedido #${id} foi cancelado com sucesso.`,
                pedido
            };
        } catch (error) {
            console.error("Erro ao cancelar pedido:", error);
            throw new Error("Erro interno ao processar o cancelamento.");
        }
    }
}

export default new PedidoController()