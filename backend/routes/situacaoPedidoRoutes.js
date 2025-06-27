import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware";
import situacaoProdutoController from '../controller/situacaoProdutoController.js';

const situacaoPedidoRoutes = express.Router()

situacaoPedidoRoutes.use(cors())

//rota para criar situação de produto
situacaoPedidoRoutes.post('/situacao-pedido', async (req, res) => {
    const { nome, descricao, pedido_id } = req.body

    try {
        const situacaoPedido = await situacaoProdutoController.createSituacaoPedido({ nome, descricao, pedido_id })
        return res.status(201).json(situacaoPedido)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para listar situações de produto
situacaoPedidoRoutes.get('/situacao-pedido', async (req, res) => {
    try {
        const situacaoPedidos = await situacaoProdutoController.getAllSituacaoPedido()
        return res.status(200).json(situacaoPedidos)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para listar situação de produto pelo id
situacaoPedidoRoutes.get('/situacao-pedido/:id', async (req, res) => {

    const { id } = req.params

    try {
        const situacaoPedido = await situacaoProdutoController.getSituacaoPedido(id)
        return res.status(200).json(situacaoPedido)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para atualizar situação de produto
situacaoPedidoRoutes.put('/situacao-pedido/:id', async (req, res) => {

    const { id } = req.params
    const updatedData = req.body

    try {
        const situacaoPedido = await situacaoProdutoController.updateSituacaoPedido(id, updatedData)
        return res.status(200).json(situacaoPedido)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para deletar situação de produto
situacaoPedidoRoutes.delete('/situacao-pedido/:id', async (req, res) => {

    const { id } = req.params

    try {
        const situacaoPedido = await situacaoProdutoController.deleteSituacaoPedido(id)
        return res.status(200).json(situacaoPedido)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default situacaoPedidoRoutes