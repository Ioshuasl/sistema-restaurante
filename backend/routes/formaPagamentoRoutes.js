import formaPagamentoController from "../controller/formaPagamentoController.js";
import express from "express";
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { createFormaPagamentoSchema,updateFormaPagamentoSchema } from "../validators/formaPagamentoValidator.js";

const formaPagamentoRoutes = express.Router()

//usando o middleware do cors para habilitar os recursos do dominio da pagina web
formaPagamentoRoutes.use(cors())

//rota para cadastrar forma de pagamento
formaPagamentoRoutes.post('/formaPagamento', authenticateToken, isAdmin, validate(createFormaPagamentoSchema), async (req,res) => {
    const {nomeFormaPagamento} = req.body

    try {
        const formaPagamento = await formaPagamentoController.createFormaPagamento({nomeFormaPagamento})
        return res.status(200).json(formaPagamento)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para mostrar todas as formas de pagamento cadastradas no sistema
formaPagamentoRoutes.get('/formaPagamento', async (req,res) => {

    try {
        const formaPagamento = await formaPagamentoController.findAllFormaPagamento()
        return res.status(200).json(formaPagamento)
    } catch (error) {
        return res.status(400).send(error)
    }
})

formaPagamentoRoutes.get('/formaPagamento/:id', async (req,res) => {
    const {id} = req.params

    try {
        const formaPagamento = await formaPagamentoController.findFormaPagamento(id)
        return res.status(200).json(formaPagamento)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para atualizar uma forma de pagamento
formaPagamentoRoutes.put('/formaPagamento/:id', authenticateToken, isAdmin, validate(updateFormaPagamentoSchema), async (req,res) =>{
    const {id} = req.params
    const updatedData = req.body

    try {
        const formaPagamento = await formaPagamentoController.updateFormaPagamento(id,updatedData)
        return res.status(200).json(formaPagamento)
    } catch (error) {
        return res.status(400).send(error)
    }
})

//rota para deletar uma forma de pagamento
formaPagamentoRoutes.delete('/formaPagamento/:id', authenticateToken, isAdmin, async (req,res) =>{
    const {id} = req.params

    try {
        const formaPagamento = await formaPagamentoController.deleteFormaPagamento(id)
        return res.status(200).json(formaPagamento)
    } catch (error) {
        return res.status(400).send(error)
    }
})

export default formaPagamentoRoutes