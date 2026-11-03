import React, { useState, useEffect } from "react";
import { MotionSection } from "../AnimatedPage";
import { useLanguage } from "../../context/LanguageContext";
import "./SponsorsSection.css";

// Title Sponsor
import titleSponsor from "../../assets/our-sponosrs-images/title-sponsor/image-1.png";

// Partner
import partnerSponsor from "../../assets/our-sponosrs-images/partner-sponsors/image-1.png";

// Anchor Sponsor
import anchorSponsor from "../../assets/our-sponosrs-images/anchor-sponsors/image-1.png";

// Festival Sponsors
import festivalSponsor1 from "../../assets/our-sponosrs-images/festival-sponsors/image-1.png";
import festivalSponsor2 from "../../assets/our-sponosrs-images/festival-sponsors/image-2.png";
import festivalSponsor3 from "../../assets/our-sponosrs-images/festival-sponsors/image-3.png";

// Government Partners
import govtSponsor1 from "../../assets/our-sponosrs-images/government-sponsors/image-1.png";
import govtSponsor2 from "../../assets/our-sponosrs-images/government-sponsors/image-2.png";
import govtSponsor3 from "../../assets/our-sponosrs-images/government-sponsors/image-3.png";
import govtSponsor4 from "../../assets/our-sponosrs-images/government-sponsors/image-4.png";
import govtSponsor5 from "../../assets/our-sponosrs-images/government-sponsors/image-5.png";
import govtSponsor6 from "../../assets/our-sponosrs-images/government-sponsors/image-6.png";
import govtSponsor7 from "../../assets/our-sponosrs-images/government-sponsors/image-7.png";
import govtSponsor8 from "../../assets/our-sponosrs-images/government-sponsors/image-8.png";
import govtSponsor9 from "../../assets/our-sponosrs-images/government-sponsors/image-9.png";

// Property Sponsors
import propertySponsor from "../../assets/our-sponosrs-images/property-sponsors/image-1.png";

// Associate Sponsors
import associateSponsor1 from "../../assets/our-sponosrs-images/associate-sponosrs/image-1.png";
import associateSponsor2 from "../../assets/our-sponosrs-images/associate-sponosrs/image-2.png";
import associateSponsor3 from "../../assets/our-sponosrs-images/associate-sponosrs/image-3.png";

// Supporters
import supporterSponsor1 from "../../assets/our-sponosrs-images/supporters-sponsors/image-1.png";
import supporterSponsor2 from "../../assets/our-sponosrs-images/supporters-sponsors/image-2.png";
import supporterSponsor3 from "../../assets/our-sponosrs-images/supporters-sponsors/image-3.png";

const CATEGORIES = [
    { id: "title", label: "TITLE SPONSOR", labelKn: "ಟೈಟಲ್ ಸ್ಪಾನ್ಸರ್" },
    { id: "partner", label: "PARTNER", labelKn: "ಪಾಲುದಾರ" },
    { id: "anchor", label: "ANCHOR", labelKn: "ನಿರ್ವಹಣೆ" },
    { id: "festival", label: "FESTIVAL SPONSORS", labelKn: "ಹಬ್ಬದ ಪ್ರಾಯೋಜಕರು" },
    { id: "govt", label: "GOVERNMENT PARTNERS", labelKn: "ಸರ್ಕಾರಿ ಪಾಲುದಾರರು" },
    { id: "property", label: "PROPERTY SPONSORS", labelKn: "ಪ್ರಾಪರ್ಟಿ ಸ್ಪಾನ್ಸರ್" },
    { id: "associate", label: "ASSOCIATE SPONSORS", labelKn: "ಸಹ ಪ್ರಾಯೋಜಕರು" },
    { id: "venue", label: "VENUE PARTNERS", labelKn: "ಸ್ಥಳ ಪಾಲುದಾರರು" },
    { id: "supporters", label: "SUPPORTERS", labelKn: "ಬೆಂಬಲಿಗರು" }
];

const CATEGORIES_ROW_1 = [
    { id: "title", label: "TITLE SPONSOR", labelKn: "ಟೈಟಲ್ ಸ್ಪಾನ್ಸರ್" },
    { id: "partner", label: "PARTNER", labelKn: "ಪಾಲುದಾರ" },
    { id: "anchor", label: "ANCHOR", labelKn: "ನಿರ್ವಹಣೆ" },
    { id: "festival", label: "FESTIVAL SPONSORS", labelKn: "ಹಬ್ಬದ ಪ್ರಾಯೋಜಕರು" },
    { id: "govt", label: "GOVERNMENT PARTNERS", labelKn: "ಸರ್ಕಾರಿ ಪಾಲುದಾರರು" }
];

const CATEGORIES_ROW_2 = [
    { id: "property", label: "PROPERTY SPONSORS", labelKn: "ಪ್ರಾಪರ್ಟಿ ಸ್ಪಾನ್ಸರ್" },
    { id: "associate", label: "ASSOCIATE SPONSORS", labelKn: "ಸಹ ಪ್ರಾಯೋಜಕರು" },
    { id: "venue", label: "VENUE PARTNERS", labelKn: "ಸ್ಥಳ ಪಾಲುದಾರರು" },
    { id: "supporters", label: "SUPPORTERS", labelKn: "ಬೆಂಬಲಿಗರು" }
];

const STATIC_CATEGORY_LOGOS = {
    title: [titleSponsor],
    partner: [partnerSponsor],
    anchor: [anchorSponsor],
    festival: [festivalSponsor1, festivalSponsor2, festivalSponsor3],
    govt: [
        govtSponsor1,
        govtSponsor2,
        govtSponsor3,
        govtSponsor4,
        govtSponsor5,
        govtSponsor6,
        govtSponsor7,
        govtSponsor8,
        govtSponsor9
    ],
    property: [propertySponsor],
    associate: [associateSponsor1, associateSponsor2, associateSponsor3],
    venue: [],
    supporters: [],
    friends: [] // Placeholder if friends are empty
};

export const SponsorsSection = () => {
    const { language } = useLanguage();
    const isKannada = language === "kn";
    const [activeCategory, setActiveCategory] = useState("title");
    const [dynamicSponsors, setDynamicSponsors] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch dynamic sponsor logos from backend API
    useEffect(() => {
        const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
        fetch(`${apiUrl}/public/sponsors`)
            .then((res) => res.json())
            .then((res) => {
                if (res.success && Array.isArray(res.data)) {
                    const grouped = {};
                    res.data.forEach((item) => {
                        if (!grouped[item.category]) grouped[item.category] = [];
                        grouped[item.category].push(item.imageUrl);
                    });
                    setDynamicSponsors(grouped);
                    setIsLoaded(true);
                }
            })
            .catch((err) => console.error("Error loading dynamic sponsor logos:", err));
    }, []);

    const handleTabClick = (id) => {
        setActiveCategory(id);
    };

    const renderLogos = () => {
        const activeLogos = isLoaded
            ? (dynamicSponsors[activeCategory] || [])
            : (STATIC_CATEGORY_LOGOS[activeCategory] || []);

        if (!activeLogos || activeLogos.length === 0) {
            return (
                <div className="sponsors-logos-container">
                    <div className="logos-row desktop-logos-row" style={{ minHeight: "80px" }}></div>
                </div>
            );
        }
        
        return (
            <div className="sponsors-logos-container">
                {/* Desktop layout */}
                {activeCategory === "govt" && activeLogos.length > 5 ? (
                    <>
                        <div className="logos-row desktop-logos-row">
                            {activeLogos.slice(0, 5).map((logo, idx) => (
                                <div key={`d-row1-${idx}`} className="sponsor-logo-card">
                                    <img src={logo} alt={`Government Partner ${idx + 1}`} className="sponsor-logo-img" />
                                </div>
                            ))}
                        </div>
                        <div className="logos-row desktop-logos-row">
                            {activeLogos.slice(5).map((logo, idx) => (
                                <div key={`d-row2-${idx}`} className="sponsor-logo-card">
                                    <img src={logo} alt={`Government Partner ${idx + 6}`} className="sponsor-logo-img" />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="logos-row desktop-logos-row">
                        {activeLogos.map((logo, idx) => (
                            <div key={`d-${activeCategory}-${idx}`} className="sponsor-logo-card">
                                <img src={logo} alt={`${activeCategory} Sponsor ${idx + 1}`} className="sponsor-logo-img" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile single horizontal scrolling track */}
                <div className="logos-row mobile-logos-row">
                    {activeLogos.map((logo, idx) => (
                        <div key={`m-${activeCategory}-${idx}`} className="sponsor-logo-card">
                            <img src={logo} alt={`${activeCategory} Sponsor ${idx + 1}`} className="sponsor-logo-img" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <MotionSection className="sponsors-section">
            <div className="sponsors-wrapper">
                {/* Heading */}
                <div className="sponsors-section-header">
                    <h2 className={`sponsors-heading ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ನಮ್ಮ ಪ್ರಾಯೋಜಕರು" : "Our Sponsors"}
                    </h2>

                    {/* Categories Tabs */}
                    <div className="sponsors-categories">
                        {/* Desktop 2-Row Layout */}
                        <div className="sponsors-categories-track desktop-categories">
                            <div className="sponsors-categories-row">
                                {CATEGORIES_ROW_1.map((cat) => (
                                    <button
                                        key={cat.id}
                                        className={`category-tab ${activeCategory === cat.id ? "active" : ""} ${isKannada ? "kannada" : ""}`}
                                        onClick={() => handleTabClick(cat.id)}
                                    >
                                        {isKannada && cat.labelKn ? cat.labelKn : cat.label}
                                    </button>
                                ))}
                            </div>
                            <div className="sponsors-categories-row">
                                {CATEGORIES_ROW_2.map((cat) => (
                                    <button
                                        key={cat.id}
                                        className={`category-tab ${activeCategory === cat.id ? "active" : ""} ${isKannada ? "kannada" : ""}`}
                                        onClick={() => handleTabClick(cat.id)}
                                    >
                                        {isKannada && cat.labelKn ? cat.labelKn : cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Scroll Track */}
                        <div className="sponsors-categories-track mobile-categories">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`category-tab ${activeCategory === cat.id ? "active" : ""} ${isKannada ? "kannada" : ""}`}
                                    onClick={() => handleTabClick(cat.id)}
                                >
                                    {isKannada && cat.labelKn ? cat.labelKn : cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Logos Grid */}
                {renderLogos()}
            </div>
        </MotionSection>
    );
};

export default SponsorsSection;
