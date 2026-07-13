import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar/Navbar.jsx";
import Footer from "./Footer.jsx";
export const Layout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
};