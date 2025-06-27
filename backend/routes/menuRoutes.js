import menuController from "../controller/menuController.js";
import express from 'express'
import cors from 'cors'

const menuRoutes = express.Router()

menuRoutes.use(cors())

menuRoutes.get('/menu', async (req,res) => {
    try {
        const menu = await menuController.getMenu()
        return res.status(200).json(menu)
    } catch (error) {
        console.error(error)
        return res.status(400).json(error)
    }
})

export default menuRoutes