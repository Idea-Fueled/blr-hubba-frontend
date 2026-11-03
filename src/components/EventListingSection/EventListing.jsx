import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionSection, MotionMaskText, MotionButton } from "../AnimatedPage";
import "./EventListing.css";
import xIcon from "../../assets/x_icon.png";
import EventCard from "../events/EventCard";
import { fetchEvents, fetchWishlistApi, toggleWishlistApi } from "../../api/eventsApi";
import { mapBackendEventToCard, toTitleCase } from "../../utils/eventMappers";
import { sortEventsByRank, getSessionReferenceTime, calculateEventRank } from "../../utils/eventRanking";
import { SkeletonCard } from "../Loader/Loader";
import eventListingBgImage from "../../assets/event-listing-bg-image.png";
import GenreFilterSection from "../GenreFilterSection/GenreFilterSection";
import { toast } from "sonner";
import AddToCalendarModal from "../CalendarModal/AddToCalendarModal";

const CloseIcon = ({ onClick }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ cursor: "pointer" }} onClick={onClick}>
        <path d="M9 3L3 9M3 3L9 9" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const STATIC_ZONES = ["Central", "North", "South", "East", "West"];
const MORE_FILTERS = ["Free", "Available", "Multi-Day Events"];

const formatAndDeduplicateItems = (items, standardizeTitleCase = true) => {
    if (!items || !Array.isArray(items)) return [];
    const map = new Map();

    items.forEach(rawItem => {
        if (!rawItem || typeof rawItem !== 'string') return;
        const trimmed = rawItem.trim();
        if (!trimmed) return;

        const key = trimmed.toLowerCase();
        if (!map.has(key)) {
            if (standardizeTitleCase) {
                map.set(key, toTitleCase(trimmed));
            } else {
                map.set(key, trimmed);
            }
        }
    });

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
};

const getLocalDateString = (dateObjOrStr) => {
    const d = new Date(dateObjOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const checkEventOccursOnDate = (event, targetDateStr) => {
    if (!event || !targetDateStr) return false;

    // Check specific eventDates array if present
    if (event.eventDates && Array.isArray(event.eventDates) && event.eventDates.length > 0) {
        const matchesEventDate = event.eventDates.some(ed => {
            const edDateStr = getLocalDateString(ed.date || ed.startDateTime || ed.dateTime);
            return edDateStr === targetDateStr;
        });
        if (matchesEventDate) return true;
    }

    // Check startDateTime and endDateTime range
    if (event.startDateTime) {
        const startStr = getLocalDateString(event.startDateTime);
        const endStr = getLocalDateString(event.endDateTime || event.startDateTime);
        if (targetDateStr >= startStr && targetDateStr <= endStr) {
            return true;
        }
    }

    return false;
};

const downloadIcsCalendar = (eventsList, calendarName = "BLR Hubba 2027 Calendar") => {
    if (!eventsList || !Array.isArray(eventsList) || eventsList.length === 0) {
        toast.error("No events available to download");
        return;
    }

    const formatIcsDate = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) {
            return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        }
        return dateObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const escapeIcsText = (text) => {
        if (!text) return "";
        return String(text)
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\n/g, "\\n");
    };

    const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BLR Hubba//Festival Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
        "X-WR-TIMEZONE:Asia/Kolkata"
    ];

    const nowStamp = formatIcsDate(new Date());

    eventsList.forEach((evt, idx) => {
        if (!evt) return;

        const titleStr = evt.title || evt.name || `BLR Hubba Event ${idx + 1}`;
        const performerStr = evt.performer || evt.artist || evt.artistName || "";
        const venueStr = evt.venue || evt.venueName || evt.address || evt.location || "Bengaluru";

        let startDateObj = evt.startDateTime ? new Date(evt.startDateTime) : null;
        let endDateObj = evt.endDateTime ? new Date(evt.endDateTime) : null;

        if (!startDateObj || isNaN(startDateObj.getTime())) {
            if (evt.eventDates && Array.isArray(evt.eventDates) && evt.eventDates.length > 0) {
                const firstEd = evt.eventDates[0];
                const rawD = firstEd.startDateTime || firstEd.date || firstEd.dateTime;
                if (rawD) startDateObj = new Date(rawD);
            }
        }

        if (!startDateObj || isNaN(startDateObj.getTime())) {
            startDateObj = new Date(2027, 0, 16, 18, 0, 0);
        }

        if (!endDateObj || isNaN(endDateObj.getTime())) {
            endDateObj = new Date(startDateObj.getTime() + 2 * 60 * 60 * 1000);
        }

        const dtStartStr = formatIcsDate(startDateObj);
        const dtEndStr = formatIcsDate(endDateObj);
        const eventUid = `${evt.id || evt.slug || idx}-${Date.now()}@blrhubba.in`;

        const descriptionStr = performerStr
            ? `${performerStr} | BLR Hubba 2027 Festival`
            : `BLR Hubba 2027 Festival Event`;

        icsLines.push(
            "BEGIN:VEVENT",
            `UID:${eventUid}`,
            `DTSTAMP:${nowStamp}`,
            `DTSTART:${dtStartStr}`,
            `DTEND:${dtEndStr}`,
            `SUMMARY:${escapeIcsText(titleStr)}`,
            `DESCRIPTION:${escapeIcsText(descriptionStr)}`,
            `LOCATION:${escapeIcsText(venueStr)}`,
            "STATUS:CONFIRMED",
            "END:VEVENT"
        );
    });

    icsLines.push("END:VCALENDAR");

    const icsContent = icsLines.join("\r\n");
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "BLR_Hubba_2027_Calendar.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast.success("BLR Hubba 2027 Calendar downloaded (.ics)");
};

const generateDateRange = (rawEvents) => {
    if (!rawEvents || !Array.isArray(rawEvents) || rawEvents.length === 0) {
        return [{ label: "All", value: "ALL" }];
    }

    const uniqueDateStrs = new Set();

    const addDate = (d) => {
        if (!d) return;
        if (typeof d === "string" && d.trim().length < 8 && !d.includes("-") && !d.includes("/")) return;

        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return;
        const dateStr = getLocalDateString(dateObj);
        if (dateStr && dateStr.length === 10) {
            uniqueDateStrs.add(dateStr);
        }
    };

    rawEvents.forEach(e => {
        if (!e) return;

        addDate(e.startDateTime);
        addDate(e.endDateTime);

        if (Array.isArray(e.eventDates)) {
            e.eventDates.forEach(ed => {
                if (!ed) return;
                addDate(ed.date);
                addDate(ed.startDateTime);
                addDate(ed.endDateTime);
            });
        }
    });

    // Filter dates so every pill has AT LEAST ONE matching event, then sort ascending chronologically by date
    const sortedDateStrs = Array.from(uniqueDateStrs)
        .filter(dateStr => rawEvents.some(e => checkEventOccursOnDate(e, dateStr)))
        .sort((a, b) => {
            const timeA = new Date(a).getTime();
            const timeB = new Date(b).getTime();
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
                return timeA - timeB;
            }
            const [yA, mA, dA] = a.split('-').map(Number);
            const [yB, mB, dB] = b.split('-').map(Number);
            if (yA !== yB) return yA - yB;
            if (mA !== mB) return mA - mB;
            return dA - dB;
        });

    const dateList = [{ label: "All", value: "ALL" }];

    sortedDateStrs.forEach(dateStr => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const current = new Date(year, month - 1, day);

        const dayNumber = current.getDate().toString();
        const weekday = current.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
        const monthStr = current.toLocaleString('en-US', { month: 'short' }).toUpperCase();

        dateList.push({
            day: dayNumber,
            weekday: weekday,
            month: monthStr,
            value: dateStr,
            dateStr: dateStr
        });
    });

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
    return formatAndDeduplicateItems(venueNames, false);
};

const generateGenres = (mappedEvents) => {
    const rawGenres = [];
    if (mappedEvents && mappedEvents.length > 0) {
        mappedEvents.forEach(e => {
            if (e.genres) {
                e.genres.forEach(g => {
                    if (g && typeof g === "string" && g.trim()) {
                        rawGenres.push(g.trim());
                    }
                });
            }
        });
    }
    return formatAndDeduplicateItems(rawGenres, true);
};

const SAVED_FILTERS_KEY = "blrhubba_event_listing_filters";

const getSavedFilters = () => {
    try {
        const saved = sessionStorage.getItem(SAVED_FILTERS_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

export const EventListing = ({
    hideTopHero = false,
    showHeroHeader = false,
    hideGenreCarousel = false,
    sectionEyebrow = "EVENT CALENDAR",
    sectionTitle = "Upcoming Music Events",
    className = "",
    wrapperClassName = ""
}) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initialSaved = getSavedFilters();

    // Dynamic filters populated from events list
    const [dates, setDates] = useState([{ label: "All", value: "ALL" }]);
    const [genres, setGenres] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [venues, setVenues] = useState([]);
    const [subfestivals, setSubfestivals] = useState([]);
    const [curators, setCurators] = useState([]);

    // Selection state initialized from saved session storage if available
    const [selectedDate, setSelectedDate] = useState(() => initialSaved?.selectedDate || "ALL");
    const [selectedVenues, setSelectedVenues] = useState(() => initialSaved?.selectedVenues || []);
    const [selectedGenres, setSelectedGenres] = useState(() => initialSaved?.selectedGenres || []);
    const [selectedZones, setSelectedZones] = useState(() => initialSaved?.selectedZones || []);
    const [selectedLanguages, setSelectedLanguages] = useState(() => initialSaved?.selectedLanguages || []);
    const [selectedMoreFilters, setSelectedMoreFilters] = useState(() => initialSaved?.selectedMoreFilters || []);
    const [selectedSubfestivals, setSelectedSubfestivals] = useState(() => initialSaved?.selectedSubfestivals || []);
    const [freePassOnly, setFreePassOnly] = useState(() => initialSaved?.freePassOnly || false);
    const [donorPassOnly, setDonorPassOnly] = useState(() => initialSaved?.donorPassOnly || false);
    const [selectedCurators, setSelectedCurators] = useState(() => initialSaved?.selectedCurators || []);
    const [likedEvents, setLikedEvents] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user_favorites") || "{}");
        } catch (e) {
            return {};
        }
    });

    // Client-side pagination/load more
    const [visibleCount, setVisibleCount] = useState(6);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

    // Accordion expand/collapse state - only ONE open accordion at a time (closed by default)
    const [openAccordion, setOpenAccordion] = useState(null);
    const [venuesShowAll, setVenuesShowAll] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeMobileFilterTab, setActiveMobileFilterTab] = useState("VENUES");
    const [isSticky, setIsSticky] = useState(false);

    // Persist filter selections in sessionStorage
    useEffect(() => {
        const filtersToSave = {
            selectedDate,
            selectedVenues,
            selectedGenres,
            selectedZones,
            selectedLanguages,
            selectedMoreFilters,
            selectedSubfestivals,
            freePassOnly,
            donorPassOnly,
            selectedCurators,
            openAccordion
        };
        try {
            sessionStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filtersToSave));
        } catch (e) {
            console.error("Error saving filters to sessionStorage", e);
        }
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
        selectedCurators,
        openAccordion
    ]);

    const toggleAccordion = (name) => {
        setOpenAccordion(prev => (prev === name ? null : name));
    };

    const venueRowRef = useRef(null);
    const sentinelRef = useRef(null);
    const mainLayoutRef = useRef(null);
    const [canScrollVenuesLeft, setCanScrollVenuesLeft] = useState(false);
    const [canScrollVenuesRight, setCanScrollVenuesRight] = useState(false);

    // Fetch filters and events on mount
    useEffect(() => {
        setLoading(true);
        setError(null);

        fetchEvents({ limit: 500 })
            .then(async (eventsData) => {
                // Map events using shared mapping utility
                if (eventsData && eventsData.events) {
                    const mapped = eventsData.events.map(mapBackendEventToCard);

                    // Sort list of events by Rank = T x D x S formula (fixed in user session)
                    const sessionTime = getSessionReferenceTime();
                    const sorted = sortEventsByRank(mapped, sessionTime);

                    setEvents(sorted);

                    // Log ranking table for verification in browser DevTools Console
                    try {
                        console.groupCollapsed("🎯 BLR Hubba Event Ranking (Rank = T x D x S)");
                        console.table(
                            sorted.map((ev, idx) => {
                                const r = calculateEventRank(ev, sessionTime);
                                return {
                                    Position: idx + 1,
                                    Title: ev.title,
                                    Status: r.hasUpcomingShow ? "UPCOMING" : "PAST",
                                    "T (Hours)": Number(r.T.toFixed(1)),
                                    "D (Hours)": Number(r.D.toFixed(1)),
                                    "S (Shows)": r.S,
                                    "Rank (T*D*S)": Number(r.rank.toFixed(1))
                                };
                            })
                        );
                        console.groupEnd();
                    } catch {}
                    const dynamicDates = generateDateRange([...mapped, ...(eventsData.events || [])]);
                    setDates(dynamicDates);

                    // Generate venues dynamically (preserve original casing, remove case-insensitive duplicates)
                    const dynamicVenues = formatAndDeduplicateItems(generateVenues(mapped), false);
                    setVenues(dynamicVenues);

                    // Generate genres dynamically from events & API (standardized Title Case & deduplicated)
                    const dynamicGenres = generateGenres(mapped);
                    try {
                        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
                        const genreRes = await fetch(`${API_BASE}/genres?limit=100`);
                        if (genreRes.ok) {
                            const genreData = await genreRes.json();
                            if (genreData && Array.isArray(genreData.genres)) {
                                const apiGenreNames = genreData.genres.map(g => g.name);
                                const combined = formatAndDeduplicateItems([...dynamicGenres, ...apiGenreNames], true);
                                setGenres(combined);
                            } else {
                                setGenres(formatAndDeduplicateItems(dynamicGenres, true));
                            }
                        } else {
                            setGenres(formatAndDeduplicateItems(dynamicGenres, true));
                        }
                    } catch (e) {
                        setGenres(formatAndDeduplicateItems(dynamicGenres, true));
                    }

                    // Generate languages dynamically with base languages Kannada, English, Hindi included
                    const baseLanguages = ["Kannada", "English", "Hindi"];
                    const dynamicLanguages = formatAndDeduplicateItems([...baseLanguages, ...mapped.map(e => e.language)], true);
                    setLanguages(dynamicLanguages);

                    // Generate subfestivals dynamically (standardized Title Case & deduplicated)
                    const dynamicSubfestivals = formatAndDeduplicateItems(mapped.map(e => e.subfestivalName), true);
                    setSubfestivals(dynamicSubfestivals);

                    // Generate curators dynamically (standardized Title Case & deduplicated)
                    const dynamicCurators = formatAndDeduplicateItems(
                        mapped.map(e => e.curatedBy).filter(c => Boolean(c) && typeof c === 'string' && c.trim() !== ''),
                        true
                    );
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

    // Sync wishlist from backend on mount
    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
            fetchWishlistApi()
                .then((res) => {
                    if (res && res.success && res.data) {
                        const backendFavs = {};
                        res.data.forEach((item) => {
                            if (item.eventId) {
                                backendFavs[item.eventId] = true;
                            }
                        });
                        setLikedEvents(backendFavs);
                        localStorage.setItem("user_favorites", JSON.stringify(backendFavs));
                    }
                })
                .catch((err) => console.error("Error loading backend wishlist:", err));
        }
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

    // Scroll listener to toggle sticky state only when scrolled past sentinel AND inside main-layout
    useEffect(() => {
        const handleScroll = () => {
            if (!sentinelRef.current) return;
            const sentinelRect = sentinelRef.current.getBoundingClientRect();

            let pastBottom = false;
            if (mainLayoutRef.current) {
                const mainLayoutRect = mainLayoutRef.current.getBoundingClientRect();
                if (mainLayoutRect.bottom <= 200) {
                    pastBottom = true;
                }
            }

            // Become sticky ONLY when sentinel has scrolled past navbar (80px) AND not past bottom of main-layout
            setIsSticky(sentinelRect.top <= 80 && !pastBottom);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Toggle favorite handler
    const toggleLike = (eventId) => {
        setLikedEvents((prev) => {
            const updated = {
                ...prev,
                [eventId]: !prev[eventId]
            };
            localStorage.setItem("user_favorites", JSON.stringify(updated));
            return updated;
        });

        // Async toggle in backend
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
            toggleWishlistApi(eventId)
                .then((res) => {
                    // Update state if backend returned a different value or to confirm sync
                    if (res && res.success === false) {
                        console.warn("Failed to sync wishlist toggle to backend:", res.message);
                    }
                    // Dispatch profile-change event so navbar updates if it shows liked count
                    window.dispatchEvent(new Event("profile-change"));
                })
                .catch((err) => console.error("Wishlist sync error:", err));
        }
    };

    // Filter selectors helpers
    const handleGenreToggle = (genre) => {
        if (!genre) return;
        const canonical = (genres || []).find(g => g.toLowerCase() === genre.toLowerCase()) ||
            (genre.trim().charAt(0).toUpperCase() + genre.trim().slice(1).toLowerCase());

        setSelectedGenres((prev) => {
            const exists = prev.some((g) => g.toLowerCase() === canonical.toLowerCase());
            if (exists) {
                return prev.filter((g) => g.toLowerCase() !== canonical.toLowerCase());
            }
            return [...prev, canonical];
        });

        setOpenAccordion("GENRE");
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
        try {
            sessionStorage.removeItem(SAVED_FILTERS_KEY);
        } catch (e) {}
    };

    // Filter logic
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            // Date Filter (Multi-day support)
            if (selectedDate !== "ALL") {
                const matches = checkEventOccursOnDate(event, selectedDate);
                if (!matches) return false;
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
                const hasGenre = (event.genres || []).some((g) =>
                    selectedGenres.some((selG) => selG.toLowerCase() === String(g).toLowerCase())
                );
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

    const updateVenueScrollState = useCallback(() => {
        if (venueRowRef.current) {
            const el = venueRowRef.current;
            const scrollLeft = el.scrollLeft;
            const maxScrollLeft = el.scrollWidth - el.clientWidth;

            setCanScrollVenuesLeft(scrollLeft > 5);
            setCanScrollVenuesRight(maxScrollLeft > 5 && (maxScrollLeft - scrollLeft > 5));
        }
    }, []);

    const handleVenueScroll = () => {
        updateVenueScrollState();
    };

    useEffect(() => {
        updateVenueScrollState();
        window.addEventListener("resize", updateVenueScrollState);
        const timer = setTimeout(updateVenueScrollState, 150);
        return () => {
            window.removeEventListener("resize", updateVenueScrollState);
            clearTimeout(timer);
        };
    }, [venues, updateVenueScrollState]);

    const visibleEvents = useMemo(() => {
        return filteredEvents.slice(0, visibleCount);
    }, [filteredEvents, visibleCount]);

    const showLoadMore = useMemo(() => {
        return filteredEvents.length > visibleCount;
    }, [filteredEvents.length, visibleCount]);

    if (error) {
        return (
            <div className="w-full text-center py-32 bg-red-50 rounded-2xl border border-red-100 p-6">
                <p className="text-xl text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className={`event-listing-page-container ${className}`.trim()}>
            {/* Top Hero Header Section (Centered Above Black Box) */}
            {!hideTopHero && (
                <div
                    className="event-listing-top-hero"
                    style={{ backgroundImage: `url(${eventListingBgImage})` }}
                >
                    <MotionMaskText delay={0.05}>
                        <span className="event-listing-label">EVENT CALENDAR</span>
                    </MotionMaskText>
                    <MotionMaskText delay={0.12}>
                        <h1 className="event-listing-heading">
                            Explore What's On at BLR Hubba 2027
                        </h1>
                    </MotionMaskText>
                </div>
            )}

            {/* Black Container Wrapper */}
            <div className={`event-listing-wrapper ${wrapperClassName}`.trim()}>
                {showHeroHeader && (
                    <div className="subfest-events-header-box">
                        <span className="subfest-events-eyebrow">{sectionEyebrow}</span>
                        <h2 className="subfest-events-title">{sectionTitle}</h2>
                    </div>
                )}

                {/* Top Genre Carousel inside Black Container */}
                {!hideGenreCarousel && (
                    <div className="genre-cards-top-carousel">
                        <GenreFilterSection hideHeader={true} onSelectGenre={handleGenreToggle} selectedGenres={selectedGenres} />
                    </div>
                )}

                <div className="event-listing-content-wrapper">
                    {/* Full-Width Sticky Calendar Header Bar (Renders on Scroll) */}
                    {isSticky && (
                        <div className="sticky-calendar-bar sticky-active">
                            <div className="sticky-calendar-inner">
                                <div className="month-subtitle">JANUARY 2027</div>

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
                                                    <span className="date-card-all">ALL</span>
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

                                <div className="sticky-calendar-divider"></div>

                                <button
                                    className="download-calendar-btn"
                                    onClick={() => setIsCalendarModalOpen(true)}
                                >
                                    <span className="download-calendar-text">DOWNLOAD CALENDAR</span>
                                    <div className="download-calendar-icon-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                            <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Layout */}
                    <div className="main-layout" ref={mainLayoutRef}>
                        {/* Left Sticky Filters Sidebar */}
                        <aside className={`left-filter-sidebar ${isSticky ? "is-sticky-sidebar" : ""}`}>
                            {(() => {
                                const hasActiveFilters = selectedVenues.length > 0 || selectedGenres.length > 0 || selectedZones.length > 0 || selectedLanguages.length > 0 || selectedSubfestivals.length > 0 || freePassOnly || donorPassOnly || selectedCurators.length > 0 || selectedMoreFilters.length > 0;
                                return (
                                    <>
                                        <div className="filter-sidebar-header" style={{ marginBottom: hasActiveFilters ? "16px" : "40px" }}>
                                            <span className="filter-section-title">FILTER BY</span>
                                            {hasActiveFilters && (
                                                <span className="filter-clear-all" onClick={handleResetAll}>Clear all</span>
                                            )}
                                        </div>

                                        {/* Active Filtered Pills */}
                                        {hasActiveFilters && (
                                            <div className="filtered-by-pills" style={{ marginBottom: "32px" }}>
                                                {selectedVenues.map((venue) => (
                                                    <div key={venue} className="filtered-pill">
                                                        <span>{venue}</span>
                                                        <CloseIcon onClick={() => setSelectedVenues(prev => prev.filter(v => v !== venue))} />
                                                    </div>
                                                ))}
                                                {selectedGenres.map((genre) => (
                                                    <div key={genre} className="filtered-pill">
                                                        <span>{toTitleCase(genre)}</span>
                                                        <CloseIcon onClick={() => handleGenreToggle(genre)} />
                                                    </div>
                                                ))}
                                                {selectedZones.map((zone) => (
                                                    <div key={zone} className="filtered-pill">
                                                        <span>{zone}</span>
                                                        <CloseIcon onClick={() => handleZoneToggle(zone)} />
                                                    </div>
                                                ))}
                                                {selectedLanguages.map((lang) => (
                                                    <div key={lang} className="filtered-pill">
                                                        <span>{lang}</span>
                                                        <CloseIcon onClick={() => handleLanguageToggle(lang)} />
                                                    </div>
                                                ))}
                                                {selectedSubfestivals.map((subfest) => (
                                                    <div key={subfest} className="filtered-pill">
                                                        <span>{subfest}</span>
                                                        <CloseIcon onClick={() => setSelectedSubfestivals(prev => prev.filter(s => s !== subfest))} />
                                                    </div>
                                                ))}
                                                {freePassOnly && (
                                                    <div className="filtered-pill">
                                                        <span>Free Pass</span>
                                                        <CloseIcon onClick={() => setFreePassOnly(false)} />
                                                    </div>
                                                )}
                                                {donorPassOnly && (
                                                    <div className="filtered-pill">
                                                        <span>Donor Pass</span>
                                                        <CloseIcon onClick={() => setDonorPassOnly(false)} />
                                                    </div>
                                                )}
                                                {selectedCurators.map((curator) => (
                                                    <div key={curator} className="filtered-pill">
                                                        <span>{curator}</span>
                                                        <CloseIcon onClick={() => setSelectedCurators(prev => prev.filter(c => c !== curator))} />
                                                    </div>
                                                ))}
                                                {selectedMoreFilters.map((filter) => (
                                                    <div key={filter} className="filtered-pill">
                                                        <span>{filter}</span>
                                                        <CloseIcon onClick={() => handleMoreFilterToggle(filter)} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {/* Venues Section */}
                            {venues.length > 0 && (
                                <div className={`filter-accordion ${openAccordion === "VENUES" ? "open" : ""}`}>
                                    <div className="accordion-header" onClick={() => toggleAccordion("VENUES")}>
                                        <div className="accordion-title-wrapper">
                                            <h4 className="accordion-title">VENUES</h4>
                                            {selectedVenues.length > 0 && (
                                                <span className="filter-count-badge">{selectedVenues.length}</span>
                                            )}
                                        </div>
                                        <svg
                                            className={`accordion-chevron ${openAccordion === "VENUES" ? "open" : ""}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {openAccordion === "VENUES" && (
                                            <motion.div
                                                key="venues-content"
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="accordion-content"
                                            >
                                                {(venuesShowAll ? venues : venues.slice(0, 10)).map((venue) => {
                                                    const isSelected = selectedVenues.includes(venue);
                                                    return (
                                                        <div
                                                            key={venue}
                                                            className={`filter-checkbox-row ${isSelected ? "checked" : ""}`}
                                                            onClick={() => setSelectedVenues(prev => isSelected ? prev.filter(v => v !== venue) : [...prev, venue])}
                                                        >
                                                            <div className="custom-checkbox">
                                                                {isSelected && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                        <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="filter-checkbox-label">{venue}</span>
                                                        </div>
                                                    );
                                                })}
                                                {venues.length > 10 && (
                                                    <div className="view-all-toggle" onClick={() => setVenuesShowAll(!venuesShowAll)}>
                                                        <span>{venuesShowAll ? "View Less" : `View All (${venues.length})`}</span>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points={venuesShowAll ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                                                        </svg>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Genre Section */}
                            <div className={`filter-accordion ${openAccordion === "GENRE" ? "open" : ""}`}>
                                <div className="accordion-header" onClick={() => toggleAccordion("GENRE")}>
                                    <div className="accordion-title-wrapper">
                                        <h4 className="accordion-title">GENRE</h4>
                                        {selectedGenres.length > 0 && (
                                            <span className="filter-count-badge">{selectedGenres.length}</span>
                                        )}
                                    </div>
                                    <svg
                                        className={`accordion-chevron ${openAccordion === "GENRE" ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <AnimatePresence initial={false}>
                                    {openAccordion === "GENRE" && (
                                        <motion.div
                                            key="genre-content"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="accordion-content"
                                        >
                                            {genres.length > 0 ? (
                                                genres.map((genre) => {
                                                    const isSelected = selectedGenres.some((g) => g.toLowerCase() === genre.toLowerCase());
                                                    return (
                                                        <div
                                                            key={genre}
                                                            className={`filter-checkbox-row ${isSelected ? "checked" : ""}`}
                                                            onClick={() => handleGenreToggle(genre)}
                                                        >
                                                            <div className="custom-checkbox">
                                                                {isSelected && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                        <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="filter-checkbox-label">{toTitleCase(genre)}</span>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="filter-checkbox-row" style={{ opacity: 0.6, cursor: "default" }}>
                                                    <span className="filter-checkbox-label">No genres added yet</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Festivals Section */}
                            <div className={`filter-accordion ${openAccordion === "FESTIVALS" ? "open" : ""}`}>
                                <div className="accordion-header" onClick={() => toggleAccordion("FESTIVALS")}>
                                    <div className="accordion-title-wrapper">
                                        <h4 className="accordion-title">FESTIVALS</h4>
                                        {selectedSubfestivals.length > 0 && (
                                            <span className="filter-count-badge">{selectedSubfestivals.length}</span>
                                        )}
                                    </div>
                                    <svg
                                        className={`accordion-chevron ${openAccordion === "FESTIVALS" ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <AnimatePresence initial={false}>
                                    {openAccordion === "FESTIVALS" && (
                                        <motion.div
                                            key="festivals-content"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="accordion-content"
                                        >
                                            {subfestivals.map((subfest) => {
                                                const isSelected = selectedSubfestivals.includes(subfest);
                                                return (
                                                    <div
                                                        key={subfest}
                                                        className={`filter-checkbox-row ${isSelected ? "checked" : ""}`}
                                                        onClick={() => setSelectedSubfestivals(prev => isSelected ? prev.filter(s => s !== subfest) : [...prev, subfest])}
                                                    >
                                                        <div className="custom-checkbox">
                                                            {isSelected && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                    <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="filter-checkbox-label">{toTitleCase(subfest)}</span>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Curators Section */}
                            <div className={`filter-accordion ${openAccordion === "CURATORS" ? "open" : ""}`}>
                                <div className="accordion-header" onClick={() => toggleAccordion("CURATORS")}>
                                    <div className="accordion-title-wrapper">
                                        <h4 className="accordion-title">CURATORS</h4>
                                        {selectedCurators.length > 0 && (
                                            <span className="filter-count-badge">{selectedCurators.length}</span>
                                        )}
                                    </div>
                                    <svg
                                        className={`accordion-chevron ${openAccordion === "CURATORS" ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <AnimatePresence initial={false}>
                                    {openAccordion === "CURATORS" && (
                                        <motion.div
                                            key="curators-content"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="accordion-content"
                                        >
                                            {curators.map((curator) => {
                                                const isSelected = selectedCurators.includes(curator);
                                                return (
                                                    <div
                                                        key={curator}
                                                        className={`filter-checkbox-row ${isSelected ? "checked" : ""}`}
                                                        onClick={() => setSelectedCurators(prev => isSelected ? prev.filter(c => c !== curator) : [...prev, curator])}
                                                    >
                                                        <div className="custom-checkbox">
                                                            {isSelected && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                    <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="filter-checkbox-label">{toTitleCase(curator)}</span>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Languages Section */}
                            {languages.length > 0 && (
                                <div className={`filter-accordion ${openAccordion === "LANGUAGES" ? "open" : ""}`}>
                                    <div className="accordion-header" onClick={() => toggleAccordion("LANGUAGES")}>
                                        <div className="accordion-title-wrapper">
                                            <h4 className="accordion-title">LANGUAGES</h4>
                                            {selectedLanguages.length > 0 && (
                                                <span className="filter-count-badge">{selectedLanguages.length}</span>
                                            )}
                                        </div>
                                        <svg
                                            className={`accordion-chevron ${openAccordion === "LANGUAGES" ? "open" : ""}`}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {openAccordion === "LANGUAGES" && (
                                            <motion.div
                                                key="languages-content"
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="accordion-content"
                                            >
                                                {languages.map((lang) => {
                                                    const isSelected = selectedLanguages.includes(lang);
                                                    return (
                                                        <div
                                                            key={lang}
                                                            className={`filter-checkbox-row ${isSelected ? "checked" : ""}`}
                                                            onClick={() => handleLanguageToggle(lang)}
                                                        >
                                                            <div className="custom-checkbox">
                                                                {isSelected && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                        <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="filter-checkbox-label">{toTitleCase(lang)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Availability Section */}
                            <div className={`filter-accordion ${openAccordion === "AVAILABILITY" ? "open" : ""}`}>
                                <div className="accordion-header" onClick={() => toggleAccordion("AVAILABILITY")}>
                                    <div className="accordion-title-wrapper">
                                        <h4 className="accordion-title">AVAILABILITY</h4>
                                        {(freePassOnly || donorPassOnly) && (
                                            <span className="filter-count-badge">{(freePassOnly ? 1 : 0) + (donorPassOnly ? 1 : 0)}</span>
                                        )}
                                    </div>
                                    <svg
                                        className={`accordion-chevron ${openAccordion === "AVAILABILITY" ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <AnimatePresence initial={false}>
                                    {openAccordion === "AVAILABILITY" && (
                                        <motion.div
                                            key="availability-content"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="accordion-content"
                                        >
                                            <div
                                                className={`filter-checkbox-row ${freePassOnly ? "checked" : ""}`}
                                                onClick={() => setFreePassOnly(!freePassOnly)}
                                            >
                                                <div className="custom-checkbox">
                                                    {freePassOnly && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                            <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="filter-checkbox-label">Free Pass</span>
                                            </div>
                                            <div
                                                className={`filter-checkbox-row ${donorPassOnly ? "checked" : ""}`}
                                                onClick={() => setDonorPassOnly(!donorPassOnly)}
                                            >
                                                <div className="custom-checkbox">
                                                    {donorPassOnly && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                            <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="filter-checkbox-label">Donor Pass</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* More Filters Section */}
                            <div className={`filter-accordion ${openAccordion === "MORE_FILTERS" ? "open" : ""}`}>
                                <div className="accordion-header" onClick={() => toggleAccordion("MORE_FILTERS")}>
                                    <div className="accordion-title-wrapper">
                                        <h4 className="accordion-title">MORE FILTERS</h4>
                                        {selectedMoreFilters.length > 0 && (
                                            <span className="filter-count-badge">{selectedMoreFilters.length}</span>
                                        )}
                                    </div>
                                    <svg
                                        className={`accordion-chevron ${openAccordion === "MORE_FILTERS" ? "open" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <AnimatePresence initial={false}>
                                    {openAccordion === "MORE_FILTERS" && (
                                        <motion.div
                                            key="more-filters-content"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="accordion-content"
                                        >
                                            {MORE_FILTERS.map((filter) => {
                                                const isSelected = selectedMoreFilters.includes(filter);
                                                return (
                                                    <div
                                                        key={filter}
                                                        className={`filter-checkbox-row ${isSelected ? "checked" : ""}`}
                                                        onClick={() => handleMoreFilterToggle(filter)}
                                                    >
                                                        <div className="custom-checkbox">
                                                            {isSelected && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                    <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="filter-checkbox-label">{filter}</span>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Reset Button */}
                            <button className="reset-filters-btn" onClick={handleResetAll}>
                                <span className="btn-text-primary">RESET FILTERS</span>
                                <span className="btn-text-secondary">RESET FILTERS</span>
                            </button>
                        </aside>

                        {/* Right Content Area */}
                        <main className="right-content-area">
                            {/* Sentinel for sticky calendar detection */}
                            <div ref={sentinelRef} style={{ height: "1px", margin: "0", padding: "0" }}></div>

                            {/* Month Subtitle & Download Calendar Row */}
                            <div className="month-header-row">
                                <div className="month-subtitle">JANUARY 2027</div>
                                <button
                                    className="download-calendar-btn"
                                    onClick={() => setIsCalendarModalOpen(true)}
                                >
                                    <span className="download-calendar-text">DOWNLOAD CALENDAR</span>
                                    <div className="download-calendar-icon-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                            <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                        </svg>
                                    </div>
                                </button>
                            </div>

                            {/* Date & Venue Filter Row - Sticky Wrapper on Mobile */}
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
                                                    <span className="date-card-all">ALL</span>
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
                            </div>

                            {/* Mobile Active Filtered Pills Row (Only rendered when active filters exist) */}
                            {(() => {
                                const hasActiveFilters = selectedVenues.length > 0 || selectedGenres.length > 0 || selectedZones.length > 0 || selectedLanguages.length > 0 || selectedSubfestivals.length > 0 || freePassOnly || donorPassOnly || selectedCurators.length > 0 || selectedMoreFilters.length > 0;
                                if (!hasActiveFilters) return null;
                                return (
                                    <div className="mobile-active-filters-row">
                                        <span className="mobile-filtered-by-label">FILTERED BY</span>
                                        <div className="mobile-filtered-pills-scroll">
                                            {selectedVenues.map((venue) => (
                                                <div key={venue} className="filtered-pill">
                                                    <span>{venue}</span>
                                                    <CloseIcon onClick={() => setSelectedVenues(prev => prev.filter(v => v !== venue))} />
                                                </div>
                                            ))}
                                            {selectedGenres.map((genre) => (
                                                <div key={genre} className="filtered-pill">
                                                    <span>{toTitleCase(genre)}</span>
                                                    <CloseIcon onClick={() => handleGenreToggle(genre)} />
                                                </div>
                                            ))}
                                            {selectedZones.map((zone) => (
                                                <div key={zone} className="filtered-pill">
                                                    <span>{zone}</span>
                                                    <CloseIcon onClick={() => handleZoneToggle(zone)} />
                                                </div>
                                            ))}
                                            {selectedLanguages.map((lang) => (
                                                <div key={lang} className="filtered-pill">
                                                    <span>{lang}</span>
                                                    <CloseIcon onClick={() => handleLanguageToggle(lang)} />
                                                </div>
                                            ))}
                                            {selectedSubfestivals.map((subfest) => (
                                                <div key={subfest} className="filtered-pill">
                                                    <span>{subfest}</span>
                                                    <CloseIcon onClick={() => setSelectedSubfestivals(prev => prev.filter(s => s !== subfest))} />
                                                </div>
                                            ))}
                                            {freePassOnly && (
                                                <div className="filtered-pill">
                                                    <span>Free Pass</span>
                                                    <CloseIcon onClick={() => setFreePassOnly(false)} />
                                                </div>
                                            )}
                                            {donorPassOnly && (
                                                <div className="filtered-pill">
                                                    <span>Donor Pass</span>
                                                    <CloseIcon onClick={() => setDonorPassOnly(false)} />
                                                </div>
                                            )}
                                            {selectedCurators.map((curator) => (
                                                <div key={curator} className="filtered-pill">
                                                    <span>{curator}</span>
                                                    <CloseIcon onClick={() => setSelectedCurators(prev => prev.filter(c => c !== curator))} />
                                                </div>
                                            ))}
                                            {selectedMoreFilters.map((filter) => (
                                                <div key={filter} className="filtered-pill">
                                                    <span>{filter}</span>
                                                    <CloseIcon onClick={() => handleMoreFilterToggle(filter)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
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
                                    <p style={{ fontFamily: 'Roboto Condensed', fontSize: '24px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px 0' }}>No Events Found</p>
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

            {/* Filter Modal Bottom Sheet */}
            {isFilterModalOpen && (
                <div className="mobile-filter-backdrop" onClick={() => setIsFilterModalOpen(false)}>
                    <div className="mobile-filter-bottom-sheet" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bottom-sheet-header">
                            <span className="bottom-sheet-title">FILTER BY</span>
                            <button className="bottom-sheet-close-btn" onClick={() => setIsFilterModalOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* 2-Column Body */}
                        <div className="bottom-sheet-body">
                            {/* Left Sidebar */}
                            <div className="bottom-sheet-sidebar">
                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "VENUES" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("VENUES")}
                                >
                                    <span>VENUES</span>
                                    {selectedVenues.length > 0 && (
                                        <span className="tab-badge">{selectedVenues.length}</span>
                                    )}
                                </div>

                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "GENRE" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("GENRE")}
                                >
                                    <span>GENRE</span>
                                    {selectedGenres.length > 0 && (
                                        <span className="tab-badge">{selectedGenres.length}</span>
                                    )}
                                </div>

                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "FESTIVALS" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("FESTIVALS")}
                                >
                                    <span>FESTIVALS</span>
                                    {selectedSubfestivals.length > 0 && (
                                        <span className="tab-badge">{selectedSubfestivals.length}</span>
                                    )}
                                </div>

                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "CURATORS" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("CURATORS")}
                                >
                                    <span>CURATORS</span>
                                    {selectedCurators.length > 0 && (
                                        <span className="tab-badge">{selectedCurators.length}</span>
                                    )}
                                </div>

                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "LANGUAGES" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("LANGUAGES")}
                                >
                                    <span>LANGUAGES</span>
                                    {selectedLanguages.length > 0 && (
                                        <span className="tab-badge">{selectedLanguages.length}</span>
                                    )}
                                </div>

                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "AVAILABILITY" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("AVAILABILITY")}
                                >
                                    <span>AVAILABILITY</span>
                                    {(freePassOnly || donorPassOnly) && (
                                        <span className="tab-badge">{(freePassOnly ? 1 : 0) + (donorPassOnly ? 1 : 0)}</span>
                                    )}
                                </div>

                                <div
                                    className={`sidebar-tab ${activeMobileFilterTab === "MORE FILTERS" ? "active" : ""}`}
                                    onClick={() => setActiveMobileFilterTab("MORE FILTERS")}
                                >
                                    <span>MORE FILTERS</span>
                                    {selectedMoreFilters.length > 0 && (
                                        <span className="tab-badge">{selectedMoreFilters.length}</span>
                                    )}
                                </div>
                            </div>

                            {/* Right Options Column */}
                            <div className="bottom-sheet-options">
                                {activeMobileFilterTab === "VENUES" && (
                                    <div className="options-list">
                                        {venues.map((venue) => {
                                            const isChecked = selectedVenues.includes(venue);
                                            return (
                                                <div
                                                    key={venue}
                                                    className={`option-row ${isChecked ? "checked" : ""}`}
                                                    onClick={() =>
                                                        setSelectedVenues(prev =>
                                                            prev.includes(venue) ? prev.filter(v => v !== venue) : [...prev, venue]
                                                        )
                                                    }
                                                >
                                                    <div className="option-checkbox">
                                                        {isChecked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="option-label">{venue}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeMobileFilterTab === "GENRE" && (
                                    <div className="options-list">
                                        {genres.map((genre) => {
                                            const isChecked = selectedGenres.some((g) => g.toLowerCase() === genre.toLowerCase());
                                            return (
                                                <div
                                                    key={genre}
                                                    className={`option-row ${isChecked ? "checked" : ""}`}
                                                    onClick={() => handleGenreToggle(genre)}
                                                >
                                                    <div className="option-checkbox">
                                                        {isChecked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="option-label">{toTitleCase(genre)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeMobileFilterTab === "FESTIVALS" && (
                                    <div className="options-list">
                                        {subfestivals.map((subfest) => {
                                            const isChecked = selectedSubfestivals.includes(subfest);
                                            return (
                                                <div
                                                    key={subfest}
                                                    className={`option-row ${isChecked ? "checked" : ""}`}
                                                    onClick={() =>
                                                        setSelectedSubfestivals(prev =>
                                                            prev.includes(subfest) ? prev.filter(s => s !== subfest) : [...prev, subfest]
                                                        )
                                                    }
                                                >
                                                    <div className="option-checkbox">
                                                        {isChecked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="option-label">{subfest}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeMobileFilterTab === "CURATORS" && (
                                    <div className="options-list">
                                        {curators.map((curator) => {
                                            const isChecked = selectedCurators.includes(curator);
                                            return (
                                                <div
                                                    key={curator}
                                                    className={`option-row ${isChecked ? "checked" : ""}`}
                                                    onClick={() =>
                                                        setSelectedCurators(prev =>
                                                            prev.includes(curator) ? prev.filter(c => c !== curator) : [...prev, curator]
                                                        )
                                                    }
                                                >
                                                    <div className="option-checkbox">
                                                        {isChecked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="option-label">{curator}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeMobileFilterTab === "LANGUAGES" && (
                                    <div className="options-list">
                                        {languages.map((lang) => {
                                            const isChecked = selectedLanguages.includes(lang);
                                            return (
                                                <div
                                                    key={lang}
                                                    className={`option-row ${isChecked ? "checked" : ""}`}
                                                    onClick={() => handleLanguageToggle(lang)}
                                                >
                                                    <div className="option-checkbox">
                                                        {isChecked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="option-label">{lang}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeMobileFilterTab === "AVAILABILITY" && (
                                    <div className="options-list">
                                        <div
                                            className={`option-row ${freePassOnly ? "checked" : ""}`}
                                            onClick={() => setFreePassOnly(!freePassOnly)}
                                        >
                                            <div className="option-checkbox">
                                                {freePassOnly && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                        <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="option-label">Free Pass</span>
                                        </div>
                                        <div
                                            className={`option-row ${donorPassOnly ? "checked" : ""}`}
                                            onClick={() => setDonorPassOnly(!donorPassOnly)}
                                        >
                                            <div className="option-checkbox">
                                                {donorPassOnly && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                        <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="option-label">Donor Pass</span>
                                        </div>
                                    </div>
                                )}

                                {activeMobileFilterTab === "MORE FILTERS" && (
                                    <div className="options-list">
                                        {MORE_FILTERS.map((filter) => {
                                            const isChecked = selectedMoreFilters.includes(filter);
                                            return (
                                                <div
                                                    key={filter}
                                                    className={`option-row ${isChecked ? "checked" : ""}`}
                                                    onClick={() => handleMoreFilterToggle(filter)}
                                                >
                                                    <div className="option-checkbox">
                                                        {isChecked && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none">
                                                                <path d="M8.75 0.75L3.48657 5.75L0.75 3.1502" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="option-label">{filter}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bottom-sheet-actions">
                            <button className="bottom-sheet-apply-btn" onClick={() => setIsFilterModalOpen(false)}>
                                APPLY
                            </button>
                            <button
                                className="bottom-sheet-reset-btn"
                                onClick={() => {
                                    handleResetAll();
                                    setIsFilterModalOpen(false);
                                }}
                            >
                                RESET FILTERS
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Sticky Bottom CTA Bar */}
            <div className="mobile-sticky-bottom-bar">
                <button
                    className="mobile-sticky-filter-btn"
                    onClick={() => setIsFilterModalOpen(true)}
                >
                    FILTER
                </button>
                <button
                    className="mobile-sticky-download-btn"
                    onClick={() => setIsCalendarModalOpen(true)}
                >
                    DOWNLOAD CALENDAR
                </button>
            </div>

            {/* Add to Calendar Modal (Google, Apple, Outlook, ICS) */}
            <AddToCalendarModal
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                events={filteredEvents && filteredEvents.length > 0 ? filteredEvents : events}
                calendarName="BLR Hubba 2027"
            />
        </div>
    );
};

export default EventListing;