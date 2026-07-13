import React, { useState, useRef } from "react";
import "./EventDetails.css"
import EventFAQs from "../EventListingSection/EventFAQs";
import SimilarEvents from "./SimilarEvents";
import SponsorsSection from "../SponsorsSection/SponsorsSection";
import siffLogo from "../../assets/SIFF_logo.png";
import HorizontalRow from "../HorizontalRow";

const EventDetails = () => {

    const [presentedBy, setPresentedBy] = useState([
        {
            id: 1,
            name: "Shantanu Moitra",
            role: "Composer, Vocals",
            imageUrl: ""
        },
        {
            id: 2,
            name: "Shantanu Moitra",
            role: "Composer, Vocals",
            imageUrl: ""
        },
        {
            id: 3,
            name: "Shantanu Moitra",
            role: "Composer, Vocals",
            imageUrl: ""
        },
        {
            id: 4,
            name: "Shantanu Moitra",
            role: "Composer, Vocals",
            imageUrl: ""
        },
        {
            id: 5,
            name: "Shantanu Moitra",
            role: "Composer, Vocals",
            imageUrl: ""
        }
    ]);

    // NEW: splits presentedBy into N columns, filling top-to-bottom
    const splitIntoColumns = (items, numColumns) => {
        const columns = Array.from({ length: numColumns }, () => []);
        const itemsPerColumn = Math.ceil(items.length / numColumns);

        items.forEach((item, index) => {
            const columnIndex = Math.floor(index / itemsPerColumn);
            columns[columnIndex].push(item);
        });

        return columns;
    };

    // NEW: presentedBy split into 2 columns
    const presentedByColumns = splitIntoColumns(presentedBy, 2);

    const mediaContainerRef = useRef(null);

    const scrollMediaLeft = () => {
        if (mediaContainerRef.current) {
            mediaContainerRef.current.scrollBy({ left: -327, behavior: "smooth" });
        }
    };

    const scrollMediaRight = () => {
        if (mediaContainerRef.current) {
            mediaContainerRef.current.scrollBy({ left: 327, behavior: "smooth" });
        }
    };

    return (
        <>
            <section className="detail-container-wrapper">

                <div className="artist-image">
                    <img src="" alt="" className="artist" />
                </div>

                <div className="event-detail-section">
                    <div className="left-container">

                        <div className="event-detail-about-section">
                            <span className="event-about-title-container">About</span>
                            <p className="event-about-desc-container">“Pankh”, conceptualised and composed by Shantanu Moitra and soulfully rendered by Kaushiki Chakraborty, are extraordinary stories from everyday life from which this musical has evolved.

                                Coming from completely diverse musical worlds — this collaboration is a rare confluence of two distinct creative paths. Their shared vision gives audiences a glimpse into how their individual journeys intertwine, weaving together into this extraordinary musical experience called Pankh.

                                While each retains their unique artistic identity, their stories meet at moments of emotion, reflection, and discovery.

                                Listeners traverse Kaushiki’s evolution from her formative years steeped in classical tradition to her blossoming of her present artistic expression alongside Shantanu’s journey from the world of advertising to becoming one of India’s most celebrated composers.

                                “Pankh Live”, the concert edition of the album, brings this story to life on stage. The experience transcends a traditional concert- it is a living autobiography told through music, memories, and the interplay of sound and soul.

                                Each composition evokes an emotion, a memory, and a person who has touched their lives — each song a heartfelt tribute that reflects gratitude, love, and artistic awakening and self-discovery. Structured as a series of musical chapters, Pankh Live takes the audience through moments of vulnerability, resilience, joy, and introspection- woven together through intimate storytelling and exquisite performances.</p>
                        </div>

                        <div className="presented-by-section">
                            <div className="section-top-content">
                                <h2 className="presented-by-title">Presented By</h2>
                                <p className="presented-by-desc">This ambitious project brings together Shantanu Moitra- one of India's most beloved composers for film- and Kaushiki Chakraborty, amongst the finest Hindustani classical singers of her generation.
                                    <br />
                                    <br />
                                    This event is supported by Singhal Iyer Family Foundation (SIFF).</p>
                            </div>
                            <div className="section-bottom-content">
                                {/* NEW: outer map renders one column-div per column */}
                                {presentedByColumns.map((column, columnIndex) => (
                                    <div key={columnIndex} className="presented-by-column">
                                        {column.map((person) => (
                                            <div key={person.id} className="presented-by-person">
                                                <img
                                                    src={person.imageUrl}
                                                    alt={person.name}
                                                    className="presented-by-person-avatar"
                                                />
                                                <div className="presented-by-person-info">
                                                    <h4 className="presented-by-person-name">{person.name}</h4>
                                                    <p className="presented-by-person-role">{person.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section-container">
                            <h2 className="curator-section-title">Curated By</h2>
                            <div className="curator-card-container">
                                <div className="curator-card-content">
                                    <div className="curator-image"></div>
                                    <div className="curator-name">
                                        <h2 className="c-name">Abhijit Nath</h2>
                                        <p className="c-desc">Composer, Vocals</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="section-container">
                            <h2 className="section-title">Language</h2>
                            <p className="section-languages">English, Kannada</p>
                        </div>

                        <div className="section-container">
                            <h2 className="age-suitability-section-title">
                                Age Suitability
                            </h2>
                            <p className="age-suitability-section-desc">All Ages</p>
                        </div>

                        <div className="section-container">
                            <h2 className="supported-by-section-title">Supported By</h2>
                            <div className="supported-by-card-container">
                                <div className="supported-by-logo-card">
                                    <img src={siffLogo} className="supported-by-logo" />
                                </div>
                            </div>
                        </div>

                        <div className="section-container">
                            <h2 className="additional-information-section-title">
                                Additional Information
                            </h2>
                            <p className="additional-information-section-desc">Additional event information and details displayed to attendees</p>
                        </div>

                        <div className="section-container">
                            <h2 className="tags-section-container-title">Tags</h2>
                            <div className="tags-section-container-desc">
                                <div className="tags-section-genre-pills">
                                    <p className="pill-content">Audiovisual</p>
                                </div>
                                <div className="tags-section-genre-pills">
                                    <p className="pill-content">Music</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="right-container">
                        <div className="event-details-header">
                            <h2 className="event-details-header-title">Event Details</h2>
                        </div>
                        <div className="event-details-row">
                            <div className="event-details-item-row">
                                <div className="event-details-item-col">
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                                                <path d="M19 9H1M14 1V5M6 1V5M7 15L9 17L13.5 12.5M5.8 21H14.2C15.8802 21 16.7202 21 17.362 20.673C17.9265 20.3854 18.3854 19.9265 18.673 19.362C19 18.7202 19 17.8802 19 16.2V7.8C19 6.11984 19 5.27976 18.673 4.63803C18.3854 4.07354 17.9265 3.6146 17.362 3.32698C16.7202 3 15.8802 3 14.2 3H5.8C4.11984 3 3.27976 3 2.63803 3.32698C2.07354 3.6146 1.6146 4.07354 1.32698 4.63803C1 5.27976 1 6.11984 1 7.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="item-detail">Monday 25, Jan 27</span>
                                    </div>
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="item-detail">8:30 pm-10:30 pm</span>
                                    </div>
                                </div>
                                <div className="event-details-item-col">
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                                                <path d="M9 11L4.72711 7.43926C4.09226 6.91022 3.77484 6.6457 3.54664 6.32144C3.34444 6.03413 3.19429 5.71354 3.10301 5.37428C3 4.99139 3 4.57819 3 3.7518V1M9 11L13.2729 7.43926C13.9077 6.91022 14.2252 6.6457 14.4534 6.32144C14.6556 6.03413 14.8057 5.71354 14.897 5.37428C15 4.99139 15 4.57819 15 3.7518V1M9 11L4.72711 14.5607C4.09226 15.0898 3.77484 15.3543 3.54664 15.6786C3.34444 15.9659 3.19429 16.2865 3.10301 16.6257C3 17.0086 3 17.4218 3 18.2482V21M9 11L13.2729 14.5607C13.9077 15.0898 14.2252 15.3543 14.4534 15.6786C14.6556 15.9659 14.8057 16.2865 14.897 16.6257C15 17.0086 15 17.4218 15 18.2482V21M1 1H17M1 21H17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="item-detail">60 Mins</span>
                                    </div>
                                    <div className="event-detail-item">
                                        <div className="item-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                                                <path d="M9 11.5C10.6569 11.5 12 10.1569 12 8.5C12 6.84315 10.6569 5.5 9 5.5C7.34315 5.5 6 6.84315 6 8.5C6 10.1569 7.34315 11.5 9 11.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                <path d="M9 21C11 17 17 14.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 14.4183 7 17 9 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>

                                        </div>
                                        <span className="item-detail">Freedom Park</span>
                                    </div>
                                </div>
                            </div>
                            <div className="event-details-cta-button-wrapper">
                                <h2 className="event-detail-cta-button">Book A Pass</h2>
                            </div>
                        </div>

                    </div>
                </div>

            </section >
            <section className="media-section">
                <h2 className="media-section-title">Media</h2>
                <div className="media-section-images-container" ref={mediaContainerRef}>
                    <div className="media-section-images"></div>
                    <div className="media-section-images"></div>
                    <div className="media-section-images"></div>
                    <div className="media-section-images"></div>
                    <div className="media-section-images"></div>
                    <div className="media-section-images"></div>
                </div>
                <div className="media-section-navigation-container">
                    <div className="arrow-container" onClick={scrollMediaLeft} style={{ cursor: "pointer" }} aria-label="Scroll Left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 5L5 12L12 19" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div className="arrow-container" onClick={scrollMediaRight} style={{ cursor: "pointer" }} aria-label="Scroll Right">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M12 19L19 12L12 5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </section>
            <EventFAQs />
            <SimilarEvents />
            <HorizontalRow />
            <SponsorsSection />
        </>
    )
}

export default EventDetails;