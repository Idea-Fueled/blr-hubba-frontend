import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MotionSection } from "../../components/AnimatedPage";
import "./VenueDetailPage.css";
import bicVenueImg from "../../assets/bic_venue_thumb.png";
import { EventCard } from "../../components/events/EventCard";
import { EventListing } from "../../components/EventListingSection/EventListing";
import { EventFAQs } from "../../components/EventListingSection/EventFAQs";
import { mapBackendEventToCard } from "../../utils/eventMappers";
import { resolveVenueImageUrl } from "../../utils/venueImageResolver";
import { Loader } from "../../components/Loader/Loader";

// 15 Figma Amenities Icons
import paidParkingIcon from "../../assets/amenities/paid_parking_nearby.png";
import freeParkingIcon from "../../assets/amenities/free_parking_nearby.png";
import onsiteParkingIcon from "../../assets/amenities/onsite_parking.png";
import metroStationIcon from "../../assets/amenities/metro_station_nearby.png";
import wheelchairIcon from "../../assets/amenities/wheelchair_friendly.png";
import rampIcon from "../../assets/amenities/ramp_available.png";
import accessibleToiletsIcon from "../../assets/amenities/accessible_toilets.png";
import familyFriendlyIcon from "../../assets/amenities/family_friendly.png";
import nursingRoomIcon from "../../assets/amenities/nursing_room_available.png";
import onsiteCafeIcon from "../../assets/amenities/onsite_cafe.png";
import pantryIcon from "../../assets/amenities/pantry.png";
import eateriesIcon from "../../assets/amenities/eateries_near_me.png";
import indoorSpacesIcon from "../../assets/amenities/indoor_spaces.png";
import indoorStageIcon from "../../assets/amenities/indoor_stage.png";
import freeWifiIcon from "../../assets/amenities/free_wifi.png";

const ALL_AMENITIES_CONFIG = [
    { id: "paid_parking_nearby", label: "Paid parking nearby", icon: paidParkingIcon, aliases: ["paid_parking", "paid_parking_nearby", "paid parking", "paid parking nearby"] },
    { id: "free_parking_nearby", label: "Free parking nearby", icon: freeParkingIcon, aliases: ["free_parking", "free_parking_nearby", "free parking", "free parking nearby"] },
    { id: "onsite_parking", label: "Onsite Parking", icon: onsiteParkingIcon, aliases: ["onsite_parking", "onsite parking", "parking", "Parking Available", "Parking"] },
    { id: "metro_station_nearby", label: "Metro station nearby", icon: metroStationIcon, aliases: ["metro_station_nearby", "metro", "metro station", "metro nearby", "metro station nearby"] },
    { id: "wheelchair_friendly", label: "Wheelchair Friendly", icon: wheelchairIcon, aliases: ["wheelchair_friendly", "wheelchair", "Wheelchair Accessible", "Wheelchair Friendly", "accessible"] },
    { id: "ramp_available", label: "Ramp Available", icon: rampIcon, aliases: ["ramp_available", "ramp", "Ramp Available"] },
    { id: "accessible_toilets", label: "Accessible Toilets", icon: accessibleToiletsIcon, aliases: ["accessible_toilets", "accessible toilets", "toilet", "toilets"] },
    { id: "family_friendly", label: "Family Friendly", icon: familyFriendlyIcon, aliases: ["family_friendly", "children", "Family Friendly", "kids", "child friendly"] },
    { id: "nursing_room_available", label: "Nursing Room Available", icon: nursingRoomIcon, aliases: ["nursing_room_available", "nursing room", "Nursing Room Available"] },
    { id: "onsite_cafe", label: "On-site cafe", icon: onsiteCafeIcon, aliases: ["onsite_cafe", "cafe", "Cafe Available", "Cafe"] },
    { id: "pantry", label: "Pantry", icon: pantryIcon, aliases: ["pantry"] },
    { id: "eateries_near_me", label: "Eateries Near Me", icon: eateriesIcon, aliases: ["eateries_near_me", "eateries", "food", "Food Available", "Food & Drinks Available"] },
    { id: "indoor_spaces", label: "Indoor Spaces", icon: indoorSpacesIcon, aliases: ["indoor_spaces", "indoor", "Indoor Spaces"] },
    { id: "indoor_stage", label: "Indoor Spaces (Stage)", icon: indoorStageIcon, aliases: ["indoor_stage", "stage", "auditorium"] },
    { id: "free_wifi", label: "Free Wifi", icon: freeWifiIcon, aliases: ["free_wifi", "wifi", "Free Wifi"] },
];

const getActiveVenueAmenities = (amenitiesList = []) => {
    if (!Array.isArray(amenitiesList) || amenitiesList.length === 0) return [];
    const normalized = amenitiesList.map(a => String(a).toLowerCase().trim());
    return ALL_AMENITIES_CONFIG.filter(configItem => {
        const idMatch = normalized.includes(configItem.id.toLowerCase());
        const labelMatch = normalized.includes(configItem.label.toLowerCase());
        const aliasMatch = configItem.aliases && configItem.aliases.some(alias => normalized.includes(alias.toLowerCase()));
        return idMatch || labelMatch || aliasMatch;
    });
};

const DEFAULT_SPACES = [
    "AUDITORIUM",
    "HALL 1",
    "HALL 2",
    "GALLERY",
    "BOARDROOM",
    "LIBRARY",
    "AMPHITHEATRE",
    "ROOFTOP / TERRACE",
    "GROUND FLOOR LOBBY",
    "FIRST FLOOR LOBBY",
    "WALKWAY TO AMPHITHEATRE",
    "GARDEN"
];

export const VenueDetailPage = () => {
    const navigate = useNavigate();
    const { venueSlug } = useParams();

    const [activeReachTab, setActiveReachTab] = useState("metro"); // 'metro', 'road', 'bus'
    const [openFaqId, setOpenFaqId] = useState(null);
    const [similarEvents, setSimilarEvents] = useState([]);
    const [isScrollable, setIsScrollable] = useState(false);
    const [venueData, setVenueData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reachInfo, setReachInfo] = useState({ metro: "", bus: "", road: "" });

    const carouselRef = useRef(null);

    useEffect(() => {
        if (!venueSlug) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const applyVenue = (v) => {
            if (!v || !v.name) return;
            const addressStr = v.address || v.location || [v.city, v.state, v.pinCode].filter(Boolean).join(", ") || "";
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

            const mapsUrl = rawMapsLink
                ? (rawMapsLink.startsWith("http") ? rawMapsLink : `https://${rawMapsLink}`)
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + " " + addressStr)}`;
            const aboutStr = v.shortDescription || v.fullDescription || "";
            let rawAmenities = [];
            if (Array.isArray(v.amenities) && v.amenities.length > 0) {
                rawAmenities = v.amenities;
            } else if (Array.isArray(v.tags) && v.tags.length > 0) {
                rawAmenities = v.tags;
            } else if (typeof v.amenities === 'string' && v.amenities.trim()) {
                try {
                    const p = JSON.parse(v.amenities);
                    if (Array.isArray(p)) rawAmenities = p;
                    else rawAmenities = v.amenities.split(',');
                } catch (e) {
                    rawAmenities = v.amenities.split(',');
                }
            }
            const amenitiesList = rawAmenities.map(a => (typeof a === 'string' ? a.trim() : (a?.name || a?.label || a?.id || ''))).filter(Boolean);
            if ((v.wheelchair || v.wheelchairFriendly) && !amenitiesList.includes("wheelchair_friendly") && !amenitiesList.includes("wheelchair")) {
                amenitiesList.push("wheelchair_friendly");
            }
            if ((v.parking || v.parkingAvailable) && !amenitiesList.includes("onsite_parking") && !amenitiesList.includes("parking")) {
                amenitiesList.push("onsite_parking");
            }
            if ((v.cafe || v.cafeAvailable) && !amenitiesList.includes("onsite_cafe") && !amenitiesList.includes("cafe")) {
                amenitiesList.push("onsite_cafe");
            }

            let spaces = [];
            if (v.subVenues && Array.isArray(v.subVenues) && v.subVenues.length > 0) {
                spaces = v.subVenues.map(sv => (typeof sv === 'string' ? sv : sv.name)).filter(Boolean);
            }
            setVenueData({
                ...v,
                name: v.name,
                address: addressStr,
                googleMapsLink: mapsUrl,
                about: aboutStr,
                amenities: amenitiesList,
                subVenues: spaces,
                faqs: (v.faqs && Array.isArray(v.faqs) && v.faqs.length > 0) ? v.faqs : (v.faq && Array.isArray(v.faq) && v.faq.length > 0 ? v.faq : null),
                wideImageDesktop: v.wideImageDesktop,
                wideImageMobile: v.wideImageMobile,
                squareImageDesktop: v.squareImageDesktop,
                squareImageMobile: v.squareImageMobile,
                image: v.image || bicVenueImg
            });

            // Populate how-to-reach info
            const metro = (v.metroInfo || v.howToReachMetro || v.byMetro || (v.howToReach && v.howToReach.metro) || "").trim();
            const bus = (v.busInfo || v.howToReachBus || v.byBus || (v.howToReach && v.howToReach.bus) || "").trim();
            const road = (v.roadInfo || v.howToReachRoad || v.byRoad || (v.howToReach && v.howToReach.road) || "").trim();
            const newReach = { metro, bus, road };
            setReachInfo(newReach);
            // Default active tab to 'metro' on initial load & reload
            setActiveReachTab("metro");
        };

        fetch(`${API_URL}/public/venues/${venueSlug}`)
            .then(res => {
                if (!res.ok) throw new Error("Venue not found by slug");
                return res.json();
            })
            .then(data => {
                const v = data?.venue || data;
                applyVenue(v);
            })
            .catch(() => {
                return fetch(`${API_URL}/public/venues`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.venues) {
                            const cleanSlug = venueSlug.toLowerCase().trim();
                            const found = data.venues.find(v =>
                                (v.slug && v.slug.toLowerCase() === cleanSlug) ||
                                (v.id && String(v.id).toLowerCase() === cleanSlug) ||
                                (v.name && v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug)
                            );
                            if (found) {
                                applyVenue(found);
                            }
                        }
                    });
            })
            .catch(() => { })
            .finally(() => {
                setIsLoading(false);
            });
    }, [venueSlug]);

    useEffect(() => {
        const checkScrollable = () => {
            if (carouselRef.current) {
                const { scrollWidth, clientWidth } = carouselRef.current;
                setIsScrollable(scrollWidth > clientWidth + 5 && similarEvents.length > 4);
            } else {
                setIsScrollable(similarEvents.length > 4);
            }
        };

        checkScrollable();
        const timer = setTimeout(checkScrollable, 250);
        window.addEventListener("resize", checkScrollable);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", checkScrollable);
        };
    }, [similarEvents]);

    useEffect(() => {
        if (!venueSlug) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/public/venues/${venueSlug}/events`)
            .then(res => {
                if (!res.ok) throw new Error("Venue events not found");
                return res.json();
            })
            .then(data => {
                const eventsList = data?.data?.events || data?.events || [];
                if (eventsList && eventsList.length > 0) {
                    const mapped = eventsList.map(mapBackendEventToCard);
                    setSimilarEvents(mapped);
                } else {
                    throw new Error("Empty events from backend venue endpoint");
                }
            })
            .catch(() => {
                fetch(`${API_URL}/public/events?includePast=true&limit=1000`)
                    .then(res => res.json())
                    .then(data => {
                        const eventsArr = data?.events || data?.data?.events || [];
                        if (eventsArr && eventsArr.length > 0) {
                            const cleanSlug = String(venueSlug).toLowerCase().trim();
                            const cleanName = (venueData?.name || "").toLowerCase().trim();

                            const filtered = eventsArr.filter(e => {
                                const eVenueName = (typeof e.venue === 'string' ? e.venue : (e.venue?.name || e.venueName || "")).toLowerCase();
                                const eVenueSlug = (e.venue?.slug || e.venueSlug || "").toLowerCase();
                                const eVenueId = String(e.venue?.id || e.venueId || "").toLowerCase();

                                const matchesSlug = cleanSlug && (eVenueSlug.includes(cleanSlug) || eVenueName.includes(cleanSlug) || eVenueId === cleanSlug);
                                const matchesName = cleanName && (eVenueName.includes(cleanName) || eVenueSlug.includes(cleanName));

                                // Check eventDates array (for multi-venue or date-specific venue matches)
                                const matchesDates = (e.eventDates || []).some(ed => {
                                    const edVenueName = (ed.venue?.name || "").toLowerCase();
                                    const edVenueSlug = (ed.venue?.slug || "").toLowerCase();
                                    const edVenueId = String(ed.venue?.id || ed.venueId || "").toLowerCase();
                                    return (cleanSlug && (edVenueSlug.includes(cleanSlug) || edVenueName.includes(cleanSlug) || edVenueId === cleanSlug)) ||
                                        (cleanName && edVenueName.includes(cleanName));
                                });

                                // Check venueIds array
                                const matchesVenueIds = (e.venueIds || []).some(v => {
                                    const vName = (typeof v === 'string' ? v : (v.name || v.slug || v.id || '')).toLowerCase();
                                    return (cleanSlug && vName.includes(cleanSlug)) || (cleanName && vName.includes(cleanName));
                                });

                                return matchesSlug || matchesName || matchesDates || matchesVenueIds;
                            });

                            const mapped = filtered.map(mapBackendEventToCard);
                            setSimilarEvents(mapped);
                        } else {
                            setSimilarEvents([]);
                        }
                    })
                    .catch(() => {
                        setSimilarEvents([]);
                    });
            });
    }, [venueSlug, venueData?.name]);

    const toggleFaq = (id) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

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

    const getVenueHeroImage = (v) => resolveVenueImageUrl(v, bicVenueImg, true);

    if (isLoading) {
        return (
            <div className="venue-detail-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader text="Loading Venue Details..." />
            </div>
        );
    }

    if (!venueData) {
        return (
            <div className="venue-detail-page" style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "60px 20px" }}>
                <h2 style={{ fontFamily: "Roboto Condensed", fontSize: "28px", fontWeight: "600", color: "#181C20" }}>Venue Not Found</h2>
                <p style={{ color: "#666", fontSize: "16px" }}>The requested venue could not be found.</p>
                <button
                    className="venue-detail-explore-btn"
                    style={{ marginTop: "12px" }}
                    onClick={() => navigate("/venues")}
                >
                    <span className="btn-text-primary">EXPLORE ALL VENUES</span>
                    <span className="btn-text-secondary">EXPLORE ALL VENUES</span>
                </button>
            </div>
        );
    }

    return (
        <div className="venue-detail-page">
            {/* HERO BANNER SECTION (Frame 1889 & Frame 628926) */}
            <div className="venue-detail-hero-wrapper">
                <div className="venue-detail-hero-row">

                    {/* LEFT BLACK CARD (Frame 1889) */}
                    <div className="venue-detail-hero-card">
                        <div className="venue-detail-hero-info">
                            <h1 className="venue-detail-name">{venueData.name}</h1>
                            <p className="venue-detail-address">
                                {venueData.address}
                            </p>
                        </div>

                        <div className="venue-detail-hero-btns">
                            {/* EXPLORE EVENTS button hidden for 2027 */}
                            {/* <button
                                className="venue-detail-explore-btn"
                                onClick={() => navigate(`/events?venue=${encodeURIComponent(venueData.name)}`)}
                            >
                                <span className="btn-text-primary">EXPLORE EVENTS</span>
                                <span className="btn-text-secondary">EXPLORE EVENTS</span>
                            </button> */}

                            <a
                                href={venueData.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="venue-detail-map-link"
                            >
                                <span>VIEW ON MAP</span>
                                <div className="venue-detail-arrow-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                    </svg>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* RIGHT HERO PHOTO */}
                    <div className="venue-detail-hero-img-container">
                        <img src={getVenueHeroImage(venueData)} alt={venueData.name} className="venue-detail-hero-img" />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT SECTION (Frame 628926) */}
            <div className="venue-detail-container">
                <div className="venue-detail-grid">
                    {/* LEFT COLUMN */}
                    <div className="venue-detail-left-col">

                        {/* ABOUT SECTION (Frame 1000004105) */}
                        <MotionSection className="venue-about-section" variant="slideUp">
                            <h2 className="venue-section-title">About</h2>
                            {venueData.about && (venueData.about.includes("<") || venueData.about.includes("<a") || venueData.about.includes("<p>") || venueData.about.includes("<br")) ? (
                                <div className="venue-about-desc" dangerouslySetInnerHTML={{ __html: venueData.about }} />
                            ) : (
                                <p className="venue-about-desc">
                                    {venueData.about}
                                </p>
                            )}

                            {/* VIEW LAYOUT MAP button hidden for 2027 */}
                            {/* <a
                                href="#layout-map"
                                onClick={(e) => { e.preventDefault(); }}
                                className="venue-layout-map-link"
                            >
                                <span>VIEW LAYOUT MAP</span>
                                <div className="venue-detail-arrow-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                    </svg>
                                </div>
                            </a> */}
                        </MotionSection>

                        {/* AMENITIES SECTION (Frame 1819) */}
                        {getActiveVenueAmenities(venueData.amenities).length > 0 && (
                            <MotionSection className="venue-amenities-section" variant="slideUp">
                                <h2 className="venue-section-title">Amenities</h2>
                                <div className="venue-amenities-grid">
                                    {getActiveVenueAmenities(venueData.amenities).map((amenity) => (
                                        <div key={amenity.id} className="venue-amenity-card">
                                            <div className="venue-amenity-icon-box">
                                                <img src={amenity.icon} alt={amenity.label} className="venue-amenity-img" />
                                            </div>
                                            <span className="venue-amenity-label">{amenity.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </MotionSection>
                        )}

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="venue-detail-right-col">
                        {/* HOW TO REACH SECTION (Frame 628938) */}
                        <MotionSection className="venue-reach-section" variant="slideUp">
                            <h2 className="venue-section-title">How to reach</h2>

                            <div className="venue-reach-card">
                                <div className="venue-reach-tabs">
                                    {/* Metro tab */}
                                    <div
                                        className={`venue-reach-tab ${activeReachTab === 'metro' ? 'active' : ''}`}
                                        onClick={() => setActiveReachTab('metro')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="16" height="16" x="4" y="3" rx="2" />
                                            <path d="M4 11h16" />
                                            <path d="M12 3v8" />
                                            <path d="m8 19-2 3" />
                                            <path d="m18 22-2-3" />
                                            <circle cx="8" cy="15" r="1" />
                                            <circle cx="16" cy="15" r="1" />
                                        </svg>
                                        <span>BY METRO</span>
                                    </div>

                                    {/* Walking / Road tab */}
                                    <div
                                        className={`venue-reach-tab ${activeReachTab === 'road' ? 'active' : ''}`}
                                        onClick={() => setActiveReachTab('road')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="25" viewBox="0 0 15 25" fill="none">
                                            <path d="M7.51758 0.12793C9.21478 0.19715 10.4827 1.53424 10.459 3.16309C10.4382 4.5862 9.44123 5.76338 8.00977 6.08594C8.77233 6.36936 9.3267 6.93435 9.70703 7.6582C9.91877 8.05518 10.1653 8.42395 10.4199 8.79395C10.667 9.15291 10.9229 9.5153 11.1582 9.90039L13.5889 11.2236H13.5898C14.3335 11.6351 14.5522 12.5521 14.1836 13.2598C13.8353 13.9283 13.0773 14.2282 12.335 14.0488L12.1865 14.0068L10.5205 13.4531H10.5195C10.2355 13.356 10.0812 13.083 10.1562 12.8047C10.1878 12.6779 10.2762 12.56 10.3906 12.4844C10.5083 12.4066 10.6636 12.3674 10.8252 12.4199H10.8262L12.582 12.9951C12.8412 13.0793 13.0813 12.992 13.1943 12.7969C13.252 12.6973 13.2732 12.5649 13.249 12.4424C13.2252 12.3218 13.1593 12.2197 13.0518 12.1631L13.0498 12.1621L10.4326 10.7354L10.4062 10.7207L10.3896 10.6963L9.91504 10.0088V12.8184C9.90465 13.2038 10.0497 13.5572 10.3193 13.8203L11.9619 15.4238C12.6127 16.059 13.0556 16.832 13.2539 17.7188L14.3301 22.3076L14.3311 22.3086C14.5267 23.1678 14.0597 23.9933 13.2295 24.2793C12.4045 24.5634 11.4439 24.1999 11.1338 23.3525V23.3516L9.43457 18.8506L7.69922 17.4697L7.2793 18.7373V18.7383C7.07035 19.3613 6.76761 19.9069 6.30273 20.4287L6.30176 20.4297L3.19727 23.8906C2.6109 24.5478 1.5683 24.4905 0.97168 23.9795V23.9785C0.282567 23.3892 0.238729 22.4636 0.759766 21.7539L3.73047 17.6787L3.89746 15.7568V15.7559C3.92647 15.446 4.18982 15.227 4.4873 15.2559L4.48633 15.2568C4.82937 15.2745 5.02331 15.5709 4.99609 15.8896L4.80371 18.0459L4.80078 18.0801L4.78027 18.1084L1.6416 22.4209L1.64062 22.4229C1.54573 22.5497 1.49806 22.6814 1.49805 22.8037C1.49805 22.9239 1.54363 23.0455 1.65234 23.1562H1.65332C1.73204 23.2372 1.87042 23.3042 2.01758 23.3184C2.16259 23.3322 2.29768 23.2933 2.38867 23.1924L5.44629 19.7764C5.78818 19.3889 6.05187 18.9605 6.21582 18.4805L6.76562 16.7734L5.33789 15.6221C4.5729 15.0132 4.11102 14.0808 4.14648 13.1094L4.21582 11.0771L3.8291 11.3799L3.3623 13.6582V13.6592C3.17738 14.5374 2.3046 15.0731 1.4375 14.9062C0.562959 14.7379 0.00202484 13.8863 0.148438 13.0049L0.601562 10.2402L0.664062 9.9502C0.841553 9.28605 1.23847 8.70452 1.80664 8.29102L3.86914 6.78711V6.78613C4.57827 6.27132 5.36243 6.02039 6.21094 5.93848C5.0093 5.45754 4.20751 4.30519 4.29395 2.96484C4.40051 1.31341 5.82054 0.0589205 7.51758 0.12793ZM6.80078 6.97949C5.94328 7.0013 5.20101 7.16396 4.52637 7.65234L2.46387 9.14551H2.46289C2.02656 9.45709 1.76128 9.90326 1.67578 10.4248L1.22168 13.2314C1.17695 13.5196 1.39251 13.7747 1.66309 13.8203C1.93796 13.8666 2.22671 13.6966 2.2793 13.4326V13.4307L2.82324 10.8105L2.83203 10.7666L2.86719 10.7383L4.44141 9.47754C4.6117 9.33904 4.8647 9.29748 5.0791 9.39355H5.08008C5.16312 9.42958 5.23708 9.50846 5.28711 9.58984C5.33744 9.67174 5.3758 9.77858 5.36914 9.88867L5.37109 9.88965L5.24609 13.0967C5.24743 13.7402 5.5041 14.2871 5.97949 14.7217L6.12793 14.8408L10.3438 18.2021L10.3701 18.2236L10.3828 18.2559L12.1279 22.9121L12.1787 23.0176C12.3166 23.246 12.5852 23.3505 12.8613 23.2773C12.9734 23.2467 13.0982 23.1621 13.1836 23.0459C13.2677 22.9313 13.3052 22.7978 13.2715 22.666V22.6631L12.1943 18.0186V18.0176C12.0296 17.3224 11.6903 16.7136 11.1865 16.2109L9.56641 14.6299C9.06665 14.1421 8.80371 13.5237 8.80371 12.8262V8.74512C8.80345 7.67121 7.88195 6.95843 6.80078 6.97949ZM7.07617 1.22656L7.07715 1.22754C5.93479 1.39425 5.2333 2.42354 5.41406 3.47168C5.5945 4.51758 6.59383 5.20648 7.66406 5.0498C8.73301 4.89325 9.49662 3.90289 9.33789 2.87012C9.17826 1.83217 8.20958 1.07024 7.07617 1.22656Z" fill="currentColor" stroke="currentColor" strokeWidth="0.25" />
                                        </svg>
                                        <span>Walking</span>
                                    </div>

                                    {/* Bus tab */}
                                    <div
                                        className={`venue-reach-tab ${activeReachTab === 'bus' ? 'active' : ''}`}
                                        onClick={() => setActiveReachTab('bus')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M8.5 19V21.2C8.5 21.48 8.5 21.62 8.4455 21.727C8.39757 21.8211 8.32108 21.8976 8.227 21.9455C8.12004 22 7.98003 22 7.7 22H5.8C5.51997 22 5.37996 22 5.273 21.9455C5.17892 21.8976 5.10243 21.8211 5.0545 21.727C5 21.62 5 21.48 5 21.2V19M19 19V21.2C19 21.48 19 21.62 18.9455 21.727C18.8976 21.8211 18.8211 21.8976 18.727 21.9455C18.62 22 18.48 22 18.2 22H16.3C16.02 22 15.88 22 15.773 21.9455C15.6789 21.8976 15.6024 21.8211 15.5545 21.727C15.5 21.62 15.5 21.48 15.5 21.2V19M3 12H21M3 5.5H21M6.5 15.5H8M16 15.5H17.5M7.8 19H16.2C17.8802 19 18.7202 19 19.362 18.673C19.9265 18.3854 20.3854 17.9265 20.673 17.362C21 16.7202 21 15.8802 21 14.2V6.8C21 5.11984 21 4.27976 20.673 3.63803C20.3854 3.07354 19.9265 2.6146 19.362 2.32698C18.7202 2 17.8802 2 16.2 2H7.8C6.11984 2 5.27976 2 4.63803 2.32698C4.07354 2.6146 3.6146 3.07354 3.32698 3.63803C3 4.27976 3 5.11984 3 6.8V14.2C3 15.8802 3 16.7202 3.32698 17.362C3.6146 17.9265 4.07354 18.3854 4.63803 18.673C5.27976 19 6.11984 19 7.8 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>BY BUS</span>
                                    </div>
                                </div>

                                <div className="venue-reach-content">
                                    {activeReachTab === 'metro' && (
                                        <p>{reachInfo.metro || venueData.metroInfo || "The nearest metro stations are Indiranagar and Trinity, both a short cab or auto-rickshaw ride away."}</p>
                                    )}
                                    {activeReachTab === 'road' && (
                                        <p>{reachInfo.road || venueData.roadInfo || "Bangalore International Centre is located in Domlur II Stage, easily accessible via Outer Ring Road or Old Airport Road."}</p>
                                    )}
                                    {activeReachTab === 'bus' && (
                                        <p>{reachInfo.bus || venueData.busInfo || "The nearest bus stop is Domlur Bridge, which is about a 10-minute walk from the venue."}</p>
                                    )}
                                </div>
                            </div>
                        </MotionSection>
                    </div>

                </div>
            </div>

            {/* VENUE EVENTS LISTING SECTION (Hidden for 2027) */}
            {/* <div className="venue-detail-events-wrapper">
                <EventListing
                    className="venue-events-listing-custom"
                    wrapperClassName="venue-events-inner-wrapper"
                    hideTopHero={true}
                    showHeroHeader={true}
                    hideGenreCarousel={true}
                    sectionEyebrow="EVENT CALENDAR"
                    sectionTitle={`Checkout what's happening at ${venueData.name}`}
                />
            </div> */}

            {/* VENUE FAQS SECTION (Figma Frame FAQ Desktop) */}
            <EventFAQs
                title={`${venueData.name ? `${venueData.name} FAQs` : "Venue FAQs"}`}
                faqs={venueData.faqs && venueData.faqs.length > 0 ? venueData.faqs.map(faq => ({
                    question: faq.question,
                    answer: (faq.answer || "").replace(/Bangalore International Centre/g, venueData.name || "This venue")
                })) : undefined}
                className="venue-faqs-custom"
            />

        </div>
    );
};

export default VenueDetailPage;
