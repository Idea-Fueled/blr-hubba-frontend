import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Otpverificationmodal.css";
import { toast } from "sonner";

export const OtpVerificationModal = ({ isOpen, onClose, mobileNumber = "98XXXXXX45", onSuccess }) => {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    if (!isOpen) return null;

    const handleVerifyOtp = async (codeToVerify) => {
        setIsVerifying(true);
        setIsError(false);
        setErrorMessage("");

        try {
            const cleanDigits = mobileNumber.replace(/\D/g, "").slice(-10);
            const formattedMobile = `+91${cleanDigits}`;
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_BASE_URL}/auth/attendee/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ mobile: formattedMobile, code: codeToVerify.trim() })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsError(false);
                localStorage.setItem("isLoggedIn", "true");
                const cleanMobile = mobileNumber.replace(/\D/g, "");
                const formattedMobile = cleanMobile.length === 10 ? `+91 ${cleanMobile}` : `+${cleanMobile}`;
                localStorage.setItem("user_mobile", formattedMobile);

                const user = data.user || {};
                if (user.id) localStorage.setItem("user_id", user.id);
                if (user.firstName || user.lastName) {
                    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                    if (fullName) localStorage.setItem("user_name", fullName);
                }
                if (cleanMobile) {
                    localStorage.setItem("guest_attendee_id", user.id || `guest_${cleanMobile}`);
                }
                localStorage.setItem("just_logged_in", "true");
                window.dispatchEvent(new Event("auth-change"));
                window.dispatchEvent(new Event("show-welcome-toast"));
                if (onSuccess) onSuccess();
                onClose();
            } else {
                setIsError(true);
                setErrorMessage("Incorrect OTP");
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            setIsError(true);
            setErrorMessage("Incorrect OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChange = (index, value) => {
        const digit = value.replace(/[^0-9]/g, "").slice(-1);
        const nextOtp = [...otp];
        nextOtp[index] = digit;
        setOtp(nextOtp);

        const fullOtp = nextOtp.join("");

        if (fullOtp.length === 4) {
            handleVerifyOtp(fullOtp);
        } else {
            setIsError(false);
            setErrorMessage("");
        }

        if (digit && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
            setIsError(false);
            setErrorMessage("");
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0 || isResending) return;
        setIsResending(true);
        setOtp(["", "", "", ""]);
        setIsError(false);
        setErrorMessage("");
        inputRefs[0].current?.focus();

        try {
            const cleanDigits = mobileNumber.replace(/\D/g, "").slice(-10);
            const formattedMobile = `+91${cleanDigits}`;
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_BASE_URL}/auth/attendee/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formattedMobile })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("OTP resent successfully!");
                setResendCooldown(30);
            } else {
                toast.error(data.message || "Failed to resend OTP");
            }
        } catch (err) {
            console.error("Resend OTP error:", err);
            toast.error("Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="otp-modal-overlay" onClick={handleOverlayClick}>

            <div className="otp-modal-card">

                <button
                    className="otp-modal-close-btn"
                    onClick={onClose}
                    aria-label="close verify mobile number modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M9.75 0.75L0.75 9.75M0.75 0.75L9.75 9.75" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="otp-modal-title-desc-group">

                    <h2 className="otp-modal-title">
                        Verify Mobile Number
                    </h2>

                    <p className="otp-modal-description">
                        We've sent a 4 digit verification code to +91 {mobileNumber.replace(/\D/g, "").slice(-10) || "98XXXXXX45"}. Enter the code below to continue.
                    </p>

                </div>

                <div className="otp-modal-otp-row">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            disabled={isVerifying}
                            className="otp-modal-otp-box"
                            style={isError ? { borderColor: "#D32F2F" } : {}}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                        />
                    ))}
                </div>

                {isError ? (
                    <div className="otp-modal-resend-text" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
                        <div className="incorrect-otp-container">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <g clipPath="url(#clip0_1968_3677)">
                                    <path d="M11.25 6.75L6.75 11.25M6.75 6.75L11.25 11.25M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#B10000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1968_3677">
                                        <rect width="18" height="18" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <span className="incorrect-otp-text">Incorrect OTP</span>
                        </div>
                        <span 
                            className="otp-modal-resend-link" 
                            onClick={handleResendCode}
                            style={resendCooldown > 0 ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : { cursor: "pointer" }}
                        >
                            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : (isResending ? "Sending..." : "Resend Code")}
                        </span>
                    </div>
                ) : (
                    <p className="otp-modal-resend-text">
                        Didn't receive the code?{" "}
                        <span 
                            className="otp-modal-resend-link" 
                            onClick={handleResendCode}
                            style={resendCooldown > 0 ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : { cursor: "pointer" }}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : (isResending ? "Sending..." : "Resend Code")}
                        </span>
                    </p>
                )}

                <p className="otp-modal-register-text">
                    New here? <span onClick={() => { onClose(); navigate("/register"); }} className="otp-modal-register-link" style={{ cursor: "pointer" }}>Register Now</span>
                </p>

            </div>

        </div>
    );
};

export default OtpVerificationModal;