import React, { useState, useEffect } from "react";
import BookingTicket from "./BookingTicket";
import "./BookingConfirmation.css";
import bookingBgImg from "../../assets/Booking_bg_image.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchMyTicketsApi } from "../../api/bookingApi";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";
import { extractSubVenueName } from "../../utils/subVenueUtils";

export const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
        const generalImage = images.find(img => img && img.purpose !== 'performer');
        if (generalImage) return extractRawUrl(generalImage);
        return extractRawUrl(images[0]);
    };

    const resolveCartItemImage = (evtObj, tktObj, itemObj) => {
        const targetEvt = evtObj || tktObj?.event || itemObj?.event || itemObj?.ticket?.event || {};
        const media = targetEvt.media || {};

        // Priority 1: coverImage (direct DB field, matches EventDetailHero right card)
        if (targetEvt.coverImage) return fixImageUrl(targetEvt.coverImage);

        // Priority 2: imageUrl (computed field from public API, matches EventDetailHero right card)
        if (targetEvt.imageUrl) return fixImageUrl(targetEvt.imageUrl);

        // Priority 3: media.images169
        const img169 = getGeneralImageFromMedia(media.images169);
        if (img169) return fixImageUrl(img169);

        // Priority 4: media.images11
        const img11 = getGeneralImageFromMedia(media.images11);
        if (img11) return fixImageUrl(img11);

        // Priority 5: images array / mediaItems array
        if (targetEvt.images && targetEvt.images.length > 0) return fixImageUrl(extractRawUrl(targetEvt.images[0]));
        if (targetEvt.mediaItems && targetEvt.mediaItems.length > 0) return fixImageUrl(extractRawUrl(targetEvt.mediaItems[0]));

        // Priority 6: itemObj's image
        const itemImage = extractRawUrl(itemObj?.image) || extractRawUrl(itemObj?.imageUrl);
        if (itemImage) return fixImageUrl(itemImage);

        const passName = (tktObj?.name || itemObj?.passType || "").toLowerCase();
        if (passName.includes("free")) {
            return freePassImage;
        }
        return donorPassImage;
    };

    const loadBookings = async () => {
        setLoading(true);
        try {
            // 1. Prioritize cartItems passed directly from Cart checkout state
            if (location.state?.cartItems && location.state.cartItems.length > 0) {
                const mappedFromCart = location.state.cartItems.map((ci, idx) => {
                    let weekday = "MON";
                    let day = "25";
                    let month = "JAN";
                    if (ci.date) {
                        const datePart = ci.date.split("|")[0].trim();
                        const d = new Date(datePart);
                        if (!isNaN(d.getTime())) {
                            weekday = d.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
                            day = d.getDate().toString();
                            month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
                        } else {
                            const dayMatch = datePart.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i);
                            if (dayMatch) weekday = dayMatch[1].toUpperCase();

                            const numMatch = datePart.match(/\b(\d{1,2})\b/);
                            if (numMatch) day = numMatch[1];

                            const monthMatch = datePart.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
                            if (monthMatch) month = monthMatch[1].toUpperCase();
                        }
                    }

                    const resolvedImg = fixImageUrl(ci.image || ci.imageUrl || ci.coverImage) || resolveCartItemImage(ci.event, ci.ticket, ci);

                    return {
                        id: ci.id || idx,
                        month,
                        day,
                        weekday,
                        title: ci.title || ci.event?.title || "Booked Event",
                        by: ci.by || (ci.event?.mainPerformer ? `By ${ci.event.mainPerformer}` : ""),
                        date: ci.date || "Sat, Jan 16, 2027 | 10:00 am–5:00 pm",
                        venue: ci.venue || ci.event?.venue?.name || "Freedom Park",
                        venueDetail: ci.venueDetail || "",
                        quantity: ci.quantity || 1,
                        passType: ci.passType || "DONOR PASS",
                        amount: Number((ci.price || 0) * (ci.quantity || 1)).toFixed(2),
                        image: resolvedImg || (ci.passType?.toLowerCase().includes("free") ? freePassImage : donorPassImage),
                        transactionId: location.state.transactionId || "tx-123"
                    };
                });
                setBookings(mappedFromCart);
                setLoading(false);
                return;
            }

            // 2. Otherwise fetch user's tickets from backend API
            const data = await fetchMyTicketsApi();
            if (data && data.tickets && data.tickets.length > 0) {
                let targetTickets = [...data.tickets];

                // If transactionId is passed in state, filter for matching transaction
                if (location.state?.transactionId) {
                    const matched = targetTickets.filter(t => t.transactionId === location.state.transactionId || t.id === location.state.transactionId);
                    if (matched.length > 0) targetTickets = matched;
                }

                // Sort newest booking first
                targetTickets.sort((a, b) => {
                    const timeA = new Date(a.createdAt || a.purchaseDate || 0).getTime();
                    const timeB = new Date(b.createdAt || b.purchaseDate || 0).getTime();
                    return timeB - timeA;
                });

                const mapped = targetTickets.map((tkt) => {
                    const evt = tkt.ticket?.event || tkt.event || {};
                    const ticketType = tkt.ticket || {};
                    const dateObj = tkt.eventDate?.date
                        ? new Date(tkt.eventDate.date)
                        : (evt.startDateTime ? new Date(evt.startDateTime) : new Date());

                    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
                    const day = dateObj.getDate().toString();
                    const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();

                    const rawStart = tkt.timeSlot?.startTime || evt.startDateTime;
                    const rawEnd = tkt.timeSlot?.endTime || evt.endDateTime;
                    const startTimeStr = formatTimeString(rawStart);
                    const endTimeStr = formatTimeString(rawEnd);
                    const timeStr = startTimeStr && endTimeStr
                        ? `${startTimeStr}–${endTimeStr}`
                        : (startTimeStr || endTimeStr || "");

                    return {
                        id: tkt.id || tkt.transactionId,
                        month: month,
                        day: day,
                        weekday: weekday,
                        title: evt.title || "Booked Event",
                        by: evt.mainPerformer ? `By ${evt.mainPerformer}` : (evt.by ? `By ${evt.by}` : ""),
                        date: `${dateObj.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}${timeStr ? ` | ${timeStr}` : ''}`,
                        venue: evt.venue?.name || "Freedom Park",
                        venueDetail: extractSubVenueName(tkt, evt),
                        quantity: tkt.quantity || 1,
                        passType: ticketType.name || tkt.passType || "DONOR PASS",
                        amount: Number(tkt.totalAmount || tkt.pricePerTicket || 0).toFixed(2),
                        image: resolveCartItemImage(evt, ticketType, tkt),
                        transactionId: tkt.transactionId || tkt.id
                    };
                });
                setBookings(mapped);
            } else {
                setBookings([]);
            }
        } catch (err) {
            console.error("Error loading bookings:", err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    return (
        <div className="b-conf-page-wrapper">

            {/* BACKGROUND DECORATION */}
            <img
                src={bookingBgImg}
                alt=""
                className="b-conf-bg-swoosh"
            />

            <div className="b-conf-inner-container">

                {/* ================= HEADER SECTION ================= */}
                <div className="b-conf-header-section">

                    {/* BADGE: Double Ringed Badge matching Figma */}
                    <div className="b-conf-check-icon-outer">
                        {/* Outer 88px ring */}
                        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="44" cy="44" r="43.5" stroke="#FDFF53" />
                        </svg>

                        {/* Inner 69px Yellow Filled Circle */}
                        <div className="b-conf-check-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="26" viewBox="0 0 32 26" fill="none">
                                <path d="M31.1363 0L32 2.68869C32 2.68869 18.7183 8.737 14.9425 26H9.11382L0 13.8061L7.66419 8.76008L12.3497 15.692C12.3497 15.692 15.0807 10.7861 19.9964 6.34669C22.9592 3.67119 26.7397 1.45562 31.1363 0Z" fill="black" />
                            </svg>
                        </div>
                    </div>

                    <div className="b-conf-text-container">
                        <h1 className="b-conf-header-title">Booking Confirmed!</h1>
                        <p className="b-conf-header-subtitle">
                            Your passes have been successfully booked. A confirmation message has been sent to your registered mobile number.
                        </p>
                    </div>

                    <div className="b-conf-header-btn-group">
                        <button
                            className="b-conf-btn-yellow"
                            onClick={() => navigate("/bookings")}
                        >
                            <span className="btn-text-primary">VIEW BOOKINGS</span>
                            <span className="btn-text-secondary">VIEW BOOKINGS</span>
                        </button>
                        <button className="b-conf-btn-white">
                            <span className="btn-text-primary">ADD TO CALENDAR</span>
                            <span className="btn-text-secondary">ADD TO CALENDAR</span>
                        </button>
                    </div>

                </div>

                {/* ================= TICKET CARDS LIST ================= */}

                <div className="b-conf-tickets-list">
                    {bookings.map((ticket) => (
                        <BookingTicket key={ticket.id} booking={ticket} />
                    ))}
                </div>

                {/* ================= REGISTERED CONTACT & PROFILE CARDS ================= */}

                <div className="b-conf-footer-grid">

                    {/* REGISTERED DETAILS CARD */}
                    <div className="b-conf-footer-card">
                        <p className="b-conf-footer-text">
                            <strong>Registered Contact Details:</strong>{" "}
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
                                const phoneDisplay = mobileStr ? `Phone: ${mobileStr}` : "";
                                const storedEmail = localStorage.getItem("user_email");
                                const emailStr = storedEmail || "user@example.com";
                                if (phoneDisplay) return `${phoneDisplay} | Email: ${emailStr}`;
                                return `Email: ${emailStr}`;
                            })()}
                        </p>
                        <button className="b-conf-edit-link">
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
                            <span className="b-conf-edit-link-span">Edit</span>
                        </button>
                    </div>

                    {/* PASS NOTIFICATION CARD */}
                    <div className="b-conf-footer-card">
                        <p className="b-conf-footer-text">
                            <p style={{ margin: "0px" }}>Your pass has been updated with your latest booking. Access your pass anytime from <Link to="/profile" className="link-to-profile"> Profile </Link></p>
                        </p>

                    </div>

                </div>

                {/* BOTTOM BUTTON GROUP (Mobile Only) */}
                <div className="b-conf-bottom-btn-group">
                    <button
                        className="b-conf-btn-yellow"
                        onClick={() => navigate("/bookings")}
                    >
                        <span className="btn-text-primary">VIEW BOOKINGS</span>
                        <span className="btn-text-secondary">VIEW BOOKINGS</span>
                    </button>
                    <button className="b-conf-btn-white">
                        <span className="btn-text-primary">ADD TO CALENDAR</span>
                        <span className="btn-text-secondary">ADD TO CALENDAR</span>
                    </button>
                </div>

            </div>

        </div>
    );
};

export default BookingConfirmation;