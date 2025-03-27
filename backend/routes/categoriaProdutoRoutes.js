import categoriaProdutoController from "../controller/categoriaProdutoController.js";
import express from 'express'

const categoriaProdutoRoutes = express.Router()

categoriaProdutoRoutes.post('/categoriaProduto', async (req,res) => {
    const {nomeCategoriaProduto} = req.body

    try {
        const categoriaProduto = await categoriaProdutoController({nomeCategoriaProduto})
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

categoriaProdutoRoutes.get('/categoriaProduto', async (req,res) => {
    try {
        const categoriaProdutos = await categoriaProdutoController.findAndCountAllCategoriaprodutos()
        return res.status(200).json(categoriaProdutos)
    } catch (error) {
        return res.status(400).send(error)
    }
})

categoriaProdutoRoutes.put('/categoriaProduto/:id', async (req,res) => {
    const {id} = req.params
    const updatedData = req.body

    try {
        const categoriaProduto = await categoriaProdutoController.updateCategoriaProduto(id,updatedData)
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

categoriaProdutoRoutes.delete('/categoriaProduto/:id', async (req,res) => {
    const {id} = req.params

    try {
        const categoriaProduto = await categoriaProdutoController.deleteCategoriaProduto(id)
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

export default categoriaProdutoRoutes
