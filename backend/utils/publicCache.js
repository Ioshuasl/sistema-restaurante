import { cacheDel, cacheDelByPrefix } from './cache.js';

export const MENU_CACHE_PREFIX = 'menu:v1';
const CONFIG_CACHE_KEY = 'config:v1';

export function menuCacheKey(tipo) {
    return `${MENU_CACHE_PREFIX}:${tipo}`;
}

export function invalidateMenuCache() {
    cacheDelByPrefix(`${MENU_CACHE_PREFIX}:`);
    cacheDel(MENU_CACHE_PREFIX); // legado menu:v1
}

export function invalidateConfigCache() {
    cacheDel(CONFIG_CACHE_KEY);
}

export function invalidatePublicCatalogCache() {
    invalidateMenuCache();
    invalidateConfigCache();
}
