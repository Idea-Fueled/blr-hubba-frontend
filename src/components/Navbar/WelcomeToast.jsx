import React, { useState, useEffect } from "react";
import "./WelcomeToast.css";

export const WelcomeToast = ({ isOpen, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsExiting(false);
            const timer = setTimeout(() => {
                handleClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsExiting(false);
            onClose();
        }, 400); // 400ms for slideOutRight animation
    };

    if (!isOpen && !isExiting) return null;

    return (
        <div className={`welcome-toast-container ${isExiting ? "slide-out" : "slide-in"}`}>
            <div className="welcome-toast-content">
                {/* Green Check Circle Icon */}
                <div className="welcome-toast-icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                        <g clipPath="url(#clip0_2877_3973_toast)">
                            <path d="M17.4163 8.7716V9.49993C17.4154 11.2071 16.8626 12.8682 15.8404 14.2355C14.8182 15.6029 13.3814 16.6031 11.7443 17.0872C10.1072 17.5712 8.35751 17.5131 6.75613 16.9215C5.15476 16.3299 3.78753 15.2364 2.85835 13.8043C1.92918 12.3721 1.48784 10.678 1.60017 8.97452C1.71249 7.27105 2.37246 5.64953 3.48165 4.35178C4.59083 3.05404 6.0898 2.14961 7.75499 1.77338C9.42019 1.39715 11.1624 1.56928 12.7218 2.2641M17.4163 3.1666L9.49968 11.0912L7.12468 8.71618" stroke="#088758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_2877_3973_toast">
                                <rect width="19" height="19" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>

                {/* Text Group */}
                <div className="welcome-toast-text-group">
                    <span className="welcome-toast-title">Welcome to Hubba!</span>
                    <span className="welcome-toast-subtitle">You’re now signed in.</span>
                </div>

                {/* Close Button */}
                <button className="welcome-toast-close-btn" onClick={handleClose} aria-label="Close toast">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 1L1 13M1 1L13 13" stroke="#181C20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default WelcomeToast;
