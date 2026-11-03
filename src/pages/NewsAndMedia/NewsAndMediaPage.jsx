import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MotionSection, MotionButton } from "../../components/AnimatedPage";
import "../Home/Homepage.css";
import "./NewsAndMediaPage.css";

import aboutUsVideoThumb from "../../assets/home-page-about-img.png";
import aboutUsMobileImg from "../../assets/home-page-about-img-mobile.png";

export const NewsAndMediaPage = () => {
    const navigate = useNavigate();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    return (
        <main className="news-media-page">
            {/* ================= ABOUT US SECTION (KANNADA) ================= */}
            <MotionSection className="hp-about-section news-media-about-section" variant="clipReveal">
                <div className="hp-about-grid">
                    {/* Left Column: Video Card */}
                    <div className="hp-about-video-card" onClick={() => setIsVideoModalOpen(true)}>
                        <picture>
                            <source media="(max-width: 768px)" srcSet={aboutUsMobileImg} />
                            <img
                                src={aboutUsVideoThumb}
                                alt="BLR Hubba Dance Performance"
                                className="hp-about-video-img"
                            />
                        </picture>
                        <button className="hp-about-play-btn" aria-label="Play festival video">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0 50C0 22.4 22.4 0 50 0C77.6 0 100 22.4 100 50C100 77.6 77.6 100 50 100C22.4 100 0 77.6 0 50ZM70 50L40 27.5V72.5L70 50Z" fill="white" fillOpacity="0.8" />
                            </svg>
                        </button>
                    </div>

                    {/* Right Column: Kannada Info Card */}
                    <div className="hp-about-info-card news-media-kannada-card">
                        <span className="hp-about-subtitle news-media-kannada-subtitle">ಹಬ್ಬದ ಬಗ್ಗೆ</span>
                        <h2 className="hp-about-title news-media-kannada-title">
                            ಬೆಂಗಳೂರು ಹಬ್ಬವು ನಗರದ ಸೃಜನಶೀಲ ಹಾಗೂ ಬೌದ್ಧಿಕ ಚೈತನ್ಯವನ್ನು ಸಂಭ್ರಮಿಸುವ ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಮಹೋತ್ಸವ.
                        </h2>
                        <p className="hp-about-desc news-media-kannada-desc">
                            ಚಿತ್ರಕಲೆ, ನೃತ್ಯ, ಸಂಗೀತ, ಆಹಾರ, ರಂಗಭೂಮಿ ಮತ್ತು ಇನ್ನೂ ಅನೇಕ ಕಲಾ ರೂಪಗಳನ್ನು ಒಳಗೊಂಡ ನೂರಾರು ಕಾರ್ಯಕ್ರಮಗಳೊಂದಿಗೆ, ಈ ಹತ್ತು ದಿನಗಳ ಉತ್ಸವವು 2027ರ ಜನವರಿ 15ರಿಂದ 24ರವರೆಗೆ ತನ್ನ ನಾಲ್ಕನೇ ಆವೃತ್ತಿಯೊಂದಿಗೆ ಮರಳುತ್ತಿದೆ. ಈ ಉತ್ಸವದ ಮುಖ್ಯ ಆಯೋಜಕರು UnboxingBLR.
                        </p>
                        <MotionButton className="hp-about-btn news-media-kannada-btn" onClick={() => navigate("/events")}>
                            <span className="btn-text-primary">ಮತ್ತಷ್ಟು ಓದಿ</span>
                            <span className="btn-text-secondary">ಮತ್ತಷ್ಟು ಓದಿ</span>
                        </MotionButton>
                    </div>
                </div>
            </MotionSection>

            {/* Video Player Modal */}
            {isVideoModalOpen && (
                <div className="hp-video-modal-backdrop" onClick={() => setIsVideoModalOpen(false)}>
                    <div className="hp-video-modal-container" onClick={e => e.stopPropagation()}>
                        <button className="hp-video-modal-close" onClick={() => setIsVideoModalOpen(false)}>✕</button>
                        <div className="hp-video-wrapper">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/1rv3t5bX-gQ?autoplay=1"
                                title="BLR Hubba Festival Teaser"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default NewsAndMediaPage;
