const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

const normalizeEventImages = (event) => {
  if (!event) return event;
  
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
  
  const fixUrl = (url) => {
    if (!url) return url;
    
    const isLocalFrontend = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (/^https?:\/\/localhost:\d+/.test(url)) {
      if (isLocalFrontend) {
        return url.replace(/^https?:\/\/localhost:\d+/, 'http://localhost:3000');
      } else {
        return url.replace(/^https?:\/\/localhost:\d+/, baseUrl);
      }
    }
    if (url.startsWith("/media/") || url.startsWith("/static-files/")) {
      if (isLocalFrontend) {
        return `http://localhost:3000${url}`;
      }
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const cleanEvent = { ...event };
  
  if (cleanEvent.imageUrl) {
    cleanEvent.imageUrl = fixUrl(cleanEvent.imageUrl);
  }
  if (cleanEvent.coverImage) {
    cleanEvent.coverImage = fixUrl(cleanEvent.coverImage);
  }
  
  if (cleanEvent.media) {
    const cleanMedia = { ...cleanEvent.media };
    if (cleanMedia.images169) {
      cleanMedia.images169 = cleanMedia.images169.map(img => ({
        ...img,
        data: fixUrl(img.data)
      }));
    }
    if (cleanMedia.images11) {
      cleanMedia.images11 = cleanMedia.images11.map(img => ({
        ...img,
        data: fixUrl(img.data)
      }));
    }
    cleanEvent.media = cleanMedia;
  }
  
  return cleanEvent;
};

// ----------------------------------------------------
// Caching & Request Deduplication Mechanisms
// ----------------------------------------------------
const CACHE_VERSION = 'v2'; // Bump this to invalidate all caches
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
const eventsCache = new Map();
let spotlightCache = null;
const eventSlugCache = new Map();
let cachedLatest8 = null;

// Track in-flight Promises to eliminate parallel duplicate HTTP requests
const inFlightRequests = new Map();

const fetchWithDeduplication = (url, options = {}) => {
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const promise = fetch(url, options)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    })
    .finally(() => {
      inFlightRequests.delete(url);
    });

  inFlightRequests.set(url, promise);
  return promise;
};

/**
 * Helper to fetch the latest 8 created events from the backend.
 */
export const fetchLatest8Events = async () => {
  if (cachedLatest8 && (Date.now() - cachedLatest8.timestamp < CACHE_TTL_MS)) {
    return cachedLatest8.data;
  }
  
  const url = `${API_BASE_URL}/public/events?sortBy=createdAt&sortOrder=desc&limit=50&pastOnly=true`;
  const data = await fetchWithDeduplication(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  const rawEvents = (data.events || []).map(normalizeEventImages);

  const uniqueEvents = [];
  const seenTitles = new Set();

  for (const e of rawEvents) {
    const normalizedTitle = e.title.trim().toLowerCase();
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueEvents.push(e);
    }
    if (uniqueEvents.length === 8) {
      break;
    }
  }
  
  cachedLatest8 = { data: uniqueEvents, timestamp: Date.now() };
  return cachedLatest8.data;
};

/**
 * Computes filter options (genres, venues, dates) dynamically from the selected events.
 */
const computeFilterOptionsFromEvents = (events) => {
  const genresMap = new Map();
  const venuesMap = new Map();
  const datesMap = new Map();

  events.forEach(event => {
    if (event.genres) {
      event.genres.forEach(g => {
        if (g && g.id) {
          genresMap.set(g.id, { id: g.id, name: g.name });
        }
      });
    }

    if (event.venue) {
      venuesMap.set(event.venue.id, { id: event.venue.id, name: event.venue.name });
    }

    if (event.startDateTime) {
      const date = new Date(event.startDateTime);
      const yyyymmdd = date.toISOString().split('T')[0];
      const dayNumber = date.getDate();
      const weekday = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      datesMap.set(yyyymmdd, {
        date: yyyymmdd,
        dayNumber: dayNumber,
        weekday: weekday,
        eventCount: 1
      });
    }
  });

  return {
    success: true,
    data: {
      genres: Array.from(genresMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      venues: Array.from(venuesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      availableDates: Array.from(datesMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    }
  };
};

/**
 * Fetch paginated, filterable events list.
 */
export const fetchEvents = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.includePast === undefined && params.pastOnly === undefined) {
    query.set("includePast", "true");
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const cacheKey = CACHE_VERSION + ':' + query.toString();
  const cached = eventsCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const url = `${API_BASE_URL}/public/events${cacheKey ? `?${cacheKey}` : ""}`;
  const data = await fetchWithDeduplication(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (data.events) {
    data.events = data.events.map(normalizeEventImages);
  }

  eventsCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

/**
 * Fetch filter options (genres, venues, available dates) dynamically from the 8 latest events.
 */
export const fetchFilterOptions = async (params = {}) => {
  const latestEvents = await fetchLatest8Events();
  return computeFilterOptionsFromEvents(latestEvents);
};

/**
 * Fetch a single public event details by slug or id.
 */
export const fetchEventBySlug = async (slug) => {
  const cached = eventSlugCache.get(slug);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const url = `${API_BASE_URL}/public/events/${slug}`;
  const data = await fetchWithDeduplication(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (data.event) {
    data.event = normalizeEventImages(data.event);
  }

  eventSlugCache.set(slug, { data, timestamp: Date.now() });
  return data;
};

/**
 * Fetch homepage spotlight/highlighted events. Only returns highlights from the 8 latest events.
 */
export const fetchHomeHighlights = async (limit = 12) => {
  const latestEvents = await fetchLatest8Events();
  
  const url = `${API_BASE_URL}/public/home-highlights?limit=${limit}`;
  try {
    const data = await fetchWithDeduplication(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const rawEvents = (data.events || []).map(normalizeEventImages);
    const filteredHighlights = rawEvents.filter(h => 
      latestEvents.some(le => le.id === h.id)
    );

    const finalHighlights = filteredHighlights.length > 0 
      ? filteredHighlights 
      : latestEvents.slice(0, 3);

    return {
      success: true,
      events: finalHighlights
    };
  } catch (err) {
    return {
      success: true,
      events: latestEvents.slice(0, 3)
    };
  }
};

/**
 * Fetch spotlight events from the backend (events with isSpotlight=true).
 */
export const fetchSpotlightEvents = async () => {
  if (spotlightCache && (Date.now() - spotlightCache.timestamp < CACHE_TTL_MS)) {
    return spotlightCache.data;
  }

  const url = `${API_BASE_URL}/public/spotlight-events`;
  const data = await fetchWithDeduplication(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (data.events) {
    data.events = data.events.map(normalizeEventImages);
  }

  spotlightCache = { data, timestamp: Date.now() };
  return data;
};

/**
 * Fetch available event languages dynamically from the 8 latest events.
 */
export const fetchEventLanguages = async () => {
  const latestEvents = await fetchLatest8Events();
  const langs = new Set();
  
  latestEvents.forEach(e => {
    if (e.languages) {
      e.languages.forEach(l => langs.add(l));
    }
  });

  return { 
    languages: Array.from(langs) 
  };
};
