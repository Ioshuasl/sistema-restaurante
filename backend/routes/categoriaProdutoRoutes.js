import categoriaProdutoController from "../controller/categoriaProdutoController.js";
import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { createCategoriaProdutoSchema, updateCategoriaProdutoSchema } from "../validators/categoriaProdutoValidator.js";

const categoriaProdutoRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
categoriaProdutoRoutes.use(cors())

//rota para cadastrar categoria de produto
categoriaProdutoRoutes.post('/categoriaProduto',authenticateToken, isAdmin, validate(createCategoriaProdutoSchema), async (req,res) => {
    const {nomeCategoriaProduto} = req.body

    try {
        const categoriaProduto = await categoriaProdutoController.createCategoriaProduto(nomeCategoriaProduto)
        return res.status(201).json(categoriaProduto)
    } catch (error) {
        console.error(error)
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
categoriaProdutoRoutes.put('/categoriaProduto/:id',authenticateToken, isAdmin, validate(updateCategoriaProdutoSchema), async (req,res) => {
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
categoriaProdutoRoutes.delete('/categoriaProduto/:id', authenticateToken, isAdmin,async (req,res) => {
    const {id} = req.params

    try {
        const categoriaProduto = await categoriaProdutoController.deleteCategoriaProduto(id)
        return res.status(200).json(categoriaProduto)
    } catch (error) {
        return res.status(400).send(error)
    }
})

export default categoriaProdutoRoutes
