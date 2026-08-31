export function setPublicCache(maxAgeSeconds) {
    return (_req, res, next) => {
        res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=30`);
        next();
    };
}

export function setNoCache(_req, res, next) {
    res.set('Cache-Control', 'no-store');
    next();
}
