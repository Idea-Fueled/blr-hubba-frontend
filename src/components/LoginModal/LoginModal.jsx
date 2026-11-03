import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";
import OtpVerificationModal from "./Otpverificationmodal";

export const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [mobileNumber, setMobileNumber] = useState("");
    const [notRegisteredError, setNotRegisteredError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpOpen, setIsOtpOpen] = useState(false);

    if (!isOpen && !isOtpOpen) return null;

    const handleGoToRegister = (e) => {
        if (e) e.preventDefault();
        handleCloseAll();
        navigate("/register");
    };

    const handleMobileChange = (e) => {
        setMobileNumber(e.target.value);
        if (notRegisteredError) {
            setNotRegisteredError("");
        }
    };

    const handleSendOtp = async () => {
        const cleanNumber = mobileNumber.replace(/\D/g, "").slice(-10);
        if (!cleanNumber || cleanNumber.length < 10) {
            setNotRegisteredError("Please enter a valid mobile number.");
            return;
        }

        const formattedMobile = `+91${cleanNumber}`;
        setIsLoading(true);
        setNotRegisteredError("");

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_BASE_URL}/auth/attendee/check-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formattedMobile })
            });
            const data = await res.json();

            if (data && data.success && data.registered === false) {
                setNotRegisteredError(
                    data.message || "We couldn’t find an account associated with this phone number. If you’re a new user, please register to continue."
                );
                setIsLoading(false);
                return;
            }

            // Also request OTP
            await fetch(`${API_BASE_URL}/auth/attendee/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formattedMobile })
            }).catch(err => console.warn("OTP request error:", err));

            setIsLoading(false);
            setIsOtpOpen(true);
        } catch (err) {
            console.error("Check mobile error:", err);
            setNotRegisteredError("We couldn’t find an account associated with this phone number. If you’re a new user, please register to continue.");
            setIsLoading(false);
        }
    };

    const handleCloseAll = () => {
        setIsOtpOpen(false);
        setNotRegisteredError("");
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleCloseAll();
        }
    };

    if (isOtpOpen) {
        const cleanNumber = mobileNumber.replace(/\D/g, "").slice(-10);
        const formattedMobile = `+91${cleanNumber}`;
        return (
            <OtpVerificationModal
                isOpen={isOtpOpen}
                onClose={handleCloseAll}
                mobileNumber={formattedMobile}
                onSuccess={onSuccess}
            />
        );
    }

    return (
        <div className="login-modal-overlay" onClick={handleOverlayClick}>

            <div className="login-modal-card">

                <button
                    className="login-modal-close-btn"
                    onClick={handleCloseAll}
                    aria-label="close login modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M13 1L1 13" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div>
                    <p className="login-modal-register-text">
                        New here? <a href="/register" onClick={handleGoToRegister} className="login-modal-register-link">Register</a> to create your account.
                    </p>

                    <div className="login-modal-title-desc-group">

                        <h2 className="login-modal-title">
                            Login to BLR HUbba
                        </h2>

                        <p className="login-modal-description">
                            Sign In to  book events, view your bookings
                            and access your entry pass (QR Code).
                        </p>

                        {notRegisteredError && (
                            <p className="login-modal-not-registered-error">
                                We couldn’t find an account associated with this phone number. If you’re a new user <span style={{ cursor: 'pointer' }} onClick={handleGoToRegister}>please register to continue.</span>
                            </p>
                        )}

                    </div>
                </div>

                <div className="login-modal-form">

                    <label className="login-modal-label" htmlFor="login-modal-mobile">
                        Enter Your Mobile Number
                    </label>

                    <input
                        id="login-modal-mobile"
                        type="tel"
                        className="login-modal-input"
                        placeholder="Enter Your Mobile Number"
                        value={mobileNumber}
                        onChange={handleMobileChange}
                    />

                    <button
                        className="login-modal-send-otp-btn"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                    >
                        <span className="btn-text-primary">{isLoading ? "SENDING..." : "SEND OTP"}</span>
                        <span className="btn-text-secondary">{isLoading ? "SENDING..." : "SEND OTP"}</span>
                    </button>

                </div>

            </div>

        </div>
    );
};

export default LoginModal;