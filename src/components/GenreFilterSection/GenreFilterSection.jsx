import React, { useRef, useEffect, useState } from "react";
import "./GenreFilterSection.css";

export const GenreFilterSection = ({ hideHeader = false, onSelectGenre, selectedGenres = [] }) => {
    const scrollContainerRef = useRef(null);
    const [genreCards, setGenreCards] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch dynamic genres from backend API
    useEffect(() => {
        let isMounted = true;
        const fetchApiGenres = async () => {
            try {
                const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");
                const res = await fetch(`${API_BASE}/genres?limit=100`);
                if (!res.ok) throw new Error("Failed to fetch genres");
                const data = await res.json();
                
                if (isMounted) {
                    if (data && Array.isArray(data.genres)) {
                        // Map backend genres with dynamic event counts
                        const dynamicGenres = data.genres.map(g => {
                            const count = g._count?.EventGenre ?? 0;
                            return {
                                id: g.id || g.name,
                                title: (g.name || "").toUpperCase(),
                                subtitle: `${count} Events`,
                                image: g.image || ""
                            };
                        });
                        setGenreCards(dynamicGenres);
                    } else {
                        setGenreCards([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching genres:", err);
                if (isMounted) {
                    setGenreCards([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoaded(true);
                }
            }
        };

        fetchApiGenres();
        return () => { isMounted = false; };
    }, []);

    // Create cards list (duplicated 8 times for smooth loop without backward kickback)
    const displayCards = genreCards.length >= 3
        ? Array.from({ length: 8 }).flatMap((_, setIdx) =>
            genreCards.map(c => ({ ...c, uniqueKey: `set${setIdx + 1}-${c.id}` }))
          )
        : genreCards.map(c => ({ ...c, uniqueKey: `single-${c.id}` }));

    // Initial scroll position at 0 and debounced infinite loop listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || displayCards.length < 8 * 3) return;

        // Ensure scroll starts cleanly at 0 (first card) on mount
        container.scrollLeft = 0;

        let scrollTimeout = null;
        const handleInfiniteScroll = () => {
            const setWidth = container.scrollWidth / 8;
            if (setWidth <= 0) return;

            // Normalize position when user pauses scroll so active scroll never kicks back
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (container.scrollLeft >= setWidth * 6) {
                    container.scrollLeft -= setWidth * 4;
                } else if (container.scrollLeft <= 5) {
                    container.scrollLeft += setWidth * 4;
                }
            }, 150);
        };

        container.addEventListener("scroll", handleInfiniteScroll, { passive: true });
        return () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            container.removeEventListener("scroll", handleInfiniteScroll);
        };
    }, [displayCards.length]);

    const handleScroll = (direction) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const setWidth = container.scrollWidth / (displayCards.length >= 24 ? 8 : 1);
        const scrollStep = 184 * 2; // ~2 cards

        if (direction === "right") {
            if (container.scrollLeft >= setWidth * 6.5 && displayCards.length >= 24) {
                container.scrollLeft -= setWidth * 4;
            }
            container.scrollBy({ left: scrollStep, behavior: "smooth" });
        } else {
            if (container.scrollLeft <= setWidth * 0.5 && displayCards.length >= 24) {
                container.scrollLeft += setWidth * 4;
            }
            container.scrollBy({ left: -scrollStep, behavior: "smooth" });
        }
    };

    const handleCardClick = (cardTitle) => {
        if (onSelectGenre) {
            onSelectGenre(cardTitle);
        }
        const targetElement =
            document.querySelector(".event-listing-content-wrapper") ||
            document.querySelector(".subfest-events-header-box") ||
            document.querySelector(".event-listing-section") ||
            document.querySelector(".right-content-area");

        if (targetElement) {
            const navbarOffset = 90;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navbarOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // If 0 genres in backend, do not render any cards
    if (isLoaded && genreCards.length === 0) {
        return null;
    }

    if (hideHeader) {
        return (
            <div className="genre-filter-embedded">
                <div className="genre-filter-carousel-wrapper">
                    <div className="genre-filter-cards-track embedded-track" ref={scrollContainerRef}>
                        {displayCards.map((card) => {
                            const isSelected = (selectedGenres || []).some(
                                (g) => g.toLowerCase() === card.title.toLowerCase() || g.toLowerCase() === String(card.id).toLowerCase()
                            );
                            return (
                                <div
                                    key={card.uniqueKey}
                                    className={`genre-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleCardClick(card.title)}
                                >
                                    <div className="genre-card-img-wrapper">
                                        <img src={card.image} alt={card.title} className="genre-card-img" />
                                    </div>
                                    <div className="genre-card-info">
                                        <span className="genre-card-title">{card.title}</span>
                                        <span className="genre-card-subtitle">{card.subtitle || "370+ Events"}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="genre-filter-section">
            <div className="genre-filter-inner">
                {/* Header */}
                <div className="genre-filter-header">
                    <span className="genre-filter-subtitle">FIND YOUR NEXT EXPERIENCE</span>
                    <h2 className="genre-filter-title">Explore What's On at BLR Hubba 2027</h2>
                </div>

                {/* Cards Carousel */}
                <div className="genre-filter-carousel-wrapper">
                    <div className="genre-filter-cards-track" ref={scrollContainerRef}>
                        {displayCards.map((card) => {
                            const isSelected = (selectedGenres || []).some(
                                (g) => g.toLowerCase() === card.title.toLowerCase() || g.toLowerCase() === String(card.id).toLowerCase()
                            );
                            return (
                                <div
                                    key={card.uniqueKey}
                                    className={`genre-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleCardClick(card.title)}
                                >
                                    <div className="genre-card-img-wrapper">
                                        <img src={card.image} alt={card.title} className="genre-card-img" />
                                    </div>
                                    <div className="genre-card-info">
                                        <span className="genre-card-title">{card.title}</span>
                                        <span className="genre-card-subtitle">{card.subtitle || "370+ Events"}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="genre-filter-nav-controls">
                    <button
                        className="genre-nav-btn genre-nav-btn-left"
                        onClick={() => handleScroll("left")}
                        aria-label="Previous Genres"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19L5 12L12 5" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        className="genre-nav-btn genre-nav-btn-right"
                        onClick={() => handleScroll("right")}
                        aria-label="Next Genres"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M12 5L19 12L12 19" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GenreFilterSection;
