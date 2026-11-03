import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Share2, Calendar, MapPin, Clock, Search, User, Ticket, HelpCircle } from "lucide-react";
import { MotionSection, MotionCard } from "../../components/AnimatedPage";
import { fetchMyTicketsApi } from "../../api/bookingApi";
import "./DashboardPage.css";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("User");
    const [myTickets, setMyTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [qrCodeImage, setQrCodeImage] = useState(null);

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
            return;
        }

        const storedName = localStorage.getItem("user_name") || "User";
        setUserName(storedName);

        // Generate QR code using public API based on user's attendee_id / mobile
        const attendeeId = localStorage.getItem("guest_attendee_id") || "guest_user";
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(attendeeId)}`;
        setQrCodeImage(qrUrl);

        // Load user bookings/tickets
        const loadTickets = async () => {
            setIsLoading(true);
            try {
                const res = await fetchMyTicketsApi();
                if (res && res.success && res.tickets) {
                    setMyTickets(res.tickets);
                }
            } catch (err) {
                console.error("Failed to load tickets:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadTickets();
    }, [isLoggedIn, navigate]);

    const handleDownloadQR = () => {
        if (!qrCodeImage) return;
        const link = document.createElement("a");
        link.href = qrCodeImage;
        link.download = `blrhubba-pass-${userName}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShareQR = async () => {
        if (!qrCodeImage) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My BLR Hubba Pass",
                    text: "My access QR code for BLR Hubba events",
                    url: qrCodeImage
                });
            } catch (e) {
                handleDownloadQR();
            }
        } else {
            handleDownloadQR();
        }
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return { date: "TBA", time: "TBA" };
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return { date: dateString, time: "" };
        const date = dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
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
        const evt = ticketItem.ticket?.event || {};
        
        const fixImageUrl = (url) => {
            if (!url) return "";
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
            const isLocalFrontend = typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (/^https?:\/\/localhost:\d+/.test(url)) {
                if (isLocalFrontend) {
                    return url.replace(/^https?:\/\/localhost:\d+/, 'http://localhost:3000');
                } else {
                    return url.replace(/^https?:\/\/localhost:\d+/, baseUrl);
                }
            }
            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                return url;
            }
            if (isLocalFrontend) {
                return `http://localhost:3000/${url.replace(/^\//, '')}`;
            }
            return `${baseUrl}/${url.replace(/^\//, '')}`;
        };

        if (evt.coverImage) return fixImageUrl(evt.coverImage);
        if (evt.imageUrl) return fixImageUrl(evt.imageUrl);
        if (evt.images && evt.images.length > 0) return fixImageUrl(evt.images[0]);
        const media = evt.media || {};
        if (media.images11 && media.images11.length > 0) return fixImageUrl(media.images11[0].data);
        if (media.images169 && media.images169.length > 0) return fixImageUrl(media.images169[0].data);
        return donorPassImage;
    };

    // Filter upcoming bookings - show all active booked passes
    const upcomingTickets = myTickets;

    if (!isLoggedIn) return null;

    return (
        <div className="dashboard-page-container">
            <div className="dashboard-page-content">
                
                {/* Header Welcome and QR section */}
                <MotionSection className="dashboard-welcome-box">
                    <div className="dashboard-welcome-info">
                        <h1 className="dashboard-welcome-title">Welcome back, {userName}!</h1>
                        <p className="dashboard-welcome-subtitle">
                            This is your unique QR code. It stores all your booked events and is used for venue entry. 
                            You must book events for the pass to work. Without bookings, access will not be granted.
                        </p>
                        
                        {myTickets.length === 0 && (
                            <p className="dashboard-no-bookings-warn">
                                As of now you do not have any events booked against your QR code.
                            </p>
                        )}
                        
                        <div className="dashboard-qr-actions">
                            <button className="dashboard-qr-action-btn" onClick={handleDownloadQR} title="Download QR">
                                <Download size={18} /> Download Pass
                            </button>
                            <button className="dashboard-qr-action-btn" onClick={handleShareQR} title="Share QR">
                                <Share2 size={18} /> Share Pass
                            </button>
                        </div>
                    </div>
                    
                    <div className="dashboard-qr-wrapper">
                        {qrCodeImage ? (
                            <img src={qrCodeImage} alt="BLR Hubba Entry Pass" className="dashboard-qr-img" />
                        ) : (
                            <div className="dashboard-qr-placeholder">QR Code Unavailable</div>
                        )}
                        <span className="dashboard-qr-caption">VENUE ENTRY PASS</span>
                    </div>
                </MotionSection>

                {/* Main Content Grid */}
                <div className="dashboard-main-grid">
                    
                    {/* Left Column: Upcoming events list */}
                    <MotionSection className="dashboard-events-section">
                        <div className="dashboard-section-header">
                            <h2 className="dashboard-section-title">Your Upcoming Events</h2>
                            {upcomingTickets.length > 0 && (
                                <Link to="/bookings" className="dashboard-view-all-link">View All</Link>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="dashboard-loading-box">
                                <div className="dashboard-spinner"></div>
                            </div>
                        ) : upcomingTickets.length > 0 ? (
                            <div className="dashboard-tickets-list">
                                {upcomingTickets.slice(0, 3).map((item, idx) => {
                                    const { date, time } = formatEventDate(
                                        item.ticket?.event?.eventType === "RECURRING" && item.timeSlot
                                            ? item.timeSlot.startTime
                                            : item.ticket?.event?.startDateTime
                                    );
                                    return (
                                        <MotionCard key={item.id} className="dashboard-ticket-card-item" index={idx}>
                                            <div className="dashboard-ticket-card-img-wrapper">
                                                <img src={getEventImage(item)} alt="" className="dashboard-ticket-card-img" />
                                            </div>
                                            <div className="dashboard-ticket-card-details">
                                                <h3 className="dashboard-ticket-card-title">{item.ticket?.event?.title}</h3>
                                                <div className="dashboard-ticket-card-meta">
                                                    <span className="dashboard-ticket-meta-item">
                                                        <Calendar size={13} /> {date}
                                                    </span>
                                                    <span className="dashboard-ticket-meta-item">
                                                        <Clock size={13} /> {time}
                                                    </span>
                                                    <span className="dashboard-ticket-meta-item">
                                                        <MapPin size={13} /> {item.ticket?.event?.venue?.name || "Freedom Park"}
                                                    </span>
                                                </div>
                                                <div className="dashboard-ticket-card-badges">
                                                    <span className="dashboard-ticket-badge">{item.ticket?.name || "General Pass"}</span>
                                                    <span className="dashboard-ticket-badge">{item.quantity} {item.quantity === 1 ? "pass" : "passes"}</span>
                                                </div>
                                            </div>
                                        </MotionCard>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="dashboard-empty-events-box">
                                <Ticket size={48} className="dashboard-empty-icon" />
                                <p className="dashboard-empty-text">No upcoming events booked yet</p>
                                <Link to="/events" className="dashboard-browse-btn">Browse Events</Link>
                            </div>
                        )}
                    </MotionSection>

                    {/* Right Column: Quick Actions */}
                    <MotionSection className="dashboard-actions-section">
                        <h2 className="dashboard-section-title">Quick Actions</h2>
                        <div className="dashboard-actions-list">
                            <Link to="/events" className="dashboard-action-card">
                                <div className="dashboard-action-card-icon">
                                    <Search size={22} />
                                </div>
                                <div className="dashboard-action-card-text">
                                    <span className="dashboard-action-card-title">Browse Events</span>
                                    <span className="dashboard-action-card-desc">Discover new events in Bengaluru</span>
                                </div>
                            </Link>

                            <Link to="/bookings" className="dashboard-action-card">
                                <div className="dashboard-action-card-icon">
                                    <Ticket size={22} />
                                </div>
                                <div className="dashboard-action-card-text">
                                    <span className="dashboard-action-card-title">My Bookings</span>
                                    <span className="dashboard-action-card-desc">View all your purchased passes</span>
                                </div>
                            </Link>

                            <Link to="/profile" className="dashboard-action-card">
                                <div className="dashboard-action-card-icon">
                                    <User size={22} />
                                </div>
                                <div className="dashboard-action-card-text">
                                    <span className="dashboard-action-card-title">Edit Profile</span>
                                    <span className="dashboard-action-card-desc">Update your personal information</span>
                                </div>
                            </Link>

                            <Link to="/help" className="dashboard-action-card">
                                <div className="dashboard-action-card-icon">
                                    <HelpCircle size={22} />
                                </div>
                                <div className="dashboard-action-card-text">
                                    <span className="dashboard-action-card-title">Help & Support</span>
                                    <span className="dashboard-action-card-desc">Need help? Contact support</span>
                                </div>
                            </Link>
                        </div>
                    </MotionSection>

                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
