import menuController from "../controller/menuController.js";
import express from 'express'
import cors from 'cors'
import { cacheGet, cacheSet } from '../utils/cache.js';
import { setPublicCache } from '../middlewares/cacheHeaders.js';
import { menuCacheKey } from '../utils/publicCache.js';
import {
    DEFAULT_PERIODOS_CARDAPIO,
    resolverTipoMenuAtivo,
} from '../utils/cardapioPeriodo.js';
import { Config } from '../models/index.js';

const menuRoutes = express.Router()
const MENU_CACHE_TTL = 120;

menuRoutes.use(cors())

async function resolveTipoSolicitado(tipoQuery) {
    if (tipoQuery === 'dia' || tipoQuery === 'noite') return tipoQuery;
    const config = await Config.findByPk(1);
    const periodos = config?.periodosCardapio ?? DEFAULT_PERIODOS_CARDAPIO;
    return resolverTipoMenuAtivo(periodos) || 'dia';
}

async function buildMeta(tipoSolicitado) {
    const config = await Config.findByPk(1);
    const periodos = config?.periodosCardapio ?? DEFAULT_PERIODOS_CARDAPIO;
    const tipoAtivo = resolverTipoMenuAtivo(periodos);
    return {
        tipoSolicitado,
        tipoAtivo,
        pedindoHabilitado: tipoAtivo != null && tipoSolicitado === tipoAtivo,
        periodosCardapio: periodos,
    };
}

menuRoutes.get('/menu', setPublicCache(60), async (req, res) => {
    try {
        const rawTipo = String(req.query.tipo || 'auto').toLowerCase();
        const tipoQuery = ['auto', 'dia', 'noite'].includes(rawTipo) ? rawTipo : 'auto';
        const tipoSolicitado = await resolveTipoSolicitado(tipoQuery);
        const meta = await buildMeta(tipoSolicitado);
        const cacheKey = menuCacheKey(tipoSolicitado);

        const cachedCategorias = cacheGet(cacheKey);
        if (cachedCategorias) {
            res.set('X-Cache', 'HIT');
            return res.status(200).json({ categorias: cachedCategorias, meta });
        }

        const menu = await menuController.getMenu(tipoSolicitado);
        if (menu?.message && menu?.error) {
            return res.status(400).json(menu);
        }

        cacheSet(cacheKey, menu.categorias, MENU_CACHE_TTL);
        res.set('X-Cache', 'MISS');
        return res.status(200).json({
            categorias: menu.categorias,
            meta: menu.meta || meta,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json(error);
    }
})

export default menuRoutes
