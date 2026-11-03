import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Calendar, MapPin, Clock, Download, QrCode, X, ExternalLink, Ticket } from "lucide-react";
import { MotionCard } from "../../components/AnimatedPage";
import { fetchMyTicketsApi } from "../../api/bookingApi";
import "./BookingsPage.css";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";
import { extractSubVenueName, getPerformerDisplay } from "../../utils/subVenueUtils";

export const BookingsPage = () => {
    const navigate = useNavigate();
    const [myTickets, setMyTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrCodeImage, setQrCodeImage] = useState(null);

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const location = useLocation();

    const loadTickets = async () => {
        setIsLoading(true);
        try {
            const res = await fetchMyTicketsApi();
            if (res && res.success && res.tickets) {
                // Filter out CANCELLED tickets so they never linger after cancellation
                setMyTickets(res.tickets.filter(t => t.status !== 'CANCELLED'));
            }
        } catch (err) {
            console.error("Failed to load tickets:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
            return;
        }
        // location.key changes every time React Router navigates to this page,
        // guaranteeing a fresh fetch on every visit (including returning from cancel flow)
        loadTickets();
    }, [isLoggedIn, navigate, location.key]);

    const formatEventDate = (dateString) => {
        if (!dateString) return { date: "TBA", time: "TBA" };
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return { date: dateString, time: "" };
        const date = dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        const time = dateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
        return { date, time };
    };

    const getEventImage = (ticketItem) => {
        if (!ticketItem) return freePassImage;

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

        // Priority 0: Direct image string attached to ticketItem (e.g. state/cache)
        const directImg = extractRawUrl(ticketItem.image) || extractRawUrl(ticketItem.imageUrl) || extractRawUrl(ticketItem.coverImage);
        if (directImg) return fixImageUrl(directImg);

        const evt = ticketItem.ticket?.event 
            || ticketItem.event 
            || ticketItem.ticket?.eventDate?.event 
            || ticketItem.eventDate?.event 
            || ticketItem.ticket?.eventDate 
            || ticketItem.eventDate 
            || {};

        // Priority 1: coverImage (direct DB field, matches EventDetailHero right card)
        if (evt.coverImage) return fixImageUrl(evt.coverImage);
        if (ticketItem.ticket?.coverImage) return fixImageUrl(ticketItem.ticket.coverImage);

        // Priority 2: imageUrl (computed field, matches EventDetailHero right card)
        if (evt.imageUrl) return fixImageUrl(evt.imageUrl);
        if (ticketItem.ticket?.imageUrl) return fixImageUrl(ticketItem.ticket.imageUrl);

        // Priority 3: media.images169 general image
        const media = evt.media || ticketItem.media || ticketItem.ticket?.media || {};
        const img169 = getGeneralImageFromMedia(media.images169);
        if (img169) return fixImageUrl(img169);

        // Priority 4: media.images11 general image
        const img11 = getGeneralImageFromMedia(media.images11);
        if (img11) return fixImageUrl(img11);

        // Priority 5: images/mediaItems arrays
        const imagesArr = evt.images || ticketItem.images || ticketItem.ticket?.images || media.images;
        if (imagesArr && Array.isArray(imagesArr) && imagesArr.length > 0) return fixImageUrl(extractRawUrl(imagesArr[0]));

        const mediaItemsArr = evt.mediaItems || ticketItem.mediaItems || ticketItem.ticket?.mediaItems || media.mediaItems;
        if (mediaItemsArr && Array.isArray(mediaItemsArr) && mediaItemsArr.length > 0) return fixImageUrl(extractRawUrl(mediaItemsArr[0]));

        // Fallback: pass-type placeholder
        const passName = (ticketItem.ticket?.name || ticketItem.passType || "").toLowerCase();
        if (passName.includes("free")) return freePassImage;
        return donorPassImage;
    };

    // Filter tickets - show all active booked passes under Upcoming Passes as requested
    const upcomingTickets = myTickets;
    const pastTickets = [];

    const handleShowQR = () => {
        const attendeeId = localStorage.getItem("guest_attendee_id") || "guest_user";
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendeeId)}`;
        setQrCodeImage(qrUrl);
        setShowQRModal(true);
    };

    const handleDownloadTicket = (ticketItem) => {
        const attendeeId = localStorage.getItem("guest_attendee_id") || "guest_user";
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendeeId)}`;

        // Generate nice canvas ticket and download
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 800;

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // Header
        ctx.fillStyle = "#FDFF53";
        ctx.fillRect(10, 10, canvas.width - 20, 100);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 28px Roboto Condensed, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BLR HUBBA - PASS TICKET", canvas.width / 2, 70);

        // Event Title
        ctx.fillStyle = "#000000";
        ctx.font = "bold 24px Roboto Condensed, sans-serif";
        ctx.fillText(ticketItem.ticket?.event?.title || "Event Pass", canvas.width / 2, 170);

        // Date and Time
        const displayDateTime = ticketItem.ticket?.event?.eventType === "RECURRING" && ticketItem.timeSlot
            ? ticketItem.timeSlot.startTime
            : ticketItem.ticket?.event?.startDateTime;
        const { date, time } = formatEventDate(displayDateTime);
        ctx.font = "18px Arial, sans-serif";
        ctx.fillText(`${date} | ${time}`, canvas.width / 2, 220);

        // Venue
        ctx.fillText(ticketItem.ticket?.event?.venue?.name || "Freedom Park", canvas.width / 2, 260);

        // Details
        ctx.textAlign = "left";
        ctx.font = "16px Arial, sans-serif";
        ctx.fillText(`Pass Type: ${ticketItem.ticket?.name || "General Pass"}`, 80, 330);
        ctx.fillText(`Quantity: ${ticketItem.quantity}`, 80, 360);
        ctx.fillText(`Price: INR ${parseFloat(ticketItem.totalAmount || 0).toFixed(2)}`, 80, 390);
        ctx.fillText(`Status: ${ticketItem.status || "CONFIRMED"}`, 80, 420);

        // Draw QR Code
        const qrImage = new Image();
        qrImage.crossOrigin = "anonymous";
        qrImage.onload = () => {
            ctx.drawImage(qrImage, 175, 470, 250, 250);
            
            // Footer
            ctx.textAlign = "center";
            ctx.font = "14px Arial, sans-serif";
            ctx.fillStyle = "#6C6C6C";
            ctx.fillText("Please present this pass at the venue entrance for scanning.", canvas.width / 2, 760);

            // Trigger download
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `BLRHubba-Pass-${ticketItem.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        qrImage.src = qrUrl;
    };

    const TicketCard = ({ ticket, isPast = false }) => {
        const evt = ticket.ticket?.event || ticket.event || ticket.ticket?.eventDate?.event || {};
        const displayDateTime = evt.eventType === "RECURRING" && ticket.timeSlot
            ? ticket.timeSlot.startTime
            : (evt.startDateTime || ticket.eventDate?.date);

        const { date, time } = formatEventDate(displayDateTime);

        const title = evt.title || ticket.title || "Event Pass";
        const performer = getPerformerDisplay(evt, ticket);

        const venueName = evt.venue?.name || ticket.venue?.name || (typeof ticket.venue === 'string' ? ticket.venue : null) || "Freedom Park";
        const subVenueName = extractSubVenueName(ticket, evt);

        const passTypeName = ticket.ticket?.name || ticket.passType || "General Pass";
        const qty = ticket.quantity || 1;
        const totalPrice = Number(ticket.totalAmount || ticket.pricePerTicket || 0);

        return (
            <MotionCard className={`bookings-ticket-card ${isPast ? "bookings-past" : ""}`}>
                <div className="bookings-ticket-main">
                    <div className="bookings-ticket-image-box">
                        <img
                            src={getEventImage(ticket)}
                            alt={title}
                            className="bookings-ticket-image"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = passTypeName.toLowerCase().includes("free") ? freePassImage : donorPassImage;
                            }}
                        />
                    </div>

                    <div className="bookings-ticket-info">
                        <div className="bookings-ticket-header-row">
                            <div className="bookings-ticket-title-group">
                                <h3 className="bookings-ticket-title">{title}</h3>
                                {performer && <p className="bookings-ticket-by">{performer}</p>}
                            </div>
                            <span className={`bookings-status-pill ${isPast ? 'past' : (ticket.status || 'CONFIRMED').toLowerCase()}`}>
                                {isPast ? "Completed" : (ticket.status || "CONFIRMED")}
                            </span>
                        </div>

                        <div className="bookings-ticket-meta-grid">
                            <div className="bookings-meta-item">
                                <Calendar size={15} className="bookings-meta-icon" />
                                <span>{date}</span>
                            </div>
                            {time && (
                                <div className="bookings-meta-item">
                                    <Clock size={15} className="bookings-meta-icon" />
                                    <span>{time}</span>
                                </div>
                            )}
                            <div className="bookings-meta-item">
                                <MapPin size={15} className="bookings-meta-icon" />
                                <span>
                                    <strong>{venueName}</strong>
                                    {subVenueName ? `: ${subVenueName}` : ""}
                                </span>
                            </div>
                        </div>

                        <div className="bookings-pass-details-row">
                            <div className="bookings-pass-badge-box">
                                <span className="bookings-pass-type-badge">{passTypeName}</span>
                                <span className="bookings-pass-qty-badge">{qty} {qty === 1 ? 'Pass' : 'Passes'}</span>
                            </div>
                            <span className="bookings-pass-price">
                                {totalPrice === 0 ? "Free" : `₹${totalPrice.toFixed(2)}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="bookings-ticket-footer-actions">
                    <div className="bookings-left-actions">
                        {!isPast && (
                            <>
                                <button className="bookings-pass-qr-btn" onClick={() => openQRModal(ticket)}>
                                    <span className="btn-text-primary"><QrCode size={16} /> View Pass QR</span>
                                    <span className="btn-text-secondary"><QrCode size={16} /> View Pass QR</span>
                                </button>
                                <button className="bookings-download-pdf-btn" onClick={() => downloadPassPDF(ticket)}>
                                    <span className="btn-text-primary"><Download size={16} /> Download PDF</span>
                                    <span className="btn-text-secondary"><Download size={16} /> Download PDF</span>
                                </button>
                                <button
                                    className="bookings-cancel-pass-btn"
                                    onClick={() => {
                                        const evt = ticket.ticket?.event || ticket.event || ticket.ticket?.eventDate?.event || {};
                                        const ticketType = ticket.ticket || {};
                                        const dateObj = ticket.eventDate?.date
                                            ? new Date(ticket.eventDate.date)
                                            : (evt.startDateTime ? new Date(evt.startDateTime) : new Date());
                                        const weekday = dateObj.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
                                        const day = dateObj.getDate().toString();
                                        const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
                                        const { date: fDate, time: fTime } = formatEventDate(
                                            ticket.ticket?.event?.eventType === "RECURRING" && ticket.timeSlot
                                                ? ticket.timeSlot.startTime
                                                : (evt.startDateTime || ticket.ticket?.event?.startDateTime)
                                        );
                                        const performerStr = getPerformerDisplay(evt, ticket);

                                        navigate("/cancel-booking", {
                                            state: {
                                                booking: {
                                                    id: ticket.id,
                                                    transactionId: ticket.transactionId || ticket.id,
                                                    month,
                                                    day,
                                                    weekday,
                                                    title: evt.title || ticket.title || "Event",
                                                    by: performerStr,
                                                    date: `${fDate} | ${fTime}`,
                                                    venue: evt.venue?.name || ticket.venue?.name || (typeof ticket.venue === 'string' ? ticket.venue : null) || "Freedom Park",
                                                    venueDetail: extractSubVenueName(ticket, evt),
                                                    quantity: ticket.quantity || 1,
                                                    passType: ticketType.name || ticket.passType || "FREE PASS",
                                                    amount: Number(ticket.totalAmount || ticket.pricePerTicket || 0).toFixed(2),
                                                    image: getEventImage(ticket)
                                                }
                                            }
                                        });
                                    }}
                                >
                                    <span className="btn-text-primary"><X size={16} /> Cancel</span>
                                    <span className="btn-text-secondary"><X size={16} /> Cancel</span>
                                </button>
                            </>
                        )}
                        <a
                            href={`/events/${ticket.ticket?.event?.slug || ticket.ticket?.event?.id || ticket.event?.slug || ticket.event?.id || ticket.eventId}`}
                            className="bookings-details-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Event Details <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </MotionCard>
        );
    };

    if (!isLoggedIn) return null;

    const ticketsToRender = activeTab === "upcoming" ? upcomingTickets : pastTickets;

    return (
        <div className="bookings-page-container">
            <div className="bookings-page-content">
                <div className="bookings-page-header">
                    <h1 className="bookings-page-title">My Passes</h1>
                    <p className="bookings-page-subtitle">View and manage your event entry passes</p>
                </div>

                {/* Tabs */}
                <div className="bookings-tabs-bar">
                    <button
                        className={`bookings-tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
                        onClick={() => setActiveTab("upcoming")}
                    >
                        Upcoming Passes ({upcomingTickets.length})
                    </button>
                    <button
                        className={`bookings-tab-btn ${activeTab === "past" ? "active" : ""}`}
                        onClick={() => setActiveTab("past")}
                    >
                        Past Events ({pastTickets.length})
                    </button>
                </div>

                {/* Tickets list */}
                {isLoading ? (
                    <div className="bookings-loading-box">
                        <div className="bookings-spinner"></div>
                    </div>
                ) : ticketsToRender.length > 0 ? (
                    <div className="bookings-tickets-grid">
                        {ticketsToRender.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} isPast={activeTab === "past"} />
                        ))}
                    </div>
                ) : (
                    <div className="bookings-empty-state">
                        <Ticket size={48} className="bookings-empty-icon" />
                        <h3>No passes found</h3>
                        <p>You don't have any {activeTab} event passes booked yet.</p>
                        <Link to="/events" className="bookings-browse-btn">Browse Events</Link>
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="bookings-modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="bookings-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="bookings-modal-close-btn" onClick={() => setShowQRModal(false)}>
                            <X size={20} />
                        </button>
                        <h2 className="bookings-modal-title">Venue Entry Pass</h2>
                        <p className="bookings-modal-desc">Scan this QR code at the venue gate for event entry.</p>
                        
                        <div className="bookings-modal-qr-box">
                            {qrCodeImage && <img src={qrCodeImage} alt="Entry Pass QR" />}
                        </div>
                        
                        <span className="bookings-modal-qr-caption">BLR HUBBA ACCESS PASS</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
