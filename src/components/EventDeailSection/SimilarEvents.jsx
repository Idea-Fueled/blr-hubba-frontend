import React, { useState, useRef, useEffect } from "react";
import { MotionSection } from "../AnimatedPage";
import "./SimilarEvents.css";
import EventCard from "../events/EventCard";
import { fetchEvents } from "../../api/eventsApi";
import { mapBackendEventToCard } from "../../utils/eventMappers";
import { useNavigate } from "react-router-dom";

const SimilarEvents = ({ currentEvent }) => {
    const navigate = useNavigate();
    const [similarEventsList, setSimilarEventsList] = useState([]);
    const [isScrollable, setIsScrollable] = useState(false);
    const carouselRef = useRef(null);

    useEffect(() => {
        if (!currentEvent) return;

        // Extract genre names for current event
        const currentGenres = (currentEvent.genres || [])
            .map(g => typeof g === 'string' ? g : (g.genre?.name || g.name))
            .filter(Boolean);

        if (currentGenres.length === 0 && currentEvent.genre) {
            const single = typeof currentEvent.genre === 'string' ? currentEvent.genre : (currentEvent.genre.name || currentEvent.genre.title);
            if (single) currentGenres.push(single);
        }

        // Fetch events list and filter by SAME genre
        fetchEvents({ limit: 30, includePast: true })
            .then(data => {
                if (data.events) {
                    let matchingEvents = data.events.filter(e => {
                        if (e.id === currentEvent.id) return false;

                        const eGenres = (e.genres || [])
                            .map(g => typeof g === 'string' ? g : (g.genre?.name || g.name))
                            .filter(Boolean);

                        if (e.genre) {
                            const s = typeof e.genre === 'string' ? e.genre : (e.genre.name || e.genre.title);
                            if (s) eGenres.push(s);
                        }

                        if (currentGenres.length === 0) return true;

                        return eGenres.some(g =>
                            currentGenres.some(cg => cg.toLowerCase() === g.toLowerCase())
                        );
                    });

                    // Fallback to non-current events if no genre match found
                    if (matchingEvents.length === 0) {
                        matchingEvents = data.events.filter(e => e.id !== currentEvent.id);
                    }

                    const mappedEvents = matchingEvents.map(mapBackendEventToCard);

                    // Robust helper to get timestamp for sorting
                    const getEventTimestamp = (item) => {
                        if (!item) return 0;
                        if (item.startDateTime) {
                            const d = new Date(item.startDateTime);
                            if (!isNaN(d.getTime())) return d.getTime();
                        }
                        if (item.startDate) {
                            const d = new Date(item.startDate);
                            if (!isNaN(d.getTime())) return d.getTime();
                        }
                        if (Array.isArray(item.eventDates) && item.eventDates.length > 0) {
                            for (const ed of item.eventDates) {
                                const raw = ed.startDateTime || ed.date || ed.dateTime;
                                if (raw) {
                                    const d = new Date(raw);
                                    if (!isNaN(d.getTime())) return d.getTime();
                                }
                            }
                        }
                        // Fallback parsing from month and displayDate/date
                        if (item.month || item.displayDate || item.date) {
                            const monthMap = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
                            let monthIdx = 0;
                            if (item.month && monthMap[item.month.toUpperCase()] !== undefined) {
                                monthIdx = monthMap[item.month.toUpperCase()];
                            }
                            let dayNum = 1;
                            const dateSource = item.displayDate || item.date || "";
                            const match = String(dateSource).match(/\d+/);
                            if (match) dayNum = parseInt(match[0], 10);
                            return new Date(2027, monthIdx, dayNum).getTime();
                        }
                        return 0;
                    };

                    // Sort mapped events in ascending order by start date & time (earliest event first)
                    mappedEvents.sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b));

                    setSimilarEventsList(mappedEvents);
                }
            })
            .catch(err => {
                console.error("Error fetching similar events by genre:", err);
            });
    }, [currentEvent]);

    const checkScrollable = () => {
        if (carouselRef.current) {
            const el = carouselRef.current;
            setIsScrollable(el.scrollWidth > el.clientWidth);
        }
    };

    useEffect(() => {
        checkScrollable();
        window.addEventListener("resize", checkScrollable);
        const timer = setTimeout(checkScrollable, 200);
        return () => {
            window.removeEventListener("resize", checkScrollable);
            clearTimeout(timer);
        };
    }, [similarEventsList]);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -314, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 314, behavior: "smooth" });
        }
    };

    if (!similarEventsList || similarEventsList.length === 0) {
        return null;
    }

    return (
        <MotionSection className="venue-similar-events-section" variant="slideUp">
            <div className="venue-similar-events-container">
                {/* Header Row */}
                <div className="venue-similar-events-header">
                    <h2 className="venue-similar-events-title">Similar Events</h2>
                    <button
                        className="venue-similar-explore-btn"
                        onClick={() => navigate("/events")}
                    >
                        <span className="btn-text-primary">EXPLORE FULL CALENDAR</span>
                        <span className="btn-text-secondary">EXPLORE FULL CALENDAR</span>
                    </button>
                </div>

                {/* Carousel Row */}
                <div className="venue-similar-carousel-wrapper">
                    <div className="venue-similar-carousel" ref={carouselRef}>
                        {similarEventsList.map((evt, idx) => (
                            <div className="venue-similar-card-item" key={evt.id || idx}>
                                <EventCard event={evt} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carousel Navigation Controls */}
                {isScrollable && (
                    <div className="venue-similar-controls">
                        <button className="venue-similar-nav-btn" onClick={scrollLeft} aria-label="Previous">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="venue-similar-nav-btn" onClick={scrollRight} aria-label="Next">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </MotionSection>
    );
};

export default SimilarEvents;