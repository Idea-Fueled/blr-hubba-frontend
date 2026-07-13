import React from "react";
import "./EventDetailHero.css"

const EventDeatilHero = () => {
    return (
        <>

            <section className="hero-wrapper">
                <div className="hero-event-detail">
                    <div className="hero-event-detail-wrapper">
                        <div className="hero-left-wrapper-top-row">
                            <span className="genre-pill">Music</span>
                            <span className="top-row-title">Pankh: A leap of faith</span>
                            <div className="top-row-performer">By Kaushiki Chakraborty & Shantanu Moitra</div>
                        </div>
                        <div className="venue-date-section">
                            <div className="date-time-section">
                                <span className="date-time-header">Date & Time</span>
                                <div className="date-time-wrapper">Monday 25, Jan 2027 <br /> 8:30 pm - 10:00 pm</div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="74" viewBox="0 0 1 74" fill="none">
                                <path d="M0.5 74V0" stroke="#4E4E4E" />
                            </svg>
                            <div className="venue-wrapper">
                                <span className="venue-wrapper-title">Venue</span>
                                <span className="hero-venue-name">Freedom Park</span>
                            </div>
                        </div>

                    </div>

                </div>

                <div className="hero-image-wrapper">

                </div>
            </section>
        </>
    )
}

export default EventDeatilHero