import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpotlightEvents.css";
import { fetchSpotlightEvents, toggleWishlistApi } from "../../api/eventsApi";
import { mapBackendEventToSpotlight } from "../../utils/eventMappers";
import { SkeletonCard } from "../Loader/Loader";
import { EventCard } from "../events/EventCard";

const SpotlightCardLarge = ({ event }) => {
    return <EventCard event={event} />;
};

const SpotlightEvents = ({ subtitle = "SPOTLIGHT EVENTS", title = "Handpicked for you today", isHomepage = false }) => {
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

    const contentNode = (
        <section className="spotlight-events-section">
            {/* Header */}
            <div className="spotlight-header">
                <span className="spotlight-subtitle">{subtitle}</span>
                <h2 className="spotlight-heading">{title}</h2>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="nav-arrow-btn"
                    aria-label="Next Spotlight Event"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M12 19L19 12L12 5" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </section>
    );

    if (loading) {
        const loadingContent = (
            <section className="spotlight-events-section">
                <div className="spotlight-header">
                    <span className="spotlight-subtitle">{subtitle}</span>
                    <h2 className="spotlight-heading">{title}</h2>
                </div>
                <div className="spotlight-carousel-viewport" style={{ padding: "0 20px" }}>
                    <SkeletonCard className="skeleton-spotlight-card" />
                </div>
            </section>
        );
        return isHomepage ? <div className="spotlight-events-wrapper">{loadingContent}</div> : loadingContent;
    }

    if (error || events.length === 0) {
        return null;
    }

    return isHomepage ? (
        <div className="spotlight-events-wrapper">{contentNode}</div>
    ) : (
        contentNode
    );
};

export default SpotlightEvents;
