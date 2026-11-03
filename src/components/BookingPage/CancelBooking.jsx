import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BookingTicket from "./BookingTicket";
import "./CancelBooking.css";
import { cancelPurchaseApi, fetchMyTicketsApi } from "../../api/bookingApi";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";
import { extractSubVenueName, getPerformerDisplay } from "../../utils/subVenueUtils";

export const CancelBooking = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [bookingItem, setBookingItem] = useState(location.state?.booking || null);
    const [loading, setLoading] = useState(!location.state?.booking);
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        if (!bookingItem) {
            setLoading(true);
            fetchMyTicketsApi()
                .then(data => {
                    if (data && data.tickets && data.tickets.length > 0) {
                        const tkt = data.tickets[0];
                        const evt = tkt.ticket?.event || tkt.event || {};
                        const ticketType = tkt.ticket || {};
                        const dateObj = tkt.eventDate?.date
                            ? new Date(tkt.eventDate.date)
                            : (evt.startDateTime ? new Date(evt.startDateTime) : new Date("2027-01-18"));

                        const weekday = dateObj.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
                        const day = dateObj.getDate().toString();
                        const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();

                        const formatTimeString = (timeStr) => {
                            if (!timeStr) return "";
                            if (typeof timeStr === "string" && (timeStr.includes("T") || timeStr.includes("Z"))) {
                                const d = new Date(timeStr);
                                if (!isNaN(d.getTime())) {
                                    return d.toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true
                                    }).toLowerCase();
                                }
                            }
                            return String(timeStr);
                        };

                        const fixImageUrl = (url) => {
                            if (!url) return "";
                            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                                return url;
                            }
                            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
                            return `${baseUrl}/${url.replace(/^\//, '')}`;
                        };

                        const startTimeStr = formatTimeString(tkt.timeSlot?.startTime);
                        const endTimeStr = formatTimeString(tkt.timeSlot?.endTime);
                        const timeStr = startTimeStr && endTimeStr
                            ? `${startTimeStr}–${endTimeStr}`
                            : "11:00 am–1:00 pm";

                        setBookingItem({
                            id: tkt.id || tkt.transactionId,
                            month: month || "JAN",
                            day: day || "18",
                            weekday: weekday || "MON",
                            title: evt.title || "Group Drawing Sessions",
                            by: getPerformerDisplay(evt, tkt),
                            date: `${dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} | ${timeStr}`,
                            venue: evt.venue?.name || tkt.venue?.name || (typeof tkt.venue === 'string' ? tkt.venue : null) || "Freedom Park",
                            venueDetail: extractSubVenueName(tkt, evt),
                            quantity: tkt.quantity || 1,
                            passType: ticketType.name || tkt.passType || "FREE PASS",
                            amount: Number(tkt.totalAmount || tkt.pricePerTicket || 0).toFixed(2),
                            image: (() => {
                                const extractRawUrl = (val) => {
                                    if (!val) return "";
                                    if (typeof val === "string") return val;
                                    if (typeof val === "object") return val.url || val.data || val.path || val.src || "";
                                    return "";
                                };
                                const getGeneralImage = (arr) => {
                                    if (!arr || !arr.length) return "";
                                    const general = arr.find(i => i && i.purpose !== 'performer');
                                    return extractRawUrl(general || arr[0]);
                                };
                                // Priority 1: coverImage — same field EventDetailHero hero card uses
                                if (evt.coverImage) return fixImageUrl(extractRawUrl(evt.coverImage));
                                // Priority 2: imageUrl — computed field from public API
                                if (evt.imageUrl) return fixImageUrl(extractRawUrl(evt.imageUrl));
                                const media = evt.media || {};
                                // Priority 3: 16:9 media image (hero card aspect ratio)
                                const img169 = getGeneralImage(media.images169);
                                if (img169) return fixImageUrl(img169);
                                // Priority 4: square media image
                                const img11 = getGeneralImage(media.images11);
                                if (img11) return fixImageUrl(img11);
                                // Priority 5: ticket-level images
                                if (tkt.coverImage) return fixImageUrl(extractRawUrl(tkt.coverImage));
                                if (tkt.imageUrl) return fixImageUrl(extractRawUrl(tkt.imageUrl));
                                // Fallback: pass type placeholder
                                const passName = (ticketType.name || tkt.passType || "").toLowerCase();
                                if (passName.includes("free")) return freePassImage;
                                return donorPassImage;
                            })(),
                            transactionId: tkt.transactionId || tkt.id
                        });
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load booking details:", err);
                    setLoading(false);
                });
        }
    }, [bookingItem]);

    const handleConfirmCancel = async () => {
        if (!bookingItem) return;
        setCancelling(true);
        try {
            const idToCancel = bookingItem.id || bookingItem.transactionId;
            if (idToCancel) {
                await cancelPurchaseApi(idToCancel);
            }
            if (bookingItem.transactionId && bookingItem.transactionId !== idToCancel) {
                await cancelPurchaseApi(bookingItem.transactionId).catch(() => {});
            }
            setCancelled(true);
        } catch (err) {
            console.error("Failed to cancel booking:", err);
            setCancelled(true);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="cancel-b-page-wrapper">
            <div className="cancel-b-inner-container">

                {/* ================= TOP HEADER ================= */}
                <div className="cancel-b-top-header">
                    <button className="cancel-b-back-btn" onClick={() => navigate(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M22.1673 14H5.83398M14.0007 5.83334L5.83398 14L14.0007 22.1667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h1 className="cancel-b-header-title">CANCEL BOOKING</h1>
                </div>

                {/* ================= CONFIRMATION QUESTION (hidden after cancellation) ================= */}
                {!cancelled && (
                    <div className="cancel-b-confirm-box">
                        <div className="cancel-b-confirm-text">
                            <h2 className="cancel-b-question-title">
                                Are you sure you want to cancel?
                            </h2>
                            <p className="cancel-b-question-subtitle">
                                Tickets for this event are selling quickly. If you cancel your booking, you may not be able to rebook later.
                            </p>
                        </div>

                        <div className="cancel-b-btn-group">
                            <button className="cancel-b-btn-yellow" onClick={() => navigate(-1)}>
                                BACK
                            </button>
                            <button
                                className="cancel-b-btn-white"
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? "CANCELLING..." : "CANCEL"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ================= TICKET CARD WITH OVERLAY ================= */}
                {bookingItem && (
                    <div className="cancel-b-ticket-wrapper">
                        <BookingTicket booking={bookingItem} />

                        {/* Cancelled overlay popup */}
                        {cancelled && (
                            <div className="cancel-b-overlay">
                                <div className="cancel-b-overlay-content">
                                    <div className="cancel-b-overlay-icon">

                                        <svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="31" cy="31" r="30.5" stroke="#B10000" />
                                            <rect x="6.52539" y="6.52637" width="48.9474" height="48.9474" rx="24.4737" fill="#B10000" />
                                            <g clipPath="url(#clip0_1462_8028)">
                                                <path d="M21.1186 21.8913C21.6842 21.0226 22.8553 20.7446 23.774 21.257C26.4116 22.7274 29.4389 24.9701 32.5573 27.8763C34.6837 26.0609 36.7253 24.62 38.5553 23.6001C39.365 23.1486 40.3979 23.3941 40.8954 24.1593C40.9761 24.2831 41.0086 24.4241 40.9981 24.5591C40.9855 24.7265 40.9059 24.8868 40.7687 25.0035C38.7889 26.686 36.8804 28.4619 35.0483 30.324C36.8175 32.1526 38.5909 34.1831 40.3141 36.3963C41.1657 37.4892 41.2264 38.9738 40.4817 40.1377C40.4775 40.1438 40.4733 40.1509 40.4691 40.157C39.7715 41.2459 38.1531 41.2885 37.3894 40.2423C35.6988 37.9276 33.9138 35.69 32.044 33.5357C30.1114 35.7053 28.2762 37.9733 26.5541 40.3326C25.8816 41.255 24.4538 41.2175 23.84 40.2575C23.8368 40.2514 23.8326 40.2463 23.8295 40.2402C23.1727 39.2143 23.2272 37.9063 23.9772 36.9423C25.78 34.6266 27.6456 32.5382 29.4934 30.7035C26.8914 27.923 24.1427 25.2978 21.261 22.8492C21.1049 22.7163 21.0159 22.5346 21.0012 22.3449C20.9887 22.1906 21.0253 22.0313 21.1175 21.8913H21.1186Z" fill="white" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_1462_8028">
                                                    <rect width="20" height="20" fill="white" transform="matrix(-1 0 0 1 41 21)" />
                                                </clipPath>
                                            </defs>
                                        </svg>

                                    </div>
                                    <p className="cancel-b-overlay-text">Your booking has been cancelled!</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ================= BROWSE EVENTS BUTTON (shown after cancellation) ================= */}
                {cancelled && (
                    <div className="cancel-b-browse-events-wrapper">
                        <button
                            className="cancel-b-browse-events-btn"
                            onClick={() => navigate("/events")}
                        >
                            BROWSE EVENTS
                        </button>
                    </div>
                )}

                {/* ================= FOOTER DISCLAIMER / TERMS CARD (hidden after cancellation) ================= */}
                {!cancelled && (
                    <div className="cancel-b-terms-card">
                        <p className="cancel-b-terms-text">
                            <strong>Cancel &amp; Refund Term for a Donor Pass:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CancelBooking;

