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

// Cache for the latest 8 events to prevent multiple database hits
let cachedLatest8 = null;

/**
 * Helper to fetch the latest 8 created events from the backend.
 * These are sorted by creation date descending.
 */
export const fetchLatest8Events = async () => {
  if (cachedLatest8) return cachedLatest8;
  
  // Call public events with creation date sorting, fetching a larger limit so we can deduplicate by title
  const url = `${API_BASE_URL}/public/events?sortBy=createdAt&sortOrder=desc&limit=50&pastOnly=true`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch latest events for demo mode");
  }
  
  const data = await response.json();
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
  
  cachedLatest8 = uniqueEvents;
  return cachedLatest8;
};

/**
 * Computes filter options (genres, venues, dates) dynamically from the selected events.
 */
const computeFilterOptionsFromEvents = (events) => {
  const genresMap = new Map();
  const venuesMap = new Map();
  const datesMap = new Map();

  events.forEach(event => {
    // Genres
    if (event.genres) {
      event.genres.forEach(g => {
        if (g && g.id) {
          genresMap.set(g.id, { id: g.id, name: g.name });
        }
      });
    }

    // Venue
    if (event.venue) {
      venuesMap.set(event.venue.id, { id: event.venue.id, name: event.venue.name });
    }

    // Dates
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

// In-memory caches for fast instant page rendering
const eventsCache = new Map();
let spotlightCache = null;
const eventSlugCache = new Map();

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

  const cacheKey = query.toString();

  const fetchFromNetwork = async () => {
    const url = `${API_BASE_URL}/public/events${cacheKey ? `?${cacheKey}` : ""}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();
    if (data.events) {
      data.events = data.events.map(normalizeEventImages);
    }
    eventsCache.set(cacheKey, data);
    return data;
  };

  if (eventsCache.has(cacheKey)) {
    fetchFromNetwork().catch(console.error);
    return eventsCache.get(cacheKey);
  }

  return await fetchFromNetwork();
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
  const fetchFromNetwork = async () => {
    const url = `${API_BASE_URL}/public/events/${slug}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.event) {
      data.event = normalizeEventImages(data.event);
    }
    eventSlugCache.set(slug, data);
    return data;
  };

  if (eventSlugCache.has(slug)) {
    fetchFromNetwork().catch(console.error);
    return eventSlugCache.get(slug);
  }

  return await fetchFromNetwork();
};

/**
 * Fetch homepage spotlight/highlighted events. Only returns highlights from the 8 latest events.
 */
export const fetchHomeHighlights = async (limit = 12) => {
  const latestEvents = await fetchLatest8Events();
  
  const url = `${API_BASE_URL}/public/home-highlights?limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    // Fallback: highlight the first 3 events of our latest 8
    return {
      success: true,
      events: latestEvents.slice(0, 3)
    };
  }

  const data = await response.json();
  const rawEvents = (data.events || []).map(normalizeEventImages);
  const filteredHighlights = rawEvents.filter(h => 
    latestEvents.some(le => le.id === h.id)
  );

  // If no highlights are in the latest 8 events, fallback to the first 3 latest events
  const finalHighlights = filteredHighlights.length > 0 
    ? filteredHighlights 
    : latestEvents.slice(0, 3);

  return {
    success: true,
    events: finalHighlights
  };
};

/**
 * Fetch spotlight events from the backend (events with isSpotlight=true).
 */
export const fetchSpotlightEvents = async () => {
  const fetchFromNetwork = async () => {
    const url = `${API_BASE_URL}/public/spotlight-events`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch spotlight events");
    }

    const data = await response.json();
    if (data.events) {
      data.events = data.events.map(normalizeEventImages);
    }
    spotlightCache = data;
    return data;
  };

  if (spotlightCache) {
    fetchFromNetwork().catch(console.error);
    return spotlightCache;
  }

  return await fetchFromNetwork();
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
