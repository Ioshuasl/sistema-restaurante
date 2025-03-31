import categoriaProdutoController from "../controller/categoriaProdutoController.js";
import express from 'express'
import session from 'express-session'
import { userLogged,isAdmin } from '../validators/validator.js'

const categoriaProdutoRoutes = express.Router()

//definindo o middleware de sessao das rotas
categoriaProdutoRoutes.use(session({
    secret: 'mySecret', // Chave secreta para assinar o cookie da sessão
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

//rota para cadastrar categoria de produto
categoriaProdutoRoutes.post('/categoriaProduto',userLogged, isAdmin, async (req,res) => {
    const {nomeCategoriaProduto} = req.body

    try {
        const categoriaProduto = await categoriaProdutoController({nomeCategoriaProduto})
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para encontrar todas as categorias de produtos cadastrados na aplicacao
categoriaProdutoRoutes.get('/categoriaProduto', async (req,res) => {
    try {
        const categoriaProdutos = await categoriaProdutoController.findAllCategoriaProdutos()
        return res.status(200).json(categoriaProdutos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para encontrar categoria de produto pelo id
categoriaProdutoRoutes.get('/categoriaProduto/:id', async (req,res) => {
    const {id} = req.params
    
    try {
        const categoriaProduto = await categoriaProdutoController.findCategoriaProduto(id)
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        console.error(error)
        return error
    }
})  

//rota para atualizar uma categoria de produto
categoriaProdutoRoutes.put('/categoriaProduto/:id',userLogged, isAdmin, async (req,res) => {
    const {id} = req.params
    const updatedData = req.body

    try {
        const categoriaProduto = await categoriaProdutoController.updateCategoriaProduto(id,updatedData)
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para deletar uma categoria de produto
categoriaProdutoRoutes.delete('/categoriaProduto/:id', userLogged, isAdmin,async (req,res) => {
    const {id} = req.params

    try {
        const categoriaProduto = await categoriaProdutoController.deleteCategoriaProduto(id)
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

export default categoriaProdutoRoutes
