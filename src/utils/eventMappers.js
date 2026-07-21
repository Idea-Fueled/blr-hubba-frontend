/**
 * Shared event data transformers.
 * Maps backend API response shapes to the frontend component props.
 */

/**
 * Infer a zone from venue name (no zone data in backend).
 */
export const getZoneFromVenueName = (venueName) => {
    if (!venueName) return "Central";
    const name = venueName.toLowerCase();
    if (name.includes("bic") || name.includes("east")) return "East";
    if (name.includes("prestige") || name.includes("south")) return "South";
    if (name.includes("ngma") || name.includes("gallery") || name.includes("freedom")) return "Central";
    return "Central";
};

export const formatVenueDisplay = (venues) => {
    if (!venues || !Array.isArray(venues) || venues.length === 0) return "";
    if (venues.length === 1) return venues[0];
    if (venues.length === 2) return `${venues[0]}, ${venues[1]}`;
    return `${venues[0]}, ${venues[1]} +${venues.length - 2}`;
};

export const formatEventTiming = (showCount, subfestivalName) => {
    if (!showCount || showCount <= 1) {
        return null;
    }

    const sessionsFestivals = [
        "aata hubba", "makkala hubba", "samvada hubba", "swara hubba", "udyana hubba",
        "kriya hubba", "thindi hubba", "santhe hubba", "rasthe hubba", "hubba on wheels"
    ];

    const cleanName = (subfestivalName || "").toLowerCase().trim();

    if (sessionsFestivals.includes(cleanName)) {
        return `${showCount} Sessions`;
    }
    return `${showCount} Shows`;
};

/**
 * Format a Date to a short time string like "02:00 pm".
 */
const formatTimePart = (date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();
};

/**
 * Map a backend event object (from /public/events) to the shape expected by EventCard.
 */
export const mapBackendEventToCard = (event) => {
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    const dateStr = startDate.getDate().toString();
    const monthStr = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const weekdayStr = startDate.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

    const isMultiDay = startDate.toDateString() !== endDate.toDateString();
    const displayDateStr = isMultiDay
        ? `${startDate.getDate()}-${endDate.getDate()}`
        : dateStr;

    const timeStr = `${formatTimePart(startDate)} - ${formatTimePart(endDate)}`;

    const imageStr = event.imageUrl || event.coverImage || "";
    const isFree = event.pricingType === 'FREE' || event.ticketPrice === 0 || !event.ticketPrice;
    const genresList = event.genres ? event.genres.map(g => g.name) : [];

    const venuesSet = new Set();
    if (event.venue?.name) {
        venuesSet.add(event.venue.name);
    }
    if (event.eventDates) {
        event.eventDates.forEach(ed => {
            if (ed.venue?.name) {
                venuesSet.add(ed.venue.name);
            }
        });
    }
    const venuesList = Array.from(venuesSet);

    let showCount = 0;
    const uniqueTimes = new Set();
    if (event.eventDates && event.eventDates.length > 0) {
        event.eventDates.forEach(ed => {
            if (ed.timeSlots && ed.timeSlots.length > 0) {
                showCount += ed.timeSlots.length;
                ed.timeSlots.forEach(ts => {
                    if (ts.startTime) {
                        const normalizedTime = ts.startTime.includes('T')
                            ? new Date(ts.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                            : ts.startTime;
                        uniqueTimes.add(normalizedTime);
                    }
                });
            } else {
                showCount += 1;
            }
        });
    } else {
        showCount = 1;
    }
    const hasMultipleTimes = uniqueTimes.size > 1;

    return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        performer: event.mainPerformer ? `by ${event.mainPerformer}` : "",
        venue: event.venue?.name || "",
        displayVenue: event.venue?.name || "",
        venues: venuesList,
        showCount: showCount,
        hasMultipleTimes: hasMultipleTimes,
        eventScheduleType: event.eventScheduleType || "",
        subfestivalName: event.subfestival?.name || "",
        subfestivalLogoKey: event.subfestival?.logoKey || "",
        time: timeStr,
        date: dateStr,
        displayDate: displayDateStr,
        month: monthStr,
        weekday: weekdayStr,
        image: imageStr,
        genres: genresList,
        isFree: isFree,
        isAvailable: true,
        isMultiDay: isMultiDay,
        zone: getZoneFromVenueName(event.venue?.name),
        language: event.languages?.[0] || "English",
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        eventLength: event.eventLength || 0,
        duration: event.eventLength || (event.endDateTime && event.startDateTime ? (new Date(event.endDateTime) - new Date(event.startDateTime)) / (60 * 1000) : 0),
        curatedBy: event.curatedBy || "",
        pricingType: event.pricingType || ""
    };
};

/**
 * Map a backend event (from /public/home-highlights) to the shape expected by SpotlightCardLarge.
 */
export const mapBackendEventToSpotlight = (event) => {
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    const dateStr = startDate.getDate().toString();
    const monthStr = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    const timeStr = `${formatTimePart(startDate)} – ${formatTimePart(endDate)}`;
    const imageStr = event.imageUrl || event.coverImage || "";

    const venuesSet = new Set();
    if (event.venue?.name) {
        venuesSet.add(event.venue.name);
    }
    if (event.eventDates) {
        event.eventDates.forEach(ed => {
            if (ed.venue?.name) {
                venuesSet.add(ed.venue.name);
            }
        });
    }
    const venuesList = Array.from(venuesSet);

    let showCount = 0;
    const uniqueTimes = new Set();
    if (event.eventDates && event.eventDates.length > 0) {
        event.eventDates.forEach(ed => {
            if (ed.timeSlots && ed.timeSlots.length > 0) {
                showCount += ed.timeSlots.length;
                ed.timeSlots.forEach(ts => {
                    if (ts.startTime) {
                        const normalizedTime = ts.startTime.includes('T')
                            ? new Date(ts.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                            : ts.startTime;
                        uniqueTimes.add(normalizedTime);
                    }
                });
            } else {
                showCount += 1;
            }
        });
    } else {
        showCount = 1;
    }
    const hasMultipleTimes = uniqueTimes.size > 1;

    return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        performer: event.mainPerformer ? `by ${event.mainPerformer}` : "",
        venue: event.venue?.name || "",
        venues: venuesList,
        showCount: showCount,
        hasMultipleTimes: hasMultipleTimes,
        eventScheduleType: event.eventScheduleType || "",
        subfestivalName: event.subfestival?.name || "",
        subfestivalLogoKey: event.subfestival?.logoKey || "",
        time: timeStr,
        date: dateStr,
        month: monthStr,
        image: imageStr,
        genres: event.genres ? event.genres.map(g => g.genre?.name || g.name) : [],
        curatedBy: event.curatedBy || "",
        pricingType: event.pricingType || ""
    };
};
