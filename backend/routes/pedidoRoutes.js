import pedidoController from "../controller/pedidoController.js";
import express from 'express'
import session from 'express-session'
import cors from "cors"

const pedidoRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
pedidoRoutes.use(cors())

//definindo o middleware de sessao das rotas
pedidoRoutes.use(session({
    secret: 'mySecret', // Chave secreta para assinar o cookie da sessão
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

//rota para cadastrar pedido
pedidoRoutes.post('/pedido', async (req,res) => {
    const {produtosPedido, valorTotalPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente} = req.body

    try {
        const pedido = await pedidoController.createPedido({produtosPedido, valorTotalPedido, formaPagamento_id, isRetiradaEstabelecimento, nomeCliente, enderecoCliente})
        return res.status(200).json(pedido)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para mostrar todos os pedidos registrados e a quantidade total
pedidoRoutes.get('/pedido', async (req,res) => {
    try {
        const pedidos = await pedidoController.findAndCountAllPedidos()
        return res.status(200).json(pedidos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para filtrar pedido a partir da forma de pagamento
pedidoRoutes.get('/pedido/formaPagamento/:id', async (req,res) => {
    const {id} = req.params
    try {
        const pedidos = await pedidoController.findPedidosByFormaPagamento(id)
        return res.status(200).json(pedidos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para atualizar pedido
pedidoRoutes.put('/pedido/:id', async (req,res) => {
    const {id} = req.params
    const updatedData = req.body

    try {
        const pedido = await pedidoController.updatePedido(updatedData,id)
        return res.status(200).json(pedido)
    } catch (error) {
        return res.status(400).send(error)
    }
})

export default pedidoRoutes