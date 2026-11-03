import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import "./WebsiteLandingPopup.css";

const COOKIE_NAME = "blrhubba_landing_popup_dismissed";
const STORAGE_KEY = "blrhubba_landing_popup_dismissed_at";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_SEC = 24 * 60 * 60; // 86400 seconds (24 hours)

// Helper to set cookie with max-age
const setCookie = (name, value, seconds) => {
    try {
        document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${seconds}; path=/; SameSite=Lax`;
    } catch (e) {
        console.warn("Could not set cookie", e);
    }
};

// Helper to get cookie
const getCookie = (name) => {
    try {
        const matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : null;
    } catch (e) {
        return null;
    }
};

// Helper to remove cookie
const deleteCookie = (name) => {
    try {
        document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
    } catch (e) {
        console.warn("Could not delete cookie", e);
    }
};

// Expose helper globally so window.resetLandingPopup() is always defined immediately
if (typeof window !== "undefined") {
    window.resetLandingPopup = () => {
        deleteCookie(COOKIE_NAME);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("blrhubba_landing_popup_dismissed");
        console.log("Landing popup reset. Showing popup again.");
        window.location.reload();
    };
}

export const WebsiteLandingPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        // Expose a helper for easy local testing in console: window.resetLandingPopup()
        window.resetLandingPopup = () => {
            deleteCookie(COOKIE_NAME);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem("blrhubba_landing_popup_dismissed");
            setIsOpen(true);
            console.log("Landing popup reset. Showing popup again.");
        };

        const cookieVal = getCookie(COOKIE_NAME);
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        const legacyDismissed = localStorage.getItem("blrhubba_landing_popup_dismissed");

        let shouldShow = false;

        // 1. Agar pehli baar visit hai (na cookie hai, na localStorage timestamp):
        if (!cookieVal && !dismissedAt) {
            shouldShow = true;
        } 
        // 2. Agar 24 hours beet chuke hain ya browser cookie expire/delete ho gayi hai:
        else if (!cookieVal) {
            // User ne browser cookies delete ki ya 24h ho gaye aur cookie expire ho gayi
            shouldShow = true;
        } else if (dismissedAt) {
            const timePassed = Date.now() - parseInt(dismissedAt, 10);
            if (isNaN(timePassed) || timePassed >= TWENTY_FOUR_HOURS_MS) {
                shouldShow = true;
            }
        }

        // Clean up legacy boolean key if present
        if (legacyDismissed) {
            localStorage.removeItem("blrhubba_landing_popup_dismissed");
        }

        if (shouldShow) {
            // Smoothly delay opening by 500ms so page renders first
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        try {
            // Set cookie for exactly 24 hours (86400 seconds)
            setCookie(COOKIE_NAME, "true", TWENTY_FOUR_HOURS_SEC);
            // Also save timestamp in localStorage
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            localStorage.removeItem("blrhubba_landing_popup_dismissed");
        } catch (e) {
            console.warn("Could not save popup state to storage/cookie", e);
        }
        setIsOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        // Instantly dismiss popup on submit as requested
        handleDismiss();
        toast.success("Thank you! You'll be the first to know when 2027 bookings open.");

        try {
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            await fetch(`${API_URL}/public/notify-me`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: trimmedEmail })
            });
        } catch (err) {
            console.error("Error submitting notify-me email:", err);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                handleDismiss();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="website-landing-popup-backdrop"
                    onClick={handleDismiss}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <motion.div
                        className="website-landing-popup-card"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 25 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 26,
                            stiffness: 300,
                            mass: 0.8
                        }}
                    >
                        {/* Top-Right Close Button (Fixed 32x32) */}
                        <button
                            type="button"
                            className="website-landing-popup-close-btn"
                            onClick={handleDismiss}
                            aria-label="Close popup"
                        >
                            <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M1 1L11 11M1 11L11 1"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Content Area */}
                        <div className="website-landing-popup-content">
                            <h2 className="website-landing-popup-title">
                                Be the first to know when bookings open!
                            </h2>

                            <p className="website-landing-popup-desc">
                                Our lineup for 2027 will go live in November. Sign up to get the latest updates as soon as new events, artists, and passes are announced.
                            </p>

                            <form className="website-landing-popup-form" onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    className="website-landing-popup-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="website-landing-popup-submit-btn">
                                    <span>NOTIFY ME</span>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WebsiteLandingPopup;
