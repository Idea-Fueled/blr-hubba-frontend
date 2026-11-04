import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MotionCard, MotionMaskText, MotionButton } from "../../components/AnimatedPage";
import "./VenuesPage.css";
import bicVenueImg from "../../assets/bic_venue_thumb.png";
import mapViewImg from "../../assets/map-view-image.png";
import { resolveVenueImageUrl } from "../../utils/venueImageResolver";
import { formatDistanceText, getRawDistanceKm, DEFAULT_USER_LOCATION } from "../../utils/venueLocationResolver";
import { Loader } from "../../components/Loader/Loader";
import { getApiBaseUrl } from "../../config/api";

const DEFAULT_FALLBACK_TAGS = [
    ["wheelchair", "parking", "children", "food"],
    ["wheelchair", "parking", "children", "food"],
    ["children", "food", "parking"],
    ["wheelchair", "parking", "food"],
    ["wheelchair", "children", "food"],
    ["wheelchair", "parking"]
];

const parseVenueTags = (v, index = 0) => {
    const tagSet = new Set();

    const addString = (str) => {
        if (!str || typeof str !== 'string') return;
        const normalized = str.toLowerCase().trim();
        if (normalized) tagSet.add(normalized);
    };

    const processItems = (items) => {
        if (!items) return;
        if (typeof items === 'string') {
            try {
                const parsed = JSON.parse(items);
                if (Array.isArray(parsed)) {
                    parsed.forEach(processItems);
                    return;
                }
            } catch (e) {
                items.split(',').forEach(addString);
                return;
            }
        }
        if (Array.isArray(items)) {
            items.forEach(item => {
                if (typeof item === 'string') addString(item);
                else if (item && typeof item === 'object') {
                    addString(item.name || item.title || item.label || item.value || item.key);
                }
            });
        }
    };

    processItems(v.tags);
    processItems(v.amenities);
    processItems(v.facilities);
    processItems(v.features);

    // Check boolean flags
    if (v.wheelchair || v.wheelchairFriendly || v.isWheelchairFriendly || v.wheelchair_friendly) tagSet.add("wheelchair");
    if (v.parking || v.parkingAvailable || v.hasParking || v.parking_available) tagSet.add("parking");
    if (v.children || v.childrenFriendly || v.kidsFriendly || v.childFriendly || v.children_friendly) tagSet.add("children");
    if (v.food || v.foodAvailable || v.hasFood || v.food_available) tagSet.add("food");

    if (tagSet.size === 0) {
        const fallbacks = DEFAULT_FALLBACK_TAGS[index % DEFAULT_FALLBACK_TAGS.length];
        fallbacks.forEach(t => tagSet.add(t));
    }

    return Array.from(tagSet);
};

const DEFAULT_FESTIVAL_DATES = [
    { value: "2027-01-15", day: "15", weekday: "FRI", label: "15 Jan 2027", shortLabel: "15 Jan" },
    { value: "2027-01-16", day: "16", weekday: "SAT", label: "16 Jan 2027", shortLabel: "16 Jan" },
    { value: "2027-01-17", day: "17", weekday: "SUN", label: "17 Jan 2027", shortLabel: "17 Jan" },
    { value: "2027-01-18", day: "18", weekday: "MON", label: "18 Jan 2027", shortLabel: "18 Jan" },
    { value: "2027-01-19", day: "19", weekday: "TUE", label: "19 Jan 2027", shortLabel: "19 Jan" },
    { value: "2027-01-20", day: "20", weekday: "WED", label: "20 Jan 2027", shortLabel: "20 Jan" },
    { value: "2027-01-21", day: "21", weekday: "THU", label: "21 Jan 2027", shortLabel: "21 Jan" },
    { value: "2027-01-22", day: "22", weekday: "FRI", label: "22 Jan 2027", shortLabel: "22 Jan" },
    { value: "2027-01-23", day: "23", weekday: "SAT", label: "23 Jan 2027", shortLabel: "23 Jan" },
    { value: "2027-01-24", day: "24", weekday: "SUN", label: "24 Jan 2027", shortLabel: "24 Jan" }
];

const VENUE_TYPE_OPTIONS = [
    { key: "Venues", label: "Venues" },
    { key: "Sites", label: "Sites" }
];

const isSiteVenue = (venue) => {
    const rawType = (venue.category || venue.type || venue.venueType || "").toLowerCase().trim();
    if (rawType === "sites" || rawType === "site") return true;
    if (rawType === "venues" || rawType === "venue") return false;
    return false;
};

export const VenuesPage = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null); // 'date' | 'type' | null
    const [activeTab, setActiveTab] = useState("all");
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'
    const [userLocation, setUserLocation] = useState(null);

    const toolbarRef = useRef(null);
    const dateDropdownRef = useRef(null);

    // Dynamically derive available dates from venues (or fallback to festival presets)
    const dynamicDates = useMemo(() => {
        const dateSet = new Set();
        venues.forEach(v => {
            if (Array.isArray(v.availableDates)) {
                v.availableDates.forEach(d => {
                    if (d && typeof d === "string") {
                        const trimmed = d.split("T")[0].trim();
                        if (trimmed) dateSet.add(trimmed);
                    }
                });
            }
        });

        const sourceDates = dateSet.size > 0 ? Array.from(dateSet) : DEFAULT_FESTIVAL_DATES.map(d => d.value);

        const weekdayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        return sourceDates.sort().map(val => {
            const parts = val.split("-");
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const mIdx = parseInt(parts[1], 10) - 1;
                const dNum = parseInt(parts[2], 10);
                const dObj = new Date(year, mIdx, dNum);
                const weekday = weekdayNames[dObj.getDay()] || "";
                const shortMonth = monthNames[mIdx] || "";
                const fullMonth = fullMonthNames[mIdx] || "";
                return {
                    value: val,
                    day: String(dNum).padStart(2, "0"),
                    weekday,
                    label: `${dNum} ${shortMonth} ${year}`,
                    shortLabel: `${dNum} ${shortMonth}`,
                    monthYearHeader: `${fullMonth}, ${year}`
                };
            }
            return {
                value: val,
                day: val,
                weekday: "",
                label: val,
                shortLabel: val,
                monthYearHeader: "Festival Dates"
            };
        });
    }, [venues]);

    const activeMonthHeader = useMemo(() => {
        if (dynamicDates.length > 0 && dynamicDates[0].monthYearHeader) {
            return dynamicDates[0].monthYearHeader;
        }
        return "January, 2027";
    }, [dynamicDates]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
                if (openDropdown === 'date') setOpenDropdown(null);
            }
            if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    setUserLocation(DEFAULT_USER_LOCATION);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
            );
        } else {
            setUserLocation(DEFAULT_USER_LOCATION);
        }
    }, []);

    useEffect(() => {
        const API_URL = getApiBaseUrl();
        fetch(`${API_URL}/public/venues`)
            .then(res => res.json())
            .then(data => {
                if (data && data.venues && data.venues.length > 0) {
                    const mapped = data.venues.map((v, i) => {
                        const rawMapsLink = (
                            v.googleMapsLink ||
                            v.googleMapLink ||
                            v.googleMapsUrl ||
                            v.googleMapUrl ||
                            v.mapUrl ||
                            v.mapLink ||
                            v.locationUrl ||
                            ""
                        ).trim();

                        const addressStr = v.address || `${v.city || 'Bengaluru'}, Karnataka ${v.pinCode || ''}`.trim();
                        const finalMapsLink = rawMapsLink
                            ? (rawMapsLink.startsWith("http") ? rawMapsLink : `https://${rawMapsLink}`)
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((v.name || 'Venue') + " " + addressStr)}`;

                        return {
                            ...v,
                            id: v.id || `v-${i}`,
                            name: v.name || 'BLR Hubba Venue',
                            address: addressStr,
                            squareImageDesktop: v.squareImageDesktop,
                            squareImageMobile: v.squareImageMobile,
                            wideImageDesktop: v.wideImageDesktop,
                            wideImageMobile: v.wideImageMobile,
                            image: v.image || bicVenueImg,
                            googleMapsLink: finalMapsLink,
                            slug: v.slug || v.id,
                            tags: parseVenueTags(v, i),
                            amenities: (v.amenities && Array.isArray(v.amenities)) ? v.amenities : [],
                            distance: "1.5 Kms"
                        };
                    });
                    setVenues(mapped);
                }
            })
            .catch(() => { })
            .finally(() => {
                setIsLoading(false);
            });

        // Fetch events to support date filtering
        fetch(`${API_URL}/public/events?limit=500`)
            .then(res => res.json())
            .then(data => {
                if (data && data.events) {
                    setEvents(data.events);
                }
            })
            .catch(() => { });
    }, []);

    const toggleDateFilter = (val) => {
        setSelectedDates(prev =>
            prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
        );
    };

    const toggleTypeFilter = (key) => {
        setSelectedTypes(prev =>
            prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
        );
    };

    const clearAllFilters = () => {
        setSelectedDates([]);
        setSelectedTypes([]);
    };

    const filteredVenues = venues.filter(venue => {
        // Filter by Type (Venues vs Sites)
        if (selectedTypes.length > 0) {
            const hasVenues = selectedTypes.includes("Venues");
            const hasSites = selectedTypes.includes("Sites");

            if (hasVenues && !hasSites) {
                if (isSiteVenue(venue)) return false;
            } else if (hasSites && !hasVenues) {
                if (!isSiteVenue(venue)) return false;
            }
        }

        // Filter by Date
        if (selectedDates.length > 0) {
            // Check direct venue availableDates first
            const venueHasDirectDates = Array.isArray(venue.availableDates) && venue.availableDates.length > 0;
            if (venueHasDirectDates) {
                const matchesDate = selectedDates.some(targetDateStr => {
                    return venue.availableDates.some(d => {
                        const dStr = (d || "").split("T")[0].trim();
                        return dStr === targetDateStr;
                    });
                });
                if (!matchesDate) return false;
            } else {
                // Fallback to checking events hosted at this venue
                const venueEvents = events.filter(ev => {
                    const vId = ev.venue?.id || ev.venueId;
                    const vName = (ev.venue?.name || ev.venue || "").toLowerCase().trim();
                    const thisVenueName = (venue.name || "").toLowerCase().trim();
                    return (venue.id && vId === venue.id) || (thisVenueName && vName.includes(thisVenueName)) || (vName && thisVenueName.includes(vName));
                });

                if (venueEvents.length > 0) {
                    const hasEventOnDate = venueEvents.some(ev => {
                        return selectedDates.some(targetDateStr => {
                            if (ev.eventDates && Array.isArray(ev.eventDates)) {
                                const match = ev.eventDates.some(ed => {
                                    const dStr = (ed.date || ed.startDateTime || "").split("T")[0];
                                    return dStr === targetDateStr;
                                });
                                if (match) return true;
                            }
                            if (ev.startDateTime) {
                                const startStr = ev.startDateTime.split("T")[0];
                                const endStr = (ev.endDateTime || ev.startDateTime).split("T")[0];
                                return targetDateStr >= startStr && targetDateStr <= endStr;
                            }
                            return false;
                        });
                    });
                    if (!hasEventOnDate) return false;
                } else {
                    return false;
                }
            }
        }

        return true;
    });

    const displayedVenues = [...filteredVenues];
    if (activeTab === 'near_me') {
        displayedVenues.sort((a, b) => {
            const distA = getRawDistanceKm(a, userLocation);
            const distB = getRawDistanceKm(b, userLocation);
            return distA - distB;
        });
    }

    const handleNearMeToggle = () => {
        const nextTab = activeTab === 'near_me' ? 'all' : 'near_me';
        setActiveTab(nextTab);
        setOpenDropdown(null);
        if (nextTab === 'near_me' && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    setUserLocation(DEFAULT_USER_LOCATION);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        }
    };

    const getVenueListingImage = (v) => resolveVenueImageUrl(v, bicVenueImg, false);

    return (
        <div className="venue-listing-page">
            {/* HERO BANNER SECTION (Frame 2407) */}
            <div className="venue-hero-wrapper">
                <div className="venue-hero-card">
                    <div className="venue-hero-content">
                        <MotionMaskText delay={0.05}>
                            <span className="venue-hero-subtitle">OUR VENUES</span>
                        </MotionMaskText>
                        <MotionMaskText delay={0.12}>
                            <h1 className="venue-hero-title">Explore venues near you</h1>
                        </MotionMaskText>
                    </div>
                </div>
            </div>

            {/* MAIN VENUES CONTENT */}
            <div className="venue-page-container">
                {/* TOOLBAR ROW (Frame 1000004407) */}
                <div className="venue-toolbar" ref={toolbarRef}>
                    <div className="venue-toolbar-top">
                        {viewMode === 'list' ? (
                            <div className="venue-toolbar-left">
                                <div
                                    className={`venue-filter-tab venue-near-me-btn ${activeTab === 'near_me' ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(null);
                                        handleNearMeToggle();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <g clip-path="url(#clip0_5091_31747)">
                                            <path d="M9 15C12.329 15 15 12.355 15 9.027C15 5.698 12.329 3 9 3C5.671 3 3 5.698 3 9.027C3 12.355 5.671 15 9 15Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#181C20" />
                                            <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" fill="#181C20" />
                                            <path d="M1 9H3M15 9H17M9 1V3M9 15V17" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#181C20" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_5091_31747">
                                                <rect width="18" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <span>VENUE NEAR ME</span>
                                </div>

                                {/* FILTER BY DATE (Figma 56:1036) */}
                                <div
                                    className={`venue-filter-tab ${selectedDates.length > 0 || openDropdown === 'date' ? 'active' : ''}`}
                                    onClick={() => setOpenDropdown(prev => prev === 'date' ? null : 'date')}
                                >
                                    <span>FILTER BY DATE</span>
                                    <svg
                                        className={`venue-chevron ${openDropdown === 'date' ? 'open' : ''}`}
                                        width="14" height="8" viewBox="0 0 14 8" fill="none"
                                    >
                                        <path d="M1 1L7 7L13 1" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>

                                {/* FILTER BY TYPE (Figma 50:195) */}
                                <div
                                    className={`venue-filter-tab ${selectedTypes.length > 0 || openDropdown === 'type' ? 'active' : ''}`}
                                    onClick={() => setOpenDropdown(prev => prev === 'type' ? null : 'type')}
                                >
                                    <span>FILTER BY TYPE</span>
                                    <svg
                                        className={`venue-chevron ${openDropdown === 'type' ? 'open' : ''}`}
                                        width="14" height="8" viewBox="0 0 14 8" fill="none"
                                    >
                                        <path d="M1 1L7 7L13 1" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div />
                        )}

                        <div className="venue-toolbar-right">
                            <button className="venue-map-view-btn" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
                                {viewMode === 'map' ? (
                                    <>
                                        <span className="btn-text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 26 26" fill="none">
                                                <path d="M8.66667 6.5H22.75M8.66667 13H22.75M8.66667 19.5H22.75M3.25 6.5H3.26083M3.25 13H3.26083M3.25 19.5H3.26083" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>LIST VIEW</span>
                                        </span>
                                        <span className="btn-text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 26 26" fill="none">
                                                <path d="M8.66667 6.5H22.75M8.66667 13H22.75M8.66667 19.5H22.75M3.25 6.5H3.26083M3.25 13H3.26083M3.25 19.5H3.26083" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>LIST VIEW</span>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M16 6L9 2L2 6V22L9 18M16 6L22 2V18L16 22L9 18M9 18V2M16 22V6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>MAP VIEW</span>
                                        </span>
                                        <span className="btn-text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M16 6L9 2L2 6V22L9 18M16 6L22 2V18L16 22L9 18M9 18V2M16 22V6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>MAP VIEW</span>
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* INLINE FILTER BY DATE (Figma 56:1036) */}
                    {viewMode === 'list' && openDropdown === 'date' && (
                        <div className="venue-date-filter-row venue-inline-date-filter-row">
                            <span className="venue-date-filter-month">{activeMonthHeader}</span>
                            <div className="venue-date-cards-scroll">
                                {dynamicDates.map(date => {
                                    const isChecked = selectedDates.includes(date.value);
                                    return (
                                        <button
                                            key={date.value}
                                            type="button"
                                            className={`venue-date-card ${isChecked ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDateFilter(date.value);
                                            }}
                                        >
                                            <span className="venue-date-card-num">{date.day}</span>
                                            <span className="venue-date-card-day">{date.weekday}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* INLINE FILTER BY TYPE (Figma 50:195 Frame 1522) */}
                    {viewMode === 'list' && openDropdown === 'type' && (
                        <div className="venue-type-filter-row">
                            {VENUE_TYPE_OPTIONS.map(opt => {
                                const isChecked = selectedTypes.includes(opt.key);
                                return (
                                    <label
                                        key={opt.key}
                                        className={`venue-type-checkbox-item ${isChecked ? 'selected' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTypeFilter(opt.key);
                                        }}
                                    >
                                        <span className={`venue-type-checkbox ${isChecked ? 'active' : ''}`}>
                                            {isChecked && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="venue-type-checkbox-label">{opt.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* ACTIVE FILTER CHIPS ROW (Frame 1000004407) */}
                    {viewMode === 'list' && (selectedDates.length > 0 || selectedTypes.length > 0) && (
                        <div className="venue-active-chips-row">
                            {selectedDates.map(dVal => {
                                const dObj = dynamicDates.find(d => d.value === dVal);
                                const label = dObj ? dObj.shortLabel || dObj.label : dVal;
                                return (
                                    <div
                                        key={`chip-date-${dVal}`}
                                        className="venue-filter-chip"
                                    >
                                        <span>{label}</span>
                                        <span
                                            className="venue-filter-chip-remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDateFilter(dVal);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M9 3L3 9M3 3L9 9" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                );
                            })}

                            {selectedTypes.map(tKey => {
                                const tObj = VENUE_TYPE_OPTIONS.find(t => t.key === tKey);
                                const label = tObj ? tObj.label : tKey;
                                return (
                                    <div
                                        key={`chip-type-${tKey}`}
                                        className="venue-filter-chip"
                                    >
                                        <span>{label}</span>
                                        <span
                                            className="venue-filter-chip-remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTypeFilter(tKey);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M9 3L3 9M3 3L9 9" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                className="venue-clear-all-btn"
                                onClick={clearAllFilters}
                            >
                                CLEAR ALL
                            </button>
                        </div>
                    )}
                </div>

                {/* CONTENT AREA: MAP VIEW OR LIST VIEW GRID */}
                {viewMode === 'map' ? (
                    <div className="venue-map-view-container">
                        <div className="venue-map-image-wrapper">
                            <img src={mapViewImg} alt="BLR Hubba Map View" className="venue-map-view-img" />
                        </div>
                        <div className="venue-map-view-actions">
                            <a href={mapViewImg} download="BLR_Hubba_Venue_Map.png" className="venue-map-btn-white">
                                DOWNLOAD MAP
                            </a>
                        </div>
                    </div>
                ) : isLoading ? (
                    <Loader text="Loading Venues..." />
                ) : (
                    <>
                        {/* 2-COLUMN VENUES GRID (Frame 1000004434) */}
                        {displayedVenues.length > 0 ? (
                            <div className="venue-cards-grid">
                                {displayedVenues.map((venue, idx) => {
                                    const isSite = isSiteVenue(venue);
                                    return (
                                        <MotionCard className="venue-listing-card" key={venue.id || idx} index={idx}>
                                            <div className={`venue-card-img-container ${isSite ? 'venue-card-site-img-container' : ''}`}>
                                                {activeTab === 'near_me' && (
                                                    <div className="venue-card-distance-badge">
                                                        {formatDistanceText(venue, userLocation, idx)}
                                                    </div>
                                                )}
                                                {isSite ? (
                                                    <div className="venue-card-site-icon-wrapper">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76" fill="none">
                                                            <path d="M50.6654 42.3524C61.8494 44.5513 69.6654 49.5733 69.6654 55.4167C69.6654 63.2867 55.4877 69.6667 37.9987 69.6667C20.5097 69.6667 6.33203 63.2867 6.33203 55.4167C6.33203 49.5733 14.148 44.5513 25.332 42.3524M37.9987 53.8333V9.5L54.8381 19.8627C56.0665 20.6186 56.6806 20.9966 56.8765 21.4727C57.0474 21.888 57.0339 22.3563 56.8393 22.7611C56.6163 23.2251 55.9813 23.567 54.7115 24.2508L37.9987 33.25" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" stroke="white" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={getVenueListingImage(venue)}
                                                        alt={venue.name}
                                                        className="venue-card-img"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = bicVenueImg; }}
                                                    />
                                                )}
                                            </div>

                                            <div className="venue-card-info">
                                                <div className="venue-card-header">
                                                    <h3 className="venue-card-title">{venue.name}</h3>
                                                    <p className="venue-card-address">{venue.address}</p>
                                                </div>

                                                <div className="venue-card-actions">
                                                    {!isSite && (
                                                        <button
                                                            type="button"
                                                            className="venue-view-details-btn"
                                                            onClick={() => navigate(`/venues/${venue.slug || venue.id}`)}
                                                        >
                                                            <span className="btn-text-primary">VIEW DETAILS</span>
                                                            <span className="btn-text-secondary">VIEW DETAILS</span>
                                                        </button>
                                                    )}

                                                    <a
                                                        href={venue.googleMapsLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="venue-view-map-link"
                                                    >
                                                        <span>VIEW ON MAP</span>
                                                        <div className="venue-arrow-circle">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                                <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                                            </svg>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </MotionCard>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ width: "100%", padding: "60px 0", textAlign: "center", fontFamily: "'Roboto', sans-serif", fontSize: "18px", color: "#666" }}>
                                No venues found matching the selected filters.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VenuesPage;
