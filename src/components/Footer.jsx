import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./Footer.css";
import footerBg from "../assets/footer_img.png";
import instagramIcon from "../assets/instagram_icon.png";
import blrHubbaWhiteLogo from "../assets/BLR_Hubba_white_logo.png";

export const Footer = () => {
    const { language } = useLanguage();
    const isKannada = language === "kn";

    return (
        <section style={{ overflow: "hidden" }}>
            <footer className="main-footer" style={{ backgroundImage: `url(${footerBg})` }}>
                <div className="footer-container">
                    {/* Stay Connected Header */}
                    <div className="footer-header">
                        <span className={`footer-subtitle ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? "ಸಂಪರ್ಕದಲ್ಲಿರಿ" : "STAY CONNECTED"}
                        </span>
                        <h2 className={`footer-title ${isKannada ? "kannada" : ""}`}>
                            {isKannada ? (
                                <>
                                    ಪ್ರಮುಖ ಮಾಹಿತಿ, ಕಾರ್ಯಕ್ರಮಗಳ ವಿವರ ಹಾಗೂ ಇನ್ನಿತರ<br />
                                    ಸುದ್ದಿಗಳನ್ನು ಎಲ್ಲರಿಗಿಂತ ಮೊದಲು ತಿಳಿದುಕೊಳ್ಳಿ.
                                </>
                            ) : (
                                <>Be the first to know about<br />announcements, events, and more.</>
                            )}
                        </h2>
                    </div>

                    {/* Newsletter & Social Cards Row */}
                    <div className="footer-cards-grid">
                        {/* Card 1: Mailing List */}
                        <div className="footer-card">
                            <div className="card-top">
                                <div className="card-icon-badge">
                                    {/* <img src={emailIcon} alt="Email Icon" className="footer-card-icon" /> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="28" viewBox="0 0 34 28" fill="none">
                                        <path d="M32.1999 23.75L21.5714 14M12.4286 14L1.80006 23.75M1 5.875L14.0639 15.1626C15.1217 15.9147 15.6507 16.2907 16.226 16.4364C16.7342 16.565 17.2658 16.565 17.774 16.4364C18.3493 16.2907 18.8783 15.9147 19.9361 15.1626L33 5.875M8.68 27H25.32C28.0083 27 29.3524 27 30.3792 26.4687C31.2823 26.0013 32.0166 25.2555 32.4768 24.3382C33 23.2954 33 21.9303 33 19.2V8.8C33 6.06974 33 4.70462 32.4768 3.6618C32.0166 2.74451 31.2823 1.99873 30.3792 1.53134C29.3524 1 28.0083 1 25.32 1H8.68C5.99175 1 4.64762 1 3.62085 1.53134C2.71767 1.99873 1.98336 2.74451 1.52317 3.6618C1 4.70462 1 6.06974 1 8.8V19.2C1 21.9303 1 23.2954 1.52317 24.3382C1.98336 25.2555 2.71767 26.0013 3.62085 26.4687C4.64762 27 5.99175 27 8.68 27Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className={`card-category ${isKannada ? "kannada" : ""}`}>
                                    {isKannada ? "ಇಮೇಲ್ ಪಟ್ಟಿಗೆ ಸೇರಿಕೊಳ್ಳಿ" : "JOIN OUR MAILING LIST"}
                                </span>
                                <h3 className={`card-desc ${isKannada ? "kannada" : ""}`}>
                                    {isKannada
                                        ? "ಕಾರ್ಯಕ್ರಮದ ವೇಳಾಪಟ್ಟಿ, ಕಾರ್ಯಕ್ರಮ ಸ್ಥಳದ ಬದಲಾವಣೆಗಳ ಮಾಹಿತಿ ಮತ್ತು ಹಬ್ಬದ ಪ್ರಮುಖ ಪ್ರಕಟಣೆಗಳನ್ನು ತಕ್ಷಣ ಪಡೆಯಿರಿ."
                                        : "Get regular updates on all things Hubba, delivered straight to your inbox"}
                                </h3>
                            </div>
                            <a
                                href="https://blrhubba.us22.list-manage.com/subscribe?u=4043cb80addb40cb6659fb0ed&id=499f089b00"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-link-btn-wrapper"
                            >
                                <button
                                    type="button"
                                    className={`card-btn ${isKannada ? "kannada" : ""}`}
                                    onClick={() => window.open("https://blrhubba.us22.list-manage.com/subscribe?u=4043cb80addb40cb6659fb0ed&id=499f089b00", "_blank", "noopener,noreferrer")}
                                >
                                    <span className="btn-text-primary">{isKannada ? "ಜೊತೆಗೂಡಿ" : "JOIN"}</span>
                                    <span className="btn-text-secondary">{isKannada ? "ಜೊತೆಗೂಡಿ" : "JOIN"}</span>
                                </button>
                            </a>
                        </div>

                        {/* Card 2: WhatsApp Channel */}
                        <div className="footer-card">
                            <div className="card-top">
                                <div className="card-icon-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                                        <path d="M30.625 17.5C30.625 24.7487 24.7487 30.625 17.5 30.625C14.7352 30.625 12.17 29.7701 10.0545 28.3102L5.56818 29.4318L6.7438 25.0233C5.25101 22.8929 4.375 20.2988 4.375 17.5C4.375 10.2513 10.2513 4.375 17.5 4.375C24.7487 4.375 30.625 10.2513 30.625 17.5Z" fill="black" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.5 32.8125C25.9569 32.8125 32.8125 25.9569 32.8125 17.5C32.8125 9.04314 25.9569 2.1875 17.5 2.1875C9.04314 2.1875 2.1875 9.04314 2.1875 17.5C2.1875 20.2463 2.91047 22.8237 4.17646 25.0523L2.1875 32.8125L10.1881 30.9573C12.3609 32.1403 14.8519 32.8125 17.5 32.8125ZM17.5 30.4567C24.6558 30.4567 30.4567 24.6558 30.4567 17.5C30.4567 10.3442 24.6558 4.54327 17.5 4.54327C10.3442 4.54327 4.54327 10.3442 4.54327 17.5C4.54327 20.2629 5.40805 22.8238 6.8817 24.9268L5.72115 29.2788L10.1499 28.1717C12.2384 29.6128 14.7706 30.4567 17.5 30.4567Z" fill="white" />
                                        <path d="M13.6719 10.3906C13.3078 9.65938 12.7493 9.72412 12.1851 9.72412C11.1768 9.72412 9.60449 10.9319 9.60449 13.1798C9.60449 15.022 10.4163 17.0386 13.1517 20.0553C15.7916 22.9666 19.2603 24.4726 22.1399 24.4213C25.0195 24.3701 25.612 21.892 25.612 21.0552C25.612 20.6843 25.3818 20.4992 25.2233 20.4489C24.242 19.978 22.4321 19.1005 22.0203 18.9356C21.6085 18.7707 21.3934 18.9937 21.2598 19.115C20.8863 19.4709 20.1461 20.5197 19.8926 20.7556C19.6391 20.9916 19.2612 20.8722 19.104 20.783C18.5253 20.5508 16.9563 19.8529 15.7057 18.6405C14.1589 17.1411 14.0682 16.6253 13.7768 16.1661C13.5436 15.7988 13.7147 15.5734 13.8001 15.4749C14.1333 15.0903 14.5935 14.4967" fill="white" />
                                    </svg>
                                </div>
                                <span className={`card-category ${isKannada ? "kannada" : ""}`}>
                                    {isKannada ? "ವಾಟ್ಸಾಪ್ ಚಾನೆಲ್ ಸೇರಿಕೊಳ್ಳಿ" : "JOIN OUR WHATSAPP CHANNEL"}
                                </span>
                                <h3 className={`card-desc ${isKannada ? "kannada" : ""}`}>
                                    {isKannada
                                        ? "ಹಬ್ಬದ ಎಲ್ಲ ಆಗುಹೋಗುಗಳ ಮಾಸಿಕ ಮಾಹಿತಿಯನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಇನ್‌ಬಾಕ್ಸ್‌ಗೆ ಪಡೆಯಿರಿ."
                                        : "Receive instant schedule alerts, venue updates, and important festival announcements"}
                                </h3>
                            </div>
                            <a href="https://whatsapp.com/channel/0029VbBLXjEDTkKCLujIe93w" target="_blank" rel="noopener noreferrer" className="card-link-btn-wrapper">
                                <button
                                    type="button"
                                    className={`card-btn ${isKannada ? "kannada" : ""}`}
                                    onClick={() => window.open("https://whatsapp.com/channel/0029VbBLXjEDTkKCLujIe93w", "_blank", "noopener,noreferrer")}
                                >
                                    <span className="btn-text-primary">{isKannada ? "ಜೊತೆಗೂಡಿ" : "JOIN"}</span>
                                    <span className="btn-text-secondary">{isKannada ? "ಜೊತೆಗೂಡಿ" : "JOIN"}</span>
                                </button>
                            </a>
                        </div>

                        {/* Card 3: Instagram */}
                        <div className="footer-card">
                            <div className="card-top">
                                <div className="card-icon-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                        <path d="M16.0012 0C11.6558 0 11.1104 0.0190003 9.40376 0.096667C7.70041 0.174667 6.53773 0.444333 5.52039 0.84C4.46805 1.24867 3.57537 1.79533 2.68603 2.685C1.79602 3.57433 1.24935 4.467 0.839342 5.519C0.442671 6.53667 0.172669 7.69967 0.096001 9.40233C0.0200002 11.109 0 11.6547 0 16C0 20.3453 0.0193338 20.889 0.096668 22.5957C0.175002 24.299 0.444671 25.4617 0.840009 26.479C1.24901 27.5313 1.79569 28.424 2.68536 29.3133C3.57437 30.2033 4.46705 30.7513 5.51872 31.16C6.53673 31.5557 7.69975 31.8253 9.40276 31.9033C11.1094 31.981 11.6545 32 15.9995 32C20.3452 32 20.8889 31.981 22.5956 31.9033C24.2989 31.8253 25.4629 31.5557 26.4809 31.16C27.533 30.7513 28.4243 30.2033 29.3133 29.3133C30.2033 28.424 30.75 27.5313 31.16 26.4793C31.5533 25.4617 31.8233 24.2987 31.9033 22.596C31.98 20.8893 32 20.3453 32 16C32 11.6547 31.98 11.1093 31.9033 9.40267C31.8233 7.69933 31.5533 6.53667 31.16 5.51933C30.75 4.467 30.2033 3.57433 29.3133 2.685C28.4233 1.795 27.5333 1.24833 26.4799 0.84C25.4599 0.444333 24.2966 0.174667 22.5932 0.096667C20.8866 0.0190003 20.3432 0 15.9965 0H16.0012ZM14.5658 2.88333C14.9918 2.88267 15.4672 2.88333 16.0012 2.88333C20.2732 2.88333 20.7796 2.89867 22.4666 2.97533C24.0266 3.04667 24.8733 3.30733 25.4373 3.52633C26.1839 3.81633 26.7163 4.163 27.276 4.723C27.836 5.283 28.1826 5.81633 28.4733 6.563C28.6923 7.12633 28.9533 7.973 29.0243 9.533C29.101 11.2197 29.1176 11.7263 29.1176 15.9963C29.1176 20.2663 29.101 20.773 29.0243 22.4597C28.953 24.0197 28.6923 24.8663 28.4733 25.4297C28.1833 26.1763 27.836 26.708 27.276 27.2677C26.7159 27.8277 26.1843 28.1743 25.4373 28.4643C24.8739 28.6843 24.0266 28.9443 22.4666 29.0157C20.7799 29.0923 20.2732 29.109 16.0012 29.109C11.7288 29.109 11.2224 29.0923 9.53577 29.0157C7.97575 28.9437 7.12907 28.683 6.56473 28.464C5.81806 28.174 5.28472 27.8273 4.72472 27.2673C4.16471 26.7073 3.81804 26.1753 3.52737 25.4283C3.30837 24.865 3.04737 24.0183 2.97636 22.4583C2.8997 20.7717 2.88436 20.265 2.88436 15.9923C2.88436 11.7197 2.8997 11.2157 2.97636 9.529C3.0477 7.969 3.30837 7.12233 3.52737 6.55833C3.81737 5.81167 4.16471 5.27833 4.72472 4.71833C5.28472 4.15833 5.81806 3.81167 6.56473 3.521C7.12874 3.301 7.97575 3.041 9.53577 2.96933C11.0118 2.90267 11.5838 2.88267 14.5658 2.87933V2.88333ZM24.5419 5.54C24.1621 5.54 23.7909 5.65262 23.4751 5.86362C23.1594 6.07463 22.9133 6.37453 22.768 6.7254C22.6227 7.07627 22.5847 7.46236 22.6588 7.83482C22.733 8.20728 22.9159 8.54939 23.1845 8.81788C23.4531 9.08637 23.7953 9.26918 24.1678 9.34319C24.5402 9.4172 24.9263 9.37908 25.2771 9.23366C25.628 9.08824 25.9278 8.84204 26.1387 8.52621C26.3496 8.21038 26.4621 7.8391 26.4619 7.45933C26.4619 6.39933 25.6019 5.53933 24.5419 5.53933V5.54ZM16.0012 7.78333C11.4635 7.78333 7.78441 11.4623 7.78441 16C7.78441 20.5377 11.4635 24.215 16.0012 24.215C20.5389 24.215 24.2169 20.5377 24.2169 16C24.2169 11.4623 20.5389 7.78333 16.0012 7.78333ZM16.0012 10.6667C18.9465 10.6667 21.3346 13.0543 21.3346 16C21.3346 18.9453 18.9465 21.3333 16.0012 21.3333C13.0555 21.3333 10.6678 18.9453 10.6678 16C10.6678 13.0543 13.0555 10.6667 16.0012 10.6667Z" fill="white" />
                                    </svg>
                                </div>
                                <span className={`card-category ${isKannada ? "kannada" : ""}`}>
                                    {isKannada ? "ಇನ್ಸ್ಟಾಗ್ರಾಮಿನಲ್ಲಿ ಫಾಲೋ ಮಾಡಿ" : "FOLLOW US ON INSTAGRAM"}
                                </span>
                                <h3 className={`card-desc ${isKannada ? "kannada" : ""}`}>
                                    {isKannada
                                        ? "ಹಬ್ಬದ ಆಗುಹೋಗುಗಳು ಮತ್ತು ಹೊಸ ಕಾರ್ಯಕ್ರಮಗಳ ಪರಿಚಯಕ್ಕಾಗಿ ನಮ್ಮ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳನ್ನು ಹಿಂಬಾಲಿಸಿ"
                                        : "Follow us on socials for regular updates and lineup reveals"}
                                </h3>
                            </div>
                            <a href="https://www.instagram.com/blrhubba" target="_blank" rel="noopener noreferrer" className="card-link-btn-wrapper">
                                <button
                                    type="button"
                                    className={`card-btn ${isKannada ? "kannada" : ""}`}
                                    onClick={() => window.open("https://www.instagram.com/blrhubba", "_blank", "noopener,noreferrer")}
                                >
                                    <span className="btn-text-primary">{isKannada ? "ಫಾಲೋ ಮಾಡಿ" : "FOLLOW US"}</span>
                                    <span className="btn-text-secondary">{isKannada ? "ಫಾಲೋ ಮಾಡಿ" : "FOLLOW US"}</span>
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Banner Buttons Row */}
                    <div className="footer-banner-buttons">
                        <a href="https://forms.gle/ZFsijZZGC71BHJ7p8" target="_blank" rel="noopener noreferrer" className={`banner-btn ${isKannada ? "kannada" : ""}`}>
                            <span>{isKannada ? "ಸ್ವಯಂಸೇವಕರಾಗಿ ಜೊತೆಗೂಡಿ" : "VOLUNTEER WITH US"}</span>
                            <div className="banner-arrow">
                                <div className="arrow-footer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                        <path d="M11.4417 6.20437L1.91599 15L0 13.2339L9.33368 4.48072C5.76468 5.2635 3.4396 4.55398 0.534307 2.63753L2.66736 0C5.68536 2.94216 10.1727 3.05784 13.6165 0.55527L15.5951 2.32519C12.8818 5.45244 13.0613 9.67866 16 12.6208L13.245 14.4177C11.2872 12 10.6235 9.31234 11.4375 6.20051L11.4417 6.20437Z" fill="black" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                        <Link to="/contact-us" className={`banner-btn ${isKannada ? "kannada" : ""}`}>
                            <span>{isKannada ? "ಸಂಪರ್ಕಿಸಿ" : "CONTACT US"}</span>
                            <div className="banner-arrow">
                                <div className="arrow-footer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
                                        <path d="M11.4417 6.20437L1.91599 15L0 13.2339L9.33368 4.48072C5.76468 5.2635 3.4396 4.55398 0.534307 2.63753L2.66736 0C5.68536 2.94216 10.1727 3.05784 13.6165 0.55527L15.5951 2.32519C12.8818 5.45244 13.0613 9.67866 16 12.6208L13.245 14.4177C11.2872 12 10.6235 9.31234 11.4375 6.20051L11.4417 6.20437Z" fill="black" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Bottom Links Area */}
                    <div className="footer-bottom-grid">
                        {/* Brand column */}
                        <div className="footer-grid-logo">
                            <div className="footer-brand-col">
                                <div className="footer-logo-container">
                                    <img src={blrHubbaWhiteLogo} alt="BLR Hubba Logo" className="footer-brand-logo-img" />
                                </div>
                                <p className={`footer-brand-desc ${isKannada ? "kannada" : ""}`}>
                                    {isKannada
                                        ? "ಬೆಂಗಳೂರಿನ ಸೃಜನಶೀಲ ಸ್ಪಂದನ ಮತ್ತು ಬೌದ್ಧಿಕ ಚೈತನ್ಯವನ್ನು ಸಂಭ್ರಮಿಸುವ ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಪ್ರಮುಖ ಉತ್ಸವ ನಮ್ಮದು. ನಮ್ಮ ಉತ್ಸವದ ನಾಲ್ಕನೇ ಆವೃತ್ತಿ ೨೦೨೭ರ ಜನವರಿ ೧೫ರಿಂದ ೨೪ರವರೆಗೆ ನಡೆಯಲಿದೆ."
                                        : "We are a premier arts and culture festival, celebrating Bengaluru's creative and intellectual pulse. Our fourth edition is scheduled from 15-24 January 2027."}
                                </p>
                                <p className="footer-anchored-by">
                                    Anchored by <a href="https://unboxingblr.com" target="_blank" rel="noopener noreferrer" className="footer-anchored-link">Unboxing BLR</a>
                                </p>
                                <div className="footer-social-links">
                                    <a href="https://www.linkedin.com/company/blr-hubba/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                            <path d="M18.041 0H17.959C8.04053 0 0 8.04052 0 17.959V18.041C0 27.9595 8.04053 36 17.959 36H18.041C27.9595 36 36 27.9595 36 18.041V17.959C36 8.04052 27.9595 0 18.041 0Z" fill="white" />
                                            <path d="M8.58507 11.9655C8.11084 11.5253 7.875 10.9804 7.875 10.3321C7.875 9.68386 8.1121 9.11503 8.58507 8.67359C9.0593 8.23341 9.66975 8.0127 10.4177 8.0127C11.1656 8.0127 11.7521 8.23341 12.2251 8.67359C12.6993 9.11377 12.9351 9.66746 12.9351 10.3321C12.9351 10.9968 12.698 11.5253 12.2251 11.9655C11.7508 12.4056 11.1492 12.6264 10.4177 12.6264C9.68615 12.6264 9.0593 12.4056 8.58507 11.9655ZM12.5366 14.4905V27.9859H8.27228V14.4905H12.5366Z" fill="black" />
                                            <path d="M26.7321 15.8236C27.6616 16.8326 28.1258 18.2174 28.1258 19.9807V27.7475H24.0759V20.528C24.0759 19.6389 23.8451 18.9477 23.3847 18.4558C22.9244 17.9639 22.3038 17.7167 21.5269 17.7167C20.75 17.7167 20.1294 17.9627 19.669 18.4558C19.2087 18.9477 18.9779 19.6389 18.9779 20.528V27.7475H14.9041V14.4526H18.9779V16.2158C19.3903 15.6281 19.9466 15.1639 20.6453 14.8221C21.344 14.4803 22.1298 14.3101 23.0038 14.3101C24.5602 14.3101 25.8038 14.8146 26.7321 15.8223V15.8236Z" fill="black" />
                                        </svg>
                                    </a>
                                    <a href="https://www.youtube.com/@BLR_Hubba" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                            <path d="M36 18C36 8.05887 27.9411 0 18 0C8.05889 0 0 8.05887 0 18C0 27.9411 8.05889 36 18 36C27.9411 36 36 27.9411 36 18Z" fill="white" />
                                            <path d="M29.3351 14.2701C29.1934 12.9028 28.8886 11.3913 27.7667 10.597C26.8977 9.98102 25.7555 9.95825 24.6893 9.95952C22.4353 9.95952 20.1801 9.96331 17.9262 9.96458C15.7582 9.96711 13.5903 9.96837 11.4223 9.9709C10.5167 9.9709 9.63635 9.90133 8.79523 10.2934C8.073 10.6299 7.50762 11.2699 7.16738 11.982C6.69559 12.9724 6.59694 14.0943 6.54002 15.1897C6.43504 17.1843 6.44642 19.184 6.57164 21.1774C6.66397 22.632 6.89797 24.2396 8.02241 25.1667C9.01911 25.9876 10.4256 26.0281 11.7183 26.0294C15.8214 26.0332 19.9259 26.037 24.0303 26.0395C24.5565 26.0407 25.1054 26.0306 25.6417 25.9725C26.6966 25.8586 27.7021 25.5563 28.3801 24.7746C29.0644 23.9866 29.2402 22.89 29.3439 21.8516C29.5969 19.332 29.5943 16.7884 29.3351 14.2701ZM15.5533 21.5316V14.4674L21.6701 17.9989L15.5533 21.5316Z" fill="black" />
                                        </svg>
                                    </a>
                                    <a href="https://www.instagram.com/blrhubba" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                            <path d="M18.041 0H17.959C8.04052 0 0 8.04052 0 17.959V18.041C0 27.9595 8.04052 36 17.959 36H18.041C27.9595 36 36 27.9595 36 18.041V17.959C36 8.04052 27.9595 0 18.041 0Z" fill="white" />
                                            <path d="M23.571 7.32373H12.4316C9.35418 7.32373 6.85059 9.82732 6.85059 12.9048V23.0957C6.85059 26.1732 9.35418 28.6768 12.4316 28.6768H23.571C26.6485 28.6768 29.1521 26.1732 29.1521 23.0957V12.9048C29.1521 9.82732 26.6485 7.32373 23.571 7.32373ZM8.81941 12.9048C8.81941 10.9133 10.4401 9.29255 12.4316 9.29255H23.571C25.5626 9.29255 27.1833 10.9133 27.1833 12.9048V23.0957C27.1833 25.0872 25.5626 26.708 23.571 26.708H12.4316C10.4401 26.708 8.81941 25.0872 8.81941 23.0957V12.9048Z" fill="black" />
                                            <path d="M18.0019 23.1903C20.8637 23.1903 23.1932 20.862 23.1932 17.9989C23.1932 15.1359 20.8649 12.8076 18.0019 12.8076C15.1388 12.8076 12.8105 15.1359 12.8105 17.9989C12.8105 20.862 15.1388 23.1903 18.0019 23.1903ZM18.0019 14.7777C19.779 14.7777 21.2244 16.2231 21.2244 18.0002C21.2244 19.7773 19.779 21.2227 18.0019 21.2227C16.2248 21.2227 14.7794 19.7773 14.7794 18.0002C14.7794 16.2231 16.2248 14.7777 18.0019 14.7777Z" fill="black" />
                                            <path d="M23.6729 13.6466C24.4435 13.6466 25.0716 13.0197 25.0716 12.2479C25.0716 11.476 24.4448 10.8491 23.6729 10.8491C22.901 10.8491 22.2742 11.476 22.2742 12.2479C22.2742 13.0197 22.901 13.6466 23.6729 13.6466Z" fill="white" />
                                        </svg>
                                    </a>
                                    <a href="https://www.facebook.com/blrhubba" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                            <path d="M35.9975 18.0005C35.9975 27.0915 29.2588 34.6073 20.5048 35.8269C19.6862 35.9404 18.8488 35.9997 17.9987 35.9997C17.0175 35.9997 16.054 35.9215 15.1156 35.7702C6.54568 34.3904 0 26.9591 0 18.0005C0 8.05935 8.05914 0 18 0C27.9409 0 36 8.05935 36 18.0005H35.9975Z" fill="white" />
                                            <path d="M20.504 14.4541V18.3754H25.3546L24.5866 23.6575H20.504V35.8272C19.6855 35.9407 18.8481 36 17.998 36C17.0168 36 16.0532 35.9218 15.1149 35.7705V23.6575H10.6414V18.3754H15.1149V13.5776C15.1149 10.601 17.5276 8.18701 20.5053 8.18701V8.18954C20.5141 8.18954 20.5217 8.18701 20.5305 8.18701H25.3559V12.7552H22.2029C21.2658 12.7552 20.5053 13.5158 20.5053 14.4529L20.504 14.4541Z" fill="black" />
                                        </svg>
                                    </a>
                                    <a href="https://x.com/blrhubba" target="_blank" rel="noopener noreferrer" aria-label="X" className="social-circle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                            <path d="M35.9975 18.0006C35.9975 27.0918 29.2588 34.6076 20.5048 35.8272C19.6862 35.9407 18.8488 36 17.9987 36C17.0175 36 16.054 35.9218 15.1156 35.7705C6.54568 34.3906 0 26.9593 0 18.0006C0 8.05942 8.05913 0 18 0C27.9409 0 36 8.05942 36 18.0006H35.9975Z" fill="white" />
                                            <path d="M7.30025 7.93896L15.6015 19.038L7.24854 28.0623H9.12901L16.4428 20.1618L22.3515 28.0623H28.7497L19.9817 16.3389L27.7571 7.93896H25.8766L19.1417 15.2151L13.6996 7.93896H7.3015H7.30025ZM10.0648 9.32382H13.0034L25.9826 26.6774H23.0439L10.0648 9.32382Z" fill="black" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="footer-links-wrapper footer-about-column">
                            {/* About Us column */}
                            <div className="footer-links-col">
                                <h4 className={`footer-col-title ${isKannada ? "kannada" : ""}`}>{isKannada ? "ನಮ್ಮ ಬಗ್ಗೆ" : "About Us"}</h4>
                                <ul className="footer-links-list">
                                    <li><Link to="/about-us" className={isKannada ? "kannada" : ""}>{isKannada ? "ಹಬ್ಬದ ಕುರಿತು" : "About the Festival"}</Link></li>
                                    <li><Link to="/our-team" className={isKannada ? "kannada" : ""}>{isKannada ? "ನಮ್ಮ ತಂಡ" : "Our Team"}</Link></li>
                                    <li><Link to="/faqs" className={isKannada ? "kannada" : ""}>{isKannada ? "ಪ್ರಶ್ನೋತ್ತರಗಳು" : "FAQs"}</Link></li>
                                </ul>
                            </div>

                            {/* Archive column */}
                            <div className="footer-links-col">
                                <h4 className={`footer-col-title ${isKannada ? "kannada" : ""}`}>{isKannada ? "ದಾಖಲೆ ಭಂಡಾರ" : "Archives"}</h4>
                                <ul className="footer-links-list">
                                    <li><Link to="/archives" className={isKannada ? "kannada" : ""}>{isKannada ? "ಹಬ್ಬ ೨೦೨೩" : "Hubba 2023"}</Link></li>
                                    <li><Link to="/archives" className={isKannada ? "kannada" : ""}>{isKannada ? "ಹಬ್ಬ ೨೦೨೪" : "Hubba 2024"}</Link></li>
                                    <li><Link to="/archives" className={isKannada ? "kannada" : ""}>{isKannada ? "ಹಬ್ಬ ೨೦೨೬" : "Hubba 2026"}</Link></li>
                                </ul>
                            </div>

                            {/* Contact Us column */}
                            <div className="links-subgroup-div">
                                <div className="links-subgroup contact-subgroup">
                                    <h4 className={`footer-col-title ${isKannada ? "kannada" : ""}`}>{isKannada ? "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ" : "Contact Us"}</h4>
                                    <ul className="footer-links-list">
                                        <li>
                                            <a href="mailto:support@blrhubba.in">support@blrhubba.in</a>
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Copyright Line */}
                    {/* <div className="footer-divider-line"></div> */}

                </div>
            </footer>
            <div className={`footer-copyright-row ${isKannada ? "kannada" : ""}`}>
                <div className="copyright-row-container">
                    <span className={`copyright-text ${isKannada ? "kannada" : ""}`}>{isKannada ? "ಕೃತಿಸ್ವಾಮ್ಯ © ೨೦೨೭. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ." : "Copyright © 2027. All rights reserved."}</span>
                    <div className="legal-links">
                        <Link to="/privacy-policy" className={isKannada ? "kannada" : ""}>{isKannada ? "ಗೌಪ್ಯತಾ ನೀತಿ" : "Privacy Policy"}</Link>
                        <Link to="/terms-of-service" className={isKannada ? "kannada" : ""}>{isKannada ? "ಸೇವಾ ಬಳಕೆಯ ನಿಯಮಗಳು" : "Terms of Service"}</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Footer;