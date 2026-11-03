import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./EventDetailPage.css";
import EventDeatilHero from "../../components/EventDeailSection/EventDetailHero";
import EventDetails from "../../components/EventDeailSection/EventDetails";

import { fetchEventBySlug } from "../../api/eventsApi";
import { SkeletonCard } from "../../components/Loader/Loader";

const EventDetailPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Fetch single event using Slug/ID
        fetchEventBySlug(eventId)
            .then(data => {
                if (data.event) {
                    setEvent(data.event);
                } else {
                    throw new Error("Event data not found");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [eventId]);

    // Update Open Graph (og:image) and meta tags dynamically when event loads
    useEffect(() => {
        if (!event) return;

        let rawImg = event.coverImage || event.imageUrl || "";

        if (rawImg && typeof rawImg === "object") {
            rawImg = rawImg.url || rawImg.data || rawImg.src || "";
        }

        let heroOgImage = String(rawImg || "").trim();

        if (heroOgImage && !heroOgImage.startsWith("http://") && !heroOgImage.startsWith("https://")) {
            const origin = window.location.origin.replace(/\/$/, "");
            heroOgImage = `${origin}${heroOgImage.startsWith("/") ? "" : "/"}${heroOgImage}`;
        }

        const titleText = `${event.title} | BLR Hubba`;
        const descriptionText = event.shortDescription || event.description || "BLR Hubba Event Details";
        const currentUrl = window.location.href;

        document.title = titleText;

        const setMetaTag = (attrName, attrValue, contentValue) => {
            if (!contentValue) return;
            let elements = document.querySelectorAll(`meta[${attrName}="${attrValue}"]`);
            if (elements.length === 0) {
                const el = document.createElement("meta");
                el.setAttribute(attrName, attrValue);
                el.setAttribute("content", contentValue);
                document.head.appendChild(el);
            } else {
                elements.forEach(el => el.setAttribute("content", contentValue));
            }
        };

        // Open Graph Meta Tags
        setMetaTag("property", "og:title", titleText);
        setMetaTag("property", "og:description", descriptionText);
        setMetaTag("property", "og:image", heroOgImage);
        setMetaTag("property", "og:image:secure_url", heroOgImage);
        setMetaTag("property", "og:image:url", heroOgImage);
        setMetaTag("property", "og:url", currentUrl);
        setMetaTag("property", "og:type", "website");

        // Twitter Meta Tags
        setMetaTag("name", "twitter:card", "summary_large_image");
        setMetaTag("name", "twitter:title", titleText);
        setMetaTag("name", "twitter:description", descriptionText);
        setMetaTag("name", "twitter:image", heroOgImage);
        setMetaTag("name", "twitter:image:src", heroOgImage);

        return () => {
            document.title = "BLR Hubba";
        };
    }, [event]);

    if (loading) {
        return (
            <main className="main-container" style={{ gap: "24px", paddingTop: "40px" }}>
                <SkeletonCard className="skeleton-hero-card" />
                <SkeletonCard className="skeleton-details-card" />
            </main>
        );
    }

    if (error || !event) {
        return (
            <div className="w-full text-center py-32 bg-red-50 rounded-2xl border border-red-100 p-6">
                <p className="text-xl text-red-600 font-medium">{error || "Event not found"}</p>
            </div>
        );
    }

    return (
        <>
            <main className="main-container">
                <EventDeatilHero event={event} />
                <EventDetails event={event} />
            </main>
        </>
    );
};

export default EventDetailPage;