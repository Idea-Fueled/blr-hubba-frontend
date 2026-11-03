import React, { useState, useEffect } from "react";
import "./ReviewOrder.css";
import { useLocation, useNavigate } from "react-router-dom";
import { addToCartApi, fetchMyTicketsApi, fetchCartApi, fetchEventTickets } from "../../api/bookingApi";
import { extractSubVenueName } from "../../utils/subVenueUtils";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";

const PASS_LIMITS = { free: 2, donor: 4 };
const getPassLimit = (ticket) => {
    return Infinity;
};

const getBorderColor = (code) => {
    switch (code) {
        case 'SCHEDULE_OVERLAP':
        case 'LOW_INVENTORY':
            return '#DE5100';
        case 'SOLD_OUT':
        case 'QTY_EXCEEDS':
        case 'PASS_LIMIT_EXCEEDED':
        case 'EVENT_ALREADY_BOOKED':
        default:
            return 'var(--Error, #B10000)';
    }
};

const checkEventsOverlap = (itemA, itemB) => {
    if (!itemA || !itemB) return false;
    if (itemA.id && itemB.id && itemA.id === itemB.id) return false;

    if (itemA.eventDateId && itemB.eventDateId && itemA.eventDateId === itemB.eventDateId) {
        if (itemA.timeSlotId && itemB.timeSlotId && itemA.timeSlotId === itemB.timeSlotId) {
            return true;
        }
    }

    const parseMinutes = (timeVal) => {
        if (!timeVal) return null;
        if (timeVal instanceof Date && !isNaN(timeVal.getTime())) {
            return timeVal.getHours() * 60 + timeVal.getMinutes();
        }
        const str = String(timeVal).trim();
        if (!str) return null;
        if (str.includes("T") || str.includes("Z")) {
            const d = new Date(str);
            if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
        }
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
            const parts = str.split(':');
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
        }
        const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
        if (match12) {
            let h = parseInt(match12[1], 10);
            const m = parseInt(match12[2], 10);
            const period = (match12[3] || '').toLowerCase();
            if (period === 'pm' && h < 12) h += 12;
            if (period === 'am' && h === 12) h = 0;
            return h * 60 + m;
        }
        return null;
    };

    const getItemDateStr = (item) => {
        const ci = item.rawItem || item;
        const evt = item.event || ci.ticket?.event || item.evt || {};
        const rawDate = item.eventDate?.date || ci.eventDate?.date || item.ticket?.eventDate?.date || evt.startDateTime;
        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        }
        if (item.date) {
            const cleanDate = String(item.date).split('|')[0].replace(/,/g, '').trim();
            const d = new Date(cleanDate);
            if (!isNaN(d.getTime())) {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        }
        return '';
    };

    const dateA = getItemDateStr(itemA);
    const dateB = getItemDateStr(itemB);

    if (dateA && dateB && dateA === dateB) {
        const getTimes = (item) => {
            const ci = item.rawItem || item;
            const evt = item.event || ci.ticket?.event || item.evt || {};
            const slot = ci.timeSlot || item.timeSlot || item.ticket?.timeSlot;

            const startVal = slot?.startTime || evt.startDateTime || item.eventDate?.startTime;
            const endVal = slot?.endTime || evt.endDateTime || item.eventDate?.endTime;

            let start = parseMinutes(startVal);
            let end = parseMinutes(endVal);

            if (start !== null && end !== null) {
                return { start, end };
            }
            return null;
        };

        const tA = getTimes(itemA);
        const tB = getTimes(itemB);

        if (tA && tB) {
            return (tA.start < tB.end && tB.start < tA.end);
        }
        return true;
    }

    return false;
};

export const ReviewOrder = ({ propsData, hideHeader = false }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const orderData = propsData || location.state || {};
    const event = orderData.event || {
        id: "default-event",
        title: "Pankh: A Leap of Faith",
        mainPerformer: "Kaushiki Chakraborty & Shantanu Moitra",
        startDateTime: "2027-01-25T20:30:00.000Z",
        venue: { name: "Freedom Park" },
        subVenue: { name: "Watch Tower" },
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"
    };

    const selectedTicket = orderData.selectedTicket || {
        id: "default-ticket",
        name: "DONOR",
        price: 400
    };

    const selectedDate = orderData.selectedDate;
    const selectedSlot = orderData.selectedSlot;
    const selectedVenue = orderData.selectedVenue;

    const [quantity, setQuantity] = useState(orderData.quantity || 1);
    const [submitting, setSubmitting] = useState(false);
    const [alreadyBooked, setAlreadyBooked] = useState(0);
    const [alreadyBookedAnyForEvent, setAlreadyBookedAnyForEvent] = useState(false);
    const [availableTickets, setAvailableTickets] = useState(999);
    const [validationBanners, setValidationBanners] = useState([]);
    const [hasErrors, setHasErrors] = useState(false);

    const passLimit = getPassLimit(selectedTicket);
    const remainingAllowed = passLimit !== null ? Math.max(0, passLimit - alreadyBooked) : Infinity;
    const maxedOut = passLimit !== null && remainingAllowed <= 0;

    useEffect(() => {
        let isMounted = true;

        async function validateReviewOrder() {
            let userBookings = [];
            let bookedAny = false;
            let bookedThisPassCount = 0;

            try {
                const bRes = await fetchMyTicketsApi();
                if (bRes && bRes.tickets) {
                    userBookings = bRes.tickets.filter(t => t.status !== 'CANCELLED');
                    bookedAny = userBookings.some(t => t.ticket?.event?.id === event?.id);

                    const passNameClean = (selectedTicket?.name || selectedTicket?.passType || '').toLowerCase();
                    bookedThisPassCount = userBookings
                        .filter(t => t.ticket?.event?.id === event?.id
                            && (t.ticket?.name || '').toLowerCase() === passNameClean)
                        .reduce((sum, t) => sum + (t.quantity || 1), 0);
                }
            } catch (e) { }

            let currentAvailable = 999;
            if (event?.id) {
                try {
                    const tRes = await fetchEventTickets(event.id, selectedDate?.id, selectedSlot?.id);
                    if (tRes && tRes.success && tRes.tickets) {
                        const matchingTicket = tRes.tickets.find(t => t.id === selectedTicket.id || t.name === selectedTicket.name);
                        if (matchingTicket) {
                            if (matchingTicket.availability && typeof matchingTicket.availability.available === 'number') {
                                currentAvailable = matchingTicket.availability.available;
                            } else if (typeof matchingTicket.quantity === 'number') {
                                currentAvailable = Math.max(0, matchingTicket.quantity - (matchingTicket.sold || 0));
                            }
                        }
                    }
                } catch (e) { }
            }

            let cartItems = [];
            try {
                const cRes = await fetchCartApi();
                if (cRes && cRes.cartItems) {
                    cartItems = cRes.cartItems;
                } else {
                    cartItems = JSON.parse(localStorage.getItem('user_cart') || '[]');
                }
            } catch (e) {
                cartItems = JSON.parse(localStorage.getItem('user_cart') || '[]');
            }

            if (!isMounted) return;

            setAlreadyBookedAnyForEvent(bookedAny);
            setAlreadyBooked(bookedThisPassCount);
            setAvailableTickets(currentAvailable);

            const banners = [];
            let errFound = false;

            // Re-booking and unlimited passes allowed (no EVENT_ALREADY_BOOKED or PASS_LIMIT_EXCEEDED banners)

            // 3. Availability / Sold Out Check
            if (currentAvailable === 0) {
                banners.push({
                    type: "ERROR",
                    code: "SOLD_OUT",
                    message: "This event is booked out. Remove event to proceed."
                });
                errFound = true;
            } else if (quantity > currentAvailable) {
                banners.push({
                    type: "ERROR",
                    code: "QTY_EXCEEDS",
                    message: `Only ${currentAvailable} ticket${currentAvailable === 1 ? '' : 's'} available.`
                });
                errFound = true;
            } else if (currentAvailable > 0 && currentAvailable < 5 && quantity >= currentAvailable) {
                banners.push({
                    type: "WARNING",
                    code: "LOW_INVENTORY",
                    message: `Only ${currentAvailable} ticket${currentAvailable === 1 ? '' : 's'} available for this event.`
                });
            }

            // 4. Schedule Overlap Check
            const currentReviewItem = {
                id: 'review_item',
                event,
                eventDateId: selectedDate?.id,
                timeSlotId: selectedSlot?.id,
                eventDate: selectedDate,
                timeSlot: selectedSlot,
                date: formattedDateStr
            };

            const overlapsWithBookings = userBookings.some(b => checkEventsOverlap(currentReviewItem, b));
            const overlapsWithCart = cartItems.some(c => checkEventsOverlap(currentReviewItem, c));

            if (currentAvailable > 0 && (overlapsWithBookings || overlapsWithCart)) {
                banners.push({
                    type: "WARNING",
                    code: "SCHEDULE_OVERLAP",
                    message: "This event overlaps with another booking in your cart or existing bookings. Please review your schedule."
                });
            }

            setValidationBanners(banners);
            setHasErrors(errFound);
        }

        validateReviewOrder();

        return () => { isMounted = false; };
    }, [event?.id, selectedTicket?.id, selectedTicket?.name, selectedDate?.id, selectedSlot?.id, quantity]);

    const price = (selectedTicket.price !== undefined && selectedTicket.price !== null)
        ? Number(selectedTicket.price)
        : (selectedTicket.name?.toLowerCase().includes("free") ? 0 : 400);
    const total = quantity * price;

    const increaseQty = () => {
        const maxLimit = Math.min(availableTickets, remainingAllowed);
        if (quantity >= maxLimit) return;
        setQuantity(prev => prev + 1);
    };

    const decreaseQty = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        setSubmitting(true);
        const newItem = {
            id: `cart_${Date.now()}`,
            ticketId: selectedTicket?.id,
            eventId: event?.id,
            eventDateId: selectedDate?.id,
            timeSlotId: selectedSlot?.id,
            title: event?.title || "Pankh: A Leap of Faith",
            by: performerText,
            date: formattedDateStr,
            venue: venueName,
            venueDetail: subVenueName,
            passType: getPassTypeDisplay(selectedTicket),
            price: price,
            image: imageUrl,
            quantity: quantity
        };

        try {
            const existingCart = JSON.parse(localStorage.getItem('user_cart') || '[]');
            const idx = existingCart.findIndex(c => c.ticketId === newItem.ticketId && c.eventDateId === newItem.eventDateId);
            if (idx >= 0) {
                existingCart[idx].quantity += quantity;
            } else {
                existingCart.push(newItem);
            }
            localStorage.setItem('user_cart', JSON.stringify(existingCart));
        } catch (e) { }

        try {
            if (selectedTicket?.id) {
                await addToCartApi({
                    ticketId: selectedTicket.id,
                    quantity,
                    pricePerTicket: price,
                    eventDateId: selectedDate?.id,
                    timeSlotId: selectedSlot?.id
                });
            }
        } catch (err) {
            console.error("Add to cart failed:", err);
        } finally {
            setSubmitting(false);
            navigate("/cart-confirmation", {
                state: {
                    event,
                    selectedTicket,
                    quantity,
                    totalPrice: total,
                    cartItem: newItem
                }
            });
        }
    };

    const formatTimeString = (timeVal) => {
        if (!timeVal) return "";
        if (timeVal instanceof Date) {
            if (!isNaN(timeVal.getTime())) {
                return timeVal.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                }).toLowerCase();
            }
            return "";
        }
        const str = String(timeVal).trim();
        if (!str) return "";
        if (str.includes("T") || str.includes("Z")) {
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                return d.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                }).toLowerCase();
            }
        }
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
            const parts = str.split(':');
            let hours = parseInt(parts[0], 10);
            const minutes = parts[1];
            if (!isNaN(hours)) {
                const period = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                if (hours === 0) hours = 12;
                return `${hours}:${minutes} ${period}`;
            }
        }
        return str.toLowerCase();
    };

    const getFormattedDateStr = () => {
        let datePart = "";
        if (selectedDate?.dateObj) {
            datePart = selectedDate.dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        } else if (selectedDate?.weekday && selectedDate?.day) {
            datePart = `${selectedDate.weekday} ${selectedDate.day} ${selectedDate.month || ''}`;
        } else if (event.startDateTime) {
            datePart = new Date(event.startDateTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        } else {
            datePart = "Monday 25 Jan, 2027";
        }

        let timePart = "";
        if (selectedSlot) {
            const start = formatTimeString(selectedSlot.startTime);
            const end = formatTimeString(selectedSlot.endTime);
            if (start && end) {
                timePart = `${start}–${end}`;
            } else if (start || end) {
                timePart = start || end;
            } else if (selectedSlot.timeDisplay) {
                timePart = selectedSlot.timeDisplay;
            }
        }

        if (!timePart && (event.startDateTime || event.endDateTime)) {
            const start = formatTimeString(event.startDateTime);
            const end = formatTimeString(event.endDateTime);
            if (start && end) {
                timePart = `${start}–${end}`;
            } else if (start || end) {
                timePart = start || end;
            }
        }

        if (!timePart) {
            timePart = "8:30 pm–10:00 pm";
        }

        return `${datePart} | ${timePart}`;
    };

    const formattedDateStr = getFormattedDateStr();

    const getPassTypeDisplay = (pass) => {
        if (!pass) return "DONOR PASS";
        const name = String(pass.name || pass.passType || pass.title || '').toLowerCase();
        const type = String(pass.type || pass.ticketType || pass.pricingType || '').toUpperCase();
        const priceVal = Number(pass.price ?? pass.ticketPrice ?? 0);

        if (type === 'FREE' || priceVal === 0 || name.includes('free')) {
            return "FREE PASS";
        }
        return "DONOR PASS";
    };

    const getSubVenueName = () => {
        return extractSubVenueName(selectedDate?.raw || selectedVenue || event, event);
    };

    const venueName = selectedVenue?.name || event.venue?.name || "Freedom Park";
    const subVenueName = getSubVenueName();
    const performerText = event.mainPerformer ? `By ${event.mainPerformer}` : (event.performers?.[0] ? `By ${event.performers[0].name}` : "");

    const extractRawUrl = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") {
            return val.url || val.data || val.path || val.src || "";
        }
        return "";
    };

    const getGeneralImageFromMedia = (images) => {
        if (!images || !Array.isArray(images) || images.length === 0) return "";
        const generalImage = images.find(img => img && img.purpose !== 'performer');
        if (generalImage) return extractRawUrl(generalImage);
        return extractRawUrl(images[0]);
    };

    const media = event.media || {};
    const rawImage =
        event.coverImage ||
        extractRawUrl(event.imageUrl) ||
        getGeneralImageFromMedia(media.images169) ||
        getGeneralImageFromMedia(media.images11) ||
        (event.images && event.images.length > 0 ? extractRawUrl(event.images[0]) : "") ||
        (event.mediaItems && event.mediaItems.length > 0 ? extractRawUrl(event.mediaItems[0]) : "") ||
        "";

    const imageUrl = rawImage || (selectedTicket?.name?.toLowerCase().includes("free") ? freePassImage : donorPassImage);

    return (
        <section className="review-order-main-container" style={hideHeader ? { padding: "0", marginTop: "20px" } : {}}>

            {/* ================= TOP ================= */}

            {!hideHeader && (
                <div className="review-order-top-row-container">

                    <div className="review-order-top-row-header">

                        <div className="review-order-back-btn" onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                                fill="none"
                            >
                                <path
                                    d="M22.1673 14H5.83398M14.0007 5.83334L5.83398 14L14.0007 22.1667"
                                    stroke="#181C20"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                        </div>

                        <h2>REVIEW ORDER</h2>

                    </div>

                    <div className="review-order-steps">

                        <div className="step active">
                            <span>1</span>
                            <p>Select Pass</p>
                        </div>

                        <div className="step active">
                            <span>2</span>
                            <p>Review &amp; Add to Cart</p>
                        </div>

                    </div>

                </div>
            )}

            {/* ================= TABLE HEADER ================= */}

            <div className="review-order-table">

                <div className="review-order-table-header">

                    <div className="item-column">
                        ITEM
                    </div>

                    <div className="qty-column">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M12.75 15.75V14.25C12.75 13.4544 12.4339 12.6913 11.8713 12.1287C11.3087 11.5661 10.5456 11.25 9.75 11.25H3.75C2.95435 11.25 2.19129 11.5661 1.62868 12.1287C1.06607 12.6913 0.75 14.25 0.75 14.25V15.75M17.25 15.75V14.25C17.2495 13.5853 17.0283 12.9396 16.621 12.4142C16.2138 11.8889 15.6436 11.5137 15 11.3475M12 2.3475C12.6453 2.51273 13.2173 2.88803 13.6257 3.41423C14.0342 3.94044 14.2559 4.58762 14.2559 5.25375C14.2559 5.91988 14.0342 6.56706 13.6257 7.09327C13.2173 7.61947 12.6453 7.99477 12 8.16M9.75 5.25C9.75 6.90685 8.40685 8.25 6.75 8.25C5.09315 8.25 3.75 6.90685 3.75 5.25C3.75 3.59315 5.09315 2.25 6.75 2.25C8.40685 2.25 9.75 3.59315 9.75 5.25Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <span>QUANTITY</span>

                    </div>

                    <div className="pass-column">

                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M7.5 6V5.25M7.5 9.375V8.625M7.5 12.75V12M3.9 3H14.1C14.9401 3 15.3601 3 15.681 3.16349C15.9632 3.3073 16.1927 3.53677 16.3365 3.81901C16.5 4.13988 16.5 4.55992 16.5 5.4V6.375C15.0503 6.375 13.875 7.55025 13.875 9C13.875 10.4497 15.0503 11.625 16.5 11.625V12.6C16.5 13.4401 16.5 13.8601 16.3365 14.181C16.1927 14.4632 15.9632 14.6927 15.681 14.8365C15.3601 15 14.9401 15 14.1 15H3.9C3.05992 15 2.63988 15 2.31901 14.8365C2.03677 14.6927 1.8073 14.4632 1.66349 14.181C1.5 13.8601 1.5 13.4401 1.66349 3.81901C1.8073 3.53677 2.03677 3.3073 2.31901 3.16349C2.63988 3 3.05992 3 3.9 3Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <span>PASS TYPE</span>

                    </div>

                    <div className="price-column">
                        PRICE
                    </div>

                </div>

                {/* ================= VALIDATION BANNERS ================= */}
                {validationBanners && validationBanners.length > 0 && (
                    <div className="review-order-alert-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '16px' }}>
                        {validationBanners.map((banner, bIdx) => (
                            <div key={bIdx} className={`review-order-alert-banner ${banner.type.toLowerCase()}`}>
                                {banner.type === 'ERROR' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <g clipPath="url(#clip0_2905_23074)">
                                            <path d="M11.25 6.75L6.75 11.25M6.75 6.75L11.25 11.25M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#B10000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_2905_23074">
                                                <rect width="18" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M9.00008 5.99991V8.99991M9.00008 11.9999H9.00758M7.71758 2.14491L1.36508 12.7499C1.2341 12.9767 1.1648 13.2339 1.16407 13.4958C1.16334 13.7577 1.23119 14.0153 1.3609 14.2428C1.4906 14.4704 1.67762 14.66 1.90336 14.7928C2.12909 14.9256 2.38568 14.997 2.64758 14.9999H15.3526C15.6145 14.997 15.8711 14.9256 16.0968 14.7928C16.3225 14.66 16.5096 14.4704 16.6393 14.2428C16.769 14.0153 16.8368 13.7577 16.8361 13.4958C16.8354 13.2339 16.7661 12.9767 16.6351 12.7499L10.2826 2.14491C10.1489 1.92449 9.96062 1.74225 9.73597 1.61577C9.51133 1.4893 9.25788 1.42285 9.00008 1.42285C8.74228 1.42285 8.48882 1.4893 8.26418 1.61577C8.03954 1.74225 7.85128 1.92449 7.71758 2.14491Z" stroke="#DE5100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                <span>{banner.message}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ================= ORDER ROW ================= */}

                <div 
                    className="review-order-table-row"
                    style={{
                        paddingTop: validationBanners && validationBanners.length > 0 ? "12px" : undefined,
                        borderBottom: validationBanners && validationBanners.length > 0
                            ? `2px solid ${getBorderColor(validationBanners[0].code)}`
                            : undefined
                    }}
                >

                    <div className="review-order-item">

                        <div 
                            className="review-order-image"
                            onClick={() => navigate(`/events/${event.slug || event.uniqueLink || event.id}`)}
                            style={{ cursor: "pointer" }}
                        >

                            <img
                                src={imageUrl}
                                alt={event.title || "event"}
                            />

                        </div>

                        <div className="review-order-details">
                            <div className="review-o-d-1">
                                <h3
                                    onClick={() => navigate(`/events/${event.slug || event.uniqueLink || event.id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {event.title || "Pankh: A Leap of Faith"}
                                </h3>

                                <p>{performerText}</p>
                            </div>
                            <div className="review-o-d-2">
                                <h4>{formattedDateStr}</h4>

                                <div className="venue">

                                    <strong>{venueName}</strong>

                                    {subVenueName ? <span> : {subVenueName}</span> : null}

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="review-order-quantity-box-container">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', width: '100%' }}>
                            <div className="quantity-box">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    onClick={quantity > 1 ? decreaseQty : undefined}
                                    style={{ cursor: quantity > 1 ? "pointer" : "not-allowed", opacity: quantity > 1 ? 1 : 0.4 }}
                                >
                                    <rect x="3" y="9" width="14" height="2" rx="1" fill="black" />
                                </svg>

                                <span>{quantity}</span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    onClick={quantity < Math.min(availableTickets, remainingAllowed) ? increaseQty : undefined}
                                    style={{ cursor: quantity < Math.min(availableTickets, remainingAllowed) ? "pointer" : "not-allowed", opacity: quantity < Math.min(availableTickets, remainingAllowed) ? 1 : 0.4 }}
                                >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44772 9.44772 9 4 9H9V4C9 3.44772 11 3.44772 11 4V9Z" fill="black" />
                                </svg>

                            </div>
                            {passLimit !== null && (quantity >= passLimit || quantity >= remainingAllowed) && (
                                <span style={{ fontSize: "12px", color: "#E11D48", display: "block", textAlign: "right", fontWeight: "bold", marginTop: "6px" }}>
                                    Max {passLimit} passes allowed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pass-type">
                        {getPassTypeDisplay(selectedTicket)}
                    </div>

                    <div className="price">
                        ₹{price.toFixed(2)}
                    </div>

                </div>

                {/* ================= TOTAL ================= */}

                <div className="review-order-total-container">

                    <div className="review-order-total-row">

                        <span className="total-text">
                            Total Price
                        </span>

                        <span className="total-price">
                            ₹{total.toFixed(2)}
                        </span>

                    </div>

                </div>

            </div>

            {/* ================= BUTTONS ================= */}
            <div className="review-order-buttons">

                <button
                    className="review-order-back-button"
                    onClick={() => navigate("/events")}
                >
                    <span className="btn-text-primary">BACK TO BROWSING</span>
                    <span className="btn-text-secondary">BACK TO BROWSING</span>
                </button>

                <div className="review-order-cart-container">
                    <button
                        className="review-order-cart-button"
                        onClick={handleAddToCart}
                        disabled={submitting || hasErrors || quantity > remainingAllowed || (availableTickets !== undefined && quantity > availableTickets)}
                    >
                        <span className="btn-text-primary">{submitting ? "ADDING..." : "ADD TO CART"}</span>
                        <span className="btn-text-secondary">{submitting ? "ADDING..." : "ADD TO CART"}</span>
                    </button>
                </div>

            </div>

            {/* ================= INFO CARDS ================= */}

            <div className="review-order-info-container">

                <div className="review-order-info-card">
                    <p className="review-order-info-text">
                        <span className="review-order-info-title">Cancellation &amp; refund policy: </span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. To know more view policy.
                    </p>
                </div>

                <div className="review-order-info-card">
                    <div className="review-order-info-content">
                        <p className="review-order-info-text">
                            <span className="review-order-info-title">Booking Contact Details: </span>
                            {(() => {
                                const storedMobile = localStorage.getItem("user_mobile");
                                const attendeeId = localStorage.getItem("guest_attendee_id");
                                let mobileStr = "";
                                if (storedMobile) {
                                    mobileStr = storedMobile;
                                } else if (attendeeId && attendeeId.startsWith("guest_")) {
                                    const rawDigits = attendeeId.replace("guest_", "").replace(/\D/g, "");
                                    if (rawDigits.length >= 10) {
                                        mobileStr = `+91 ${rawDigits.slice(-10)}`;
                                    }
                                }
                                if (!mobileStr) {
                                    mobileStr = "+91 9901204625";
                                }
                                const storedEmail = localStorage.getItem("user_email");
                                const emailStr = (storedEmail && storedEmail !== "user@example.com") ? storedEmail : "";
                                return emailStr ? `${mobileStr} | ${emailStr}` : mobileStr;
                            })()}
                        </p>
                    </div>
                    <div
                        className="review-order-info-edit"
                        onClick={() => navigate("/profile")}
                        style={{ cursor: "pointer" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        <span>Edit</span>
                    </div>
                </div>

                <div className="review-order-info-card">
                    <p className="review-order-info-text">
                        <span className="review-order-info-title">Need Help?: </span>
                        For booking assistance, contact us at +91 63611-88295 from 9:00 am–6:00 pm
                    </p>
                </div>

            </div>

        </section>
    );
};

export default ReviewOrder;