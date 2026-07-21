import React, { useState, useRef, useEffect } from "react";
import "./SimilarEvents.css";
import EventCard from "../events/EventCard";
import { fetchEvents } from "../../api/eventsApi";
import { mapBackendEventToCard } from "../../utils/eventMappers";

const SimilarEvents = ({ currentEvent }) => {
    const [similarEventsList, setSimilarEventsList] = useState([]);
    const [likedEvents, setLikedEvents] = useState({});
    const cardsGridRef = useRef(null);

    useEffect(() => {
        if (!currentEvent) return;

        const queryParams = { limit: 6, includePast: true };
        if (currentEvent.subfestival?.id) {
            queryParams.subfestivalId = currentEvent.subfestival.id;
        }

        fetchEvents(queryParams)
            .then(data => {
                if (data.events) {
                    // Filter out the current event
                    const filtered = data.events.filter(e => e.id !== currentEvent.id);
                    setSimilarEventsList(filtered.map(mapBackendEventToCard));
                }
            })
            .catch(err => {
                console.error(err);
            });
    }, [currentEvent]);

    const toggleLike = (eventId) => {
        setLikedEvents((prev) => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    const scrollLeft = () => {
        if (cardsGridRef.current) {
            cardsGridRef.current.scrollBy({ left: -326, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (cardsGridRef.current) {
            cardsGridRef.current.scrollBy({ left: 326, behavior: "smooth" });
        }
    };

    return (
        <>
            <section className="similar-events-wrapper">
                <div className="similar-events-container">
                    <div className="similar-events-header">
                        <h2 className="similar-events-header-title">Similar Events</h2>
                        <button className="similar-events-header-button"><a href="/events">Explore full Calendar</a></button>
                    </div>
                    <div className={`similar-events-cards-container ${similarEventsList.length < 3 ? 'few-cards' : ''}`}>
                        {similarEventsList.length > 0 ? (
                            <div className={`cards-grid ${similarEventsList.length < 3 ? 'few-cards' : ''} ${similarEventsList.length === 1 ? 'single-card' : ''}`} ref={cardsGridRef}>
                                {similarEventsList.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        isLiked={!!likedEvents[event.id]}
                                        onToggleLike={toggleLike}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="no-similar-events-found" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
                                <p style={{ fontFamily: 'Roboto Condensed', fontSize: '20px', fontWeight: '500', color: '#666' }}>
                                    No Similar Events Found
                                </p>
                            </div>
                        )}
                        {similarEventsList.length > 1 && (
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
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default SimilarEvents;