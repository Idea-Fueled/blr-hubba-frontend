import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { MotionButton } from "../../components/AnimatedPage";
import SponsorsSection from "../../components/SponsorsSection/SponsorsSection";
import "../Home/Homepage.css";
import "./ArchivesPage.css";
import img1 from "../../assets/archive-images/archive-image-1.png";
import img2 from "../../assets/archive-images/archive-image-2.png";
import img3 from "../../assets/archive-images/archive-image-3.png";
import img4 from "../../assets/archive-images/archive-image-4.png";
import img5 from "../../assets/archive-images/archive-image-5.png";
import img6 from "../../assets/archive-images/archive-image-6.png";
import mobileImg1 from "../../assets/archive-page-mobile/img-1.png";
import mobileImg2 from "../../assets/archive-page-mobile/img-2.png";
import mobileImg3 from "../../assets/archive-page-mobile/img-3.png";
import mobileImg4 from "../../assets/archive-page-mobile/img-4.png";
import archive2023VideoThumb from "../../assets/archive-2023/video-image.png";
import archive2024VideoThumb from "../../assets/archive-2024-images/video-image/video0image-2024.png";
import archive2026VideoThumb from "../../assets/archive-2026-images/2026-video-image/image-1.png";
import aboutUsVideoThumb from "../../assets/home-page-about-img.png";
import aboutUsMobileImg from "../../assets/home-page-about-img-mobile.png";

// 2024 Subfestivals 12 Images
import archive2024_1 from "../../assets/archive-2024-images/archive-2024-image-1.png";
import archive2024_2 from "../../assets/archive-2024-images/archive-2024-image-2.png";
import archive2024_3 from "../../assets/archive-2024-images/archive-2024-image-3.png";
import archive2024_4 from "../../assets/archive-2024-images/archive-2024-image-4.png";
import archive2024_5 from "../../assets/archive-2024-images/archive-2024-image-5.png";
import archive2024_6 from "../../assets/archive-2024-images/archive-2024-image-6.png";
import archive2024_7 from "../../assets/archive-2024-images/archive-2024-image-7.png";
import archive2024_8 from "../../assets/archive-2024-images/archive-2024-image-8.png";
import archive2024_9 from "../../assets/archive-2024-images/archive-2024-image-9.png";
import archive2024_10 from "../../assets/archive-2024-images/archive-2024-image-10.png";
import archive2024_11 from "../../assets/archive-2024-images/archive-2024-image-11.png";
import archive2024_12 from "../../assets/archive-2024-images/archive-2024-image-12.png";

// 2026 Subfestivals 12 Images
import subImg1 from "../../assets/archive-2026-images/image-1.png";
import subImg2 from "../../assets/archive-2026-images/image-2.png";
import subImg3 from "../../assets/archive-2026-images/image-3.png";
import subImg4 from "../../assets/archive-2026-images/image-4.png";
import subImg5 from "../../assets/archive-2026-images/image-5.png";
import subImg6 from "../../assets/archive-2026-images/image-6.png";
import subImg7 from "../../assets/archive-2026-images/image-7.png";
import subImg8 from "../../assets/archive-2026-images/image-8.png";
import subImg9 from "../../assets/archive-2026-images/image-9.png";
import subImg10 from "../../assets/archive-2026-images/image-10.png";
import subImg11 from "../../assets/archive-2026-images/image-11.png";
import subImg12 from "../../assets/archive-2026-images/image-12.png";

// 2026 Photo Gallery Images (Globbing all images in archive-2026-photo-gallery)
const photo2026Glob = import.meta.glob("../../assets/archive-2026-images/archive-2026-photo-gallery/*.{jpg,JPG,jpeg,JPEG,PNG,png,webp,WEBP}", { eager: true });
const PHOTO_GALLERY_2026_ITEMS = Object.keys(photo2026Glob).sort((a, b) => {
    const numA = parseInt(a.match(/image-(\d+)/i)?.[1] || 0, 10);
    const numB = parseInt(b.match(/image-(\d+)/i)?.[1] || 0, 10);
    return numA - numB;
}).map((path, idx) => ({
    id: idx + 1,
    src: photo2026Glob[path].default || photo2026Glob[path],
    alt: `BLR Hubba 2026 Highlight ${idx + 1}`
}));

// 2024 Photo Gallery Images (Globbing all images in photo-gallery-2024)
const photo2024Glob = import.meta.glob("../../assets/archive-2024-images/photo-gallery-2024/*.{jpg,JPG,jpeg,JPEG,PNG,png,webp,WEBP}", { eager: true });
const PHOTO_GALLERY_2024_ITEMS = Object.keys(photo2024Glob).sort((a, b) => {
    const numA = parseInt(a.match(/image-(\d+)/i)?.[1] || 0, 10);
    const numB = parseInt(b.match(/image-(\d+)/i)?.[1] || 0, 10);
    return numA - numB;
}).map((path, idx) => ({
    id: idx + 1,
    src: photo2024Glob[path].default || photo2024Glob[path],
    alt: `BLR Hubba 2024 Highlight ${idx + 1}`
}));

const ARCHIVE_HERO_IMAGES = [
    { id: 1, src: img1, alt: "Classical Dancer on pink background", isOdd: true },
    { id: 2, src: img2, alt: "Sculpture on green background", isOdd: false },
    { id: 3, src: img3, alt: "Rock Guitarist on purple background", isOdd: true },
    { id: 4, src: img4, alt: "Yakshagana Performer on cyan background", isOdd: false },
    { id: 5, src: img5, alt: "Mask Theatre on yellow background", isOdd: true },
    { id: 6, src: img6, alt: "Folk Dancer on pink background", isOdd: false }
];

const ARCHIVE_HERO_MOBILE_IMAGES = [
    { id: 1, src: mobileImg1, alt: "Folk Performer", size: "small" },
    { id: 2, src: mobileImg2, alt: "Classical Dancer", size: "large" },
    { id: 3, src: mobileImg3, alt: "Yakshagana Performer", size: "small" },
    { id: 4, src: mobileImg4, alt: "Theatre Mask", size: "large" }
];

const EDITIONS = [
    { id: "1st", label: "1ST EDITION", labelKn: "ಮೊದಲ ಆವೃತ್ತಿ", date: "DEC 2023", dateKn: "ಡಿಸೆಂಬರ್ ೨೦೨೩" },
    { id: "2nd", label: "2ND EDITION", labelKn: "ಎರಡನೇ ಆವೃತ್ತಿ", date: "DEC 2024", dateKn: "ಡಿಸೆಂಬರ್ ೨೦೨೪" },
    { id: "3rd", label: "3RD EDITION", labelKn: "ಮೂರನೇ ಆವೃತ್ತಿ", date: "JAN 2026", dateKn: "ಜನವರಿ ೨೦೨೬" }
];

const EDITION_CONTENT = {
    "1st": {
        editionLabel: "FIRST EDITION",
        editionLabelKn: "ಮೊದಲ ಆವೃತ್ತಿ",
        title: "Bengaluru Hubba 2023",
        titleKn: "ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೩",
        videoThumb: archive2023VideoThumb,
        videoUrl: "https://youtu.be/tCu6SxlGDnU?si=rRbGEDJRWBWTO_PH",
        videoEmbedUrl: "https://www.youtube-nocookie.com/embed/tCu6SxlGDnU?autoplay=1",
        p1: "The inaugural edition, then called Unboxing BLR Habba, saw nearly 500 events take place across 70+ locations over 11 days.",
        p1Kn: "ಆರಂಭದಲ್ಲಿ ‘ಅನ್ಬಾಕ್ಸಿಂಗ್ ಬಿಎಲ್ಆರ್ ಹಬ್ಬ’ ಎಂಬ ಹೆಸರಿನಲ್ಲಿ ಶುರುವಾದ ಈ ಹಬ್ಬದ ಮೊದಲ ಆವೃತ್ತಿ, ೧೧ ದಿನಗಳ ಕಾಲ ಬೆಂಗಳೂರಿನ ೭೦ಕ್ಕೂ ಹೆಚ್ಚು ತಾಣಗಳಲ್ಲಿ ಸುಮಾರು ೫೦೦ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಸಾಕ್ಷಿಯಾಯಿತು.",
        p2: "Theatre, music, film, heritage walks, food, literature and design were all part of the mix, with close to 45 partner organisations bringing their own events and ideas to the festival. It was our first look at what a city-wide festival could be.",
        p2Kn: "ರಂಗಭೂಮಿ, ಸಂಗೀತ, ಚಲನಚಿತ್ರ, ಪರಂಪರೆಯ ನಡಿಗೆ, ಆಹಾರ, ಸಾಹಿತ್ಯ, ವಿನ್ಯಾಸ—ಹೀಗೆ ನಗರದ ಸಾಂಸ್ಕೃತಿಕ ವೈವಿಧ್ಯವೇ ಇಲ್ಲಿ ಮೇಳೈಸಿತ್ತು. ಸುಮಾರು ೪೫ ಸಹಭಾಗಿ ಸಂಸ್ಥೆಗಳು ತಮ್ಮದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಹೊಸ ಆಲೋಚನೆಗಳೊಂದಿಗೆ ಈ ಸಂಭ್ರಮಕ್ಕೆ ಜೊತೆಯಾದವು. ಇಡೀ ನಗರವನ್ನೇ ಒಂದು ಹಬ್ಬವಾಗಿ ಬೆಸೆಯುವ ಕನಸಿಗೆ ಮೊದಲ ರೂಪ ಸಿಕ್ಕಿದ್ದು ಹೀಗೆ."
    },
    "2nd": {
        editionLabel: "SECOND EDITION",
        editionLabelKn: "ಎರಡನೇ ಆವೃತ್ತಿ",
        title: "Bengaluru Hubba 2024",
        titleKn: "ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೪",
        videoThumb: archive2024VideoThumb,
        videoUrl: "https://youtu.be/4hQf1PCUa4I?si=y4XnFbp0PKimcHPR",
        videoEmbedUrl: "https://www.youtube-nocookie.com/embed/4hQf1PCUa4I?autoplay=1",
        p1: "The second edition of BLR Hubba took place between Nov 30–Dec 15 and expanded to 10 subfestivals including music, dance, theatre, technology and heritage.",
        p1Kn: "ಬಿಎಲ್ಆರ್ ಹಬ್ಬದ ಎರಡನೇ ಆವೃತ್ತಿ ನವೆಂಬರ್ ೩೦ರಿಂದ ಡಿಸೆಂಬರ್ ೧೫ರವರೆಗೆ ನಡೆಯಿತು. ಸಂಗೀತ, ನೃತ್ಯ, ರಂಗಭೂಮಿ, ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಪರಂಪರೆ ಸೇರಿದಂತೆ ಹತ್ತು ಉಪಹಬ್ಬಗಳ ಮೂಲಕ ಈ ಬಾರಿಯ ಹಬ್ಬ ಇನ್ನಷ್ಟು ವಿಸ್ತಾರಗೊಂಡಿತು.",
        p2: "More than 70% of the events were free, which meant there was plenty to dip into without opening your wallet. Events took place across historic city venues such as Freedom Park, Panchavati, Sabha, and NGMA.",
        p2Kn: "ಶೇಕಡಾ ೭೦ಕ್ಕೂ ಹೆಚ್ಚು ಕಾರ್ಯಕ್ರಮಗಳು ಉಚಿತವಾಗಿದ್ದರಿಂದ, ಹಣದ ಚಿಂತೆ ಇಲ್ಲದೆ ನಗರದ ಸಾಂಸ್ಕೃತಿಕ ಸಂಭ್ರಮದಲ್ಲಿ ಎಲ್ಲರೂ ಪಾಲ್ಗೊಳ್ಳಲು ಸಾಕಷ್ಟು ಅವಕಾಶಗಳಿದ್ದವು. ಫ್ರೀಡಂ ಪಾರ್ಕ್, ಪಂಚವಟಿ, ಸಭಾ ಮತ್ತು ಎನ್ಜಿಎಂಎಯಂತಹ ನಗರದ ಐತಿಹಾಸಿಕ ಹಾಗೂ ಸಾಂಸ್ಕೃತಿಕ ತಾಣಗಳಲ್ಲಿ ಕಾರ್ಯಕ್ರಮಗಳು ನಡೆದವು. ಹೀಗೆ, ನಗರದ ವೈವಿಧ್ಯಮಯ ಕಲಾ ಪ್ರಕಾರಗಳನ್ನು ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ ಸಂಭ್ರಮಿಸುವ ಹಬ್ಬ ಮತ್ತಷ್ಟು ಜನರನ್ನು ತನ್ನತ್ತ ಸೆಳೆಯಿತು."
    },
    "3rd": {
        editionLabel: "THIRD EDITION",
        editionLabelKn: "ಮೂರನೇ ಆವೃತ್ತಿ",
        title: "Bengaluru Hubba 2026",
        titleKn: "ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೬",
        videoThumb: archive2026VideoThumb,
        videoUrl: "https://www.youtube.com/watch?v=1rv3t5bX-gQ",
        videoEmbedUrl: "https://www.youtube-nocookie.com/embed/1rv3t5bX-gQ?autoplay=1",
        p1: "Our biggest edition yet, BLR Hubba 2026 took place from Jan 16–25, bringing together 12 subfestivals and 350+ events across 30+ venues in the city. Events stretched from Freedom Park, Sabha and Panchavati to BIC, NGMA, Alliance Française and PCPA, bringing the festival to different corners of Bengaluru.",
        p1Kn: "ಇದುವರೆಗಿನ ಅತಿ ದೊಡ್ಡ ಆವೃತ್ತಿಯಾದ ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೬, ಜನವರಿ ೧೬ರಿಂದ ೨೫ರವರೆಗೆ ನಡೆಯಿತು. ನಗರದ ೩೦ಕ್ಕೂ ಹೆಚ್ಚು ತಾಣಗಳಲ್ಲಿ ೧೨ ಉಪಹಬ್ಬಗಳು ಹಾಗೂ ೩೫೦ಕ್ಕೂ ಅಧಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ನಡೆದವು. ಫ್ರೀಡಂ ಪಾರ್ಕ್, ಸಭಾ, ಪಂಚವತಿಯಿಂದ ಹಿಡಿದು ಬಿಐಸಿ, ಎನ್ಜಿಎಂಎ, ಅಲಯನ್ಸ್ ಫ್ರಾಂಸೇಸ್ ಮತ್ತು ಪಿಸಿಪಿಎವರೆಗೆ ನಗರದ ಹಲವು ತಾಣಗಳಲ್ಲಿ ಹಬ್ಬದ ಕಾರ್ಯಕ್ರಮಗಳು ನಡೆದವು. ಹೀಗೆ, ಬೆಂಗಳೂರಿನ ವಿವಿಧ ಮೂಲೆಗಳಿಗೂ ಹಬ್ಬದ ಸಂಭ್ರಮ ಹರಡಿತು."
    }
};

const ARCHIVE_2024_SUBFESTIVALS = [
    {
        id: 1,
        src: archive2024_1,
        title: "KANTHA",
        titleKn: "ಕಾಂತಾ",
        description: "Kantha intertwined diverse musical traditions and narratives across Asia into a rich tapestry of sound. Over 16 days at Freedom Park, 38 artists performed rock, fusion, folk, classical and jazz.",
        descriptionKn: "ಏಷ್ಯಾದ ಹಲವಾರು ಸಂಗೀತ ಪರಂಪರೆಗಳು ಮತ್ತು ಕಥನಗಳನ್ನು ಒಂದಕ್ಕೊಂದು ಬೆಸೆದು, ನಾದದ ಶ್ರೀಮಂತ ಲೋಕವನ್ನೇ ಕಾಂತಾ ಹಬ್ಬ ಅನಾವರಣಗೊಳಿಸಿತು. ಫ್ರೀಡಂ ಪಾರ್ಕ್ನಲ್ಲಿ ೧೬ ದಿನಗಳ ಕಾಲ ನಡೆದ ಈ ಸಂಗೀತ ಸಂಭ್ರಮದಲ್ಲಿ ೩೮ ಕಲಾವಿದರು ರಾಕ್, ಫ್ಯೂಷನ್, ಜಾನಪದ, ಶಾಸ್ತ್ರೀಯ ಮತ್ತು ಜಾಝ್ ಸಂಗೀತ ಪ್ರಕಾರಗಳನ್ನು ಪ್ರಸ್ತುತಪಡಿಸಿದರು."
    },
    {
        id: 2,
        src: archive2024_2,
        title: "OFF/BEAT",
        titleKn: "ಆಫ್ಬೀಟ್",
        description: "Off/Beat took arts and culture beyond traditional venues into Bengaluru's historic, heritage-rich spaces, inviting urbanites to explore the city's rich legacy through immersive music, dance and theatre.",
        descriptionKn: "ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯನ್ನು ಸಾಂಪ್ರದಾಯಿಕ ವೇದಿಕೆಗಳಾಚೆಗೆ ಕೊಂಡೊಯ್ದ ಆಫ್ಬೀಟ್, ಬೆಂಗಳೂರಿನ ಐತಿಹಾಸಿಕ ಹಾಗೂ ಪರಂಪರೆಯ ತಾಣಗಳನ್ನೇ ಕಲೆಯ ತಾಣಗಳನ್ನಾಗಿ ರೂಪಿಸಿತು. ಸಂಗೀತ, ನೃತ್ಯ ಮತ್ತು ರಂಗಭೂಮಿಯ ವಿಶಿಷ್ಟ ಅನುಭವಗಳ ಮೂಲಕ ನಗರದ ಜನರಿಗೆ ಬೆಂಗಳೂರಿನ ಶ್ರೀಮಂತ ಪರಂಪರೆಯನ್ನು ಹೊಸ ರೀತಿಯಲ್ಲಿ ಕಂಡುಕೊಳ್ಳುವ, ಅನುಭವಿಸುವ ಅವಕಾಶವನ್ನು ಕಲ್ಪಿಸಿತು."
    },
    {
        id: 3,
        src: archive2024_3,
        title: "IN YOUR STREETS",
        titleKn: "ಇನ್ ಯೋರ್ ಸ್ಟ್ರೀಟ್ಸ್",
        description: "Hubba In Your Streets turned sidewalks into stages for musicians, indie bands, street performers and local artists, with street dancers, theatre groups and circus performers adding a dynamic element for passersby.",
        descriptionKn: "ನಗರದ ಕಾಲುದಾರಿಗಳನ್ನೇ ಕಲೆಯ ವೇದಿಕೆಗಳನ್ನಾಗಿ ರೂಪಿಸಿದ ಇನ್ ಯೋರ್ ಸ್ಟ್ರೀಟ್ಸ್, ಸಂಗೀತಗಾರರು, ಸ್ವತಂತ್ರ ಸಂಗೀತ ತಂಡಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಕಲಾವಿದರಿಗೆ ತಮ್ಮ ಪ್ರತಿಭೆಯನ್ನು ಅನಾವರಣಗೊಳಿಸಲು ಅವಕಾಶ ಕಲ್ಪಿಸಿತು. ಬೀದಿ ನೃತ್ಯ ಕಲಾವಿದರು, ರಂಗತಂಡಗಳು ಹಾಗೂ ಸರ್ಕಸ್ ಕಲಾವಿದರ ಪ್ರದರ್ಶನಗಳು ದಾರಿಹೋಕರಿಗೆ ಅನಿರೀಕ್ಷಿತ ಕಲಾನುಭವಗಳನ್ನು ಉಣಬಡಿಸಿದವು. ಹೀಗೆ, ನಗರದ ಬೀದಿಗಳೇ ಕಲೆ, ಸೃಜನಶೀಲತೆ ಮತ್ತು ಸಂಭ್ರಮದ ತಾಣಗಳಾಗಿ ಕಳೆಗಟ್ಟಿದವು."
    },
    {
        id: 4,
        src: archive2024_4,
        title: "FUTURES",
        titleKn: "ಫ್ಯೂಚರ್ಸ್",
        description: "Futures asked what it means to think, live and lead in an ever-evolving world — connecting the dots and peering over the horizon at the future of health, sport, journalism, human history, convenience and mobility.",
        descriptionKn: "ನಿರಂತರವಾಗಿ ಬದಲಾಗುತ್ತಿರುವ ಜಗತ್ತಿನಲ್ಲಿ ಆಲೋಚಿಸುವುದು, ಬದುಕುವುದು ಮತ್ತು ಮುನ್ನಡೆಸುವುದು ಎಂದರೇನು ಎಂಬ ಪ್ರಶ್ನೆಗಳನ್ನು ಫ್ಯೂಚರ್ಸ್ ಮುಂದಿಟ್ಟಿತು. ಆರೋಗ್ಯ, ಕ್ರೀಡೆ, ಪತ್ರಿಕೋದ್ಯಮ, ಮಾನವ ಇತಿಹಾಸ, ಬದುಕಿನ ಅನುಕೂಲಗಳು ಮತ್ತು ಸಂಚಾರದ ಭವಿಷ್ಯವನ್ನು ಅನ್ವೇಷಿಸುತ್ತಾ, ಇಂದಿನ ಬೆಳವಣಿಗೆಗಳ ನಡುವಿನ ಸಂಬಂಧಗಳನ್ನು ಬೆಸೆಯುವ ಮೂಲಕ ನಾಳಿನ ಸಾಧ್ಯತೆಗಳತ್ತ ನಮ್ಮ ದೃಷ್ಟಿಯನ್ನು ಹರಿಸಿತು."
    },
    {
        id: 5,
        src: archive2024_5,
        title: "GODE BLR",
        titleKn: "ಗೋಡೆ ಬಿಎಲ್ಆರ್",
        description: "Gode BLR opened a dialogue with the city and its people through art, transforming Bengaluru's walls into vibrant, thought-provoking murals reflecting its glorious history and unique sense of community.",
        descriptionKn: "ಕಲೆಯ ಮೂಲಕ ನಗರ ಮತ್ತು ಅದರ ಜನರ ನಡುವೆ ಸಂವಾದಕ್ಕೆ ದಾರಿಮಾಡಿಕೊಟ್ಟ ಗೋಡೆ ಬಿಎಲ್ಆರ್, ಬೆಂಗಳೂರಿನ ಗೋಡೆಗಳನ್ನು ಕಣ್ಮನ ಸೆಳೆಯುವ, ಚಿಂತನೆಗೆ ಹಚ್ಚುವ ಭಿತ್ತಿಚಿತ್ರಗಳಾಗಿ ಪರಿವರ್ತಿಸಿತು. ನಗರದ ವೈಭವದ ಇತಿಹಾಸ ಮತ್ತದರ ವಿಶಿಷ್ಟವಾದ ಸಮುದಾಯ ಭಾವನೆಯನ್ನು ಬಿಂಬಿಸುವ ಈ ಚಿತ್ರಗಳು ಬೆಂಗಳೂರಿನ ಗೋಡೆಗಳಿಗೆ ಹೊಸ ಬಣ್ಣ, ಹೊಸ ಕಥನ ಹಾಗೂ ಹೊಸ ಜೀವ ತುಂಬಿದವು."
    },
    {
        id: 6,
        src: archive2024_6,
        title: "GALA GALA GADDALA",
        titleKn: "ಗಲ ಗಲ ಗದ್ದಲ",
        description: "Gala Gala Gaddala celebrated Karnataka's many cultures and identities, its name itself a burst of joy — tinkling bells, bubbling laughter and unrestrained merrymaking.",
        descriptionKn: "ಕರ್ನಾಟಕದ ನಾನಾ ಸಂಸ್ಕೃತಿಗಳು ಮತ್ತು ವೈವಿಧ್ಯಮಯ ಅಸ್ಮಿತೆಗಳನ್ನು ಸಂಭ್ರಮಿಸಿದ ಗಲ ಗಲ ಗದ್ದಲ, ತನ್ನ ಹೆಸರಿನಲ್ಲೇ ಸಂತಸದ ಸದ್ದನ್ನು ಹೊಮ್ಮಿಸಿತು. ಗೆಜ್ಜೆಗಳ ಝಣಝಣ, ನಗೆಯ ಕಲರವ, ಸಂಭ್ರಮದ ಸಡಗರ—ಹೀಗೆ, ಎಲ್ಲೆ ಮೀರಿದ ಉಲ್ಲಾಸದೊಂದಿಗೆ ನಾಡಿನ ಬಹುಮುಖ ಸಾಂಸ್ಕೃತಿಕ ಸೊಬಗನ್ನು ಒಂದೆಡೆ ತಂದಿತು."
    },
    {
        id: 7,
        src: archive2024_7,
        title: "SPEAKLORE",
        titleKn: "ಸ್ಪೀಕ್ಲೋರ್",
        description: "Speaklore brought together ancient and contemporary storytelling practices like improv comedy, performance poetry and playback theatre to the city.",
        descriptionKn: "ಪ್ರಾಚೀನ ಮತ್ತು ಸಮಕಾಲೀನ ಕಥನ ಪರಂಪರೆಗಳನ್ನು ಒಂದೆಡೆ ತಂದ ಸ್ಪೀಕ್ಲೋರ್, ಇಂಪ್ರೊವ್ ಹಾಸ್ಯ, ಕಾವ್ಯ ಪ್ರದರ್ಶನ ಮತ್ತು ಪ್ಲೇಬ್ಯಾಕ್ ರಂಗಭೂಮಿಯಂತಹ ವಿಭಿನ್ನ ಕಲಾಪ್ರಕಾರಗಳನ್ನು ಬೆಂಗಳೂರಿನ ಜನರಿಗೆ ಪರಿಚಯಿಸಿತು."
    },
    {
        id: 8,
        src: archive2024_8,
        title: "FESTIVAL OF HAND...",
        titleKn: "ಫೆಸ್ಟಿವಲ್ ಆಫ್ ಹ್ಯಾಂಡ್ಮೇಡ್ ಅಂಡ್ ವಿಷುವಲ್ ಆರ್ಟ್",
        backTitleKn: "ಫೆಸ್ಟಿವಲ್ ಆಫ್ ಹ್ಯಾಂಡ್‌ಮೇಡ್\nಅಂಡ್ ವಿಷುವಲ್ ಆರ್ಟ್",
        description: "Festival of Handmade & Visual Art united artisans and enthusiasts in celebrating handmade crafts, workshops and creativity, with organisers making a start in visual arts through an Art for All initiative.",
        descriptionKn: "ಕರಕುಶಲ ಕಲೆ, ಕಾರ್ಯಾಗಾರ ಮತ್ತು ಸೃಜನಶೀಲತೆಯ ಸಂಭ್ರಮಕ್ಕಾಗಿ ಕುಶಲಕರ್ಮಿಗಳು ಹಾಗೂ ಕಲಾಸಕ್ತರನ್ನು ಒಂದೆಡೆ ತಂದ ಈ ಉತ್ಸವ, ‘ಆರ್ಟ್ ಫಾರ್ ಆಲ್’ ಉಪಕ್ರಮದ ಮೂಲಕ ದೃಶ್ಯಕಲೆಗಳಿಗೂ ಹೊಸ ಹೆಜ್ಜೆಯಿಟ್ಟಿತು."
    },
    {
        id: 9,
        src: archive2024_9,
        title: "THE MAKERS' TRAIL",
        titleKn: "ದಿ ಮೇಕರ್ಸ್ ಟ್ರೇಲ್",
        description: "The Makers' Trail offered a design walkthrough for the connoisseur and the curious, exploring the design process, material innovations and sustainable practices blending tradition and contemporary sensibilities.",
        descriptionKn: "ವಿನ್ಯಾಸಾಸಕ್ತರಿಗೂ ಕುತೂಹಲಿಗಳಿಗೂ ವಿನ್ಯಾಸದ ಲೋಕವನ್ನು ಪರಿಚಯಿಸಿದ ಈ ಪಯಣ, ವಿನ್ಯಾಸ ಪ್ರಕ್ರಿಯೆ, ವಸ್ತುಗಳಲ್ಲಿನ ಹೊಸ ಪ್ರಯೋಗಗಳು ಹಾಗೂ ಪರಂಪರೆ ಮತ್ತು ಸಮಕಾಲೀನ ಅಭಿರುಚಿಗಳನ್ನು ಬೆಸೆಯುವ ಸುಸ್ಥಿರ ಪದ್ಧತಿಗಳನ್ನು ಅನಾವರಣಗೊಳಿಸಿತು."
    },
    {
        id: 10,
        src: archive2024_10,
        title: "WORLD DANCE",
        titleKn: "ವರ್ಲ್ಡ್ ಡ್ಯಾನ್ಸ್",
        description: "World Dance brought together established and upcoming choreographers and dancers from around the world, presenting award-winning and globally renowned artists from Italy, UK and India.",
        descriptionKn: "ಜಗತ್ತಿನ ಹೆಸರಾಂತ ಹಾಗೂ ಉದಯೋನ್ಮುಖ ನೃತ್ಯ ಸಂಯೋಜಕರು ಮತ್ತು ಕಲಾವಿದರನ್ನು ಒಂದೆಡೆ ತಂದ ವರ್ಲ್ಡ್ ಡ್ಯಾನ್ಸ್, ಇಟಲಿ, ಬ್ರಿಟನ್ ಮತ್ತು ಭಾರತದ ಪ್ರಶಸ್ತಿ ವಿಜೇತ ಹಾಗೂ ಅಂತರರಾಷ್ಟ್ರೀಯ ಖ್ಯಾತಿಯ ಕಲಾವಿದರ ಪ್ರದರ್ಶನಗಳನ್ನು ಪರಿಚಯಿಸಿತು."
    },
    {
        id: 11,
        src: archive2024_11,
        title: "ALT FEST",
        titleKn: "ಆಲ್ಟ್ ಫೆಸ್ಟ್",
        description: "Alt Fest highlighted experimental, alternative and critical art, providing a platform for emerging artists often overlooked by traditional festivals — spanning music, theatre, dance, exhibitions, tech art, installations and workshops.",
        descriptionKn: "ಪ್ರಯೋಗಶೀಲ, ಪರ್ಯಾಯ ಮತ್ತು ವಿಮರ್ಶಾತ್ಮಕ ಕಲಾಪ್ರಕಾರಗಳಿಗೆ ವೇದಿಕೆಯಾದ ಆಲ್ಟ್ ಫೆಸ್ಟ್, ಸಾಂಪ್ರದಾಯಿಕ ಉತ್ಸವಗಳಲ್ಲಿ ಅವಕಾಶ ವಂಚಿತರಾಗುವ ಉದಯೋನ್ಮುಖ ಕಲಾವಿದರಿಗೆ ತಮ್ಮ ಕಲೆಯನ್ನು ಅಭಿವ್ಯಕ್ತಿಸಲು ಅವಕಾಶ ಕಲ್ಪಿಸಿತು. ಸಂಗೀತ, ರಂಗಭೂಮಿ, ನೃತ್ಯ, ಪ್ರದರ್ಶನಗಳು, ತಂತ್ರಜ್ಞಾನಾಧಾರಿತ ಕಲೆ, ಕಲಾ ಸ್ಥಾಪನೆಗಳು ಮತ್ತು ಕಾರ್ಯಾಗಾರಗಳು ಇದರ ಭಾಗವಾಗಿದ್ದವು."
    },
    {
        id: 12,
        src: archive2024_12,
        title: "BLR WALK FEST",
        titleKn: "ಬಿಎಲ್ಆರ್ ವಾಕ್ ಫೆಸ್ಟ್",
        description: "BLR Walk Fest showed the city has over 100 kms of walkable footpaths, as a harbinger of good news walked, ran and chatted with fellow citizens every morning, countering Bengaluru's reputation for roads, traffic and civic woes.",
        descriptionKn: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ೧೦೦ ಕಿ.ಮೀ.ಗೂ ಹೆಚ್ಚು ದೂರದ ಕಾಲುದಾರಿಗಳಿವೆ ಎಂಬುದನ್ನು ಪರಿಚಯಿಸಿದ ಬಿಎಲ್ಆರ್ ವಾಕ್ ಫೆಸ್ಟ್, ನಗರದ ರಸ್ತೆ, ಸಂಚಾರ ದಟ್ಟಣೆ ಮತ್ತು ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳಾಚೆಗಿನ ಮತ್ತೊಂದು ಮುಖವನ್ನು ತೆರೆದಿಟ್ಟಿತು. ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಸಹನಾಗರಿಕರೊಂದಿಗೆ ನಡೆಯುತ್ತಾ, ಓಡುತ್ತಾ, ಹರಟುತ್ತಾ, ಒಳ್ಳೆಯ ಸುದ್ದಿಯ ಮುನ್ಸೂಚನೆಯಾಗಿ ಈ ನಡಿಗೆ ಹಬ್ಬ ಸಾಗಿತು."
    }
];

const ARCHIVE_2026_SUBFESTIVALS = [
    {
        id: 1,
        title: "CHURUMURI HUBBA",
        titleKn: "ಚುರುಮುರಿ ಹಬ್ಬ",
        src: subImg1,
        alt: "Churumuri Hubba",
        description: "Churumuri Hubba brought audiences experimental and boundary-pushing work across theatre, music and dance.",
        descriptionKn: "ರಂಗಭೂಮಿ, ಸಂಗೀತ ಮತ್ತು ನೃತ್ಯದಲ್ಲಿ ಹೊಸ ಪ್ರಯೋಗಗಳಿಗೆ ಹಾಗೂ ಸಾಂಪ್ರದಾಯಿಕವಾದ  ಎಲ್ಲೆಗಳನ್ನು ಮೀರಿದ ಕಲಾಭಿವ್ಯಕ್ತಿಗಳಿಗೆ ಚುರುಮುರಿ ಹಬ್ಬ ವೇದಿಕೆಯಾಯಿತು."
    },
    {
        id: 2,
        title: "KALA HUBBA",
        titleKn: "ಕಲಾ ಹಬ್ಬ",
        src: subImg2,
        alt: "Kala Hubba",
        description: "A public arts project across the city, with Freedom Park as its flagship venue, Kala Hubba invited people to engage with art while exploring ideas of solidarity, mental well-being and care.",
        descriptionKn: "ನಗರದಾದ್ಯಂತ ನಡೆದ ಸಾರ್ವಜನಿಕ ಕಲಾ ಯೋಜನೆಯಾದ ಕಲಾ ಹಬ್ಬಕ್ಕೆ ಫ್ರೀಡಂ ಪಾರ್ಕ್ ಮುಖ್ಯ ವೇದಿಕೆಯಾಗಿತ್ತು. ಒಗ್ಗಟ್ಟು, ಮಾನಸಿಕ ಕ್ಷೇಮ ಮತ್ತು ಕಾಳಜಿಯ ಆಶಯಗಳನ್ನು ಅನ್ವೇಷಿಸುತ್ತಾ, ಕಲೆಯೊಂದಿಗೆ ಬೆರೆಯಲು ಜನರನ್ನು ಆಹ್ವಾನಿಸಿತು."
    },
    {
        id: 3,
        title: "KANTHA HUBBA",
        titleKn: "ಕಾಂತಾ ಹಬ್ಬ",
        src: subImg3,
        alt: "Kantha Hubba",
        description: "Kantha Hubba featured daily performances by local and international artists at Freedom Park.",
        descriptionKn: "ಫ್ರೀಡಂ ಪಾರ್ಕ್ನಲ್ಲಿ ಸ್ಥಳೀಯ ಹಾಗೂ ಅಂತರರಾಷ್ಟ್ರೀಯ ಕಲಾವಿದರ ಸಂಗೀತ ಪ್ರದರ್ಶನಗಳು ಪ್ರತಿದಿನ ನಡೆದವು."
    },
    {
        id: 4,
        title: "MAKKALA HUBBA",
        titleKn: "ಮಕ್ಕಳ ಹಬ್ಬ",
        src: subImg4,
        alt: "Makkala Hubba",
        description: "Hosted at Freedom Park, Makkala Hubba invited the city’s youngest residents to explore what a child-friendly space could look like in an urban metropolis.",
        descriptionKn: "ಫ್ರೀಡಂ ಪಾರ್ಕ್ನಲ್ಲಿ ನಡೆದ ಮಕ್ಕಳ ಹಬ್ಬ, ಮಹಾನಗರವೊಂದರಲ್ಲಿ ಮಕ್ಕಳಿಗೆ ಸ್ನೇಹಪರವಾದ ಜಾಗ ಹೇಗಿರಬಹುದು ಎಂಬುದನ್ನು ಅನ್ವೇಷಿಸಲು ನಗರದ ಪುಟಾಣಿಗಳನ್ನು ಆಹ್ವಾನಿಸಿತು."
    },
    {
        id: 5,
        title: "ANUBHAVA HUBBA",
        titleKn: "ಅನುಭವ ಹಬ್ಬ",
        src: subImg5,
        alt: "Anubhava Hubba",
        description: "Anubhava Hubba fostered interaction between artists and audiences, encouraging people to engage with art in public spaces.",
        descriptionKn: "ಕಲಾವಿದರು ಮತ್ತು ಜನರನ್ನು ಹತ್ತಿರ ತಂದ ಅನುಭವ ಹಬ್ಬ, ಸಾರ್ವಜನಿಕ ಸ್ಥಳಗಳಲ್ಲಿ ಕಲೆಯನ್ನು ನೋಡುವುದಷ್ಟೇ ಅಲ್ಲ, ಅದರೊಂದಿಗೆ ಬೆರೆತು ಸಂವಾದಿಸುವ ಅವಕಾಶವನ್ನೂ ಕಲ್ಪಿಸಿತು."
    },
    {
        id: 6,
        title: "FUTURES HUBBA",
        titleKn: "ಫ್ಯೂಚರ್ಸ್ ಹಬ್ಬ",
        src: subImg6,
        alt: "Futures Hubba",
        description: "Futures Hubba brought together leading national and international thinkers to imagine possible futures in a rapidly shifting technological era, across two days at Alliance Française and Bangalore International Centre.",
        descriptionKn: "ವೇಗವಾಗಿ ಬದಲಾಗುತ್ತಿರುವ ತಂತ್ರಜ್ಞಾನ ಯುಗದಲ್ಲಿ ಭವಿಷ್ಯದ ಸಾಧ್ಯತೆಗಳನ್ನು ಕಲ್ಪಿಸಿಕೊಳ್ಳಲು, ದೇಶ-ವಿದೇಶಗಳ ಚಿಂತಕರನ್ನು ಒಂದೆಡೆ ತಂದ ಫ್ಯೂಚರ್ಸ್ ಹಬ್ಬ, ಅಲಯನ್ಸ್ ಫ್ರಾಂಸೇಸ್ ಮತ್ತು ಬೆಂಗಳೂರು ಇಂಟರ್ನ್ಯಾಷನಲ್ ಸೆಂಟರ್ನಲ್ಲಿ ಎರಡು ದಿನಗಳ ಕಾಲ ನಡೆಯಿತು."
    },
    {
        id: 7,
        title: "NARTISU HUBBA",
        titleKn: "ನರ್ತಿಸು ಹಬ್ಬ",
        src: subImg7,
        alt: "Nartisu Hubba",
        description: "Nartisu Hubba featured dance across contemporary, folk and urban forms through commissions and community-led programmes.",
        descriptionKn: "ಸಮಕಾಲೀನ, ಜಾನಪದ ಮತ್ತು ನಗರ ನೃತ್ಯ ಪ್ರಕಾರಗಳನ್ನು ಒಂದೆಡೆ ತಂದ ನರ್ತಿಸು ಹಬ್ಬ, ವಿಶೇಷ ನೃತ್ಯ ಪ್ರಯೋಗಗಳು ಹಾಗೂ ಸಮುದಾಯದ ನೇತೃತ್ವದ ಕಾರ್ಯಕ್ರಮಗಳ ಮೂಲಕ ನೃತ್ಯದ ವೈವಿಧ್ಯವನ್ನು ಸಂಭ್ರಮಿಸಿತು."
    },
    {
        id: 8,
        title: "NATAKA HUBBA",
        titleKn: "ನಾಟಕ ಹಬ್ಬ",
        src: subImg8,
        alt: "Nataka Hubba",
        description: "Nataka Hubba 2026 spotlighted work across India that tackles urgent themes with inventive stagecraft and an unflinching sense of curiosity.",
        descriptionKn: "ಭಾರತದಾದ್ಯಂತದ ಸಮಕಾಲೀನ ರಂಗಪ್ರಯೋಗಗಳನ್ನು ಪರಿಚಯಿಸಿದ ನಾಟಕ ಹಬ್ಬ ೨೦೨೬, ಸೃಜನಶೀಲ ರಂಗವಿನ್ಯಾಸ ಮತ್ತು ನಿರ್ಭೀತ ಕುತೂಹಲದೊಂದಿಗೆ ಇಂದಿನ ತುರ್ತು ವಿಚಾರಗಳನ್ನು ಎದುರಿಸುವ ನಾಟಕಗಳಿಗೆ ವೇದಿಕೆಯಾಯಿತು."
    },
    {
        id: 9,
        title: "RASTHE HUBBA",
        titleKn: "ರಸ್ತೆ ಹಬ್ಬ",
        src: subImg9,
        alt: "Rasthe Hubba",
        description: "Rasthe Hubba brought the energy of hyper-local street markets to the Hubba across two weekends, with events ranging across 12 neighbourhoods.",
        descriptionKn: "ಎರಡು ವಾರಾಂತ್ಯಗಳಲ್ಲಿ ನಡೆದ ರಸ್ತೆ ಹಬ್ಬ, ೧೨ ಬಡಾವಣೆಗಳಲ್ಲಿ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಆಯೋಜಿಸುವ ಮೂಲಕ ಸ್ಥಳೀಯ ಬೀದಿ ಮಾರುಕಟ್ಟೆಗಳ ಸಡಗರ ಮತ್ತು ಚೈತನ್ಯವನ್ನು ಬೆಂಗಳೂರು ಹಬ್ಬದ ಅಂಗಳಕ್ಕೆ ತಂದಿತು."
    },
    {
        id: 10,
        title: "SPEAKLORE HUBBA",
        titleKn: "ಸ್ಪೀಕ್ಲೋರ್ ಹಬ್ಬ",
        src: subImg10,
        alt: "Speaklore Hubba",
        description: "Speaklore Hubba was a spoken-word mini-festival at the Hubba featuring storytelling, improv, playback theatre, folk and oral traditions, performance poetry, and other related formats.",
        descriptionKn: "ಕಥನ, ಇಂಪ್ರೊವ್ ಹಾಸ್ಯ, ಪ್ಲೇಬ್ಯಾಕ್ ರಂಗಭೂಮಿ, ಜಾನಪದ ಮತ್ತು ಮೌಖಿಕ ಪರಂಪರೆಗಳು, ಪರ್ಫಾರ್ಮೆನ್ಸ್ ಪೊಯಟ್ರಿ ಸೇರಿದಂತೆ ಮಾತು ಮತ್ತು ಅಭಿವ್ಯಕ್ತಿಯ ಹಲವು ಪ್ರಕಾರಗಳನ್ನು ಒಂದೆಡೆ ತಂದ ಕಿರು ಉತ್ಸವವಾಗಿತ್ತು ಸ್ಪೀಕ್ಲೋರ್ ಹಬ್ಬ."
    },
    {
        id: 11,
        title: "THINDI HUBBA",
        titleKn: "ತಿಂಡಿ ಹಬ್ಬ",
        src: subImg11,
        alt: "Thindi Hubba",
        description: "Also known as Thindipuram, Thindi Hubba celebrated India’s street food culture and was co-created by home chefs and street vendors at Freedom Park.",
        descriptionKn: "ತಿಂಡಿಪುರಂ ಎಂದೂ ಕರೆಯಲ್ಪಡುವ ತಿಂಡಿ ಹಬ್ಬ, ಭಾರತದ ಬೀದಿ ಆಹಾರ ಸಂಸ್ಕೃತಿಯನ್ನು ಸಂಭ್ರಮಿಸಿತು. ಫ್ರೀಡಂ ಪಾರ್ಕ್ನಲ್ಲಿ ಹೋಮ್ ಚೆಫ್ಗಳು ಮತ್ತು ಬೀದಿ ಆಹಾರ ಮಾರಾಟಗಾರರ ಸಹಭಾಗಿತ್ವದಲ್ಲಿ ಈ ಹಬ್ಬ ರೂಪುಗೊಂಡಿತು."
    },
    {
        id: 12,
        title: "VISHESHA HUBBA",
        titleKn: "ವಿಶೇಷ ಹಬ್ಬ",
        src: subImg12,
        alt: "Vishesha Hubba",
        description: "Vishesha Hubba highlighted Karnataka’s linguistic, cultural and artistic diversity through janapada folk art, music, dance, theatre, and more.",
        descriptionKn: "ಜನಪದ ಕಲೆ, ಸಂಗೀತ, ನೃತ್ಯ ಮತ್ತು ರಂಗಭೂಮಿ ಸೇರಿದಂತೆ ಹಲವು ಕಲಾಪ್ರಕಾರಗಳ ಮೂಲಕ ಕರ್ನಾಟಕದ ಭಾಷೆ, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಕಲಾತ್ಮಕ ವೈವಿಧ್ಯವನ್ನು ವಿಶೇಷ ಹಬ್ಬ ಸಂಭ್ರಮಿಸಿತು."
    }
];

export const ArchivesPage = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isKannada = language === "kn";
    const [activeEdition, setActiveEdition] = useState("3rd");
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [activePhotoModalIndex, setActivePhotoModalIndex] = useState(null);
    const photoGalleryRef = useRef(null);

    const currentGalleryItems = activeEdition === "2nd" ? PHOTO_GALLERY_2024_ITEMS : PHOTO_GALLERY_2026_ITEMS;

    const handleGalleryScroll = (direction) => {
        if (photoGalleryRef.current) {
            const scrollDistance = direction === "left" ? -344 : 344;
            photoGalleryRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
        }
    };

    const handlePrevPhotoModal = (e) => {
        if (e) e.stopPropagation();
        setActivePhotoModalIndex((prev) => (prev > 0 ? prev - 1 : currentGalleryItems.length - 1));
    };

    const handleNextPhotoModal = (e) => {
        if (e) e.stopPropagation();
        setActivePhotoModalIndex((prev) => (prev < currentGalleryItems.length - 1 ? prev + 1 : 0));
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activePhotoModalIndex === null) return;
            if (e.key === "Escape") setActivePhotoModalIndex(null);
            if (e.key === "ArrowLeft") handlePrevPhotoModal();
            if (e.key === "ArrowRight") handleNextPhotoModal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activePhotoModalIndex, currentGalleryItems]);

    return (
        <main className="archives-page">
            {/* TOP GALLERY RIBBON (Frame 1000004186) */}
            <section className="archives-hero-ribbon">
                <div className="archives-ribbon-track archives-ribbon-track-desktop">
                    {ARCHIVE_HERO_IMAGES.map((item) => (
                        <div
                            key={item.id}
                            className={`archives-ribbon-card ${item.isOdd ? "card-odd" : "card-even"}`}
                        >
                            <img
                                src={item.src}
                                alt={item.alt}
                                className="archives-ribbon-img"
                            />
                        </div>
                    ))}
                </div>

                <div className="archives-ribbon-track archives-ribbon-track-mobile">
                    {ARCHIVE_HERO_MOBILE_IMAGES.map((item) => (
                        <div
                            key={item.id}
                            className={`archives-ribbon-card card-mobile card-mobile-${item.size}`}
                        >
                            <img
                                src={item.src}
                                alt={item.alt}
                                className="archives-ribbon-img"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ARCHIVES HEADER BLOCK (Frame 628813) */}
            <section className="archives-header-section">
                <span className={`archives-header-eyebrow ${isKannada ? "kannada" : ""}`}>
                    {isKannada ? "ದಾಖಲೆ ಭಂಡಾರ" : "THE ARCHIVE"}
                </span>
                <h1 className={`archives-header-title ${isKannada ? "kannada" : ""}`}>
                    {isKannada ? (
                        "ವರ್ಷಗಳು ಉರುಳಿದಂತೆ ಬೆಳೆದು ಬಂದ ಬೆಂಗಳೂರು ಹಬ್ಬದ ಪಯಣದ ಸಂಭ್ರಮ."
                    ) : (
                        <>Celebrating the journey of Bengaluru<br className="archives-header-desktop-br" /> Hubba <br className="archives-header-mobile-br" />through the years.</>
                    )}
                </h1>
            </section>

            {/* EDITION TIMELINE SELECTOR */}
            <section className="archives-timeline-section">
                <div className="archives-timeline-track">
                    {EDITIONS.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            <button
                                className={`archives-timeline-tab ${activeEdition === item.id ? "active" : ""}`}
                                onClick={() => setActiveEdition(item.id)}
                            >
                                <span className={`timeline-tab-label ${isKannada ? "kannada" : ""}`}>
                                    {isKannada ? item.labelKn : item.label}
                                </span>
                                <span className={`timeline-tab-date ${isKannada ? "kannada" : ""}`}>
                                    {isKannada ? item.dateKn : item.date}
                                </span>
                            </button>
                            {idx < EDITIONS.length - 1 && (
                                <div className="archives-timeline-connector">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="1" viewBox="0 0 30 1" fill="none" className="connector-dashed-line">
                                        <path d="M0 0.5H30" stroke="#C3C3C3" strokeDasharray="6 6" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className="connector-circle">
                                        <circle cx="9" cy="9" r="7" fill="black" stroke="white" strokeWidth="4" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="1" viewBox="0 0 30 1" fill="none" className="connector-dashed-line">
                                        <path d="M0 0.5H30" stroke="#C3C3C3" strokeDasharray="6 6" />
                                    </svg>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* ARCHIVES ABOUT SECTION (Video + Frame 2423 Content) */}
            <section className="archives-about-section">
                <div className="archives-about-grid">
                    {/* Left Column: Video Card */}
                    <div className="archives-video-card" onClick={() => setIsVideoModalOpen(true)}>
                        <picture>
                            <source media="(max-width: 768px)" srcSet={EDITION_CONTENT[activeEdition]?.videoThumb || aboutUsMobileImg} />
                            <img
                                src={EDITION_CONTENT[activeEdition]?.videoThumb || aboutUsVideoThumb}
                                alt="Bengaluru Hubba Dance Performance"
                                className="archives-video-img"
                            />
                        </picture>
                        <button className="archives-play-btn" aria-label="Play festival video">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0 50C0 22.4 22.4 0 50 0C77.6 0 100 22.4 100 50C100 77.6 77.6 100 50 100C22.4 100 0 77.6 0 50ZM70 50L40 27.5V72.5L70 50Z" fill="white" fillOpacity="0.8" />
                            </svg>
                        </button>
                    </div>

                    {/* Right Column: Frame 2423 Info Card */}
                    <div className="archives-info-card">
                        <div className="archives-info-inner">
                            <span className={`archives-info-eyebrow ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? (EDITION_CONTENT[activeEdition]?.editionLabelKn || "ಮೊದಲ ಆವೃತ್ತಿ")
                                    : (EDITION_CONTENT[activeEdition]?.editionLabel || "FIRST EDITION")}
                            </span>
                            <h2 className={`archives-info-title ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? (EDITION_CONTENT[activeEdition]?.titleKn || "ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೩")
                                    : (EDITION_CONTENT[activeEdition]?.title || "Bengaluru Hubba 2023")}
                            </h2>
                            <div className="archives-info-body">
                                {isKannada ? (
                                    <>
                                        {EDITION_CONTENT[activeEdition]?.p1Kn && <p className="kannada">{EDITION_CONTENT[activeEdition].p1Kn}</p>}
                                        {EDITION_CONTENT[activeEdition]?.p2Kn && <p className="kannada">{EDITION_CONTENT[activeEdition].p2Kn}</p>}
                                    </>
                                ) : (
                                    <>
                                        {EDITION_CONTENT[activeEdition]?.p1 && <p>{EDITION_CONTENT[activeEdition].p1}</p>}
                                        {EDITION_CONTENT[activeEdition]?.p2 && <p>{EDITION_CONTENT[activeEdition].p2}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= 2024 SUB FESTIVALS SECTION (Frame 2422 & Frame 1000004237) ================= */}
            {activeEdition === "2nd" && (
                <section className="archives-subfestivals-section">
                    <div className="archives-subfestivals-header">
                        <span className={`archives-subfestivals-eyebrow ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಹಬ್ಬಗಳು" : "FESTIVALS"}
                        </span>
                        <h2 className={`archives-subfestivals-title ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೪ರ ಉಪಹಬ್ಬಗಳು" : "Festivals of BLR Hubba 2024"}
                        </h2>
                    </div>

                    <div className="archives-subfestivals-grid-2024">
                        {ARCHIVE_2024_SUBFESTIVALS.map((card) => (
                            <div key={card.id} className="archives-2024-card-flip-container">
                                <div className="archives-2024-card-inner">
                                    {/* Front Side */}
                                    <div className="archives-2024-card-front">
                                        <div className="archives-2024-card-img-wrapper">
                                            <img
                                                src={card.src}
                                                alt={isKannada ? (card.titleKn || card.title) : card.title}
                                                className="archives-2024-card-img"
                                            />
                                        </div>
                                        <div className="archives-2024-card-label-wrap">
                                            <span className={`archives-2024-card-title ${isKannada ? "kannada" : ""}`}>
                                                {isKannada ? (card.titleKn || card.title) : card.title}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="archives-2024-card-back">
                                        <div className="archives-2024-card-back-header">
                                            <span className={`archives-2024-card-back-title ${isKannada ? "kannada" : ""} ${(isKannada ? (card.backTitleKn || card.titleKn || card.title) : card.title).length > 20 ? "long-title" : ""}`}>
                                                {isKannada ? (card.backTitleKn || card.titleKn || card.title) : card.title}
                                            </span>
                                        </div>
                                        <div className="archives-2024-card-back-body">
                                            <p className={`archives-2024-card-back-desc ${isKannada ? "kannada" : ""}`}>
                                                {isKannada ? (card.descriptionKn || card.description) : (card.description || "")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ================= 2026 SUB FESTIVALS SECTION (Frame 1000004239 & Frame 1000004244) ================= */}
            {activeEdition === "3rd" && (
                <section className="archives-subfestivals-section">
                    <div className="archives-subfestivals-header">
                        <span className={`archives-subfestivals-eyebrow ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಹಬ್ಬಗಳು" : "FESTIVALS"}
                        </span>
                        <h2 className={`archives-subfestivals-title ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಬೆಂಗಳೂರು ಹಬ್ಬ ೨೦೨೬ರ ಉಪಹಬ್ಬಗಳು" : "Festivals of BLR Hubba 2026"}
                        </h2>
                    </div>

                    <div className="archives-subfestivals-grid">
                        {ARCHIVE_2026_SUBFESTIVALS.map((card) => (
                            card.description ? (
                                <div key={card.id} className="archives-2026-card-flip-container">
                                    <div className="archives-2026-card-inner">
                                        {/* Front Side */}
                                        <div className="archives-2026-card-front">
                                            <img
                                                src={card.src}
                                                alt={isKannada ? (card.titleKn || card.title) : card.alt}
                                                className="archives-subfestival-img"
                                            />
                                        </div>

                                        {/* Back Side */}
                                        <div className="archives-2026-card-back">
                                            <div className="archives-2026-card-back-header">
                                                <span className={`archives-2026-card-back-title ${isKannada ? "kannada" : ""}`}>
                                                    {isKannada ? (card.titleKn || card.title) : card.title}
                                                </span>
                                            </div>
                                            <div className="archives-2026-card-back-body">
                                                <p className={`archives-2026-card-back-desc ${isKannada ? "kannada" : ""}`}>
                                                    {isKannada ? (card.descriptionKn || card.description) : card.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div key={card.id} className="archives-2026-card-no-flip">
                                    <img
                                        src={card.src}
                                        alt={isKannada ? (card.titleKn || card.title) : card.alt}
                                        className="archives-subfestival-img"
                                    />
                                </div>
                            )
                        ))}
                    </div>


                </section>
            )}

            {/* ================= PHOTO GALLERY SECTION (For 2024 & 2026 Editions) ================= */}
            {(activeEdition === "2nd" || activeEdition === "3rd") && (
                <section className="archives-photo-gallery-section">
                    <div className="archives-photo-gallery-inner">
                        {/* Header Block (Frame 2422) */}
                        <div className="archives-photo-gallery-header">
                            <span className={`archives-photo-gallery-eyebrow ${isKannada ? "kannada" : ""}`}>
                                {isKannada ? "ಫೋಟೋ ಗ್ಯಾಲರಿ/ಚಿತ್ರಶಾಲೆ" : "PHOTO GALLERY"}
                            </span>
                            <h2 className={`archives-photo-gallery-title ${isKannada ? "kannada" : ""}`}>
                                {isKannada
                                    ? (activeEdition === "2nd" ? "೨೦೨೪ರ ಮುಖ್ಯ ಆಕರ್ಷಣೆಗಳು" : "೨೦೨೬ರ ಮುಖ್ಯ ಆಕರ್ಷಣೆಗಳು")
                                    : (activeEdition === "2nd" ? "Highlights from 2024" : "Highlights from 2026")
                                }
                            </h2>
                        </div>

                        {/* Slider Carousel Track (Frame 1916 / Frame 1917) */}
                        <div className="archives-photo-gallery-slider" ref={photoGalleryRef}>
                            {currentGalleryItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="archives-photo-gallery-card"
                                    onClick={() => setActivePhotoModalIndex(idx)}
                                >
                                    <img
                                        src={item.src}
                                        alt={item.alt}
                                        className="archives-photo-gallery-img"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrow Buttons (Frame 1679) */}
                        <div className="archives-photo-gallery-nav">
                            <button
                                className="archives-gallery-arrow-btn"
                                onClick={() => handleGalleryScroll("left")}
                                aria-label="Previous photo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M12 5L5 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                className="archives-gallery-arrow-btn"
                                onClick={() => handleGalleryScroll("right")}
                                aria-label="Next photo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12H19M12 19L19 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ================= OUR SPONSORS SECTION (All Editions) ================= */}
            <SponsorsSection />

            {/* Video Player Modal */}
            {isVideoModalOpen && (
                <div className="archives-video-modal-backdrop" onClick={() => setIsVideoModalOpen(false)}>
                    <div className="archives-video-modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="archives-video-modal-close" onClick={() => setIsVideoModalOpen(false)}>✕</button>
                        <div className="archives-video-wrapper">
                            <iframe
                                src={EDITION_CONTENT[activeEdition]?.videoEmbedUrl || "https://www.youtube-nocookie.com/embed/1rv3t5bX-gQ?autoplay=1"}
                                title={`${EDITION_CONTENT[activeEdition]?.title || "BLR Hubba"} Festival Video`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Lightbox Modal */}
            {activePhotoModalIndex !== null && currentGalleryItems[activePhotoModalIndex] && (
                <div className="archives-gallery-lightbox-backdrop" onClick={() => setActivePhotoModalIndex(null)}>
                    <div className="archives-gallery-lightbox-container" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="archives-gallery-lightbox-close"
                            onClick={() => setActivePhotoModalIndex(null)}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        <button
                            className="archives-gallery-lightbox-nav-btn prev"
                            onClick={handlePrevPhotoModal}
                            aria-label="Previous photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <img
                            src={currentGalleryItems[activePhotoModalIndex].src}
                            alt={currentGalleryItems[activePhotoModalIndex].alt}
                            className="archives-gallery-lightbox-img"
                        />

                        <button
                            className="archives-gallery-lightbox-nav-btn next"
                            onClick={handleNextPhotoModal}
                            aria-label="Next photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="archives-gallery-lightbox-counter">
                            {activePhotoModalIndex + 1} / {currentGalleryItems.length}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ArchivesPage;
