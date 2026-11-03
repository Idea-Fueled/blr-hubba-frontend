export const extractSubVenueName = (item, evt) => {
    if (!item && !evt) return "";

    // Detect raw database IDs (cuid, uuid, objectId) that should NOT be displayed as names
    const looksLikeId = (s) => {
        if (!s || typeof s !== 'string') return false;
        const t = s.trim();
        // cuid: starts with 'c' followed by 20+ alphanumeric chars
        if (/^c[a-z0-9]{20,}$/i.test(t)) return true;
        // uuid: 8-4-4-4-12 hex
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return true;
        // MongoDB ObjectId: 24 hex chars
        if (/^[0-9a-f]{24}$/i.test(t)) return true;
        return false;
    };

    const checkStr = (val) => {
        if (!val) return "";
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (!trimmed || looksLikeId(trimmed)) return "";
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return checkStr(parsed);
                } catch {
                    return trimmed;
                }
            }
            return trimmed;
        }
        if (typeof val === 'object') {
            return (
                (typeof val.name === 'string' && val.name.trim()) ||
                (typeof val.title === 'string' && val.title.trim()) ||
                (typeof val.label === 'string' && val.label.trim()) ||
                ""
            );
        }
        return "";
    };

    const targetEvt = evt || item?.event || item?.rawItem?.ticket?.event || item?.ticket?.event || item?.evt || {};

    // 1. Direct subVenue linked on EventDate (Exact DB Link for specific performance)
    let res = checkStr(item?.eventDate?.subVenue) || checkStr(item?.rawItem?.eventDate?.subVenue) || checkStr(item?.subVenue) || checkStr(item?.subvenue);
    if (res) return res;

    // 2. Direct subVenue linked on Event
    res = checkStr(targetEvt?.subVenue) || checkStr(targetEvt?.subvenue);
    if (res) return res;

    // 3. String properties (venueDetail, subVenueName)
    res = checkStr(item?.venueDetail) || checkStr(item?.subVenueName) || checkStr(item?.subvenueName) ||
          checkStr(targetEvt?.venueDetail) || checkStr(targetEvt?.subVenueName) || checkStr(targetEvt?.subvenueName);
    if (res) return res;

    // 4. Multi-venue event matching by subVenueIds against venue subVenues
    const subVenueIds = item?.subVenueIds || item?.rawItem?.ticket?.event?.subVenueIds || targetEvt?.subVenueIds || [];
    if (Array.isArray(subVenueIds) && subVenueIds.length > 0) {
        const currentVenue = item?.venue || item?.eventDate?.venue || item?.rawItem?.eventDate?.venue || item?.ticket?.event?.venue || targetEvt?.venue || targetEvt?.selectedVenue;
        const vSubVenues = currentVenue?.subVenues || currentVenue?.subvenues || [];
        if (Array.isArray(vSubVenues) && vSubVenues.length > 0) {
            const matched = vSubVenues.filter(sv => sv && sv.id && subVenueIds.includes(sv.id));
            if (matched.length > 0) {
                const names = matched.map(sv => checkStr(sv)).filter(Boolean);
                if (names.length > 0) return names.join(', ');
            }
        }
    }

    return "";
};

export const getPerformerDisplay = (evt = {}, ticket = {}) => {
    const targetEvt = evt || ticket.ticket?.event || ticket.event || {};
    const raw =
        targetEvt.mainPerformer ||
        targetEvt.by ||
        targetEvt.artist ||
        targetEvt.artistName ||
        targetEvt.performer ||
        targetEvt.performerName ||
        targetEvt.organizer ||
        targetEvt.organizerName ||
        targetEvt.presentedBy ||
        (Array.isArray(targetEvt.performers) && targetEvt.performers.length > 0
            ? (typeof targetEvt.performers[0] === 'string' ? targetEvt.performers[0] : (targetEvt.performers[0]?.name || targetEvt.performers[0]?.title))
            : null) ||
        ticket.mainPerformer ||
        ticket.by ||
        ticket.artist ||
        ticket.artistName ||
        ticket.performer ||
        ticket.performerName ||
        ticket.organizer ||
        ticket.organizerName ||
        (Array.isArray(ticket.performers) && ticket.performers.length > 0
            ? (typeof ticket.performers[0] === 'string' ? ticket.performers[0] : (ticket.performers[0]?.name || targetEvt.performers[0]?.title))
            : null);

    if (!raw || typeof raw !== 'string') return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed.toLowerCase().startsWith("by ") ? trimmed : `By ${trimmed}`;
};
