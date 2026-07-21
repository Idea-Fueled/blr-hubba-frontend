import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar/Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "./ScrollToTop/ScrollToTop";

export const Layout = () => {
    const location = useLocation();
    const isEventDetailPage = location.pathname.startsWith("/events/") && location.pathname !== "/events";

    return (
        <>
            <ScrollToTop />
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
};