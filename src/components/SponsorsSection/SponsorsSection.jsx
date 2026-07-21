import React, { useState } from "react";
import "./SponsorsSection.css";

import logo1 from "../../assets/kannadda_culutre_logo1.png";
import logo2 from "../../assets/GBA_logo2.png";
import logo3 from "../../assets/city_police_logo3.png";
import logo4 from "../../assets/metro_logo4.png";
import logo5 from "../../assets/ngma_logo5.png";
import logo6 from "../../assets/KIAL_logo6.png";
import logo7 from "../../assets/Karnataka_DOT_logo7.png";
import logo8 from "../../assets/KSDTC_logo8.png";
import logo9 from "../../assets/Ministry_of_culuture_logo9.png";

// Additional Sponsor Imports
import titleSponsor from "../../assets/JSW_Logo_1.png";
import partnerSponsor from "../../assets/Govt_Karnataka_2.png";
import festivalSponsor1 from "../../assets/Manipal-foundation_3.png";
import festivalSponsor2 from "../../assets/go-native_4.png";
import festivalSponsor3 from "../../assets/prestige-logo_5.png";
import propertySponsor from "../../assets/bachpan_manao_logo_6.png";
import associateSponsor1 from "../../assets/msp_logo.png";
import associateSponsor2 from "../../assets/sgmf_logo.jpg";
import associateSponsor3 from "../../assets/siff_logo_1.png";
import anchorSponsor from "../../assets/unboxing_blr_logo.png";
import supporterSponsor1 from "../../assets/bottom-row-logo-10.png";
import supporterSponsor2 from "../../assets/bottom-row-logo-11.png";
import supporterSponsor3 from "../../assets/bottom-row-logo-12.png";

const CATEGORIES = [
    { id: "title", label: "TITLE SPONSOR" },
    { id: "partner", label: "PARTNER" },
    { id: "festival", label: "FESTIVAL SPONSORS" },
    { id: "property", label: "PROPERTY SPONSORS" },
    { id: "associate", label: "ASSOCIATE SPONSORS" },
    { id: "govt", label: "GOVERNMENT PARTNERS" },
    { id: "anchor", label: "ANCHOR" },
    { id: "supporters", label: "SUPPORTERS" },
    { id: "friends", label: "FRIENDS OF HUBBA" }
];

const CATEGORY_LOGOS = {
    title: [titleSponsor],
    partner: [partnerSponsor],
    festival: [festivalSponsor1, festivalSponsor2, festivalSponsor3],
    property: [propertySponsor],
    associate: [associateSponsor1, associateSponsor2, associateSponsor3],
    govt: [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9],
    anchor: [anchorSponsor],
    supporters: [supporterSponsor1, supporterSponsor2, supporterSponsor3],
    friends: [] // Placeholder if friends are empty
};

export const SponsorsSection = () => {
    const [activeCategory, setActiveCategory] = useState("govt");

    const renderLogos = () => {
        const activeLogos = CATEGORY_LOGOS[activeCategory] || [];
        
        if (activeCategory === "govt") {
            return (
                <div className="sponsors-logos-container">
                    {/* Row 1: 5 Logos */}
                    <div className="logos-row">
                        {activeLogos.slice(0, 5).map((logo, idx) => (
                            <div key={`row1-${idx}`} className="sponsor-logo-card">
                                <img src={logo} alt={`Sponsor logo ${idx + 1}`} className="sponsor-logo-img" />
                            </div>
                        ))}
                    </div>
                    {/* Row 2: 4 Logos */}
                    <div className="logos-row">
                        {activeLogos.slice(5).map((logo, idx) => (
                            <div key={`row2-${idx}`} className="sponsor-logo-card">
                                <img src={logo} alt={`Sponsor logo ${idx + 6}`} className="sponsor-logo-img" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="sponsors-logos-container">
                <div className="logos-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
                    {activeLogos.map((logo, idx) => (
                        <div key={`${activeCategory}-${idx}`} className="sponsor-logo-card">
                            <img src={logo} alt={`${activeCategory} Sponsor ${idx + 1}`} className="sponsor-logo-img" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="sponsors-section">
            <div className="sponsors-wrapper">
                {/* Heading */}
                <div className="sponsors-section-header">
                    <h2 className="sponsors-heading">Our Sponsors</h2>

                    {/* Categories Tabs */}
                    <div className="sponsors-categories">
                        {/* Row 1 */}
                        <div className="categories-row">
                            {CATEGORIES.slice(0, 5).map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        {/* Row 2 */}
                        <div className="categories-row">
                            {CATEGORIES.slice(5).map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Logos Grid */}
                {renderLogos()}
            </div>
        </section>
    );
};

export default SponsorsSection;
