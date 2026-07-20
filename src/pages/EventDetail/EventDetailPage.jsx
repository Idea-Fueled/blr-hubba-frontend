import React from "react";
import "./EventDetailPage.css";
import EventDeatilHero from "../../components/EventDeailSection/EventDetailHero";
import EventDetails from "../../components/EventDeailSection/EventDetails";

const EventDetailPage = () => {

    return (
        <>
            <main className="main-container">
                <EventDeatilHero />
                <EventDetails />
            </main>
        </>
    );
};

export default EventDetailPage;