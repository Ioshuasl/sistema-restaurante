import cargoController from "../controller/cargoController.js";
import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { createCargoSchema, updateCargoSchema } from "../validators/cargoValidator.js";

const cargoRoutes = express.Router()

cargoRoutes.use(cors())

cargoRoutes.post('/cargo/first',validate(createCargoSchema), async (req,res) => {
    const {nome, descricao, admin} = req.body

    try {
        const cargo = await cargoController.createCargo({nome, descricao, admin})
        return res.status(201).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para adicionar cargo
cargoRoutes.post('/cargo',authenticateToken,isAdmin,validate(createCargoSchema), async (req,res) => {
    const {nome, descricao, admin} = req.body

    try {
        const cargo = await cargoController.createCargo({nome, descricao, admin})
        return res.status(201).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para listar todos os cargos
cargoRoutes.get('/cargo', async (req,res) => {
    try {
        const cargos = await cargoController.getCargos()
        return res.status(200).json(cargos)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para listar o cargo pelo id
cargoRoutes.get('/cargo/:id', authenticateToken, async (req,res) => {
    const {id} = req.params

    try {
        const cargo = await cargoController.getCargoById(id)
        return res.status(200).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para atualizar cargo
cargoRoutes.put('/cargo/:id', authenticateToken,isAdmin,validate(updateCargoSchema), async (req,res) =>{
    const {id} = req.params
    const updatedData = req.body

    try {
        const cargo = await cargoController.updateCargo(id,updatedData)
        return res.status(200).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para deletar cargo
cargoRoutes.delete('/cargo/:id', authenticateToken, isAdmin, async (req,res) => {
    const {id} = req.params

    try {
        const cargo = await cargoController.deleteCargo(id)
        return res.status(200).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default cargoRoutes