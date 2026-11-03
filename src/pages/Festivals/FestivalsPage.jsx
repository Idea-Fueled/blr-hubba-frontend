import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { MotionSection } from "../../components/AnimatedPage";
import { resolveSubfestivalImageUrl } from "../../utils/subfestivalImageResolver";
import { getSubfestivalName } from "../../utils/kannadaTranslations";
import { Loader } from "../../components/Loader/Loader";
import "./FestivalsPage.css";

const categoryTabs = [
    { id: "ALL", label: "ALL", labelKn: "ಎಲ್ಲಾ" },
    { id: "SHOWCASE", label: "SHOWCASE", labelKn: "ಶೋಕೇಸ್" },
    { id: "MARKET", label: "MARKET", labelKn: "ಮಾರ್ಕೆಟ್" },
    { id: "LAB", label: "LAB", labelKn: "ಲ್ಯಾಬ್" },
    { id: "ON WHEELS", label: "ON WHEELS", labelKn: "ಆನ್ ವೀಲ್ಸ್" }
];

export const FestivalsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const isKannada = language === "kn";
    const validTabIds = categoryTabs.map((t) => t.id);
    const paramCategory = (searchParams.get("category") || "").toUpperCase();
    const initialTab = validTabIds.includes(paramCategory) ? paramCategory : "ALL";
    const [activeTab, setActiveTab] = useState(initialTab);
    const [subfestivals, setSubfestivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/public/subfestivals`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch subfestivals");
                return res.json();
            })
            .then((data) => {
                const rawList = data?.data?.subfestivals || data?.subfestivals || data?.data || (Array.isArray(data) ? data : []);
                const apiList = Array.isArray(rawList) ? rawList : [];
                if (apiList && apiList.length > 0) {
                    const mapped = apiList.map((sf) => {
                        const cardImg = resolveSubfestivalImageUrl(sf);
                        const catUpper = (sf.category || "SHOWCASE").trim().toUpperCase();

                        return {
                            id: sf.id || sf.slug,
                            slug: sf.slug || sf.id,
                            name: sf.name,
                            nameKn: sf.nameKn,
                            img: cardImg,
                            category: catUpper,
                        };
                    });
                    setSubfestivals(mapped);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching subfestivals:", err);
                setLoading(false);
            });
    }, []);

    const filteredFestivals = subfestivals.filter((fest) => {
        if (activeTab === "ALL") return true;
        return fest.category === activeTab;
    });

    return (
        <div className="festivals-page">
            {/* HERO BANNER SECTION (Pixel-Perfect Figma Frame 2537) */}
            <div className="festivals-hero-wrapper">
                <MotionSection className="festivals-hero-card" variant="fadeIn">
                    <span className={`festivals-hero-subtitle ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "ಹಬ್ಬಗಳು" : "FESTIVAL OF FESTIVALS"}
                    </span>
                    <h1 className={`festivals-hero-title ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? "2027ರ ಹಬ್ಬದ ವಿಶೇಷಗಳಿಗಾಗಿ ಇಲ್ಲಿ ನೋಡಿ" : " Seventeen worlds. One big experience."}
                    </h1>
                </MotionSection>
            </div>

            {/* SUBFESTIVALS GRID & FILTER TABS SECTION */}
            <div className="festivals-content-wrapper">
                {/* FILTER TABS ROW */}
                <div className="festivals-filter-tabs">
                    {categoryTabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`festivals-filter-tab ${activeTab === tab.id ? "active" : ""} ${isKannada ? "kannada" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {isKannada ? tab.labelKn : tab.label}
                        </button>
                    ))}
                </div>

                {/* CARDS GRID / LOADER */}
                {loading ? (
                    <div style={{ padding: "60px 0" }}>
                        <Loader text={isKannada ? "ಹಬ್ಬಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading Festivals..."} />
                    </div>
                ) : filteredFestivals.length > 0 ? (
                    <div className="festivals-grid">
                        {filteredFestivals.map((fest) => (
                            <div
                                key={fest.id}
                                className="festivals-grid-card"
                                onClick={() => navigate(`/festivals/${fest.slug || fest.id}`)}
                            >
                                <img src={fest.img} alt={isKannada && fest.nameKn ? fest.nameKn : getSubfestivalName(fest.name, isKannada)} className="festivals-grid-card-img" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <p style={{ fontFamily: isKannada ? "Noto Sans Kannada, sans-serif" : "Roboto Condensed", fontSize: "18px", color: "#666" }}>
                            {isKannada ? "ಯಾವುದೇ ಹಬ್ಬಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : "No festivals found"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FestivalsPage;
