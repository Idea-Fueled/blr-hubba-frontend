// Centralized API Base URL resolver that works seamlessly in localhost, staging, and production
export const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
        const host = window.location.hostname;
        if (host !== 'localhost' && host !== '127.0.0.1') {
            return `${window.location.origin}/2027/api`;
        }
    }
    return (envUrl || 'http://localhost:3000').replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = getApiBaseUrl();

export const normalizeMediaUrl = (url) => {
    if (!url) return url;
    const isLocalFrontend = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const baseUrl = getApiBaseUrl();

    if (/^https?:\/\/localhost(:\d+)?/.test(url)) {
        if (isLocalFrontend) {
            return url.replace(/^https?:\/\/localhost(:\d+)?/, 'http://localhost:3000');
        } else {
            return url.replace(/^https?:\/\/localhost(:\d+)?/, baseUrl);
        }
    }
    if (url.startsWith('/media/') || url.startsWith('/static-files/')) {
        if (isLocalFrontend) {
            return `http://localhost:3000${url}`;
        }
        return `${baseUrl}${url}`;
    }
    return url;
};

export default getApiBaseUrl;
