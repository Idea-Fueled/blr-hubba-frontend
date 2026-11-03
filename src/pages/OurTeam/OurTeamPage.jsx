import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./OurTeamPage.css";

// Leadership images
import teamImg1 from "../../assets/leadership-team/image-1.png";
import teamImg2 from "../../assets/leadership-team/image-2.png";

// Core team images
import coreImg1 from "../../assets/core-team-images/image-1.png";
import coreImg2 from "../../assets/core-team-images/image-2.png";
import coreImg3 from "../../assets/core-team-images/image-3.png";
import coreImg4 from "../../assets/core-team-images/image-4.png";
import coreImg5 from "../../assets/core-team-images/image-5.png";
import coreImg6 from "../../assets/core-team-images/image-6.png";
import coreImg7 from "../../assets/core-team-images/image-7.png";
import coreImg8 from "../../assets/core-team-images/image-8.png";
import coreImg9 from "../../assets/core-team-images/image-9.png";
import coreImg10 from "../../assets/core-team-images/image-10.png";

// Curator team images
import curatorImg1 from "../../assets/curator-team-images/curator-image-1.png";
import curatorImg2 from "../../assets/curator-team-images/curator-image-2.png";
import curatorImg3 from "../../assets/curator-team-images/curator-image-3.png";
import curatorImg4 from "../../assets/curator-team-images/curator-image-4.png";
import curatorImg5 from "../../assets/curator-team-images/curator-image-5.png";
import curatorImg6 from "../../assets/curator-team-images/curator-image-6.png";
import curatorImg7 from "../../assets/curator-team-images/curator-image-7.png";
import curatorImg8 from "../../assets/curator-team-images/curator-image-8.png";
import curatorImg9 from "../../assets/curator-team-images/curator-image-9.png";
import curatorImg10 from "../../assets/curator-team-images/curator-image-10.png";
import curatorImg11 from "../../assets/curator-team-images/curator-image-11.png";
import curatorImg12 from "../../assets/curator-team-images/curator-image-12.png";

const DEFAULT_BIO = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.commodo consequat. Lorem ipsum dolor sit";

const TEAM_CATEGORIES = [
    { id: "LEADERSHIP", label: "LEADERSHIP" },
    { id: "CURATORS", label: "CURATORS" },
    { id: "CORE_TEAM", label: "TEAM" },
    { id: "SUPPORTING_TEAM", label: "SUPPORT" }
];

const LEADERSHIP_MEMBERS = [
    { id: "l-1", firstName: "V", lastName: "Ravichandar", role: "Catalyst", image: teamImg1, bio: DEFAULT_BIO },
    { id: "l-2", firstName: "Miti", lastName: "Desai", role: "Festival Director", image: teamImg2, bio: DEFAULT_BIO }
];

const CORE_TEAM_MEMBERS = [
    { id: "c-1", nameParts: [{ bold: true, text: "Ashwin " }, { bold: false, text: "Shetty" }, { separator: true }, { bold: true, text: "Aman " }, { bold: false, text: "Dubey" }], role: "(63 Hertz) Audio Tech", image: coreImg1, bio: DEFAULT_BIO },
    { id: "c-2", nameParts: [{ bold: true, text: "Dadapeer " }, { bold: false, text: "Jyman" }], role: "Writer / Editor (Kannada)", image: coreImg2, bio: DEFAULT_BIO },
    { id: "c-3", nameParts: [{ bold: true, text: "Geetha " }, { bold: false, text: "Ballal" }], role: "Production", image: coreImg3, bio: DEFAULT_BIO },
    { id: "c-4", nameParts: [{ bold: true, text: "Keerthi " }, { bold: false, text: "Kumar" }], role: "(ARTMOS) Lights", image: coreImg4, bio: DEFAULT_BIO },
    { id: "c-5", nameParts: [{ bold: true, text: "Madhuwanti " }, { bold: false, text: "Mitro" }], role: "Outreach", image: coreImg5, bio: DEFAULT_BIO },
    { id: "c-6", nameParts: [{ bold: true, text: "Neha " }, { bold: false, text: "Arora" }], role: "Planning", image: coreImg6, bio: DEFAULT_BIO },
    { id: "c-7", nameParts: [{ bold: true, text: "Pallavi " }, { bold: false, text: "Agarwala" }], role: "Design", image: coreImg7, bio: DEFAULT_BIO },
    { id: "c-8", nameParts: [{ bold: true, text: "Puja " }, { bold: false, text: "Das" }], role: "Lab", image: coreImg8, bio: DEFAULT_BIO },
    { id: "c-9", nameParts: [{ bold: true, text: "Roopa " }, { bold: false, text: "Krishnamurthy" }], role: "Churumuri Hubba", image: coreImg9, bio: DEFAULT_BIO },
    { id: "c-10", nameParts: [{ bold: true, text: "Winnie " }, { bold: false, text: "Pande" }], role: "Writer / Editor (English)", image: coreImg10, bio: DEFAULT_BIO }
];

const CURATOR_MEMBERS = [
    { id: "cu-1", nameParts: [{ bold: true, text: "Abhijit " }, { bold: false, text: "Nath" }], role: "Kantha Hubba", image: curatorImg1, bio: DEFAULT_BIO },
    { id: "cu-2", nameParts: [{ bold: true, text: "Dipti " }, { bold: false, text: "Ramesh" }, { separator: true }, { bold: true, text: "Aditi " }, { bold: false, text: "Ravichandar" }], role: "Thindi Hubba", image: curatorImg2, bio: DEFAULT_BIO },
    { id: "cu-4", nameParts: [{ bold: true, text: "Bhawna " }, { bold: false, text: "Jaimini" }], role: "Makkala Hubba", image: curatorImg4, bio: DEFAULT_BIO },
    { id: "cu-5", nameParts: [{ bold: true, text: "Bindhumalini " }, { bold: false, text: "Narayanaswamy" }], role: "Swara Hubba", image: curatorImg5, bio: DEFAULT_BIO },
    { id: "cu-6", nameParts: [{ bold: true, text: "Kamini " }, { bold: false, text: "Sawhney" }], role: "Kala Hubba", image: curatorImg6, bio: DEFAULT_BIO },
    { id: "cu-7", nameParts: [{ bold: true, text: "Masoom " }, { bold: false, text: "Parmar" }], role: "Nrutya Hubba", image: curatorImg7, bio: DEFAULT_BIO },
    { id: "cu-8", nameParts: [{ bold: true, text: "Pravruth " }, { bold: false, text: "BH" }, { separator: true }, { bold: true, text: "Piyush " }, { bold: false, text: "Jain" }], role: "Sprentzo, Aata Hubba", image: curatorImg8, bio: DEFAULT_BIO },
    { id: "cu-9", nameParts: [{ bold: true, text: "Prateeti " }, { bold: false, text: "Punja Ballal" }], role: "Vishesha Hubba", image: curatorImg9, bio: DEFAULT_BIO },
    { id: "cu-10", nameParts: [{ bold: true, text: "Vivek " }, { bold: false, text: "Chand" }, { separator: true }, { bold: true, text: "Sahana " }, { bold: false, text: "Shivanand" }], role: "Rasthe Hubba", image: curatorImg10, bio: DEFAULT_BIO },
    { id: "cu-11", nameParts: [{ bold: true, text: "Vikram " }, { bold: false, text: "Phukan" }], role: "Nataka Hubba", image: curatorImg11, bio: DEFAULT_BIO },
    { id: "cu-12", nameParts: [{ bold: true, text: "Vishruti " }, { bold: false, text: "Bindal" }, { separator: true }, { bold: true, text: "Bharavi" }], role: "Offbeat @ Churumuri Hubba", image: curatorImg12, bio: DEFAULT_BIO },
    { id: "cu-3", nameParts: [{ bold: true, text: "Bangalore " }, { bold: false, text: "International Centre" }], role: "Samvada Hubba", image: curatorImg3, bio: DEFAULT_BIO }
];

const SUPPORTING_TEAM_COLUMNS = [
    [
        { id: "st-1", firstName: "Amrith", lastName: "Raghunathan", role: "Audio Tech" },
        { id: "st-2", firstName: "Anirudh", lastName: "Joshi", role: "Ideafueled" },
        { id: "st-3", firstName: "Anita", lastName: "Siddu Mane", role: "UI/UX Design" },
        { id: "st-4", firstName: "Aruna", lastName: "Keshav", role: "Kala Hubba" },
        { id: "st-5", firstName: "Diya", lastName: "Bagrecha", role: "Space and Experience Design" },
        { id: "st-6", firstName: "Gurupriya", lastName: "Atreya", role: "Swara Hubba" },
        { id: "st-7", firstName: "Ideafueled", lastName: "", role: "Technology Platform" }
    ],
    [
        { id: "st-8", firstName: "Ketaki", lastName: "Watve", role: "Social Media" },
        { id: "st-9", firstName: "Mahati", lastName: "", role: "Swara Hubba & Nrutya Hubba" },
        { id: "st-10", firstName: "Pierian", lastName: "Services", role: "Accounts & Payments" },
        { id: "st-11", firstName: "Pooja", lastName: "Sreenivasan", role: "Graphic Design" },
        { id: "st-12", firstName: "Puneet", lastName: "Chopra", role: "Ideafueled" },
        { id: "st-13", firstName: "Rishabh", lastName: "Loomba", role: "Ideafueled" },
        { id: "st-14", firstName: "Saikat", lastName: "Das", role: "Video Editing" }
    ],
    [
        { id: "st-15", firstName: "Sushmita", lastName: "Gangalapadu", role: "Makkala Hubba" },
        { id: "st-16", firstName: "Swaraj", lastName: "Vij", role: "Kala Hubba" },
        { id: "st-17", firstName: "Vaishali", lastName: "V", role: "Kala Hubba" },
        { id: "st-18", firstName: "Vaishnavi", lastName: "Kambadur", role: "Kala Hubba" },
        { id: "st-19", firstName: "Vikas", lastName: "Gotla", role: "Outreach" },
        { id: "st-20", firstName: "Yonitha", lastName: "N Jain", role: "(ARTMOS), Lights Engineering" }
    ]
];

const renderMemberName = (member) => {
    if (member.nameParts) {
        return (
            <span className="notranslate" translate="no">
                {member.nameParts.map((part, idx) => {
                    if (part.separator) {
                        return (
                            <span key={idx} className="name-separator">
                                |
                            </span>
                        );
                    }
                    return (
                        <span key={idx} className={part.bold ? "name-bold" : "name-light"}>
                            {part.text}
                        </span>
                    );
                })}
            </span>
        );
    }
    return (
        <span className="notranslate" translate="no">
            <span className="name-bold">{member.firstName}</span>
            {member.lastName && <span className="name-light"> {member.lastName}</span>}
        </span>
    );
};

export const OurTeamPage = () => {
    const { language, t } = useLanguage();
    const isKannada = language === "kn";
    const [activeTab, setActiveTab] = useState("LEADERSHIP");

    const getMembersForTab = () => {
        switch (activeTab) {
            case "LEADERSHIP":
                return LEADERSHIP_MEMBERS;
            case "CURATORS":
                return CURATOR_MEMBERS;
            case "CORE_TEAM":
                return CORE_TEAM_MEMBERS;
            case "SUPPORTING_TEAM":
                return [];
            default:
                return LEADERSHIP_MEMBERS;
        }
    };

    const currentMembers = getMembersForTab();
    const isLeadership = activeTab === "LEADERSHIP";
    const isCurators = activeTab === "CURATORS";
    const isSupporting = activeTab === "SUPPORTING_TEAM";

    return (
        <div className="our-team-page">
            {/* HERO BANNER SECTION (Frame 2537) */}
            <div className="our-team-hero-wrapper">
                <div className="our-team-hero-card">
                    <span className={`our-team-hero-eyebrow ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ನಮ್ಮ ತಂಡ" : "OUR TEAM"}
                    </span>
                    <h1 className={`our-team-hero-title ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ಹಬ್ಬ 4.0ಕ್ಕೆ ರೂಪ ನೀಡುತ್ತಿರುವವರು" : "The people behind Hubba 4.0"}
                    </h1>
                </div>
            </div>

            {/* TEAM CONTENT CONTAINER */}
            <div className="our-team-content-wrapper">
                {/* Horizontal Navigation Category Bar */}
                <div className="our-team-category-links-bar">
                    {TEAM_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`our-team-category-link ${activeTab === cat.id ? "active" : ""}`}
                            onClick={() => setActiveTab(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Team Content Render */}
                {isLeadership ? (
                    /* LEADERSHIP: 2-column 400px x 400px Cards (No Hover Effect) */
                    <div className="our-team-cards-grid">
                        {currentMembers.map((member) => (
                            <div key={member.id} className="team-card-container">
                                <img
                                    src={member.image}
                                    alt={`${member.firstName || ""} ${member.lastName || ""}`}
                                    className="team-card-img"
                                />
                            </div>
                        ))}
                    </div>
                ) : isCurators ? (
                    /* CURATORS: 3-column 400px x 398px Cards (image: 400px x 290px) */
                    <div className="curators-cards-grid">
                        {currentMembers.map((member) => (
                            <div key={member.id} className="curator-card">
                                <div className="curator-card-header">
                                    <h3 className="curator-card-name notranslate" translate="no">
                                        {renderMemberName(member)}
                                    </h3>
                                    <p className="curator-card-role notranslate" translate="no">{member.role}</p>
                                </div>
                                <div className="curator-card-media-wrapper">
                                    <img
                                        src={member.image}
                                        alt={`${member.firstName || ""} ${member.lastName || ""}`}
                                        className="curator-card-img"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isSupporting ? (
                    /* SUPPORTING TEAM: 3-column Directory (Frame 1000004280, 1000004282, 1000004259) */
                    <div className="supporting-team-grid">
                        {SUPPORTING_TEAM_COLUMNS.map((column, colIdx) => (
                            <div key={colIdx} className="supporting-team-column">
                                {column.map((item) => (
                                    <div key={item.id} className="supporting-team-row">
                                        <div className="supporting-team-name-role-group">
                                            <span className="supporting-team-name notranslate" translate="no">
                                                <strong className="supporting-name-bold">{item.firstName}</strong>
                                                {item.lastName && <span className="supporting-name-light"> {item.lastName}</span>}
                                            </span>
                                            <span className="supporting-team-role notranslate" translate="no">{item.role}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* CORE TEAM: 3-column 400px x 398px Cards */
                    <div className="core-team-cards-grid">
                        {currentMembers.map((member) => (
                            <div key={member.id} className="core-team-card">
                                <div className="core-team-card-header">
                                    <h3 className="core-team-card-name notranslate" translate="no">
                                        {renderMemberName(member)}
                                    </h3>
                                    <p className="core-team-card-role notranslate" translate="no">{member.role}</p>
                                </div>
                                <div className="core-team-card-media-wrapper">
                                    <img
                                        src={member.image}
                                        alt={`${member.firstName || ""} ${member.lastName || ""}`}
                                        className="core-team-card-img"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OurTeamPage;
