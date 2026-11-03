import React, { useState } from "react";
import { toast } from "sonner";
import "./ContactUsPage.css";
import contactImg from "../../assets/contact-us-page/contact-us-page-img.png";

export const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        interest: "General Inquiry",
        message: "",
        agreePrivacy: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreePrivacy) {
            toast.error("Please agree to our privacy policy.");
            return;
        }

        setIsSubmitting(true);
        try {
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            const res = await fetch(`${API_URL}/public/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    interest: formData.interest || "General Inquiry",
                    message: formData.message.trim()
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Thank you! Your message has been sent successfully.");
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    interest: "General Inquiry",
                    message: "",
                    agreePrivacy: false,
                });
            } else {
                toast.error(data.message || "Failed to submit message. Please try again.");
            }
        } catch (err) {
            console.error("Error submitting contact form:", err);
            toast.error("Network error. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-us-page">
            {/* HERO BANNER SECTION (Frame 2407) */}
            <div className="contact-us-hero-wrapper">
                <div className="contact-us-hero-card">
                    <span className="contact-us-hero-eyebrow">CONTACT US</span>
                    <h1 className="contact-us-hero-title">Let’s start a conversation!</h1>
                </div>
            </div>

            {/* CONTACT FORM SECTION (Frame 2423) */}
            <div className="contact-us-form-section-wrapper">
                <div className="contact-us-grid">
                    {/* Left Column: Image */}
                    <div className="contact-us-img-col">
                        <img src={contactImg} alt="Kempegowda Tower" className="contact-us-hero-img" />
                    </div>

                    {/* Right Column: Form Card (Frame 2423) */}
                    <div className="contact-us-form-card">
                        <div className="contact-us-form-header">
                            <span className="contact-us-form-eyebrow">HOW CAN WE HELP YOU?</span>
                            <h2 className="contact-us-form-title">
                                Our team would love to hear from you.
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="contact-us-form">
                            {/* First Name & Last Name */}
                            <div className="contact-form-row two-cols">
                                <div className="contact-field-group">
                                    <label htmlFor="firstName" className="contact-field-label">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="contact-field-input"
                                        required
                                    />
                                </div>
                                <div className="contact-field-group">
                                    <label htmlFor="lastName" className="contact-field-label">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="contact-field-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="contact-field-group">
                                <label htmlFor="email" className="contact-field-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="you@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="contact-field-input"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div className="contact-field-group">
                                <label htmlFor="message" className="contact-field-label">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Leave us a message..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="contact-field-textarea"
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Privacy Policy Checkbox */}
                            <div
                                className="contact-checkbox-row"
                                onClick={() => setFormData((prev) => ({ ...prev, agreePrivacy: !prev.agreePrivacy }))}
                            >
                                <span className={`contact-custom-checkbox ${formData.agreePrivacy ? "active" : ""}`}>
                                    {formData.agreePrivacy && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </span>
                                <span className="contact-checkbox-label">
                                    You agree to our <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="privacy-link">privacy policy.</a>
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="contact-submit-btn"
                                disabled={isSubmitting}
                            >
                                <span className="btn-text-primary">{isSubmitting ? "SENDING..." : "SEND MESSAGE"}</span>
                                <span className="btn-text-secondary">{isSubmitting ? "SENDING..." : "SEND MESSAGE"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
