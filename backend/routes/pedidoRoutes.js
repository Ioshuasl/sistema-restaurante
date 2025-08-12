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
        taxaentrega,
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
        estadoCliente } = req.body

        console.log(req.body)

    try {
        const pedido = await pedidoController.createPedido({
            produtosPedido,
            formaPagamento_id,
            situacaoPedido,
            isRetiradaEstabelecimento,
            taxaentrega,
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
        })
        return res.status(200).json(pedido)
    } catch (error) {
        return res.status(400).send(error)
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

pedidoRoutes.get('/pedido/:id', async (req,res) => {
    const {id} = req.params
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

export default pedidoRoutes