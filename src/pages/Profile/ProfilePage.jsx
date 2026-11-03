import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Award, Shield } from "lucide-react";
import { MotionSection } from "../../components/AnimatedPage";
import "./ProfilePage.css";

export const ProfilePage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [mobile, setMobile] = useState("+91 98765 43210");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/");
            return;
        }

        const storedName = localStorage.getItem("user_name");
        setName(storedName && storedName !== "Anirudh" ? storedName : "User");

        const storedEmail = localStorage.getItem("user_email");
        setEmail(storedEmail && storedEmail !== "user@example.com" ? storedEmail : "");

        setAge(localStorage.getItem("user_age") || "");

        const storedMobile = localStorage.getItem("user_mobile");
        const attendeeId = localStorage.getItem("guest_attendee_id");
        if (storedMobile) {
            setMobile(storedMobile);
        } else if (attendeeId && attendeeId.startsWith("guest_")) {
            const rawDigits = attendeeId.replace("guest_", "").replace(/\D/g, "");
            if (rawDigits.length >= 10) {
                setMobile(`+91 ${rawDigits.slice(-10)}`);
            } else if (rawDigits.length > 0) {
                setMobile(`+91 ${rawDigits}`);
            } else {
                setMobile("+91 98765 43210");
            }
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage("");

        // Validation
        if (!name.trim()) {
            setMessage("Name is required");
            setIsError(true);
            setIsSaving(false);
            return;
        }

        if (!email.trim() || !email.includes("@")) {
            setMessage("Please enter a valid email address");
            setIsError(true);
            setIsSaving(false);
            return;
        }

        setTimeout(() => {
            localStorage.setItem("user_name", name.trim());
            localStorage.setItem("user_email", email.trim().toLowerCase());
            localStorage.setItem("user_age", age);
            
            // Dispatch profile-change event so that navbar greeting updates
            window.dispatchEvent(new Event("profile-change"));
            window.dispatchEvent(new Event("auth-change"));

            setMessage("Profile updated successfully!");
            setIsError(false);
            setIsSaving(false);
        }, 800);
    };

    if (!isLoggedIn) return null;

    return (
        <div className="profile-page-container">
            <div className="profile-page-content">
                <MotionSection className="profile-page-header">
                    <h1 className="profile-page-title">Your Profile</h1>
                    <p className="profile-page-subtitle">Manage your account settings and personal details</p>
                </MotionSection>

                <div className="profile-page-grid">
                    
                    {/* Form side */}
                    <MotionSection className="profile-form-column">
                        <div className="profile-section-card">
                            <h2 className="profile-section-title">
                                <User size={20} /> Personal Information
                            </h2>
                            <p className="profile-section-desc">Update your name, email, and age details</p>
                            
                            <form onSubmit={handleSubmit} className="profile-main-form">
                                {message && (
                                    <div className={`profile-form-alert ${isError ? "alert-error" : "alert-success"}`}>
                                        {message}
                                    </div>
                                )}

                                <div className="profile-form-group">
                                    <label htmlFor="profile-name">Full Name *</label>
                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="profile-form-input"
                                        required
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label htmlFor="profile-email">Email Address *</label>
                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="profile-form-input"
                                        required
                                    />
                                    <span className="profile-input-help">Used for sending booking details & pass tickets</span>
                                </div>

                                <div className="profile-form-group">
                                    <label htmlFor="profile-age">Age (Optional)</label>
                                    <input
                                        id="profile-age"
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Enter your age"
                                        className="profile-form-input"
                                        min="13"
                                        max="120"
                                    />
                                    <span className="profile-input-help">Helps us recommend appropriate events</span>
                                </div>

                                <button type="submit" className="profile-submit-btn" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>
                    </MotionSection>

                    {/* Secondary info side */}
                    <MotionSection className="profile-info-column">
                        
                        {/* Contact details */}
                        <div className="profile-section-card">
                            <h2 className="profile-section-title">
                                <Phone size={20} /> Contact Details
                            </h2>
                            <div className="profile-info-list">
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Mobile Number</span>
                                    <span className="profile-info-val">{mobile}</span>
                                    <span className="profile-info-badge">Verified</span>
                                </div>
                                <p className="profile-info-note">
                                    Your mobile number is linked to your account for authentication and cannot be changed.
                                </p>
                            </div>
                        </div>

                        {/* Security Details */}
                        <div className="profile-section-card">
                            <h2 className="profile-section-title">
                                <Shield size={20} /> Account Security
                            </h2>
                            <div className="profile-info-list">
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Login Method</span>
                                    <span className="profile-info-val flex-center">
                                        <span className="profile-status-dot active"></span> Mobile OTP login
                                    </span>
                                </div>
                            </div>
                        </div>

                    </MotionSection>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
