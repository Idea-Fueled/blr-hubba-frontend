import React from "react";
import "./EventListingSponsors.css"

const EventListingSponsors = () => {

    return (
        <section className="main-wrapper">
            <div className="sponsors-section-container">
                <div className="title-container">
                    <h2>Our Sponsors</h2>
                </div>
                <div className="top-row-container">
                    <div className="logo-container-one">
                        <div className="container">
                            <p className="title">Title Sponsor</p>
                            <div className="logo-0">
                                {/* <img src="/src/assets/JSW_logo_1.png" alt="" /> */}
                            </div>
                        </div>
                        <div className="container">
                            <p className="title">Partner</p>
                            <div className="logo-1"></div>
                        </div>
                    </div>
                    <div className="divider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="200" viewBox="0 0 1 200" fill="none">
                            <path d="M0.5 200V0" stroke="#C3C3C3" />
                        </svg>
                    </div>
                    <div className="top-row-container-right">
                        <p className="title-festival-sponsor">Festival Sponsor</p>
                        <div className="right-container-logo-grid">
                            <div className="logo-2-container">
                                <div className="logo-2"></div>
                            </div>
                            <div className="logo-2-container">
                                <div className="logo-3"></div>
                            </div>
                            <div className="logo-2-container">
                                <div className="logo-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-divider"></div>
                <div className="top-row-container">
                    <div className="mid-row-container-left">
                        <h2 className="title">Property Sponsor</h2>
                        <div className="mid-row-container-left-logo-container">
                            <div className="mid-row-left-logo"></div>
                        </div>
                    </div>
                    <div className="divider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="200" viewBox="0 0 1 200" fill="none">
                            <path d="M0.5 200V0" stroke="#C3C3C3" />
                        </svg>
                    </div>
                    <div className="mid-row-container-middle">
                        <h2 className="title">Associate Sponsors</h2>
                        <div className="mid-row-container-middle-card-grid">
                            <div className="mid-row-container-left-logo-container">
                                <div className="mid-row-logo-1"></div>
                            </div>
                            <div className="mid-row-container-left-logo-container">
                                <div className="mid-row-logo-2"></div>
                            </div>
                            <div className="mid-row-container-left-logo-container">
                                <div className="mid-row-logo-3"></div>
                            </div>
                        </div>
                    </div>
                    <div className="divider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="200" viewBox="0 0 1 200" fill="none">
                            <path d="M0.5 200V0" stroke="#C3C3C3" />
                        </svg>
                    </div>
                    <div className="mid-row-container-right">
                        <h2 className="title">Anchor</h2>
                        <div className="mid-row-right-logo-container">
                            <div className="mid-row-right-logo"></div>
                        </div>
                    </div>
                </div>
                <div className="h-divider"></div>
                <div className="top-row-container">
                    <div className="bottom-row-left-container">
                        <h2 className="title">Government Partners</h2>
                        <div className="bottom-row-left-cards-grid">
                            <div className="bottom-row-logo-1"></div>
                            <div className="bottom-row-logo-2"></div>
                            <div className="bottom-row-logo-3"></div>
                            <div className="bottom-row-logo-4"></div>
                            <div className="bottom-row-logo-5"></div>
                            <div className="bottom-row-logo-6"></div>
                            <div className="bottom-row-logo-7"></div>
                            <div className="bottom-row-logo-8"></div>
                            <div className="bottom-row-logo-9"></div>
                        </div>
                    </div>
                    <div className="bottom-row-h-divider">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="300" viewBox="0 0 1 300" fill="none">
                            <path d="M0.5 300V0" stroke="#C3C3C3" />
                        </svg>
                    </div>
                    <div className="bottom-row-right-container">
                        <h2 className="title">Supporters</h2>
                        <div className="bottom-row-right-cards-grid">
                            <div className="bottom-row-logo-10"></div>
                            <div className="bottom-row-logo-11"></div>
                            <div className="bottom-row-logo-12"></div>
                        </div>
                    </div>
                </div>

                {/* <hr /> */}
            </div>
        </section>
    )
}

export default EventListingSponsors