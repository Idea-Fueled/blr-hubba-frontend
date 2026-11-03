import React, { useState, useEffect } from "react";
import "./SponsorsPage.css";
import hpSponsorsImg from "../../assets/sponsors/hp-sponsors.png";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const SponsorsPage = () => {
    const { language } = useLanguage();
    const isKannada = language === "kn";

    const [logoUrl, setLogoUrl] = useState(null);
    const [mobileLogoUrl, setMobileLogoUrl] = useState(null);
    const [kannadaLogoUrl, setKannadaLogoUrl] = useState(null);
    const [kannadaMobileLogoUrl, setKannadaMobileLogoUrl] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
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
                console.error("Failed to fetch dynamic sponsors logo:", err);
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
        <main className="sponsors-page">
            {/* HERO BANNER SECTION (Frame 628749) */}
            <section className="sponsors-hero-wrapper">
                <div className="sponsors-hero-card">
                    <span className="sponsors-hero-eyebrow">
                        {isKannada ? "ನಮ್ಮ ಪ್ರಾಯೋಜಕರು" : "OUR SPONSORS"}
                    </span>
                    <h1 className="sponsors-hero-title">
                        {isKannada ? "ಹಬ್ಬವನ್ನು ಸಾಧ್ಯವಾಗಿಸುತ್ತಿದ್ದಾರೆ" : "Making the Hubba possible"}
                    </h1>
                </div>
            </section>

            {/* SPONSORS CONTENT SECTION (Frame 629107) */}
            <section className="sponsors-content-section">
                <div className="sponsors-content-container">
                    <div className="sponsors-title-container">
                        <h2 className="sponsors-heading">
                            {isKannada ? "ನಮ್ಮ ಪ್ರಾಯೋಜಕರು" : "Our Sponsors"}
                        </h2>
                    </div>
                    <div className="sponsors-image-container">
                        {/* Desktop image */}
                        <img
                            src={currentDesktopImg}
                            alt="BLR Hubba Sponsors"
                            className="sponsors-img sponsors-desktop-img"
                        />
                        {/* Mobile image */}
                        <img
                            src={currentMobileImg}
                            alt="BLR Hubba Sponsors"
                            className="sponsors-img sponsors-mobile-img"
                        />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default SponsorsPage;
