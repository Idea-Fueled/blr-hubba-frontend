/**
 * Shared venue image resolver.
 * Extracts the best image URL from a venue object returned by the backend API.
 */

/**
 * Resolve a single image value to a URL string.
 * Handles: string URLs, JSON stringified objects, objects with data/url/src/path keys, and arrays.
 */
const resolveSingleImage = (val) => {
    if (!val) return null;

    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;

        // If string is JSON stringified object/array, parse and resolve recursively
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return resolveSingleImage(parsed);
            } catch (e) {
                // Not valid JSON, continue
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

/**
 * Ensure a URL is absolute. Relative paths get prefixed with VITE_API_URL.
 */
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
 * Resolve the best venue image URL from a venue object.
 *
 * @param {Object} v - The venue object (raw from API or mapped).
 * @param {string} defaultFallback - Fallback image (imported asset).
 * @param {boolean} isHero - If true, prefer wide images; if false, prefer square.
 * @returns {string} The resolved image URL.
 */
export const resolveVenueImageUrl = (v, defaultFallback, isHero = false) => {
    if (!v) return defaultFallback;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // Build ordered candidate list based on context
    const candidates = isHero
        ? (isMobile
            ? [v.wideImageMobile, v.wideImageDesktop, v.squareImageMobile, v.squareImageDesktop]
            : [v.wideImageDesktop, v.wideImageMobile, v.squareImageDesktop, v.squareImageMobile])
        : (isMobile
            ? [v.squareImageMobile, v.squareImageDesktop, v.wideImageMobile, v.wideImageDesktop]
            : [v.squareImageDesktop, v.squareImageMobile, v.wideImageDesktop, v.wideImageMobile]);

    // Also check generic image fields (exclude v.image if it's identical to defaultFallback)
    const extraFields = [v.imageUrl, v.coverImage, v.bannerImage, v.image, v.photo];
    for (const field of extraFields) {
        if (field && field !== defaultFallback) {
            candidates.push(field);
        }
    }

    for (const item of candidates) {
        const resolved = resolveSingleImage(item);
        if (resolved) return normalizeImageUrl(resolved);
    }

    // Check array-based image fields
    for (const arr of [v.images, v.mediaItems, v.media]) {
        if (Array.isArray(arr) && arr.length > 0) {
            for (const elem of arr) {
                const resolved = resolveSingleImage(elem);
                if (resolved) return normalizeImageUrl(resolved);
            }
        }
    }

    return defaultFallback;
};
