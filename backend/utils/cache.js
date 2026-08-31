const store = new Map();

export function cacheGet(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
}

export function cacheSet(key, value, ttlSeconds = 60) {
    store.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
    });
}

export function cacheDel(key) {
    store.delete(key);
}

export function cacheDelByPrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}
