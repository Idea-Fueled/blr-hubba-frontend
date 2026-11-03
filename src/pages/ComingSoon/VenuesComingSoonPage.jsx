import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./VenuesComingSoonPage.css";
import venuesBanner from "../../assets/coming-soon-banners/venue-banners.png";
import mobileVenuesBanner from "../../assets/coming-soon-banners/mobile-coming-soon-venues.png";

const VenuesComingSoonPage = () => {
    const navigate = useNavigate();

    return (
        <div className="venues-coming-soon-page-container">
            <motion.div
                className="coming-soon-card venues-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Top Banner Section with Artwork */}
                <div
                    className="coming-soon-banner-top"
                    style={{
                        "--desktop-banner": `url(${venuesBanner})`,
                        "--mobile-banner": `url(${mobileVenuesBanner})`,
                    }}
                >
                    <div className="coming-soon-content-frame">
                        <h1 className="coming-soon-banner-title">
                            Bengaluru’s about to<br className="desktop-only" />{" "}
                            get<br className="mobile-only" />{" "}
                            busy
                        </h1>
                        <p className="coming-soon-banner-desc">
                            BLR Hubba 2027 will take over 30+<br className="mobile-only" />{" "}
                            venues<br className="desktop-only" />{" "}
                            across the city.
                        </p>
                        <button
                            className="coming-soon-know-more-btn"
                            onClick={() => navigate("/about-us")}
                        >
                            <span className="btn-text-primary">KNOW MORE</span>
                            <span className="btn-text-secondary">KNOW MORE</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Black Bar */}
                <div className="coming-soon-bottom-bar">
                    <p className="coming-soon-bar-text">
                        <span className="coming-soon-bar-yellow">WATCH THIS SPACE</span>{" "}
                        to see where the Hubba's headed.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VenuesComingSoonPage;
