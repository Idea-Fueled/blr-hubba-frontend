import React, { useState, useEffect } from "react";
import { MotionSection } from "../AnimatedPage";
import { AnimatePresence, motion } from "framer-motion";
import "./EventDetailHero.css";
import venueDetailBgImg from "../../assets/venue-detail-page-img.png";
import { getSubfestivalLogo } from "../../utils/logoMapper";
import { getEventDetailFormattedInfo, formatAgeSuitability, toTitleCase } from "../../utils/eventMappers";
import { useNavigate } from "react-router-dom";
import { toggleWishlistApi } from "../../api/eventsApi";
import { toast } from "sonner";

const EventDeatilHero = ({ event }) => {
    if (!event) return null;

    const navigate = useNavigate();

    const proceedBooking = (selectedSlot = null) => {
        const uniqueVenuesInDates = new Set((event?.eventDates || []).map(d => d.venueId || d.venue?.id || d.venue?.name).filter(Boolean));
        const hasMultipleVenues = uniqueVenuesInDates.size > 1 || (event?.venueIds && event.venueIds.length > 1) || event?.bookingType === "SINGLE_DATE_MULTI_VENUE";

        const uniqueDates = new Set((event?.eventDates || []).map(d => d.date ? new Date(d.date).toISOString().split('T')[0] : null).filter(Boolean));
        const hasMultipleDates = uniqueDates.size > 1 || event?.eventType === "RECURRING" || event?.bookingType === "MULTIPLE_VENUE_DATE";

        if (hasMultipleVenues && !hasMultipleDates) {
            navigate("/book?type=singledatemultivenue", { state: { event, selectedSlot } });
        } else if (hasMultipleDates) {
            navigate("/book?type=multiple", { state: { event, selectedSlot } });
        } else if (hasMultipleVenues) {
            navigate("/book?type=singledatemultivenue", { state: { event, selectedSlot } });
        } else {
            navigate("/book", { state: { event, selectedSlot } });
        }
    };

    const handleBookingClick = (selectedSlot = null) => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (!isLoggedIn) {
            window.dispatchEvent(new Event("open-login-modal"));
            return;
        }
        proceedBooking(selectedSlot);
    };

    const [liked, setLiked] = useState(() => {
        try {
            const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
            return !!favs[event?.id];
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        const syncFav = () => {
            try {
                const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
                setLiked(!!favs[event?.id]);
            } catch (e) { }
        };
        window.addEventListener("profile-change", syncFav);
        return () => window.removeEventListener("profile-change", syncFav);
    }, [event?.id]);

    const [showsModalOpen, setShowsModalOpen] = useState(false);
    const [venuesModalOpen, setVenuesModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const resolveSubfestivalLogoUrl = (eventObj) => {
        if (!eventObj) return null;

        const sf = eventObj.subfestival || {};

        // 1. Direct admin uploaded image URL/data on subfestival object or event object
        let directUrl = sf.logoImage?.data || sf.logoImage?.url || sf.logoUrl || sf.logo || eventObj.subfestivalLogoUrl;
        if (directUrl && typeof directUrl === "object") {
            directUrl = directUrl.data || directUrl.url || directUrl.src || null;
        }
        if (directUrl && typeof directUrl === "string" && directUrl.trim() !== "") {
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
            if (directUrl.startsWith("/media/") || directUrl.startsWith("/static-files/")) {
                return `${baseUrl}${directUrl}`;
            }
            return directUrl;
        }

        // 2. Key/Slug/Name based lookup via logoMapper
        const possibleKeys = [
            sf.logoKey,
            sf.slug,
            sf.name,
            sf.category,
            eventObj.subfestivalLogoKey,
            eventObj.subfestivalSlug,
            eventObj.subfestivalName,
        ].filter(Boolean);

        for (const k of possibleKeys) {
            const found = getSubfestivalLogo(k);
            if (found && found.icon) {
                return found.icon;
            }
        }

        return null;
    };

    const dynamicLogoUrl = resolveSubfestivalLogoUrl(event);

    const genresList = (event.genres || [])
        .map(g => typeof g === 'string' ? g : (g.genre?.name || g.name))
        .filter(Boolean);

    if (genresList.length === 0 && event.genre) {
        const single = typeof event.genre === 'string' ? event.genre : (event.genre.name || event.genre.title);
        if (single) genresList.push(single);
    }

    if (genresList.length === 0) {
        genresList.push("Sports");
        genresList.push("Play");
    }

    let rawPerformerName = "";
    if (event.mainPerformer) {
        rawPerformerName = typeof event.mainPerformer === 'object' ? (event.mainPerformer.name || "") : event.mainPerformer;
    } else if (event.performer) {
        rawPerformerName = typeof event.performer === 'object' ? (event.performer.name || "") : event.performer;
    } else if (Array.isArray(event.performers) && event.performers.length > 0) {
        const pList = event.performers.map(p => typeof p === 'string' ? p : (p.name || p.performer?.name || p.performerName || "")).filter(Boolean);
        rawPerformerName = pList.join(", ");
    } else if (event.presentedBy) {
        rawPerformerName = typeof event.presentedBy === 'object' ? (event.presentedBy.name || "") : event.presentedBy;
    } else if (event.curatedBy) {
        rawPerformerName = typeof event.curatedBy === 'object' ? (event.curatedBy.name || "") : event.curatedBy;
    }

    const performerName = String(rawPerformerName || "").trim();

    const { formattedDate, venueDisplay, timeSlotDisplay, hasMultipleTimeSlots } = getEventDetailFormattedInfo(event);

    const rawImg = event.coverImage || event.imageUrl || "";
    let imageUrl = typeof rawImg === "object" ? (rawImg.url || rawImg.data || rawImg.src || "") : rawImg;

    const handleShare = (e) => {
        e.stopPropagation();
        setShareModalOpen(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 1500);
    };

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(event.title + " " + window.location.href)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`
    };

    // Build Hero Media Slider items: Max 3 Images + 1 Video from admin selection
    const heroMediaItems = [];

    // Check for explicit Carousel Video (isCarousel === true)
    let carouselVideoUrl = null;
    if (Array.isArray(event.media?.videos)) {
        const cVid = event.media.videos.find(v => v.isCarousel);
        if (cVid) carouselVideoUrl = cVid.url || cVid.data;
    }
    if (!carouselVideoUrl) {
        carouselVideoUrl = event.videoUrl || event.video || event.media?.videoUrl || null;
    }
    if (carouselVideoUrl && typeof carouselVideoUrl === 'string' && carouselVideoUrl.trim() !== '') {
        heroMediaItems.push({
            type: 'video',
            url: carouselVideoUrl
        });
    }

    // Check for explicit Carousel Images (isCarousel === true)
    const heroImageUrls = new Set();
    const addHeroImage = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return;
        if (heroImageUrls.has(url)) return;
        if (heroImageUrls.size >= 3) return;
        heroImageUrls.add(url);
        heroMediaItems.push({
            type: 'image',
            url: url
        });
    };

    let foundExplicitCarouselImages = false;

    // Check media169 & media11 for isCarousel
    if (event.media) {
        const allMediaImages = [...(event.media.images169 || []), ...(event.media.images11 || [])];
        allMediaImages.forEach(img => {
            if (typeof img === 'object' && img.isCarousel) {
                const u = img.url || img.data;
                if (u) {
                    foundExplicitCarouselImages = true;
                    addHeroImage(u);
                }
            }
        });
    }

    // Fallback if no explicit carousel images selected
    if (!foundExplicitCarouselImages) {
        addHeroImage(event.coverImage || event.imageUrl);
        if (Array.isArray(event.images)) {
            event.images.forEach(img => {
                const u = typeof img === 'string' ? img : (img.url || img.data);
                addHeroImage(u);
            });
        }
        if (event.media) {
            const mediaImgs = [...(event.media.images169 || []), ...(event.media.images11 || [])];
            mediaImgs.forEach(img => {
                const u = typeof img === 'string' ? img : (img.url || img.data);
                addHeroImage(u);
            });
        }
    }

    const [activeSlide, setActiveSlide] = useState(0);
    const [slideDirection, setSlideDirection] = useState(1);

    const prevSlide = (e) => {
        e.stopPropagation();
        setSlideDirection(-1);
        setActiveSlide((prev) => (prev === 0 ? heroMediaItems.length - 1 : prev - 1));
    };

    const nextSlide = (e) => {
        e.stopPropagation();
        setSlideDirection(1);
        setActiveSlide((prev) => (prev === heroMediaItems.length - 1 ? 0 : prev + 1));
    };

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: {
                x: { type: "spring", stiffness: 260, damping: 28 },
                opacity: { duration: 0.35 }
            }
        },
        exit: (dir) => ({
            x: dir < 0 ? "100%" : "-100%",
            opacity: 0,
            transition: {
                x: { type: "spring", stiffness: 260, damping: 28 },
                opacity: { duration: 0.35 }
            }
        })
    };

    return (
        <>
            <MotionSection className="event-hero-section-container">
                {/* Left Info Card with Venue Detail BG Image */}
                <div
                    className="event-hero-left-card"
                    style={{
                        backgroundImage: `url(${venueDetailBgImg})`
                    }}
                >
                    <div className="event-hero-left-content">
                        {/* Frame 1000003981: Top Title & Genre Block (gap 24px) */}
                        <div className="event-hero-header-block">
                            {/* Genre Pills */}
                            <div className="event-hero-genre-pills">
                                {genresList.map((gName, gIdx) => (
                                    <span key={gIdx} className="event-hero-genre-pill">
                                        {toTitleCase(gName)}
                                    </span>
                                ))}
                            </div>

                            {/* Title & Performer Subtitle */}
                            <div className="event-hero-title-block">
                                <h1 className="event-hero-title">{toTitleCase(event.title)}</h1>
                                {performerName && (
                                    <span className="event-hero-performer">
                                        by {toTitleCase(performerName.replace(/^by\s+/i, ""))}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Frame 1000003879: Key Details List (gap 16px) */}
                        <div className="event-hero-details-list">
                            {/* Date */}
                            <div className="event-hero-detail-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 10H3M16 2V6M8 2V6M9 16L11 18L15.5 13.5M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{formattedDate}</span>
                            </div>

                            {/* Venue */}
                            <div className="event-hero-detail-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 12.5C13.6569 12.5 15 11.1569 15 9.5C15 7.84315 13.6569 6.5 12 6.5C10.3431 6.5 9 7.84315 9 9.5C9 11.1569 10.3431 12.5 12 12.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 22C14 18 20 15.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 15.4183 10 18 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{venueDisplay}</span>
                            </div>

                            {/* Time Slot */}
                            <div className="event-hero-detail-row">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{timeSlotDisplay}</span>
                            </div>
                        </div>

                        {/* Frame 1000003961: Bottom Action Row */}
                        <div className="event-hero-action-row">
                            <button className="event-hero-book-btn" onClick={() => handleBookingClick()}>
                                <span className="btn-text-primary">GET PASSES</span>
                                <span className="btn-text-secondary">GET PASSES</span>
                            </button>

                            <div className="event-hero-icon-actions">
                                <button
                                    className={`event-hero-icon-btn ${liked ? "liked" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                                        if (!isLoggedIn) {
                                            window.dispatchEvent(new Event("open-login-modal"));
                                            return;
                                        }
                                        const nextLiked = !liked;
                                        setLiked(nextLiked);
                                        try {
                                            const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
                                            if (nextLiked) {
                                                favs[event?.id] = true;
                                                toast.success("Added to favourites!");
                                            } else {
                                                delete favs[event?.id];
                                                toast.success("Removed from favourites!");
                                            }
                                            localStorage.setItem("user_favorites", JSON.stringify(favs));
                                            window.dispatchEvent(new Event("profile-change"));
                                        } catch (err) { }
                                        toggleWishlistApi(event?.id).catch(err => console.error(err));
                                    }}
                                    aria-label="Favorite event"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.8401 4.61012C20.3294 4.09912 19.7229 3.69376 19.0555 3.4172C18.388 3.14064 17.6726 2.99829 16.9501 2.99829C16.2276 2.99829 15.5122 3.14064 14.8448 3.4172C14.1773 3.69376 13.5709 4.09912 13.0601 4.61012L12.0001 5.67012L10.9401 4.61012C9.90843 3.57842 8.50915 2.99883 7.05012 2.99883C5.59109 2.99883 4.19181 3.57842 3.16012 4.61012C2.12843 5.64181 1.54883 7.04108 1.54883 8.50012C1.54883 9.95915 2.12843 11.3584 3.16012 12.3901L4.22012 13.4501L12.0001 21.2301L19.7801 13.4501L20.8401 12.3901C21.3511 11.8794 21.7565 11.2729 22.033 10.6055C22.3096 9.93801 22.4519 9.2226 22.4519 8.50012C22.4519 7.77763 22.3096 7.06222 22.033 6.39476C21.7565 5.7273 21.3511 5.12087 20.8401 4.61012V4.61012Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button
                                    className="event-hero-icon-btn"
                                    onClick={handleShare}
                                    aria-label="Share event"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                        <path d="M9.30583 14.6359L16.705 18.9476M16.6942 7.05258L9.30583 11.3642M22.75 5.41675C22.75 7.21167 21.2949 8.66675 19.5 8.66675C17.7051 8.66675 16.25 7.21167 16.25 5.41675C16.25 3.62182 17.7051 2.16675 19.5 2.16675C21.2949 2.16675 22.75 3.62182 22.75 5.41675ZM9.75 13.0001C9.75 14.795 8.29493 16.2501 6.5 16.2501C4.70507 16.2501 3.25 14.795 3.25 13.0001C3.25 11.2052 4.70507 9.75008 6.5 9.75008C8.29493 9.75008 9.75 11.2052 9.75 13.0001ZM22.75 20.5834C22.75 22.3783 21.2949 23.8334 19.5 23.8334C17.7051 23.8334 16.25 22.3783 16.25 20.5834C16.25 18.7885 17.7051 17.3334 19.5 17.3334C21.2949 17.3334 22.75 18.7885 22.75 20.5834Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Hero Image/Media Slider Card */}
                <div className="event-hero-right-card hero-media-slider">
                    {heroMediaItems.length > 0 ? (
                        <div className="hero-slide-wrapper">
                            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                                <motion.div
                                    key={activeSlide}
                                    custom={slideDirection}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="hero-motion-slide"
                                >
                                    {heroMediaItems[activeSlide]?.type === 'video' ? (
                                        <iframe
                                            src={heroMediaItems[activeSlide].url.includes('youtube') ? heroMediaItems[activeSlide].url.replace('watch?v=', 'embed/') : heroMediaItems[activeSlide].url}
                                            title={event.title}
                                            className="hero-slider-video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <img
                                            src={heroMediaItems[activeSlide]?.url || imageUrl}
                                            alt={event.title}
                                            className="event-hero-image"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <img src={imageUrl} alt={event.title} className="event-hero-image" />
                    )}

                    {dynamicLogoUrl && (
                        <div className="hero-image-subfestival-single">
                            <img src={dynamicLogoUrl} alt="Subfestival logo" />
                        </div>
                    )}

                    {/* Navigation Arrows & Dots if more than 1 item */}
                    {heroMediaItems.length > 1 && (
                        <>
                            <button
                                className="hero-slider-arrow arrow-left"
                                onClick={prevSlide}
                                aria-label="Previous Slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <button
                                className="hero-slider-arrow arrow-right"
                                onClick={nextSlide}
                                aria-label="Next Slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <div className="hero-slider-dots">
                                {heroMediaItems.map((_, dotIdx) => (
                                    <span
                                        key={dotIdx}
                                        className={`hero-slider-dot ${dotIdx === activeSlide ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSlide(dotIdx);
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile-only Metadata Section */}
                <div className="event-hero-mobile-meta-section">
                    <div className="event-hero-meta-item">
                        <div className="event-hero-meta-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <g clipPath="url(#clip0_hero_age)">
                                    <path d="M15.9878 11.0223C19.0458 10.7256 21.703 12.9953 21.9851 15.9622C22.2671 18.9292 20.0553 21.6736 17.0269 21.9555C13.9986 22.2374 11.3414 20.0418 11.0296 17.0452C10.7179 14.0485 12.9001 11.3041 15.9878 11.0074V11.0223ZM15.9878 11.942C13.4196 12.2387 11.6531 14.5678 11.95 17.06C12.2469 19.5523 14.5182 21.3324 17.0121 21.0506C19.506 20.7687 21.3319 18.499 21.0499 15.9919C20.7678 13.4848 18.5411 11.6601 15.9729 11.9568L15.9878 11.942Z" fill="white" />
                                    <path d="M8.6399 0.0296697C11.4159 -0.267026 13.8356 1.76534 14.1176 4.46527C14.3997 7.16521 12.4105 9.65745 9.67903 9.93931C6.94759 10.2212 4.49819 8.26298 4.2013 5.53338C3.9044 2.80378 5.84907 0.311531 8.6399 0.0296697ZM8.69928 0.949427C6.39833 1.21645 4.83962 3.27849 5.12168 5.50371C5.40373 7.72893 7.40778 9.28658 9.6345 9.03439C11.8612 8.7822 13.4793 6.76467 13.2121 4.52461C12.9449 2.28456 10.9705 0.682401 8.69928 0.949427Z" fill="white" />
                                    <path d="M0.920182 14.7458V16.793C0.920182 17.1639 1.21708 17.4309 1.60304 17.4309H9.738C10.02 17.4309 10.1982 17.6237 10.213 17.8611C10.213 18.1281 10.0349 18.3506 9.738 18.3506H1.54366C0.682665 18.3506 0.0146484 17.6386 0.0146484 16.8078V14.8496C0.0146484 12.9953 1.17254 11.3783 2.92423 10.7849L5.55176 9.90964C5.68536 9.86514 5.89319 9.90964 6.01195 9.98382C8.00115 11.2448 10.5099 11.2003 12.4694 9.89481C12.8999 9.90964 13.7312 10.0728 13.5828 10.6514C13.5234 10.9036 13.2414 11.0668 12.9742 10.9332L12.6327 10.8739C10.4802 12.1497 7.82302 12.1497 5.67052 10.8442L3.23597 11.6601C1.89994 12.1052 0.979561 13.3068 0.935026 14.7606L0.920182 14.7458Z" fill="white" />
                                    <path d="M13.895 16.8375C13.6871 16.6298 13.7168 16.3331 13.895 16.1551C14.0731 15.9771 14.3551 16.0067 14.5481 16.1996L15.7209 17.3715L18.4672 14.6419C18.6453 14.4639 18.9273 14.4936 19.0906 14.6419C19.2688 14.7903 19.3133 15.1018 19.1203 15.2947L16.0623 18.3506C15.8693 18.5435 15.5873 18.5287 15.3943 18.3506L13.895 16.8523V16.8375Z" fill="white" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_hero_age">
                                        <rect width="22" height="22" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="event-hero-meta-info">
                            <span className="event-hero-meta-label">AGE SUITABILITY</span>
                            <span className="event-hero-meta-value">{formatAgeSuitability(event)}</span>
                        </div>
                    </div>

                    <div className="event-hero-meta-item">
                        <div className="event-hero-meta-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="18" viewBox="0 0 23 18" fill="none">
                                <g clipPath="url(#clip0_hero_lang)">
                                    <path d="M3.77157 16.0116L5.92033 14.0821C6.01886 13.9938 6.146 13.9449 6.27783 13.9444H11.4813C11.5042 13.9447 11.527 13.9403 11.5482 13.9316C11.5694 13.9229 11.5887 13.9099 11.6049 13.8936C11.6211 13.8773 11.634 13.8578 11.6426 13.8364C11.6513 13.815 11.6556 13.7921 11.6554 13.769V12.6675H12.7279V13.769C12.7264 14.1027 12.5942 14.4223 12.36 14.6583C12.1259 14.8942 11.8087 15.0274 11.4775 15.0289H6.47998L3.61247 17.6035C3.53768 17.6789 3.44245 17.7304 3.33874 17.7515C3.23502 17.7725 3.12743 17.7623 3.02947 17.722C2.93151 17.6817 2.84754 17.6132 2.78809 17.525C2.72865 17.4368 2.69637 17.3329 2.69531 17.2262V15.0289H1.2522C0.920721 15.0279 0.603074 14.8949 0.368508 14.6589C0.133943 14.4229 0.00148056 14.103 0 13.769L0 5.63046C0.00389662 5.2972 0.137134 4.97873 0.371179 4.74324C0.605225 4.50775 0.921472 4.37397 1.2522 4.37054H8.11401V5.45505H1.2522C1.20671 5.4577 1.16374 5.47698 1.13135 5.50927C1.09896 5.54156 1.07937 5.58465 1.07625 5.63046V13.769C1.07642 13.7919 1.08114 13.8146 1.09015 13.8357C1.09915 13.8567 1.11224 13.8757 1.12866 13.8916C1.16195 13.924 1.20596 13.9428 1.2522 13.9444H3.2325C3.37547 13.9444 3.51258 14.0016 3.61368 14.1035C3.71477 14.2054 3.77157 14.3436 3.77157 14.4876V16.0116ZM19.3969 13.4729L16.52 10.8965H11.5187C11.1875 10.8945 10.8705 10.7612 10.6361 10.5254C10.4017 10.2896 10.269 9.97026 10.2665 9.63655V1.49989C10.2695 1.16491 10.4041 0.844775 10.6409 0.609647L10.6783 0.575697C10.9067 0.361235 11.2065 0.240781 11.5187 0.238084L21.7478 0.238084C22.0797 0.241134 22.3967 0.376811 22.6294 0.615305L22.665 0.653027C22.8783 0.884331 22.9979 1.18786 23 1.50366V9.63655C22.9975 9.97026 22.8648 10.2896 22.6304 10.5254C22.3961 10.7612 22.079 10.8945 21.7478 10.8965H20.3066V13.0881C20.305 13.1947 20.2723 13.2985 20.2127 13.3865C20.153 13.4746 20.0689 13.5429 19.9709 13.5832C19.8729 13.6234 19.7654 13.6336 19.6616 13.6127C19.5579 13.5918 19.4626 13.5405 19.3875 13.4653L19.3969 13.4729ZM17.0815 9.94965L19.2284 11.8791V10.3552C19.2284 10.2111 19.2852 10.0729 19.3863 9.97106C19.4874 9.86919 19.6245 9.81196 19.7675 9.81196H21.7478C21.7705 9.81169 21.793 9.80688 21.8139 9.79781C21.8348 9.78875 21.8537 9.77561 21.8695 9.75915C21.8862 9.74344 21.8997 9.72448 21.909 9.70342C21.9183 9.68235 21.9233 9.65961 21.9237 9.63655V1.49989C21.9219 1.45995 21.9075 1.42164 21.8826 1.39049L21.8695 1.36975C21.8369 1.3371 21.7936 1.31763 21.7478 1.31505H11.5187C11.4799 1.32139 11.4443 1.34065 11.4176 1.36975H11.3971C11.3807 1.38568 11.3677 1.40472 11.3587 1.42576C11.3497 1.44681 11.3449 1.46943 11.3446 1.49234V9.63655C11.3444 9.65966 11.3487 9.68258 11.3574 9.70397C11.366 9.72537 11.3789 9.74481 11.3951 9.76115C11.4113 9.77748 11.4306 9.7904 11.4518 9.79912C11.473 9.80785 11.4958 9.81221 11.5187 9.81196H16.724C16.856 9.81189 16.9833 9.86092 17.0815 9.94965Z" fill="white" />
                                    <path d="M16.7903 8.52438C16.3584 8.52438 15.9919 8.46053 15.6907 8.33282C15.3952 8.19931 15.1707 8.01646 15.0173 7.78426C14.8639 7.55207 14.7871 7.28795 14.7871 6.99191C14.7871 6.81196 14.8127 6.64652 14.8639 6.49559C14.9207 6.33886 15.0031 6.19955 15.1111 6.07765C15.2247 5.94994 15.3639 5.83965 15.5287 5.74677L15.5884 5.87738L14.5996 5.88609V5.19822H16.3726C16.4522 5.15178 16.5147 5.09373 16.5601 5.02407C16.6113 4.95441 16.6369 4.87315 16.6369 4.78027C16.6369 4.699 16.6198 4.62354 16.5857 4.55388C16.5573 4.47842 16.5175 4.41166 16.4664 4.35362L16.9352 4.24913L17.2847 4.35362C17.3358 4.42908 17.3728 4.50454 17.3955 4.58C17.4182 4.65547 17.4296 4.72512 17.4296 4.78898C17.4296 4.88185 17.4182 4.96022 17.3955 5.02407C17.3785 5.08792 17.3529 5.14597 17.3188 5.19822H19.0407V5.88609L18.0263 5.86867L18.086 5.76419C18.2451 5.83384 18.3815 5.92962 18.4951 6.05153C18.6144 6.16762 18.7054 6.30403 18.7679 6.46076C18.8304 6.61169 18.8616 6.78293 18.8616 6.97449C18.8616 7.27054 18.7849 7.53756 18.6315 7.77556C18.4837 8.00775 18.2564 8.1906 17.9496 8.32411C17.6484 8.45762 17.262 8.52438 16.7903 8.52438ZM16.8244 7.72331C17.2506 7.72331 17.5546 7.63334 17.7365 7.45339C17.924 7.27344 18.0178 7.05576 18.0178 6.80035C18.0178 6.60879 17.9723 6.44045 17.8814 6.29533C17.7905 6.15021 17.6569 6.03992 17.4807 5.96445C17.3046 5.88318 17.0858 5.84255 16.8244 5.84255C16.5573 5.84255 16.3328 5.88318 16.151 5.96445C15.9748 6.04572 15.8441 6.15891 15.7589 6.30403C15.6736 6.44916 15.631 6.61459 15.631 6.80035C15.631 7.07898 15.7276 7.30246 15.9208 7.4708C16.1197 7.63914 16.4209 7.72331 16.8244 7.72331ZM14.5996 4.41457V3.62221H17.1483C17.4552 3.62221 17.6711 3.6077 17.7961 3.57867C17.9212 3.54965 18.0121 3.51482 18.0689 3.47418C18.1428 3.41614 18.1911 3.35228 18.2138 3.28263C18.2422 3.21297 18.2564 3.1346 18.2564 3.04753C18.2564 2.86758 18.211 2.69053 18.1201 2.51639C18.0348 2.34224 17.9041 2.1623 17.7279 1.97654L18.3928 1.54989C18.6656 1.86335 18.8503 2.14488 18.9469 2.39449C19.0435 2.6441 19.0918 2.89951 19.0918 3.16072C19.0918 3.27682 19.0691 3.41904 19.0236 3.58738C18.9781 3.74991 18.8815 3.89794 18.7338 4.03145C18.5917 4.16496 18.4127 4.26364 18.1968 4.32749C17.9865 4.38554 17.6995 4.41457 17.3358 4.41457H14.5996Z" fill="white" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_hero_lang">
                                        <rect width="23" height="18" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                        <div className="event-hero-meta-info">
                            <span className="event-hero-meta-label">LANGUAGE</span>
                            <span className="event-hero-meta-value">
                                {Array.isArray(event.languages) && event.languages.length > 0
                                    ? event.languages.join(", ")
                                    : (event.language || "Hindi, Kannada")}
                            </span>
                        </div>
                    </div>
                </div>
            </MotionSection>

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="modal-overlay" onClick={() => setShareModalOpen(false)}>
                    <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Share Event</h3>
                            <button className="close-btn" onClick={() => setShareModalOpen(false)}>✕</button>
                        </div>
                        <div className="share-options">
                            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-option whatsapp">
                                WhatsApp
                            </a>
                            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="share-option facebook">
                                Facebook
                            </a>
                            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="share-option twitter">
                                Twitter / X
                            </a>
                            <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="share-option telegram">
                                Telegram
                            </a>
                        </div>
                        <div className="copy-link-section">
                            <input type="text" readOnly value={window.location.href} />
                            <button onClick={handleCopyLink}>{linkCopied ? "Copied!" : "Copy Link"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventDeatilHero;