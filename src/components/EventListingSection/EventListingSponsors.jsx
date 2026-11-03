import React, { useState, useEffect } from "react";
import "./EventListingSponsors.css";
import hpSponsorsImg from "../../assets/sponsors/hp-sponsors.png";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EventListingSponsors = () => {
    const { language } = useLanguage();
    const isKannada = language === "kn";

    const [logoUrl, setLogoUrl] = useState(null);
    const [mobileLogoUrl, setMobileLogoUrl] = useState(null);
    const [kannadaLogoUrl, setKannadaLogoUrl] = useState(null);
    const [kannadaMobileLogoUrl, setKannadaMobileLogoUrl] = useState(null);

    useEffect(() => {
        const fetchHomepageLogo = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/public/homepage-logo`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        if (data.data.imageUrl) setLogoUrl(data.data.imageUrl);
                        if (data.data.mobileImageUrl) setMobileLogoUrl(data.data.mobileImageUrl);
                        if (data.data.kannadaImageUrl) setKannadaLogoUrl(data.data.kannadaImageUrl);
                        if (data.data.kannadaMobileImageUrl) setKannadaMobileLogoUrl(data.data.kannadaMobileImageUrl);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dynamic homepage logo, using default:", err);
            }
        };

        fetchHomepageLogo();
    }, []);

    // Select banner based on active language
    const currentDesktopImg = isKannada
        ? (kannadaLogoUrl || logoUrl || hpSponsorsImg)
        : (logoUrl || hpSponsorsImg);

    const currentMobileImg = isKannada
        ? (kannadaMobileLogoUrl || kannadaLogoUrl || mobileLogoUrl || logoUrl || hpSponsorsImg)
        : (mobileLogoUrl || logoUrl || hpSponsorsImg);

    return (
        <section className="main-wrapper hp-our-sponsors-section">
            <div className="sponsors-section-container">
                <div className="title-container">
                    <h2>{isKannada ? "ನಮ್ಮ ಪ್ರಾಯೋಜಕರು" : "Our Sponsors"}</h2>
                </div>
                <div className="hp-sponsors-image-container">
                    {/* Desktop image (Desktop view >= 769px) */}
                    <img
                        src={currentDesktopImg}
                        alt="BLR Hubba Sponsors"
                        className="hp-sponsors-img hp-sponsors-desktop-img"
                    />
                    {/* Mobile image (Mobile view <= 768px, width 327px auto height) */}
                    <img
                        src={currentMobileImg}
                        alt="BLR Hubba Sponsors"
                        className="hp-sponsors-img hp-sponsors-mobile-img"
                    />
                </div>
            </div>
        </section>
    );
};

export default EventListingSponsors;