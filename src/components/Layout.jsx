import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./Navbar/Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "./ScrollToTop/ScrollToTop";
import { AnimatedPage } from "./AnimatedPage";
import { SmoothScroll } from "./SmoothScroll/SmoothScroll";
import { WebsiteLandingPopup } from "./WebsiteLandingPopup/WebsiteLandingPopup";
import { useLanguage } from "../context/LanguageContext";
import { syncGoogleTranslateOnNavigation } from "../utils/googleTranslate";

const NO_FOOTER_ROUTES = [
    "/book",
    "/review-order",
    "/cart-confirmation",
    "/cart",
    "/booking-confirmation",
    "/cancel-booking"
];

export const Layout = () => {
    const location = useLocation();
    const { language } = useLanguage();

    useEffect(() => {
        syncGoogleTranslateOnNavigation(language);
    }, [location.pathname, language]);

    const shouldShowFooter = !NO_FOOTER_ROUTES.some(path => location.pathname === path || location.pathname.startsWith(path + "/"));

    return (
        <SmoothScroll>
            <ScrollToTop />
            <Navbar />
            <AnimatePresence mode="wait">
                <AnimatedPage key={location.pathname}>
                    <Outlet />
                </AnimatedPage>
            </AnimatePresence>
            {shouldShowFooter && <Footer />}
            <WebsiteLandingPopup />
        </SmoothScroll>
    );
};