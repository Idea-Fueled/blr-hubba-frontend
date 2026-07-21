import React, { useState, useRef, useEffect, useMemo } from "react";
import "./EventListing.css";
import xIcon from "../../assets/x_icon.png";
import EventCard from "../events/EventCard";
import HorizontalRow from "../HorizontalRow";
import { fetchEvents } from "../../api/eventsApi";
import { mapBackendEventToCard } from "../../utils/eventMappers";
import { SkeletonCard } from "../Loader/Loader";

const STATIC_ZONES = ["Central", "North", "South", "East", "West"];
const MORE_FILTERS = ["Free", "Available", "Multi-Day Events"];

const getLocalDateString = (dateObjOrStr) => {
    const d = new Date(dateObjOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateDateRange = (rawEvents) => {
    if (!rawEvents || rawEvents.length === 0) {
        return [{ label: "All", value: "ALL" }];
    }

    // Find the minimum and maximum dates among the events
    let minDate = null;
    let maxDate = null;

    rawEvents.forEach(e => {
        const start = new Date(e.startDateTime);
        const end = new Date(e.endDateTime || e.startDateTime);

        if (!minDate || start < minDate) minDate = start;
        if (!maxDate || end > maxDate) maxDate = end;
    });

    const dateList = [{ label: "All", value: "ALL" }];

    if (minDate && maxDate) {
        const current = new Date(minDate);
        current.setHours(0, 0, 0, 0);

        const last = new Date(maxDate);
        last.setHours(0, 0, 0, 0);

        while (current <= last) {
            const dayNumber = current.getDate().toString();
            const weekday = current.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

            if (!dateList.some(d => d.value === dayNumber)) {
                dateList.push({
                    day: dayNumber,
                    weekday: weekday,
                    value: dayNumber,
                    dateStr: getLocalDateString(current)
                });
            }

            current.setDate(current.getDate() + 1);
        }
    }

    return dateList;
};

const generateVenues = (mappedEvents) => {
    if (!mappedEvents || mappedEvents.length === 0) return [];
    const venueNames = [];
    mappedEvents.forEach(e => {
        if (e.venues && e.venues.length > 0) {
            e.venues.forEach(v => {
                if (v) venueNames.push(v);
            });
        } else if (e.venue) {
            venueNames.push(e.venue);
        }
    });
    return Array.from(new Set(venueNames)).sort((a, b) => a.localeCompare(b));
};

const generateGenres = (mappedEvents) => {
    if (!mappedEvents || mappedEvents.length === 0) return [];
    const genresSet = new Set();
    mappedEvents.forEach(e => {
        if (e.genres) {
            e.genres.forEach(g => genresSet.add(g));
        }
    });
    return Array.from(genresSet).sort((a, b) => a.localeCompare(b));
};

export const EventListing = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dynamic filters populated from events list
    const [dates, setDates] = useState([{ label: "All", value: "ALL" }]);
    const [genres, setGenres] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [venues, setVenues] = useState([]);
    const [subfestivals, setSubfestivals] = useState([]);
    const [curators, setCurators] = useState(["Abhijit Nath"]);

    // Selection state
    const [selectedDate, setSelectedDate] = useState("ALL");
    const [selectedVenues, setSelectedVenues] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedZones, setSelectedZones] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedMoreFilters, setSelectedMoreFilters] = useState([]);
    const [selectedSubfestivals, setSelectedSubfestivals] = useState([]);
    const [freePassOnly, setFreePassOnly] = useState(false);
    const [donorPassOnly, setDonorPassOnly] = useState(false);
    const [selectedCurators, setSelectedCurators] = useState([]);
    const [likedEvents, setLikedEvents] = useState({});

    // Client-side pagination/load more
    const [visibleCount, setVisibleCount] = useState(6);

    // Accordion expand/collapse state
    const [genreOpen, setGenreOpen] = useState(true);
    const [zonesOpen, setZonesOpen] = useState(true);
    const [languageOpen, setLanguageOpen] = useState(true);
    const [moreFiltersOpen, setMoreFiltersOpen] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const venueRowRef = useRef(null);
    const sentinelRef = useRef(null);
    const [venueScrolledLeft, setVenueScrolledLeft] = useState(false);

    // Fetch filters and events on mount
    useEffect(() => {
        setLoading(true);
        setError(null);

        fetchEvents({ limit: 100 })
            .then(eventsData => {
                // Map events using shared mapping utility
                if (eventsData && eventsData.events) {
                    const mapped = eventsData.events.map(mapBackendEventToCard);
                    
                    // Sort list of events: primarily by start time (earliest to latest), secondarily by duration (shortest to longest)
                    const sorted = [...mapped].sort((a, b) => {
                        const timeA = new Date(a.startDateTime || 0).getTime();
                        const timeB = new Date(b.startDateTime || 0).getTime();
                        if (timeA !== timeB) {
                            return timeA - timeB;
                        }
                        const durationA = a.duration || 0;
                        const durationB = b.duration || 0;
                        return durationA - durationB;
                    });

                    setEvents(sorted);
                    const dynamicDates = generateDateRange(eventsData.events);
                    setDates(dynamicDates);

                    // Generate venues dynamically
                    const dynamicVenues = generateVenues(mapped);
                    setVenues(dynamicVenues);

                    // Generate genres dynamically
                    const dynamicGenres = generateGenres(mapped);
                    setGenres(dynamicGenres);

                    // Generate languages dynamically with base languages Kannada, English, Hindi included
                    const baseLanguages = ["Kannada", "English", "Hindi"];
                    const dynamicLanguages = Array.from(new Set([...baseLanguages, ...mapped.map(e => e.language).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
                    setLanguages(dynamicLanguages);

                    // Generate subfestivals dynamically
                    const dynamicSubfestivals = Array.from(new Set(mapped.map(e => e.subfestivalName).filter(Boolean))).sort((a, b) => a.localeCompare(b));
                    setSubfestivals(dynamicSubfestivals);

                    // Generate curators dynamically with base curators included
                    const baseCurators = ["Abhijit Nath"];
                    const dynamicCurators = Array.from(new Set([...baseCurators, ...mapped.map(e => e.curatedBy).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
                    setCurators(dynamicCurators);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Reset visible count to 6 when filters change
    useEffect(() => {
        setVisibleCount(6);
    }, [
        selectedDate,
        selectedVenues,
        selectedGenres,
        selectedZones,
        selectedLanguages,
        selectedMoreFilters,
        selectedSubfestivals,
        freePassOnly,
        donorPassOnly,
        selectedCurators
    ]);

    // Intersection observer to toggle sticky state
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: [0] }
        );

        observer.observe(sentinel);
        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [loading]);

    // Toggle favorite handler
    const toggleLike = (eventId) => {
        setLikedEvents((prev) => ({
            ...prev,
            [eventId]: !prev[eventId]
        }));
    };

    // Filter selectors helpers
    const handleGenreToggle = (genre) => {
        setSelectedGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        );
    };

    const handleZoneToggle = (zone) => {
        setSelectedZones((prev) =>
            prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
        );
    };

    const handleLanguageToggle = (lang) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
        );
    };

    const handleMoreFilterToggle = (filter) => {
        setSelectedMoreFilters((prev) =>
            prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
        );
    };

    // Reset filters
    const handleResetAll = () => {
        setSelectedDate("ALL");
        setSelectedVenues([]);
        setSelectedGenres([]);
        setSelectedZones([]);
        setSelectedLanguages([]);
        setSelectedMoreFilters([]);
        setSelectedSubfestivals([]);
        setFreePassOnly(false);
        setDonorPassOnly(false);
        setSelectedCurators([]);
    };

    // Filter logic
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            // Date Filter (Multi-day support)
            if (selectedDate !== "ALL") {
                const selectedTab = dates.find(d => d.value === selectedDate);
                if (selectedTab && selectedTab.dateStr) {
                    const targetStr = selectedTab.dateStr;
                    const startStr = getLocalDateString(event.startDateTime);
                    const endStr = getLocalDateString(event.endDateTime || event.startDateTime);

                    if (targetStr < startStr || targetStr > endStr) {
                        return false;
                    }
                } else if (event.date !== selectedDate) {
                    return false;
                }
            }

            // Venue Filter (multi-select)
            if (selectedVenues.length > 0) {
                const matchesVenue = event.venues
                    ? event.venues.some(v => selectedVenues.includes(v))
                    : selectedVenues.includes(event.venue);
                if (!matchesVenue) return false;
            }

            // Genre Filter
            if (selectedGenres.length > 0) {
                const hasGenre = event.genres.some((g) => selectedGenres.includes(g));
                if (!hasGenre) return false;
            }

            // Zone Filter
            if (selectedZones.length > 0 && !selectedZones.includes(event.zone)) return false;

            // Language Filter
            if (selectedLanguages.length > 0 && !selectedLanguages.includes(event.language)) return false;

            // More Filters
            if (selectedMoreFilters.length > 0) {
                if (selectedMoreFilters.includes("Free") && !event.isFree) return false;
                if (selectedMoreFilters.includes("Available") && !event.isAvailable) return false;
                if (selectedMoreFilters.includes("Multi-Day Events") && !event.isMultiDay) return false;
            }

            // Sub-Festival Filter
            if (selectedSubfestivals.length > 0 && !selectedSubfestivals.includes(event.subfestivalName)) return false;

            // Free Pass Filter
            if (freePassOnly && !event.isFree) return false;

            // Donor Pass Filter
            if (donorPassOnly && event.isFree) return false;

            // Curator Filter
            if (selectedCurators.length > 0 && !selectedCurators.includes(event.curatedBy)) return false;

            return true;
        });
    }, [
        events,
        selectedDate,
        dates,
        selectedVenues,
        selectedGenres,
        selectedZones,
        selectedLanguages,
        selectedMoreFilters,
        selectedSubfestivals,
        freePassOnly,
        donorPassOnly,
        selectedCurators
    ]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    // Horizontal scroll venue chip row
    const scrollVenuesRight = () => {
        if (venueRowRef.current) {
            venueRowRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }
    };

    const scrollVenuesLeft = () => {
        if (venueRowRef.current) {
            venueRowRef.current.scrollBy({ left: -200, behavior: "smooth" });
        }
    };

    const handleVenueScroll = () => {
        if (venueRowRef.current) {
            setVenueScrolledLeft(venueRowRef.current.scrollLeft > 10);
        }
    };

    if (error) {
        return (
            <div className="w-full text-center py-32 bg-red-50 rounded-2xl border border-red-100 p-6">
                <p className="text-xl text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    const visibleEvents = useMemo(() => {
        return filteredEvents.slice(0, visibleCount);
    }, [filteredEvents, visibleCount]);

    const showLoadMore = useMemo(() => {
        return filteredEvents.length > visibleCount;
    }, [filteredEvents.length, visibleCount]);

    return (
        <>
            <div className="event-listing-wrapper">
                {/* Header Section */}
                <div className="event-listing-header">
                    <div className="event-listing-header-left">
                        <span className="event-listing-label">EVENT CALENDAR</span>
                        <h2 className="event-listing-heading">
                            Explore upcoming events for Hubba 2027
                        </h2>
                    </div>
                    <button className="download-calendar-btn">DOWNLOAD CALENDAR</button>
                </div>

                <div className="event-listing-content-wrapper">
                    {/* Sentinel for sticky filter row detection */}
                    <div ref={sentinelRef} style={{ height: "1px", margin: "0", padding: "0" }}></div>

                    {/* Date Filter Row */}
                    <div className="venue-date-filter-row">
                        <div className="date-filter-row">
                            {dates.map((date, idx) => {
                                const isActive = selectedDate === date.value;
                                if (date.value === "ALL") {
                                    return (
                                        <button
                                            key={idx}
                                            className={`date-card ${isActive ? "active" : ""}`}
                                            onClick={() => setSelectedDate("ALL")}
                                        >
                                            <span className="date-card-all" style={{ textTransform: "none", fontWeight: 600, fontSize: "24px", lineHeight: "32px" }}>All</span>
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        key={idx}
                                        className={`date-card ${isActive ? "active" : ""}`}
                                        onClick={() => setSelectedDate(date.value)}
                                    >
                                        <div className="date-card-section">
                                            <span className="date-card-day">{date.day}</span>
                                            <span className="date-card-weekday">{date.weekday}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {venues.length > 0 && (
                            <div className="venue-filter-row-container">
                                {isSticky && (
                                    <>
                                        <button className="mobile-filter-trigger-btn" onClick={() => setIsFilterModalOpen(true)} aria-label="Open Filters">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <path d="M16.5 2.25H1.5L7.5 9.345V14.25L10.5 15.75V9.345L16.5 2.25Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </button>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="38" viewBox="0 0 1 38" fill="none" style={{ flexShrink: 0 }}>
                                            <path d="M0.5 38V0" stroke="#6C6C6C" />
                                        </svg>
                                    </>
                                )}
                                <button
                                    className="venue-next-btn"
                                    onClick={scrollVenuesLeft}
                                    aria-label="Previous Venues"
                                    disabled={!venueScrolledLeft}
                                    style={{ opacity: venueScrolledLeft ? 1 : 0.3, cursor: venueScrolledLeft ? "pointer" : "default" }}
                                >
                                    <svg
                                        className="venue-next-svg"
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
                                <div ref={venueRowRef} className="venue-filter-row" onScroll={handleVenueScroll}>
                                    {venues.map((venue) => {
                                        const isSelected = selectedVenues.includes(venue);
                                        return (
                                            <button
                                                key={venue}
                                                className={`venue-chip ${isSelected ? "selected" : ""}`}
                                                onClick={() => setSelectedVenues(prev => isSelected ? prev.filter(v => v !== venue) : [...prev, venue])}
                                            >
                                                <span className="venue-name">{venue}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button className="venue-next-btn" onClick={scrollVenuesRight} aria-label="Next Venues">
                                    <svg
                                        className="venue-next-svg"
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
                        )}
                    </div>
                    {/* Main Layout */}
                    <div className="main-layout">
                        {/* Left Sticky Filters Sidebar */}
                        <aside className="left-filter-sidebar">
                            {/* Filtered By */}
                            <div className="filter-accordion">
                                <span className="filter-section-title">Filtered by</span>
                                <div className="filtered-by-pills" style={{ marginTop: "12px" }}>
                                    {selectedVenues.map((venue) => (
                                        <div key={venue} className="filtered-pill">
                                            <span>{venue}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => setSelectedVenues(prev => prev.filter(v => v !== venue))}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                    {selectedGenres.map((genre) => (
                                        <div key={genre} className="filtered-pill">
                                            <span>{genre}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => handleGenreToggle(genre)}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                    {selectedZones.map((zone) => (
                                        <div key={zone} className="filtered-pill">
                                            <span>{zone}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => handleZoneToggle(zone)}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                    {selectedLanguages.map((lang) => (
                                        <div key={lang} className="filtered-pill">
                                            <span>{lang}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => handleLanguageToggle(lang)}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                    {selectedSubfestivals.map((subfest) => (
                                        <div key={subfest} className="filtered-pill">
                                            <span>{subfest}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => setSelectedSubfestivals(prev => prev.filter(s => s !== subfest))}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                    {freePassOnly && (
                                        <div className="filtered-pill">
                                            <span>Free Pass</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => setFreePassOnly(false)}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    )}
                                    {donorPassOnly && (
                                        <div className="filtered-pill">
                                            <span>Donor Pass</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => setDonorPassOnly(false)}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    )}
                                    {selectedCurators.map((curator) => (
                                        <div key={curator} className="filtered-pill">
                                            <span>{curator}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => setSelectedCurators(prev => prev.filter(c => c !== curator))}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                    {selectedMoreFilters.map((filter) => (
                                        <div key={filter} className="filtered-pill">
                                            <span>{filter}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => handleMoreFilterToggle(filter)}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Genre Section */}
                            {genres.length > 0 && (
                                <div className={`filter-accordion genre-accordion ${genreOpen ? "open" : ""}`}>
                                    <div className="accordion-header" onClick={() => setGenreOpen(!genreOpen)}>
                                        <h4 className="accordion-title">Genre</h4>
                                        <svg
                                            className={`accordion-chevron ${genreOpen ? "open" : ""}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                    {genreOpen && (
                                        <div className="accordion-content">
                                            {genres.map((genre) => {
                                                const isSelected = selectedGenres.includes(genre);
                                                return (
                                                    <button
                                                        key={genre}
                                                        className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                        onClick={() => handleGenreToggle(genre)}
                                                    >
                                                        {genre}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Zones Section */}
                            <div className="filter-accordion">
                                <div className="accordion-header" onClick={() => setZonesOpen(!zonesOpen)}>
                                    <h4 className="accordion-title">Zones</h4>
                                    <svg
                                        className={`accordion-chevron ${zonesOpen ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                {zonesOpen && (
                                    <div className="accordion-content">
                                        {STATIC_ZONES.map((zone) => {
                                            const isSelected = selectedZones.includes(zone);
                                            return (
                                                <button
                                                    key={zone}
                                                    className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                    onClick={() => handleZoneToggle(zone)}
                                                >
                                                    {zone}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Language Section */}
                            {languages.length > 0 && (
                                <div className="filter-accordion">
                                    <div className="accordion-header" onClick={() => setLanguageOpen(!languageOpen)}>
                                        <h4 className="accordion-title">Language</h4>
                                        <svg
                                            className={`accordion-chevron ${languageOpen ? "open" : ""}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                    {languageOpen && (
                                        <div className="accordion-content">
                                            <button
                                                className={`filter-pill ${selectedLanguages.length === 0 ? "selected" : ""}`}
                                                onClick={() => setSelectedLanguages([])}
                                            >
                                                All
                                            </button>
                                            {languages.map((lang) => {
                                                const isSelected = selectedLanguages.includes(lang);
                                                return (
                                                    <button
                                                        key={lang}
                                                        className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                        onClick={() => handleLanguageToggle(lang)}
                                                    >
                                                        {lang}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* More Filters Section */}
                            <div className="filter-accordion">
                                <div className="accordion-header" onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}>
                                    <h4 className="accordion-title">More Filters</h4>
                                    <svg
                                        className={`accordion-chevron ${moreFiltersOpen ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                {moreFiltersOpen && (
                                    <div className="accordion-content" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                                        {/* Status Group */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Status & Duration</span>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                {MORE_FILTERS.map((filter) => {
                                                    const isSelected = selectedMoreFilters.includes(filter);
                                                    return (
                                                        <button
                                                            key={filter}
                                                            className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                            onClick={() => handleMoreFilterToggle(filter)}
                                                        >
                                                            {filter}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Passes Group */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Pass Types</span>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                <button
                                                    className={`filter-pill ${freePassOnly ? "selected" : ""}`}
                                                    onClick={() => setFreePassOnly(!freePassOnly)}
                                                >
                                                    Free Pass
                                                </button>
                                                <button
                                                    className={`filter-pill ${donorPassOnly ? "selected" : ""}`}
                                                    onClick={() => setDonorPassOnly(!donorPassOnly)}
                                                >
                                                    Donor Pass
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sub-Festival Group */}
                                        {subfestivals.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                                <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Sub-Festivals</span>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                    <button
                                                        className={`filter-pill ${selectedSubfestivals.length === 0 ? "selected" : ""}`}
                                                        onClick={() => setSelectedSubfestivals([])}
                                                    >
                                                        All
                                                    </button>
                                                    {subfestivals.map((subfest) => {
                                                        const isSelected = selectedSubfestivals.includes(subfest);
                                                        return (
                                                            <button
                                                                key={subfest}
                                                                className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                                onClick={() => {
                                                                    setSelectedSubfestivals(prev =>
                                                                        prev.includes(subfest)
                                                                            ? prev.filter(s => s !== subfest)
                                                                            : [...prev, subfest]
                                                                    );
                                                                }}
                                                            >
                                                                {subfest}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Curator Group */}
                                        {curators.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                                <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Curators</span>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                    <button
                                                        className={`filter-pill ${selectedCurators.length === 0 ? "selected" : ""}`}
                                                        onClick={() => setSelectedCurators([])}
                                                    >
                                                        All
                                                    </button>
                                                    {curators.map((curator) => {
                                                        const isSelected = selectedCurators.includes(curator);
                                                        return (
                                                            <button
                                                                key={curator}
                                                                className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                                onClick={() => {
                                                                    setSelectedCurators(prev =>
                                                                        prev.includes(curator)
                                                                            ? prev.filter(c => c !== curator)
                                                                            : [...prev, curator]
                                                                    );
                                                                }}
                                                            >
                                                                {curator}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Reset Button */}
                            <button className="reset-filters-btn" onClick={handleResetAll}>
                                RESET ALL FILTERS
                            </button>
                        </aside>

                        {/* Right Content Area */}
                        <main className="right-content-area">
                            {loading ? (
                                <div className="events-grid">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <SkeletonCard key={i} className="skeleton-event-card" />
                                    ))}
                                </div>
                            ) : filteredEvents.length > 0 ? (
                                <>
                                    {/* Events Grid */}
                                    <div className="events-grid">
                                        {visibleEvents.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                isLiked={!!likedEvents[event.id]}
                                                onToggleLike={toggleLike}
                                            />
                                        ))}
                                    </div>

                                    {/* Dynamic Load More button */}
                                    {showLoadMore && (
                                        <div className="load-more-container">
                                            <button className="load-more-btn" onClick={handleLoadMore}>LOAD MORE</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-events-found" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '300px' }}>
                                    <p style={{ fontFamily: 'Roboto Condensed', fontSize: '24px', fontWeight: '600', color: '#000', margin: '0 0 16px 0' }}>No Events Found</p>
                                    <button
                                        className="reset-filters-btn-inline"
                                        style={{
                                            display: 'flex',
                                            height: '44px',
                                            padding: '16px 24px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: '8px',
                                            border: '2px solid #000',
                                            background: '#FDFF53',
                                            color: '#000',
                                            fontFamily: 'Roboto Condensed',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleResetAll}
                                    >
                                        RESET ALL FILTERS
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
            <HorizontalRow />

            {/* Filter Modal Bottom Sheet */}
            {isFilterModalOpen && (
                <div className="mobile-filter-backdrop" onClick={() => setIsFilterModalOpen(false)}>
                    <div className="mobile-filter-bottom-sheet" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bottom-sheet-header">
                            <span className="bottom-sheet-title">Filters</span>
                            <button className="bottom-sheet-close-btn" onClick={() => setIsFilterModalOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="bottom-sheet-content">
                            {/* Active Pills */}
                            {(selectedVenues.length > 0 || selectedGenres.length > 0 || selectedLanguages.length > 0 || selectedMoreFilters.length > 0 || selectedSubfestivals.length > 0 || freePassOnly || donorPassOnly || selectedCurators.length > 0) && (
                                <div className="bottom-sheet-section">
                                    <span className="bottom-sheet-section-label">Filtered by</span>
                                    <div className="filtered-by-pills" style={{ marginTop: "12px" }}>
                                        {selectedVenues.map((venue) => (
                                            <div key={venue} className="filtered-pill">
                                                <span>{venue}</span>
                                                <span className="filtered-pill-close" onClick={() => setSelectedVenues(prev => prev.filter(v => v !== venue))}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        ))}
                                        {selectedGenres.map((genre) => (
                                            <div key={genre} className="filtered-pill">
                                                <span>{genre}</span>
                                                <span className="filtered-pill-close" onClick={() => handleGenreToggle(genre)}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        ))}
                                        {selectedLanguages.map((lang) => (
                                            <div key={lang} className="filtered-pill">
                                                <span>{lang}</span>
                                                <span className="filtered-pill-close" onClick={() => handleLanguageToggle(lang)}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        ))}
                                        {selectedSubfestivals.map((subfest) => (
                                            <div key={subfest} className="filtered-pill">
                                                <span>{subfest}</span>
                                                <span className="filtered-pill-close" onClick={() => setSelectedSubfestivals(prev => prev.filter(s => s !== subfest))}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        ))}
                                        {freePassOnly && (
                                            <div className="filtered-pill">
                                                <span>Free Pass</span>
                                                <span className="filtered-pill-close" onClick={() => setFreePassOnly(false)}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        )}
                                        {donorPassOnly && (
                                            <div className="filtered-pill">
                                                <span>Donor Pass</span>
                                                <span className="filtered-pill-close" onClick={() => setDonorPassOnly(false)}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        )}
                                        {selectedCurators.map((curator) => (
                                            <div key={curator} className="filtered-pill">
                                                <span>{curator}</span>
                                                <span className="filtered-pill-close" onClick={() => setSelectedCurators(prev => prev.filter(c => c !== curator))}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        ))}
                                        {selectedMoreFilters.map((filter) => (
                                            <div key={filter} className="filtered-pill">
                                                <span>{filter}</span>
                                                <span className="filtered-pill-close" onClick={() => handleMoreFilterToggle(filter)}>
                                                    <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Genre Accordion */}
                            {genres.length > 0 && (
                                <div className={`filter-accordion genre-accordion ${genreOpen ? "open" : ""}`}>
                                    <div className="accordion-header" onClick={() => setGenreOpen(!genreOpen)}>
                                        <h4 className="accordion-title">Genre</h4>
                                        <svg className={`accordion-chevron ${genreOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                    {genreOpen && (
                                        <div className="accordion-content">
                                            <div className="pills-grid">
                                                {genres.map((genre) => {
                                                    const isSelected = selectedGenres.includes(genre);
                                                    return (
                                                        <button key={genre} className={`filter-pill ${isSelected ? "selected" : ""}`} onClick={() => handleGenreToggle(genre)}>
                                                            {genre}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Language Accordion */}
                            {languages.length > 0 && (
                                <div className="filter-accordion">
                                    <div className="accordion-header" onClick={() => setLanguageOpen(!languageOpen)}>
                                        <h4 className="accordion-title">Language</h4>
                                        <svg className={`accordion-chevron ${languageOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                    {languageOpen && (
                                        <div className="accordion-content">
                                            <div className="pills-grid">
                                                <button
                                                    className={`filter-pill ${selectedLanguages.length === 0 ? "selected" : ""}`}
                                                    onClick={() => setSelectedLanguages([])}
                                                >
                                                    All
                                                </button>
                                                {languages.map((lang) => {
                                                    const isSelected = selectedLanguages.includes(lang);
                                                    return (
                                                        <button key={lang} className={`filter-pill ${isSelected ? "selected" : ""}`} onClick={() => handleLanguageToggle(lang)}>
                                                            {lang}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* More Filters Accordion */}
                            <div className="filter-accordion">
                                <div className="accordion-header" onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}>
                                    <h4 className="accordion-title">More Filters</h4>
                                    <svg className={`accordion-chevron ${moreFiltersOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                {moreFiltersOpen && (
                                    <div className="accordion-content" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                                        {/* Status Group */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Status & Duration</span>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                {MORE_FILTERS.map((filter) => {
                                                    const isSelected = selectedMoreFilters.includes(filter);
                                                    return (
                                                        <button key={filter} className={`filter-pill ${isSelected ? "selected" : ""}`} onClick={() => handleMoreFilterToggle(filter)}>
                                                            {filter}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Passes Group */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Pass Types</span>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                <button
                                                    className={`filter-pill ${freePassOnly ? "selected" : ""}`}
                                                    onClick={() => setFreePassOnly(!freePassOnly)}
                                                >
                                                    Free Pass
                                                </button>
                                                <button
                                                    className={`filter-pill ${donorPassOnly ? "selected" : ""}`}
                                                    onClick={() => setDonorPassOnly(!donorPassOnly)}
                                                >
                                                    Donor Pass
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sub-Festival Group */}
                                        {subfestivals.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                                <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Sub-Festivals</span>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                    <button
                                                        className={`filter-pill ${selectedSubfestivals.length === 0 ? "selected" : ""}`}
                                                        onClick={() => setSelectedSubfestivals([])}
                                                    >
                                                        All
                                                    </button>
                                                    {subfestivals.map((subfest) => {
                                                        const isSelected = selectedSubfestivals.includes(subfest);
                                                        return (
                                                            <button
                                                                key={subfest}
                                                                className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                                onClick={() => {
                                                                    setSelectedSubfestivals(prev =>
                                                                        prev.includes(subfest)
                                                                            ? prev.filter(s => s !== subfest)
                                                                            : [...prev, subfest]
                                                                    );
                                                                }}
                                                            >
                                                                {subfest}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Curator Group */}
                                        {curators.length > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                                                <span style={{ fontSize: "12px", fontWeight: "600", fontFamily: "Roboto Condensed", textTransform: "uppercase", color: "#6C6C6C" }}>Curators</span>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                    <button
                                                        className={`filter-pill ${selectedCurators.length === 0 ? "selected" : ""}`}
                                                        onClick={() => setSelectedCurators([])}
                                                    >
                                                        All
                                                    </button>
                                                    {curators.map((curator) => {
                                                        const isSelected = selectedCurators.includes(curator);
                                                        return (
                                                            <button
                                                                key={curator}
                                                                className={`filter-pill ${isSelected ? "selected" : ""}`}
                                                                onClick={() => {
                                                                    setSelectedCurators(prev =>
                                                                        prev.includes(curator)
                                                                            ? prev.filter(c => c !== curator)
                                                                            : [...prev, curator]
                                                                    );
                                                                }}
                                                            >
                                                                {curator}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bottom-sheet-actions">
                            <button className="bottom-sheet-apply-btn" onClick={() => setIsFilterModalOpen(false)}>APPLY</button>
                            <button className="bottom-sheet-reset-btn" onClick={() => { handleResetAll(); setIsFilterModalOpen(false); }}>RESET</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventListing;
