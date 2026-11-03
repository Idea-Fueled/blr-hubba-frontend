import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { MotionSection } from "../../components/AnimatedPage";
import { fetchEvents, fetchWishlistApi, toggleWishlistApi } from "../../api/eventsApi";
import { mapBackendEventToCard } from "../../utils/eventMappers";
import EventCard from "../../components/events/EventCard";
import "../../components/EventListingSection/EventListing.css";
import "./FavouritesPage.css";

export const FavouritesPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [likedEvents, setLikedEvents] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const loadFavorites = () => {
        try {
            const favs = JSON.parse(localStorage.getItem("user_favorites") || "{}");
            setLikedEvents(favs);
            return favs;
        } catch (e) {
            return {};
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            let favs = loadFavorites();

            try {
                // Fetch latest wishlist from backend
                const wishlistRes = await fetchWishlistApi();
                if (wishlistRes && wishlistRes.success && wishlistRes.data) {
                    const backendFavs = {};
                    wishlistRes.data.forEach((item) => {
                        if (item.eventId) {
                            backendFavs[item.eventId] = true;
                        }
                    });
                    
                    // Merge local guest favorites with backend favorites
                    const mergedFavs = { ...favs, ...backendFavs };
                    
                    // Sync any local-only favorites to the backend
                    for (const eventId of Object.keys(favs)) {
                        if (favs[eventId] && !backendFavs[eventId]) {
                            toggleWishlistApi(eventId).catch(err => 
                                console.warn("Failed to sync local favorite to backend:", eventId, err)
                            );
                        }
                    }

                    favs = mergedFavs;
                    setLikedEvents(mergedFavs);
                    localStorage.setItem("user_favorites", JSON.stringify(mergedFavs));
                    // Dispatch change event to sync other pages
                    window.dispatchEvent(new Event("profile-change"));
                }
            } catch (e) {
                console.warn("Failed to fetch wishlist from backend, using local:", e);
            }

            try {
                const eventsData = await fetchEvents({ limit: 100 });
                if (eventsData && eventsData.events) {
                    const mapped = eventsData.events.map(mapBackendEventToCard);
                    
                    // Filter events to only show those that are liked/favorited
                    const filtered = mapped.filter(evt => !!favs[evt.id]);
                    setEvents(filtered);
                }
            } catch (err) {
                console.error("Failed to fetch events for favourites:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isLoggedIn, navigate]);

    const handleToggleLike = (eventId) => {
        setLikedEvents((prev) => {
            const updated = {
                ...prev,
                [eventId]: !prev[eventId]
            };
            localStorage.setItem("user_favorites", JSON.stringify(updated));
            
            // Remove from the list immediately in UI
            setEvents((prevEvents) => prevEvents.filter(evt => evt.id !== eventId));
            
            // Notify other pages
            window.dispatchEvent(new Event("profile-change"));
            return updated;
        });

        // Toggle on backend as well
        toggleWishlistApi(eventId)
            .catch((err) => console.error("Error toggling wishlist on backend:", err));
    };

    if (!isLoggedIn) return null;

    return (
        <div className="favourites-page-container">
            <div className="favourites-page-content">
                <MotionSection className="favourites-page-header">
                    <h1 className="favourites-page-title">Favourites</h1>
                    <p className="favourites-page-subtitle">Your saved and bookmarked events</p>
                </MotionSection>

                {isLoading ? (
                    <div className="favourites-loading-box">
                        <div className="favourites-spinner"></div>
                    </div>
                ) : events.length > 0 ? (
                    <MotionSection className="events-grid">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                isLiked={true}
                                onToggleLike={handleToggleLike}
                                className="favourites-card"
                                extraPadding="32px !important"
                            />
                        ))}
                    </MotionSection>
                ) : (
                    <MotionSection className="favourites-empty-state">
                        <Heart size={48} className="favourites-empty-icon" />
                        <h3>No Favourites Saved</h3>
                        <p>Click the heart icon on any event card to save it here.</p>
                        <button className="favourites-browse-btn" onClick={() => navigate("/events")}>
                            Browse Events
                        </button>
                    </MotionSection>
                )}
            </div>
        </div>
    );
};

export default FavouritesPage;
