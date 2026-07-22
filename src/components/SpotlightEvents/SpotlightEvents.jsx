import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpotlightEvents.css";
import heartIcon from "../../assets/heart_icon.png";
import { fetchSpotlightEvents } from "../../api/eventsApi";
import { mapBackendEventToSpotlight, formatVenueDisplay, formatEventTiming } from "../../utils/eventMappers";
import { SkeletonCard } from "../Loader/Loader";

const formatSpotlightTime = (timeStr) => {
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

const HeartIcon = () => {
    const [liked, setLiked] = useState(false);
    return (
        <button
            className={`heart-btn ${liked ? "liked" : ""}`}
            onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
            }}
            aria-label="Favorite event"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#CF398E" : "none"} stroke={liked ? "#CF398E" : "black"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="heart-icon-img">
                <path d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z" />
            </svg>
        </button>
    );
};

const DateBadge = ({ date, month }) => (
    <div className="date-badge">
        <span className="date-badge-day">{date}</span>
        <span className="date-badge-month">{month}</span>
    </div>
);

const GenrePills = ({ genres }) => (
    <div className="genre-pills">
        {genres && genres.map((genre, idx) => (
            <span key={idx} className="genre-pill-content">{genre}</span>
        ))}
    </div>
);

const SpotlightCardLarge = ({ event, onNavigate }) => {
    const { id, slug, title, performer, venue, venues, showCount, subfestivalName, time, date, month, image, genres } = event;
    return (
        <div 
            className="spotlight-card-large"
            onClick={() => onNavigate(slug || id)}
            style={{ cursor: "pointer" }}
        >
            {/* Left side Image */}
            <div className="spotlight-card-container">
                <div className="large-card-left">
                    <img src={image} alt={title} className="large-card-img" />
                    <HeartIcon />
                </div>

                {/* Right side Content */}
                <div className="large-card-right">
                    <div className="large-card-right-container">
                        <div className="large-card-top-row">
                            <DateBadge date={date} month={month} />
                            <div className="large-card-venue-time">
                                <span className="large-card-venue">
                                    {venues && venues.length > 1
                                        ? `${venues.length} Hubba Venues Across Bengaluru`
                                        : formatVenueDisplay(venues || [venue])}
                                </span>
                                <div className="venue-time-divider"></div>
                                <span className="large-card-time">
                                    {formatEventTiming(showCount, subfestivalName) || formatSpotlightTime(time)}
                                </span>
                            </div>
                        </div>
                        <div className="large-card-middle">
                            <GenrePills genres={genres} />
                            <div className="middle-content-container">
                                <h3 className="event-title">{title}</h3>
                                <p className="performer-name">{performer}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-cta-button-container">
                        <button 
                            className="view-book-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(slug || id);
                            }}
                        >
                            VIEW &amp; BOOK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpotlightEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [index, setIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isAutoPaused, setIsAutoPaused] = useState(false);
    const carouselRef = useRef(null);

    const lastWheelTime = useRef(0);
    const dragStart = useRef(0);
    const isDragging = useRef(false);
    const dragOccurred = useRef(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        fetchSpotlightEvents()
            .then(data => {
                if (data.events && data.events.length > 0) {
                    setEvents(data.events.map(mapBackendEventToSpotlight));
                } else {
                    setEvents([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Repeat events if they are fewer than 5 to make infinite scroll smooth
    const virtualEvents = events.length > 0 && events.length < 5
        ? (events.length === 2 
            ? [...events, ...events, ...events] 
            : [...events, ...events])
        : events;

    const clonesCount = virtualEvents.length > 0 ? Math.min(virtualEvents.length, 3) : 0;
    const lastClones = virtualEvents.slice(-clonesCount);
    const firstClones = virtualEvents.slice(0, clonesCount);
    const displayEvents = [...lastClones, ...virtualEvents, ...firstClones];

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchDeltaX = useRef(0);

    useEffect(() => {
        if (!isTransitioning) {
            const raf = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                });
            });
            return () => cancelAnimationFrame(raf);
        }
    }, [isTransitioning]);

    const handleTransitionEnd = (e) => {
        if (e.target !== carouselRef.current) return;
        if (index >= virtualEvents.length) {
            setIsTransitioning(false);
            setIndex(0);
        } else if (index < 0) {
            setIsTransitioning(false);
            setIndex(virtualEvents.length - 1);
        }
    };

    const scroll = (direction) => {
        if (!isTransitioning || index < -clonesCount || index > virtualEvents.length + clonesCount) return;

        if (direction === "left") {
            setIndex(prev => prev - 1);
        } else {
            setIndex(prev => prev + 1);
        }
    };

    scrollRef.current = scroll;

    useEffect(() => {
        if (loading || virtualEvents.length <= 1 || isAutoPaused) return;

        const intervalId = window.setInterval(() => {
            if (document.hidden || !scrollRef.current) return;
            scrollRef.current("right");
        }, 3000);

        return () => window.clearInterval(intervalId);
    }, [loading, virtualEvents.length, isAutoPaused]);

    // Manual non-passive wheel event listener to handle touchpad swipe gestures on desktop
    useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                const now = Date.now();
                if (now - lastWheelTime.current < 800) return;

                if (e.deltaX > 15) {
                    scrollRef.current("right");
                    lastWheelTime.current = now;
                } else if (e.deltaX < -15) {
                    scrollRef.current("left");
                    lastWheelTime.current = now;
                }
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, [virtualEvents]);

    const handlePointerDown = (e) => {
        setIsAutoPaused(true);
        if (e.button !== 0) return;
        dragStart.current = e.clientX;
        isDragging.current = true;
        dragOccurred.current = false;
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const diff = e.clientX - dragStart.current;

        if (Math.abs(diff) > 40) {
            const now = Date.now();
            if (now - lastWheelTime.current > 400) {
                if (diff < 0) {
                    scrollRef.current("right");
                } else {
                    scrollRef.current("left");
                }
                lastWheelTime.current = now;
                dragOccurred.current = true;
            }
            isDragging.current = false;
        }
    };

    const handlePointerUp = (e) => {
        isDragging.current = false;
        setIsAutoPaused(false);
        setTimeout(() => { dragOccurred.current = false; }, 100);
    };

    const handleTouchStart = (e) => {
        setIsAutoPaused(true);
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchDeltaX.current = 0;
    };

    const handleTouchMove = (e) => {
        if (e.touches && e.touches.length > 0) {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - touchStartX.current;
            const diffY = currentY - touchStartY.current;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                touchDeltaX.current = diffX;
            }
        }
    };

    const handleTouchEnd = () => {
        setIsAutoPaused(false);
        if (Math.abs(touchDeltaX.current) > 30) {
            dragOccurred.current = true;
            if (touchDeltaX.current < 0) {
                scroll("right");
            } else {
                scroll("left");
            }
            setTimeout(() => { dragOccurred.current = false; }, 100);
        }
        touchDeltaX.current = 0;
    };

    const handleCardNavigate = (slugOrId) => {
        if (dragOccurred.current) return;
        navigate(`/events/${slugOrId}`);
    };

    if (loading) {
        return (
            <main>
                <section className="spotlight-events-section">
                    <div className="spotlight-header">
                        <span className="spotlight-subtitle">EXPLORE</span>
                        <h2 className="spotlight-heading">Spotlight Events</h2>
                    </div>
                    <div className="spotlight-carousel-viewport" style={{ padding: "0 20px" }}>
                        <SkeletonCard className="skeleton-spotlight-card" />
                    </div>
                </section>
            </main>
        );
    }

    if (error || events.length === 0) {
        return null;
    }

    return (
        <main>
            <section className="spotlight-events-section">
                {/* Header */}
                <div className="spotlight-header">
                    <span className="spotlight-subtitle">IPSUM DOLOR SIT</span>
                    <h2 className="spotlight-heading">Spotlight Events</h2>
                </div>

                {/* Carousel Viewport Wrapper */}
                <div className="spotlight-carousel-viewport">
                    <div
                        ref={carouselRef}
                        className="spotlight-carousel"
                        onMouseEnter={() => setIsAutoPaused(true)}
                        onMouseLeave={() => setIsAutoPaused(false)}
                        onFocus={() => setIsAutoPaused(true)}
                        onBlur={() => setIsAutoPaused(false)}
                        style={{
                            "--current-index": index + clonesCount,
                            transition: isTransitioning ? undefined : "none",
                            userSelect: "none",
                            touchAction: "pan-y"
                        }}
                        onTransitionEnd={handleTransitionEnd}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {displayEvents.map((event, idx) => {
                            return (
                                <div key={`${event.id}-${idx}`} className="spotlight-carousel-box">
                                    <SpotlightCardLarge event={event} onNavigate={handleCardNavigate} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="spotlight-navigation">
                    <button
                        onClick={() => scroll("left")}
                        className="nav-arrow-btn"
                        aria-label="Previous Spotlight Event"
                    >
                        <svg
                            className="nav-arrow-svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="nav-arrow-btn"
                        aria-label="Next Spotlight Event"
                    >
                        <svg
                            className="nav-arrow-svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </section>
        </main>
    );
};

export default SpotlightEvents;
