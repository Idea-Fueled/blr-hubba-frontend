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
            const amenitiesList = v.amenities && Array.isArray(v.amenities) && v.amenities.length > 0 ? v.amenities : [];

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
                            <button
                                className="venue-detail-explore-btn"
                                onClick={() => navigate(`/events?venue=${encodeURIComponent(venueData.name)}`)}
                            >
                                <span className="btn-text-primary">EXPLORE EVENTS</span>
                                <span className="btn-text-secondary">EXPLORE EVENTS</span>
                            </button>

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

                            <a
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
                            </a>
                        </MotionSection>

                        {/* AMENITIES SECTION (Frame 1819) */}
                        <MotionSection className="venue-amenities-section" variant="slideUp">
                            <h2 className="venue-section-title">Amenities</h2>
                            <div className="venue-amenities-grid">

                                {/* Wheelchair Friendly */}
                                {(venueData.amenities.includes("wheelchair") || venueData.amenities.includes("Wheelchair Accessible") || venueData.amenities.includes("Wheelchair Friendly")) && (
                                    <div className="venue-amenity-card">
                                        <div className="venue-amenity-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="42" viewBox="0 0 38 42" fill="none">
                                                <g clipPath="url(#clip0_2047_29367)">
                                                    <path d="M24.6166 24.0162C22.8401 23.5985 13.5596 23.9498 10.8763 23.9498C10.793 17.9593 10.7745 11.9783 10.719 5.98777C9.04427 4.18397 9.92328 0.927643 12.2457 0.234605C14.5496 -0.733749 17.381 1.44979 17.0109 4.01309C17.1126 6.04473 14.8087 6.5384 14.0407 7.64916C13.9852 10.0131 13.9297 12.396 14.0777 14.7599C17.2052 15.0162 20.3789 14.8264 23.5248 14.8738V17.9973H14.2813C13.5226 19.8011 14.2721 21.2821 14.1055 21.1207C17.5845 21.1397 23.2842 21.1302 26.7632 21.1302C28.7618 25.3359 30.6771 29.608 32.6942 33.7852C34.8131 33.5194 36.349 32.2947 37.154 32.2473C38.033 32.1713 38.0608 35.0574 37.959 34.9624C36.0715 35.665 33.0828 37.165 31.186 37.839C30.6956 37.0416 26.4024 27.7852 24.6166 24.0162ZM13.8464 41.9688C9.70121 41.4941 6.79586 40.2219 4.58446 38.1808C1.42002 35.3517 -0.412014 30.9751 0.0783801 26.646C0.318951 21.7378 3.50189 17.3042 7.73038 15.1492C8.39658 15.7852 7.95245 17.4276 8.07273 18.5099C8.24853 19.4498 7.03643 19.7061 6.5923 20.3612C3.45562 23.4466 2.77092 28.7061 4.751 32.6365C6.85137 37.0985 12.1624 39.9086 16.8906 38.5416C20.4436 37.6302 23.2564 34.877 25.1255 31.7441C25.9027 32.3897 27.5682 35.1143 25.8842 36.3106C23.0251 39.9941 18.4635 42.3011 13.8464 41.9688Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2047_29367">
                                                        <rect width="38" height="42" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <span className="venue-amenity-label">Wheelchair Friendly</span>
                                    </div>
                                )}

                                {/* Ramp Available */}
                                {(venueData.amenities.includes("ramp") || venueData.amenities.includes("Ramp Available")) && (
                                    <div className="venue-amenity-card">
                                        <div className="venue-amenity-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="28" viewBox="0 0 38 28" fill="none">
                                                <path d="M0 13.7123L0.268671 13.3533L36.8961 0.0716942C37.5673 -0.220372 38.2474 0.432598 37.9113 1.07967C37.6644 1.55464 35.9444 1.9598 35.3981 2.15648V10.8428C36.2874 10.767 37.5237 9.59582 37.9916 10.8841L37.9995 27.225C38.0025 27.4709 37.8399 27.8396 37.6059 27.939L0.701914 27.998C0.297421 28.0265 0.193324 27.7492 0 27.4787V23.9454C0.595834 23.2394 1.75677 23.1233 2.59748 22.7673V14.0811C1.7419 14.1784 0.577989 15.267 0 14.1548V13.7133L0 13.7123ZM33.914 2.74455L30.797 3.84889V12.5352L33.914 11.4308V2.74455ZM29.3128 4.43794L26.4189 5.39478V14.1548L29.3128 13.1242V4.43794ZM24.9348 5.98383L21.9665 7.01442V15.7007L24.9348 14.6337V5.98383ZM20.4824 7.60347L17.5141 8.63406V17.3203L20.4824 16.2897V7.60347ZM16.029 9.22213L13.0608 10.2527V18.939L16.029 17.9084V9.22213ZM11.5766 10.8418L8.68272 11.7986V20.5586L11.5766 19.528V10.8418ZM36.5114 12.0936L1.48413 24.681V26.5209H36.5114V12.0936ZM7.19859 12.4614L4.08161 13.492V22.1783L7.19859 21.0375V12.4624V12.4614Z" fill="white" />
                                            </svg>
                                        </div>
                                        <span className="venue-amenity-label">Ramp Available</span>
                                    </div>
                                )}

                                {/* Food & Drinks Available */}
                                {(venueData.amenities.includes("cafe") || venueData.amenities.includes("food") || venueData.amenities.includes("Cafe Available") || venueData.amenities.includes("Food Available") || venueData.amenities.includes("Food & Drinks Available")) && (
                                    <div className="venue-amenity-card">
                                        <div className="venue-amenity-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="32" viewBox="0 0 34 32" fill="none">
                                                <g clip-path="url(#clip0_3163_31474)">
                                                    <path d="M2.12915 32.0001C1.95543 31.9617 1.77227 31.7027 1.74394 31.5165C1.59949 30.5376 1.58533 29.2277 1.5249 28.2064C1.50697 27.9011 1.54379 27.5869 1.52774 27.2816C1.11704 27.3201 0.702567 27.2885 0.612875 26.7991L0.0416766 16.1094C0.030347 15.6702 0.347575 15.4358 0.751662 15.486L0.67802 13.1302C0.365513 13.146 0.100213 12.9825 0.0492296 12.6437C-0.020636 12.1788 -0.0102505 10.6257 0.0435648 10.1402C0.142698 9.24397 1.05001 9.76792 1.38895 9.55322C1.54284 9.45572 2.17069 7.81396 2.38784 7.49979C2.49358 7.34714 2.58516 7.26539 2.77021 7.23486L13.3133 7.28608C13.4143 7.33138 13.471 7.41115 13.5323 7.49979C13.8014 7.88979 14.2697 9.30602 14.4963 9.51678C14.771 9.77186 15.7511 9.27155 15.871 10.0732C15.9342 10.4977 15.9342 12.2212 15.871 12.6447C15.82 12.9835 15.5547 13.147 15.2422 13.1312L15.1685 15.487C16.4242 15.4446 15.6208 17.2065 15.8049 17.9944L14.6738 17.9206V16.7781C14.6738 16.7555 14.7635 16.722 14.7446 16.6678H1.17463L1.7751 26.1038H9.65481V27.2836H2.6588L2.80042 30.8222H7.95915V32.0021H2.12915V32.0001ZM13.2595 9.58867C13.0914 9.35329 12.8365 8.45707 12.5882 8.40881L3.39617 8.40487C3.03362 8.45018 2.87501 9.28632 2.65786 9.58867H13.2585H13.2595ZM14.7437 10.7685H1.17463V11.9484H14.7437V10.7685ZM14.1083 13.1273H1.81098L1.88179 15.486H14.0375L14.1083 13.1273Z" fill="white" />
                                                    <path d="M10.7885 21.9002L10.4958 22.959C9.07113 26.3163 5.25873 25.0281 5.13222 21.5733C4.9991 17.9352 8.91535 16.255 10.4958 19.8113L10.7885 20.8701V19.4322C10.7885 19.2638 11.1935 18.9565 11.3861 19.0235L21.5676 19.0254C21.7413 18.9821 22.0963 19.2923 22.0963 19.4322V20.7962H24.181C24.2537 20.7962 24.6738 20.94 24.7805 20.9814C26.6404 21.6993 27.2079 24.1378 25.9135 25.6998C24.9042 26.9181 23.4899 26.6916 22.0954 26.6925C22.1114 27.3386 21.8745 27.9423 21.5299 28.4623H24.5331C24.5728 28.4623 24.7777 28.6298 24.8145 28.6849C24.9892 28.9459 24.9561 30.3779 24.874 30.7344C24.7409 31.3105 24.2914 31.7567 23.7599 31.931L10.4165 31.9832C9.79811 31.8276 9.25523 31.3421 9.12305 30.6783C9.05508 30.3355 9.03431 28.9321 9.19953 28.6849C9.23635 28.6298 9.44123 28.4623 9.48088 28.4623H11.354C11.1605 28.1393 10.7885 27.4686 10.7885 27.0983V21.9012V21.9002ZM8.66893 23.5213C10.1163 22.5227 10.0049 19.575 8.21386 19.0934C7.60112 20.2979 8.86625 20.8937 8.95028 22.0105C8.99276 22.5798 8.76334 22.9855 8.66893 23.5213ZM6.90057 19.6144C5.87902 20.7499 6.07163 22.7443 7.36036 23.5942C7.59073 23.0299 7.96744 22.3542 7.70592 21.7604C7.40568 21.0779 6.7429 20.548 6.89963 19.6154L6.90057 19.6144ZM20.9653 20.2043H11.9196V27.0235C11.9196 27.5376 12.7938 28.4141 13.315 28.4436C15.258 28.357 17.3861 28.6199 19.3083 28.4643C19.9078 28.416 20.4158 28.1295 20.7292 27.5868C20.7755 27.508 20.9662 27.0668 20.9662 27.0235V20.2043H20.9653ZM22.0954 25.5117H24.1092C24.1508 25.5117 24.5737 25.3118 24.6493 25.2645C25.7681 24.5603 25.7671 22.9245 24.6493 22.2203C24.5737 22.1721 24.1508 21.9731 24.1092 21.9731H22.0954V25.5117ZM23.792 29.6402H10.223C10.2343 30.1139 10.087 30.6271 10.6129 30.8181L23.5078 30.7817C23.9251 30.5148 23.7703 30.0775 23.792 29.6402Z" fill="white" />
                                                    <path d="M20.4705 15.4859L20.6064 17.7658L19.482 17.8446L19.3404 15.4859C18.8315 15.48 18.215 15.6336 18.1366 14.9353C18.0894 14.5138 18.0743 12.7371 18.1536 12.3688C18.2433 11.9492 18.6653 11.9995 18.7427 11.8773C18.7805 11.8173 18.9419 10.7477 19.025 10.4759C19.7766 8.03739 21.9122 6.36017 24.3273 6.05487L24.4113 2.82552L27.1578 0.0895844C27.3674 -0.0512503 27.5458 -0.0128409 27.746 0.11913C27.8904 0.214661 29.4444 1.84362 29.5068 1.96771C29.6286 2.21097 29.6172 2.3518 29.4775 2.58226C29.2245 2.99787 27.8479 4.11076 27.7639 4.4072L27.7799 6.05585C30.6652 6.39858 33.085 8.77012 33.3428 11.8281C33.4032 12.0202 33.9036 11.898 33.9706 12.5008C34.0121 12.8721 34.0216 14.8418 33.9376 15.1234C33.7893 15.6169 33.152 15.474 32.7678 15.4878C32.6063 18.9664 32.3042 22.4449 32.0625 25.9204C31.9502 27.5346 31.9341 29.1764 31.7783 30.7846C31.75 31.0801 31.7104 32.0019 31.3195 32.0019H26.0541V30.8221H30.6473L31.6367 15.4878H20.4705V15.4859ZM26.6187 6.04994V4.02311L28.168 2.31733L27.4212 1.48513L25.4876 3.35931V6.04994H26.6187ZM32.2013 11.9473C32.1012 9.85937 30.4735 7.98026 28.5796 7.4317C27.5364 7.12935 24.924 7.10965 23.858 7.33617C21.8329 7.76655 19.9984 9.75005 19.904 11.9473H32.2013ZM32.8376 13.1271H19.2686V14.307H32.8376V13.1271Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_3163_31474">
                                                        <rect width="34" height="32" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <span className="venue-amenity-label">Food & Drinks Available</span>
                                    </div>
                                )}

                                {/* Parking Available */}
                                {(venueData.amenities.includes("parking") || venueData.amenities.includes("Parking Available")) && (
                                    <div className="venue-amenity-card">
                                        <div className="venue-amenity-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="2" width="20" height="20" rx="4" />
                                                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
                                            </svg>
                                        </div>
                                        <span className="venue-amenity-label">Parking Available</span>
                                    </div>
                                )}

                                {/* Pet Friendly */}
                                {(venueData.amenities.includes("pet") || venueData.amenities.includes("Pet Friendly")) && (
                                    <div className="venue-amenity-card">
                                        <div className="venue-amenity-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="41" height="38" viewBox="0 0 41 38" fill="none">
                                                <g clipPath="url(#clip0_2066_3233)">
                                                    <path d="M0 13.7903V11.6758C0.238683 10.1981 0.468804 8.47485 1.18806 7.14708C1.60977 6.36911 2.6298 6.48429 2.72827 7.23944C2.79249 7.73274 2.20488 8.89426 2.04326 9.47991C-0.631494 19.1654 10.2591 30.9458 17.973 35.1943C18.4246 35.4431 20.0644 36.2971 20.4775 36.3145C20.9078 36.333 22.4341 35.5224 22.8879 35.2758C29.9649 31.4207 39.6878 21.1223 39.4223 12.444C39.1451 3.3724 29.221 -1.69528 22.0755 4.03194C21.6121 4.40354 21.0469 5.19346 20.47 5.17499C19.9788 5.15978 19.3644 4.3666 18.9459 4.03194C15.8644 1.56764 12.099 0.981985 8.41385 2.36408C7.8134 2.589 6.62105 3.4854 6.18757 2.58791C5.75409 1.69042 6.86723 1.27318 7.53404 0.981986C11.1282 -0.586996 15.2522 -0.253425 18.5809 1.79907C19.2681 2.22283 19.8706 2.75741 20.5385 3.20616C24.2654 -0.170847 29.5775 -0.956424 34.1049 1.25036C39.5369 3.89721 41.8124 9.79067 40.741 15.6635C39.2736 23.7083 30.544 32.969 23.6082 36.7404C22.9703 37.087 21.1904 37.9813 20.5375 37.9997C19.9541 38.016 18.0554 37.0859 17.4635 36.7687C10.0193 32.7745 0.777058 22.7587 0.0738527 13.9196L0 13.7903Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2066_3233">
                                                        <rect width="41" height="38" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <span className="venue-amenity-label">Pet Friendly</span>
                                    </div>
                                )}

                            </div>
                        </MotionSection>

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

            {/* VENUE EVENTS LISTING SECTION (Figma Frame 629127) */}
            <div className="venue-detail-events-wrapper">
                <EventListing
                    className="venue-events-listing-custom"
                    wrapperClassName="venue-events-inner-wrapper"
                    hideTopHero={true}
                    showHeroHeader={true}
                    hideGenreCarousel={true}
                    sectionEyebrow="EVENT CALENDAR"
                    sectionTitle={`Checkout what's happening at ${venueData.name}`}
                />
            </div>

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
