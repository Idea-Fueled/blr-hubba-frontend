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

const GOVT_LOGOS = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9];

export const SponsorsSection = () => {
    const [activeCategory, setActiveCategory] = useState("govt");

    // Grouping the logos for GOVERNMENT PARTNERS as shown in the screenshot:
    // Row 1 (5 items) and Row 2 (4 items)
    const renderLogos = () => {
        // Render 9 slots for the active category (GOVERNMENT PARTNERS)
        if (activeCategory === "govt") {
            return (
                <div className="sponsors-logos-container">
                    {/* Row 1: 5 Logos */}
                    <div className="logos-row">
                        {GOVT_LOGOS.slice(0, 5).map((logo, idx) => (
                            <div key={`row1-${idx}`} className="sponsor-logo-card">
                                <img src={logo} alt={`Government Partner logo ${idx + 1}`} className="sponsor-logo-img" />
                            </div>
                        ))}
                    </div>
                    {/* Row 2: 4 Logos */}
                    <div className="logos-row">
                        {GOVT_LOGOS.slice(5).map((logo, idx) => (
                            <div key={`row2-${idx}`} className="sponsor-logo-card">
                                <img src={logo} alt={`Government Partner logo ${idx + 6}`} className="sponsor-logo-img" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Fallback slots for other tabs to keep the UI interactive and alive
        return (
            <div className="sponsors-logos-container">
                <div className="logos-row">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={`fallback-${idx}`} className="sponsor-logo-card">
                            <img src="" alt={`Sponsor logo ${idx + 1}`} className="sponsor-logo-img" />
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
