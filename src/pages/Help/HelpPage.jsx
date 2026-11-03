import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { MotionSection } from "../../components/AnimatedPage";
import "./HelpPage.css";

export const HelpPage = () => {
    const [faqOpen, setFaqOpen] = useState({
        0: true,
        1: false,
        2: false,
        3: false
    });

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const faqs = [
        {
            question: "How do I purchase passes?",
            answer: "Browse events from our homepage or event listing page, select the pass you wish to book, click 'VIEW & BOOK', choose date and time slot, add to cart, and click checkout to make your payment using Razorpay. Once done, passes will be visible in your Dashboard and My Bookings page."
        },
        {
            question: "How do I access my entry passes?",
            answer: "Click your profile icon at the top right in the navbar to open the dropdown, then select 'My Bookings' or 'Dashboard'. There you will find your unique QR code or individual tickets that can be downloaded/printed as images."
        },
        {
            question: "What if I have issues scanning my pass at the venue?",
            answer: "If you face any scanner issues at the venue entrance, you can show the digital pass inside the BLR Hubba website or present the downloaded ticket image. If the issue persists, contact our support team at +91 636 118 8295."
        },
        {
            question: "Can I cancel a booking and request a refund?",
            answer: "Yes, some passes are eligible for cancellation depending on the specific event policy. You can request a cancellation under your booked ticket details or directly email us at support@blrhubba.in."
        }
    ];

    return (
        <div className="help-page-container">
            <div className="help-page-content">
                
                {/* Header */}
                <MotionSection className="help-page-header">
                    <h1 className="help-page-title">Help & Support</h1>
                    <p className="help-page-subtitle">We are here to assist! Reach out to us or view frequently asked questions.</p>
                </MotionSection>

                {/* Support cards grid */}
                <MotionSection className="help-support-grid">
                    
                    {/* Email support */}
                    <div className="help-support-card">
                        <div className="help-card-icon-title">
                            <div className="help-card-icon-wrapper">
                                <Mail size={22} />
                            </div>
                            <h2 className="help-card-title">Email Support</h2>
                        </div>
                        <div className="help-card-body">
                            <p className="help-card-desc">Send us an email with your booking/event details and we'll reply as soon as possible.</p>
                            <a href="mailto:support@blrhubba.in" className="help-card-link">support@blrhubba.in</a>
                            <span className="help-card-footer-text">Response within 24-48 hours</span>
                        </div>
                    </div>

                    {/* Phone support */}
                    <div className="help-support-card">
                        <div className="help-card-icon-title">
                            <div className="help-card-icon-wrapper">
                                <Phone size={22} />
                            </div>
                            <h2 className="help-card-title">Phone Support</h2>
                        </div>
                        <div className="help-card-body">
                            <p className="help-card-desc">Call us directly for immediate booking assistance or queries regarding venue entry.</p>
                            <a href="tel:+916361188295" className="help-card-link">+91 636 118 8295</a>
                            <span className="help-card-footer-text">Mon-Sat, 10:00 AM - 7:00 PM IST</span>
                        </div>
                    </div>

                </MotionSection>

                {/* FAQ Card Accordion */}
                <MotionSection className="help-faq-card">
                    <h2 className="help-faq-card-title">
                        <HelpCircle size={22} /> Common Questions
                    </h2>
                    
                    <div className="help-faq-accordion-list">
                        {faqs.map((faq, index) => (
                            <div key={index} className="help-faq-item">
                                <div className="help-faq-question-row" onClick={() => toggleFaq(index)}>
                                    <span className="help-faq-question">{faq.question}</span>
                                    <div className={`help-faq-chevron${faqOpen[index] ? ' rotated' : ''}`}>
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                <div className={`help-faq-answer-wrapper${faqOpen[index] ? ' expanded' : ''}`}>
                                    <div className="help-faq-answer-inner">
                                        <p className="help-faq-answer">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </MotionSection>

                {/* Footer Quick Links */}
                <div className="help-quick-links-row">
                    <Link to="/events" className="help-quick-link-btn">Browse Events</Link>
                    <Link to="/bookings" className="help-quick-link-btn">My Passes</Link>
                </div>

            </div>
        </div>
    );
};

export default HelpPage;
