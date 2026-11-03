import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { MotionSection, MotionButton } from "../../components/AnimatedPage";
import SponsorsSection from "../../components/SponsorsSection/SponsorsSection";
import "../Home/Homepage.css";
import "./AboutUsPage.css";
import aboutIntroImg from "../../assets/about-page-img/img.png";
import showcaseImg from "../../assets/about-us/showcase-image.png";
import marketImg from "../../assets/about-us/market-image.png";
import labImg from "../../assets/about-us/lab-image.png";
import onWheelsImg from "../../assets/about-us/on-wheels-image.png";
import calendarMobileImg from "../../assets/home-page-am-img.png";

const PILLARS_DATA = [
    {
        id: "showcase",
        title: "SHOWCASE",
        titleKn: "ಶೋಕೇಸ್",
        img: showcaseImg,
        desc: "Curated performances, exhibitions, and artistic experiences across disciplines, bringing artists and audiences together to celebrate music, theatre, dance, design, visual art, sport, storytelling, and more.",
        descKn: "ವಿವಿಧ ಕಲಾಪ್ರಕಾರಗಳ ಆಯ್ದ ಪ್ರದರ್ಶನಗಳು, ಕಲಾ ಪ್ರದರ್ಶನಗಳು ಮತ್ತು ಸೃಜನಶೀಲ ಅನುಭವಗಳ ಮೂಲಕ ಕಲಾವಿದರು ಹಾಗೂ ಪ್ರೇಕ್ಷಕರನ್ನು ಒಂದೆಡೆ ಸೇರಿಸಿ, ಸಂಗೀತ, ರಂಗಭೂಮಿ, ನೃತ್ಯ, ವಿನ್ಯಾಸ, ದೃಶ್ಯಕಲೆ, ಕ್ರೀಡೆ, ಕಥನಕಲೆ ಮತ್ತು ಇನ್ನೂ ಹಲವು ಕಲಾ ರೂಪಗಳನ್ನು ಸಂಭ್ರಮಿಸುವ ಕಾರ್ಯಕ್ರಮಗಳು."
    },
    {
        id: "market",
        title: "MARKET",
        titleKn: "ಮಾರ್ಕೆಟ್",
        img: marketImg,
        desc: "Lively public markets celebrating craft, food, and local enterprise, where artisans, makers, and chefs share their work while audiences discover, taste, and take home pieces of the city’s creative economy.",
        descKn: "ಕರಕುಶಲ, ಆಹಾರ ಮತ್ತು ಸ್ಥಳೀಯ ಉದ್ಯಮವನ್ನು ಸಂಭ್ರಮಿಸುವ ಸಡಗರದ ಸಾರ್ವಜನಿಕ ಸಂತೆಗಳು; ಇಲ್ಲಿ ಕುಶಲಕರ್ಮಿಗಳು, ಸೃಜನಶೀಲರು ಮತ್ತು ಅಡುಗೆಯವರು ತಮ್ಮ ಕೆಲಸಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತಾರೆ. ಪ್ರೇಕ್ಷಕರು ನಗರದ ಸೃಜನಶೀಲ ಆರ್ಥಿಕತೆಯ ಪರಿಚಯ ಪಡೆದು, ಅದರ ರುಚಿ ಸವಿದು, ಅದರ ಒಂದು ತುಣುಕನ್ನು ತಮ್ಮೊಂದಿಗೆ ಮನೆಗೆ ಕೊಂಡೊಯ್ಯುತ್ತಾರೆ."
    },
    {
        id: "lab",
        title: "LAB",
        titleKn: "ಲ್ಯಾಬ್",
        img: labImg,
        desc: "Spaces for experimentation, collaboration, and hands-on engagement. Come learn, explore, and co-create the Hubba experience with us through residencies, workshops, and immersive sessions.",
        descKn: "ಪ್ರಯೋಗ, ಸಹಯೋಗ ಮತ್ತು ಕೈಯಾರೆ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆಗೆ ತೆರೆದಿರುವ ತಾಣಗಳು. ರೆಸಿಡೆನ್ಸಿಗಳು, ಕಾರ್ಯಾಗಾರಗಳು ಮತ್ತು ತಲ್ಲೀನಗೊಳಿಸುವ ಗೋಷ್ಠಿಗಳ ಮೂಲಕ ನಮ್ಮೊಂದಿಗೆ ಕಲಿಯಿರಿ, ಅನ್ವೇಷಿಸಿ, ಹಬ್ಬದ ಅನುಭವವನ್ನು ಜೊತೆಯಾಗಿ ರೂಪಿಸಿರಿ."
    },
    {
        id: "on_wheels",
        title: "ON WHEELS",
        titleKn: "ಆನ್ ವೀಲ್ಸ್",
        img: onWheelsImg,
        desc: "A mobile venue that brings Bengaluru's best cultural programming to your neighbourhood in collaboration with the city's cultural organizations.",
        descKn: "ನಗರದ ಸಾಂಸ್ಕೃತಿಕ ಸಂಸ್ಥೆಗಳ ಸಹಯೋಗದೊಂದಿಗೆ, ಬೆಂಗಳೂರಿನ ಅತ್ಯುತ್ತಮ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ನಿಮ್ಮ ನೆರೆಹೊರೆಗೆ ತಂದುಕೊಡುವ ಸಂಚಾರಿ ತಾಣ."
    }
];

export const AboutUsPage = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isKannada = language === "kn";
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="about-us-page">
            {/* HERO BANNER SECTION (Frame 2537) */}
            <section className="about-us-hero-wrapper">
                <div className="about-us-hero-card">
                    <span className={`about-us-hero-eyebrow ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? (
                            "ನಮ್ಮ ಬಗ್ಗೆ"
                        ) : (
                            <>
                                <span className="about-eyebrow-desktop">ABOUT BLR HUBBA</span>
                                <span className="about-eyebrow-mobile">ABOUT</span>
                            </>
                        )}
                    </span>
                    <h1 className={`about-us-hero-title ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? (
                            "ಬೆಂಗಳೂರಿನ ಸೃಜನಶೀಲತೆ ಮತ್ತು ಚಿಂತನೆಯ ಮಿಡಿತವನ್ನು ಸಂಭ್ರಮಿಸುವ ಹಬ್ಬ"
                        ) : (
                            <>
                                <span className="about-title-desktop">Celebrating Bengaluru's creative and<br /> intellectual pulse</span>
                                <span className="about-title-mobile">Celebrating Bengaluru's<br />creative and intellectual pulse</span>
                            </>
                        )}
                    </h1>
                </div>
            </section>

            {/* ABOUT INTRO SECTION (Video + Frame 2572 Content) */}
            <section className="about-intro-section">
                <div className="about-intro-grid">
                    {/* Left Column: Video Card */}
                    <div className="about-video-card" onClick={() => setIsVideoModalOpen(true)}>
                        <picture>
                            <source media="(max-width: 768px)" srcSet={aboutIntroImg} />
                            <img
                                src={aboutIntroImg}
                                alt="About BLR Hubba"
                                className="about-video-img"
                            />
                        </picture>
                        <button className="about-play-btn" aria-label="Play festival video">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0 50C0 22.4 22.4 0 50 0C77.6 0 100 22.4 100 50C100 77.6 77.6 100 50 100C22.4 100 0 77.6 0 50ZM70 50L40 27.5V72.5L70 50Z" fill="white" fillOpacity="0.8" />
                            </svg>
                        </button>
                    </div>

                    {/* Right Column: Text Information */}
                    <div className="about-info-col">
                        <span className={`about-info-eyebrow ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಬೆಂಗಳೂರು ಹಬ್ಬ ಎಂದರೇನು?" : "What is BLR Hubba?"}
                        </span>
                        <h2 className={`about-info-title ${isKannada ? "kannada" : ""}`}>
                            {isKannada
                                ? "ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಬೆಂಗಳೂರಿನ ಅಗ್ರಗಣ್ಯ ಹಬ್ಬ"
                                : "There's more to Bengaluru than meets the eye"}
                        </h2>
                        <div className={`about-info-body ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? (
                                <>
                                    <p>
                                        ‘ಬೆಂಗಳೂರು ಹಬ್ಬ’ ಬೆಂಗಳೂರಿನ ಸೃಜನಶೀಲ ಹಾಗೂ ಬೌದ್ಧಿಕ ಚೈತನ್ಯವನ್ನು ಸಂಭ್ರಮಿಸುವ 10 ದಿನಗಳ ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಅಗ್ರಗಣ್ಯ ಹಬ್ಬವಾಗಿದೆ. ನಾವು 2023ರಿಂದ, ನೂರಾರು ಕಲಾವಿದರು, ಕಲಾಪ್ರದರ್ಶಕರು ಮತ್ತು ಸೃಜನಶೀಲರನ್ನು ಒಂದೆಡೆ ಸೇರಿಸುತ್ತಾ, ಬೆಂಗಳೂರಿನ ಸ್ಥಳೀಯ ಪ್ರತಿಭೆ ಹಾಗೂ ಜಾಗತಿಕ ಛಾಪನ್ನು ಮುನ್ನೆಲೆಗೆ ತರುತ್ತಿದ್ದೇವೆ.
                                    </p>
                                    <p>
                                        BLR HUBBAದಲ್ಲಿ ಹಬ್ಬದ ಬರವಣಿಗೆ HABBA ಎಂದೇಕಿಲ್ಲ? ಏಕೆಂದರೆ ಸ್ಟಾರ್ಟ್ಅಪ್ಗಳು, ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್ಗೆ ಬೆಂಗಳೂರು ಹೇಗೆ ಒಂದು ತಾಣವೋ, ಹಾಗೆಯೇ ಕಲಾವಿದರು, ಕಲಾಪ್ರದರ್ಶಕರು ಮತ್ತು ಕಥೆಗಾರರಿಗೂ ಈ ನಗರ ಯಾವತ್ತೂ ಒಂದು HUB — ಹಬ್ ಆಗಿದೆ. ಉದ್ಯಾನಗಳು, ಕೆರೆಗಳು ಮತ್ತು ಹಿತವಾದ ಹವಾಮಾನದಾಚೆ ಇರುವ ಬೆಂಗಳೂರಿನ ಮತ್ತೊಂದು ಮುಖವನ್ನು ಕಂಡುಕೊಳ್ಳುವ ಆಹ್ವಾನವೇ ಬೆಂಗಳೂರು ಹಬ್ಬ.
                                    </p>
                                    <p>
                                        ಬೆಂಗಳೂರು ಹಬ್ಬದ ನಾಲ್ಕನೇ ಆವೃತ್ತಿ 2027ರ ಜನವರಿ 15ರಿಂದ 24ರವರೆಗೆ ನಡೆಯಲಿದೆ. Showcase, Market ಮತ್ತು Lab ಎಂಬ ಮೂರು ವಿಭಾಗಗಳಲ್ಲಿ, 12 ಮರಳಿ ಬರುವ ನೆಚ್ಚಿನ ಹಬ್ಬಗಳ ಜೊತೆಗೆ ಐದು ಹೊಸ ಉಪಹಬ್ಬಗಳೂ ಈ ಬಾರಿ ಸೇರಲಿವೆ. ಚಿತ್ರಕಲೆ, ನೃತ್ಯ, ಆಹಾರ, ಸಂಗೀತ, ರಂಗಭೂಮಿ ಮತ್ತು ಇನ್ನೂ ಅನೇಕ ಅನುಭವಗಳು ನಿಮ್ಮನ್ನು ಕಾಯುತ್ತಿವೆ. ಈ ಜನವರಿಯಲ್ಲಿ ನಮ್ಮೊಂದಿಗೆ ನಗರದೊಳಗೆ ನಿಮ್ಮದೇ ದಾರಿಯನ್ನು ಕಂಡುಕೊಳ್ಳಿ. ಸ್ವಾಗತ.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p>
                                        We are a 10-day arts and culture festival celebrating Bengaluru’s creative and intellectual pulse. Since 2023, we have brought together hundreds of artists, performers and creators, spotlighting Bengaluru’s local talent and global flair.
                                    </p>
                                    <p>
                                        Why BLR Hubba, not Habba? Because Bengaluru has always been a hub for artists, performers and storytellers, as much as start-ups, technology and engineering. The Hubba is an invitation to experience a side of the city beyond its gardens, lakes and perfect weather.
                                    </p>
                                    <p>
                                        The fourth edition runs from 15-24 January 2027, with 12 returning favourites and five new festivals across Showcase, Market and Lab formats. Art, dance, food, music, theatre and more await. Come find your way around the city with us this January.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* BANNI NODI 4-CARDS SECTION (Frame 1000004245 & Frame 1000004237) */}
            <section className="about-pillars-section">
                <div className="about-pillars-header">
                    <span className={`about-pillars-eyebrow ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ಬೆಂಗಳೂರು ಹಬ್ಬವನ್ನು ಅನುಭವಿಸುವ ಹಲವು ದಾರಿಗಳು" : "Ways to experience BLR Hubba"}
                    </span>
                    <h2 className={`about-pillars-title ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? (
                            "ಬನ್ನಿ ನೋಡಿ. ಬೆಂಗಳೂರಿನ ಹಬ್ಬಗಳ ಹಬ್ಬವನ್ನು ವಿಶೇಷವಾಗಿಸುವುದೇನು ಎಂಬುದನ್ನು ನೀವೇ ಬಂದು ಅನುಭವಿಸಿ."
                        ) : (
                            <>
                                Banni Nodi. Come, see for yourself what makes<br className="about-title-br" /> Bengaluru's festival of festivals.
                            </>
                        )}
                    </h2>
                </div>

                <div className="about-pillars-grid">
                    {PILLARS_DATA.map((pillar) => {
                        const categoryTabId = pillar.id === 'on_wheels' ? 'ON WHEELS' : pillar.id.toUpperCase();
                        return (
                        <div
                            key={pillar.id}
                            className="about-pillar-card"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/festivals?category=${encodeURIComponent(categoryTabId)}`)}
                        >
                            <div className="about-pillar-card-inner">
                                {/* FRONT FACE */}
                                <div className="about-pillar-card-front">
                                    <div className="about-pillar-img-box">
                                        <img
                                            src={pillar.img}
                                            alt={pillar.title}
                                            className="about-pillar-img"
                                        />
                                    </div>
                                    <div className="about-pillar-footer">
                                        <span className={`about-pillar-label ${isKannada ? "kannada" : ""}`}>
                                            {isKannada && pillar.titleKn ? pillar.titleKn : pillar.title}
                                        </span>
                                    </div>
                                </div>

                                {/* BACK FACE (3D FLIP) */}
                                <div className="about-pillar-card-back">
                                    <div className="about-pillar-back-header">
                                        <span className={`about-pillar-back-title ${isKannada ? "kannada" : ""}`}>
                                            {isKannada && pillar.titleKn ? pillar.titleKn : pillar.title}
                                        </span>
                                    </div>
                                    <div className="about-pillar-back-body">
                                        <p className={`about-pillar-back-desc ${isKannada ? "kannada" : ""}`}>
                                            {isKannada && pillar.descKn ? pillar.descKn : pillar.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </section>

            {/* ================= EVENT CALENDAR SECTION (HIDDEN FOR 2027/PREVIEW) ================= */}
            {/* 
            <MotionSection className="hp-calendar-section" variant="scaleUp">
                <div className="hp-calendar-card">
                    <div className="hp-calendar-card-content">
                        <p className="hp-calendar-subtitle">EVENT CALENDAR</p>
                        <h2 className="hp-calendar-title">
                            Explore upcoming events, save your<br className="hp-calendar-title-break" /> favourites, and plan your days.
                        </h2>
                        <div className="hp-calendar-btns">
                            <MotionButton className="hp-calendar-btn-yellow" onClick={() => navigate("/events")}>
                                <span className="btn-text-primary">VIEW CALENDAR</span>
                                <span className="btn-text-secondary">VIEW CALENDAR</span>
                            </MotionButton>
                            <MotionButton className="hp-calendar-btn-outline" onClick={() => navigate("/events")}>
                                <span className="btn-text-primary">KNOW MORE</span>
                                <span className="btn-text-secondary">KNOW MORE</span>
                            </MotionButton>
                        </div>
                    </div>
                    <img src={calendarMobileImg} alt="Event Calendar Performers" className="hp-calendar-mobile-img" />
                </div>
            </MotionSection>
            */}

            {/* ================= OUR SPONSORS SECTION ================= */}
            <SponsorsSection />

            {/* Video Player Modal */}
            {isVideoModalOpen && (
                <div className="about-video-modal-backdrop" onClick={() => setIsVideoModalOpen(false)}>
                    <div className="about-video-modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="about-video-modal-close" onClick={() => setIsVideoModalOpen(false)}>✕</button>
                        <div className="about-video-wrapper">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/1rv3t5bX-gQ?autoplay=1"
                                title="BLR Hubba Festival Video"
                                frameBorder="0"
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

export default AboutUsPage;
