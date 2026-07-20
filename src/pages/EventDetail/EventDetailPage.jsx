import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./EventDetailPage.css";
import EventDeatilHero from "../../components/EventDeailSection/EventDetailHero";
import EventDetails from "../../components/EventDeailSection/EventDetails";

import { fetchEventBySlug } from "../../api/eventsApi";

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

    if (loading) {
        return (
            <main className="main-container">
                <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-2xl border border-gray-200 my-4"></div>
                <div className="w-full h-[250px] bg-gray-100 animate-pulse rounded-2xl border border-gray-200"></div>
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