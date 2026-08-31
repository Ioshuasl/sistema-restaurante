const DEFAULT_PUBLIC_API_URL = 'https://api-gs-sabores.ioshuavps.com.br';

export function getPublicApiBaseUrl() {
    const configured = process.env.PUBLIC_API_URL?.trim();
    if (configured) {
        return configured.replace(/\/$/, '');
    }
    return DEFAULT_PUBLIC_API_URL;
}

export function buildUploadUrl(fileName) {
    return `${getPublicApiBaseUrl()}/uploads/${fileName}`;
}

export function normalizePublicUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }

    let normalized = url.trim();
    if (!normalized) {
        return normalized;
    }

    if (normalized.startsWith('/uploads/')) {
        return `${getPublicApiBaseUrl()}${normalized}`;
    }

    normalized = normalized.replace(/^http:\/\//i, 'https://');

    const publicBase = getPublicApiBaseUrl();
    normalized = normalized.replace(
        /https?:\/\/[^/]+\/uploads\//i,
        `${publicBase}/uploads/`
    );

    return normalized;
}

export function normalizeProductImage(product) {
    if (!product || typeof product !== 'object') {
        return product;
    }

    return {
        ...product,
        image: normalizePublicUrl(product.image),
    };
}

export function normalizeMenuCategories(categories) {
    if (!Array.isArray(categories)) {
        return categories;
    }

    return categories.map((category) => ({
        ...category,
        produtos: Array.isArray(category.produtos)
            ? category.produtos.map(normalizeProductImage)
            : category.produtos,
    }));
}

export function normalizeConfigAssets(config) {
    if (!config || typeof config !== 'object') {
        return config;
    }

    const plainConfig = typeof config.toJSON === 'function' ? config.toJSON() : config;

    return {
        ...plainConfig,
        bannerImage: normalizePublicUrl(plainConfig.bannerImage),
    };
}
