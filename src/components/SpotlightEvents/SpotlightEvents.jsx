import React, { useRef, useState } from "react";
import "./SpotlightEvents.css";
import heartIcon from "../../assets/heart_icon.png";

const DUMMY_EVENTS = [
    {
        id: "sp-1",
        type: "large",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "BIC",
        time: "2:00 pm – 4:00 pm",
        date: "16",
        month: "JAN",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 1", "Genre 2", "Genre 3"]
    },
    {
        id: "sp-2",
        type: "large",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "BIC",
        time: "2:00 pm – 4:00 pm",
        date: "16",
        month: "JAN",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 1", "Genre 2", "Genre 3"]
    },
    {
        id: "sp-3",
        type: "large",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "BIC",
        time: "2:00 pm – 4:00 pm",
        date: "16",
        month: "JAN",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 1", "Genre 2", "Genre 3"]
    },
    {
        id: "sp-4",
        type: "large",
        title: "Id orci tincidunt amet cglt ullam cglt corper morbi",
        performer: "by Swarupa Ananth",
        venue: "BIC",
        time: "2:00 pm – 4:00 pm",
        date: "16",
        month: "JAN",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60",
        genres: ["Genre 1", "Genre 2", "Genre 3"]
    }
];

const formatSpotlightTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(/\s*[-–]\s*/);
    if (parts.length === 2) {
        return (
            <>
                {parts[0]}–
                <br />
                {parts[1]}
            </>
        );
    }
    return timeStr;
};

const HeartIcon = () => {
    const [liked, setLiked] = useState(false);
    return (
        <button
            className={`heart-btn ${liked ? "liked" : ""}`}
            onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
            }}
            aria-label="Favorite event"
        >
            <img
                src={heartIcon}
                alt="Favorite"
                className="heart-icon-img"
            />
        </button>
    );
};

const DateBadge = ({ date, month }) => (
    <div className="date-badge">
        <span className="date-badge-day">{date}</span>
        <span className="date-badge-month">{month}</span>
    </div>
);

const GenrePills = ({ genres }) => (
    <div className="genre-pills">
        {genres && genres.map((genre, idx) => (
            <span key={idx} className="genre-pill-content">{genre}</span>
        ))}
    </div>
);

const SpotlightCardSmall = ({ event }) => {
    const { title, performer, venue, time, date, month, genres } = event;
    return (
        <div className="spotlight-card-small">
            <DateBadge date={date} month={month} />
            <div className="small-card-venue-time-row">
                <span>{venue}</span>
                <span className="small-card-time">• {time}</span>
            </div>
            <GenrePills genres={genres} />
            <h3 className="event-title">{title}</h3>
            <p className="performer-name">{performer}</p>

            <button className="view-book-btn">VIEW & BOOK</button>

        </div>
    );
};

const SpotlightCardLarge = ({ event }) => {
    const { title, performer, venue, time, date, month, image, genres } = event;
    return (
        <div className="spotlight-card-large">
            {/* Left side Image */}
            <div className="spotlight-card-container">
                <div className="large-card-left">
                    <img src={image} alt={title} className="large-card-img" />
                    <HeartIcon />
                </div>

                {/* Right side Content */}
                <div className="large-card-right">
                    <div className="large-card-right-container">
                        <div className="large-card-top-row">
                            <DateBadge date={date} month={month} />
                            <div className="large-card-venue-time">
                                <span className="large-card-venue">{venue}</span>
                                <div className="venue-time-divider"></div>
                                <span className="large-card-time">{formatSpotlightTime(time)}</span>
                            </div>
                        </div>
                        <div className="large-card-middle">
                            <GenrePills genres={genres} />
                            <div className="middle-content-container">
                                <h3 className="event-title">{title}</h3>
                                <p className="performer-name">{performer}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-cta-button-container">
                        <button className="view-book-btn">VIEW & BOOK</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpotlightEvents = () => {
    const carouselRef = useRef(null);

    const scroll = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === "left" ? -690 : 690;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <main>
            <section className="spotlight-events-section">
                {/* Header */}
                <div className="spotlight-header">
                    <span className="spotlight-subtitle">IPSUM DOLOR SIT</span>
                    <h2 className="spotlight-heading">Spotlight Events</h2>
                </div>

                {/* Carousel Container */}
                <div ref={carouselRef} className="spotlight-carousel">
                    {DUMMY_EVENTS.map((event) => {
                        return (
                            <div key={event.id} className="spotlight-carousel-box">
                                <SpotlightCardLarge event={event} />
                            </div>
                        );
                    })}
                </div>

                {/* Navigation buttons */}
                <div className="spotlight-navigation">
                    <button
                        onClick={() => scroll("left")}
                        className="nav-arrow-btn"
                        aria-label="Previous Spotlight Event"
                    >
                        <svg
                            className="nav-arrow-svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="nav-arrow-btn"
                        aria-label="Next Spotlight Event"
                    >
                        <svg
                            className="nav-arrow-svg"
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
            </section>
        </main>
    );
};

export default SpotlightEvents;
