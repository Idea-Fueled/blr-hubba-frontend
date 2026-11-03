import React, { useState, useEffect } from "react";
import "./Cart.css";
import BrowseEvents from "./BrowseEvents";
import SponsorsSection from "../SponsorsSection/SponsorsSection";
import { useNavigate } from "react-router-dom";
import { fetchCartApi, updateCartItemApi, removeFromCartApi, initiatePurchaseApi, confirmPurchaseApi, createRazorpayOrderApi, verifyRazorpayPaymentApi, fetchMyTicketsApi, fetchEventTickets } from "../../api/bookingApi";
import { extractSubVenueName } from "../../utils/subVenueUtils";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";

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

export const Cart = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [validationBanners, setValidationBanners] = useState({});
    const [hasErrors, setHasErrors] = useState(false);
    const [userBookings, setUserBookings] = useState([]);

    const getAlreadyBookedCount = (eventId, passType) => {
        return userBookings
            .filter(b => b.status !== 'CANCELLED'
                && b.ticket?.event?.id === eventId
                && (b.ticket?.name || '').toLowerCase() === (passType || '').toLowerCase())
            .reduce((sum, b) => sum + (b.quantity || 1), 0);
    };

    const getRemainingAllowed = (item) => {
        const passLimit = getPassLimit(item.passType);
        if (passLimit === null) return Infinity;
        const booked = getAlreadyBookedCount(item.eventId, item.passType);
        return Math.max(0, passLimit - booked);
    };

    const formatCartItemDate = (item) => {
        if (!item) return "";
        const ci = item.rawItem || item;
        const evt = item.event || ci.ticket?.event || item.evt || {};
        const eventDate = ci.eventDate || item.eventDate || ci.ticket?.eventDate;
        const timeSlot = ci.timeSlot || item.timeSlot || ci.ticket?.timeSlot;

        let dateStr = "";
        if (eventDate?.date) {
            dateStr = new Date(eventDate.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        } else if (evt.startDateTime) {
            dateStr = new Date(evt.startDateTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        } else if (item.date && typeof item.date === 'string' && item.date.includes('|')) {
            dateStr = item.date.split('|')[0].trim();
        } else {
            dateStr = "Sun, Jan 25, 2026";
        }

        const rawStart = timeSlot?.startTime || evt.startDateTime || eventDate?.startTime;
        const rawEnd = timeSlot?.endTime || evt.endDateTime || eventDate?.endTime;
        const startStr = formatTimeString(rawStart);
        const endStr = formatTimeString(rawEnd);

        let timeStr = "";
        if (startStr && endStr) {
            timeStr = `${startStr}–${endStr}`;
        } else if (startStr || endStr) {
            timeStr = startStr || endStr;
        }

        if (!timeStr && item.date && item.date.includes('|')) {
            timeStr = item.date.split('|')[1].trim();
        }

        if (!timeStr) {
            timeStr = "8:30 pm–10:00 pm";
        }

        return `${dateStr} | ${timeStr}`;
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

                if (start === null && item.date && item.date.includes('|')) {
                    const timePart = item.date.split('|')[1].trim();
                    const parts = timePart.split(/–|-/);
                    if (parts.length === 2) {
                        start = parseMinutes(parts[0].trim());
                        end = parseMinutes(parts[1].trim());
                    }
                }

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

    const validateCartItem = (item, availableTickets, otherCartItems, userBookings) => {
        // 1. SOLD OUT CHECK (ERROR)
        if (item.quantity > 0 && availableTickets === 0) {
            return {
                type: "ERROR",
                code: "SOLD_OUT",
                message: "This event is booked out. Remove event to proceed."
            };
        }

        // 2. QUANTITY EXCEEDS AVAILABILITY (ERROR)
        if (availableTickets > 0 && item.quantity > availableTickets) {
            return {
                type: "ERROR",
                code: "QTY_EXCEEDS",
                message: `Ticket availability has changed. Only ${availableTickets} ticket${availableTickets === 1 ? '' : 's'} are now available. Please reduce the quantity to continue.`
            };
        }

        // 3. LOW INVENTORY WARNING (only trigger when user quantity reaches available tickets limit)
        if (item.quantity > 0 && availableTickets > 0 && item.quantity >= availableTickets && availableTickets < 5) {
            return {
                type: "WARNING",
                code: "LOW_INVENTORY",
                message: `Only ${availableTickets} ticket${availableTickets === 1 ? '' : 's'} available for this event.`
            };
        }

        // 4. SCHEDULE OVERLAP CHECK (WARNING)
        const overlapsWithCart = otherCartItems.some(other => other.id !== item.id && checkEventsOverlap(item, other));
        const overlapsWithBookings = userBookings.some(booking => checkEventsOverlap(item, booking));

        if (overlapsWithCart || overlapsWithBookings) {
            return {
                type: "WARNING",
                code: "SCHEDULE_OVERLAP",
                message: "This event overlaps with another booking in your cart or your existing bookings. Please review your schedule before checking out."
            };
        }

        // Re-booking and unlimited passes allowed (no pass limit or already booked check)

        return null;
    };

    const runCartValidation = async (cartItemsToValidate) => {
        if (!cartItemsToValidate || cartItemsToValidate.length === 0) {
            setValidationBanners({});
            setHasErrors(false);
            return true;
        }

        let userBookings = [];
        try {
            const bRes = await fetchMyTicketsApi();
            if (bRes && bRes.tickets) {
                userBookings = bRes.tickets.filter(t => t.status !== 'CANCELLED');
                setUserBookings(userBookings);
            }
        } catch (e) {
            console.warn("Failed to fetch user bookings for validation:", e);
        }

        const banners = {};
        let foundError = false;

        await Promise.all(
            cartItemsToValidate.map(async (item) => {
                let availableTickets = 999;
                if (item.eventId) {
                    try {
                        const tRes = await fetchEventTickets(item.eventId, item.eventDateId, item.timeSlotId);
                        if (tRes && tRes.success && tRes.tickets) {
                            const matchingTicket = tRes.tickets.find(t => t.id === item.ticketId);
                            if (matchingTicket) {
                                if (matchingTicket.availability && typeof matchingTicket.availability.available === 'number') {
                                    availableTickets = matchingTicket.availability.available;
                                } else if (typeof matchingTicket.quantity === 'number') {
                                    availableTickets = Math.max(0, matchingTicket.quantity - (matchingTicket.sold || 0));
                                }
                            }
                        }
                    } catch (err) {
                        console.warn("Error fetching real-time availability for item", item.id, err);
                    }
                }

                item.availableTickets = availableTickets;

                const result = validateCartItem(item, availableTickets, cartItemsToValidate, userBookings);
                if (result) {
                    banners[item.id] = result;
                    if (result.type === "ERROR") {
                        foundError = true;
                    }
                }
            })
        );

        setItems([...cartItemsToValidate]);
        setValidationBanners(banners);
        setHasErrors(foundError);
        return !foundError;
    };

    const loadCart = async () => {
        setLoading(true);
        try {
            const data = await fetchCartApi();
            if (data && data.cartItems && data.cartItems.length > 0) {
                const mapped = data.cartItems.map((ci) => {
                    const evt = ci.ticket?.event || {};
                    const tkt = ci.ticket || {};

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

                    const extractRawUrl = (val) => {
                        if (!val) return "";
                        if (typeof val === "string") return val;
                        if (typeof val === "object") {
                            return val.url || val.data || val.path || val.src || "";
                        }
                        return "";
                    };

                    const fixImageUrl = (url) => {
                        const raw = extractRawUrl(url);
                        if (!raw) return "";
                        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
                        const isLocalFrontend = typeof window !== 'undefined' &&
                            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                        if (/^https?:\/\/localhost:\d+/.test(raw)) {
                            if (isLocalFrontend) {
                                return raw.replace(/^https?:\/\/localhost:\d+/, 'http://localhost:3000');
                            } else {
                                return raw.replace(/^https?:\/\/localhost:\d+/, baseUrl);
                            }
                        }
                        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
                            return raw;
                        }
                        if (isLocalFrontend) {
                            return `http://localhost:3000/${raw.replace(/^\//, '')}`;
                        }
                        return `${baseUrl}/${raw.replace(/^\//, '')}`;
                    };

                    const getGeneralImageFromMedia = (images) => {
                        if (!images || !Array.isArray(images) || images.length === 0) return "";
                        // Prefer general images (not performer) — matches backend getGeneralImageUrl
                        const generalImage = images.find(img => img && img.purpose !== 'performer');
                        if (generalImage) return extractRawUrl(generalImage);
                        // Fall back to first image
                        return extractRawUrl(images[0]);
                    };

                    const resolveCartItemImage = (evtObj, tktObj, itemObj) => {
                        const targetEvt = evtObj || tktObj?.event || itemObj?.event || itemObj?.ticket?.event || {};
                        const media = targetEvt.media || {};

                        // Priority 1: coverImage (direct DB field, matches EventDetailHero right card)
                        if (targetEvt.coverImage) return fixImageUrl(targetEvt.coverImage);

                        // Priority 2: imageUrl (computed field from public API, matches EventDetailHero right card)
                        if (targetEvt.imageUrl) return fixImageUrl(targetEvt.imageUrl);

                        // Priority 3: media.images169 general image
                        const img169 = getGeneralImageFromMedia(media.images169);
                        if (img169) return fixImageUrl(img169);

                        // Priority 4: media.images11 general image (square)
                        const img11 = getGeneralImageFromMedia(media.images11);
                        if (img11) return fixImageUrl(img11);

                        // Priority 5: images array, mediaItems array
                        if (targetEvt.images && targetEvt.images.length > 0) return fixImageUrl(extractRawUrl(targetEvt.images[0]));
                        if (targetEvt.mediaItems && targetEvt.mediaItems.length > 0) return fixImageUrl(extractRawUrl(targetEvt.mediaItems[0]));

                        // Priority 6: cart item's own image field (from localStorage)
                        const itemImage = extractRawUrl(itemObj?.image) || extractRawUrl(itemObj?.imageUrl);
                        if (itemImage) return fixImageUrl(itemImage);

                        // Fallback: pass-type-specific placeholder
                        const passName = (tktObj?.name || itemObj?.passType || "").toLowerCase();
                        if (passName.includes("free")) {
                            return freePassImage;
                        }
                        return donorPassImage;
                    };

                    const dateStr = ci.eventDate?.date
                        ? new Date(ci.eventDate.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                        : (evt.startDateTime ? new Date(evt.startDateTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : "Monday 25 Jan, 2027");

                    const rawStart = ci.timeSlot?.startTime || evt.startDateTime || ci.eventDate?.startTime;
                    const rawEnd = ci.timeSlot?.endTime || evt.endDateTime || ci.eventDate?.endTime;
                    const startTimeStr = formatTimeString(rawStart);
                    const endTimeStr = formatTimeString(rawEnd);
                    const timeStr = startTimeStr && endTimeStr
                        ? `${startTimeStr}–${endTimeStr}`
                        : (startTimeStr || endTimeStr || "8:30 pm–10:00 pm");

                    return {
                        id: ci.id,
                        ticketId: tkt.id,
                        eventId: evt.id,
                        eventDateId: ci.eventDateId,
                        timeSlotId: ci.timeSlotId,
                        title: evt.title || "Pankh: A Leap of Faith",
                        by: evt.mainPerformer ? `By ${evt.mainPerformer}` : (evt.by || "By Kaushiki Chakraborty & Shantanu Moitra"),
                        date: `${dateStr} | ${timeStr}`,
                        venue: evt.venue?.name || "Freedom Park",
                        venueDetail: extractSubVenueName(ci, evt),
                        price: (ci.pricePerTicket !== undefined && ci.pricePerTicket !== null)
                            ? Number(ci.pricePerTicket)
                            : ((tkt.price !== undefined && tkt.price !== null)
                                ? Number(tkt.price)
                                : (tkt.name?.toLowerCase().includes("free") ? 0 : 400)),
                        passType: tkt.name || "FREE PASS",
                        image: resolveCartItemImage(evt, tkt, ci),
                        quantity: ci.quantity || 1,
                        availableTickets: tkt.availability?.available !== undefined
                            ? tkt.availability.available
                            : (tkt.quantity !== undefined ? Math.max(0, tkt.quantity - (tkt.sold || 0)) : 999),
                        rawItem: ci
                    };
                });
                setItems(mapped);
                try {
                    localStorage.setItem('user_cart', JSON.stringify(mapped));
                } catch (e) { }
                runCartValidation(mapped);
            } else {
                const localCart = JSON.parse(localStorage.getItem('user_cart') || '[]');
                setItems(localCart);
                runCartValidation(localCart);
            }
        } catch (err) {
            console.error("Failed to load cart:", err);
            const localCart = JSON.parse(localStorage.getItem('user_cart') || '[]');
            setItems(localCart);
            runCartValidation(localCart);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const getBorderColor = (code) => {
        switch (code) {
            case "SOLD_OUT":
            case "QTY_EXCEEDS":
            case "EVENT_ALREADY_BOOKED":
                return "#B10000";
            case "SCHEDULE_OVERLAP":
            case "LOW_INVENTORY":
            default:
                return "#DE5100";
        }
    };

    const itemsRef = React.useRef(items);
    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            runCartValidation(itemsRef.current);
        }, 30000); // poll every 30 seconds
        return () => clearInterval(interval);
    }, [items.length]);

    const increaseQty = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const maxAvailable = item.availableTickets !== undefined ? item.availableTickets : 999;
        const remainingAllowed = getRemainingAllowed(item);
        const limitToUse = Math.min(maxAvailable, remainingAllowed);

        if (item.quantity >= limitToUse) return;

        const newQty = item.quantity + 1;
        const updated = items.map(i => i.id === id ? { ...i, quantity: newQty } : i);
        setItems(updated);
        try {
            localStorage.setItem('user_cart', JSON.stringify(updated));
        } catch (e) { }
        runCartValidation(updated);

        if (item.ticketId) {
            await updateCartItemApi(item.ticketId, {
                quantity: newQty,
                pricePerTicket: item.price,
                eventDateId: item.eventDateId,
                timeSlotId: item.timeSlotId
            });
        }
    };

    const decreaseQty = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item || item.quantity <= 1) return;

        const newQty = item.quantity - 1;
        const updated = items.map(i => i.id === id ? { ...i, quantity: newQty } : i);
        setItems(updated);
        try {
            localStorage.setItem('user_cart', JSON.stringify(updated));
        } catch (e) { }
        runCartValidation(updated);

        if (item.ticketId) {
            await updateCartItemApi(item.ticketId, {
                quantity: newQty,
                pricePerTicket: item.price,
                eventDateId: item.eventDateId,
                timeSlotId: item.timeSlotId
            });
        }
    };

    const removeItem = async (id) => {
        const item = items.find(i => i.id === id);
        const updated = items.filter(i => i.id !== id);
        setItems(updated);
        try {
            localStorage.setItem('user_cart', JSON.stringify(updated));
        } catch (e) { }
        runCartValidation(updated);

        if (item && item.ticketId) {
            await removeFromCartApi(item.ticketId, item.eventDateId, item.timeSlotId);
        }
    };

    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setCheckingOut(true);
        const isValid = await runCartValidation(items);
        if (!isValid) {
            setCheckingOut(false);
            return;
        }
        try {
            // 1. Initiate purchase in backend (optional transaction creation)
            let transactionId = null;
            let initRes = null;
            try {
                initRes = await initiatePurchaseApi();
                if (initRes && initRes.transactionId) {
                    transactionId = initRes.transactionId;
                }
            } catch (e) {
                console.warn("Initiate purchase warning:", e);
            }

            // Check if this is a free booking
            const isFree = initRes?.totalAmount === 0 || initRes?.providerData?.isFree || totalPrice === 0;

            if (isFree) {
                const itemsToClear = [...items];

                if (transactionId) {
                    // Confirm transaction immediately via backend
                    try {
                        const confirmRes = await confirmPurchaseApi(transactionId);
                        if (confirmRes && !confirmRes.success) {
                            console.warn('Backend confirm failed, proceeding with free pass anyway:', confirmRes?.message);
                        }
                    } catch (confirmErr) {
                        console.warn('Backend confirm error, proceeding with free pass anyway:', confirmErr);
                    }
                } else {
                    // Backend initiation failed (e.g. localhost "Cart is empty" mismatch)
                    // For free passes, we still navigate — no payment needed
                    console.warn('No transactionId from backend (possible localhost issue). Navigating to confirmation for free pass.');
                }

                // Clear frontend cart
                setItems([]);
                try {
                    localStorage.removeItem('user_cart');
                } catch (e) { }
                for (const cartItem of itemsToClear) {
                    if (cartItem.ticketId) {
                        try {
                            await removeFromCartApi(cartItem.ticketId, cartItem.eventDateId, cartItem.timeSlotId);
                        } catch (clearErr) {
                            console.warn('Error clearing cart item:', clearErr);
                        }
                    }
                }

                // Navigate to Booking Confirmation page
                navigate("/booking-confirmation", {
                    state: {
                        transactionId,
                        cartItems: itemsToClear,
                        paymentId: 'FREE'
                    }
                });
                return;
            }

            // 2. Compute amount in paise from actual cart total
            const amountInPaise = Math.max(Math.round(totalPrice * 100), 100);

            // Use order ID created during initiatePurchase, or create one if missing
            let orderId = initRes?.providerOrderId;
            let orderAmount = amountInPaise;
            let orderCurrency = "INR";

            if (!orderId) {
                const orderData = await createRazorpayOrderApi(amountInPaise);
                if (!orderData || !orderData.orderId) {
                    throw new Error(orderData?.message || "Failed to create payment order");
                }
                orderId = orderData.orderId;
                orderAmount = orderData.amount || amountInPaise;
                orderCurrency = orderData.currency || "INR";
            }

            // 3. Dynamically load Razorpay SDK
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error("Razorpay SDK failed to load. Please check your network connection.");
            }

            // 4. Razorpay key resolution (prefer backend-provided key if available)
            const razorpayKey = initRes?.keyId || initRes?.key || initRes?.providerKeyId
                || import.meta.env?.VITE_RAZORPAY_KEY_ID
                || import.meta.env?.REACT_APP_RAZORPAY_KEY_ID
                || (typeof process !== 'undefined' && process.env?.REACT_APP_RAZORPAY_KEY_ID)
                || 'rzp_test_TJBNRm6AQQSCwm';

            const userEmail = localStorage.getItem("user_email") || "";
            const userName = localStorage.getItem("user_name") || "";
            const storedMobile = localStorage.getItem("user_mobile") || localStorage.getItem("user_phone");
            const attendeeId = localStorage.getItem("guest_attendee_id");

            let userPhone = "";
            if (storedMobile) {
                userPhone = storedMobile;
            } else if (attendeeId && attendeeId.startsWith("guest_")) {
                const rawDigits = attendeeId.replace("guest_", "").replace(/\D/g, "");
                if (rawDigits.length >= 10) {
                    userPhone = rawDigits.slice(-10);
                }
            }

            const cleanContact = userPhone ? userPhone.replace(/\s+/g, '') : "";

            const options = {
                key: razorpayKey,
                amount: orderAmount,
                currency: orderCurrency,
                name: "BLR Hubba",
                description: "Pass Booking",
                order_id: orderId,
                prefill: {
                    name: userName,
                    email: userEmail,
                    contact: cleanContact
                },
                theme: {
                    color: "#000000"
                },
                handler: async (response) => {
                    try {
                        // 5. Verify payment signature on backend
                        const verifyRes = await verifyRazorpayPaymentApi({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            transactionId
                        });

                        if (verifyRes && verifyRes.success) {
                            if (transactionId) {
                                try {
                                    const confirmRes = await confirmPurchaseApi(transactionId, response.razorpay_payment_id, response.razorpay_signature);
                                    if (confirmRes && confirmRes.success === false) {
                                        console.error("Confirm purchase failed:", confirmRes);
                                        alert(confirmRes?.message || "Failed to confirm purchase.");
                                        setCheckingOut(false);
                                        return;
                                    }
                                } catch (cErr) {
                                    console.error("Confirm purchase error:", cErr);
                                    alert("Error confirming booking purchase.");
                                    setCheckingOut(false);
                                    return;
                                }
                            }

                            // Clear cart after successful payment
                            const itemsToClear = [...items];
                            setItems([]);
                            try {
                                localStorage.removeItem('user_cart');
                            } catch (e) { }
                            // Remove each item from backend cart
                            for (const cartItem of itemsToClear) {
                                if (cartItem.ticketId) {
                                    try {
                                        await removeFromCartApi(cartItem.ticketId, cartItem.eventDateId, cartItem.timeSlotId);
                                    } catch (clearErr) {
                                        console.warn('Error clearing cart item:', clearErr);
                                    }
                                }
                            }

                            // Navigate to existing Booking Confirmation page
                            navigate("/booking-confirmation", {
                                state: {
                                    transactionId,
                                    cartItems: itemsToClear,
                                    paymentId: response.razorpay_payment_id
                                }
                            });
                        } else {
                            console.error("Payment verification failed:", verifyRes?.message);
                            setCheckingOut(false);
                        }
                    } catch (verifyErr) {
                        console.error("Error verifying payment:", verifyErr);
                        setCheckingOut(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        console.log("Razorpay checkout modal dismissed");
                        setCheckingOut(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Razorpay payment failed:", response.error);
                setCheckingOut(false);
            });
            rzp.open();
        } catch (err) {
            console.error("Checkout failed:", err);
            setCheckingOut(false);
        }
    };
    const getPassTypeDisplay = (item) => {
        if (!item) return "DONOR PASS";
        const name = String(item.passType || item.name || '').toLowerCase();
        const type = String(item.type || item.ticketType || '').toUpperCase();
        const priceVal = Number(item.price ?? 0);

        if (type === 'FREE' || priceVal === 0 || name.includes('free')) {
            return "FREE PASS";
        }
        return "DONOR PASS";
    };

    return (
        <>
            <section className="cart-page-main-container">

                {/* ================= HEADER ================= */}

                <div className="cart-page-header-row">
                    <h2>CART</h2>
                    <span className="cart-page-items-count">
                        {items.length} Items Added
                    </span>
                </div>

                {/* ================= TABLE (single shared grid) OR EMPTY STATE ================= */}

                {items.length === 0 && !loading ? (
                    <div className="cart-empty-state">
                        <div className="cart-empty-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <h3 className="cart-empty-title">Your Cart is Currently Empty</h3>
                        <p className="cart-empty-subtitle">Explore exciting events happening across Bengaluru and book your passes!</p>
                        <button className="cart-empty-btn" onClick={() => navigate("/events")}>
                            <span className="btn-text-primary">EXPLORE EVENTS</span>
                            <span className="btn-text-secondary">EXPLORE EVENTS</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cart-page-table">

                            {/* ---- header cells ---- */}

                            <div className="cart-page-item-col">
                                ITEM
                            </div>

                            <div className="cart-page-qty-col">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M12.75 15.75V14.25C12.75 13.4544 12.4339 12.6913 11.8713 12.1287C11.3087 11.5661 10.5456 11.25 9.75 11.25H3.75C2.95435 11.25 2.19129 11.5661 1.62868 12.1287C1.06607 12.6913 0.75 13.4544 0.75 14.25V15.75M17.25 15.75V14.25C17.2495 13.5853 17.0283 12.9396 16.621 12.4142C16.2138 11.8889 15.6436 11.5137 15 11.3475M12 2.3475C12.6453 2.51273 13.2173 2.88803 13.6257 3.41423C14.0342 3.94044 14.2559 4.58762 14.2559 5.25375C14.2559 5.91988 14.0342 6.56706 13.6257 7.09327C13.2173 7.61947 12.6453 7.99477 12 8.16M9.75 5.25C9.75 6.90685 8.40685 8.25 6.75 8.25C5.09315 8.25 3.75 6.90685 3.75 5.25C3.75 3.59315 5.09315 2.25 6.75 2.25C8.40685 2.25 9.75 3.59315 9.75 5.25Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                QUANTITY
                            </div>

                            <div className="cart-page-pass-col">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M7.5 6V5.25M7.5 9.375V8.625M7.5 12.75V12M3.9 3H14.1C14.9401 3 15.3601 3 15.681 3.16349C15.9632 3.3073 16.1927 3.53677 16.3365 3.81901C16.5 4.13988 16.5 4.55992 16.5 5.4V6.375C15.0503 6.375 13.875 7.55025 13.875 9C13.875 10.4497 15.0503 11.625 16.5 11.625V12.6C16.5 13.4401 16.5 13.8601 16.3365 14.181C16.1927 14.4632 15.9632 14.6927 15.681 14.8365C15.3601 15 14.9401 15 14.1 15H3.9C3.05992 15 2.63988 15 2.31901 14.8365C2.03677 14.6927 1.8073 14.4632 1.66349 14.181C1.5 13.8601 1.5 13.4401 1.5 12.6V11.625C2.94975 11.625 4.125 10.4497 4.125 9C4.125 7.55025 2.94975 6.375 1.5 6.375V5.4C1.5 4.55992 1.5 4.13988 1.66349 3.81901C1.8073 3.53677 2.03677 3.3073 2.31901 3.16349C2.63988 3 3.05992 3 3.9 3Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                PASS TYPE
                            </div>

                            <div className="cart-page-price-col">
                                PRICE
                            </div>

                            <div className="cart-page-remove-col">
                                {/* empty header for delete button column */}
                            </div>

                            <div className="cart-page-header-divider"></div>

                            {/* ---- data rows ---- */}

                            {items.map((item) => (
                                <React.Fragment key={item.id}>

                                    {/* Inline Alert Banner for low inventory, schedule overlap, sold out, etc. */}
                                    {validationBanners[item.id] && (
                                        <div className="cart-page-alert-banner-cell">
                                            <div className={`cart-page-alert-banner ${validationBanners[item.id].type.toLowerCase()}`}>
                                                {validationBanners[item.id].type === 'ERROR' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                        <g clipPath="url(#clip0_2905_23074_cart)">
                                                            <path d="M11.25 6.75L6.75 11.25M6.75 6.75L11.25 11.25M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#B10000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_2905_23074_cart">
                                                                <rect width="18" height="18" fill="white" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                        <path d="M9.00008 5.99991V8.99991M9.00008 11.9999H9.00758M7.71758 2.14491L1.36508 12.7499C1.2341 12.9767 1.1648 13.2339 1.16407 13.4958C1.16334 13.7577 1.23119 14.0153 1.3609 14.2428C1.4906 14.4704 1.67762 14.66 1.90336 14.7928C2.12909 14.9256 2.38568 14.997 2.64758 14.9999H15.3526C15.6145 14.997 15.8711 14.9256 16.0968 14.7928C16.3225 14.66 16.5096 14.4704 16.6393 14.2428C16.769 14.0153 16.8368 13.7577 16.8361 13.4958C16.8354 13.2339 16.7661 12.9767 16.6351 12.7499L10.2826 2.14491C10.1489 1.92449 9.96062 1.74225 9.73597 1.61577C9.51133 1.4893 9.25788 1.42285 9.00008 1.42285C8.74228 1.42285 8.48882 1.4893 8.26418 1.61577C8.03954 1.74225 7.85128 1.92449 7.71758 2.14491Z" stroke="#DE5100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                                <span>{validationBanners[item.id].message}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="cart-page-item">

                                        <div
                                            className="cart-page-image"
                                            onClick={() => navigate(`/events/${item.rawItem?.ticket?.event?.slug || item.rawItem?.ticket?.event?.uniqueLink || item.eventId}`)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = item.passType?.toLowerCase().includes("free") ? freePassImage : donorPassImage;
                                                }}
                                            />
                                        </div>

                                        <div className="cart-page-details">
                                            <div className="cart-page-o-d-1">
                                                <h3
                                                    onClick={() => navigate(`/events/${item.rawItem?.ticket?.event?.slug || item.rawItem?.ticket?.event?.uniqueLink || item.eventId}`)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {item.title}
                                                </h3>
                                                <p>{item.by}</p>
                                            </div>
                                            <div className="cart-page-o-d-2">
                                                <h4>{formatCartItemDate(item)}</h4>
                                                <div className="cart-page-venue">
                                                    <strong>{item.venue}</strong>
                                                    {(extractSubVenueName(item.rawItem || item, item.rawItem?.ticket?.event) || item.venueDetail) ? (
                                                        <span> : {extractSubVenueName(item.rawItem || item, item.rawItem?.ticket?.event) || item.venueDetail}</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="cart-page-qty-box">
                                        <div className="cart-page-qty-picker-pill">
                                            <button
                                                className="cart-page-qty-btn"
                                                onClick={() => decreaseQty(item.id)}
                                                disabled={item.quantity <= 1}
                                                aria-label="decrease quantity"
                                                style={item.quantity <= 1 ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <rect x="3" y="9" width="14" height="2" rx="1" fill="black" />
                                                </svg>
                                            </button>

                                            <span className="cart-page-qty-val">{item.quantity}</span>

                                            <button
                                                className="cart-page-qty-btn"
                                                onClick={() => increaseQty(item.id)}
                                                disabled={
                                                    (item.availableTickets !== undefined && item.quantity >= item.availableTickets) ||
                                                    (item.quantity >= getRemainingAllowed(item))
                                                }
                                                aria-label="increase quantity"
                                                style={
                                                    ((item.availableTickets !== undefined && item.quantity >= item.availableTickets) ||
                                                        (item.quantity >= getRemainingAllowed(item))) ? { opacity: 0.4, cursor: "not-allowed" } : {}
                                                }
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M11 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44772 9.44772 9 4 9H9V4C9 3.44772 9.44772 3 10 3C10.5523 3 11 3.44772 11 4V9Z" fill="black" />
                                                </svg>
                                            </button>
                                        </div>
                                        {getPassLimit(item.passType) !== null && item.quantity >= getPassLimit(item.passType) && (
                                            <span className="cart-page-qty-limit-text">
                                                Max {getPassLimit(item.passType)} passes allowed
                                            </span>
                                        )}
                                    </div>

                                    <div className="cart-page-pass-type">
                                        {getPassTypeDisplay(item)}
                                    </div>

                                    <div className="cart-page-price">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    <div className="cart-page-remove-cell">
                                        <button
                                            className="cart-page-remove-btn"
                                            onClick={() => removeItem(item.id)}
                                            aria-label="remove item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div
                                        className="cart-page-row-divider"
                                        style={{
                                            borderBottom: validationBanners[item.id]
                                                ? `2px solid ${getBorderColor(validationBanners[item.id].code)}`
                                                : undefined
                                        }}
                                    ></div>

                                </React.Fragment>
                            ))}

                        </div>

                        {/* ================= TOTAL + CHECKOUT ================= */}

                        <div className="cart-page-total-container">

                            <span className="cart-page-total-text">
                                Total Price :  <span className="cart-page-total-price-text">
                                    ₹{totalPrice.toFixed(2)}
                                </span>
                            </span>

                            <div className="cart-page-checkout-wrapper">
                                <button
                                    className={`cart-page-checkout-button ${hasErrors ? 'disabled' : ''}`}
                                    onClick={handleCheckout}
                                    disabled={items.length === 0 || checkingOut || hasErrors}
                                >
                                    <span className="btn-text-primary">{checkingOut ? "PROCESSING..." : "CHECKOUT"}</span>
                                    <span className="btn-text-secondary">{checkingOut ? "PROCESSING..." : "CHECKOUT"}</span>
                                </button>
                            </div>

                        </div>
                    </>
                )}

                {/* ================= INFO CARDS ================= */}

                <div className="cart-page-info-container">

                    <div className="cart-page-info-card">
                        <p className="cart-page-info-text">
                            <span className="cart-page-info-title">Cancellation &amp; refund policy: </span>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. To know more view policy.
                        </p>
                    </div>

                    <div className="cart-page-info-card">
                        <div className="cart-page-info-content">
                            <p className="cart-page-info-text">
                                <span className="cart-page-info-title">Booking Contact Details: </span>
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
                            className="cart-page-info-edit"
                            onClick={() => navigate("/profile")}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <g clipPath="url(#clip0_2067_8003)">
                                    <path d="M9.91602 1.75003C10.0692 1.59682 10.2511 1.47529 10.4513 1.39238C10.6515 1.30946 10.866 1.26678 11.0827 1.26678C11.2994 1.26678 11.5139 1.30946 11.7141 1.39238C11.9143 1.47529 12.0961 1.59682 12.2493 1.75003C12.4026 1.90324 12.5241 2.08513 12.607 2.2853C12.6899 2.48548 12.7326 2.70003 12.7326 2.9167C12.7326 3.13337 12.6899 3.34792 12.607 3.5481C12.5241 3.74827 12.4026 3.93016 12.2493 4.08337L4.37435 11.9584L1.16602 12.8334L2.04102 9.62503L9.91602 1.75003Z" stroke="#B10000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_2067_8003">
                                        <rect width="14" height="14" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <span>Edit</span>
                        </div>
                    </div>

                    <div className="cart-page-info-card">
                        <p className="cart-page-info-text">
                            <span className="cart-page-info-title">Need Help?: </span>
                            For booking assistance, contact us at +91 63611-88295 from 9:00 am–6:00 pm
                        </p>
                    </div>

                </div>

            </section>
            <BrowseEvents />
            <div className="cart-page-sponsors-section">
                <SponsorsSection />
            </div>
        </>
    );
};

export default Cart;