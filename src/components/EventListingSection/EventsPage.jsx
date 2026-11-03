import React from "react";
import EventListing from "./EventListing";
import SponsorsSection from "../SponsorsSection/SponsorsSection";
import "./EventsPage.css";

export const EventsPage = () => {
    return (
        <section className="events-page-section">
            <EventListing />
            <SponsorsSection />
        </section>
    );
};

export default EventsPage;
