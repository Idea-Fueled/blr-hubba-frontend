import React, { useState, useEffect } from "react";
import { EventCard } from "../events/EventCard";
import { fetchEvents } from "../../api/eventsApi";
import { mapBackendEventToCard } from "../../utils/eventMappers";
import { SkeletonCard } from "../Loader/Loader";
import { useNavigate } from "react-router-dom";
import "./BrowseEvents.css";

export const BrowseEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchEvents({ limit: 12 })
            .then((data) => {
                if (data && data.events && data.events.length > 0) {
                    const mapped = data.events.map(mapBackendEventToCard);
                    setEvents(mapped);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch browse events:", err);
                setLoading(false);
            });
    }, []);

    return (
        <section className="browse-events-main-container">
            {/* ================= HEADER ================= */}

            <div className="browse-events-header-row">
                <h2 className="browse-events-title">Browse Events</h2>

                <button
                    className="browse-events-calendar-btn"
                    onClick={() => navigate("/events")}
                >
                    EXPLORE FULL CALENDAR
                </button>
            </div>

            {/* ================= CARDS ================= */}

            <div className="browse-events-cards-row">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    events.slice(0, 4).map((evt) => (
                        <EventCard key={evt.id} event={evt} />
                    ))
                )}
            </div>

            {/* ================= NAV ARROWS ================= */}

            <div className="browse-events-nav">
                <button
                    className="browse-events-nav-btn"
                    aria-label="previous events"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 5L5 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button
                    className="browse-events-nav-btn"
                    aria-label="next events"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M12 19L19 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default BrowseEvents;