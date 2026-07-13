import React from "react";
import { EventCard } from "./EventCard";

export const EventGrid = ({ events = [], loading = false, error = null }) => {
    if (loading) {
        return (
            <div className="w-full text-center py-16">
                <p className="text-lg text-gray-500 font-medium">Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full text-center py-16 bg-red-50 rounded-2xl border border-red-100 p-6">
                <p className="text-lg text-red-600 font-medium">{error}</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="w-full text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <p className="text-lg text-gray-500 font-medium">No events found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-6">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
};