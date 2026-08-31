import menuController from "../controller/menuController.js";
import express from 'express'
import cors from 'cors'
import { cacheGet, cacheSet } from '../utils/cache.js';
import { setPublicCache } from '../middlewares/cacheHeaders.js';

const menuRoutes = express.Router()
const MENU_CACHE_KEY = 'menu:v1';
const MENU_CACHE_TTL = 120;

menuRoutes.use(cors())

menuRoutes.get('/menu', setPublicCache(60), async (req, res) => {
    try {
        const cached = cacheGet(MENU_CACHE_KEY);
        if (cached) {
            res.set('X-Cache', 'HIT');
            return res.status(200).json(cached);
        }

        const menu = await menuController.getMenu();
        cacheSet(MENU_CACHE_KEY, menu, MENU_CACHE_TTL);
        res.set('X-Cache', 'MISS');
        return res.status(200).json(menu);
    } catch (error) {
        console.error(error);
        return res.status(400).json(error);
    }
})

export default menuRoutes
