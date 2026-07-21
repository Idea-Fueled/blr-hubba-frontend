import React, { useRef, useState } from "react";
import "./EventDetails.css"
import EventFAQs from "../EventListingSection/EventFAQs";
import SimilarEvents from "./SimilarEvents";
import SponsorsSection from "../SponsorsSection/SponsorsSection";
import siffLogo from "../../assets/SIFF_logo.png";

const cleanPerformerDescription = (html) => {
    if (!html) return "";
    // Remove <a> tags completely along with their text content
    let cleaned = html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "");
    // Remove empty paragraphs
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "");
    return cleaned;
};

const EventDetails = ({ event }) => {
    if (!event) return null;

    const [showsModalOpen, setShowsModalOpen] = useState(false);
    const [venuesModalOpen, setVenuesModalOpen] = useState(false);
    const [mediaCanScroll, setMediaCanScroll] = useState(false);
    const [mediaScrolled, setMediaScrolled] = useState(false);

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
            imageUrl: event.imageUrl || event.coverImage || "",
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
            if (img && img.url && img.url.trim() !== '' && !seenUrls.has(img.url)) {
                seenUrls.add(img.url);
                allImages.push(img);
            }
        });
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

    const startDate = new Date(event.startDateTime);
    const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

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

    return (
        <>
            <section className="detail-container-wrapper">

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
                            <div
                                className="event-about-desc-container"
                                dangerouslySetInnerHTML={{ __html: event.description || event.generalDescription || "No description available." }}
                            />
                        </div>

                        {presentedByList.length > 0 && (
                            <div className="presented-by-section">
                                <div className="section-top-content">
                                    <h2 className="presented-by-title">Presented By</h2>
                                    <div className="presented-by-desc-wrapper">
                                        <div
                                            className="presented-by-desc"
                                            dangerouslySetInnerHTML={{ __html: cleanPerformerDescription(event.performerDescription || event.presentedBy || "Presented by our featured artist lineup.") }}
                                        />
                                        {event.supportedBy && event.supportedBy.length > 0 && (
                                            <p className="presented-by-desc" style={{ marginTop: '16px' }}>
                                                This event is supported by {event.supportedBy.join(', ')}.
                                            </p>
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
                                                    <img
                                                        src={person.imageUrl}
                                                        alt={person.name}
                                                        className="presented-by-person-avatar"
                                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }}
                                                    />
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

                        {event.curatedBy && (
                            <div className="section-container">
                                <h2 className="curator-section-title">Curated By</h2>
                                <div className="curator-card-container">
                                    <div className="curator-card-content">
                                        <svg className="curator-star-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFF509" stroke="#000" strokeWidth="2">
                                            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" strokeLinejoin="round" />
                                        </svg>
                                        <div className="curator-image" style={{ background: '#E9E9E9', borderRadius: '50%' }}></div>
                                        <div className="curator-name">
                                            <h2 className="c-name">{event.curatedBy}</h2>
                                            <p className="c-desc">Curator</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="section-container">
                            <h2 className="section-title">Language</h2>
                            <p className="section-languages">{event.languages?.join(', ') || "English"}</p>
                        </div>

                        <div className="section-container">
                            <h2 className="age-suitability-section-title">
                                Age Suitability
                            </h2>
                            <p className="age-suitability-section-desc">
                                {event.suitability ? event.suitability.replace(/_/g, ' ') : "All Ages"}
                            </p>
                        </div>

                        <div className="section-container">
                            <h2 className="supported-by-section-title">Supported By</h2>
                            <div className="supported-by-card-container">
                                <div className="supported-by-logo-card">
                                    <img src={siffLogo} className="supported-by-logo" alt="SIFF" />
                                </div>
                            </div>
                        </div>

                        <div className="section-container">
                            <h2 className="additional-information-section-title">
                                Additional Information
                            </h2>
                            {event.generalDescription ? (
                                <div
                                    className="additional-information-section-desc"
                                    dangerouslySetInnerHTML={{ __html: event.generalDescription }}
                                />
                            ) : (
                                <p className="additional-information-section-desc">
                                    No additional information yet.
                                </p>
                            )}
                        </div>

                        {event.tags && event.tags.length > 0 && (
                            <div className="section-container">
                                <h2 className="tags-section-container-title">Tags</h2>
                                <div className="tags-section-container-desc">
                                    {event.tags.map((tag, idx) => (
                                        <div key={idx} className="tags-section-genre-pills">
                                            <p className="pill-content">{tag}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="right-container">
                        <div className="event-details-header">
                            <h2 className="event-details-header-title">Event Details</h2>
                        </div>
                        <div className="event-details-row">
                            <div className="event-details-item-row">
                                <div className="event-details-item-col">
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                                                <path d="M19 9H1M14 1V5M6 1V5M7 15L9 17L13.5 12.5M5.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7202 19 17.8802 19 16.2V7.8C19 6.11984 19 5.27976 18.673 4.63803C18.3854 4.07354 17.9265 3.6146 17.362 3.32698C16.7202 3 15.8802 3 14.2 3H5.8C4.11984 3 3.27976 3 2.63803 3.32698C2.07354 3.6146 1.6146 4.07354 1.32698 4.63803C1 5.27976 1 6.11984 1 7.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="item-detail">{dateStr}</span>
                                    </div>
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        {hasMultipleTimeSlots ? (
                                            <span
                                                className="item-detail"
                                                style={{ textDecoration: 'underline', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 600 }}
                                                onClick={() => setShowsModalOpen(true)}
                                            >
                                                {timeSlots.length} Shows
                                            </span>
                                        ) : (
                                            <span className="item-detail">{timeRangeStr}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="event-details-item-col">
                                    {event.eventLength && (
                                        <div className="event-detail-item">
                                            <div className="item-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                                                    <path d="M9 11L4.72711 7.43926C4.09226 6.91022 3.77484 6.6457 3.54664 6.32144C3.34444 6.03413 3.19429 5.71354 3.10301 5.37428C3 4.99139 3 4.57819 3 3.7518V1M9 11L13.2729 7.43926C13.9077 6.91022 14.2252 6.6457 14.4534 6.32144C14.6556 6.03413 14.8057 5.71354 14.897 5.37428C15 4.99139 15 4.57819 15 3.7518V1M9 11L4.72711 14.5607C4.09226 15.0898 3.77484 15.3543 3.54664 15.6786C3.34444 15.9659 3.19429 16.2865 3.10301 16.6257C3 17.0086 3 17.4218 3 18.2482V21M9 11L13.2729 14.5607C13.9077 15.0898 14.2252 15.3543 14.4534 15.6786C14.6556 15.9659 14.8057 16.2865 14.897 16.6257C15 17.0086 15 17.4218 15 18.2482V21M1 1H17M1 21H17" stroke="black" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                            <span className="item-detail">{event.eventLength} Mins</span>
                                        </div>
                                    )}
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                                                <path d="M9 11.5C10.6569 11.5 12 10.1569 12 8.5C12 6.84315 10.6569 5.5 9 5.5C7.34315 5.5 6 6.84315 6 8.5C6 10.1569 7.34315 11.5 9 11.5Z" stroke="black" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" />
                                                <path d="M9 21C11 17 17 14.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 14.4183 7 17 9 21Z" stroke="black" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                        {uniqueVenues.length > 1 ? (
                                            <span
                                                className="item-detail"
                                                style={{ textDecoration: 'underline', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 600 }}
                                                onClick={() => setVenuesModalOpen(true)}
                                            >
                                                {event.venue?.name || "Freedom Park"}
                                            </span>
                                        ) : (
                                            <span className="item-detail">{event.venue?.name || "Freedom Park"}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="event-details-cta-button-wrapper" onClick={hasMultipleTimeSlots ? () => setShowsModalOpen(true) : undefined} style={{ cursor: hasMultipleTimeSlots ? 'pointer' : 'default' }}>
                                <h2 className="event-detail-cta-button">{hasMultipleTimeSlots ? "Book Now" : "Book A Pass"}</h2>
                            </div>
                        </div>

                    </div>
                </div>

            </section>

            {allImages && allImages.length > 0 && (
                <section className="media-section">
                    <h2 className="media-section-title">Media</h2>
                    <div className="media-section-images-container" ref={handleMediaRef} onScroll={handleMediaScroll}>
                        {allImages.map((img, idx) => (
                            <div
                                key={idx}
                                className="media-section-images"
                                style={{ backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            ></div>
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
                                    <path d="M19 12H5M12 5L5 12L12 19" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div className="arrow-container" onClick={scrollMediaRight} style={{ cursor: "pointer" }} aria-label="Scroll Right">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12H19M12 19L19 12L12 5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {event.faqs && event.faqs.length > 0 && (
                <EventFAQs faqs={event.faqs} />
            )}
            <SimilarEvents currentEvent={event} />
            <hr />
            <SponsorsSection />            {venuesModalOpen && (
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
                                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {uniqueVenues.map((v, index) => {
                                const mapsUrl = v.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + ", " + (v.address || "Bengaluru"))}`;
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
                                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
        </>
    )
}

export default EventDetails;