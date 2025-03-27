import produtoController from '../controller/produtoController.js'
import express from 'express'

const produtoRoutes = express.Router()

produtoRoutes.post('/produto', async (req,res) => {
    const {nomeProduto, valorProduto, isAtivo, categoriaProduto_id} = req.body

    try {
        const produto = await produtoController.createProduto({nomeProduto, valorProduto, isAtivo, categoriaProduto_id})
        return res.send(200).json(produto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

produtoRoutes.get('/produto', async (req,res) => {
    try {
        const produtos = await produtoController.findAndCountAllProdutos()
        return res.status(200).json(produtos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

produtoRoutes.get('/produto/:id', async (req,res) => {
    const {id} = req.params

    try {
        const produto = await produtoController.findProduto(id)
        return res.status(200).json(produto)
    } catch (error) {
        return res.send(400).send(error)
    }
})

produtoRoutes.put('/produto/:id', async (req,res) => {
    const {id} = req.params
    const {nomeProduto, valorProduto, isAtivo, categoriaProduto_id} = req.body

    try {
        const produto = await produtoController.updateProduto(id,{nomeProduto, valorProduto, isAtivo, categoriaProduto_id})
        return res.send(200).json(produto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

produtoRoutes.delete('/produto/:id', async (req,res) => {
    const {id} = req.params

    try {
        const produto = await produtoController.deleteProduto(id)
        return res.status(200).json(produto)
    } catch (error) {
        res.status(400).send(error)
    }
})

export default produtoRoutes