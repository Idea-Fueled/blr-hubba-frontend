import React, { useState } from "react";
import "./EventFAQs.css";

const FAQ_ITEMS = [
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Our venues are fully accessible to individuals with limited mobility. Accessible seating is available, and ramp access is provided at all primary entrances."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Tickets are non-refundable unless the event is cancelled or postponed. If an event is cancelled, refunds will be issued automatically to your original payment method."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Yes, passes are transferable. You can share your ticket confirmation email and QR code with the person attending in your place."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Parking is available on site and at designated parking structures nearby."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Food and beverages are available at designated stalls inside the venue."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "You can reach out to the support team or visit the information desk at the venue."
    }
];

export const EventFAQs = ({ faqs, title = "Event FAQs", className = "" }) => {
    const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

    const items = (Array.isArray(faqs) && faqs.length > 0) ? faqs : FAQ_ITEMS;

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className={`faqs-wrapper-container ${className}`.trim()}>
            <div className="faqs-wrapper-content">
                <h2 className="faqs-heading">{title}</h2>
                <div className="faqs-list-container">
                    <div className="faqs-list">
                        {items.map((faq, index) => {
                            const isExpanded = expandedFaqIndex === index;
                            return (
                                <div key={index} className={`faq-item${isExpanded ? ' faq-item-expanded' : ''}`}>
                                    <div className="faq-question-row" onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}>
                                        <div className={`faq-icon-wrapper${isExpanded ? ' rotated' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 5V19M5 12H19" stroke="#181C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="faq-question">{faq.question}</span>
                                    </div>
                                    <div className={`faq-answer-wrapper${isExpanded ? ' expanded' : ''}`}>
                                        <div className="faq-answer-inner">
                                            <p className="faq-answer">{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventFAQs;
