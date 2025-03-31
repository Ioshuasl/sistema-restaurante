import produtoController from '../controller/produtoController.js'
import express from 'express'
import session from 'express-session'
import { userLogged,isAdmin } from '../validators/validator.js'
import cors from "cors"

const produtoRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
produtoRoutes.use(cors())

//definindo o middleware de sessao das rotas
produtoRoutes.use(session({
    secret: 'mySecret', // Chave secreta para assinar o cookie da sessão
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

//rota para criar um produto
produtoRoutes.post('/produto', userLogged, isAdmin, async (req,res) => {
    const {nomeProduto, valorProduto, isAtivo, categoriaProduto_id} = req.body

    console.log(req.session.user)

    try {
        const produto = await produtoController.createProduto({nomeProduto, valorProduto, isAtivo, categoriaProduto_id})
        return res.status(200).json(produto)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})


//rota para encontrar todos os produtos
produtoRoutes.get('/produto', async (req,res) => {
    try {
        const produtos = await produtoController.findAndCountAllProdutos()
        return res.status(200).json(produtos)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para encontrar um produto pelo id
produtoRoutes.get('/produto/:id', async (req,res) => {
    const {id} = req.params

    try {
        const produto = await produtoController.findProduto(id)
        return res.status(200).json(produto)
    } catch (error) {
        console.error(error)
        return res.send(400).send(error)
    }
})

//rota para atualizar um produto
produtoRoutes.put('/produto/:id', userLogged, isAdmin, async (req,res) => {
    const {id} = req.params
    const {nomeProduto, valorProduto, isAtivo, categoriaProduto_id} = req.body

    try {
        const produto = await produtoController.updateProduto(id,{nomeProduto, valorProduto, isAtivo, categoriaProduto_id})
        return res.send(200).json(produto)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para deletar um produto
produtoRoutes.delete('/produto/:id', userLogged, isAdmin, async (req,res) => {
    const {id} = req.params

    try {
        const produto = await produtoController.deleteProduto(id)
        return res.status(200).json(produto)
    } catch (error) {
        console.error(error)
        res.status(400).send(error)
    }
})

//rota para ativar e desativar produto
produtoRoutes.put('/produto/:id/toggle', userLogged, isAdmin, async (req,res) => {
    const {id} = req.params

    try {
        const produto = await produtoController.toggleProdutoAtivo(id)
        return res.status(200).json(produto)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default produtoRoutes