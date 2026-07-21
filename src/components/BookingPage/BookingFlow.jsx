import React from "react";
import "./BookingFlow.css";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";

export const BookingFlow = () => {
    return (
        <div className="booking-flow-wrapper">
            <div className="booking-top-container">
                <div className="booking-event-detail-wrapper">
                    <span className="booking-event-detail-wrapper-arrow-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M22.1663 14H5.83301M13.9997 5.83334L5.83301 14L13.9997 22.1667" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <div className="booking-event-detail-container">
                        <div className="booking-event-detail-container-left-wrapper">
                            <h2 className="booking-event-title">Pankh: A Leap of Faith</h2>
                            <p className="booking-event-performer">By Kaushiki Chakraborty & Shantanu Moitra</p>
                        </div>
                        <div className="booking-event-detail-container-right-wrapper">
                            <h2 className="booking-venue-time-detail">Monday 25, Jan 2027  |  8:30 pm–10:00 pm</h2>
                            <div>
                                <span className="booking-venue-title">Freedom Park </span>
                                <span className="booking-col">:</span>
                                <span className="booking-venue-names">Watch Tower</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="booking-progress-bar-container">
                    <div className="booking-progress-bar-item-container">
                        <div className="booking-number-container">
                            <h2 className="booking-number">1</h2>
                        </div>
                        <p className="booking-item-container-title">Select Pass</p>
                    </div>
                    <div className="booking-progress-bar-item-container">
                        <div className="booking-number-container">
                            <h2 className="booking-number">2</h2>
                        </div>
                        <p className="booking-item-container-title">Review &amp; Add to Cart</p>
                    </div>
                </div>
            </div>
            <div className="booking-bottom-container">
                <div className="booking-free-pass-container">
                    <img src={freePassImage} alt="Free Pass" className="booking-free-pass-image-container" />
                    <div className="booking-free-pass-bottom-container">
                        <div className="booking-free-pass-top-row-wrapper">
                            <div className="booking-free-pass-top-row-left">
                                <div className="booking-ticket-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
                                        <path d="M11.25 9V7.875M11.25 14.0625V12.9375M11.25 19.125V18M5.85 4.5H21.15C22.4101 4.5 23.0402 4.5 23.5215 4.74524C23.9448 4.96095 24.2891 5.30516 24.5048 5.72852C24.75 6.20982 24.75 6.83988 24.75 8.1V9.5625C22.5754 9.5625 20.8125 11.3254 20.8125 13.5C20.8125 15.6746 22.5754 17.4375 24.75 17.4375V18.9C24.75 20.1601 24.75 20.7902 24.5048 21.2715C24.2891 21.6948 23.9448 22.039 23.5215 22.2548C23.0402 22.5 22.4101 22.5 21.15 22.5H5.85C4.58988 22.5 3.95982 22.5 3.47852 22.2548C3.05516 22.039 2.71095 21.6948 2.49524 21.2715C2.25 20.7902 2.25 20.1601 2.25 18.9V17.4375C4.42462 17.4375 6.1875 15.6746 6.1875 13.5C6.1875 11.3254 4.42462 9.5625 2.25 9.5625V8.1C2.25 6.83988 2.25 6.20982 2.49524 5.72852C2.71095 5.30516 3.05516 4.96095 3.47852 4.74524C3.95982 4.5 4.58988 4.5 5.85 4.5Z" stroke="#050014" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="booking-free-pass-title">Free Pass</h2>
                            </div>
                            <div className="booking-free-pass-top-row-right">
                                <h2 className="booking-free-pass-top-row-right-number">&#8377;0</h2>
                            </div>
                        </div>
                        <ul className="booking-free-pass-list-wrapper">
                            <li className="booking-free-pass-text">Cost: Free</li>
                            <li className="booking-free-pass-text">Entry: Guaranteed entry if you arrive 15+ minutes prior to the event start time</li>
                            <li className="booking-free-pass-text">Seating: Open Seating</li>
                        </ul>
                        <p className="booking-free-pass-text">All Free Passes will be available for booking from Saturday, January 9, 2027, and will remain open until the venue reaches full capacity.</p>
                    </div>
                </div>
                <div className="booking-free-pass-container">
                    <img src={donorPassImage} alt="Donor Pass" className="booking-free-pass-image-container" />
                    <div className="booking-free-pass-bottom-container">
                        <div className="booking-free-pass-top-row-wrapper">
                            <div className="booking-free-pass-top-row-left">
                                <div className="booking-ticket-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
                                        <path d="M11.25 9V7.875M11.25 14.0625V12.9375M11.25 19.125V18M5.85 4.5H21.15C22.4101 4.5 23.0402 4.5 23.5215 4.74524C23.9448 4.96095 24.2891 5.30516 24.5048 5.72852C24.75 6.20982 24.75 6.83988 24.75 8.1V9.5625C22.5754 9.5625 20.8125 11.3254 20.8125 13.5C20.8125 15.6746 22.5754 17.4375 24.75 17.4375V18.9C24.75 20.1601 24.75 20.7902 24.5048 21.2715C24.2891 21.6948 23.9448 22.039 23.5215 22.2548C23.0402 22.5 22.4101 22.5 21.15 22.5H5.85C4.58988 22.5 3.95982 22.5 3.47852 22.2548C3.05516 22.039 2.71095 21.6948 2.49524 21.2715C2.25 20.7902 2.25 20.1601 2.25 18.9V17.4375C4.42462 17.4375 6.1875 15.6746 6.1875 13.5C6.1875 11.3254 4.42462 9.5625 2.25 9.5625V8.1C2.25 6.83988 2.25 6.20982 2.49524 5.72852C2.71095 5.30516 3.05516 4.96095 3.47852 4.74524C3.95982 4.5 4.58988 4.5 5.85 4.5Z" stroke="#050014" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="booking-free-pass-title">Donor Pass</h2>
                            </div>
                            <div className="booking-free-pass-top-row-right">
                                <h2 className="booking-free-pass-top-row-right-number">&#8377;0</h2>
                            </div>
                        </div>
                        <ul className="booking-free-pass-list-wrapper">
                            <li className="booking-free-pass-text">Cost: A donation that supports the festival. Donor Passes are non-refundable.</li>
                            <li className="booking-free-pass-text">Entry: Guaranteed entry if you arrive 15+ minutes prior to the event start time</li>
                            <li className="booking-free-pass-text">Seating: Open Seating</li>
                        </ul>
                        <p className="booking-free-pass-text">Donor Passes will be available for booking as soon as the events are live on the website.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};