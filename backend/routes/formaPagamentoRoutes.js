import formaPagamentoController from "../controller/formaPagamentoController.js";
import express from "express";
import session from 'express-session'
import { userLogged,isAdmin } from '../validators/validator.js'

const formaPagamentoRoutes = express.Router()

//definindo o middleware de sessao das rotas
formaPagamentoRoutes.use(session({
    secret: 'mySecret', // Chave secreta para assinar o cookie da sessão
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

//rota para cadastrar forma de pagamento
formaPagamentoRoutes.post('/formaPagamento', userLogged, isAdmin, async (req,res) => {
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

//rota para atualizar uma forma de pagamento
formaPagamentoRoutes.put('/formaPagamento/:id', userLogged, isAdmin, async (req,res) =>{
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
formaPagamentoRoutes.delete('/formaPagamento/:id', userLogged, isAdmin, async (req,res) =>{
    const {id} = req.params

    try {
        const formaPagamento = await formaPagamentoController.deleteFormaPagamento(id)
        return res.status(200).json(formaPagamento)
    } catch (error) {
        return res.status(400).send(error)
    }
})

export default formaPagamentoRoutes