import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ComingSoonPage.css";
import eventsBanner from "../../assets/coming-soon-banners/events-banner.png";
import mobileEventsBanner from "../../assets/coming-soon-banners/mobile-coming-soon-events.png";

const ComingSoonPage = () => {
    const navigate = useNavigate();

    return (
        <div className="coming-soon-page-container">
            <motion.div
                className="coming-soon-card events-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Top Banner Section with Artwork */}
                <div
                    className="coming-soon-banner-top"
                    style={{
                        "--desktop-banner": `url(${eventsBanner})`,
                        "--mobile-banner": `url(${mobileEventsBanner})`,
                    }}
                >
                    <div className="coming-soon-content-frame">
                        <h1 className="coming-soon-banner-title">
                            Consider this your sign<br />
                            to make plans
                        </h1>
                        <p className="coming-soon-banner-desc">
                            From art, music and theatre to food,<br className="mobile-only" />{" "}
                            ideas and<br className="desktop-only" />{" "}
                            everything in between.
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
                        The full lineup drops in{" "}
                        <span className="coming-soon-bar-yellow">NOVEMBER.</span>{" "}
                        Set your reminders.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ComingSoonPage;
