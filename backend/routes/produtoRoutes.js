import produtoController from '../controller/produtoController.js'
import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { createProdutoSchema, updateProdutoSchema } from '../validators/produtoValidator.js'

const produtoRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
produtoRoutes.use(cors())

//rota para criar um produto
produtoRoutes.post('/produto', authenticateToken, isAdmin,validate(createProdutoSchema), async (req,res) => {
    const {nomeProduto, valorProduto,image, isAtivo, categoriaProduto_id} = req.body
    
    try {
        const produto = await produtoController.createProduto({nomeProduto, valorProduto,image, isAtivo, categoriaProduto_id})
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
produtoRoutes.put('/produto/:id', authenticateToken, isAdmin, validate(updateProdutoSchema), async (req,res) => {
    const {id} = req.params
    const {nomeProduto, valorProduto,image, isAtivo, categoriaProduto_id} = req.body

    try {
        const produto = await produtoController.updateProduto(id,{nomeProduto, valorProduto,image, isAtivo, categoriaProduto_id})
        return res.status(200).json(produto)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para deletar um produto
produtoRoutes.delete('/produto/:id', authenticateToken, isAdmin, async (req,res) => {
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
produtoRoutes.put('/produto/:id/toggle', authenticateToken, isAdmin, async (req,res) => {
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