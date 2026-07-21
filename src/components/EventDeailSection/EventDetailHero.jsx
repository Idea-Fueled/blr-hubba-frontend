import React, { useState } from "react";
import "./EventDetailHero.css"
import heartIcon from "../../assets/heart_icon.png";
import { getSubfestivalLogo } from "../../utils/logoMapper";

const EventDeatilHero = ({ event }) => {
    if (!event) return null;

    const [liked, setLiked] = useState(false);
    const [showsModalOpen, setShowsModalOpen] = useState(false);
    const [venuesModalOpen, setVenuesModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const logoConfig = getSubfestivalLogo(event.subfestival?.logoKey);

    const genreName = event.genres?.[0]?.name || "Music";
    const performerName = event.mainPerformer
        ? `By ${event.mainPerformer}`
        : (event.performers?.[0] ? `By ${event.performers[0].name}` : "");

    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    const formattedDate = startDate.toLocaleDateString('en-US', {
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

    const formattedTime = `${formatTimePart(startDate)} - ${formatTimePart(endDate)}`;
    const venueName = event.venue?.name || "Freedom Park";
    const imageUrl = event.imageUrl || event.coverImage;

    // ---- Share handlers ----
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

    // Calculate dates and time slots for mobile event details card
    const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const timeRangeStr = `${formatTimePart(new Date(event.startDateTime))}-${formatTimePart(new Date(event.endDateTime))}`;

    const shows = [];
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
            }).toUpperCase();

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
    const slotRows = [];
    for (let i = 0; i < timeSlots.length; i += 2) {
        slotRows.push(timeSlots.slice(i, i + 2));
    }

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
            <section className="hero-wrapper">
                <div className="hero-event-detail">
                    <div className="hero-event-detail-wrapper">
                        <div className="hero-left-wrapper-top-row">
                            <span className="genre-pill">{genreName}</span>
                            <span className="top-row-title">{event.title}</span>
                            <div className="top-row-performer">{performerName}</div>
                        </div>
                        <div className="venue-date-section">
                            <div className="date-time-section">
                                <span className="date-time-header">Date & Time</span>
                                <div className="date-time-wrapper">
                                    {formattedDate} <br /> {formattedTime}
                                </div>
                            </div>
                            <svg className="divider-line" xmlns="http://www.w3.org/2000/svg" width="1" height="74" viewBox="0 0 1 74" fill="none">
                                <path d="M0.5 74V0" stroke="#4E4E4E" />
                            </svg>
                            <div className="venue-wrapper">
                                <span className="venue-wrapper-title">Venue</span>
                                {uniqueVenues.length > 1 ? (
                                    <span
                                        className="hero-venue-name"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setVenuesModalOpen(true)}
                                    >
                                        {`${uniqueVenues.length} Hubba Venues Across Bengaluru`}
                                    </span>
                                ) : (
                                    <span className="hero-venue-name">{venueName}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons inside black card */}
                    <div className="icons-wrapper">
                        <button
                            className={`heart-icon ${liked ? "liked" : ""}`}
                            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                            aria-label="Favorite event"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.60999V4.60999Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button
                            className="share-icon-btn"
                            onClick={handleShare}
                            aria-label="Share event"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 21 24" fill="none">
                                <path d="M6.80583 13.2192L14.205 17.5308M14.1942 5.63583L6.80583 9.9475M20.25 4C20.25 5.79492 18.7949 7.25 17 7.25C15.2051 7.25 13.75 5.79492 13.75 4C13.75 2.20507 15.2051 0.75 17 0.75C18.7949 0.75 20.25 2.20507 20.25 4ZM7.25 11.5833C7.25 13.3783 5.79493 14.8333 4 14.8333C2.20507 14.8333 0.75 13.3783 0.75 11.5833C0.75 9.78841 2.20507 8.33333 4 8.33333C5.79493 8.33333 7.25 9.78841 7.25 11.5833ZM20.25 19.1667C20.25 20.9616 18.7949 22.4167 17 22.4167C15.2051 22.4167 13.75 20.9616 13.75 19.1667C13.75 17.3717 15.2051 15.9167 17 15.9167C18.7949 15.9167 20.25 17.3717 20.25 19.1667Z" stroke="#181C20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    className="hero-image-wrapper"
                    style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' } : {}}
                >
                    {logoConfig && (
                        <div className="hero-image-subfestival">
                            <div className="subfestival-image-container">
                                <img src={logoConfig.icon} alt="Subfestival icon" style={{ height: "40px", width: "auto", objectFit: "contain" }} />
                            </div>
                            <img src={logoConfig.title} alt="Subfestival title" style={{ height: "25px", width: "auto", objectFit: "contain" }} />
                        </div>
                    )}
                </div>

                {/* Mobile-only Event Details Card */}
                <div className="mobile-details-card-wrapper">
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
            </section>

            {/* Modals for Mobile details card */}
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" color="black">
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

            {/* Share Modal */}
            {shareModalOpen && (
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
                    onClick={() => setShareModalOpen(false)}
                >
                    <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h2 className="share-modal-title">Share Event</h2>
                            <div className="cross-modal" onClick={() => setShareModalOpen(false)} style={{ cursor: 'pointer' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <div className="share-modal-grid">
                            <a className="share-modal-item" href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                                <span className="share-modal-icon share-modal-icon--whatsapp">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.85.505 3.583 1.383 5.07L2 22l5.06-1.362A9.94 9.94 0 0012 22c5.523 0 10-4.478 10-10S17.523 2 12 2zm0 18.09c-1.658 0-3.216-.457-4.548-1.25l-.326-.194-3.005.808.803-2.93-.213-.302A8.088 8.088 0 013.91 12c0-4.464 3.626-8.09 8.09-8.09 4.464 0 8.09 3.626 8.09 8.09 0 4.464-3.626 8.09-8.09 8.09z" /></svg>
                                </span>
                                <span className="share-modal-label">WhatsApp</span>
                            </a>

                            <a className="share-modal-item" href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                                <span className="share-modal-icon share-modal-icon--facebook">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.91 8.44-9.93z" /></svg>
                                </span>
                                <span className="share-modal-label">Facebook</span>
                            </a>

                            <a className="share-modal-item" href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                                <span className="share-modal-icon share-modal-icon--twitter">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </span>
                                <span className="share-modal-label">Twitter / X</span>
                            </a>

                            <a className="share-modal-item" href={shareLinks.telegram} target="_blank" rel="noopener noreferrer">
                                <span className="share-modal-icon share-modal-icon--telegram">
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M21.94 4.36a1.5 1.5 0 00-1.53-.24L3.07 10.9c-1.13.44-1.12 2.03.02 2.45l4.5 1.65 1.74 5.6a1 1 0 001.66.4l2.52-2.43 4.4 3.23a1.5 1.5 0 002.36-.9l3.16-14.7a1.5 1.5 0 00-.49-1.83zM9.36 14.68l-.31 3.13-1.36-4.36 9.87-6.19-8.2 7.42z" /></svg>
                                </span>
                                <span className="share-modal-label">Telegram</span>
                            </a>
                        </div>

                        <div className="share-modal-link-row">
                            <input type="text" readOnly value={window.location.href} />
                            <button onClick={handleCopyLink}>{linkCopied ? "Copied!" : "Copy"}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EventDeatilHero