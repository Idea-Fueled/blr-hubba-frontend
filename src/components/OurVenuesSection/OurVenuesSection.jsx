import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MotionSection, MotionCard } from "../AnimatedPage";
import "./OurVenuesSection.css";
import bicVenueImg from "../../assets/bic_venue_thumb.png";
import mapViewImg from "../../assets/map-view-image.png";
import { resolveVenueImageUrl } from "../../utils/venueImageResolver";
import { formatDistanceText, getRawDistanceKm, DEFAULT_USER_LOCATION } from "../../utils/venueLocationResolver";

const DEFAULT_VENUES = [
    {
        id: "bic",
        name: "Bangalore International Centre",
        address: "7, 4th Main Rd, 2 Stage, Domlur, Bengaluru, Karnataka 560071",
        image: bicVenueImg,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Bangalore+International+Centre",
        slug: "bangalore-international-centre",
        tags: ["wheelchair", "parking", "children", "food", "indoor"]
    },
    {
        id: "freedom-park",
        name: "Freedom Park",
        address: "Seshadri Rd, Gandhi Nagar, Bengaluru, Karnataka 560009",
        image: bicVenueImg,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Freedom+Park+Bengaluru",
        slug: "freedom-park",
        tags: ["wheelchair", "parking", "children", "outdoor"]
    },
    {
        id: "ngma",
        name: "National Gallery of Modern Art (NGMA)",
        address: "49, Palace Rd, Manikyavelu Mansion, Vasanth Nagar, Bengaluru, Karnataka 560052",
        image: bicVenueImg,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=National+Gallery+of+Modern+Art+Bengaluru",
        slug: "ngma",
        tags: ["wheelchair", "parking", "indoor", "outdoor"]
    },
    {
        id: "ranga-shankara",
        name: "Ranga Shankara",
        address: "36/2, 8th Cross Rd, JP Nagar 2nd Phase, Bengaluru, Karnataka 560078",
        image: bicVenueImg,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Ranga+Shankara+Bengaluru",
        slug: "ranga-shankara",
        tags: ["wheelchair", "food", "children", "indoor"]
    }
];

const DEFAULT_FALLBACK_TAGS = [
    ["wheelchair", "parking", "children", "food", "outdoor"],
    ["wheelchair", "parking", "children", "food", "indoor", "outdoor"],
    ["outdoor", "children", "food", "parking"],
    ["wheelchair", "parking", "food", "indoor"]
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

export const OurVenuesSection = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState(DEFAULT_VENUES);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all"); // 'all' or 'near_me'
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'
    const [userLocation, setUserLocation] = useState(null);

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
        // Fetch public venues from API if available
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/public/venues?limit=4`)
            .then(res => res.json())
            .then(data => {
                if (data && data.venues && data.venues.length > 0) {
                    const defaultFallbackTags = [
                        ["wheelchair", "parking", "children", "food", "indoor"],
                        ["wheelchair", "parking", "children", "outdoor"],
                        ["wheelchair", "parking", "indoor", "outdoor"],
                        ["wheelchair", "food", "children", "indoor"]
                    ];

                    const mapped = data.venues.slice(0, 4).map((v, i) => {
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

                        const addressStr = v.address || `${v.city || 'Bengaluru'}, Karnataka ${v.pinCode || ''}`.trim() || DEFAULT_VENUES[i % DEFAULT_VENUES.length].address;
                        const finalMapsLink = rawMapsLink
                            ? (rawMapsLink.startsWith("http") ? rawMapsLink : `https://${rawMapsLink}`)
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((v.name || 'Venue') + " " + addressStr)}`;

                        return {
                            ...v,
                            id: v.id || `v-${i}`,
                            name: v.name || DEFAULT_VENUES[i % DEFAULT_VENUES.length].name,
                            address: addressStr,
                            squareImageDesktop: v.squareImageDesktop,
                            squareImageMobile: v.squareImageMobile,
                            wideImageDesktop: v.wideImageDesktop,
                            wideImageMobile: v.wideImageMobile,
                            image: v.image || bicVenueImg,
                            googleMapsLink: finalMapsLink,
                            slug: v.slug || v.id,
                            tags: parseVenueTags(v, i),
                            amenities: (v.amenities && Array.isArray(v.amenities)) ? v.amenities : []
                        };
                    });
                    setVenues(mapped);
                }
            })
            .catch(() => {
                // Keep default venues on error or local dev
            });
    }, []);

    const getVenueListingImage = (v) => resolveVenueImageUrl(v, bicVenueImg, false);

    const toggleFilter = (filterKey) => {
        if (selectedFilters.includes(filterKey)) {
            setSelectedFilters(selectedFilters.filter(f => f !== filterKey));
        } else {
            setSelectedFilters([...selectedFilters, filterKey]);
        }
    };

    const filterOptions = [
        { key: "parking", label: "Parking Available", aliases: ["parking", "parking available", "parking-available", "parking_available", "valet", "car park", "vehicle"] },
        { key: "wheelchair", label: "Wheelchair Accessible", aliases: ["wheelchair", "wheelchair accessible", "wheelchair friendly", "wheelchair-friendly", "wheelchair_friendly", "ramp", "accessible", "handicap"] },
        { key: "cafe", label: "Cafe Available", aliases: ["cafe", "cafe available", "cafe-available", "cafe_available", "food", "food available", "food-available", "food_available", "food & drinks", "canteen", "restaurant", "dining"] },
        { key: "pet", label: "Pet Friendly", aliases: ["pet", "pet friendly", "pet-friendly", "pet_friendly", "dog", "dogs", "pets", "animal", "animals"] },
    ];

    const getFilteredVenues = () => {
        let baseVenues = venues;
        if (activeTab === 'near_me') {
            baseVenues = venues.slice(0, 2);
        }

        if (!selectedFilters || selectedFilters.length === 0) {
            return baseVenues;
        }

        const strictMatches = baseVenues.filter(venue => {
            const venueAllTags = [
                ...(venue.tags || []),
                ...(venue.amenities || [])
            ].map(t => String(t).toLowerCase().trim());

            return selectedFilters.every(filterKey => {
                const option = filterOptions.find(o => o.key === filterKey);
                const aliases = option ? option.aliases : [filterKey];
                return aliases.some(alias =>
                    venueAllTags.some(vt => vt.includes(alias) || alias.includes(vt))
                );
            });
        });

        if (strictMatches.length > 0) return strictMatches;

        return baseVenues.filter(venue => {
            const venueAllTags = [
                ...(venue.tags || []),
                ...(venue.amenities || [])
            ].map(t => String(t).toLowerCase().trim());

            return selectedFilters.some(filterKey => {
                const option = filterOptions.find(o => o.key === filterKey);
                const aliases = option ? option.aliases : [filterKey];
                return aliases.some(alias =>
                    venueAllTags.some(vt => vt.includes(alias) || alias.includes(vt))
                );
            });
        });
    };

    const filteredVenues = getFilteredVenues();

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
        setIsFilterOpen(false);
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

    return (
        <MotionSection className="hp-venues-section">
            <div className="hp-venues-container">

                {/* HEADER SECTION */}
                <div className="hp-venues-header">
                    <span className="hp-venues-subtitle">OUR VENUES</span>
                    <h2 className="hp-venues-title">
                        All the city’s a stage for BLR Hubba 4.0. <br className="hp-venues-desktop-br" />
                        Here’s where we’re headed.
                    </h2>
                </div>

                {/* FILTER / TOOLBAR ROW (Frame 628915) */}
                <div className="hp-venues-toolbar">
                    <div className="hp-venues-toolbar-top">
                        {viewMode === 'list' ? (
                            <div className="hp-venues-toolbar-left">
                                {/* VENUES NEAR ME BUTTON */}
                                <div
                                    className={`hp-venues-near-me-btn ${activeTab === 'near_me' ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsFilterOpen(false);
                                        handleNearMeToggle();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <g clipPath="url(#clip0_1977_26030)">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M9 15C12.329 15 15 12.355 15 9.027C15 5.698 12.329 3 9 3C5.671 3 3 5.698 3 9.027C3 12.355 5.671 15 9 15Z" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" fill="#181C20" />
                                            <path d="M1 9H3M15 9H17M9 1V3M9 15V17" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1977_26030">
                                                <rect width="18" height="18" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <span>VENUES NEAR ME</span>
                                </div>

                                <div
                                    className={`hp-venues-filter-by-label ${isFilterOpen ? 'active' : ''}`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <span>FILTER BY</span>
                                </div>
                            </div>
                        ) : (
                            <div />
                        )}

                        {/* MAP VIEW / LIST VIEW BUTTON */}
                        <div className="hp-venues-toolbar-right">
                            <button className="hp-venues-map-view-btn" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
                                {viewMode === 'map' ? (
                                    <>
                                        <span className="btn-text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                            </svg>
                                            <span>LIST VIEW</span>
                                        </span>
                                        <span className="btn-text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                            </svg>
                                            <span>LIST VIEW</span>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 6L9 2L2 6V22L9 18M16 6L22 2V18L16 22L9 18M9 18V2M16 22V6" />
                                            </svg>
                                            <span>MAP VIEW</span>
                                        </span>
                                        <span className="btn-text-secondary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 6L9 2L2 6V22L9 18M16 6L22 2V18L16 22L9 18M9 18V2M16 22V6" />
                                            </svg>
                                            <span>MAP VIEW</span>
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* CHECKBOXES / FILTER PILLS (Only in list view) */}
                    {viewMode === 'list' && (
                        <div className={`hp-venues-filter-checkboxes ${isFilterOpen ? 'open' : ''}`}>
                            {filterOptions.map(option => {
                                const isChecked = selectedFilters.includes(option.key);
                                return (
                                    <label
                                        key={option.key}
                                        className={`hp-venues-checkbox-label ${isChecked ? 'checked' : ''}`}
                                        onClick={() => toggleFilter(option.key)}
                                    >
                                        <span className={`hp-custom-checkbox ${isChecked ? 'active' : ''}`}>
                                            {isChecked && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        <span>{option.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* CONTENT AREA: MAP VIEW OR LIST VIEW GRID */}
                {viewMode === 'map' ? (
                    <div className="hp-map-view-container">
                        <div className="hp-map-image-wrapper">
                            <img src={mapViewImg} alt="BLR Hubba Map View" className="hp-map-view-img" />
                        </div>
                        <div className="hp-map-view-actions">
                            <a href={mapViewImg} download="BLR_Hubba_Venue_Map.png" className="hp-map-btn-white">
                                DOWNLOAD MAP
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* VENUES GRID */}
                        {displayedVenues.length > 0 ? (
                            <div className="hp-venues-grid">
                                {displayedVenues.map((venue, idx) => (
                                    <React.Fragment key={venue.id || idx}>
                                        <MotionCard className="hp-venue-card" index={idx}>
                                            <div className="hp-venue-card-top">
                                                <div className="hp-venue-card-img-container">
                                                    <img src={getVenueListingImage(venue)} alt={venue.name} className="hp-venue-card-img" onError={(e) => { e.target.onerror = null; e.target.src = bicVenueImg; }} />
                                                </div>
                                                <div className="hp-venue-card-info">
                                                    <span className="hp-venue-distance-badge">{formatDistanceText(venue, userLocation, idx)}</span>
                                                    <h3 className="hp-venue-card-title">{venue.name}</h3>
                                                    <p className="hp-venue-card-address">{venue.address}</p>

                                                    {/* Desktop only actions */}
                                                    <div className="hp-venue-card-actions hp-venue-desktop-actions">
                                                        <button
                                                            className="hp-venue-view-details-btn"
                                                            onClick={() => navigate(`/venues/${venue.slug || venue.id}`)}
                                                        >
                                                            <span className="btn-text-primary">VIEW DETAILS</span>
                                                            <span className="btn-text-secondary">VIEW DETAILS</span>
                                                        </button>

                                                        <a
                                                            href={venue.googleMapsLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hp-venue-view-map-link"
                                                        >
                                                            <span>VIEW ON MAP</span>
                                                            <div className="hp-venue-arrow-circle">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                                    <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                                                </svg>
                                                            </div>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile only actions */}
                                            <div className="hp-venue-card-actions hp-venue-mobile-actions">
                                                <button
                                                    className="hp-venue-view-details-btn"
                                                    onClick={() => navigate(`/venues/${venue.slug || venue.id}`)}
                                                >
                                                    <span className="btn-text-primary">VIEW DETAILS</span>
                                                    <span className="btn-text-secondary">VIEW DETAILS</span>
                                                </button>

                                                <a
                                                    href={venue.googleMapsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hp-venue-view-map-link"
                                                >
                                                    <span>VIEW ON MAP</span>
                                                    <div className="hp-venue-arrow-circle">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                            <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                                        </svg>
                                                    </div>
                                                </a>
                                            </div>
                                        </MotionCard>
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <div style={{ width: "100%", padding: "60px 0", textAlign: "center", fontFamily: "'Roboto Condensed', sans-serif", fontSize: "18px", color: "#666" }}>
                                No venues found matching the selected filters.
                            </div>
                        )}

                        {/* VIEW ALL VENUES BUTTON */}
                        <div className="hp-venues-bottom-cta">
                            <button className="hp-venues-view-all-btn" onClick={() => navigate("/venues")}>
                                <span className="btn-text-primary">VIEW ALL VENUES</span>
                                <span className="btn-text-secondary">VIEW ALL VENUES</span>
                            </button>
                        </div>
                    </>
                )}

            </div>
        </MotionSection>
    );
};

export default OurVenuesSection;
