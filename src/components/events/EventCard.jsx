import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./EventCard.css";
import { formatVenueDisplay, formatEventTiming, getEventVenueDisplayText, getEventTimeDisplayText, toTitleCase } from "../../utils/eventMappers";
import { toast } from "sonner";
import { toggleWishlistApi } from "../../api/eventsApi";

export const EventCard = React.memo(({ event, isLiked: propIsLiked, onToggleLike }) => {
    const navigate = useNavigate();
    const [localIsLiked, setLocalIsLiked] = useState(false);

    // Sync localState when propIsLiked changes
    useEffect(() => {
        if (!event) return;
        if (propIsLiked !== undefined) {
            setLocalIsLiked(propIsLiked);
        } else {
            try {
                const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
                setLocalIsLiked(!!favs[event.id]);
            } catch (e) {
                setLocalIsLiked(false);
            }
        }
    }, [propIsLiked, event?.id]);

    // Listen to "profile-change" events to update wishlist hearts when toggled on another card!
    useEffect(() => {
        if (!event) return;
        const handleProfileChange = () => {
            if (propIsLiked === undefined) {
                try {
                    const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
                    setLocalIsLiked(!!favs[event.id]);
                } catch (e) {
                    setLocalIsLiked(false);
                }
            }
        };

        window.addEventListener("profile-change", handleProfileChange);
        return () => {
            window.removeEventListener("profile-change", handleProfileChange);
        };
    }, [event?.id, propIsLiked]);

    if (!event) return null;

    const displayDate = event.displayDate || event.date || "16-24";
    const displayMonth = event.month || "JAN";
    const rawVenue = getEventVenueDisplayText(event);
    const displayVenue = rawVenue.includes("Venues") ? rawVenue : toTitleCase(rawVenue);
    const displayTime = getEventTimeDisplayText(event);

    const titleStr = toTitleCase(event.title || event.name || "Event Title");
    const performerStr = event.performer || event.artist || event.artistName
        ? toTitleCase(event.performer || event.artist || event.artistName)
        : "";

    return (
        <motion.article
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="event-card-container"
            onClick={() => navigate(`/events/${event.slug || event.id}`)}
        >
            {/* Top Media Image Header */}
            <div className="event-card-media">
                <img src={event.image} alt={titleStr} className="event-card-image" loading="lazy" />

                {/* Top-Left Date Badge */}
                <div className="event-card-date-badge">
                    <span className="event-card-date-day">{displayDate}</span>
                    <span className="event-card-date-month">{displayMonth}</span>
                </div>

                {/* Bottom-Left Category Tags */}
                {event.genres && event.genres.length > 0 && (
                    <div className="event-card-tags">
                        {event.genres.map((genre, idx) => {
                            const genreName = typeof genre === "string" ? genre : genre?.name || genre?.title || "";
                            if (!genreName) return null;
                            return (
                                <span key={idx} className="event-card-tag-pill">
                                    {toTitleCase(genreName)}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Bottom-Right Heart Wishlist Button */}
                <button
                    className={`event-card-wishlist-btn ${localIsLiked ? "liked" : ""}`}
                    onClick={async (e) => {
                        e.stopPropagation();
                        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                        if (!isLoggedIn) {
                            window.dispatchEvent(new Event("open-login-modal"));
                            return;
                        }

                        const nextLiked = !localIsLiked;
                        setLocalIsLiked(nextLiked);

                        try {
                            const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
                            if (nextLiked) {
                                favs[event.id] = true;
                            } else {
                                delete favs[event.id];
                            }
                            localStorage.setItem("user_favorites", JSON.stringify(favs));
                        } catch (err) { }

                        if (onToggleLike) {
                            onToggleLike(event.id, nextLiked);
                        } else {
                            try {
                                await toggleWishlistApi(event.id);
                                toast.success(nextLiked ? "Added to wishlist" : "Removed from wishlist");
                            } catch (err) {
                                console.error("Error toggling wishlist on backend:", err);
                            }
                        }

                        window.dispatchEvent(new Event("profile-change"));
                    }}
                    aria-label="Wishlist event"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={localIsLiked ? "#CF398E" : "none"}>
                        <path d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z" stroke={localIsLiked ? "#CF398E" : "black"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Bottom Content Body */}
            <div className="event-card-body">
                <div className="event-card-main-info">
                    <h3 className="event-card-title">{titleStr}</h3>
                    {performerStr && (
                        <p className="event-card-performer">
                            {performerStr}
                        </p>
                    )}
                </div>

                <div className="event-card-details">
                    <div className="event-card-detail-item">
                        {/* Pin Icon */}
                        <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.75 11.25C10.4069 11.25 11.75 9.90685 11.75 8.25C11.75 6.59315 10.4069 5.25 8.75 5.25C7.09315 5.25 5.75 6.59315 5.75 8.25C5.75 9.90685 7.09315 11.25 8.75 11.25Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8.75 20.75C10.75 16.75 16.75 14.1683 16.75 8.75C16.75 4.33172 13.1683 0.75 8.75 0.75C4.33172 0.75 0.75 4.33172 0.75 8.75C0.75 14.1683 6.75 16.75 8.75 20.75Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span>{displayVenue}</span>
                    </div>

                    <div className="event-card-detail-item">
                        {/* Clock Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M9.75 4.35V9.75L13.35 11.55M18.75 9.75C18.75 14.7206 14.7206 18.75 9.75 18.75C4.77944 18.75 0.75 14.7206 0.75 9.75C0.75 4.77944 4.77944 0.75 9.75 0.75C14.7206 0.75 18.75 4.77944 18.75 9.75Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        <span>{displayTime}</span>
                    </div>
                </div>

                {/* Bottom Footer KNOW MORE CTA */}
                <div className="event-card-footer">
                    <span className="event-card-know-more">KNOW MORE</span>
                    <div className="event-card-arrow-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                        </svg>
                    </div>
                </div>
            </div>
        </motion.article>
    );
});

export default EventCard;