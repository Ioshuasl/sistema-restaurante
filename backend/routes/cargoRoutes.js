import cargoController from "../controller/cargoController";
import express from 'express'
import cors from "cors"
import { userLogged,isAdmin } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { createCargoSchema, updateCargoSchema } from "../validators/cargoValidator";
import { use } from "react";

const cargoRoutes = express.Router()

cargoRoutes.use(cors())

//rota para adicionar cargo
cargoRoutes.post('/cargo',userLogged,isAdmin,validate(createCargoSchema), async (req,res) => {
    const {nome,descricao} = req.body

    try {
        const cargo = await cargoController.createCargo({nome,descricao})
        return res.status(201).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para listar todos os cargos
cargoRoutes.get('/cargo', userLogged, async (req,res) => {
    try {
        const cargos = await cargoController.getCargos()
        return res.status(200).json(cargos)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

//rota para listar o cargo pelo id
cargoRoutes.get('/cargo/:id', userLogged, async (req,res) => {
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
cargoRoutes.put('/cargo/:id', userLogged,isAdmin,validate(updateCargoSchema), async (req,res) =>{
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
cargoRoutes.delete('/cargo/:id', userLogged, isAdmin, async (req,res) => {
    const {id} = req.params

    try {
        const cargo = await cargoController.deleteCargo(id)
        return res.status(200).json(cargo)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})