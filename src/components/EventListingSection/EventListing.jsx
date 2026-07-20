import React, { useState, useRef } from "react";
import "./EventListing.css";
import xIcon from "../../assets/x_icon.png";
import EventCard from "../events/EventCard";
import HorizontalRow from "../HorizontalRow";

export const DUMMY_EVENTS = [
    {
        id: "ev-1",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "Freedom Park",
        displayVenue: "Freedom Park, Panchavati +2",
        time: "11:00 am - 1:00 pm",
        date: "16",
        displayDate: "16-24",
        month: "JAN",
        weekday: "FRI",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60",
        genres: ["Music", "Genre 2", "Genre 3"],
        isFree: true,
        isAvailable: true,
        isMultiDay: false,
        zone: "Central",
        language: "English"
    },
    {
        id: "ev-2",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "Bangalore International Centre (BIC)",
        displayVenue: "Freedom Park, Panchavati +2",
        time: "11:00 am - 1:00 pm",
        date: "16",
        displayDate: "16-24",
        month: "JAN",
        weekday: "FRI",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
        genres: ["Music", "Genre 2", "Genre 3"],
        isFree: false,
        isAvailable: true,
        isMultiDay: false,
        zone: "East",
        language: "Kannada"
    },
    {
        id: "ev-3",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "National Gallery of Modern Art (NGMA)",
        displayVenue: "Freedom Park, Panchavati +2",
        time: "11:00 am - 1:00 pm",
        date: "17",
        displayDate: "16-24",
        month: "JAN",
        weekday: "SAT",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 1", "Genre 2"],
        isFree: true,
        isAvailable: false,
        isMultiDay: true,
        zone: "Central",
        language: "English"
    },
    {
        id: "ev-4",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "Prestige Centre for Performing Arts (PCPA)",
        displayVenue: "Freedom Park, Panchavati +2",
        time: "11:00 am - 1:00 pm",
        date: "18",
        displayDate: "16-24",
        month: "JAN",
        weekday: "SUN",
        image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 1", "Genre 3"],
        isFree: false,
        isAvailable: true,
        isMultiDay: false,
        zone: "South",
        language: "Hindi"
    },
    {
        id: "ev-5",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "Freedom Park",
        displayVenue: "Freedom Park, Panchavati +2",
        time: "11:00 am - 1:00 pm",
        date: "19",
        displayDate: "16-24",
        month: "JAN",
        weekday: "MON",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60",
        genres: ["Music", "Genre 2"],
        isFree: true,
        isAvailable: true,
        isMultiDay: true,
        zone: "Central",
        language: "English"
    },
    {
        id: "ev-6",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "Bangalore International Centre (BIC)",
        displayVenue: "Freedom Park, Panchavati +2",
        time: "11:00 am - 1:00 pm",
        date: "20",
        displayDate: "16-24",
        month: "JAN",
        weekday: "TUE",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 2", "Genre 3"],
        isFree: false,
        isAvailable: true,
        isMultiDay: false,
        zone: "East",
        language: "Kannada"
    }
];

const DATES = [
    { label: "All", value: "ALL" },
    { day: "15", weekday: "FRI", value: "15" },
    { day: "16", weekday: "SAT", value: "16" },
    { day: "17", weekday: "SUN", value: "17" },
    { day: "18", weekday: "MON", value: "18" },
    { day: "19", weekday: "TUE", value: "19" },
    { day: "20", weekday: "WED", value: "20" },
    { day: "21", weekday: "THU", value: "21" },
    { day: "22", weekday: "FRI", value: "22" },
    { day: "23", weekday: "SAT", value: "23" },
    { day: "24", weekday: "SUN", value: "24" }
];

const GENRES = ["Genre 1", "Genre 2", "Genre 3", "Genre 4", "Genre 5", "Genre 6", "Genre 7", "Genre 8"];
const ZONES = ["Central", "North", "South", "East", "West"];
const LANGUAGES = ["English", "Kannada", "Hindi"];
const VENUES = [
    "Freedom Park",
    "Bangalore International Centre (BIC)",
    "National Gallery of Modern Art (NGMA)",
    "Prestige Centre for Performing Arts (PCPA)"
];
const MORE_FILTERS = ["Free", "Available", "Multi-Day Events", "Filter 4", "Filter 5", "Filter 6", "Filter 7"];

export const EventListing = () => {
    // Selection state
    const [selectedDate, setSelectedDate] = useState("ALL");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedZones, setSelectedZones] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedMoreFilters, setSelectedMoreFilters] = useState([]);
    const [likedEvents, setLikedEvents] = useState({});

    // Accordion expand/collapse state
    const [genreOpen, setGenreOpen] = useState(true);
    const [zonesOpen, setZonesOpen] = useState(false);
    const [languageOpen, setLanguageOpen] = useState(false);
    const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

    const venueRowRef = useRef(null);

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
        setSelectedVenue("");
        setSelectedGenres([]);
        setSelectedZones([]);
        setSelectedLanguages([]);
        setSelectedMoreFilters([]);
    };

    // Filter logic
    const filteredEvents = DUMMY_EVENTS.filter((event) => {
        // Date Filter
        if (selectedDate !== "ALL" && event.date !== selectedDate) return false;

        // Venue Filter
        if (selectedVenue && event.venue !== selectedVenue) return false;

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

        return true;
    });

    // Horizontal scroll venue chip row
    const scrollVenuesRight = () => {
        if (venueRowRef.current) {
            venueRowRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }
    };

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
                    {/* Date Filter Row */}
                    <div className="venue-date-filter-row">
                        <div className="date-filter-row">
                            {DATES.map((date, idx) => {
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
                        <div className="venue-filter-row-container">
                            <div ref={venueRowRef} className="venue-filter-row">
                                {VENUES.map((venue) => {
                                    const isSelected = selectedVenue === venue;
                                    return (
                                        <button
                                            key={venue}
                                            className={`venue-chip ${isSelected ? "selected" : ""}`}
                                            onClick={() => setSelectedVenue(isSelected ? "" : venue)}
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
                    </div>
                    {/* Main Layout */}
                    <div className="main-layout">
                        {/* Left Sticky Filters Sidebar */}
                        <aside className="left-filter-sidebar">
                            {/* Filtered By */}
                            <div className="filter-accordion">
                                <span className="filter-section-title">Filtered by</span>
                                <div className="filtered-by-pills" style={{ marginTop: "12px" }}>
                                    {selectedVenue && (
                                        <div className="filtered-pill">
                                            <span>{selectedVenue}</span>
                                            <span
                                                className="filtered-pill-close"
                                                onClick={() => setSelectedVenue("")}
                                            >
                                                <img src={xIcon} alt="close" style={{ width: "10px", height: "10px" }} />
                                            </span>
                                        </div>
                                    )}
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
                            <div className="filter-accordion">
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
                                        {GENRES.map((genre) => {
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
                                        {ZONES.map((zone) => {
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
                                        {LANGUAGES.map((lang) => {
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
                                    <div className="accordion-content">
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
                                )}
                            </div>

                            {/* Reset Button */}
                            <button className="reset-filters-btn" onClick={handleResetAll}>
                                RESET ALL FILTERS
                            </button>
                        </aside>

                        {/* Right Content Area */}
                        <main className="right-content-area">
                            {/* Venue Filter Row */}


                            {/* Events Grid */}
                            <div className="events-grid">
                                {filteredEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        isLiked={!!likedEvents[event.id]}
                                        onToggleLike={toggleLike}
                                    />
                                ))}
                            </div>

                            {/* Centered Load More button */}
                            <div className="load-more-container">
                                <button className="load-more-btn">LOAD MORE</button>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            <HorizontalRow />
        </>
    );
};

export default EventListing;
