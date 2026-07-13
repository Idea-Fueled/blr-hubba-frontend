import React from "react";
import EventListing from "./EventListing";
import EventFAQs from "./EventFAQs";
import EventListingSponsors from "./EventListingSponsors";
// import SponsorsSection from "../SponsorsSection/SponsorsSection";
import "./EventsPage.css";

export const EventsPage = () => {
    return (
        <section className="events-page-section">
            <EventListing />
            <EventFAQs />
            <EventListingSponsors />
        </section>
    );
};

export default EventsPage;
