import configController from "../controller/configController.js";
import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { updateConfigSchema } from "../validators/configValidator.js";

const configRoutes = express.Router()

configRoutes.use(cors());

configRoutes.get('/config', async (req, res) => {
    try {
        const config = await configController.getOrCreateConfig(1)
        return res.status(200).json(config)
    } catch (error) {
        console.error
        return res.status(400).send(error)
    }
})

configRoutes.put('/config', authenticateToken, isAdmin, validate(updateConfigSchema), async (req, res) => {

    const updatedData = req.body

    try {
        const config = await configController.updateConfig(1, updatedData)
        return res.status(200).json(config)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default configRoutes