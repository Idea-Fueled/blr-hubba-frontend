import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { toast } from "sonner";

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        dob: ""
    });

    // Step 2 Mobile OTP State
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isOtpError, setIsOtpError] = useState(false);
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const dateInputRef = useRef(null);

    // Step 3 Email OTP State
    const [emailOtp, setEmailOtp] = useState(["", "", "", ""]);
    const [isEmailOtpError, setIsEmailOtpError] = useState(false);
    const emailOtpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [isStep1Loading, setIsStep1Loading] = useState(false);

    const triggerStep1Transition = async () => {
        if (isStep1Loading) return;
        setIsStep1Loading(true);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (formData.phoneNumber) {
                const cleanDigits = formData.phoneNumber.replace(/\D/g, "").slice(-10);
                const formattedMobile = `+91${cleanDigits}`;
                await fetch(`${API_BASE_URL}/auth/attendee/otp/request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mobile: formattedMobile })
                }).catch(err => console.warn("OTP request error:", err));
            }
        } catch (err) {
            console.error("Failed to request OTP:", err);
        } finally {
            setIsStep1Loading(false);
            setCurrentStep(2);
        }
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            dob: val
        }));
    };

    const handleCalendarClick = () => {
        if (dateInputRef.current) {
            if (typeof dateInputRef.current.showPicker === 'function') {
                try {
                    dateInputRef.current.showPicker();
                } catch (err) {
                    dateInputRef.current.focus();
                }
            } else {
                dateInputRef.current.focus();
            }
        }
    };

    const handleBack = () => {
        if (isEmailVerified) {
            setIsEmailVerified(false);
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(2);
            setIsMobileVerified(false);
        } else if (isMobileVerified) {
            setIsMobileVerified(false);
            setCurrentStep(2);
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate(-1);
        }
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        triggerStep1Transition();
    };

    // Helper: Save user login session & profile data, then navigate home
    const completeRegistration = async () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            await fetch(`${API_BASE_URL}/auth/attendee/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    gender: formData.gender,
                    dob: formData.dob
                })
            }).catch(err => console.warn("Profile save warning:", err));
        } catch (err) {
            console.error("Profile save error:", err);
        }

        localStorage.setItem("isLoggedIn", "true");

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        if (fullName) {
            localStorage.setItem("user_name", fullName);
        }

        if (formData.phoneNumber) {
            const cleanMobile = formData.phoneNumber.replace(/\D/g, "");
            const formattedMobile = cleanMobile.length === 10 ? `+91 ${cleanMobile}` : `+${cleanMobile}`;
            localStorage.setItem("user_mobile", formattedMobile);
            localStorage.setItem("guest_attendee_id", `guest_${cleanMobile}`);
        }

        if (formData.email) {
            localStorage.setItem("user_email", formData.email);
        }

        localStorage.setItem("user_profile", JSON.stringify(formData));
        localStorage.setItem("just_logged_in", "true");

        // Dispatch event so Navbar and components update logged-in state
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    };

    // Step 2 Mobile OTP Handler
    const handleOtpChange = (index, value) => {
        const cleanVal = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = cleanVal;
        setOtp(newOtp);

        const fullCode = newOtp.join("");
        if (fullCode.length === 4) {
            const verifyMobileOtp = async () => {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                try {
                    const cleanDigits = formData.phoneNumber.replace(/\D/g, "").slice(-10);
                    const formattedMobile = `+91${cleanDigits}`;
                    const res = await fetch(`${API_BASE_URL}/auth/attendee/otp/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ mobile: formattedMobile, code: fullCode.trim() })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        setIsOtpError(false);
                        setIsMobileVerified(true);
                        setTimeout(() => {
                            setCurrentStep(3);
                        }, 2000);
                    } else {
                        setIsOtpError(true);
                        toast.error(data.message || "Incorrect OTP");
                    }
                } catch (err) {
                    setIsOtpError(true);
                    toast.error("Verification failed. Please try again.");
                }
            };
            verifyMobileOtp();
        } else {
            setIsOtpError(false);
        }

        if (cleanVal && index < 3) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
            setIsOtpError(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0 || isResending) return;
        setIsResending(true);
        setOtp(["", "", "", ""]);
        setIsOtpError(false);
        otpRefs[0].current?.focus();

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (formData.phoneNumber) {
                const cleanDigits = formData.phoneNumber.replace(/\D/g, "").slice(-10);
                const formattedMobile = `+91${cleanDigits}`;
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
            }
        } catch (err) {
            console.error("Resend error:", err);
            toast.error("Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    // Step 3 Email OTP Handler
    const handleEmailOtpChange = (index, value) => {
        const cleanVal = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...emailOtp];
        newOtp[index] = cleanVal;
        setEmailOtp(newOtp);

        const fullCode = newOtp.join("");
        if (fullCode.length === 4) {
            setIsEmailOtpError(false);
            setIsEmailVerified(true);
            setTimeout(() => {
                completeRegistration();
            }, 2000);
        } else {
            setIsEmailOtpError(false);
        }

        if (cleanVal && index < 3) {
            emailOtpRefs[index + 1].current?.focus();
        }
    };

    const handleEmailOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
            emailOtpRefs[index - 1].current?.focus();
            setIsEmailOtpError(false);
        }
    };

    const handleEmailResendCode = () => {
        setEmailOtp(["", "", "", ""]);
        setIsEmailOtpError(false);
        emailOtpRefs[0].current?.focus();
    };

    const handleSkipEmail = () => {
        completeRegistration();
    };

    return (
        <div className="register-page-container">
            {/* Header & Stepper Bar */}
            <div className="register-header-section">
                <div className="register-title-row">
                    <button className="register-back-btn" onClick={handleBack} aria-label="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M22.1668 13.9999H5.8335M14.0002 5.83325L5.8335 13.9999L14.0002 22.1666" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h1 className="register-main-title">REGISTER</h1>
                </div>

                <div className="register-stepper-row">
                    <div className={`register-step ${currentStep >= 1 ? 'active' : 'inactive'}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Personal Info</span>
                    </div>
                    <div className={`register-step ${currentStep >= 2 ? 'active' : 'inactive'}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Mobile Verification</span>
                    </div>
                    <div className={`register-step ${currentStep >= 3 ? 'active' : 'inactive'}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Email Verification</span>
                    </div>
                </div>
            </div>

            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
                <div className="register-form-wrapper">
                    <h2 className="register-section-title">Personal Information</h2>

                    {isStep1Loading ? (
                        <div className="register-loading-wrapper">
                            <div className="register-loading-spinner" />
                            <p className="register-loading-text">Saving Personal Information...</p>
                        </div>
                    ) : (
                        <form className="register-form" onSubmit={handleStep1Submit}>
                            <div className="register-form-grid">
                                {/* Name */}
                                <div className="register-field-group">
                                    <label className="register-label" htmlFor="firstName">Name</label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        className="register-input"
                                        placeholder="Enter Your Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="register-field-group">
                                    <label className="register-label" htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        className="register-input"
                                        placeholder="Enter your last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="register-field-group">
                                    <label className="register-label" htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        className="register-input"
                                        placeholder="Enter Your Mobile Number"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Email */}
                                <div className="register-field-group">
                                    <label className="register-label" htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="register-input"
                                        placeholder="email@gmail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div className="register-field-group register-field-full">
                                    <label className="register-label" htmlFor="dob">Date of Birth</label>
                                    <div className="register-input-with-icon" onClick={handleCalendarClick} style={{ cursor: "pointer" }}>
                                        <input
                                            ref={dateInputRef}
                                            id="dob"
                                            name="dob"
                                            type="date"
                                            className="register-input register-date-input"
                                            value={formData.dob}
                                            onChange={handleDateChange}
                                        />
                                        <span className="register-input-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M21 10H3M16 2V6M8 2V6M9 16L11 18L15.5 13.5M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="register-action-group">
                                <button type="submit" className="register-submit-btn">
                                    CONTINUE
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* STEP 2: Mobile Verification */}
            {currentStep === 2 && (
                <div className="register-form-wrapper">
                    {isMobileVerified ? (
                        <div className="register-success-section">
                            <h2 className="register-section-title register-success-title">
                                Mobile verification Successful!
                            </h2>
                            <div className="register-success-icon-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="98" height="98" viewBox="0 0 98 98" fill="none">
                                    <path d="M30.6253 49L42.8753 61.25L67.3753 36.75M89.8337 49C89.8337 71.5516 71.552 89.8333 49.0003 89.8333C26.4487 89.8333 8.16699 71.5516 8.16699 49C8.16699 26.4483 26.4487 8.16663 49.0003 8.16663C71.552 8.16663 89.8337 26.4483 89.8337 49Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="register-section-title register-otp-title">Verify your mobile number</h2>

                            <p className="register-otp-description">
                                We've sent a 4 digit verification code to +91 {formData.phoneNumber || '98XXXXXX45'}. Enter the code below to continue.
                            </p>

                            <div className="register-otp-boxes-group">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={otpRefs[idx]}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="register-otp-box"
                                        style={isOtpError ? { borderColor: "#D32F2F" } : {}}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    />
                                ))}
                            </div>

                            {isOtpError ? (
                                <p className="register-resend-text" style={{ color: "#D32F2F" }}>
                                    Incorrect OTP. Please enter the valid OTP sent to your phone.{" "}
                                    <button 
                                        type="button" 
                                        className="register-resend-btn" 
                                        onClick={handleResendCode}
                                        disabled={resendCooldown > 0 || isResending}
                                        style={resendCooldown > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                    >
                                        {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : (isResending ? "Sending..." : "Resend Code")}
                                    </button>
                                </p>
                            ) : (
                                <p className="register-resend-text">
                                    Didn't receive the code?{" "}
                                    <button 
                                        type="button" 
                                        className="register-resend-btn" 
                                        onClick={handleResendCode}
                                        disabled={resendCooldown > 0 || isResending}
                                        style={resendCooldown > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : (isResending ? "Sending..." : "Resend Code")}
                                    </button>
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* STEP 3: Email Verification */}
            {currentStep === 3 && (
                <div className="register-form-wrapper">
                    {isEmailVerified ? (
                        <div className="register-success-section">
                            <h2 className="register-section-title register-success-title">
                                Email verification Successful!
                            </h2>
                            <div className="register-success-icon-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="98" height="98" viewBox="0 0 98 98" fill="none">
                                    <path d="M30.6253 49L42.8753 61.25L67.3753 36.75M89.8337 49C89.8337 71.5516 71.552 89.8333 49.0003 89.8333C26.4487 89.8333 8.16699 71.5516 8.16699 49C8.16699 26.4483 26.4487 8.16663 49.0003 8.16663C71.552 8.16663 89.8337 26.4483 89.8337 49Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="register-section-title register-email-title">Verify your email.</h2>

                            <p className="register-email-description">
                                Enter the 4-digit code sent to {formData.email || 'annimane@gmail.com'} to receive your booking confirmation and event updates on your email
                            </p>

                            <div className="register-otp-boxes-group">
                                {emailOtp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={emailOtpRefs[idx]}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="register-otp-box"
                                        style={isEmailOtpError ? { borderColor: "#D32F2F" } : {}}
                                        value={digit}
                                        onChange={(e) => handleEmailOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleEmailOtpKeyDown(idx, e)}
                                    />
                                ))}
                            </div>

                            {isEmailOtpError ? (
                                <p className="register-resend-text" style={{ color: "#D32F2F" }}>
                                    Incorrect OTP. Please try again.{" "}
                                    <button type="button" className="register-resend-btn" onClick={handleEmailResendCode}>
                                        Resend Code
                                    </button>
                                </p>
                            ) : (
                                <p className="register-resend-text">
                                    Didn't receive the code?{" "}
                                    <button type="button" className="register-resend-btn" onClick={handleEmailResendCode}>
                                        Resend Code
                                    </button>
                                </p>
                            )}

                            <div className="register-skip-group">
                                <button type="button" className="register-skip-btn" onClick={handleSkipEmail}>
                                    SKIP
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
