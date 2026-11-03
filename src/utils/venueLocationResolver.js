/**
 * Venue Distance and Geolocation Utilities
 */

// Default coordinates for known Bengaluru venues & landmarks
export const DEFAULT_VENUE_COORDS = {
    "freedom park": { lat: 12.9779, lng: 77.5822 },
    "ngma": { lat: 12.9892, lng: 77.5898 },
    "national gallery of modern art": { lat: 12.9892, lng: 77.5898 },
    "panchavati": { lat: 13.0035, lng: 77.5685 },
    "malleshwaram": { lat: 13.0035, lng: 77.5685 },
    "sabha": { lat: 12.9780, lng: 77.6145 },
    "kamaraj": { lat: 12.9780, lng: 77.6145 },
    "shivaji nagar": { lat: 12.9856, lng: 77.6057 },
    "bangalore international centre": { lat: 12.9634, lng: 77.6382 },
    "bic": { lat: 12.9634, lng: 77.6382 },
    "domlur": { lat: 12.9634, lng: 77.6382 },
    "ranga shankara": { lat: 12.9126, lng: 77.5861 },
    "chowdiah memorial hall": { lat: 13.0089, lng: 77.5750 },
    "town hall": { lat: 12.9638, lng: 77.5839 },
    "cubbon park": { lat: 12.9763, lng: 77.5929 },
    "lalbagh": { lat: 12.9507, lng: 77.5848 },
};

// Fallback spread coordinates across Bengaluru for unnamed/generic API venues
const FALLBACK_COORDS_GRID = [
    { lat: 12.9779, lng: 77.5822 }, // Freedom Park area (~ 1.8 km from MG Road)
    { lat: 12.9892, lng: 77.5898 }, // Palace Road (~ 2.2 km)
    { lat: 12.9634, lng: 77.6382 }, // Domlur (~ 4.9 km)
    { lat: 12.9126, lng: 77.5861 }, // JP Nagar (~ 7.3 km)
    { lat: 13.0089, lng: 77.5750 }, // Malleshwaram (~ 4.8 km)
    { lat: 12.8715, lng: 77.5678 }, // Kanakapura Road (~ 11.5 km)
];

// Fallback city center (MG Road / Central Bengaluru)
export const DEFAULT_USER_LOCATION = { lat: 12.9716, lng: 77.5946 };

/**
 * Calculate Haversine distance in kilometers between two lat/lng pairs.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Extract best lat/lng coordinates for a venue object.
 */
export const getVenueCoordinates = (venue, index = 0) => {
    if (!venue) return FALLBACK_COORDS_GRID[index % FALLBACK_COORDS_GRID.length];

    const lat = parseFloat(venue.latitude || venue.lat);
    const lng = parseFloat(venue.longitude || venue.lng || venue.lon);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng };
    }

    // Try extracting coordinates from googleMapsLink (e.g. @12.9779211,77.5773175 or !3d12.9779159!4d77.5821884)
    const mapsLink = venue.googleMapsLink || venue.googleMapLink || venue.mapUrl || "";
    if (mapsLink) {
        const atMatch = mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
            return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
        }
        const dataMatch = mapsLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (dataMatch) {
            return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
        }
    }

    const nameLower = (venue.name || "").toLowerCase().trim();
    const addressLower = (venue.address || "").toLowerCase().trim();
    const combined = `${nameLower} ${addressLower}`;

    for (const [key, coords] of Object.entries(DEFAULT_VENUE_COORDS)) {
        if (combined.includes(key)) {
            return coords;
        }
    }

    return FALLBACK_COORDS_GRID[index % FALLBACK_COORDS_GRID.length];
};

/**
 * Format calculated distance into a clean string (e.g., "1.5 Kms" or "800 Mtrs").
 */
export const formatDistanceText = (venue, userLocation = null, index = 0) => {
    const userLoc = userLocation || DEFAULT_USER_LOCATION;
    const vCoords = getVenueCoordinates(venue, index);
    const dist = calculateDistanceKm(userLoc.lat, userLoc.lng, vCoords.lat, vCoords.lng);

    if (dist === null || isNaN(dist)) return "1.5 Kms";

    if (dist < 1) {
        const meters = Math.round(dist * 1000);
        return `${meters} Mtrs`;
    }

    return `${dist.toFixed(1)} Kms`;
};

/**
 * Get numeric distance in Km for sorting.
 */
export const getRawDistanceKm = (venue, userLocation = null, index = 0) => {
    const userLoc = userLocation || DEFAULT_USER_LOCATION;
    const vCoords = getVenueCoordinates(venue, index);
    return calculateDistanceKm(userLoc.lat, userLoc.lng, vCoords.lat, vCoords.lng) || 999;
};
