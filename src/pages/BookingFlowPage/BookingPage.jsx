import React from "react";
import "./BookingPage.css";
import { useLocation } from "react-router-dom";
import { BookingFlow } from "../../components/BookingPage/BookingFlow";
import { MultipleVenueDateBooking } from "../../components/BookingPage/MultipleVenueDateBooking";
import { SingleDateMultiVenueBooking } from "../../components/BookingPage/SingleDateMultiVenueBooking";

export const BookingPage = () => {
    const location = useLocation();
    const event = location.state?.event;
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get("type")?.toLowerCase();
    const modeParam = queryParams.get("mode")?.toLowerCase();

    // Evaluate date count & venue count from backend event response
    const eventDates = event?.eventDates || [];

    // Check for multiple distinct dates
    const uniqueDates = new Set(
        eventDates.map(d => d.date ? new Date(d.date).toISOString().split('T')[0] : null).filter(Boolean)
    );
    const hasMultipleDates = uniqueDates.size > 1 || event?.eventType === "RECURRING" || event?.isMultipleDate;

    // Check for multiple distinct venues
    const uniqueVenues = new Set(
        eventDates.map(d => d.venueId || d.venue?.id || d.venue?.name).filter(Boolean)
    );
    if (event?.venue?.id || event?.venue?.name) uniqueVenues.add(event.venue.id || event.venue.name);
    if (event?.venueIds) event.venueIds.forEach(v => uniqueVenues.add(v));
    const hasMultipleVenues = uniqueVenues.size > 1 || event?.isMultipleVenue;

    // Check Flow 3: Single Date + Multiple Venues
    const isSingleDateMultiVenue =
        typeParam === "singledatemultivenue" ||
        typeParam === "single-multi" ||
        typeParam === "singledate" ||
        typeParam === "singlemultivenue" ||
        modeParam === "singledatemultivenue" ||
        location.state?.isSingleDateMultiVenue ||
        location.state?.bookingType === "SINGLE_DATE_MULTI_VENUE" ||
        event?.bookingType === "SINGLE_DATE_MULTI_VENUE" ||
        (hasMultipleVenues && !hasMultipleDates);

    // Check Flow 2: Multiple Dates + Single Venue
    const isMultipleVenueDate =
        typeParam === "multiple" ||
        typeParam === "multiplevenuedate" ||
        typeParam === "multi-venue-date" ||
        modeParam === "multiple" ||
        location.state?.isMultipleVenue ||
        location.state?.isMultipleDate ||
        location.state?.isMultiple ||
        event?.isMultipleVenue ||
        event?.eventType === "MULTIPLE_VENUE" ||
        event?.eventType === "MULTIPLE_VENUE_DATE" ||
        event?.bookingType === "MULTIPLE_VENUE_DATE" ||
        hasMultipleDates;

    if (isSingleDateMultiVenue) {
        return <SingleDateMultiVenueBooking />;
    }

    if (isMultipleVenueDate) {
        return <MultipleVenueDateBooking />;
    }

    // Default Flow 1: Event Type 1 (Select Pass)
    return (
        <main className="booking-page-main-container">
            <BookingFlow />
        </main>
    );
};