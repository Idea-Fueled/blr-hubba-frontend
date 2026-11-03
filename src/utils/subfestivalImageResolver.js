/**
 * Shared subfestival image resolver.
 * Extracts the best image URL from a subfestival object returned by the backend API.
 */

const resolveSingleImage = (val) => {
    if (!val) return null;

    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;

        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return resolveSingleImage(parsed);
            } catch (e) {
                // Not valid JSON
            }
        }
        return trimmed;
    }

    if (typeof val === 'object' && !Array.isArray(val)) {
        const keys = [
            'data', 'url', 'src', 'path', 'link', 'file',
            'secure_url', 'secureUrl', 'cloudinaryUrl', 'location', 'uri', 'href'
        ];

        for (const key of keys) {
            if (val[key]) {
                const res = resolveSingleImage(val[key]);
                if (res) return res;
            }
        }
    }

    if (Array.isArray(val) && val.length > 0) {
        for (const item of val) {
            const res = resolveSingleImage(item);
            if (res) return res;
        }
    }

    return null;
};

const normalizeImageUrl = (rawUrl) => {
    if (!rawUrl) return null;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
        return rawUrl;
    }
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${API_URL}${cleanPath}`;
};

/**
 * Resolve the best subfestival image URL.
 *
 * @param {Object} sf - Raw subfestival object from API.
 * @param {string} defaultFallback - Fallback static image asset.
 * @returns {string} The resolved image URL string.
 */
export const resolveSubfestivalImageUrl = (sf, defaultFallback = null) => {
    if (!sf) return defaultFallback;

    const candidates = [
        sf.squareImageDesktop,
        sf.squareImageMobile,
        sf.wideImageDesktop,
        sf.wideImageMobile,
        sf.image,
        sf.imageUrl,
        sf.coverImage,
        sf.photo
    ];

    for (const item of candidates) {
        if (item && item !== defaultFallback) {
            const resolved = resolveSingleImage(item);
            if (resolved) return normalizeImageUrl(resolved);
        }
    }

    return defaultFallback;
};
