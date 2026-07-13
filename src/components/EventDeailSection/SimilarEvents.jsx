import React, { useState, useRef } from "react";
import "./SimilarEvents.css";
import EventCard from "../events/EventCard";
import { DUMMY_EVENTS } from "../EventListingSection/EventListing";

const SimilarEvents = () => {
    const [likedEvents, setLikedEvents] = useState({});
    const cardsGridRef = useRef(null); // NEW

    const toggleLike = (eventId) => {
        setLikedEvents((prev) => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    // NEW: scroll the cards container left/right instead of scrolling the page
    const scrollLeft = () => {
        if (cardsGridRef.current) {
            cardsGridRef.current.scrollBy({ left: -326, behavior: "smooth" }); // 302px card + 24px gap
        }
    };

    const scrollRight = () => {
        if (cardsGridRef.current) {
            cardsGridRef.current.scrollBy({ left: 326, behavior: "smooth" });
        }
    };

    const similarEventsList = DUMMY_EVENTS.slice(0, 6);

    return (
        <>
            <section className="similar-events-wrapper">
                <div className="similar-events-container">
                    <div className="similar-events-header">
                        <h2 className="similar-events-header-title">Similar Events</h2>
                        <button className="similar-events-header-button">Explore full Calendar</button>
                    </div>
                    <div className="similar-events-cards-container">
                        <div className="cards-grid" ref={cardsGridRef}>
                            {similarEventsList.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    isLiked={!!likedEvents[event.id]}
                                    onToggleLike={toggleLike}
                                />
                            ))}
                        </div>
                        <div className="navigation-button-container">
                            <button className="arrows" onClick={scrollLeft}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M12 5L5 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="arrows" onClick={scrollRight}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12H19M12 19L19 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SimilarEvents;