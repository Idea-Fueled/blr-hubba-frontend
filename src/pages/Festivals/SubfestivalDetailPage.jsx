import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MotionSection } from "../../components/AnimatedPage";
import EventListing from "../../components/EventListingSection/EventListing";
import FestivalsSection from "../../components/FestivalsSection/FestivalsSection";
import { Loader } from "../../components/Loader/Loader";
import { useLanguage } from "../../context/LanguageContext";
import { getSubfestivalName } from "../../utils/kannadaTranslations";
import "./SubfestivalDetailPage.css";

import subfestivalListingImg from "../../assets/subfestivals-images/subfestivals-listing-page-img.png";
import defaultHeroBg from "../../assets/subfestivals-images/subfestiavls-page-bg-img.png";

import aataBanner from "../../assets/subfestivals-hero-banners/aata-banner-image.png";
import churumuriBanner from "../../assets/subfestivals-hero-banners/churumuri-banner-image.png";
import kalaBanner from "../../assets/subfestivals-hero-banners/kala-banner-image.png";
import kanthaBanner from "../../assets/subfestivals-hero-banners/kantha-banner-image.png";
import kalpaneBanner from "../../assets/subfestivals-hero-banners/kalpane-banner-image.png";
import kriyaBanner from "../../assets/subfestivals-hero-banners/kriya-banner-image.png";
import makkalaBanner from "../../assets/subfestivals-hero-banners/makkala-banner-image.png";
import nrutyaBanner from "../../assets/subfestivals-hero-banners/nrutya-banner-image.png";
import natakaBanner from "../../assets/subfestivals-hero-banners/nataka-banner-image.png";
import onWheelsBanner from "../../assets/subfestivals-hero-banners/on-wheels-banner-image.png";
import rastheBanner from "../../assets/subfestivals-hero-banners/rasthe-banner-image.png";
import samvadaBanner from "../../assets/subfestivals-hero-banners/samvada-banner-image.png";
import santheBanner from "../../assets/subfestivals-hero-banners/santhe-banner-image.png";
import swaraBanner from "../../assets/subfestivals-hero-banners/swara-banner-image.png";
import thindiBanner from "../../assets/subfestivals-hero-banners/thindi-banner-image.png";
import udyanaBanner from "../../assets/subfestivals-hero-banners/udyana-banner-image.png";
import visheshaBanner from "../../assets/subfestivals-hero-banners/vishesha-banner-image.png";

// Mobile Hero Banners
import aataBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/aata-banner-mobile.png";
import churumuriBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/churumuri-banner-mobile.png";
import kalaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/kala-banner-mobile.png";
import kalpaneBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/kalpane-banner-mobile.png";
import kanthaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/kantha-banner-mobile.png";
import kriyaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/kriya-banner-mobile.png";
import makkalaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/makkala-banner-mobile.png";
import natakaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/nataka-banner-mobile.png";
import nrutyaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/nrutya-banner-mobile.png";
import onWheelsBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/on-wheels-banner-mobile.png";
import rastheBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/rasthe-banner-mobile.png";
import samvadaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/samvada-banner-mobile.png";
import santheBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/santhe-banner-mobile.png";
import swaraBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/swara-banner-mobile.png";
import thindiBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/thindi-banner-mobile.png";
import udyanaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/udyana-banner-mobile.png";
import visheshaBannerMobile from "../../assets/subfestivals-hero-banners/mobile-images/vishesha-banner-mobile.png";

const HERO_BANNERS_MAP = {
    aata: aataBanner,
    churumuri: churumuriBanner,
    kala: kalaBanner,
    kantha: kanthaBanner,
    kalpane: kalpaneBanner,
    kaplane: kalpaneBanner,
    kriya: kriyaBanner,
    makkala: makkalaBanner,
    makala: makkalaBanner,
    nartisu: nrutyaBanner,
    nrutya: nrutyaBanner,
    dance: nrutyaBanner,
    nataka: natakaBanner,
    "on-wheels": onWheelsBanner,
    onwheels: onWheelsBanner,
    rasthe: rastheBanner,
    samvada: samvadaBanner,
    santhe: santheBanner,
    swara: swaraBanner,
    thindi: thindiBanner,
    udyana: udyanaBanner,
    vishesha: visheshaBanner,
};

const HERO_BANNERS_MOBILE_MAP = {
    aata: aataBannerMobile,
    churumuri: churumuriBannerMobile,
    kala: kalaBannerMobile,
    kantha: kanthaBannerMobile,
    kalpane: kalpaneBannerMobile,
    kaplane: kalpaneBannerMobile,
    kriya: kriyaBannerMobile,
    makkala: makkalaBannerMobile,
    makala: makkalaBannerMobile,
    nartisu: nrutyaBannerMobile,
    nrutya: nrutyaBannerMobile,
    dance: nrutyaBannerMobile,
    nataka: natakaBannerMobile,
    "on-wheels": onWheelsBannerMobile,
    onwheels: onWheelsBannerMobile,
    rasthe: rastheBannerMobile,
    samvada: samvadaBannerMobile,
    santhe: santheBannerMobile,
    swara: swaraBannerMobile,
    thindi: thindiBannerMobile,
    udyana: udyanaBannerMobile,
    vishesha: visheshaBannerMobile,
};

const normalizeKey = (str) => {
    return (str || "")
        .toLowerCase()
        .replace(/[-_\s]+hubba/g, "")
        .replace(/[^a-z0-9]/g, "");
};

const getHeroBanner = (slug, name) => {
    const cleanSlug = normalizeKey(slug);
    const cleanName = normalizeKey(name);

    // Explicit Makkala check first
    if (cleanSlug === "makkala" || cleanSlug === "makala" || cleanName === "makkala" || cleanName === "makala") {
        return makkalaBanner;
    }

    if (cleanSlug && HERO_BANNERS_MAP[cleanSlug]) return HERO_BANNERS_MAP[cleanSlug];
    if (cleanName && HERO_BANNERS_MAP[cleanName]) return HERO_BANNERS_MAP[cleanName];

    // Sort keys by descending length so longer, more specific keys match first (prevents 'kala' from matching 'makala')
    const sortedKeys = Object.keys(HERO_BANNERS_MAP).sort((a, b) => b.length - a.length);

    if (cleanSlug) {
        for (const key of sortedKeys) {
            if (cleanSlug === key || cleanSlug.startsWith(key)) {
                return HERO_BANNERS_MAP[key];
            }
        }
    }

    if (name) {
        for (const key of sortedKeys) {
            if (cleanName === key || cleanName.startsWith(key)) {
                return HERO_BANNERS_MAP[key];
            }
        }
    }
    return defaultHeroBg;
};

const getHeroBannerMobile = (slug, name) => {
    const cleanSlug = normalizeKey(slug);
    const cleanName = normalizeKey(name);

    // Explicit Makkala check first
    if (cleanSlug === "makkala" || cleanSlug === "makala" || cleanName === "makkala" || cleanName === "makala") {
        return makkalaBannerMobile;
    }

    if (cleanSlug && HERO_BANNERS_MOBILE_MAP[cleanSlug]) return HERO_BANNERS_MOBILE_MAP[cleanSlug];
    if (cleanName && HERO_BANNERS_MOBILE_MAP[cleanName]) return HERO_BANNERS_MOBILE_MAP[cleanName];

    const sortedKeys = Object.keys(HERO_BANNERS_MOBILE_MAP).sort((a, b) => b.length - a.length);

    if (cleanSlug) {
        for (const key of sortedKeys) {
            if (cleanSlug === key || cleanSlug.startsWith(key)) {
                return HERO_BANNERS_MOBILE_MAP[key];
            }
        }
    }

    if (name) {
        for (const key of sortedKeys) {
            if (cleanName === key || cleanName.startsWith(key)) {
                return HERO_BANNERS_MOBILE_MAP[key];
            }
        }
    }
    return null;
};

const subfestivalsMap = {
    swara: {
        name: "Swara Hubba",
        category: "SHOWCASE",
        eyebrowText: "ABOUT THE FESTIVAL",
        description: "Our beloved open-air stage at Freedom Park returns for Hubba 4.0 with traditional, popular and cross-cultural sounds from across Asia. Curated by composer, guitarist and sarod player Abhijit, the upcoming edition of Kantha Hubba brings new sounds, unusual musical combinations and a few surprise performances to the stage.\n\nNew this year, and joining Hubba's music vertical is Swara Hubba, a festival that takes music beyond the stage — into streets, public spaces and transport. Curated by musician and composer Bindhu Malini, Swara is for music to find you whether in the middle of your day or when you least expect it.",
        descriptionKn: "",
        instagramUrl: "https://www.instagram.com/blrhubba/"
    },
    kriya: { name: "Kriya Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    makkala: { name: "Makkala Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    makala: { name: "Makkala Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    nataka: { name: "Nataka Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    santhe: { name: "Santhe Hubba", category: "MARKET", eyebrowText: "ABOUT THE FESTIVAL" },
    churumuri: { name: "Churumuri Hubba", category: "MARKET", eyebrowText: "ABOUT THE FESTIVAL" },
    thindi: { name: "Thindi Hubba", category: "MARKET", eyebrowText: "ABOUT THE FESTIVAL" },
    kala: { name: "Kala Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    kalpane: { name: "Kalpane Hubba", category: "LAB", eyebrowText: "ABOUT THE FESTIVAL" },
    kantha: { name: "Kantha Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    nrutya: { name: "Nrutya Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" },
    rasthe: { name: "Rasthe Hubba", category: "ON WHEELS", eyebrowText: "ABOUT THE FESTIVAL" },
    samvada: { name: "Samvada Hubba", category: "LAB", eyebrowText: "ABOUT THE FESTIVAL" },
    aata: { name: "Aata Hubba", category: "ON WHEELS", eyebrowText: "ABOUT THE FESTIVAL" },
    udyana: { name: "Udyana Hubba", category: "ON WHEELS", eyebrowText: "ABOUT THE FESTIVAL" },
    vishesha: { name: "Vishesha Hubba", category: "SHOWCASE", eyebrowText: "ABOUT THE FESTIVAL" }
};

export const SubfestivalDetailPage = () => {
    const { subfestivalSlug } = useParams();
    const { language } = useLanguage();
    const [activeDot, setActiveDot] = useState(0);
    const [subfestival, setSubfestival] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const slugKey = (subfestivalSlug || "").toLowerCase().replace(/[-_\s]+hubba/g, "").trim();

    useEffect(() => {
        window.scrollTo(0, 0);
        setActiveDot(0);
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        fetch(`${API_URL}/public/subfestivals/${subfestivalSlug}`)
            .then((res) => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then((data) => {
                const item = data?.data || data;
                if (item && (item.id || item.name)) {
                    setSubfestival(item);
                } else {
                    throw new Error("No subfestival data");
                }
            })
            .catch(() => {
                // Fallback: fetch all subfestivals and find match
                fetch(`${API_URL}/public/subfestivals`)
                    .then((res) => res.json())
                    .then((allData) => {
                        const list = allData?.data || (Array.isArray(allData) ? allData : []);
                        const matched = list.find((s) => {
                            const sSlug = (s.slug || "").toLowerCase().replace(/[-_\s]+hubba/g, "").trim();
                            const sName = (s.name || "").toLowerCase().replace(/[-_\s]+hubba/g, "").trim();
                            return (
                                s.slug === subfestivalSlug ||
                                (sSlug && sSlug === slugKey) ||
                                (sName && (sName.includes(slugKey) || slugKey.includes(sName)))
                            );
                        });
                        if (matched) {
                            setSubfestival(matched);
                        }
                    })
                    .catch((err) => console.error("Could not fetch subfestivals:", err));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [subfestivalSlug, slugKey]);

    const festInfo = subfestivalsMap[slugKey] || {
        name: subfestivalSlug ? subfestivalSlug.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Subfestival",
        category: "SHOWCASE",
        description: ""
    };

    const rawFestName = subfestival?.name || festInfo.name;
    const isKannada = language === "kn";
    const festName = isKannada && subfestival?.nameKn ? subfestival.nameKn : getSubfestivalName(rawFestName, isKannada);
    const festCategory = (subfestival?.category || festInfo.category || "SHOWCASE").toUpperCase();
    const festEyebrow = isKannada ? (subfestival?.eyebrowTextKn || "ಹಬ್ಬದ ಕುರಿತು") : (subfestival?.eyebrowText || festInfo.eyebrowText || "ABOUT THE FESTIVAL");
    const festDescEn = subfestival?.description || festInfo.description;
    const festDescKn = subfestival?.descriptionKn || festInfo.descriptionKn;
    const instagramLink = subfestival?.instagramUrl || festInfo.instagramUrl || "https://www.instagram.com/blrhubba/";

    const displayDesc = isKannada && festDescKn ? festDescKn : festDescEn;
    const isDisplayingKannada = isKannada && Boolean(festDescKn);

    const carouselImages = (subfestival?.carouselImages && Array.isArray(subfestival.carouselImages) && subfestival.carouselImages.length > 0)
        ? subfestival.carouselImages
        : [subfestivalListingImg];

    useEffect(() => {
        if (!carouselImages || carouselImages.length <= 1) return;
        const interval = setInterval(() => {
            setActiveDot((prev) => (prev + 1) % carouselImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [carouselImages.length]);

    const heroBanner = getHeroBanner(subfestivalSlug, rawFestName);
    const heroBannerMobile = getHeroBannerMobile(subfestivalSlug, rawFestName);
    const isCustomBanner = heroBanner !== defaultHeroBg;

    if (isLoading) {
        return (
            <div className="subfestival-detail-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader text={isKannada ? "ಹಬ್ಬವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading Festival..."} />
            </div>
        );
    }

    return (
        <div className="subfestival-detail-page">
            {/* HERO BANNER SECTION (Pixel-Perfect Figma Frame 2407 & 628749) */}
            <div className="subfestival-detail-hero-wrapper">
                <MotionSection
                    className={`subfestival-detail-hero-card ${!isCustomBanner ? "fallback-card" : ""}`}
                    variant="fadeIn"
                >
                    {isCustomBanner ? (
                        <>
                            <picture className="subfestival-detail-hero-picture">
                                {heroBannerMobile && (
                                    <source media="(max-width: 768px)" srcSet={heroBannerMobile} />
                                )}
                                <img
                                    src={heroBanner}
                                    alt={`${festName} Hero Banner`}
                                    className="subfestival-detail-hero-banner-img"
                                />
                            </picture>
                            <h1 className="sr-only">{festName} - {festCategory}</h1>
                        </>
                    ) : (
                        <>
                            <span className="subfestival-detail-hero-subtitle">{festCategory}</span>
                            <h1 className="subfestival-detail-hero-title">{festName}</h1>
                        </>
                    )}
                </MotionSection>
            </div>

            {/* SUBFESTIVAL DETAIL INFO SECTION (Figma Frame 2423 & 2422) */}
            <div className="subfestival-info-container">
                <div className="subfestival-info-grid">

                    {/* LEFT COLUMN: CAROUSEL / SLIDER */}
                    <div className="subfestival-carousel-col">
                        <div className="subfestival-carousel-img-wrapper">
                            <div
                                className="subfestival-carousel-track"
                                style={{ transform: `translateX(-${activeDot * 100}%)` }}
                            >
                                {carouselImages.map((imgSrc, idx) => (
                                    <div key={idx} className="subfestival-carousel-slide">
                                        <img
                                            src={imgSrc}
                                            alt={`${festName} slide ${idx + 1}`}
                                            className="subfestival-carousel-img"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PAGINATION DOTS (24px gap below image) */}
                        {carouselImages.length > 1 && (
                            <div className="subfestival-carousel-dots">
                                {carouselImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`subfestival-carousel-dot ${activeDot === idx ? "active" : ""}`}
                                        onClick={() => setActiveDot(idx)}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: INFO CONTENT (Frame 2422 & 626875) */}
                    <div className="subfestival-info-content-col">
                        <span className={`subfestival-info-eyebrow ${isKannada ? "kannada" : ""}`}>{festEyebrow}</span>
                        <h2 className={`subfestival-info-title ${isKannada ? "kannada" : ""}`}>{festName}</h2>

                        {displayDesc && (
                            <p className={`subfestival-info-paragraph ${isDisplayingKannada ? "kannada" : "english"}`}>
                                {displayDesc}
                            </p>
                        )}

                        {/* INSTAGRAM FOLLOW BADGE (Frame 1000004146) */}
                        <a
                            href={instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="subfest-instagram-box"
                        >
                            <div className="subfest-instagram-icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                    <g clipPath="url(#clip0_3283_25612)">
                                        <path d="M17.327 24.97H7.64759C3.43352 24.97 0.00390855 21.5404 0.00390855 17.3263V7.64692C0.000666952 3.42961 3.43027 0 7.64435 0H17.3237C21.5378 0 24.9674 3.42961 24.9674 7.64368V17.3231C24.9674 21.5372 21.5378 24.9668 17.3237 24.9668L17.327 24.97ZM7.64435 1.8704C4.4611 1.8704 1.86783 4.46043 1.86783 7.64692V17.3263C1.86783 20.5096 4.45786 23.1028 7.64435 23.1028H17.3237C20.507 23.1028 23.1003 20.5128 23.1003 17.3263V7.64692C23.1003 4.46368 20.5102 1.8704 17.3237 1.8704H7.64435Z" fill="white" />
                                        <path d="M12.4826 18.8011C9.00112 18.8011 6.16797 15.968 6.16797 12.4865C6.16797 9.00503 9.00112 6.17188 12.4826 6.17188C15.9641 6.17188 18.7972 9.00503 18.7972 12.4865C18.7972 15.968 15.9641 18.8011 12.4826 18.8011ZM12.4826 8.08442C10.0546 8.08442 8.08051 10.0585 8.08051 12.4865C8.08051 14.9145 10.0546 16.8886 12.4826 16.8886C14.9105 16.8886 16.8847 14.9145 16.8847 12.4865C16.8847 10.0585 14.9105 8.08442 12.4826 8.08442Z" fill="white" />
                                        <path d="M21.1327 5.48162C21.1327 6.38927 20.3968 7.12511 19.4892 7.12511C18.5815 7.12511 17.8457 6.38927 17.8457 5.48162C17.8457 4.57398 18.5815 3.83813 19.4892 3.83813C20.3968 3.83813 21.1327 4.57398 21.1327 5.48162Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_3283_25612">
                                            <rect width="24.97" height="24.97" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <span className={`subfest-instagram-text ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? <>ಹೆಚ್ಚಿನ ಅಪ್‌ಡೇಟ್‌ಗಳಿಗಾಗಿ ನಮ್ಮ<br />ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಪುಟವನ್ನು ಫಾಲೋ ಮಾಡಿ.</>
                                    : <>Follow us on Instagram for<br />more updates.</>}
                            </span>
                        </a>
                    </div>

                </div>
            </div>

            {/* EVENT CALENDAR LISTING SECTION (Hidden for 2027) */}

            {/* OTHER FESTIVALS SECTION (Figma Frame 2422) */}
            <FestivalsSection subtitle="OTHER FESTIVALS" excludeSlug={subfestivalSlug || subfestival?.slug} />
        </div>
    );
};

export default SubfestivalDetailPage;
