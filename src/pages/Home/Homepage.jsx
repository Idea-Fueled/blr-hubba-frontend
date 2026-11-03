import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MotionSection, MotionCard, MotionMaskText, MotionButton, CountUpNumber, MotionImageReveal } from "../../components/AnimatedPage";
import "./Homepage.css";
import SpotlightEvents from "../../components/SpotlightEvents/SpotlightEvents";
import OurVenuesSection from "../../components/OurVenuesSection/OurVenuesSection";
import HomepageTicker from "../../components/HomepageTicker/HomepageTicker";
import EventListingSponsors from "../../components/EventListingSection/EventListingSponsors";
import FestivalsSection from "../../components/FestivalsSection/FestivalsSection";
import { useLanguage } from "../../context/LanguageContext";

// Hero assets
import homePageRightImg from "../../assets/home_page_right_image.png";
import homePageDownImg from "../../assets/home-page-down-img.png";
import mobilePhotoHp from "../../assets/mobile-photo-hp.png";

// Card thumbnails
import ourJourneyImg from "../../assets/hp-info-cards-images/image-1.png";
import festivalsHubbaImg from "../../assets/hp-info-cards-images/image-2.png";
import meetTheTeamImg from "../../assets/hp-info-cards-images/image-3.png";
import aboutUsVideoThumb from "../../assets/hp-about-image/image.png";
import aboutUsMobileImg from "../../assets/hp-about-image/image.png";
import calendarMobileImg from "../../assets/home-page-am-img.png";
import freePassImage from "../../assets/free-pass-image.png";
import donorPassImage from "../../assets/donor-pass-image.png";

// Sponsor Logos
import jswLogo from "../../assets/homepage-logo/jsw-logo.png";
import govtLogo from "../../assets/homepage-logo/govt-karnataka.png";
import manipalLogo from "../../assets/homepage-logo/manipal-logo.png";
import goNativeLogo from "../../assets/homepage-logo/go-native-logo.png";
import prestigeLogo from "../../assets/homepage-logo/prestige-logo.png";
import unboxingLogo from "../../assets/homepage-logo/unboxing-logo.png";
import sgmfLogo from "../../assets/homepage-logo/sgmf-logo.png";
import mspLogo from "../../assets/homepage-logo/msp-logo.png";
import bachpanLogo from "../../assets/homepage-logo/bachpan-manao-logo.png";

// Subfestival Cards
import aataImg from "../../assets/homepage-subfestivals/aata_hubba.png";
import churumuriImg from "../../assets/homepage-subfestivals/churumuri_hubba.png";
import kalaImg from "../../assets/homepage-subfestivals/kala_hubba.png";
import kalpaneImg from "../../assets/homepage-subfestivals/kalpane_hubba.png";
import kanthaImg from "../../assets/homepage-subfestivals/kantha_hubba.png";
import kriyaImg from "../../assets/homepage-subfestivals/kriya_hubba.png";
import makkalaImg from "../../assets/homepage-subfestivals/makkala_hubba.png";
import natakaImg from "../../assets/homepage-subfestivals/nataka_hubba.png";
import nrutyaImg from "../../assets/homepage-subfestivals/nrutya_hubba.png";
import rastheImg from "../../assets/homepage-subfestivals/rasthe_hubba.png";
import samvadaImg from "../../assets/homepage-subfestivals/samvada_hubba.png";
import santheImg from "../../assets/homepage-subfestivals/santhe_hubba.png";
import swaraImg from "../../assets/homepage-subfestivals/swara_hubba.png";
import thindiImg from "../../assets/homepage-subfestivals/thindi_hubba.png";
import udyanaImg from "../../assets/homepage-subfestivals/udyana_hubba.png";
import visheshaImg from "../../assets/homepage-subfestivals/vishesha_hubba.png";
import visitorsGuideImg from "../../assets/visitors-guide-img.png";

const subfestivalsList = [
    { id: "aata", name: "Aata Hubba", img: aataImg },
    { id: "churumuri", name: "Churumuri Hubba", img: churumuriImg },
    { id: "kala", name: "Kala Hubba", img: kalaImg },
    { id: "kalpane", name: "Kalpane Hubba", img: kalpaneImg },
    { id: "kantha", name: "Kantha Hubba", img: kanthaImg },
    { id: "kriya", name: "Kriya Hubba", img: kriyaImg },
    { id: "makkala", name: "Makkala Hubba", img: makkalaImg },
    { id: "nataka", name: "Nataka Hubba", img: natakaImg },
    { id: "nrutya", name: "Nrutya Hubba", img: nrutyaImg },
    { id: "rasthe", name: "Rasthe Hubba", img: rastheImg },
    { id: "samvada", name: "Samvada Hubba", img: samvadaImg },
    { id: "santhe", name: "Santhe Hubba", img: santheImg },
    { id: "swara", name: "Swara Hubba", img: swaraImg },
    { id: "thindi", name: "Thindi Hubba", img: thindiImg },
    { id: "udyana", name: "Udyana Hubba", img: udyanaImg },
    { id: "vishesha", name: "Vishesha Hubba", img: visheshaImg },
];

const subfestivalsLoopList = [...subfestivalsList, ...subfestivalsList, ...subfestivalsList, ...subfestivalsList];

const visitorGuidesList = [
    {
        id: "attendee",
        title: "Attendee Guide",
        desc: "Schedules, pass info, and festival FAQs to navigate the Hubba.",
        link: "/events"
    },
    {
        id: "bengaluru",
        title: "Bengaluru City Guide",
        desc: "Schedules, pass info, and festival FAQs to navigate the Hubba.",
        link: "/events"
    },
    {
        id: "maps",
        title: "Quick Access to Maps",
        desc: "Mobile-friendly venue maps for every Hubba location.",
        link: "/events"
    },
    {
        id: "safety",
        title: "Safety & Accessibility",
        desc: "Medical info, wheelchair access, and community guidelines.",
        link: "/events"
    }
];

export const Homepage = () => {
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const isKannada = language === "kn";
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [heroData, setHeroData] = useState(() => {
        const defaultState = {
            tagline: "SAVE THE DATE",
            taglineKn: "",
            title: "Bengaluru's Festival of Festivals Returns.",
            titleKn: "",
            description: "The fourth edition of BLR Hubba is here.",
            descriptionKn: "",
            dateText: "January 15 - 24, 2027",
            dateTextKn: "",
            btn1Text: "KNOW MORE",
            btn1TextKn: "",
            btn1Link: "/about-us",
            btn2Text: "FOLLOW US",
            btn2TextKn: "",
            btn2Link: "https://www.instagram.com/blrhubba",
            stat1Value: 350,
            stat1Label: "EVENTS",
            stat1LabelKn: "",
            stat2Value: 30,
            stat2Label: "VENUES",
            stat2LabelKn: "",
            stat3Value: 10,
            stat3Label: "DAYS",
            stat3LabelKn: "",
            heroImageUrl: null,
            heroImageUrls: []
        };
        try {
            const cached = localStorage.getItem("blr_hubba_hero_data");
            if (cached) {
                const parsed = JSON.parse(cached);
                return {
                    ...defaultState,
                    ...parsed,
                    heroImageUrls: Array.isArray(parsed.heroImageUrls) && parsed.heroImageUrls.length > 0
                        ? parsed.heroImageUrls
                        : (parsed.heroImageUrl ? [parsed.heroImageUrl] : [])
                };
            }
        } catch (e) {
            // Ignore localStorage parse errors
        }
        return defaultState;
    });

    useEffect(() => {
        const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
        fetch(`${apiUrl}/public/homepage-hero?_t=${Date.now()}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.success && res.data) {
                    const heroImages = Array.isArray(res.data.heroImageUrls) && res.data.heroImageUrls.length > 0
                        ? res.data.heroImageUrls.filter(Boolean)
                        : (res.data.heroImageUrl ? [res.data.heroImageUrl] : []);

                    const updatedData = {
                        ...res.data,
                        heroImageUrls: heroImages,
                        heroImageUrl: heroImages[0] || res.data.heroImageUrl || null
                    };
                    setHeroData((prev) => ({ ...prev, ...updatedData }));
                    try {
                        localStorage.setItem("blr_hubba_hero_data", JSON.stringify(updatedData));
                    } catch (e) { }

                    // Preload all hero images in browser cache for instant rendering & smooth dissolve
                    if (heroImages.length > 0) {
                        heroImages.forEach((src) => {
                            if (src) {
                                const img = new Image();
                                img.src = src;
                            }
                        });
                    }
                }
            })
            .catch((err) => console.error("Error loading homepage hero settings:", err));
    }, []);

    // Dynamic Hero Performer Images with 2-second Dissolve Crossfade
    const heroImagesList = (() => {
        if (Array.isArray(heroData.heroImageUrls) && heroData.heroImageUrls.length > 0) {
            return heroData.heroImageUrls.filter(Boolean);
        }
        if (heroData.heroImageUrl) {
            return [heroData.heroImageUrl];
        }
        return [homePageRightImg];
    })();

    const [activeHeroImageIdx, setActiveHeroImageIdx] = useState(0);
    const [heroAspectRatio, setHeroAspectRatio] = useState(2699 / 2848);

    useEffect(() => {
        const activeSrc = heroImagesList[activeHeroImageIdx % heroImagesList.length] || heroImagesList[0] || homePageRightImg;
        if (!activeSrc) return;

        const img = new Image();
        img.src = activeSrc;
        const updateRatio = () => {
            if (img.naturalWidth && img.naturalHeight) {
                setHeroAspectRatio(img.naturalWidth / img.naturalHeight);
            }
        };

        if (img.complete && img.naturalWidth && img.naturalHeight) {
            updateRatio();
        } else {
            img.onload = updateRatio;
        }
    }, [activeHeroImageIdx, heroImagesList]);

    useEffect(() => {
        if (heroImagesList.length <= 1) return;
        const timer = setInterval(() => {
            setActiveHeroImageIdx((prev) => (prev + 1) % heroImagesList.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [heroImagesList.length]);

    const handleHeroBtn1Click = () => {
        const link = heroData.btn1Link || "/about-us";
        if (link.startsWith("http://") || link.startsWith("https://")) {
            window.open(link, "_blank", "noopener,noreferrer");
        } else {
            navigate(link);
        }
    };

    const handleHeroBtn2Click = () => {
        const link = heroData.btn2Link || "https://www.instagram.com/blrhubba";
        if (link.startsWith("http://") || link.startsWith("https://")) {
            window.open(link, "_blank", "noopener,noreferrer");
        } else {
            navigate(link);
        }
    };

    return (
        <main className="hp-main">
            {/* ================= HERO SECTION ================= */}
            <section className="hp-hero-section">
                <div className="hp-hero-grid">

                    {/* LEFT DARK CARD */}
                    <div className="hp-hero-left">
                        <div>
                            {isKannada ? (
                                heroData.taglineKn && heroData.taglineKn.trim() ? (
                                    <MotionMaskText delay={0.05}>
                                        <span className="hp-save-date-label kannada">
                                            {heroData.taglineKn}
                                        </span>
                                    </MotionMaskText>
                                ) : null
                            ) : (
                                <MotionMaskText delay={0.05}>
                                    <span className="hp-save-date-label">
                                        {heroData.tagline || "SAVE THE DATE"}
                                    </span>
                                </MotionMaskText>
                            )}

                            {isKannada ? (
                                heroData.titleKn && heroData.titleKn.trim() ? (
                                    <MotionMaskText delay={0.12}>
                                        <h1 className="hp-hero-title kannada">
                                            {heroData.titleKn.includes("\n") ? (
                                                heroData.titleKn.split("\n").map((line, idx) => (
                                                    <span key={idx} className="hp-title-line">{line}</span>
                                                ))
                                            ) : (
                                                <span className="hp-title-line">{heroData.titleKn}</span>
                                            )}
                                        </h1>
                                    </MotionMaskText>
                                ) : null
                            ) : (
                                <MotionMaskText delay={0.12}>
                                    <h1 className="hp-hero-title">
                                        {(heroData.title || "Bengaluru's Festival of Festivals Returns.").replace(/\s*\(\s*Day\s*\d+\s*\)\s*/gi, '')}
                                    </h1>
                                </MotionMaskText>
                            )}

                            {isKannada ? (
                                <>
                                    {heroData.descriptionKn && heroData.descriptionKn.trim() ? (
                                        <MotionMaskText delay={0.2}>
                                            <p className="hp-hero-desc kannada" style={{ whiteSpace: "pre-line" }}>
                                                {heroData.descriptionKn}
                                            </p>
                                        </MotionMaskText>
                                    ) : null}
                                    {heroData.dateTextKn && heroData.dateTextKn.trim() ? (
                                        <MotionMaskText delay={0.28}>
                                            <p className="hp-hero-date">{heroData.dateTextKn}</p>
                                        </MotionMaskText>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    <MotionMaskText delay={0.2}>
                                        <p className="hp-hero-desc" style={{ whiteSpace: "pre-line" }}>
                                            {heroData.description || "The fourth edition of BLR Hubba is here."}
                                        </p>
                                    </MotionMaskText>

                                    <MotionMaskText delay={0.28}>
                                        <p className="hp-hero-date">{heroData.dateText || "January 15 - 24, 2027"}</p>
                                    </MotionMaskText>
                                </>
                            )}

                            <div className="hp-hero-btns">
                                {isKannada ? (
                                    <>
                                        {heroData.btn1TextKn && heroData.btn1TextKn.trim() ? (
                                            <MotionButton
                                                className="hp-btn-yellow kannada"
                                                onClick={handleHeroBtn1Click}
                                            >
                                                <span className="btn-text-primary">{heroData.btn1TextKn}</span>
                                                <span className="btn-text-secondary">{heroData.btn1TextKn}</span>
                                            </MotionButton>
                                        ) : null}
                                        {heroData.btn2TextKn && heroData.btn2TextKn.trim() ? (
                                            <MotionButton
                                                className="hp-btn-outline-white kannada"
                                                onClick={handleHeroBtn2Click}
                                            >
                                                <span className="btn-text-primary">{heroData.btn2TextKn}</span>
                                                <span className="btn-text-secondary">{heroData.btn2TextKn}</span>
                                            </MotionButton>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        <MotionButton
                                            className="hp-btn-yellow"
                                            onClick={handleHeroBtn1Click}
                                        >
                                            <span className="btn-text-primary">{heroData.btn1Text || "KNOW MORE"}</span>
                                            <span className="btn-text-secondary">{heroData.btn1Text || "KNOW MORE"}</span>
                                        </MotionButton>
                                        <MotionButton
                                            className="hp-btn-outline-white"
                                            onClick={handleHeroBtn2Click}
                                        >
                                            <span className="btn-text-primary">{heroData.btn2Text || "FOLLOW US"}</span>
                                            <span className="btn-text-secondary">{heroData.btn2Text || "FOLLOW US"}</span>
                                        </MotionButton>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="hp-hero-stats">
                            <div className="hp-stat">
                                <span className="hp-stat-number">
                                    <CountUpNumber value={Number(heroData.stat1Value) || 350} suffix="+" />
                                </span>
                                {isKannada ? (
                                    heroData.stat1LabelKn && heroData.stat1LabelKn.trim() ? (
                                        <span className="hp-stat-label kannada">{heroData.stat1LabelKn}</span>
                                    ) : null
                                ) : (
                                    <span className="hp-stat-label">{heroData.stat1Label || "Programs"}</span>
                                )}
                            </div>

                            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="70" viewBox="0 0 1 87" fill="none">
                                <path d="M0.5 87V0" stroke="#474747" />
                            </svg>

                            <div className="hp-stat">
                                <span className="hp-stat-number">
                                    <CountUpNumber value={Number(heroData.stat2Value) || 30} suffix="+" />
                                </span>
                                {isKannada ? (
                                    heroData.stat2LabelKn && heroData.stat2LabelKn.trim() ? (
                                        <span className="hp-stat-label kannada">{heroData.stat2LabelKn}</span>
                                    ) : null
                                ) : (
                                    <span className="hp-stat-label">{heroData.stat2Label || "Venues"}</span>
                                )}
                            </div>

                            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="70" viewBox="0 0 1 87" fill="none">
                                <path d="M0.5 87V0" stroke="#474747" />
                            </svg>

                            <div className="hp-stat">
                                <span className="hp-stat-number">
                                    <CountUpNumber value={Number(heroData.stat3Value) || 10} />
                                </span>
                                {isKannada ? (
                                    heroData.stat3LabelKn && heroData.stat3LabelKn.trim() ? (
                                        <span className="hp-stat-label kannada">{heroData.stat3LabelKn}</span>
                                    ) : null
                                ) : (
                                    <span className="hp-stat-label">{heroData.stat3Label || "Days"}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CENTER ROTATING BADGE OVERLAY */}
                    <div className="hp-hero-badge-overlay">
                        <div className="hp-badge-container">
                            <svg xmlns="http://www.w3.org/2000/svg" width="176" height="178" viewBox="0 0 176 178" fill="none" className="hp-badge-ring-svg">
                                <path d="M32.9476 27.5345L31.2374 29.0234L30.243 27.9081L31.8008 26.5519C32.0085 26.371 32.1523 26.1837 32.2321 25.9899C32.3126 25.7878 32.3288 25.5833 32.2808 25.3765C32.2372 25.1658 32.1269 24.9589 31.95 24.7556C31.746 24.5214 31.543 24.364 31.341 24.2836C31.1389 24.2032 30.936 24.1933 30.7325 24.254C30.5289 24.3147 30.3189 24.4393 30.1024 24.6278L29.0749 25.5223L34.6614 31.939L33.1169 33.2837L26.3935 25.5611L28.8859 23.3912C29.2925 23.0372 29.6955 22.764 30.0951 22.5715C30.4908 22.3746 30.8783 22.2664 31.2576 22.247C31.633 22.2231 31.9977 22.294 32.3517 22.4597C32.7019 22.621 33.0328 22.8806 33.3444 23.2385C33.6176 23.5523 33.805 23.9058 33.9065 24.2991C34.0042 24.6879 33.9844 25.0936 33.8472 25.516C33.7106 25.9302 33.4227 26.3401 32.9835 26.7458L32.9476 27.5345ZM35.8148 30.9348L33.7002 32.7758L33.2054 30.9225L34.6836 29.6356C34.9179 29.4317 35.0713 29.2242 35.1441 29.0133C35.2168 28.8024 35.2209 28.5929 35.1564 28.385C35.0963 28.1732 34.9816 27.97 34.8123 27.7756C34.6238 27.559 34.4312 27.4004 34.2347 27.2996C34.0343 27.1943 33.8272 27.1572 33.6132 27.188C33.3993 27.2189 33.1774 27.3344 32.9476 27.5345L31.5357 28.7637L30.5612 27.6311L32.3178 26.1017L33.0625 26.2342C33.484 25.8439 33.9018 25.6277 34.3159 25.5858C34.7305 25.5356 35.1184 25.6018 35.4795 25.7846C35.8451 25.9636 36.1606 26.2055 36.4261 26.5104C36.7531 26.8861 36.9826 27.2612 37.1145 27.6358C37.2464 28.0104 37.2829 28.3825 37.2241 28.7523C37.1698 29.1181 37.0239 29.486 36.7865 29.8558C36.5497 30.2173 36.2258 30.577 35.8148 30.9348ZM46.9187 20.4071L47.8415 21.8618L43.9525 24.3288L43.0297 22.8741L46.9187 20.4071ZM38.9872 15.3528L44.472 23.9992L42.7427 25.0962L37.258 16.4498L38.9872 15.3528ZM48.3366 9.7418L51.5103 8.35628C52.0097 8.13825 52.4797 8.0066 52.9202 7.96131C53.3661 7.91368 53.7761 7.95208 54.1501 8.07651C54.5271 8.19323 54.8655 8.39714 55.1652 8.68826C55.4626 8.97401 55.7121 9.34779 55.9137 9.80961C56.1364 10.3198 56.2496 10.7914 56.2533 11.2245C56.26 11.65 56.178 12.0406 56.0073 12.3964C55.8366 12.7523 55.5922 13.0859 55.2743 13.3974L54.849 14.005L52.2151 15.1549L51.5097 13.5831L53.3946 12.7603C53.6899 12.6313 53.9096 12.4683 54.0537 12.2711C54.1978 12.0739 54.2725 11.8496 54.2777 11.5979C54.2859 11.3386 54.2291 11.0693 54.1072 10.7901C53.9806 10.5001 53.826 10.2703 53.6432 10.1007C53.4635 9.92345 53.2524 9.82062 53.0099 9.79224C52.7727 9.76153 52.5037 9.81181 52.203 9.9431L50.9062 10.5093L54.3102 18.3064L52.4334 19.1258L48.3366 9.7418ZM57.073 17.1002L53.3737 13.7668L55.3481 12.8856L59.0481 16.1325L59.0868 16.2211L57.073 17.1002ZM76.9952 5.41681L77.2395 7.12204L72.6806 7.77535L72.4363 6.07011L76.9952 5.41681ZM72.3685 1.69367L73.8209 11.8294L71.7938 12.1199L70.3413 1.98417L72.3685 1.69367ZM77.8757 0.904475L79.3282 11.0402L77.301 11.3307L75.8485 1.19497L77.8757 0.904475ZM90.4428 0.259175L92.4812 0.311615L92.3078 7.0506C92.2875 7.84135 92.1151 8.5051 91.7906 9.04186C91.4722 9.57291 91.04 9.96915 90.494 10.2306C89.9539 10.4922 89.3412 10.6142 88.6558 10.5965C87.953 10.5784 87.3356 10.4248 86.8038 10.1357C86.2779 9.84664 85.8666 9.4287 85.57 8.88183C85.2794 8.32925 85.1443 7.65758 85.1647 6.86683L85.338 0.127848L87.3764 0.180288L87.2031 6.91927C87.1916 7.36443 87.2408 7.73203 87.3505 8.02206C87.4663 8.30638 87.6367 8.51884 87.8616 8.65944C88.0925 8.80019 88.3719 8.87478 88.6999 8.88322C89.0221 8.89151 89.2991 8.83123 89.531 8.70239C89.7629 8.57354 89.9411 8.37005 90.0654 8.0919C90.19 7.8079 90.258 7.44332 90.2694 6.99816L90.4428 0.259175ZM102.406 7.16659L100.179 6.74215L100.441 5.27113L102.47 5.65773C102.741 5.70928 102.977 5.70655 103.178 5.64956C103.387 5.5879 103.558 5.4743 103.691 5.30876C103.829 5.14432 103.924 4.92971 103.974 4.66494C104.033 4.35988 104.031 4.10306 103.969 3.89448C103.907 3.68589 103.79 3.52033 103.616 3.3978C103.443 3.27527 103.215 3.18714 102.933 3.13339L101.595 2.8784L100.002 11.2358L97.9907 10.8525L99.9073 0.794243L103.154 1.41281C103.683 1.51371 104.147 1.66175 104.545 1.85693C104.945 2.04635 105.269 2.28415 105.519 2.57031C105.77 2.85073 105.939 3.18129 106.028 3.56201C106.117 3.93697 106.118 4.35756 106.029 4.82378C105.951 5.23244 105.789 5.59821 105.542 5.92107C105.297 6.23817 104.966 6.47332 104.549 6.62651C104.139 6.77504 103.639 6.802 103.048 6.7074L102.406 7.16659ZM101.505 11.5221L98.7505 10.9973L99.9018 9.46302L101.827 9.82989C102.132 9.88801 102.39 9.88049 102.601 9.80733C102.812 9.73416 102.979 9.60795 103.102 9.42871C103.232 9.25056 103.321 9.03485 103.369 8.7816C103.423 8.49956 103.428 8.25014 103.386 8.03333C103.345 7.81077 103.246 7.62493 103.09 7.47581C102.933 7.3267 102.705 7.22362 102.406 7.16659L100.567 6.81618L100.855 5.35009L103.143 5.78605L103.499 6.45335C104.067 6.54356 104.495 6.73847 104.784 7.03807C105.079 7.33301 105.267 7.67892 105.347 8.07581C105.432 8.4738 105.437 8.87136 105.361 9.26852C105.268 9.75776 105.115 10.17 104.902 10.5052C104.689 10.8404 104.419 11.0991 104.092 11.2813C103.77 11.4647 103.391 11.5773 102.953 11.6192C102.523 11.6565 102.04 11.6241 101.505 11.5221ZM115.322 10.4417L113.192 9.66473L113.688 8.25502L115.628 8.96276C115.887 9.05712 116.12 9.09239 116.328 9.06857C116.544 9.04124 116.731 8.95657 116.889 8.81456C117.052 8.67455 117.18 8.47794 117.272 8.22472C117.379 7.93298 117.418 7.67921 117.391 7.46342C117.364 7.24764 117.274 7.06533 117.123 6.91651C116.971 6.76768 116.761 6.64408 116.491 6.5457L115.211 6.07889L112.296 14.0716L110.372 13.3699L113.88 3.75056L116.985 4.88294C117.492 5.06765 117.926 5.28834 118.287 5.545C118.651 5.79615 118.933 6.08302 119.133 6.4056C119.336 6.72268 119.45 7.07621 119.476 7.46621C119.504 7.85069 119.437 8.26588 119.275 8.71175C119.132 9.10258 118.913 9.43752 118.618 9.71657C118.325 9.99011 117.96 10.169 117.524 10.2532C117.096 10.3338 116.598 10.28 116.03 10.0918L115.322 10.4417ZM113.733 14.5957L111.099 13.635L112.481 12.3057L114.323 12.9773C114.615 13.0837 114.87 13.1178 115.09 13.0794C115.31 13.0411 115.495 12.9434 115.646 12.7864C115.802 12.6313 115.925 12.4327 116.013 12.1905C116.111 11.9208 116.157 11.6755 116.15 11.4548C116.146 11.2285 116.078 11.0292 115.948 10.8568C115.817 10.6845 115.609 10.5461 115.322 10.4417L113.564 9.80026L114.084 8.39958L116.272 9.19767L116.516 9.91351C117.062 10.0938 117.453 10.355 117.69 10.6971C117.934 11.0357 118.064 11.4073 118.078 11.8118C118.099 12.2183 118.039 12.6115 117.901 12.9913C117.73 13.4592 117.513 13.8414 117.249 14.138C116.985 14.4346 116.676 14.6466 116.324 14.7739C115.978 14.9032 115.585 14.9534 115.147 14.9244C114.716 14.892 114.244 14.7824 113.733 14.5957ZM129.475 12.6782L123.325 18.4911L121.527 17.4754L129.585 10.2673L130.764 10.9329L129.475 12.6782ZM127.389 20.7863L129.181 12.5019L130.014 10.5093L131.215 11.1879L129.187 21.8021L127.389 20.7863ZM129.314 17.5029L128.519 18.911L124.164 16.4516L124.96 15.0435L129.314 17.5029ZM145.811 32.8216L144.6 34.0469L139.83 29.3333L140.856 28.2955L145.534 28.0129C146.002 27.9811 146.397 27.927 146.72 27.8505C147.047 27.7781 147.316 27.6854 147.526 27.5723C147.741 27.4633 147.915 27.3421 148.046 27.2087C148.331 26.9212 148.49 26.6177 148.526 26.2985C148.569 25.9792 148.464 25.694 148.21 25.4427C147.985 25.2203 147.748 25.0891 147.499 25.0492C147.258 25.0092 147.014 25.0479 146.766 25.1654C146.523 25.2787 146.287 25.45 146.061 25.6792L144.598 24.2336C145.035 23.7918 145.528 23.4802 146.078 23.2988C146.636 23.1173 147.199 23.0933 147.768 23.2266C148.34 23.3641 148.879 23.682 149.383 24.1803C149.867 24.6581 150.193 25.1534 150.362 25.6661C150.534 26.183 150.548 26.6946 150.402 27.201C150.264 27.7073 149.973 28.1855 149.528 28.6356C149.281 28.8856 149.015 29.0882 148.73 29.2432C148.449 29.394 148.137 29.5098 147.793 29.5905C147.458 29.6713 147.09 29.7273 146.688 29.7587C146.286 29.7901 145.841 29.8114 145.352 29.8225L142.898 29.9428L145.811 32.8216ZM157.134 39.6428L155.673 40.7264C155.075 41.1696 154.509 41.4876 153.973 41.6804C153.441 41.8779 152.944 41.9654 152.483 41.943C152.025 41.9252 151.605 41.8063 151.223 41.5863C150.841 41.3662 150.505 41.0608 150.215 40.6702C149.925 40.2795 149.731 39.8695 149.631 39.44C149.532 39.0106 149.538 38.5717 149.651 38.1235C149.767 37.68 149.995 37.2301 150.335 36.7737C150.675 36.3174 151.144 35.8676 151.742 35.4244L153.203 34.3407C153.796 33.901 154.358 33.5824 154.89 33.3849C155.431 33.1886 155.931 33.1017 156.393 33.1242C156.855 33.1466 157.275 33.2655 157.653 33.4809C158.035 33.7009 158.371 34.0063 158.661 34.397C158.95 34.7876 159.145 35.1977 159.245 35.6271C159.344 36.0566 159.336 36.4931 159.22 36.9366C159.107 37.3848 158.879 37.8388 158.534 38.2987C158.194 38.755 157.727 39.2031 157.134 39.6428ZM154.314 39.1738L156.058 37.8808C156.397 37.6295 156.671 37.3896 156.881 37.1611C157.099 36.9338 157.255 36.7161 157.348 36.508C157.446 36.3046 157.485 36.1115 157.466 35.9285C157.455 35.7468 157.392 35.5783 157.277 35.423C157.162 35.2677 157.017 35.1561 156.843 35.0884C156.677 35.0219 156.482 35.0056 156.26 35.0395C156.037 35.0734 155.783 35.1594 155.499 35.2973C155.219 35.4317 154.91 35.6245 154.571 35.8758L152.827 37.1688C152.484 37.4236 152.204 37.667 151.99 37.899C151.775 38.131 151.617 38.3505 151.515 38.5573C151.421 38.7654 151.38 38.9603 151.391 39.142C151.41 39.3249 151.477 39.4941 151.592 39.6494C151.707 39.8047 151.848 39.9156 152.014 39.9822C152.184 40.0452 152.381 40.0598 152.604 40.0258C152.835 39.9931 153.091 39.9054 153.372 39.7628C153.656 39.6249 153.97 39.4286 154.314 39.1738ZM160.139 52.8967L158.614 53.6981L155.494 47.7619L156.786 47.0832L161.33 48.2296C161.785 48.341 162.179 48.409 162.509 48.4338C162.843 48.4637 163.127 48.4567 163.362 48.4126C163.6 48.3737 163.802 48.3107 163.968 48.2234C164.326 48.0354 164.57 47.7945 164.7 47.501C164.838 47.2099 164.824 46.9061 164.658 46.5897C164.511 46.3097 164.325 46.1129 164.1 45.9995C163.882 45.8886 163.638 45.8516 163.366 45.8886C163.099 45.9228 162.824 46.0149 162.538 46.1648L161.581 44.3442C162.131 44.0553 162.696 43.9076 163.275 43.9011C163.862 43.8971 164.406 44.0447 164.907 44.3438C165.412 44.6481 165.829 45.1141 166.158 45.7417C166.475 46.3433 166.635 46.914 166.641 47.4538C166.65 47.9988 166.508 48.4905 166.215 48.9289C165.93 49.3697 165.508 49.7373 164.948 50.0317C164.637 50.1953 164.322 50.3078 164.003 50.3693C163.69 50.428 163.357 50.4439 163.006 50.417C162.662 50.3925 162.294 50.3344 161.901 50.2427C161.509 50.1511 161.078 50.0366 160.609 49.8993L158.233 49.2712L160.139 52.8967ZM172.861 61.5602L171.729 61.9449L161.975 61.3524L161.28 59.3054L170.531 60.0871L169.007 55.6018L170.646 55.0445L172.861 61.5602ZM173.401 86.657L173.743 86.6646C174.294 86.6768 174.744 86.8598 175.094 87.2133C175.443 87.5669 175.611 88.0454 175.598 88.6488C175.585 89.2521 175.395 89.7226 175.03 90.0603C174.665 90.4038 174.207 90.5694 173.657 90.5572L173.314 90.5495C172.769 90.5374 172.325 90.3546 171.981 90.0012C171.637 89.6477 171.472 89.1664 171.486 88.5572C171.499 87.9597 171.685 87.4891 172.045 87.1454C172.404 86.8077 172.856 86.6448 173.401 86.657ZM172.223 117.927L162.664 114.256L163.398 112.344L172.957 116.015L172.223 117.927ZM166.911 119.672L165.303 119.054L166.752 115.28L168.361 115.898L166.911 119.672ZM170.792 121.652L169.176 121.031L170.789 116.83L172.406 117.451L170.792 121.652ZM157.612 129.217L156.112 128.371L158.474 124.183L159.974 125.03L157.612 129.217ZM167.094 129.743L158.176 124.712L159.182 122.928L168.1 127.959L167.094 129.743ZM161.786 130.835L160.293 129.993L162.34 126.364L163.832 127.206L161.786 130.835ZM165.043 133.379L163.535 132.528L165.884 128.364L167.392 129.214L165.043 133.379ZM152.55 138.333C152.698 138.449 152.846 138.535 152.995 138.593C153.143 138.65 153.304 138.668 153.477 138.648C153.646 138.632 153.837 138.573 154.051 138.473C154.265 138.38 154.511 138.238 154.788 138.046C155.226 137.727 155.639 137.467 156.028 137.266C156.414 137.07 156.786 136.942 157.146 136.882C157.507 136.83 157.861 136.855 158.207 136.955C158.553 137.056 158.903 137.246 159.257 137.524C159.594 137.789 159.853 138.094 160.037 138.439C160.22 138.784 160.322 139.152 160.344 139.541C160.366 139.939 160.31 140.338 160.174 140.738C160.034 141.143 159.814 141.537 159.514 141.919C159.076 142.476 158.589 142.877 158.055 143.12C157.525 143.367 156.985 143.456 156.435 143.389C155.884 143.321 155.365 143.095 154.877 142.711L156.143 141.102C156.364 141.275 156.597 141.392 156.841 141.45C157.091 141.512 157.334 141.502 157.57 141.419C157.811 141.34 158.033 141.172 158.236 140.914C158.428 140.67 158.537 140.436 158.565 140.211C158.597 139.99 158.564 139.786 158.466 139.597C158.373 139.412 158.241 139.252 158.071 139.118C157.937 139.013 157.797 138.94 157.651 138.9C157.5 138.863 157.337 138.862 157.162 138.895C156.991 138.933 156.799 139.001 156.586 139.102C156.373 139.211 156.134 139.354 155.867 139.532C155.438 139.851 155.028 140.102 154.637 140.287C154.246 140.471 153.867 140.583 153.5 140.623C153.135 140.671 152.776 140.634 152.423 140.514C152.072 140.401 151.719 140.206 151.364 139.927C151.009 139.648 150.741 139.336 150.557 138.991C150.371 138.65 150.273 138.286 150.264 137.899C150.252 137.517 150.321 137.12 150.472 136.71C150.625 136.308 150.86 135.904 151.179 135.499C151.461 135.14 151.791 134.825 152.167 134.554C152.54 134.289 152.941 134.101 153.371 133.991C153.8 133.881 154.245 133.874 154.707 133.969C155.169 134.064 155.624 134.287 156.071 134.638L154.794 136.262C154.559 136.077 154.335 135.945 154.121 135.867C153.907 135.788 153.703 135.762 153.511 135.789C153.314 135.821 153.125 135.9 152.944 136.026C152.76 136.157 152.582 136.33 152.412 136.547C152.209 136.805 152.092 137.044 152.06 137.265C152.028 137.486 152.058 137.684 152.15 137.861C152.246 138.042 152.38 138.199 152.55 138.333ZM149.48 152.928L142.522 145.415L144.018 144.03L150.976 151.542L149.48 152.928ZM147.442 154.815L146.266 153.545L151.805 148.415L152.981 149.685L147.442 154.815ZM140.655 160.436L134.724 152.09L136.4 150.899L142.332 159.245L140.655 160.436ZM127.833 159.504L129.602 167.117L127.69 168.125L125.759 157.568L127.08 156.871L127.833 159.504ZM133.31 165.161L128.051 159.409L126.272 157.297L127.617 156.588L135.231 164.148L133.31 165.161ZM117.197 170.177L117.065 161.716L119.029 161.076L118.9 171.887L117.613 172.307L117.197 170.177ZM112.628 163.162L117.525 170.08L118.432 172.04L117.12 172.467L110.664 163.802L112.628 163.162ZM113.748 166.799L113.247 165.262L118.002 163.712L118.503 165.25L113.748 166.799ZM100.063 167.903L99.7896 166.202L104.337 165.472L104.61 167.172L100.063 167.903ZM105.353 175.679L103.729 165.569L105.751 165.244L107.375 175.354L105.353 175.679ZM78.2212 171.647L78.2684 171.175C78.3459 170.4 78.5118 169.713 78.7659 169.114C79.0195 168.521 79.3431 168.023 79.7366 167.621C80.1237 167.224 80.5706 166.936 81.0772 166.757C81.5838 166.578 82.1287 166.517 82.7117 166.576C83.2948 166.634 83.8169 166.801 84.2781 167.077C84.7334 167.352 85.1174 167.723 85.4299 168.19C85.7418 168.663 85.9663 169.215 86.1034 169.847C86.234 170.484 86.2606 171.191 86.1831 171.966L86.1359 172.438C86.0584 173.214 85.8929 173.898 85.6393 174.491C85.3851 175.09 85.0586 175.587 84.6599 175.983C84.2605 176.385 83.8104 176.675 83.3096 176.855C82.8024 177.04 82.2602 177.103 81.683 177.046C81.1 176.988 80.5781 176.818 80.1175 176.536C79.6505 176.26 79.2639 175.885 78.9578 175.413C78.6511 174.947 78.4324 174.395 78.3018 173.758C78.1706 173.126 78.1437 172.423 78.2212 171.647ZM80.3061 171.379L80.2572 171.869C80.2047 172.393 80.2021 172.861 80.2494 173.272C80.2961 173.689 80.3902 174.043 80.5319 174.334C80.6672 174.63 80.8474 174.86 81.0724 175.024C81.2911 175.193 81.552 175.293 81.8552 175.323C82.1525 175.353 82.428 175.307 82.6816 175.185C82.9288 175.068 83.1509 174.878 83.348 174.615C83.5386 174.358 83.6981 174.029 83.8263 173.63C83.954 173.236 84.044 172.777 84.0965 172.252L84.1454 171.763C84.1978 171.238 84.2007 170.767 84.1541 170.35C84.1068 169.939 84.0126 169.585 83.8715 169.288C83.7304 168.992 83.5476 168.759 83.3231 168.589C83.0987 168.419 82.8378 168.32 82.5404 168.29C82.2372 168.26 81.9618 168.306 81.714 168.428C81.4662 168.55 81.2467 168.743 81.0555 169.007C80.8584 169.27 80.699 169.599 80.5772 169.993C80.4489 170.392 80.3586 170.854 80.3061 171.379ZM68.5989 174.992L71.2075 165.091L73.1878 165.612L70.5792 175.514L68.5989 174.992ZM66.2862 169.902L66.725 168.236L70.6346 169.266L70.1957 170.932L66.2862 169.902ZM64.7403 173.975L65.1814 172.301L69.533 173.448L69.0919 175.122L64.7403 173.975ZM47.9678 167.413L52.9453 158.465L54.7349 159.461L49.7574 168.409L47.9678 167.413ZM46.9865 161.909L47.8239 160.404L51.357 162.369L50.5196 163.874L46.9865 161.909ZM44.4808 165.473L45.3224 163.96L49.255 166.148L48.4133 167.661L44.4808 165.473ZM38.8411 151.366L39.889 149.999L43.7048 152.923L42.6569 154.291L38.8411 151.366ZM36.9948 160.681L43.2234 152.554L44.8488 153.8L38.6202 161.927L36.9948 160.681ZM36.6557 155.272L37.6982 153.912L41.0048 156.446L39.9623 157.806L36.6557 155.272ZM33.6813 158.142L34.7345 156.768L38.5294 159.676L37.4762 161.05L33.6813 158.142ZM30.5201 145.088C30.3849 145.218 30.2786 145.352 30.2012 145.492C30.1239 145.631 30.0835 145.788 30.08 145.962C30.0725 146.131 30.1038 146.329 30.1739 146.554C30.2357 146.779 30.3424 147.042 30.4939 147.344C30.7496 147.821 30.95 148.267 31.0951 148.68C31.2361 149.089 31.3113 149.475 31.3207 149.84C31.3217 150.205 31.2485 150.552 31.1011 150.88C30.9536 151.209 30.7173 151.529 30.3919 151.842C30.0835 152.138 29.7457 152.353 29.3783 152.487C29.011 152.621 28.6329 152.671 28.244 152.639C27.8468 152.606 27.4595 152.494 27.082 152.305C26.7005 152.111 26.3412 151.838 26.0043 151.488C25.513 150.976 25.1839 150.439 25.0169 149.877C24.8456 149.318 24.8317 148.771 24.9749 148.235C25.1182 147.699 25.4138 147.216 25.8616 146.785L27.2805 148.262C27.0778 148.457 26.9305 148.671 26.8388 148.906C26.7429 149.144 26.7195 149.386 26.7685 149.632C26.8132 149.881 26.9493 150.124 27.1766 150.361C27.3918 150.585 27.6086 150.726 27.8271 150.784C28.0414 150.846 28.2487 150.842 28.449 150.772C28.6451 150.705 28.8213 150.597 28.9776 150.446C29.1001 150.329 29.1918 150.2 29.2526 150.06C29.3093 149.916 29.3332 149.755 29.3243 149.577C29.3112 149.403 29.2696 149.203 29.1995 148.978C29.1211 148.752 29.0123 148.495 28.873 148.207C28.6171 147.737 28.4249 147.296 28.2963 146.884C28.1678 146.471 28.1092 146.08 28.1207 145.711C28.1239 145.343 28.2096 144.992 28.3778 144.66C28.5378 144.327 28.7804 144.005 29.1057 143.692C29.431 143.38 29.7773 143.156 30.1447 143.023C30.5079 142.885 30.8818 142.839 31.2663 142.884C31.6468 142.924 32.0297 143.048 32.4151 143.254C32.7923 143.461 33.1595 143.75 33.5168 144.122C33.8334 144.451 34.0996 144.821 34.3152 145.232C34.5268 145.638 34.6572 146.061 34.7064 146.501C34.7557 146.942 34.7013 147.384 34.5433 147.828C34.3853 148.273 34.1013 148.692 33.6915 149.086L32.2604 147.596C32.4759 147.389 32.6374 147.185 32.745 146.984C32.8526 146.784 32.9062 146.586 32.906 146.391C32.9016 146.192 32.8496 145.994 32.7499 145.797C32.6462 145.596 32.4989 145.397 32.3081 145.198C32.0807 144.961 31.8599 144.812 31.6457 144.75C31.4314 144.687 31.2304 144.69 31.0426 144.756C30.8506 144.827 30.6764 144.938 30.5201 145.088ZM16.4889 140.012L24.8995 134.172L26.0624 135.847L17.6518 141.687L16.4889 140.012ZM14.9048 137.73L16.327 136.743L20.633 142.944L19.2108 143.932L14.9048 137.73ZM10.2854 130.218L19.3814 125.516L20.3258 127.343L11.2297 132.045L10.2854 130.218ZM13.0115 117.649L5.22538 118.323L4.49756 116.287L15.2221 115.869L15.7251 117.276L13.0115 117.649ZM6.63663 122.27L13.0748 117.878L15.4174 116.415L15.9292 117.847L7.3674 124.315L6.63663 122.27ZM3.9444 105.628L12.3414 106.678L12.701 108.712L2.0137 107.076L1.77806 105.743L3.9444 105.628ZM11.5289 102.082L3.99542 105.967L1.92801 106.591L1.68779 105.232L11.1694 100.048L11.5289 102.082ZM7.77067 102.684L9.36316 102.402L10.2338 107.327L8.6413 107.609L7.77067 102.684ZM8.57883 88.9809L10.3011 88.9456L10.3955 93.5501L8.67319 93.5854L8.57883 88.9809ZM0.145774 93.1448L10.3829 92.935L10.4248 94.9824L0.187732 95.1922L0.145774 93.1448ZM8.28878 78.5761C8.10289 78.5516 7.93137 78.5526 7.7742 78.5792C7.61703 78.6057 7.46941 78.6719 7.33133 78.7778C7.19401 78.8779 7.05927 79.0256 6.92712 79.221C6.78993 79.4097 6.65088 79.6573 6.50997 79.9638C6.29654 80.4616 6.07373 80.8962 5.84153 81.2675C5.6101 81.6329 5.35477 81.9331 5.07554 82.1682C4.79127 82.3966 4.47476 82.5558 4.12602 82.6457C3.77727 82.7357 3.37925 82.7511 2.93196 82.6921C2.5079 82.6362 2.12904 82.5064 1.79538 82.3028C1.46172 82.0992 1.18625 81.8353 0.968972 81.5112C0.74665 81.1804 0.591838 80.8083 0.504534 80.3949C0.417997 79.9757 0.406533 79.525 0.470142 79.0429C0.562874 78.34 0.776951 77.7477 1.11237 77.2659C1.44199 76.7834 1.86084 76.4308 2.36892 76.2083C2.87701 75.9857 3.43893 75.915 4.05469 75.9963L3.78684 78.0265C3.508 77.9898 3.24841 78.0087 3.00807 78.0834C2.76191 78.1573 2.55823 78.29 2.39704 78.4815C2.23003 78.6722 2.12507 78.9302 2.08215 79.2555C2.04153 79.5634 2.06667 79.8209 2.15756 80.0279C2.24264 80.2342 2.37528 80.3935 2.55549 80.5059C2.72988 80.6176 2.92454 80.6876 3.13948 80.7159C3.30794 80.7382 3.46571 80.7294 3.61279 80.6897C3.76064 80.6442 3.90147 80.5623 4.03527 80.4441C4.16327 80.325 4.29335 80.1678 4.4255 79.9725C4.55261 79.7706 4.68547 79.5251 4.82407 79.2361C5.03093 78.7433 5.2555 78.3178 5.49778 77.9597C5.74006 77.6016 6.00876 77.312 6.30389 77.0909C6.59397 76.8632 6.92133 76.7113 7.28597 76.6353C7.64556 76.5528 8.04901 76.541 8.4963 76.6C8.9436 76.659 9.33408 76.7903 9.66774 76.9939C10.0022 77.1917 10.2718 77.4548 10.4767 77.7832C10.6824 78.1059 10.8248 78.4822 10.904 78.9123C10.9782 79.3358 10.9815 79.8031 10.9141 80.3143C10.8543 80.7674 10.7314 81.2063 10.5453 81.6309C10.3601 82.0497 10.1108 82.4158 9.79762 82.7291C9.48443 83.0424 9.10491 83.276 8.65907 83.4299C8.21323 83.5839 7.70857 83.6237 7.14509 83.5494L7.41524 81.5017C7.7115 81.5408 7.97169 81.5396 8.19583 81.4983C8.41996 81.4569 8.60802 81.3753 8.76002 81.2536C8.91279 81.126 9.03492 80.9618 9.12641 80.7611C9.21866 80.5546 9.2828 80.3148 9.31882 80.0418C9.36174 79.7165 9.34065 79.4507 9.25557 79.2445C9.17049 79.0382 9.04328 78.8825 8.87393 78.7775C8.69876 78.6716 8.50372 78.6045 8.28878 78.5761ZM11.6881 52.912L11.3844 52.7531C10.8963 52.4979 10.574 52.1343 10.4175 51.6623C10.261 51.1903 10.3226 50.6869 10.6023 50.1521C10.882 49.6173 11.2603 49.2796 11.7373 49.1389C12.2169 48.993 12.7008 49.0477 13.1888 49.3029L13.4926 49.4618C13.9754 49.7143 14.2925 50.0752 14.4439 50.5445C14.5952 51.0138 14.5296 51.5184 14.2472 52.0584C13.9702 52.588 13.5945 52.9271 13.1201 53.0757C12.6483 53.2191 12.171 53.1645 11.6881 52.912Z" fill="black" />
                            </svg>

                            {/* Stationary Inner Yellow Circle with Centered Hubba '3' Logo */}
                            <div className="hp-badge-center-disc">
                                <svg xmlns="http://www.w3.org/2000/svg" width="58" height="68" viewBox="0 0 58 68" fill="none">
                                    <path d="M54.5221 36.5683H54.5311C52.9357 34.422 50.796 32.0295 48.1165 30.9156C49.2484 30.3905 50.2876 29.6681 51.2251 28.747C52.1581 27.8215 52.9596 26.7862 53.6294 25.6352C54.2993 24.4886 54.8002 23.3035 55.1351 22.0842C55.4656 20.8695 55.636 19.665 55.636 18.4859V17.9697C55.636 12.5113 54.0242 8.15051 50.8035 4.89475C47.5782 1.64197 43.2062 0.0133493 37.6888 0.0133493H29.0957L29.0912 0H0V11.9046H0.0299046V18.2026H12.0306V11.9046H29.0912L29.0957 11.9239H35.3084C39.7373 11.9239 43.3273 14.8786 43.3273 19.134C43.3273 23.3895 39.7373 26.5741 35.3084 26.5741H27.8935V36.5668H30.9139L36.5704 36.6365C41.9083 36.6365 46.2355 40.929 46.2355 46.2243C46.2355 47.1261 46.0965 47.9923 45.8617 48.8185C45.8288 48.9416 45.7914 49.0603 45.7541 49.1804C45.7122 49.308 45.6748 49.437 45.6285 49.5616C44.8689 51.6886 43.3946 53.4225 41.4971 54.403C41.385 54.4638 41.2669 54.5172 41.1517 54.5706C41.0994 54.5943 41.0486 54.6195 40.9962 54.6418C40.8213 54.7189 40.6434 54.7871 40.4609 54.8509C40.4535 54.8539 40.446 54.8554 40.44 54.8583C40.2516 54.9236 40.0587 54.9814 39.8643 55.0304C39.8404 55.0363 39.8165 55.0423 39.7911 55.0482C39.67 55.0778 39.5504 55.112 39.4262 55.1357C39.3679 55.1461 39.3096 55.152 39.2513 55.1624C39.2035 55.1713 39.1541 55.1772 39.1063 55.1846C38.9866 55.2024 38.867 55.2188 38.7459 55.2291C38.4663 55.2588 38.1837 55.2796 37.8951 55.2796L37.9161 55.2573C35.416 55.2039 33.082 53.8616 31.8185 51.6382L31.814 51.6411L31.7886 51.6026C31.3879 50.993 31.0141 50.3655 30.6687 49.7233L30.6791 49.7188C27.7694 43.5203 21.2084 39.8596 14.3557 40.6012C10.0868 41.0655 6.25754 43.1495 3.56912 46.4705C0.897138 49.7693 -0.32297 53.8957 0.118123 58.0992H0.113638C0.115133 58.1156 0.119618 58.1319 0.121114 58.1467C0.121114 58.1601 0.121114 58.1734 0.124104 58.1882H0.12859C0.563702 61.9379 2.32508 65.4191 5.10173 68L13.3105 59.3081C12.8186 58.8513 12.2086 58.0562 12.059 56.8607C11.9514 55.8002 12.2579 54.7589 12.9308 53.9268C13.6111 53.0858 14.58 52.5578 15.661 52.4421C17.3865 52.2478 19.0448 53.1733 19.7849 54.7308L20.5804 56.1206L21.3639 57.4896L21.3594 57.4926C24.8059 63.5547 31.2309 67.1768 38.0626 67.1768C38.1433 67.1768 38.2241 67.1723 38.3048 67.1709C38.3407 67.1709 38.3751 67.1679 38.411 67.1679C38.6024 67.1649 38.7938 67.162 38.9852 67.1531C49.5475 66.7971 58 58.1971 58 47.6334C58 43.5218 56.7126 39.7128 54.5236 36.5683H54.5221Z" fill="black" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT IMAGE CARD */}
                    <div
                        className="hp-hero-right"
                        style={heroAspectRatio ? { aspectRatio: `${heroAspectRatio}` } : {}}
                    >
                        {heroImagesList.length <= 1 ? (
                            <MotionImageReveal
                                src={heroImagesList[0] || homePageRightImg}
                                alt="BLR Hubba 2027 performer"
                                className="hp-hero-image"
                            />
                        ) : (
                            <div className="hp-hero-carousel-container">
                                {heroImagesList.map((imgSrc, idx) => (
                                    <img
                                        key={`${imgSrc}-${idx}`}
                                        src={imgSrc}
                                        alt={`BLR Hubba 2027 performer ${idx + 1}`}
                                        className={`hp-hero-image hp-hero-carousel-slide ${idx === (activeHeroImageIdx % heroImagesList.length) ? "active" : ""}`}
                                        onLoad={(e) => {
                                            if (idx === (activeHeroImageIdx % heroImagesList.length) && e.target.naturalWidth && e.target.naturalHeight) {
                                                setHeroAspectRatio(e.target.naturalWidth / e.target.naturalHeight);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ================= THREE ACTION CARDS ================= */}
            <MotionSection className="hp-info-cards-section">
                <div className="hp-info-cards-grid">
                    {/* Card 1: GET READY FOR BLR HUBBA */}
                    <MotionCard className="hp-info-card" index={0} whileHover={false} onClick={() => navigate("/faqs")} style={{ cursor: "pointer" }}>
                        <div className="hp-info-card-left">
                            <img
                                src={ourJourneyImg}
                                alt="Get Ready For BLR Hubba"
                                className="hp-info-card-img"
                            />
                        </div>
                        <div className="hp-info-card-body">
                            <span className={`hp-info-card-label ${isKannada ? "kannada" : ""}`}>
                                {isKannada ? "ಬೆಂಗಳೂರು ಹಬ್ಬಕ್ಕೆ ಸಜ್ಜಾಗಿ!" : "GET READY FOR BLR HUBBA"}
                            </span>
                            <p className={`hp-info-card-text ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? "ಹಬ್ಬ 4.0 ತೆರೆದಿದೆ! ನಿಮಗಾಗಿ ಕಾಯ್ದಿರುವ ವಿಶೇಷತೆಗಳನ್ನು ನೋಡಿಕೊಳ್ಳಿ"
                                    : "See what's in store for you, as we roll out Hubba 4.0"}
                            </p>
                        </div>
                        <button className="hp-info-card-arrow" aria-label="Go to FAQs" onClick={(e) => { e.stopPropagation(); navigate("/faqs"); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                <path d="M11.4417 6.20437L1.91599 15L0 13.2339L9.33368 4.48072C5.76468 5.2635 3.4396 4.55398 0.534307 2.63753L2.66736 0C5.68536 2.94216 10.1727 3.05784 13.6165 0.55527L15.5951 2.32519C12.8818 5.45244 13.0613 9.67866 16 12.6208L13.245 14.4177C11.2872 12 10.6235 9.31234 11.4375 6.20051L11.4417 6.20437Z" fill="currentColor" />
                            </svg>
                        </button>
                    </MotionCard>

                    {/* Card 2: FESTIVALS OF THE HUBBA */}
                    <MotionCard className="hp-info-card" index={1} whileHover={false} onClick={() => navigate("/festivals")} style={{ cursor: "pointer" }}>
                        <div className="hp-info-card-left">
                            <img
                                src={festivalsHubbaImg}
                                alt="Festivals of the Hubba"
                                className="hp-info-card-img"
                            />
                        </div>
                        <div className="hp-info-card-body">
                            <span className={`hp-info-card-label ${isKannada ? "kannada" : ""}`}>
                                {isKannada ? "ಹಬ್ಬಗಳ ಹಬ್ಬ" : "FESTIVALS OF THE HUBBA"}
                            </span>
                            <p className={`hp-info-card-text ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? "ಬೆಂಗಳೂರು ಹಬ್ಬವನ್ನು ರೂಪಿಸುವ, ವೈವಿಧ್ಯಮಯ ಅನುಭವಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸುವ ಹಲವು ಹಬ್ಬಗಳನ್ನು ಪರಿಚಯಿಸಿಕೊಳ್ಳಿ."
                                    : "Explore the many festivals that make BLR Hubba"}
                            </p>
                        </div>
                        <button className="hp-info-card-arrow" aria-label="Explore festivals of the hubba" onClick={(e) => { e.stopPropagation(); navigate("/festivals"); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                <path d="M11.4417 6.20437L1.91599 15L0 13.2339L9.33368 4.48072C5.76468 5.2635 3.4396 4.55398 0.534307 2.63753L2.66736 0C5.68536 2.94216 10.1727 3.05784 13.6165 0.55527L15.5951 2.32519C12.8818 5.45244 13.0613 9.67866 16 12.6208L13.245 14.4177C11.2872 12 10.6235 9.31234 11.4375 6.20051L11.4417 6.20437Z" fill="currentColor" />
                            </svg>
                        </button>
                    </MotionCard>

                    {/* Card 3: MEET THE TEAM */}
                    <MotionCard className="hp-info-card" index={2} whileHover={false} onClick={() => navigate("/our-team")} style={{ cursor: "pointer" }}>
                        <div className="hp-info-card-left">
                            <img
                                src={meetTheTeamImg}
                                alt="Meet the Team"
                                className="hp-info-card-img"
                            />
                        </div>
                        <div className="hp-info-card-body">
                            <span className={`hp-info-card-label ${isKannada ? "kannada" : ""}`}>
                                {isKannada ? "ನಮ್ಮ ತಂಡ" : "MEET THE TEAM"}
                            </span>
                            <p className={`hp-info-card-text ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? "ಬೆಂಗಳೂರು ಹಬ್ಬದ ಹಿಂದಿರುವ ಜೀವಗಳನ್ನು, ಹಾಗೆಯೇ ಈ ಆವೃತ್ತಿಯನ್ನು ರೂಪಿಸುತ್ತಿರುವ ತಂಡವನ್ನು ಪರಿಚಯಿಸಿಕೊಳ್ಳಿ."
                                    : "Meet the people shaping the Hubba's fourth edition"}
                            </p>
                        </div>
                        <button className="hp-info-card-arrow" aria-label="Meet the team" onClick={(e) => { e.stopPropagation(); navigate("/our-team"); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                <path d="M11.4417 6.20437L1.91599 15L0 13.2339L9.33368 4.48072C5.76468 5.2635 3.4396 4.55398 0.534307 2.63753L2.66736 0C5.68536 2.94216 10.1727 3.05784 13.6165 0.55527L15.5951 2.32519C12.8818 5.45244 13.0613 9.67866 16 12.6208L13.245 14.4177C11.2872 12 10.6235 9.31234 11.4375 6.20051L11.4417 6.20437Z" fill="currentColor" />
                            </svg>
                        </button>
                    </MotionCard>
                </div>
            </MotionSection>

            {/* ================= SPONSORS & PARTNERS TICKER ================= */}
            <HomepageTicker />

            {/* ================= SPOTLIGHT EVENTS ================= */}
            <SpotlightEvents isHomepage={true} />

            {/* ================= OUR FESTIVALS SECTION ================= */}
            <FestivalsSection subtitle="OUR FESTIVALS" />

            {/* ================= ABOUT US SECTION ================= */}
            <MotionSection className="hp-about-section" variant="clipReveal">
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

                    {/* Right Column: Frame 2423 (About Us Card) */}
                    <div className="hp-about-info-card">
                        <span className={`hp-about-subtitle ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಹಬ್ಬದ ಬಗ್ಗೆ" : "ABOUT US"}
                        </span>
                        <h2 className={`hp-about-title ${isKannada ? "kannada" : ""}`}>
                            {isKannada
                                ? "ಒಂದು ನಗರ. ಹತ್ತು ದಿನ. ನೂರಾರು ಅನುಭವಗಳು. ಕೊನೆಯಿಲ್ಲದ ಸಂಭ್ರಮ."
                                : "One city. Ten days. Hundreds of experiences. Endless celebration."}
                        </h2>
                        <p className={`hp-about-desc ${isKannada ? "kannada" : ""}`}>
                            {isKannada
                                ? "ಬೆಂಗಳೂರು ಹಬ್ಬವು ನಗರದ ಸೃಜನಶೀಲ ಮತ್ತು ಬೌದ್ಧಿಕ ಚೈತನ್ಯವನ್ನು ಸಂಭ್ರಮಿಸುವ ಪ್ರಮುಖ ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿ ಉತ್ಸವವಾಗಿದೆ. 2023ರಿಂದ ಈ ಉತ್ಸವವು ನೂರಾರು ಕಲಾವಿದರು, ಕಲಾ  ಪ್ರದರ್ಶಕರು ಮತ್ತು ಸೃಜನಶೀಲರನ್ನು ಒಂದೆಡೆ ಸೇರಿಸಿ, ಸ್ಥಳೀಯ ಪ್ರತಿಭೆ ಮತ್ತು ಜಾಗತಿಕ ಸೊಗಡಿನ ವಿಶಿಷ್ಟ ಸಂಗಮವನ್ನು ಪರಿಚಯಿಸುತ್ತಿದೆ. 2027ರ ಜನವರಿ 15ರಿಂದ 24ರವರೆಗೆ, ಉತ್ಸವವು ತನ್ನ ನಾಲ್ಕನೇ ಆವೃತ್ತಿಯೊಂದಿಗೆ ಮತ್ತೆ ಬೆಂಗಳೂರಿಗೆ ಮರಳುತ್ತಿದೆ."
                                : "BLR Hubba is Bengaluru's annual arts and culture festival, celebrating the city's creative and intellectual pulse. Bringing together artists, performers, communities, and audiences from across the city, the festival returns for its fourth edition from 15–24 January 2027, with events across art, music, theatre, food, dance, and more. Anchored by UnboxingBLR."}
                        </p>
                        <MotionButton className={`hp-about-btn ${isKannada ? "kannada" : ""}`} onClick={() => navigate("/about-us")}>
                            <span className="btn-text-primary">{isKannada ? "ಮತ್ತಷ್ಟು ತಿಳಿಯಿರಿ" : "KNOW MORE"}</span>
                            <span className="btn-text-secondary">{isKannada ? "ಮತ್ತಷ್ಟು ತಿಳಿಯಿರಿ" : "KNOW MORE"}</span>
                        </MotionButton>
                    </div>
                </div>
            </MotionSection>

            {/* ================= EVENT CALENDAR SECTION ================= */}
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

                    {/* ================= OUR VENUES SECTION ================= */}
                    <OurVenuesSection />

                    {/* ================= FRIENDS OF HUBBA SECTION ================= */}
                    <MotionSection className="hp-friends-section" variant="slideRight">
                        <div className="hp-friends-grid">
                            <div className="hp-friends-image-col">
                                <img
                                    src={homePageDownImg}
                                    alt="Help make the Hubba happen"
                                    className="hp-friends-img hp-friends-desktop-img-view"
                                />
                                <img
                                    src={mobilePhotoHp}
                                    alt="Help make the Hubba happen"
                                    className="hp-friends-img hp-friends-mobile-img-view"
                                />
                            </div>
                            <div className="hp-friends-card">
                                <span className="hp-friends-subtitle">FRIENDS OF HUBBA</span>
                                <h2 className="hp-friends-title">Help make the Hubba happen</h2>
                                <p className="hp-friends-desc">
                                    Keep the city's culture alive! Pitch in to cover festival costs and score a permanent spot on our page (and heart). Every bit counts and helps us create more spaces for artists, audiences, and the city to come together.
                                </p>
                                {/* Desktop button */}
                                <MotionButton className="hp-friends-btn hp-friends-desktop-btn" onClick={() => navigate("/events")}>
                                    <span className="btn-text-primary">KNOW MORE</span>
                                    <span className="btn-text-secondary">KNOW MORE</span>
                                </MotionButton>

                                {/* Mobile buttons */}
                                <div className="hp-friends-mobile-actions">
                                    <MotionButton className="hp-friends-btn-explore" onClick={() => navigate("/events")}>
                                        <span className="btn-text-primary">EXPLORE EVENTS</span>
                                        <span className="btn-text-secondary">EXPLORE EVENTS</span>
                                    </MotionButton>
                                    <MotionButton className="hp-friends-btn-know" onClick={() => navigate("/events")}>
                                        <span className="btn-text-primary">KNOW MORE</span>
                                        <span className="btn-text-secondary">KNOW MORE</span>
                                    </MotionButton>
                                </div>
                            </div>
                        </div>
                    </MotionSection>

                    {/* ================= VISITOR GUIDES SECTION ================= */}
                    <MotionSection className="hp-visitor-guides-section" variant="slideUp">
                        <div className="hp-visitor-guides-container">
                            <div className="hp-visitor-guides-header">
                                <span className="hp-visitor-guides-subtitle">VISITOR GUIDES</span>
                                <h2 className="hp-visitor-guides-title">
                                    Everything you need to find your way <br className="hp-visitor-desktop-br" />around the Hubba
                                </h2>
                            </div>

                            <div className="hp-visitor-guides-grid">
                                {visitorGuidesList.map((guide, idx) => (
                                    <MotionCard className="hp-visitor-guide-card" key={guide.id} index={idx}>
                                        <div className="hp-visitor-guide-img-box">
                                            <img src={visitorsGuideImg} alt={guide.title} className="hp-visitor-guide-img" />
                                        </div>
                                        <div className="hp-visitor-guide-info">
                                            <h3 className="hp-visitor-guide-card-title">{guide.title}</h3>
                                            <p className="hp-visitor-guide-card-desc">{guide.desc}</p>
                                            <div className="hp-visitor-guide-action" onClick={() => navigate(guide.link)}>
                                                <span>KNOW MORE</span>
                                                <div className="hp-visitor-guide-arrow-circle">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                        <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </MotionCard>
                                ))}
                            </div>
                        </div>
                    </MotionSection>

                    {/* ================= OUR PASSES SECTION ================= */}
                    <MotionSection className="hp-passes-section" variant="scaleUp">
                        <div className="hp-passes-container">
                            <div className="hp-passes-header-row">
                                <div className="hp-passes-header-left">
                                    <span className="hp-passes-subtitle">OUR PASSES</span>
                                    <h2 className="hp-passes-title">
                                        Booking information, entry details, and <br className="hp-passes-desktop-br" />queue guidelines
                                    </h2>
                                </div>
                                <MotionButton className="hp-passes-explore-btn" onClick={() => navigate("/events")}>
                                    <span className="btn-text-primary">EXPLORE EVENTS</span>
                                    <span className="btn-text-secondary">EXPLORE EVENTS</span>
                                </MotionButton>
                            </div>

                            <div className="hp-passes-grid">
                                {/* Card 1: FREE PASS */}
                                <div className="hp-pass-card hp-pass-free" onClick={() => navigate("/events")} style={{ cursor: "pointer" }}>
                                    <div className="hp-pass-header-bg hp-pass-bg-free">
                                        <img src={freePassImage} alt="Free Pass" className="hp-pass-header-img" />
                                    </div>
                                    <div className="hp-pass-body">
                                        <div className="hp-pass-top">
                                            <div className="hp-pass-title-group">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="37" height="27" viewBox="0 0 37 27" fill="none">
                                                    <path d="M35.7803 9.76855V15.0127L35.7158 15.0117H35.6914V15.0107H35.6699C33.9589 15.0119 32.5773 16.4174 32.5771 18.1338C32.5771 19.8504 33.9606 21.2578 35.6729 21.2578H35.6914L35.7051 21.2568C35.7074 21.2567 35.711 21.2562 35.7227 21.2559L35.7217 21.2549H35.7803V26.5H4.79492V21.2559L4.85938 21.2568L4.86914 21.2578H4.8877C6.59656 21.254 7.97559 19.849 7.97559 18.1338C7.9754 16.4187 6.59638 15.0148 4.8877 15.0107H4.87109C4.86584 15.0109 4.86359 15.0117 4.86133 15.0117H4.79492V9.76855H35.7803ZM35.6533 21.4268L35.2236 21.3652C33.6631 21.1441 32.4502 19.7819 32.4502 18.1338C32.4504 16.4859 33.6631 15.1238 35.2236 14.9023L35.6533 14.8418V9.9082H4.92188V14.8418L5.34961 14.9053C6.90065 15.135 8.10237 16.4927 8.10254 18.1338C8.10254 19.7751 6.90013 21.1335 5.34863 21.3633L4.92188 21.4258V26.3604H35.6533V21.4268Z" fill="black" stroke="black" />
                                                    <path d="M28.0986 10.757C28.0847 10.757 28.0707 10.7564 28.0568 10.755C28.0433 10.7536 28.0295 10.7516 28.016 10.7487C28.0024 10.7462 27.9889 10.7425 27.9757 10.7385C27.9627 10.7345 27.9495 10.7296 27.9368 10.7245C27.9241 10.7191 27.9114 10.7131 27.8996 10.7066C27.8872 10.7 27.8753 10.6929 27.8638 10.6852C27.8522 10.6775 27.8412 10.6689 27.8305 10.6601C27.8198 10.6513 27.8094 10.6419 27.7995 10.6319C27.7899 10.6222 27.7803 10.6117 27.7716 10.6008C27.7629 10.59 27.7547 10.5786 27.7471 10.5669C27.7395 10.5555 27.7324 10.5433 27.7259 10.531C27.7195 10.5188 27.7135 10.506 27.7082 10.4931C27.7028 10.4803 27.6983 10.4672 27.6941 10.4538C27.6902 10.4404 27.6868 10.4268 27.684 10.4134C27.6814 10.3994 27.6792 10.3857 27.6778 10.3718C27.6766 10.3578 27.6758 10.3436 27.6758 10.3296C27.6758 10.3156 27.6766 10.3017 27.6778 10.2877C27.6792 10.2737 27.6814 10.2598 27.684 10.2461C27.6868 10.2327 27.6902 10.219 27.6941 10.2057C27.6983 10.1923 27.7028 10.1792 27.7082 10.1663C27.7135 10.1535 27.7195 10.1407 27.7259 10.1284C27.7324 10.1162 27.7395 10.1039 27.7471 10.0925C27.7547 10.0809 27.7629 10.0695 27.7716 10.0586C27.7803 10.0478 27.7899 10.0375 27.7995 10.0276C27.8094 10.0176 27.8198 10.0082 27.8305 9.99936C27.8412 9.99053 27.8522 9.98227 27.8638 9.97429C27.8753 9.9666 27.8872 9.95947 27.8996 9.95292C27.9114 9.94637 27.9241 9.94038 27.9368 9.93497C27.9495 9.92984 27.9627 9.925 27.9757 9.92101C27.9889 9.91702 28.0024 9.9136 28.016 9.91075C28.0295 9.9079 28.0433 9.90591 28.0568 9.90448C28.0845 9.90163 28.1126 9.90163 28.14 9.90448C28.1538 9.90591 28.1676 9.9079 28.1811 9.91075C28.1947 9.9136 28.2082 9.91702 28.2214 9.92101C28.2344 9.925 28.2476 9.92984 28.2603 9.93497C28.273 9.94038 28.2854 9.94637 28.2975 9.95292C28.3099 9.95947 28.3218 9.9666 28.3333 9.97429C28.3446 9.98227 28.3559 9.99053 28.3666 9.99936C28.3773 10.0082 28.3877 10.0176 28.3976 10.0276C28.4762 10.1071 28.5213 10.2173 28.5213 10.3296C28.5213 10.3436 28.5205 10.3578 28.5191 10.3718C28.5179 10.3857 28.5157 10.3994 28.5132 10.4134C28.5103 10.4268 28.5069 10.4404 28.503 10.4538C28.4988 10.4672 28.4943 10.4803 28.4889 10.4931C28.4836 10.506 28.4776 10.5188 28.4712 10.531C28.4647 10.5433 28.4576 10.5555 28.45 10.5669C28.4424 10.5786 28.4342 10.59 28.4255 10.6008C28.4168 10.6117 28.4072 10.6222 28.3976 10.6319C28.3877 10.6419 28.3773 10.6513 28.3666 10.6601C28.3559 10.6689 28.3446 10.6775 28.3333 10.6852C28.3218 10.6929 28.3099 10.7 28.2975 10.7066C28.2854 10.7131 28.273 10.7191 28.2603 10.7245C28.2476 10.7296 28.2344 10.7345 28.2214 10.7385C28.2082 10.7425 28.1947 10.7462 28.1811 10.7487C28.1676 10.7516 28.1538 10.7536 28.14 10.755C28.1265 10.7564 28.1124 10.757 28.0986 10.757Z" fill="black" />
                                                    <path d="M27.6758 11.9787C27.6758 11.9306 27.6837 11.8844 27.698 11.8414C27.6837 11.7981 27.6758 11.7519 27.6758 11.7038C27.6758 11.4678 27.8649 11.2764 28.0986 11.2764C28.3319 11.2764 28.5213 11.4678 28.5213 11.7038C28.5213 11.7519 28.5134 11.7981 28.4991 11.8414C28.5134 11.8844 28.5213 11.9306 28.5213 11.9787C28.5213 12.2146 28.3319 12.4061 28.0986 12.4061C27.8649 12.4061 27.6758 12.2146 27.6758 11.9787Z" fill="black" />
                                                    <path d="M27.6758 26.27C27.6758 26.2219 27.6837 26.1757 27.698 26.1324C27.6837 26.0894 27.6758 26.0432 27.6758 25.9951C27.6758 25.7591 27.8652 25.5677 28.0986 25.5677C28.3319 25.5677 28.5213 25.7591 28.5213 25.9951C28.5213 26.0432 28.5134 26.0894 28.4991 26.1324C28.5134 26.1757 28.5213 26.2219 28.5213 26.27C28.5213 26.5059 28.3319 26.6974 28.0986 26.6974C27.8652 26.6974 27.6758 26.5059 27.6758 26.27ZM27.6758 24.6208C27.6758 24.5975 27.6778 24.5747 27.6811 24.5522C27.6778 24.53 27.6758 24.5069 27.6758 24.4835C27.6758 24.4354 27.6837 24.3892 27.698 24.3462C27.6837 24.3029 27.6758 24.2567 27.6758 24.2088C27.6758 23.9726 27.8652 23.7812 28.0986 23.7812C28.3319 23.7812 28.5213 23.9726 28.5213 24.2088C28.5213 24.2567 28.5134 24.3029 28.4991 24.3462C28.5134 24.3892 28.5213 24.4354 28.5213 24.4835C28.5213 24.5069 28.5194 24.53 28.516 24.5522C28.5194 24.5747 28.5213 24.5975 28.5213 24.6208C28.5213 24.8571 28.3319 25.0482 28.0986 25.0482C27.8652 25.0482 27.6758 24.8571 27.6758 24.6208ZM27.6758 22.8346C27.6758 22.811 27.6778 22.7882 27.6811 22.7657C27.6778 22.7434 27.6758 22.7204 27.6758 22.697C27.6758 22.6491 27.6837 22.6027 27.698 22.5597C27.6837 22.5166 27.6758 22.4702 27.6758 22.4223C27.6758 22.1861 27.8652 21.9949 28.0986 21.9949C28.3319 21.9949 28.5213 22.1861 28.5213 22.4223C28.5213 22.4702 28.5134 22.5166 28.4991 22.5597C28.5134 22.6027 28.5213 22.6491 28.5213 22.697C28.5213 22.7204 28.5194 22.7434 28.516 22.7657C28.5194 22.7882 28.5213 22.811 28.5213 22.8346C28.5213 23.0705 28.3319 23.262 28.0986 23.262C27.8652 23.262 27.6758 23.0705 27.6758 22.8346ZM27.6758 21.0481C27.6758 21.0248 27.6778 21.0017 27.6811 20.9794C27.6778 20.9569 27.6758 20.9341 27.6758 20.9108C27.6758 20.8626 27.6837 20.8165 27.698 20.7732C27.6837 20.7301 27.6758 20.684 27.6758 20.6358C27.6758 20.3999 27.8652 20.2084 28.0986 20.2084C28.3319 20.2084 28.5213 20.3999 28.5213 20.6358C28.5213 20.684 28.5134 20.7301 28.4991 20.7732C28.5134 20.8165 28.5213 20.8626 28.5213 20.9108C28.5213 20.9341 28.5194 20.9569 28.516 20.9794C28.5194 21.0017 28.5213 21.0248 28.5213 21.0481C28.5213 21.284 28.3319 21.4755 28.0986 21.4755C27.8652 21.4755 27.6758 21.284 27.6758 21.0481ZM27.6758 19.2616C27.6758 19.2382 27.6778 19.2155 27.6811 19.1929C27.6778 19.1707 27.6758 19.1476 27.6758 19.1243C27.6758 19.0761 27.6837 19.03 27.698 18.9869C27.6837 18.9436 27.6758 18.8975 27.6758 18.8493C27.6758 18.6134 27.8652 18.4219 28.0986 18.4219C28.3319 18.4219 28.5213 18.6134 28.5213 18.8493C28.5213 18.8975 28.5134 18.9436 28.4991 18.9869C28.5134 19.03 28.5213 19.0761 28.5213 19.1243C28.5213 19.1476 28.5194 19.1707 28.516 19.1929C28.5194 19.2155 28.5213 19.2382 28.5213 19.2616C28.5213 19.4978 28.3319 19.689 28.0986 19.689C27.8652 19.689 27.6758 19.4978 27.6758 19.2616ZM27.6758 17.4751C27.6758 17.4517 27.6778 17.4289 27.6811 17.4064C27.6778 17.3842 27.6758 17.3611 27.6758 17.3378C27.6758 17.2896 27.6837 17.2435 27.698 17.2004C27.6837 17.1574 27.6758 17.111 27.6758 17.0631C27.6758 16.8269 27.8652 16.6354 28.0986 16.6354C28.3319 16.6354 28.5213 16.8269 28.5213 17.0631C28.5213 17.111 28.5134 17.1574 28.4991 17.2004C28.5134 17.2435 28.5213 17.2896 28.5213 17.3378C28.5213 17.3611 28.5194 17.3842 28.516 17.4064C28.5194 17.4289 28.5213 17.4517 28.5213 17.4751C28.5213 17.7113 28.3319 17.9025 28.0986 17.9025C27.8652 17.9025 27.6758 17.7113 27.6758 17.4751ZM27.6758 15.6889C27.6758 15.6652 27.6778 15.6424 27.6811 15.6199C27.6778 15.5977 27.6758 15.5746 27.6758 15.5513C27.6758 15.5034 27.6837 15.4569 27.698 15.4139C27.6837 15.3709 27.6758 15.3247 27.6758 15.2766C27.6758 15.0404 27.8652 14.8492 28.0986 14.8492C28.3319 14.8492 28.5213 15.0404 28.5213 15.2766C28.5213 15.3247 28.5134 15.3709 28.4991 15.4139C28.5134 15.4569 28.5213 15.5034 28.5213 15.5513C28.5213 15.5746 28.5194 15.5977 28.516 15.6199C28.5194 15.6424 28.5213 15.6652 28.5213 15.6889C28.5213 15.9248 28.3319 16.1163 28.0986 16.1163C27.8652 16.1163 27.6758 15.9248 27.6758 15.6889ZM27.6758 13.9024C27.6758 13.879 27.6778 13.8559 27.6811 13.8337C27.6778 13.8112 27.6758 13.7884 27.6758 13.765C27.6758 13.7169 27.6837 13.6707 27.698 13.6274C27.6837 13.5844 27.6758 13.5382 27.6758 13.4901C27.6758 13.2542 27.8652 13.0627 28.0986 13.0627C28.3319 13.0627 28.5213 13.2542 28.5213 13.4901C28.5213 13.5382 28.5134 13.5844 28.4991 13.6274C28.5134 13.6707 28.5213 13.7169 28.5213 13.765C28.5213 13.7884 28.5194 13.8112 28.516 13.8337C28.5194 13.8559 28.5213 13.879 28.5213 13.9024C28.5213 14.1383 28.3319 14.3298 28.0986 14.3298C27.8652 14.3298 27.6758 14.1383 27.6758 13.9024ZM27.6758 12.1159C27.6758 11.8799 27.8652 11.6885 28.0986 11.6885C28.3319 11.6885 28.5213 11.8799 28.5213 12.1159C28.5213 12.3521 28.3319 12.5433 28.0986 12.5433C27.8652 12.5433 27.6758 12.3521 27.6758 12.1159Z" fill="black" />
                                                    <path d="M28.0986 26.8352C28.0847 26.8352 28.0707 26.8346 28.0568 26.8332C28.0433 26.8318 28.0295 26.8295 28.016 26.8269C28.0024 26.8241 27.9889 26.8207 27.9757 26.8167C27.9627 26.8124 27.9495 26.8078 27.9368 26.8024C27.9241 26.797 27.9114 26.791 27.8993 26.7848C27.8872 26.7782 27.8753 26.7708 27.8638 26.7631C27.8525 26.7554 27.8412 26.7471 27.8305 26.7383C27.8198 26.7295 27.8094 26.7198 27.7995 26.7101C27.7899 26.7001 27.7803 26.6896 27.7716 26.6788C27.7629 26.6679 27.7547 26.6565 27.7471 26.6451C27.7395 26.6335 27.7324 26.6215 27.7259 26.6092C27.7195 26.597 27.7135 26.5842 27.7082 26.5713C27.7028 26.5585 27.6983 26.5451 27.6941 26.532C27.6902 26.5186 27.6868 26.505 27.684 26.4913C27.6814 26.4776 27.6792 26.4636 27.6778 26.45C27.6766 26.436 27.6758 26.4218 27.6758 26.4078C27.6758 26.3938 27.6766 26.3796 27.6778 26.3659C27.6792 26.3519 27.6814 26.338 27.684 26.3243C27.6868 26.3106 27.6902 26.297 27.6941 26.2838C27.6983 26.2705 27.7028 26.2571 27.7082 26.2442C27.7135 26.2314 27.7195 26.2189 27.7259 26.2066C27.7324 26.1941 27.7395 26.1821 27.7471 26.1704C27.7547 26.159 27.7629 26.1477 27.7716 26.1368C27.7803 26.126 27.7899 26.1155 27.7995 26.1055C27.8094 26.0958 27.8198 26.0861 27.8305 26.0773C27.8412 26.0684 27.8525 26.0602 27.8638 26.0525C27.8753 26.0448 27.8872 26.0377 27.8993 26.0311C27.9114 26.0246 27.9241 26.0186 27.9368 26.0132C27.9495 26.0078 27.9627 26.0032 27.9757 25.9989C27.9889 25.9949 28.0024 25.9915 28.016 25.9887C28.0295 25.9861 28.0433 25.9838 28.0568 25.9824C28.0845 25.9798 28.1126 25.9798 28.14 25.9824C28.1538 25.9838 28.1676 25.9861 28.1811 25.9887C28.1947 25.9915 28.2082 25.9949 28.2214 25.9989C28.2344 26.0032 28.2476 26.0078 28.2603 26.0132C28.273 26.0186 28.2854 26.0246 28.2975 26.0311C28.3099 26.0377 28.3218 26.0448 28.3333 26.0525C28.3446 26.0602 28.3559 26.0684 28.3666 26.0773C28.3773 26.0861 28.3877 26.0958 28.3976 26.1055C28.4072 26.1155 28.4165 26.126 28.4255 26.1368C28.4342 26.1477 28.4424 26.159 28.45 26.1704C28.4576 26.1821 28.4647 26.1941 28.4712 26.2066C28.4776 26.2189 28.4836 26.2314 28.4889 26.2442C28.4943 26.2571 28.4988 26.2705 28.503 26.2838C28.5069 26.297 28.5103 26.3106 28.5132 26.3243C28.5157 26.338 28.5179 26.3519 28.5194 26.3659C28.5205 26.3796 28.5213 26.3938 28.5213 26.4078C28.5213 26.4218 28.5205 26.436 28.5194 26.45C28.5179 26.4636 28.5157 26.4776 28.5132 26.4913C28.5103 26.505 28.5069 26.5186 28.503 26.532C28.4988 26.5451 28.4943 26.5585 28.4889 26.5713C28.4836 26.5842 28.4776 26.597 28.4712 26.6092C28.4647 26.6215 28.4576 26.6335 28.45 26.6451C28.4424 26.6565 28.4342 26.6679 28.4255 26.6788C28.4165 26.6896 28.4072 26.7001 28.3976 26.7101C28.3877 26.7198 28.3773 26.7295 28.3666 26.7383C28.3559 26.7471 28.3446 26.7554 28.3333 26.7631C28.3218 26.7708 28.3099 26.7782 28.2975 26.7848C28.2854 26.791 28.273 26.797 28.2603 26.8024C28.2476 26.8078 28.2344 26.8124 28.2214 26.8167C28.2082 26.8207 28.1947 26.8241 28.1811 26.8269C28.1676 26.8295 28.1538 26.8318 28.14 26.8332C28.1265 26.8346 28.1124 26.8352 28.0986 26.8352Z" fill="black" />
                                                    <path d="M30.501 0.508789C30.5153 0.517502 30.5267 0.532409 30.5312 0.550781V0.551758L31.7754 5.49707C31.7802 5.51629 31.7761 5.53712 31.7656 5.55469C31.7557 5.57041 31.7423 5.5804 31.7275 5.58398L31.7227 5.58496C31.7212 5.58532 31.7199 5.5857 31.7188 5.58594L31.7119 5.58789L31.7051 5.58887L31.6943 5.5918L31.6836 5.59375C30.3916 5.92718 29.4609 7.05196 29.3623 8.3877C29.3592 8.43044 29.3244 8.45344 29.2939 8.45117C29.2638 8.44853 29.2322 8.42043 29.2354 8.37695C29.3274 7.12819 30.111 6.06288 31.2285 5.60059L31.6279 5.43555L31.5225 5.0166L30.5479 1.14062L30.4248 0.65332L29.9385 0.77832L1.1582 8.17676L0.647461 8.30859L0.805664 8.81152L3.87598 18.5527C3.88583 18.584 3.87501 18.6139 3.85547 18.6309L3.83398 18.6426C3.82667 18.6448 3.82081 18.6455 3.81641 18.6455C3.79259 18.6455 3.76564 18.6295 3.75586 18.5986L0.503906 8.28027C0.497761 8.26026 0.49968 8.23942 0.508789 8.22266L0.509766 8.22168C0.51893 8.20506 0.53379 8.19358 0.549805 8.18945L30.4561 0.501953C30.4706 0.498236 30.4868 0.500289 30.501 0.508789Z" fill="black" stroke="black" />
                                                    <path d="M24.149 8.43515C24.1431 8.41151 24.1392 8.38814 24.1372 8.36449C24.1279 8.34312 24.12 8.32061 24.1141 8.29696C24.102 8.24853 24.0986 8.20009 24.1028 8.15279C24.0769 8.11375 24.0569 8.0693 24.0447 8.02087C23.9873 7.79207 24.1239 7.55957 24.3503 7.50144C24.5766 7.44303 24.8066 7.58151 24.8641 7.8103C24.8762 7.85846 24.8799 7.90718 24.8756 7.95419C24.9016 7.99351 24.9216 8.03796 24.9337 8.0864C24.9396 8.10977 24.9433 8.13341 24.9453 8.15678C24.9548 8.17843 24.9624 8.20094 24.9684 8.22431C25.0259 8.4531 24.8892 8.68589 24.6628 8.74402C24.6279 8.75285 24.5929 8.75712 24.5583 8.75712C24.3694 8.75712 24.1975 8.62862 24.149 8.43515ZM23.6975 6.6401C23.6916 6.61645 23.6876 6.59309 23.6857 6.56944C23.6764 6.54807 23.6685 6.52556 23.6626 6.50219C23.6504 6.45376 23.6471 6.40503 23.6513 6.35802C23.6254 6.3187 23.6053 6.27425 23.5932 6.22581C23.5357 5.9973 23.6724 5.76451 23.8988 5.70639C24.1251 5.64826 24.3551 5.78645 24.4126 6.01525C24.425 6.06369 24.4283 6.11241 24.4241 6.15942C24.45 6.19875 24.4701 6.24291 24.4822 6.29135C24.4881 6.315 24.4918 6.33836 24.4937 6.36201C24.503 6.38338 24.5109 6.40589 24.5168 6.42954C24.5743 6.65834 24.4376 6.89084 24.2113 6.94896C24.1764 6.95808 24.1414 6.96236 24.1068 6.96236C23.9182 6.96236 23.746 6.83357 23.6975 6.6401ZM23.246 4.84533C23.2401 4.82168 23.2361 4.79803 23.2342 4.77467C23.2249 4.7533 23.217 4.73079 23.211 4.70714C23.1989 4.6587 23.1955 4.61026 23.1998 4.56297C23.1738 4.52365 23.1538 4.47948 23.1417 4.43104C23.0842 4.20225 23.2209 3.96974 23.4472 3.91133C23.6736 3.85321 23.9035 3.99168 23.961 4.22048C23.9734 4.26892 23.9768 4.31736 23.9726 4.36437C23.9985 4.40369 24.0183 4.44814 24.0307 4.49658C24.0366 4.51994 24.0402 4.54359 24.0422 4.56696C24.0515 4.58833 24.0594 4.61112 24.0653 4.63448C24.1228 4.86328 23.9861 5.09607 23.7598 5.15419C23.7249 5.16303 23.6899 5.1673 23.6552 5.1673C23.4664 5.1673 23.2945 5.0388 23.246 4.84533ZM22.7945 3.05028C22.7367 2.82148 22.8737 2.58898 23.0997 2.53085C23.3263 2.47273 23.5563 2.61092 23.6138 2.83971C23.6713 3.06851 23.5346 3.30101 23.3083 3.35914C23.2733 3.36826 23.2381 3.37253 23.2037 3.37253C23.0149 3.37253 22.843 3.24374 22.7945 3.05028Z" fill="black" />
                                                    <path d="M18.5957 15.9912C18.7296 16.4032 19.1138 16.6825 19.5469 16.6826H23.0938L20.2246 18.7676C19.8742 19.0222 19.7275 19.4738 19.8613 19.8857L20.957 23.2588L18.0879 21.1738C17.7374 20.9192 17.2626 20.9192 16.9121 21.1738L14.043 23.2588L15.1387 19.8857C15.2725 19.4738 15.1258 19.0222 14.7754 18.7676L11.9062 16.6826H15.4531C15.8862 16.6825 16.2704 16.4032 16.4043 15.9912L17.5 12.6182L18.5957 15.9912Z" stroke="black" />
                                                </svg>
                                                <h3 className="hp-pass-name">FREE PASS</h3>
                                            </div>
                                            <span className="hp-pass-price">&#8377;0</span>
                                        </div>

                                        <ul className="hp-pass-features">
                                            <li>
                                                <span className="hp-pass-check hp-check-purple">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="white" />
                                                    </svg>
                                                </span>
                                                <span>Cost: Free</span>
                                            </li>
                                            <li>
                                                <span className="hp-pass-check hp-check-purple">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="white" />
                                                    </svg>
                                                </span>
                                                <span>Entry: Guaranteed entry if you arrive 15+ minutes prior to the event start time</span>
                                            </li>
                                            <li>
                                                <span className="hp-pass-check hp-check-purple">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="white" />
                                                    </svg>
                                                </span>
                                                <span>Seating: Open Seating</span>
                                            </li>
                                        </ul>

                                        <p className="hp-pass-note">
                                            All Free Passes will be available for booking from Saturday, January 9, 2027, and will remain open until the venue reaches full capacity.
                                        </p>
                                    </div>
                                </div>

                                {/* Card 2: DONOR PASS */}
                                <div className="hp-pass-card hp-pass-donor" onClick={() => navigate("/events")} style={{ cursor: "pointer" }}>
                                    <div className="hp-pass-header-bg hp-pass-bg-donor">
                                        <img src={donorPassImage} alt="Donor Pass" className="hp-pass-header-img" />
                                    </div>
                                    <div className="hp-pass-body">
                                        <div className="hp-pass-top">
                                            <div className="hp-pass-title-group">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="37" height="27" viewBox="0 0 37 27" fill="none">
                                                    <path d="M35.7803 9.76855V15.0127L35.7158 15.0117H35.6914V15.0107H35.6699C33.9589 15.0119 32.5773 16.4174 32.5771 18.1338C32.5771 19.8504 33.9606 21.2578 35.6729 21.2578H35.6914L35.7051 21.2568C35.7074 21.2567 35.711 21.2562 35.7227 21.2559L35.7217 21.2549H35.7803V26.5H4.79492V21.2559L4.85938 21.2568L4.86914 21.2578H4.8877C6.59656 21.254 7.97559 19.849 7.97559 18.1338C7.9754 16.4187 6.59638 15.0148 4.8877 15.0107H4.87109C4.86584 15.0109 4.86359 15.0117 4.86133 15.0117H4.79492V9.76855H35.7803ZM35.6533 21.4268L35.2236 21.3652C33.6631 21.1441 32.4502 19.7819 32.4502 18.1338C32.4504 16.4859 33.6631 15.1238 35.2236 14.9023L35.6533 14.8418V9.9082H4.92188V14.8418L5.34961 14.9053C6.90065 15.135 8.10237 16.4927 8.10254 18.1338C8.10254 19.7751 6.90013 21.1335 5.34863 21.3633L4.92188 21.4258V26.3604H35.6533V21.4268Z" fill="black" stroke="black" />
                                                    <path d="M28.0986 10.757C28.0847 10.757 28.0707 10.7564 28.0568 10.755C28.0433 10.7536 28.0295 10.7516 28.016 10.7487C28.0024 10.7462 27.9889 10.7425 27.9757 10.7385C27.9627 10.7345 27.9495 10.7296 27.9368 10.7245C27.9241 10.7191 27.9114 10.7131 27.8996 10.7066C27.8872 10.7 27.8753 10.6929 27.8638 10.6852C27.8522 10.6775 27.8412 10.6689 27.8305 10.6601C27.8198 10.6513 27.8094 10.6419 27.7995 10.6319C27.7899 10.6222 27.7803 10.6117 27.7716 10.6008C27.7629 10.59 27.7547 10.5786 27.7471 10.5669C27.7395 10.5555 27.7324 10.5433 27.7259 10.531C27.7195 10.5188 27.7135 10.506 27.7082 10.4931C27.7028 10.4803 27.6983 10.4672 27.6941 10.4538C27.6902 10.4404 27.6868 10.4268 27.684 10.4134C27.6814 10.3994 27.6792 10.3857 27.6778 10.3718C27.6766 10.3578 27.6758 10.3436 27.6758 10.3296C27.6758 10.3156 27.6766 10.3017 27.6778 10.2877C27.6792 10.2737 27.6814 10.2598 27.684 10.2461C27.6868 10.2327 27.6902 10.219 27.6941 10.2057C27.6983 10.1923 27.7028 10.1792 27.7082 10.1663C27.7135 10.1535 27.7195 10.1407 27.7259 10.1284C27.7324 10.1162 27.7395 10.1039 27.7471 10.0925C27.7547 10.0809 27.7629 10.0695 27.7716 10.0586C27.7803 10.0478 27.7899 10.0375 27.7995 10.0276C27.8094 10.0176 27.8198 10.0082 27.8305 9.99936C27.8412 9.99053 27.8522 9.98227 27.8638 9.97429C27.8753 9.9666 27.8872 9.95947 27.8996 9.95292C27.9114 9.94637 27.9241 9.94038 27.9368 9.93497C27.9495 9.92984 27.9627 9.925 27.9757 9.92101C27.9889 9.91702 28.0024 9.9136 28.016 9.91075C28.0295 9.9079 28.0433 9.90591 28.0568 9.90448C28.0845 9.90163 28.1126 9.90163 28.14 9.90448C28.1538 9.90591 28.1676 9.9079 28.1811 9.91075C28.1947 9.9136 28.2082 9.91702 28.2214 9.92101C28.2344 9.925 28.2476 9.92984 28.2603 9.93497C28.273 9.94038 28.2854 9.94637 28.2975 9.95292C28.3099 9.95947 28.3218 9.9666 28.3333 9.97429C28.3446 9.98227 28.3559 9.99053 28.3666 9.99936C28.3773 10.0082 28.3877 10.0176 28.3976 10.0276C28.4762 10.1071 28.5213 10.2173 28.5213 10.3296C28.5213 10.3436 28.5205 10.3578 28.5191 10.3718C28.5179 10.3857 28.5157 10.3994 28.5132 10.4134C28.5103 10.4268 28.5069 10.4404 28.503 10.4538C28.4988 10.4672 28.4943 10.4803 28.4889 10.4931C28.4836 10.506 28.4776 10.5188 28.4712 10.531C28.4647 10.5433 28.4576 10.5555 28.45 10.5669C28.4424 10.5786 28.4342 10.59 28.4255 10.6008C28.4168 10.6117 28.4072 10.6222 28.3976 10.6319C28.3877 10.6419 28.3773 10.6513 28.3666 10.6601C28.3559 10.6689 28.3446 10.6775 28.3333 10.6852C28.3218 10.6929 28.3099 10.7 28.2975 10.7066C28.2854 10.7131 28.273 10.7191 28.2603 10.7245C28.2476 10.7296 28.2344 10.7345 28.2214 10.7385C28.2082 10.7425 28.1947 10.7462 28.1811 10.7487C28.1676 10.7516 28.1538 10.7536 28.14 10.755C28.1265 10.7564 28.1124 10.757 28.0986 10.757Z" fill="black" />
                                                    <path d="M27.6758 11.9787C27.6758 11.9306 27.6837 11.8844 27.698 11.8414C27.6837 11.7981 27.6758 11.7519 27.6758 11.7038C27.6758 11.4678 27.8649 11.2764 28.0986 11.2764C28.3319 11.2764 28.5213 11.4678 28.5213 11.7038C28.5213 11.7519 28.5134 11.7981 28.4991 11.8414C28.5134 11.8844 28.5213 11.9306 28.5213 11.9787C28.5213 12.2146 28.3319 12.4061 28.0986 12.4061C27.8649 12.4061 27.6758 12.2146 27.6758 11.9787Z" fill="black" />
                                                    <path d="M27.6758 26.27C27.6758 26.2219 27.6837 26.1757 27.698 26.1324C27.6837 26.0894 27.6758 26.0432 27.6758 25.9951C27.6758 25.7591 27.8652 25.5677 28.0986 25.5677C28.3319 25.5677 28.5213 25.7591 28.5213 25.9951C28.5213 26.0432 28.5134 26.0894 28.4991 26.1324C28.5134 26.1757 28.5213 26.2219 28.5213 26.27C28.5213 26.5059 28.3319 26.6974 28.0986 26.6974C27.8652 26.6974 27.6758 26.5059 27.6758 26.27ZM27.6758 24.6208C27.6758 24.5975 27.6778 24.5747 27.6811 24.5522C27.6778 24.53 27.6758 24.5069 27.6758 24.4835C27.6758 24.4354 27.6837 24.3892 27.698 24.3462C27.6837 24.3029 27.6758 24.2567 27.6758 24.2088C27.6758 23.9726 27.8652 23.7812 28.0986 23.7812C28.3319 23.7812 28.5213 23.9726 28.5213 24.2088C28.5213 24.2567 28.5134 24.3029 28.4991 24.3462C28.5134 24.3892 28.5213 24.4354 28.5213 24.4835C28.5213 24.5069 28.5194 24.53 28.516 24.5522C28.5194 24.5747 28.5213 24.5975 28.5213 24.6208C28.5213 24.8571 28.3319 25.0482 28.0986 25.0482C27.8652 25.0482 27.6758 24.8571 27.6758 24.6208ZM27.6758 22.8346C27.6758 22.811 27.6778 22.7882 27.6811 22.7657C27.6778 22.7434 27.6758 22.7204 27.6758 22.697C27.6758 22.6491 27.6837 22.6027 27.698 22.5597C27.6837 22.5166 27.6758 22.4702 27.6758 22.4223C27.6758 22.1861 27.8652 21.9949 28.0986 21.9949C28.3319 21.9949 28.5213 22.1861 28.5213 22.4223C28.5213 22.4702 28.5134 22.5166 28.4991 22.5597C28.5134 22.6027 28.5213 22.6491 28.5213 22.697C28.5213 22.7204 28.5194 22.7434 28.516 22.7657C28.5194 22.7882 28.5213 22.811 28.5213 22.8346C28.5213 23.0705 28.3319 23.262 28.0986 23.262C27.8652 23.262 27.6758 23.0705 27.6758 22.8346ZM27.6758 21.0481C27.6758 21.0248 27.6778 21.0017 27.6811 20.9794C27.6778 20.9569 27.6758 20.9341 27.6758 20.9108C27.6758 20.8626 27.6837 20.8165 27.698 20.7732C27.6837 20.7301 27.6758 20.684 27.6758 20.6358C27.6758 20.3999 27.8652 20.2084 28.0986 20.2084C28.3319 20.2084 28.5213 20.3999 28.5213 20.6358C28.5213 20.684 28.5134 20.7301 28.4991 20.7732C28.5134 20.8165 28.5213 20.8626 28.5213 20.9108C28.5213 20.9341 28.5194 20.9569 28.516 20.9794C28.5194 21.0017 28.5213 21.0248 28.5213 21.0481C28.5213 21.284 28.3319 21.4755 28.0986 21.4755C27.8652 21.4755 27.6758 21.284 27.6758 21.0481ZM27.6758 19.2616C27.6758 19.2382 27.6778 19.2155 27.6811 19.1929C27.6778 19.1707 27.6758 19.1476 27.6758 19.1243C27.6758 19.0761 27.6837 19.03 27.698 18.9869C27.6837 18.9436 27.6758 18.8975 27.6758 18.8493C27.6758 18.6134 27.8652 18.4219 28.0986 18.4219C28.3319 18.4219 28.5213 18.6134 28.5213 18.8493C28.5213 18.8975 28.5134 18.9436 28.4991 18.9869C28.5134 19.03 28.5213 19.0761 28.5213 19.1243C28.5213 19.1476 28.5194 19.1707 28.516 19.1929C28.5194 19.2155 28.5213 19.2382 28.5213 19.2616C28.5213 19.4978 28.3319 19.689 28.0986 19.689C27.8652 19.689 27.6758 19.4978 27.6758 19.2616ZM27.6758 17.4751C27.6758 17.4517 27.6778 17.4289 27.6811 17.4064C27.6778 17.3842 27.6758 17.3611 27.6758 17.3378C27.6758 17.2896 27.6837 17.2435 27.698 17.2004C27.6837 17.1574 27.6758 17.111 27.6758 17.0631C27.6758 16.8269 27.8652 16.6354 28.0986 16.6354C28.3319 16.6354 28.5213 16.8269 28.5213 17.0631C28.5213 17.111 28.5134 17.1574 28.4991 17.2004C28.5134 17.2435 28.5213 17.2896 28.5213 17.3378C28.5213 17.3611 28.5194 17.3842 28.516 17.4064C28.5194 17.4289 28.5213 17.4517 28.5213 17.4751C28.5213 17.7113 28.3319 17.9025 28.0986 17.9025C27.8652 17.9025 27.6758 17.7113 27.6758 17.4751ZM27.6758 15.6889C27.6758 15.6652 27.6778 15.6424 27.6811 15.6199C27.6778 15.5977 27.6758 15.5746 27.6758 15.5513C27.6758 15.5034 27.6837 15.4569 27.698 15.4139C27.6837 15.3709 27.6758 15.3247 27.6758 15.2766C27.6758 15.0404 27.8652 14.8492 28.0986 14.8492C28.3319 14.8492 28.5213 15.0404 28.5213 15.2766C28.5213 15.3247 28.5134 15.3709 28.4991 15.4139C28.5134 15.4569 28.5213 15.5034 28.5213 15.5513C28.5213 15.5746 28.5194 15.5977 28.516 15.6199C28.5194 15.6424 28.5213 15.6652 28.5213 15.6889C28.5213 15.9248 28.3319 16.1163 28.0986 16.1163C27.8652 16.1163 27.6758 15.9248 27.6758 15.6889ZM27.6758 13.9024C27.6758 13.879 27.6778 13.8559 27.6811 13.8337C27.6778 13.8112 27.6758 13.7884 27.6758 13.765C27.6758 13.7169 27.6837 13.6707 27.698 13.6274C27.6837 13.5844 27.6758 13.5382 27.6758 13.4901C27.6758 13.2542 27.8652 13.0627 28.0986 13.0627C28.3319 13.0627 28.5213 13.2542 28.5213 13.4901C28.5213 13.5382 28.5134 13.5844 28.4991 13.6274C28.5134 13.6707 28.5213 13.7169 28.5213 13.765C28.5213 13.7884 28.5194 13.8112 28.516 13.8337C28.5194 13.8559 28.5213 13.879 28.5213 13.9024C28.5213 14.1383 28.3319 14.3298 28.0986 14.3298C27.8652 14.3298 27.6758 14.1383 27.6758 13.9024ZM27.6758 12.1159C27.6758 11.8799 27.8652 11.6885 28.0986 11.6885C28.3319 11.6885 28.5213 11.8799 28.5213 12.1159C28.5213 12.3521 28.3319 12.5433 28.0986 12.5433C27.8652 12.5433 27.6758 12.3521 27.6758 12.1159Z" fill="black" />
                                                    <path d="M28.0986 26.8352C28.0847 26.8352 28.0707 26.8346 28.0568 26.8332C28.0433 26.8318 28.0295 26.8295 28.016 26.8269C28.0024 26.8241 27.9889 26.8207 27.9757 26.8167C27.9627 26.8124 27.9495 26.8078 27.9368 26.8024C27.9241 26.797 27.9114 26.791 27.8993 26.7848C27.8872 26.7782 27.8753 26.7708 27.8638 26.7631C27.8525 26.7554 27.8412 26.7471 27.8305 26.7383C27.8198 26.7295 27.8094 26.7198 27.7995 26.7101C27.7899 26.7001 27.7803 26.6896 27.7716 26.6788C27.7629 26.6679 27.7547 26.6565 27.7471 26.6451C27.7395 26.6335 27.7324 26.6215 27.7259 26.6092C27.7195 26.597 27.7135 26.5842 27.7082 26.5713C27.7028 26.5585 27.6983 26.5451 27.6941 26.532C27.6902 26.5186 27.6868 26.505 27.684 26.4913C27.6814 26.4776 27.6792 26.4636 27.6778 26.45C27.6766 26.436 27.6758 26.4218 27.6758 26.4078C27.6758 26.3938 27.6766 26.3796 27.6778 26.3659C27.6792 26.3519 27.6814 26.338 27.684 26.3243C27.6868 26.3106 27.6902 26.297 27.6941 26.2838C27.6983 26.2705 27.7028 26.2571 27.7082 26.2442C27.7135 26.2314 27.7195 26.2189 27.7259 26.2066C27.7324 26.1941 27.7395 26.1821 27.7471 26.1704C27.7547 26.159 27.7629 26.1477 27.7716 26.1368C27.7803 26.126 27.7899 26.1155 27.7995 26.1055C27.8094 26.0958 27.8198 26.0861 27.8305 26.0773C27.8412 26.0684 27.8525 26.0602 27.8638 26.0525C27.8753 26.0448 27.8872 26.0377 27.8993 26.0311C27.9114 26.0246 27.9241 26.0186 27.9368 26.0132C27.9495 26.0078 27.9627 26.0032 27.9757 25.9989C27.9889 25.9949 28.0024 25.9915 28.016 25.9887C28.0295 25.9861 28.0433 25.9838 28.0568 25.9824C28.0845 25.9798 28.1126 25.9798 28.14 25.9824C28.1538 25.9838 28.1676 25.9861 28.1811 25.9887C28.1947 25.9915 28.2082 25.9949 28.2214 25.9989C28.2344 26.0032 28.2476 26.0078 28.2603 26.0132C28.273 26.0186 28.2854 26.0246 28.2975 26.0311C28.3099 26.0377 28.3218 26.0448 28.3333 26.0525C28.3446 26.0602 28.3559 26.0684 28.3666 26.0773C28.3773 26.0861 28.3877 26.0958 28.3976 26.1055C28.4072 26.1155 28.4165 26.126 28.4255 26.1368C28.4342 26.1477 28.4424 26.159 28.45 26.1704C28.4576 26.1821 28.4647 26.1941 28.4712 26.2066C28.4776 26.2189 28.4836 26.2314 28.4889 26.2442C28.4943 26.2571 28.4988 26.2705 28.503 26.2838C28.5069 26.297 28.5103 26.3106 28.5132 26.3243C28.5157 26.338 28.5179 26.3519 28.5194 26.3659C28.5205 26.3796 28.5213 26.3938 28.5213 26.4078C28.5213 26.4218 28.5205 26.436 28.5194 26.45C28.5179 26.4636 28.5157 26.4776 28.5132 26.4913C28.5103 26.505 28.5069 26.5186 28.503 26.532C28.4988 26.5451 28.4943 26.5585 28.4889 26.5713C28.4836 26.5842 28.4776 26.597 28.4712 26.6092C28.4647 26.6215 28.4576 26.6335 28.45 26.6451C28.4424 26.6565 28.4342 26.6679 28.4255 26.6788C28.4165 26.6896 28.4072 26.7001 28.3976 26.7101C28.3877 26.7198 28.3773 26.7295 28.3666 26.7383C28.3559 26.7471 28.3446 26.7554 28.3333 26.7631C28.3218 26.7708 28.3099 26.7782 28.2975 26.7848C28.2854 26.791 28.273 26.797 28.2603 26.8024C28.2476 26.8078 28.2344 26.8124 28.2214 26.8167C28.2082 26.8207 28.1947 26.8241 28.1811 26.8269C28.1676 26.8295 28.1538 26.8318 28.14 26.8332C28.1265 26.8346 28.1124 26.8352 28.0986 26.8352Z" fill="black" />
                                                    <path d="M30.501 0.508789C30.5153 0.517502 30.5267 0.532409 30.5312 0.550781V0.551758L31.7754 5.49707C31.7802 5.51629 31.7761 5.53712 31.7656 5.55469C31.7557 5.57041 31.7423 5.5804 31.7275 5.58398L31.7227 5.58496C31.7212 5.58532 31.7199 5.5857 31.7188 5.58594L31.7119 5.58789L31.7051 5.58887L31.6943 5.5918L31.6836 5.59375C30.3916 5.92718 29.4609 7.05196 29.3623 8.3877C29.3592 8.43044 29.3244 8.45344 29.2939 8.45117C29.2638 8.44853 29.2322 8.42043 29.2354 8.37695C29.3274 7.12819 30.111 6.06288 31.2285 5.60059L31.6279 5.43555L31.5225 5.0166L30.5479 1.14062L30.4248 0.65332L29.9385 0.77832L1.1582 8.17676L0.647461 8.30859L0.805664 8.81152L3.87598 18.5527C3.88583 18.584 3.87501 18.6139 3.85547 18.6309L3.83398 18.6426C3.82667 18.6448 3.82081 18.6455 3.81641 18.6455C3.79259 18.6455 3.76564 18.6295 3.75586 18.5986L0.503906 8.28027C0.497761 8.26026 0.49968 8.23942 0.508789 8.22266L0.509766 8.22168C0.51893 8.20506 0.53379 8.19358 0.549805 8.18945L30.4561 0.501953C30.4706 0.498236 30.4868 0.500289 30.501 0.508789Z" fill="black" stroke="black" />
                                                    <path d="M24.149 8.43515C24.1431 8.41151 24.1392 8.38814 24.1372 8.36449C24.1279 8.34312 24.12 8.32061 24.1141 8.29696C24.102 8.24853 24.0986 8.20009 24.1028 8.15279C24.0769 8.11375 24.0569 8.0693 24.0447 8.02087C23.9873 7.79207 24.1239 7.55957 24.3503 7.50144C24.5766 7.44303 24.8066 7.58151 24.8641 7.8103C24.8762 7.85846 24.8799 7.90718 24.8756 7.95419C24.9016 7.99351 24.9216 8.03796 24.9337 8.0864C24.9396 8.10977 24.9433 8.13341 24.9453 8.15678C24.9548 8.17843 24.9624 8.20094 24.9684 8.22431C25.0259 8.4531 24.8892 8.68589 24.6628 8.74402C24.6279 8.75285 24.5929 8.75712 24.5583 8.75712C24.3694 8.75712 24.1975 8.62862 24.149 8.43515ZM23.6975 6.6401C23.6916 6.61645 23.6876 6.59309 23.6857 6.56944C23.6764 6.54807 23.6685 6.52556 23.6626 6.50219C23.6504 6.45376 23.6471 6.40503 23.6513 6.35802C23.6254 6.3187 23.6053 6.27425 23.5932 6.22581C23.5357 5.9973 23.6724 5.76451 23.8988 5.70639C24.1251 5.64826 24.3551 5.78645 24.4126 6.01525C24.425 6.06369 24.4283 6.11241 24.4241 6.15942C24.45 6.19875 24.4701 6.24291 24.4822 6.29135C24.4881 6.315 24.4918 6.33836 24.4937 6.36201C24.503 6.38338 24.5109 6.40589 24.5168 6.42954C24.5743 6.65834 24.4376 6.89084 24.2113 6.94896C24.1764 6.95808 24.1414 6.96236 24.1068 6.96236C23.9182 6.96236 23.746 6.83357 23.6975 6.6401ZM23.246 4.84533C23.2401 4.82168 23.2361 4.79803 23.2342 4.77467C23.2249 4.7533 23.217 4.73079 23.211 4.70714C23.1989 4.6587 23.1955 4.61026 23.1998 4.56297C23.1738 4.52365 23.1538 4.47948 23.1417 4.43104C23.0842 4.20225 23.2209 3.96974 23.4472 3.91133C23.6736 3.85321 23.9035 3.99168 23.961 4.22048C23.9734 4.26892 23.9768 4.31736 23.9726 4.36437C23.9985 4.40369 24.0183 4.44814 24.0307 4.49658C24.0366 4.51994 24.0402 4.54359 24.0422 4.56696C24.0515 4.58833 24.0594 4.61112 24.0653 4.63448C24.1228 4.86328 23.9861 5.09607 23.7598 5.15419C23.7249 5.16303 23.6899 5.1673 23.6552 5.1673C23.4664 5.1673 23.2945 5.0388 23.246 4.84533ZM22.7945 3.05028C22.7367 2.82148 22.8737 2.58898 23.0997 2.53085C23.3263 2.47273 23.5563 2.61092 23.6138 2.83971C23.6713 3.06851 23.5346 3.30101 23.3083 3.35914C23.2733 3.36826 23.2381 3.37253 23.2037 3.37253C23.0149 3.37253 22.843 3.24374 22.7945 3.05028Z" fill="black" />
                                                    <path d="M18.5957 15.9912C18.7296 16.4032 19.1138 16.6825 19.5469 16.6826H23.0938L20.2246 18.7676C19.8742 19.0222 19.7275 19.4738 19.8613 19.8857L20.957 23.2588L18.0879 21.1738C17.7374 20.9192 17.2626 20.9192 16.9121 21.1738L14.043 23.2588L15.1387 19.8857C15.2725 19.4738 15.1258 19.0222 14.7754 18.7676L11.9062 16.6826H15.4531C15.8862 16.6825 16.2704 16.4032 16.4043 15.9912L17.5 12.6182L18.5957 15.9912Z" stroke="black" />
                                                </svg>
                                                <h3 className="hp-pass-name">DONOR PASS</h3>
                                            </div>
                                            <span className="hp-pass-price">&#8377;150-450</span>
                                        </div>

                                        <ul className="hp-pass-features">
                                            <li>
                                                <span className="hp-pass-check hp-check-yellow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="black" />
                                                    </svg>
                                                </span>
                                                <span>Cost: A donation that supports the festival. Donor Passes are non-refundable.</span>
                                            </li>
                                            <li>
                                                <span className="hp-pass-check hp-check-yellow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="black" />
                                                    </svg>
                                                </span>
                                                <span>Entry: Guaranteed entry if you arrive 15+ minutes prior to the event start time</span>
                                            </li>
                                            <li>
                                                <span className="hp-pass-check hp-check-yellow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="black" />
                                                    </svg>
                                                </span>
                                                <span>Seating: Open Seating</span>
                                            </li>
                                        </ul>

                                        <p className="hp-pass-note">
                                            Donor Passes will be available for booking as soon as the events are live on the website.
                                        </p>
                                    </div>
                                </div>

                                {/* Card 3: PASSES SOLD OUT? */}
                                <div className="hp-pass-card hp-pass-soldout">
                                    <div className="hp-pass-soldout-body">
                                        <h3 className="hp-pass-soldout-title">Passes sold out?</h3>
                                        <p className="hp-pass-soldout-desc">
                                            Join the wait queue at the venue. First come, first served. Entry opens 15 minutes before the event, after the Free and Donor Pass occupants. Seats available based on cancellations and no-shows.
                                        </p>
                                        <ul className="hp-pass-features hp-pass-soldout-features">
                                            <li>
                                                <span className="hp-pass-check hp-check-yellow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="black" />
                                                    </svg>
                                                </span>
                                                <span>First come, first served basis</span>
                                            </li>
                                            <li>
                                                <span className="hp-pass-check hp-check-yellow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="black" />
                                                    </svg>
                                                </span>
                                                <span>Admission subject to availability</span>
                                            </li>
                                            <li>
                                                <span className="hp-pass-check hp-check-yellow">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M0.140376 4.33289C-0.0687314 4.13712 -0.0286055 3.82019 0.157896 3.64558C0.331963 3.48262 0.665404 3.42442 0.86886 3.61384L2.13481 4.78898L7.06974 0.166717C7.29071 -0.0406925 7.61737 -0.0597403 7.83835 0.138674C8.05932 0.337089 8.0531 0.658256 7.82365 0.873073L2.5112 5.84984C2.3134 6.03502 1.98334 6.05778 1.78102 5.86836L0.140376 4.33289Z" fill="black" />
                                                    </svg>
                                                </span>
                                                <span>Entry not guaranteed</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                            <MotionButton className="hp-passes-explore-btn-mobile" onClick={() => navigate("/events")}>
                                <span className="btn-text-primary">EXPLORE EVENTS</span>
                                <span className="btn-text-secondary">EXPLORE EVENTS</span>
                            </MotionButton>
                        </div>
                    </MotionSection>

            {/* ================= SPONSORS SECTION ================= */}
            <EventListingSponsors />

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

export default Homepage;