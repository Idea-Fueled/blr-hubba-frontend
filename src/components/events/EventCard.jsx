import React from "react";
import { useNavigate } from "react-router-dom";
import "./EventCard.css";
import heartIcon from "../../assets/heart_icon.png";
import { formatVenueDisplay, formatEventTiming } from "../../utils/eventMappers";

const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(/\s*[-–]\s*/);
    if (parts.length === 2) {
        return (
            <>
                {parts[0]}–
                <br />
                {parts[1]}
            </>
        );
    }
    return timeStr;
};

export const EventCard = React.memo(({ event, isLiked, onToggleLike }) => {
    const navigate = useNavigate();

    if (!event) return null;

    return (
        <article 
            className="event-listing-card"
            onClick={() => navigate(`/events/${event.slug || event.id}`)}
            style={{ cursor: "pointer" }}
        >
            {/* Card Header */}
            <div className="card-header-body">
                <div className="card-header">
                    <div className="card-date-badge">
                        <div className="inner-card-date-badge">
                            <span className="card-date-day">{event.displayDate || event.date}</span>
                            <span className="card-date-month">{event.month}</span>
                        </div>
                    </div>
                    {/* <div className="card-venue-time"> */}
                    <span className="card-venue">
                        {event.venues && event.venues.length > 1
                            ? `${event.venues.length} Hubba Venues Across Bengaluru`
                            : formatVenueDisplay(event.venues || [event.venue])}
                    </span>
                    <div className="venue-time-divider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="40" viewBox="0 0 1 40" fill="none">
                            <path d="M0.5 40V0" stroke="black" />
                        </svg>
                    </div>
                    <span className="card-time">
                        {formatEventTiming(event.showCount, event.subfestivalName) || formatTime(event.time)}
                    </span>
                    {/* </div> */}
                </div>

                {/* Card Body */}
                <div className="card-body">
                    <div className="card-genres">
                        {event.genres && event.genres.map((genre, gIdx) => (
                            // <div className="card-genre-pill-container">
                            <span key={gIdx} className="card-genre-pill">
                                {genre}
                            </span>
                            // </div>
                        ))}
                    </div>
                    <div className="card-top-content">
                        <h3 className="card-title">{event.title}</h3>
                        <p className="card-performer">{event.performer}</p>
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className="card-image-cta-container">
                <div className="card-image-container">
                    <img src={event.image} alt={event.title} className="card-image" loading="lazy" />
                    <button
                        className={`card-wishlist-btn ${isLiked ? "liked" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleLike) onToggleLike(event.id);
                        }}
                        aria-label="Wishlist event"
                    >
                        <img
                            src={heartIcon}
                            alt="Wishlist"
                            className="card-wishlist-icon"
                        />
                    </button>
                </div>

                {/* CTA Button */}
                <button 
                    className="card-cta-btn" 
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.slug || event.id}`);
                    }}
                >
                    VIEW & BOOK
                </button>
            </div>
        </article>
    );
});

export default EventCard;