import pedidoController from "../controller/pedidoController.js";
import express from 'express'
import cors from "cors"
import { validate } from "../middlewares/validationMiddleware.js";
import { createPedidoSchema } from "../validators/pedidoValidator.js";

const pedidoRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
pedidoRoutes.use(cors())

//rota para cadastrar pedido
pedidoRoutes.post('/pedido', validate(createPedidoSchema), async (req, res) => {
    const { produtosPedido,
        formaPagamento_id,
        situacaoPedido,
        isRetiradaEstabelecimento,
        taxaEntrega,
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
        observacao
    } = req.body

    try {
        const pedido = await pedidoController.createPedido({
            produtosPedido,
            formaPagamento_id,
            situacaoPedido,
            isRetiradaEstabelecimento,
            taxaEntrega,
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
            observacao
        })
        return res.status(200).json(pedido)
    } catch (error) {
        return res.status(400).send(error)
    }
})

pedidoRoutes.post('/pedido/:id/print', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'O ID do pedido é obrigatório.' });
        }

        const result = await pedidoController.printPedido(id);

        if (result.success) {
            // A requisição foi bem sucedida e a ação foi disparada
            res.status(200).json({ message: result.message });
        } else {
            // Se o pedido não foi encontrado, o erro é do cliente (ID inválido)
            if (result.message === "Pedido não encontrado.") {
                return res.status(404).json({ message: result.message });
            }
            // Para outros erros (ex: falha na comunicação com o agente)
            return res.status(500).json({ message: result.message });
        }

    } catch (error) {
        console.error("Erro na rota de impressão:", error);
        res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
    }
})

//rota para mostrar todos os pedidos registrados e a quantidade total
pedidoRoutes.get('/pedido', async (req, res) => {
    try {
        const pedidos = await pedidoController.findAndCountAllPedidos()
        return res.status(200).json(pedidos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

pedidoRoutes.get('/pedido/total', async (req, res) => {
    try {
        const pedidos = await pedidoController.countAllPedidos()
        return res.status(200).json(pedidos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

pedidoRoutes.get('/pedido/:id', async (req, res) => {
    const { id } = req.params
    try {
        const pedido = await pedidoController.findPedidoById(id)
        return res.status(200).json(pedido)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para filtrar pedido a partir da forma de pagamento
pedidoRoutes.get('/pedido/formaPagamento/:id', async (req, res) => {
    const { id } = req.params
    try {
        const pedidos = await pedidoController.findPedidosByFormaPagamento(id)
        return res.status(200).json(pedidos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

pedidoRoutes.patch('/pedido/:id/tempo-espera', async (req, res) => {
    const { id } = req.params;
    const { tempoEspera } = req.body;

    if (!tempoEspera) {
        return res.status(400).json({ message: "O tempo de espera deve ser informado." });
    }

    try {
        const result = await pedidoController.setWaitingNotification(id, tempoEspera);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//rota para atualizar pedido
pedidoRoutes.put('/pedido/:id', async (req, res) => {
    const { id } = req.params
    const updatedData = req.body

    try {
        const pedido = await pedidoController.updatePedido(updatedData, id)
        return res.status(200).json(pedido)
    } catch (error) {
        return res.status(400).send(error)
    }
})

pedidoRoutes.put('/pedido/:id/cancel', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pedidoController.cancelPedido(id);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default pedidoRoutes