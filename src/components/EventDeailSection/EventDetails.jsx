import React, { useRef, useState, useEffect } from "react";
import { MotionSection } from "../AnimatedPage";
import "./EventDetails.css"
import EventFAQs from "../EventListingSection/EventFAQs";
import SimilarEvents from "./SimilarEvents";
import SponsorsSection from "../SponsorsSection/SponsorsSection";
import { getEventDetailFormattedInfo, formatAgeSuitability, toTitleCase } from "../../utils/eventMappers";
import siffLogo from "../../assets/SIFF_logo.png";
import karnatakaLogo from "../../assets/Karnataka_DOT_logo7.png";
import prestigeLogo from "../../assets/prestige-logo_5.png";

const cleanPerformerDescription = (html) => {
    if (!html) return "";
    // Remove <a> tags completely along with their text content
    let cleaned = html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "");
    // Remove empty paragraphs
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "");
    return cleaned;
};

const parseSupporterItem = (item) => {
    if (!item) return { name: "", logoUrl: "" };
    if (typeof item === 'object') {
        return {
            name: item.name || item.title || "",
            logoUrl: item.logo || item.logoUrl || item.imageUrl || item.image || item.photo || item.url || ""
        };
    }
    if (typeof item === 'string' && item.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(item);
            return {
                name: parsed.name || parsed.title || "",
                logoUrl: parsed.logo || parsed.logoUrl || parsed.imageUrl || parsed.image || parsed.photo || parsed.url || ""
            };
        } catch {
            return { name: item, logoUrl: "" };
        }
    }
    return { name: String(item), logoUrl: "" };
};

import { useNavigate } from "react-router-dom";
import LoginModal from "../LoginModal/LoginModal";

const getParagraphs = (html) => {
    if (!html) return [];
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const children = Array.from(doc.body.children);
        if (children.length > 0) {
            return children.map(child => child.outerHTML);
        }
        const innerHTML = doc.body.innerHTML.trim();
        if (!innerHTML) return [];
        const parts = innerHTML
            .split(/(?:<br\s*\/?>\s*<br\s*\/?>|\n\s*\n|\r\n\s*\r\n)/i)
            .map(p => p.trim())
            .filter(Boolean);
        return parts.map(part => `<p>${part}</p>`);
    } catch (e) {
        return [`<p>${html}</p>`];
    }
};

const EventDetails = ({ event }) => {
    if (!event) return null;

    const navigate = useNavigate();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [pendingSlot, setPendingSlot] = useState(null);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        const handleGlobalLoginOpen = () => {
            setIsLoginModalOpen(true);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        window.addEventListener("open-login-modal", handleGlobalLoginOpen);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("open-login-modal", handleGlobalLoginOpen);
        };
    }, []);

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
            setPendingSlot(selectedSlot);
            setIsLoginModalOpen(true);
            return;
        }
        proceedBooking(selectedSlot);
    };

    const [showsModalOpen, setShowsModalOpen] = useState(false);
    const [venuesModalOpen, setVenuesModalOpen] = useState(false);
    const [mediaCanScroll, setMediaCanScroll] = useState(false);
    const [mediaScrolled, setMediaScrolled] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Get presented by list from performers
    let presentedByList = event.performers && event.performers.length > 0
        ? event.performers.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.roles?.join(', ') || p.description || "Performer",
            imageUrl: p.photo || "",
            socials: {
                website: p.website,
                twitter: p.twitter,
                facebook: p.facebook,
                youtube: p.youtube,
                instagram: p.instagram,
                whatsapp: p.whatsapp
            }
        }))
        : [];

    if (presentedByList.length === 0 && event.mainPerformer) {
        presentedByList = [{
            id: "main-performer",
            name: event.mainPerformer,
            role: "Performer",
            imageUrl: event.coverImage || event.imageUrl || "",
            socials: {
                website: event.websiteUrl || null,
                twitter: event.twitterUrl || null,
                facebook: event.facebookUrl || null,
                youtube: event.youtubeUrl || null,
                instagram: event.instagramUrl || null,
                whatsapp: event.whatsappUrl || null
            }
        }];
    }

    const splitIntoColumns = (items, numColumns) => {
        const columns = Array.from({ length: numColumns }, () => []);
        if (items.length === 0) return columns;

        const itemsPerColumn = Math.ceil(items.length / numColumns);
        items.forEach((item, index) => {
            const columnIndex = Math.floor(index / itemsPerColumn);
            if (columns[columnIndex]) {
                columns[columnIndex].push(item);
            }
        });
        return columns;
    };

    const presentedByColumns = splitIntoColumns(presentedByList, 2);
    const mediaContainerRef = useRef(null);

    // Only show images from the Media section in admin (16:9 images)
    // Do NOT include imageUrl / coverImage / squareImages — those are card thumbnails only
    const allImages = [];
    const seenUrls = new Set();

    if (event.images) {
        event.images.forEach(img => {
            const url = typeof img === 'string' ? img : img?.url;
            if (url && typeof url === 'string' && url.trim() !== '' && !seenUrls.has(url)) {
                seenUrls.add(url);
                allImages.push(typeof img === 'string' ? { url: img } : img);
            }
        });
    }

    if (allImages.length === 0) {
        const fallbackUrl = event.coverImage || event.imageUrl;
        if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.trim() !== '' && !seenUrls.has(fallbackUrl)) {
            seenUrls.add(fallbackUrl);
            allImages.push({ url: fallbackUrl });
        }
    }

    const scrollMediaLeft = () => {
        if (mediaContainerRef.current) {
            mediaContainerRef.current.scrollBy({ left: -327, behavior: "smooth" });
        }
    };

    const scrollMediaRight = () => {
        if (mediaContainerRef.current) {
            mediaContainerRef.current.scrollBy({ left: 327, behavior: "smooth" });
        }
    };

    const handleMediaScroll = () => {
        const el = mediaContainerRef.current;
        if (!el) return;
        setMediaScrolled(el.scrollLeft > 10);
        setMediaCanScroll(el.scrollWidth > el.clientWidth + 10);
    };

    const handleMediaRef = (el) => {
        mediaContainerRef.current = el;
        if (el) {
            // Check on mount whether scrolling is needed at all
            requestAnimationFrame(() => {
                setMediaCanScroll(el.scrollWidth > el.clientWidth + 10);
            });
        }
    };

    // Keyboard navigation for Lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setLightboxIndex(null);
            } else if (e.key === "ArrowLeft") {
                setLightboxIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
            } else if (e.key === "ArrowRight") {
                setLightboxIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, allImages.length]);

    const startDate = new Date(event.startDateTime);
    const weekday = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    const day = startDate.getDate();
    const month = startDate.toLocaleDateString('en-US', { month: 'short' });
    const year2Digit = startDate.toLocaleDateString('en-US', { year: '2-digit' });
    const dateStr = `${weekday} ${day}, ${month} ${year2Digit}`;

    const formatTimePart = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    };

    const timeRangeStr = `${formatTimePart(new Date(event.startDateTime))}-${formatTimePart(new Date(event.endDateTime))}`;

    // Compute all shows/sessions for popup
    const shows = [];

    // Helper to format 24h string to am/pm
    const formatHourString = (timeStr) => {
        if (!timeStr) return "";
        if (timeStr.includes('T')) {
            const date = new Date(timeStr);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toLowerCase();
        } else {
            const [h, m] = timeStr.split(':').map(Number);
            const ampm = h >= 12 ? 'pm' : 'am';
            const displayHour = h % 12 || 12;
            const displayMin = String(m || 0).padStart(2, '0');
            return `${displayHour}:${displayMin} ${ampm}`;
        }
    };

    if (event.eventDates) {
        event.eventDates.forEach(ed => {
            const edDate = new Date(ed.date);
            const dateLabel = edDate.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: '2-digit'
            }).toUpperCase(); // e.g. "THU 21, JAN 26"

            if (ed.timeSlots && ed.timeSlots.length > 0) {
                ed.timeSlots.forEach(ts => {
                    shows.push({
                        dateLabel: dateLabel,
                        timeLabel: `${formatHourString(ts.startTime)}–${formatHourString(ts.endTime)}`,
                        venueLabel: ed.venue?.name || event.venue?.name || "Freedom Park"
                    });
                });
            }
        });
    }

    if (shows.length === 0) {
        const edDate = new Date(event.startDateTime);
        const dateLabel = edDate.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: '2-digit'
        }).toUpperCase();
        shows.push({
            dateLabel: dateLabel,
            timeLabel: timeRangeStr,
            venueLabel: event.venue?.name || "Freedom Park"
        });
    }

    const hasMultipleShows = shows.length > 1;

    // Extract unique timeSlots list
    const timeSlots = [];
    if (event.eventDates) {
        event.eventDates.forEach(ed => {
            if (ed.timeSlots && ed.timeSlots.length > 0) {
                ed.timeSlots.forEach(ts => {
                    const formatToAMPM = (timeStr) => {
                        if (!timeStr) return "";
                        if (timeStr.includes('T')) {
                            const date = new Date(timeStr);
                            return date.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }).toUpperCase();
                        } else {
                            const [h, m] = timeStr.split(':').map(Number);
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const displayHour = h % 12 || 12;
                            const displayMin = String(m || 0).padStart(2, '0');
                            return `${displayHour}:${displayMin} ${ampm}`;
                        }
                    };
                    const formatted = formatToAMPM(ts.startTime);
                    if (formatted && !timeSlots.includes(formatted)) {
                        timeSlots.push(formatted);
                    }
                });
            }
        });
    }

    if (timeSlots.length === 0) {
        const formatToAMPM = (date) => {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toUpperCase();
        };
        timeSlots.push(formatToAMPM(new Date(event.startDateTime)));
    }

    const hasMultipleTimeSlots = timeSlots.length > 1;

    // Group timeSlots into pairs of 2 for rows
    const slotRows = [];
    for (let i = 0; i < timeSlots.length; i += 2) {
        slotRows.push(timeSlots.slice(i, i + 2));
    }

    // Compute unique venues list
    const uniqueVenues = [];
    const seenVenueIds = new Set();

    if (event.venue) {
        seenVenueIds.add(event.venue.id);
        uniqueVenues.push(event.venue);
    }

    if (event.eventDates) {
        event.eventDates.forEach(ed => {
            if (ed.venue && !seenVenueIds.has(ed.venue.id)) {
                seenVenueIds.add(ed.venue.id);
                uniqueVenues.push(ed.venue);
            }
        });
    }
    const { formattedDate, venueDisplay, timeSlotDisplay } = getEventDetailFormattedInfo(event);

    return (
        <>
            <div className="detail-container-wrapper">

                {/* <div className="artist-image">
                    <img
                        src={event.performers?.[0]?.photo || event.imageUrl || ""}
                        alt={event.title}
                        className="artist"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div> */}

                <div className="event-detail-section">
                    <div className="left-container">

                        <div className="event-detail-about-section">
                            <span className="event-about-title-container">About</span>
                            {(() => {
                                const descHtml = event.description || event.generalDescription || "No description available.";
                                if (isMobile) {
                                    const paragraphs = getParagraphs(descHtml);
                                    if (paragraphs.length > 2) {
                                        const visibleParagraphs = isAboutExpanded ? paragraphs : paragraphs.slice(0, 2);
                                        return (
                                            <>
                                                <div
                                                    className="event-about-desc-container"
                                                    dangerouslySetInnerHTML={{ __html: visibleParagraphs.join("") }}
                                                />
                                                <button
                                                    className="event-about-read-more-btn"
                                                    onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                                                >
                                                    {isAboutExpanded ? "READ LESS" : "READ MORE"}
                                                </button>
                                            </>
                                        );
                                    }
                                }
                                return (
                                    <div
                                        className="event-about-desc-container"
                                        dangerouslySetInnerHTML={{ __html: descHtml }}
                                    />
                                );
                            })()}
                        </div>

                        {presentedByList.length > 0 && (
                            <div className="presented-by-section">
                                <div className="section-top-content">
                                    <h2 className="presented-by-title">Presented By</h2>
                                    <div className="presented-by-desc-wrapper">
                                        {(event.performerDescription || event.presentedBy) && (
                                            <div
                                                className="presented-by-desc"
                                                dangerouslySetInnerHTML={{ __html: cleanPerformerDescription(event.performerDescription || event.presentedBy) }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="section-bottom-content">
                                    {presentedByColumns.map((column, columnIndex) => (
                                        <div key={columnIndex} className="presented-by-column">
                                            {column.map((person) => (
                                                <div key={person.id} className="presented-by-person">
                                                    <svg className="presented-by-person-star-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFF509" stroke="#000" strokeWidth="2">
                                                        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" strokeLinejoin="round" />
                                                    </svg>
                                                    {person.imageUrl ? (
                                                        <img
                                                            src={person.imageUrl}
                                                            alt={person.name}
                                                            className="presented-by-person-avatar"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const fallback = e.target.nextSibling;
                                                                if (fallback) fallback.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="presented-by-person-avatar presented-by-person-avatar-initial"
                                                        style={{ display: person.imageUrl ? 'none' : 'flex' }}
                                                    >
                                                        {person.name ? person.name.trim().charAt(0).toUpperCase() : "P"}
                                                    </div>
                                                    <div className="presented-by-person-info">
                                                        <h4 className="presented-by-person-name">{person.name}</h4>
                                                        <p className="presented-by-person-role">{person.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {event.curatedBy && (() => {
                            const curatorName = typeof event.curatedBy === 'string' ? event.curatedBy : (event.curator?.name || event.curatedBy?.name || "");
                            const curatorInitial = curatorName ? curatorName.trim().charAt(0).toUpperCase() : "C";
                            const curatorPhoto = event.curatorPhoto || event.curatorImage || event.curator?.photo || event.curator?.imageUrl || null;

                            return (
                                <div className="section-container curator-section-container">
                                    <h2 className="curator-section-title">Curated By</h2>
                                    <div className="curator-card-container">
                                        <div className="curator-card-content">
                                            <svg className="curator-star-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFF509" stroke="#000" strokeWidth="2">
                                                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" strokeLinejoin="round" />
                                            </svg>
                                            {curatorPhoto ? (
                                                <img
                                                    src={curatorPhoto}
                                                    alt={curatorName}
                                                    className="curator-image"
                                                    style={{ objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.nextSibling;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="curator-image curator-image-initial"
                                                style={{ display: curatorPhoto ? 'none' : 'flex' }}
                                            >
                                                {curatorInitial}
                                            </div>
                                            <div className="curator-name">
                                                <h2 className="c-name">{curatorName}</h2>
                                                <p className="c-desc">Curator</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {event.supportedBy && event.supportedBy.length > 0 && (() => {
                            const rawSupporters = event.supportedBy.map(parseSupporterItem);

                            const textSupporters = rawSupporters.filter(s => s.name && String(s.name).trim() !== "");
                            const logoSupporters = rawSupporters.filter(s => s.logoUrl && String(s.logoUrl).trim() !== "");

                            if (textSupporters.length === 0 && logoSupporters.length === 0) return null;

                            return (
                                <div className="section-container">
                                    <h2 className="supported-by-section-title">Supported by</h2>
                                    <div className="supported-by-content-wrapper">
                                        {/* Text Supporters Row */}
                                        {textSupporters.length > 0 && (
                                            <div className="supported-by-text-row">
                                                {textSupporters.map((supporter, idx) => (
                                                    <React.Fragment key={idx}>
                                                        {idx > 0 && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="28" viewBox="0 0 1 28" fill="none">
                                                                <path d="M0.5 28V0" stroke="#A4A4A4" />
                                                            </svg>
                                                        )}
                                                        <span className="supported-by-text-name">{supporter.name}</span>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        )}

                                        {/* Logo Supporters Row */}
                                        {logoSupporters.length > 0 && (
                                            <div className="supported-by-logos-row">
                                                {logoSupporters.map((supporter, idx) => (
                                                    <div key={idx} className="supported-by-logo-card">
                                                        <img src={supporter.logoUrl} alt={supporter.name || "Supporter"} className="supported-by-logo-img" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {(event.generalDescription || event.additionalInformation) && (
                            <div className="section-container">
                                <h2 className="additional-information-section-title">
                                    Additional Information
                                </h2>
                                <div
                                    className="additional-information-section-desc"
                                    dangerouslySetInnerHTML={{ __html: event.generalDescription || event.additionalInformation }}
                                />
                            </div>
                        )}

                        {event.tags && event.tags.length > 0 && (
                            <div className="section-container tags-section-container">
                                <h2 className="tags-section-container-title">Tags</h2>
                                <div className="tags-section-container-desc">
                                    {event.tags.map((tag, idx) => (
                                        <div key={idx} className="tags-section-genre-pills">
                                            <p className="pill-content">{toTitleCase(tag)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="right-container">
                        <div className="event-details-card-outer">
                            {/* Black Header */}
                            <div className="event-details-card-header">
                                <h3 className="event-details-card-title">Event Details</h3>
                            </div>

                            {/* Card Body */}
                            <div className="event-details-card-body">
                                <div className="event-details-grid">
                                    {/* 1. DATE */}
                                    <div className="event-details-grid-item">
                                        <div className="event-details-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M21 10H3M16 2V6M8 2V6M9 16L11 18L15.5 13.5M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="event-details-info">
                                            <span className="event-details-value">{formattedDate}</span>
                                        </div>
                                    </div>

                                    {/* 2. VENUE */}
                                    <div className="event-details-grid-item">
                                        <div className="event-details-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 12.5C13.6569 12.5 15 11.1569 15 9.5C15 7.84315 13.6569 6.5 12 6.5C10.3431 6.5 9 7.84315 9 9.5C9 11.1569 10.3431 12.5 12 12.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 22C14 18 20 15.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 15.4183 10 18 12 22Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="event-details-info">
                                            <span className="event-details-value">{venueDisplay}</span>
                                        </div>
                                    </div>

                                    {/* 3. TIME SLOT */}
                                    <div className="event-details-grid-item">
                                        <div className="event-details-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="event-details-info">
                                            <span className="event-details-value">{timeSlotDisplay}</span>
                                        </div>
                                    </div>

                                    {/* 4. DURATION */}
                                    <div className="event-details-grid-item">
                                        <div className="event-details-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 12L7.72711 8.43926C7.09226 7.91022 6.77484 7.6457 6.54664 7.32144C6.34444 7.03413 6.19429 6.71354 6.10301 6.37428C6 5.99139 6 5.57819 6 4.7518V2M12 12L16.2729 8.43926C16.9077 7.91022 17.2252 7.6457 17.4534 7.32144C17.6556 7.03413 17.8057 6.71354 17.897 6.37428C18 5.99139 18 5.57819 18 4.7518V2M12 12L7.72711 15.5607C7.09226 16.0898 6.77484 16.3543 6.54664 16.6786C6.34444 16.9659 6.19429 17.2865 6.10301 17.6257C6 18.0086 6 18.4218 6 19.2482V22M12 12L16.2729 15.5607C16.9077 16.0898 17.2252 16.3543 17.4534 16.6786C17.6556 16.9659 17.8057 17.2865 17.897 17.6257C18 18.0086 18 18.4218 18 19.2482V22M4 2H20M4 22H20" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="event-details-info">
                                            <span className="event-details-value">{event.eventLength ? `${event.eventLength} Mins` : "60 Mins"}</span>
                                        </div>
                                    </div>

                                    {/* 5. AGE SUITABILITY */}
                                    <div className="event-details-grid-item">
                                        <div className="event-details-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <g clipPath="url(#clip0_2173_34745)">
                                                    <path d="M15.9878 11.0223C19.0458 10.7256 21.703 12.9953 21.9851 15.9622C22.2671 18.9292 20.0553 21.6736 17.0269 21.9555C13.9986 22.2374 11.3414 20.0418 11.0296 17.0452C10.7179 14.0485 12.9001 11.3041 15.9878 11.0074V11.0223ZM15.9878 11.942C13.4196 12.2387 11.6531 14.5678 11.95 17.06C12.2469 19.5523 14.5182 21.3324 17.0121 21.0506C19.506 20.7687 21.3319 18.499 21.0499 15.9919C20.7678 13.4848 18.5411 11.6601 15.9729 11.9568L15.9878 11.942Z" fill="white" />
                                                    <path d="M8.6399 0.0296697C11.4159 -0.267026 13.8356 1.76534 14.1176 4.46527C14.3997 7.16521 12.4105 9.65745 9.67903 9.93931C6.94759 10.2212 4.49819 8.26298 4.2013 5.53338C3.9044 2.80378 5.84907 0.311531 8.6399 0.0296697ZM8.69928 0.949427C6.39833 1.21645 4.83962 3.27849 5.12168 5.50371C5.40373 7.72893 7.40778 9.28658 9.6345 9.03439C11.8612 8.7822 13.4793 6.76467 13.2121 4.52461C12.9449 2.28456 10.9705 0.682401 8.69928 0.949427Z" fill="white" />
                                                    <path d="M0.920182 14.7458V16.793C0.920182 17.1639 1.21708 17.4309 1.60304 17.4309H9.738C10.02 17.4309 10.1982 17.6237 10.213 17.8611C10.213 18.1281 10.0349 18.3506 9.738 18.3506H1.54366C0.682665 18.3506 0.0146484 17.6386 0.0146484 16.8078V14.8496C0.0146484 12.9953 1.17254 11.3783 2.92423 10.7849L5.55176 9.90964C5.68536 9.86514 5.89319 9.90964 6.01195 9.98382C8.00115 11.2448 10.5099 11.2003 12.4694 9.89481C12.8999 9.90964 13.7312 10.0728 13.5828 10.6514C13.5234 10.9036 13.2414 11.0668 12.9742 10.9332L12.6327 10.8739C10.4802 12.1497 7.82302 12.1497 5.67052 10.8442L3.23597 11.6601C1.89994 12.1052 0.979561 13.3068 0.935026 14.7606L0.920182 14.7458Z" fill="white" />
                                                    <path d="M13.895 16.8375C13.6871 16.6298 13.7168 16.3331 13.895 16.1551C14.0731 15.9771 14.3551 16.0067 14.5481 16.1996L15.7209 17.3715L18.4672 14.6419C18.6453 14.4639 18.9273 14.4936 19.0906 14.6419C19.2688 14.7903 19.3133 15.1018 19.1203 15.2947L16.0623 18.3506C15.8693 18.5435 15.5873 18.5287 15.3943 18.3506L13.895 16.8523V16.8375Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2173_34745">
                                                        <rect width="22" height="22" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <div className="event-details-info">
                                            <span className="event-details-value">{formatAgeSuitability(event)}</span>
                                        </div>
                                    </div>

                                    {/* 6. LANGUAGE */}
                                    <div className="event-details-grid-item">
                                        <div className="event-details-icon-box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="18" viewBox="0 0 23 18" fill="none">
                                                <g clipPath="url(#clip0_2173_34755)">
                                                    <path d="M3.77157 16.0116L5.92033 14.0821C6.01886 13.9938 6.146 13.9449 6.27783 13.9444H11.4813C11.5042 13.9447 11.527 13.9403 11.5482 13.9316C11.5694 13.9229 11.5887 13.9099 11.6049 13.8936C11.6211 13.8773 11.634 13.8578 11.6426 13.8364C11.6513 13.815 11.6556 13.7921 11.6554 13.769V12.6675H12.7279V13.769C12.7264 14.1027 12.5942 14.4223 12.36 14.6583C12.1259 14.8942 11.8087 15.0274 11.4775 15.0289H6.47998L3.61247 17.6035C3.53768 17.6789 3.44245 17.7304 3.33874 17.7515C3.23502 17.7725 3.12743 17.7623 3.02947 17.722C2.93151 17.6817 2.84754 17.6132 2.78809 17.525C2.72865 17.4368 2.69637 17.3329 2.69531 17.2262V15.0289H1.2522C0.920721 15.0279 0.603074 14.8949 0.368508 14.6589C0.133943 14.4229 0.00148056 14.103 0 13.769L0 5.63046C0.00389662 5.2972 0.137134 4.97873 0.371179 4.74324C0.605225 4.50775 0.921472 4.37397 1.2522 4.37054H8.11401V5.45505H1.2522C1.20671 5.4577 1.16374 5.47698 1.13135 5.50927C1.09896 5.54156 1.07937 5.58465 1.07625 5.63046V13.769C1.07642 13.7919 1.08114 13.8146 1.09015 13.8357C1.09915 13.8567 1.11224 13.8757 1.12866 13.8916C1.16195 13.924 1.20596 13.9428 1.2522 13.9444H3.2325C3.37547 13.9444 3.51258 14.0016 3.61368 14.1035C3.71477 14.2054 3.77157 14.3436 3.77157 14.4876V16.0116ZM19.3969 13.4729L16.52 10.8965H11.5187C11.1875 10.8945 10.8705 10.7612 10.6361 10.5254C10.4017 10.2896 10.269 9.97026 10.2665 9.63655V1.49989C10.2695 1.16491 10.4041 0.844775 10.6409 0.609647L10.6783 0.575697C10.9067 0.361235 11.2065 0.240781 11.5187 0.238084L21.7478 0.238084C22.0797 0.241134 22.3967 0.376811 22.6294 0.615305L22.665 0.653027C22.8783 0.884331 22.9979 1.18786 23 1.50366V9.63655C22.9975 9.97026 22.8648 10.2896 22.6304 10.5254C22.3961 10.7612 22.079 10.8945 21.7478 10.8965H20.3066V13.0881C20.305 13.1947 20.2723 13.2985 20.2127 13.3865C20.153 13.4746 20.0689 13.5429 19.9709 13.5832C19.8729 13.6234 19.7654 13.6336 19.6616 13.6127C19.5579 13.5918 19.4626 13.5405 19.3875 13.4653L19.3969 13.4729ZM17.0815 9.94965L19.2284 11.8791V10.3552C19.2284 10.2111 19.2852 10.0729 19.3863 9.97106C19.4874 9.86919 19.6245 9.81196 19.7675 9.81196H21.7478C21.7705 9.81169 21.793 9.80688 21.8139 9.79781C21.8348 9.78875 21.8537 9.77561 21.8695 9.75915C21.8862 9.74344 21.8997 9.72448 21.909 9.70342C21.9183 9.68235 21.9233 9.65961 21.9237 9.63655V1.49989C21.9219 1.45995 21.9075 1.42164 21.8826 1.39049L21.8695 1.36975C21.8369 1.3371 21.7936 1.31763 21.7478 1.31505H11.5187C11.4799 1.32139 11.4443 1.34065 11.4176 1.36975H11.3971C11.3807 1.38568 11.3677 1.40472 11.3587 1.42576C11.3497 1.44681 11.3449 1.46943 11.3446 1.49234V9.63655C11.3444 9.65966 11.3487 9.68258 11.3574 9.70397C11.366 9.72537 11.3789 9.74481 11.3951 9.76115C11.4113 9.77748 11.4306 9.7904 11.4518 9.79912C11.473 9.80785 11.4958 9.81221 11.5187 9.81196H16.724C16.856 9.81189 16.9833 9.86092 17.0815 9.94965Z" fill="white" />
                                                    <path d="M16.7903 8.52438C16.3584 8.52438 15.9919 8.46053 15.6907 8.33282C15.3952 8.19931 15.1707 8.01646 15.0173 7.78426C14.8639 7.55207 14.7871 7.28795 14.7871 6.99191C14.7871 6.81196 14.8127 6.64652 14.8639 6.49559C14.9207 6.33886 15.0031 6.19955 15.1111 6.07765C15.2247 5.94994 15.3639 5.83965 15.5287 5.74677L15.5884 5.87738L14.5996 5.88609V5.19822H16.3726C16.4522 5.15178 16.5147 5.09373 16.5601 5.02407C16.6113 4.95441 16.6369 4.87315 16.6369 4.78027C16.6369 4.699 16.6198 4.62354 16.5857 4.55388C16.5573 4.47842 16.5175 4.41166 16.4664 4.35362L16.9352 4.24913L17.2847 4.35362C17.3358 4.42908 17.3728 4.50454 17.3955 4.58C17.4182 4.65547 17.4296 4.72512 17.4296 4.78898C17.4296 4.88185 17.4182 4.96022 17.3955 5.02407C17.3785 5.08792 17.3529 5.14597 17.3188 5.19822H19.0407V5.88609L18.0263 5.86867L18.086 5.76419C18.2451 5.83384 18.3815 5.92962 18.4951 6.05153C18.6144 6.16762 18.7054 6.30403 18.7679 6.46076C18.8304 6.61169 18.8616 6.78293 18.8616 6.97449C18.8616 7.27054 18.7849 7.53756 18.6315 7.77556C18.4837 8.00775 18.2564 8.1906 17.9496 8.32411C17.6484 8.45762 17.262 8.52438 16.7903 8.52438ZM16.8244 7.72331C17.2506 7.72331 17.5546 7.63334 17.7365 7.45339C17.924 7.27344 18.0178 7.05576 18.0178 6.80035C18.0178 6.60879 17.9723 6.44045 17.8814 6.29533C17.7905 6.15021 17.6569 6.03992 17.4807 5.96445C17.3046 5.88318 17.0858 5.84255 16.8244 5.84255C16.5573 5.84255 16.3328 5.88318 16.151 5.96445C15.9748 6.04572 15.8441 6.15891 15.7589 6.30403C15.6736 6.44916 15.631 6.61459 15.631 6.80035C15.631 7.07898 15.7276 7.30246 15.9208 7.4708C16.1197 7.63914 16.4209 7.72331 16.8244 7.72331ZM14.5996 4.41457V3.62221H17.1483C17.4552 3.62221 17.6711 3.6077 17.7961 3.57867C17.9212 3.54965 18.0121 3.51482 18.0689 3.47418C18.1428 3.41614 18.1911 3.35228 18.2138 3.28263C18.2422 3.21297 18.2564 3.1346 18.2564 3.04753C18.2564 2.86758 18.211 2.69053 18.1201 2.51639C18.0348 2.34224 17.9041 2.1623 17.7279 1.97654L18.3928 1.54989C18.6656 1.86335 18.8503 2.14488 18.9469 2.39449C19.0435 2.6441 19.0918 2.89951 19.0918 3.16072C19.0918 3.27682 19.0691 3.41904 19.0236 3.58738C18.9781 3.74991 18.8815 3.89794 18.7338 4.03145C18.5917 4.16496 18.4127 4.26364 18.1968 4.32749C17.9865 4.38554 17.6995 4.41457 17.3358 4.41457H14.5996Z" fill="white" />
                                                    <path d="M6.60898 8.37184L5.12407 12.4412H4.08887L6.07866 7.32155H6.76596L6.60898 8.37184ZM7.97935 12.4412L6.48595 8.36305L6.32897 7.32155H7.029L9.01455 12.4412H7.97935ZM7.91571 10.5427V11.3382H5.09013V10.5427H7.91571Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_2173_34755">
                                                        <rect width="23" height="18" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <div className="event-details-info">
                                            <span className="event-details-value">
                                                {Array.isArray(event.languages) && event.languages.length > 0
                                                    ? event.languages.join(", ")
                                                    : (event.language || "Hindi, Kannada")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button className="get-passes-btn" onClick={() => handleBookingClick()}>
                                    <span className="btn-text-primary">GET PASSES</span>
                                    <span className="btn-text-secondary">GET PASSES</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {allImages && allImages.length > 0 && (
                <section className="media-section">
                    <h2 className="media-section-title">Media</h2>
                    <div className="media-section-images-container" ref={handleMediaRef} onScroll={handleMediaScroll}>
                        {allImages.map((img, idx) => (
                            <div
                                key={idx}
                                className="media-section-images"
                                onClick={() => setLightboxIndex(idx)}
                                title="Click to view image"
                            >
                                <img
                                    src={img.url}
                                    alt={`Media ${idx + 1}`}
                                    className="media-section-img"
                                />
                            </div>
                        ))}
                    </div>
                    {mediaCanScroll && (
                        <div className="media-section-navigation-container">
                            <div
                                className="arrow-container"
                                onClick={scrollMediaLeft}
                                aria-label="Scroll Left"
                                style={{ cursor: mediaScrolled ? "pointer" : "default", opacity: mediaScrolled ? 1 : 0.3 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M12 5L5 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="arrow-container" onClick={scrollMediaRight} style={{ cursor: "pointer" }} aria-label="Scroll Right">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12H19M12 19L19 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Media Lightbox Modal */}
            {lightboxIndex !== null && allImages[lightboxIndex] && (
                <div
                    className="media-lightbox-overlay"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div className="media-lightbox-container" onClick={(e) => e.stopPropagation()}>
                        {/* Top Header Controls */}
                        <div className="media-lightbox-header">
                            <span className="media-lightbox-counter">
                                Media {lightboxIndex + 1} / {allImages.length}
                            </span>
                            <button
                                className="media-lightbox-close-btn"
                                onClick={() => setLightboxIndex(null)}
                                aria-label="Close Lightbox"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Main Image View */}
                        <div className="media-lightbox-content">
                            <img
                                src={allImages[lightboxIndex].url}
                                alt={`Media ${lightboxIndex + 1}`}
                                className="media-lightbox-img"
                            />
                        </div>

                        {/* Previous/Next Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    className="media-lightbox-nav-btn prev"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
                                    }}
                                    aria-label="Previous Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <button
                                    className="media-lightbox-nav-btn next"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
                                    }}
                                    aria-label="Next Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Event FAQs Section (Media ke neeche and Similar Events ke upar) */}
            <EventFAQs
                title="Event FAQs"
                faqs={event?.faqs}
            />

            <SimilarEvents currentEvent={event} />
            <div className="event-details-sponsors-wrapper">
                <SponsorsSection />
            </div>
            {venuesModalOpen && (
                <div
                    className="shows-modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 99999
                    }}
                    onClick={() => setVenuesModalOpen(false)}
                >
                    <div className="show-venue-modal-content" onClick={(e) => e.stopPropagation()} style={{ overflowY: 'auto', maxHeight: '90vh' }}>
                        <div className="venue-modal-content-container">
                            <div className="venue-modal-title-container">
                                <div className="venue-modal-title">Venues</div>
                                <div className="cross-modal" onClick={() => setVenuesModalOpen(false)} style={{ cursor: 'pointer' }}>
                                    <div className="cross-modal-container">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {uniqueVenues.map((v, index) => {
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
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((v.name || "Venue") + ", " + (v.address || "Bengaluru"))}`;
                                return (
                                    <div key={index} className="venue-modal-bottom-content-container" style={{ width: '100%' }}>
                                        <div className="venue-content-container">
                                            <div className="venue-heading-container">
                                                <h2 className="venue-modal-heading">{v.name}</h2>
                                                <div className="venue-modal-desc">{v.address || "Bengaluru, Karnataka, India"}</div>
                                            </div>
                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="get-directions-container"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <h3 className="get-directions-title">Get Directions</h3>
                                                <div className="get-directions-arrow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                        <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                                    </svg>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {showsModalOpen && (
                <div
                    className="shows-modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 99999
                    }}
                    onClick={() => setShowsModalOpen(false)}
                >
                    <div className="time-slots-modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'auto', minWidth: '220px' }}>
                        <div className="time-slots-modal-inner-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '20px' }}>
                                <h2 className="time-slots-modal-heading">Time Slots</h2>
                                <div className="cross-modal" onClick={() => setShowsModalOpen(false)} style={{ cursor: 'pointer', padding: '6px' }}>
                                    <div className="cross-modal-container" style={{ width: '14px', height: '14px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill="none">
                                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="time-slots-bottom-row">
                                {slotRows.map((row, rIdx) => (
                                    <div key={rIdx} className="time-slots-row">
                                        {row.map((slot, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className="time-slots-time-container"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    alert(`Selected Time Slot: ${slot}`);
                                                    setShowsModalOpen(false);
                                                }}
                                            >
                                                <h3 className="time-slot">{slot}</h3>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => proceedBooking(pendingSlot)}
            />
            {/* Mobile Sticky Bottom CTA Bar */}
            {isMobile && !isLoginModalOpen && !showsModalOpen && !venuesModalOpen && lightboxIndex === null && (
                <div className="mobile-sticky-cta-bar">
                    <button
                        className="mobile-sticky-get-passes-btn"
                        onClick={() => handleBookingClick()}
                    >
                        GET PASSES
                    </button>
                    <button
                        className="mobile-sticky-login-btn"
                        onClick={() => {
                            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                            if (isLoggedIn) {
                                localStorage.removeItem("isLoggedIn");
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                window.location.reload();
                            } else {
                                setIsLoginModalOpen(true);
                            }
                        }}
                    >
                        {localStorage.getItem("isLoggedIn") === "true" ? "LOGOUT" : "LOGIN"}
                    </button>
                </div>
            )}
        </>
    );
};

export default EventDetails;