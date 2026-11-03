import React, { useState, useEffect } from "react";
import "./FaqPage.css";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CATEGORY_LABELS = {
    ABOUT_BLR: "ABOUT BLR HUBBA",
    VENUE: "VENUE & ACCESS",
    REGISTRATION: "REGISTRATION & PASSES",
    BOOKINGS: "BOOKINGS & CANCELLATIONS",
    EVENTS: "EVENTS"
};

const DEFAULT_CATEGORIES = [
    { id: "ABOUT_BLR", label: "ABOUT BLR HUBBA" }
];

export const FaqPage = () => {
    const { language } = useLanguage();
    const isKannada = language === "kn";
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [faqsData, setFaqsData] = useState({});
    const [activeCategory, setActiveCategory] = useState("ABOUT_BLR");
    const [openFaqId, setOpenFaqId] = useState(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/public/faqs`);
                if (!res.ok) {
                    setFaqsData({});
                    return;
                }
                const result = await res.json();
                const list = result.data || [];

                if (!Array.isArray(list) || list.length === 0) {
                    setFaqsData({});
                    setCategories(DEFAULT_CATEGORIES);
                    return;
                }

                // Group FAQs by category and then by groupTitle
                const grouped = {};
                const foundCategories = new Set();

                list.forEach((item) => {
                    const cat = item.category || "ABOUT_BLR";
                    const grp = item.groupTitle ? item.groupTitle.trim() : "";
                    foundCategories.add(cat);

                    if (!grouped[cat]) grouped[cat] = {};
                    if (!grouped[cat][grp]) grouped[cat][grp] = [];

                    grouped[cat][grp].push({
                        id: item.id,
                        question: item.question,
                        answer: item.answer,
                        displayOrder: item.displayOrder
                    });
                });

                const formatted = {};
                Object.keys(grouped).forEach((cat) => {
                    formatted[cat] = Object.keys(grouped[cat]).map((grpTitle) => ({
                        groupTitle: grpTitle,
                        items: grouped[cat][grpTitle]
                    }));
                });

                // Build category list: always ensure ABOUT_BLR is first, then any extra categories with FAQs
                const catArray = [{ id: "ABOUT_BLR", label: "ABOUT BLR HUBBA" }];
                foundCategories.forEach((catId) => {
                    if (catId !== "ABOUT_BLR") {
                        catArray.push({
                            id: catId,
                            label: CATEGORY_LABELS[catId] || catId.replace(/_/g, " ").toUpperCase()
                        });
                    }
                });

                setCategories(catArray);
                setFaqsData(formatted);
            } catch (err) {
                console.error("Failed to load FAQs:", err);
                setFaqsData({});
            }
        };

        fetchFaqs();
    }, []);

    const toggleFaq = (id) => {
        setOpenFaqId((prevId) => (prevId === id ? null : id));
    };

    const currentGroups = faqsData[activeCategory] || [];

    return (
        <main className="faq-page">
            {/* HERO BANNER SECTION (Frame 628749) */}
            <section className="faq-hero-wrapper">
                <div className="faq-hero-card">
                    <span className={`faq-hero-eyebrow ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ಪ್ರಶ್ನೋತ್ತರಗಳು" : "Frequently Asked Questions"}
                    </span>
                    <h1 className={`faq-hero-title ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ಹಬ್ಬಕ್ಕೆ ಹೊಸಬರೇ? ನಿಮ್ಮ ಪಯಣ ಇಲ್ಲಿಂದ ಆರಂಭವಾಗಲಿ!" : "New to the Hubba? Start here."}
                    </h1>
                </div>
            </section>

            {/* ================= FAQ CONTENT SECTION (Frame FAQ Desktop) ================= */}
            <section className="faq-content-wrapper">
                {/* Horizontal Category Nav Links (Frame Links) */}
                <div className="faq-category-links-bar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`faq-category-link ${activeCategory === cat.id ? "active" : ""}`}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setOpenFaqId(null);
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Groups Container */}
                <div className="faq-groups-container">
                    {currentGroups.map((group, groupIdx) => {
                        const titleToDisplay = group.groupTitle || (activeCategory === "ABOUT_BLR" ? "About BLR Hubba" : (CATEGORY_LABELS[activeCategory] || "About BLR Hubba"));
                        return (
                            <div key={groupIdx} className="faq-group">
                                <h2 className="faq-group-title">{titleToDisplay}</h2>
                                <div className="faq-list">
                                    {group.items.map((item) => {
                                        const isOpen = openFaqId === item.id;
                                        return (
                                            <div key={item.id} className={`faq-item ${isOpen ? "faq-item-expanded" : ""}`}>
                                                <div
                                                    className="faq-question-row"
                                                    onClick={() => toggleFaq(item.id)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            toggleFaq(item.id);
                                                        }
                                                    }}
                                                >
                                                    <div className={`faq-icon-wrapper ${isOpen ? "rotated" : ""}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                            <path d="M12 5V19M5 12H19" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    <span className="faq-question">{item.question}</span>
                                                </div>
                                                <div className={`faq-answer-wrapper ${isOpen ? "expanded" : ""}`}>
                                                    <div className="faq-answer-inner">
                                                        <p className="faq-answer">{item.answer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
};

export default FaqPage;
