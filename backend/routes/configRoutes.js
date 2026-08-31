import configController from "../controller/configController.js";
import express from 'express'
import cors from "cors"
import { isAdmin, authenticateToken } from '../middlewares/authMiddleware.js'
import { validate } from "../middlewares/validationMiddleware.js";
import { updateConfigSchema } from "../validators/configValidator.js";
import { cacheGet, cacheSet } from '../utils/cache.js';
import { setPublicCache } from '../middlewares/cacheHeaders.js';
import { invalidateConfigCache, invalidateMenuCache } from '../utils/publicCache.js';

const configRoutes = express.Router()
const CONFIG_CACHE_KEY = 'config:v1';
const CONFIG_CACHE_TTL = 120;

configRoutes.use(cors());

configRoutes.get('/config', setPublicCache(60), async (req, res) => {
    try {
        const cached = cacheGet(CONFIG_CACHE_KEY);
        if (cached) {
            res.set('X-Cache', 'HIT');
            return res.status(200).json(cached);
        }

        const config = await configController.getOrCreateConfig(1);
        cacheSet(CONFIG_CACHE_KEY, config, CONFIG_CACHE_TTL);
        res.set('X-Cache', 'MISS');
        return res.status(200).json(config);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error);
    }
})

configRoutes.put('/config', authenticateToken, isAdmin, validate(updateConfigSchema), async (req, res) => {

    const updatedData = req.body

    try {
        const config = await configController.updateConfig(1, updatedData)
        invalidateConfigCache();
        invalidateMenuCache();
        return res.status(200).json(config)
    } catch (error) {
        console.error(error)
        return res.status(400).send(error)
    }
})

export default configRoutes