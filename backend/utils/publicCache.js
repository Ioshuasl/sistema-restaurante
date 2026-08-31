import { cacheDel } from './cache.js';

const MENU_CACHE_KEY = 'menu:v1';
const CONFIG_CACHE_KEY = 'config:v1';

export function invalidateMenuCache() {
    cacheDel(MENU_CACHE_KEY);
}

export function invalidateConfigCache() {
    cacheDel(CONFIG_CACHE_KEY);
}

export function invalidatePublicCatalogCache() {
    invalidateMenuCache();
    invalidateConfigCache();
}
