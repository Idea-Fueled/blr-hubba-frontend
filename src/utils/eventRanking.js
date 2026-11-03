/**
 * Event Ranking Implementation according to Event Listing Specification (Item 12):
 * 
 * When no filters are selected, the events are listed by following a combination of:
 * (1) Upcoming events always appear before past events
 * (2) Events with shorter shows appear before longer shows
 * (3) In all other cases, the events are listed in chronological order
 * 
 * Formula:
 * Rank = T x D x S
 * 
 * Where:
 * - 'T' = smallest of (t1, t2, t3...)
 *         't' = number of hours between current time (when page opened) and that show.
 *               If negative, add 8760 (365 x 24).
 * - 'D' = Duration of the first show selected (in hours)
 * - 'S' = Number of shows remaining for the event
 * 
 * This listing is fixed in a user session for each combination of filters.
 */

const SESSION_TIME_KEY = "blr_event_listing_session_time";

/**
 * Returns fixed user session time (initialized once per browser tab session).
 */
export const getSessionReferenceTime = () => {
    try {
        if (typeof window !== "undefined" && window.sessionStorage) {
            const stored = sessionStorage.getItem(SESSION_TIME_KEY);
            if (stored) {
                const ts = Number(stored);
                if (!isNaN(ts) && ts > 0) {
                    return new Date(ts);
                }
            }
            const now = Date.now();
            sessionStorage.setItem(SESSION_TIME_KEY, String(now));
            return new Date(now);
        }
    } catch {
        // Fallback if sessionStorage is not accessible
    }
    return new Date();
};

/**
 * Extracts all show instances for an event.
 * Each show has { startTime: Date, endTime: Date, durationHours: number }.
 */
export const extractEventShows = (event) => {
    const shows = [];
    const raw = event?.rawEvent || event || {};

    // Check eventDates with timeSlots
    if (raw.eventDates && Array.isArray(raw.eventDates) && raw.eventDates.length > 0) {
        raw.eventDates.forEach((ed) => {
            const dateStr = ed.date ? new Date(ed.date).toISOString().split("T")[0] : null;

            if (ed.timeSlots && Array.isArray(ed.timeSlots) && ed.timeSlots.length > 0) {
                ed.timeSlots.forEach((slot) => {
                    let startTime = null;
                    let endTime = null;

                    if (slot.startTime) {
                        if (slot.startTime.includes("T")) {
                            startTime = new Date(slot.startTime);
                        } else if (dateStr) {
                            startTime = new Date(`${dateStr}T${slot.startTime}`);
                        }
                    }

                    if (slot.endTime) {
                        if (slot.endTime.includes("T")) {
                            endTime = new Date(slot.endTime);
                        } else if (dateStr) {
                            endTime = new Date(`${dateStr}T${slot.endTime}`);
                        }
                    }

                    if (!startTime || isNaN(startTime.getTime())) {
                        startTime = ed.date ? new Date(ed.date) : (event.startDateTime ? new Date(event.startDateTime) : null);
                    }

                    let durationHours = 0;
                    if (startTime && endTime && !isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
                        durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                    }
                    if (durationHours <= 0) {
                        const mins = event.duration || event.eventLength || 60;
                        durationHours = mins / 60;
                    }

                    if (startTime && !isNaN(startTime.getTime())) {
                        shows.push({
                            startTime,
                            endTime: endTime && !isNaN(endTime.getTime()) ? endTime : new Date(startTime.getTime() + durationHours * 3600000),
                            durationHours: Math.max(0.1, durationHours)
                        });
                    }
                });
            } else if (ed.date) {
                const startTime = new Date(ed.date);
                if (!isNaN(startTime.getTime())) {
                    const mins = event.duration || event.eventLength || 60;
                    const durationHours = Math.max(0.1, mins / 60);
                    shows.push({
                        startTime,
                        endTime: new Date(startTime.getTime() + durationHours * 3600000),
                        durationHours
                    });
                }
            }
        });
    }

    // Fallback: use event.startDateTime and endDateTime
    if (shows.length === 0 && event?.startDateTime) {
        const startTime = new Date(event.startDateTime);
        const endTime = event.endDateTime ? new Date(event.endDateTime) : null;
        let durationHours = 0;
        if (endTime && !isNaN(endTime.getTime())) {
            durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        }
        if (durationHours <= 0) {
            const mins = event.duration || event.eventLength || 60;
            durationHours = mins / 60;
        }

        if (!isNaN(startTime.getTime())) {
            shows.push({
                startTime,
                endTime: endTime && !isNaN(endTime.getTime()) ? endTime : new Date(startTime.getTime() + durationHours * 3600000),
                durationHours: Math.max(0.1, durationHours)
            });
        }
    }

    return shows;
};

/**
 * Calculates Rank for an event using:
 * Rank = T x D x S
 */
export const calculateEventRank = (event, sessionTime = getSessionReferenceTime()) => {
    const sessionMs = (sessionTime instanceof Date ? sessionTime : new Date(sessionTime)).getTime();
    const shows = extractEventShows(event);

    if (shows.length === 0) {
        // Fallback for events without valid date data
        return { rank: 8760 * 100, T: 8760, D: 1, S: 1 };
    }

    let minT = Infinity;
    let selectedShow = shows[0];
    let remainingShowsCount = 0;

    shows.forEach((show) => {
        const diffMs = show.startTime.getTime() - sessionMs;
        const diffHours = diffMs / (1000 * 60 * 60);

        let t;
        if (diffHours < 0) {
            // Past show: add 8760 (365 * 24 hours)
            t = diffHours + 8760;
        } else {
            // Upcoming show
            t = diffHours;
            remainingShowsCount += 1;
        }

        if (t < minT) {
            minT = t;
            selectedShow = show;
        }
    });

    const T = minT;
    const D = selectedShow?.durationHours || 1;
    // S = Number of shows remaining for the event.
    // If all shows are in the past, remaining shows count is 0.
    // To prevent Rank becoming 0 for past events (which would place them at the top),
    // S represents total shows (or at least 1).
    const S = remainingShowsCount > 0 ? remainingShowsCount : (shows.length || 1);

    const rank = T * D * S;

    return { rank, T, D, S, selectedShow, hasUpcomingShow: remainingShowsCount > 0 };
};

/**
 * Sorts an array of events by Rank (ascending: lowest rank first).
 * Rules:
 * (1) Upcoming events always appear before past events
 * (2) Events with shorter shows appear before longer shows
 * (3) In all other cases, events are listed in chronological order
 */
export const sortEventsByRank = (events, sessionTime = getSessionReferenceTime()) => {
    if (!Array.isArray(events) || events.length === 0) return [];

    return [...events].sort((a, b) => {
        const rankInfoA = calculateEventRank(a, sessionTime);
        const rankInfoB = calculateEventRank(b, sessionTime);

        // Rule (1): Upcoming events always appear before past events
        if (rankInfoA.hasUpcomingShow !== rankInfoB.hasUpcomingShow) {
            return rankInfoA.hasUpcomingShow ? -1 : 1;
        }

        if (rankInfoA.rank !== rankInfoB.rank) {
            return rankInfoA.rank - rankInfoB.rank;
        }

        // Tie-breaker 1: Earliest start time
        const timeA = new Date(a.startDateTime || 0).getTime();
        const timeB = new Date(b.startDateTime || 0).getTime();
        if (timeA !== timeB) {
            return timeA - timeB;
        }

        // Tie-breaker 2: Duration
        const durA = a.duration || 0;
        const durB = b.duration || 0;
        if (durA !== durB) {
            return durA - durB;
        }

        // Tie-breaker 3: Alphabetical by title
        return (a.title || "").localeCompare(b.title || "");
    });
};
