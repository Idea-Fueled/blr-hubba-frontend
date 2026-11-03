/**
 * Shared event data transformers.
 * Maps backend API response shapes to the frontend component props.
 */

/**
 * Infer a zone from venue name (no zone data in backend).
 */
/**
 * Capitalizes the first letter of each word in a string (Title Case).
 */
export const toTitleCase = (str) => {
    if (!str || typeof str !== "string") return str || "";
    return str
        .trim()
        .split(/\s+/)
        .map(word => {
            if (!word) return word;
            if (word.includes("-")) {
                return word.split("-").map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "").join("-");
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

export const formatAgeSuitability = (event) => {
    if (!event) return "All Ages";
    const raw = event.suitability || event.ageSuitability || event.ageLimit || event.ageRestriction;
    if (!raw) return "All Ages";

    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed === "ALL_AGES") return "All Ages";
        if (trimmed === "THIRTEEN_PLUS") return "13+";
        if (trimmed === "EIGHTEEN_PLUS") return "18+";
        if (trimmed === "SEE_ADVISORY") return "See Advisory";
        if (trimmed.includes("_")) {
            return trimmed.replace(/_/g, " ");
        }
        return trimmed;
    }
    if (typeof raw === "number") {
        return `${raw}+`;
    }
    return String(raw);
};

export const getZoneFromVenueName = (venueName) => {
    if (!venueName) return "Central";
    const name = venueName.toLowerCase();
    if (name.includes("bic") || name.includes("east")) return "East";
    if (name.includes("prestige") || name.includes("south")) return "South";
    if (name.includes("ngma") || name.includes("gallery") || name.includes("freedom")) return "Central";
    return "Central";
};

/**
 * Helper to display venue text for an event:
 * - If multiple venues (venuesCount > 1 or venues array > 1) -> "[X] Venues" (e.g. "4 Venues", "10 Venues")
 * - If single venue -> Venue Name (e.g. "Freedom Park")
 * - Fallback -> "Bengaluru"
 */
export const getEventVenueDisplayText = (event) => {
    if (!event) return "Bengaluru";

    // 1. Check explicit venue count if provided
    const explicitCount = Number(event.venueCount || event.venuesCount || event.totalVenues || 0);
    if (explicitCount > 1) {
        return `${explicitCount} Venues`;
    }

    // 2. Collect venues from event object
    const venuesSet = new Set();

    const addV = (v) => {
        if (!v) return;
        if (typeof v === "string" && v.trim()) {
            venuesSet.add(v.trim());
        } else if (typeof v === "object") {
            const name = v.name || v.title || v.venue || v.location || "";
            if (typeof name === "string" && name.trim()) venuesSet.add(name.trim());
        }
    };

    if (Array.isArray(event.venues)) event.venues.forEach(addV);
    addV(event.venue);
    addV(event.displayVenue);
    addV(event.venueName);
    addV(event.location);

    if (Array.isArray(event.eventDates)) {
        event.eventDates.forEach(ed => {
            if (Array.isArray(ed.venues)) ed.venues.forEach(addV);
            addV(ed.venue);
            addV(ed.displayVenue);
            addV(ed.location);
        });
    }

    const venuesList = Array.from(venuesSet);

    if (venuesList.length > 1) {
        return `${venuesList.length} Venues`;
    }

    if (venuesList.length === 1) {
        return venuesList[0];
    }

    // Direct fallback check
    if (typeof event.venue === "string" && event.venue.trim()) return event.venue.trim();
    if (event.venue?.name && typeof event.venue.name === "string" && event.venue.name.trim()) return event.venue.name.trim();
    if (typeof event.displayVenue === "string" && event.displayVenue.trim()) return event.displayVenue.trim();

    return "Bengaluru";
};

/**
 * Helper to display time/session text for an event:
 * - If multiple sessions/slots/dates or explicitly flagged -> "Multiple Sessions"
 * - If single time slot -> "11:00 am – 1:00 pm" (formatted without extra words like "Shows")
 */
export const getEventTimeDisplayText = (event) => {
    if (!event) return "11:00 am – 1:00 pm";

    // 1. Explicit multiple session flags
    if (
        event.hasMultipleTimeSlots ||
        event.hasMultipleSessions ||
        event.hasMultipleTimes ||
        event.isMultipleSessions ||
        (event.eventScheduleType && String(event.eventScheduleType).toUpperCase().includes("MULTI"))
    ) {
        return "Multiple Sessions";
    }

    // 2. Count time slots / show counts
    let totalSlots = 0;
    const uniqueTimes = new Set();

    if (Array.isArray(event.timeSlots) && event.timeSlots.length > 0) {
        totalSlots += event.timeSlots.length;
        event.timeSlots.forEach(ts => {
            if (ts.startTime) uniqueTimes.add(ts.startTime);
        });
    }

    if (Array.isArray(event.eventDates) && event.eventDates.length > 0) {
        event.eventDates.forEach(ed => {
            if (Array.isArray(ed.timeSlots) && ed.timeSlots.length > 0) {
                totalSlots += ed.timeSlots.length;
                ed.timeSlots.forEach(ts => {
                    if (ts.startTime) uniqueTimes.add(ts.startTime);
                });
            } else {
                totalSlots += 1;
            }
        });
    }

    if (totalSlots > 1 || uniqueTimes.size > 1 || (event.showCount && Number(event.showCount) > 1)) {
        return "Multiple Sessions";
    }

    // 3. Single time slot formatting
    if (typeof event.time === "string" && event.time.trim()) {
        const cleanTime = event.time
            .replace(/shows/gi, "")
            .replace(/sessions/gi, "")
            .replace(/-/g, "–")
            .trim();
        if (cleanTime) return cleanTime;
    }

    if (event.startDateTime) {
        const startDate = new Date(event.startDateTime);
        const endDate = event.endDateTime ? new Date(event.endDateTime) : startDate;
        if (!isNaN(startDate.getTime())) {
            const startFormatted = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
            const endFormatted = (!isNaN(endDate.getTime()))
                ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
                : startFormatted;
            return `${startFormatted} – ${endFormatted}`;
        }
    }

    return "11:00 am – 1:00 pm";
};

export const formatVenueDisplay = (venueOrVenues) => {
    if (typeof venueOrVenues === "object" && venueOrVenues !== null) {
        return getEventVenueDisplayText(venueOrVenues);
    }
    if (Array.isArray(venueOrVenues)) {
        return getEventVenueDisplayText({ venues: venueOrVenues });
    }
    if (typeof venueOrVenues === "string" && venueOrVenues.trim()) {
        return venueOrVenues.trim();
    }
    return getEventVenueDisplayText(venueOrVenues);
};

export const formatEventTiming = (timeOrEvent) => {
    if (typeof timeOrEvent === "object" && timeOrEvent !== null) {
        return getEventTimeDisplayText(timeOrEvent);
    }
    if (typeof timeOrEvent === "string" && timeOrEvent.trim()) {
        return getEventTimeDisplayText({ time: timeOrEvent });
    }
    return getEventTimeDisplayText(timeOrEvent);
};

/**
 * Format a Date to a short time string like "02:00 pm".
 */
const formatTimePart = (date) => {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
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

    const dateStr = event.date || startDate.getDate().toString();
    const monthStr = event.month || startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const weekdayStr = startDate.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

    const isMultiDay = startDate.toDateString() !== endDate.toDateString();
    const displayDateStr = event.displayDate || (isMultiDay
        ? `${startDate.getDate()}-${endDate.getDate()}`
        : dateStr);

    const timeStr = `${formatTimePart(startDate)} – ${formatTimePart(endDate)}`;

    const imageStr =
        event.coverImage ||
        event.imageUrl ||
        (event.images && event.images.length > 0
            ? (typeof event.images[0] === 'string' ? event.images[0] : event.images[0]?.url)
            : "") ||
        (event.mediaItems && event.mediaItems.length > 0
            ? (typeof event.mediaItems[0] === 'string' ? event.mediaItems[0] : event.mediaItems[0]?.url)
            : "") ||
        "";
    const isFree = event.pricingType === 'FREE' || event.ticketPrice === 0 || !event.ticketPrice;
    const genresList = event.genres
        ? event.genres.map(g => (typeof g === 'string' ? g : g?.name || g?.genre?.name || "")).filter(Boolean)
        : [];

    const venuesSet = new Set();
    const addV = (v) => {
        if (!v) return;
        if (typeof v === 'string' && v.trim()) venuesSet.add(v.trim());
        else if (typeof v === 'object') {
            const name = v.name || v.title || v.venue || v.location || "";
            if (name.trim()) venuesSet.add(name.trim());
        }
    };

    if (Array.isArray(event.venues)) event.venues.forEach(addV);
    addV(event.venue);
    addV(event.displayVenue);
    addV(event.venueName);
    addV(event.location);

    if (Array.isArray(event.eventDates)) {
        event.eventDates.forEach(ed => {
            if (Array.isArray(ed.venues)) ed.venues.forEach(addV);
            addV(ed.venue);
            addV(ed.displayVenue);
            addV(ed.location);
        });
    }
    const venuesList = Array.from(venuesSet);
    const venueCount = Number(event.venueCount || event.venuesCount || event.totalVenues || venuesList.length);

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
    const hasMultipleTimes = uniqueTimes.size > 1 || showCount > 1 || !!event.hasMultipleTimeSlots || !!event.hasMultipleSessions || !!event.hasMultipleTimes || !!event.isMultipleSessions;

    return {
        id: event.id,
        slug: event.slug,
        title: toTitleCase(event.title || event.name || ""),
        performer: event.mainPerformer ? (event.mainPerformer.toLowerCase().startsWith("by ") ? `by ${toTitleCase(event.mainPerformer.slice(3))}` : `by ${toTitleCase(event.mainPerformer)}`) : "",
        venue: toTitleCase(event.venue?.name || ""),
        displayVenue: toTitleCase(event.venue?.name || ""),
        venues: venuesList.map(v => toTitleCase(v)),
        venueCount: venueCount,
        showCount: showCount,
        hasMultipleTimes: hasMultipleTimes,
        hasMultipleTimeSlots: event.hasMultipleTimeSlots || hasMultipleTimes,
        hasMultipleSessions: event.hasMultipleSessions || hasMultipleTimes,
        eventScheduleType: event.eventScheduleType || "",
        subfestivalName: toTitleCase(event.subfestival?.name || ""),
        subfestivalLogoKey: event.subfestival?.logoKey || "",
        time: timeStr,
        date: dateStr,
        displayDate: displayDateStr,
        month: monthStr,
        weekday: weekdayStr,
        image: imageStr,
        genres: genresList.map(g => toTitleCase(g)),
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
        curatorPhoto: event.curatorPhoto || "",
        pricingType: event.pricingType || "",
        eventDates: event.eventDates || [],
        rawEvent: event
    };
};

/**
 * Map a backend event (from /public/home-highlights) to the shape expected by SpotlightCardLarge.
 */
export const mapBackendEventToSpotlight = (event) => {
    return mapBackendEventToCard(event);
};

/**
 * Computes exact Date, Venue, and Time Slot display strings for Event Detail Page (Hero & Card)
 */
export const getEventDetailFormattedInfo = (event) => {
    if (!event) {
        return {
            formattedDate: "Sun 17-25, Jan 2027",
            venueDisplay: "Freedom Park",
            timeSlotDisplay: "11:00 am — 1:00 pm",
            hasMultipleTimeSlots: false,
            uniqueVenuesCount: 1
        };
    }

    // --- 1. VENUES ---
    const uniqueVenues = [];
    const seenVenueIds = new Set();

    const addVenue = (v) => {
        if (!v) return;
        const id = v.id || v._id || (typeof v === 'string' ? v : v.name);
        if (id && !seenVenueIds.has(id)) {
            seenVenueIds.add(id);
            if (typeof v === 'object' && v.name) {
                uniqueVenues.push(v);
            } else if (typeof v === 'string') {
                uniqueVenues.push({ id: v, name: v });
            }
        }
    };

    if (event.venue) addVenue(event.venue);
    if (Array.isArray(event.venues)) event.venues.forEach(addVenue);
    if (Array.isArray(event.venueIds)) event.venueIds.forEach(id => seenVenueIds.add(id));

    if (Array.isArray(event.eventDates)) {
        event.eventDates.forEach(ed => {
            if (ed.venue) addVenue(ed.venue);
            if (ed.venueId) seenVenueIds.add(ed.venueId);
        });
    }

    const uniqueVenuesCount = Math.max(uniqueVenues.length, seenVenueIds.size);
    let venueDisplay = "";
    if (uniqueVenuesCount > 1) {
        venueDisplay = `${uniqueVenuesCount} Venues`;
    } else if (uniqueVenues.length === 1 && uniqueVenues[0].name) {
        venueDisplay = uniqueVenues[0].name;
    } else if (event.venue?.name) {
        venueDisplay = event.venue.name;
    } else if (event.venueName) {
        venueDisplay = event.venueName;
    } else {
        venueDisplay = "Freedom Park";
    }

    // --- 2. TIME SLOTS ---
    const timeSlots = [];
    if (Array.isArray(event.eventDates)) {
        event.eventDates.forEach(ed => {
            if (Array.isArray(ed.timeSlots)) {
                ed.timeSlots.forEach(ts => timeSlots.push(ts));
            }
        });
    }
    if (Array.isArray(event.timeSlots) && timeSlots.length === 0) {
        event.timeSlots.forEach(ts => timeSlots.push(ts));
    }

    const hasMultipleTimeSlots = timeSlots.length > 1 || !!event.hasMultipleTimeSlots || !!event.hasMultipleSessions;

    const formatTimePart = (rawTime) => {
        if (!rawTime) return "";
        if (typeof rawTime === "string" && (rawTime.toLowerCase().includes("am") || rawTime.toLowerCase().includes("pm"))) {
            return rawTime.toLowerCase().replace(/-/g, "—");
        }
        const d = new Date(rawTime.includes("T") ? rawTime : `2000-01-01T${rawTime}`);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
        }
        return String(rawTime);
    };

    let timeSlotDisplay = "";
    if (hasMultipleTimeSlots) {
        timeSlotDisplay = "Multiple Shows";
    } else if (timeSlots.length === 1) {
        const ts = timeSlots[0];
        const startStr = formatTimePart(ts.startTime || ts.start || ts.time);
        const endStr = formatTimePart(ts.endTime || ts.end);
        if (startStr && endStr) {
            timeSlotDisplay = `${startStr} — ${endStr}`;
        } else if (startStr) {
            timeSlotDisplay = startStr;
        } else {
            timeSlotDisplay = "11:00 am — 1:00 pm";
        }
    } else if (event.startDateTime && event.endDateTime) {
        const sD = new Date(event.startDateTime);
        const eD = new Date(event.endDateTime);
        if (!isNaN(sD.getTime()) && !isNaN(eD.getTime())) {
            const startStr = formatTimePart(sD.toISOString());
            const endStr = formatTimePart(eD.toISOString());
            timeSlotDisplay = `${startStr} — ${endStr}`;
        } else {
            timeSlotDisplay = "11:00 am — 1:00 pm";
        }
    } else if (event.time) {
        timeSlotDisplay = formatTimePart(event.time);
    } else {
        timeSlotDisplay = "11:00 am — 1:00 pm";
    }

    // --- 3. DATES ---
    const datesList = [];
    if (Array.isArray(event.eventDates)) {
        event.eventDates.forEach(ed => {
            if (ed.date) {
                const d = new Date(ed.date);
                if (!isNaN(d.getTime())) datesList.push(d);
            }
        });
    }
    if (datesList.length === 0 && event.startDateTime) {
        const sD = new Date(event.startDateTime);
        if (!isNaN(sD.getTime())) datesList.push(sD);
        if (event.endDateTime) {
            const eD = new Date(event.endDateTime);
            if (!isNaN(eD.getTime())) datesList.push(eD);
        }
    }

    let formattedDate = "";
    if (datesList.length > 0) {
        datesList.sort((a, b) => a.getTime() - b.getTime());
        const first = datesList[0];
        const last = datesList[datesList.length - 1];

        const isSameDay = first.getFullYear() === last.getFullYear() &&
            first.getMonth() === last.getMonth() &&
            first.getDate() === last.getDate();

        const weekday = first.toLocaleDateString('en-US', { weekday: 'short' });
        const month = first.toLocaleDateString('en-US', { month: 'short' });
        const year = first.getFullYear();

        if (isSameDay) {
            // Single date: "Sun 17, Jan 2027" (same line)
            formattedDate = `${weekday} ${first.getDate()}, ${month} ${year}`;
        } else if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
            // Multiple dates range in same month: "Sun 17-25, Jan 2027"
            formattedDate = `${weekday} ${first.getDate()}-${last.getDate()}, ${month} ${year}`;
        } else {
            // Different months: "Sun 17 Jan — Mon 25 Feb, 2027"
            const lastMonth = last.toLocaleDateString('en-US', { month: 'short' });
            formattedDate = `${weekday} ${first.getDate()} ${month} — ${last.getDate()} ${lastMonth}, ${year}`;
        }
    } else {
        formattedDate = "Sun 17-25, Jan 2027";
    }

    return {
        formattedDate,
        venueDisplay,
        timeSlotDisplay,
        hasMultipleTimeSlots,
        uniqueVenuesCount
    };
};
