const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const fetchEvents = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.genreId) query.append('genreId', params.genreId);
  if (params.venueId) query.append('venueId', params.venueId);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  // Default to include past events for local dev testing where all events are in the past
  query.append('includePast', 'true');

  const queryString = query.toString();
  const url = `${API_BASE_URL}/events${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchGenres = async () => {
  const url = `${API_BASE_URL}/genres`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch genres: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchVenues = async () => {
  const url = `${API_BASE_URL}/venues`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch venues: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchLanguages = async () => {
  const url = `${API_BASE_URL}/events/languages`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch languages: ${response.statusText}`);
  }

  return await response.json();
};
