import React, { useState } from "react";
import "./EventFAQs.css";
import HorizontalRow from "../HorizontalRow";

const FAQ_ITEMS = [
    {
        question: "What is the venue's accessibility policy?",
        answer: "Our venues are fully accessible to individuals with limited mobility. Accessible seating is available, and ramp access is provided at all primary entrances."
    },
    {
        question: "Are tickets refundable?",
        answer: "Tickets are non-refundable unless the event is cancelled or postponed. If an event is cancelled, refunds will be issued automatically to your original payment method."
    },
    {
        question: "Can I transfer my pass to someone else?",
        answer: "Yes, passes are transferable. You can share your ticket confirmation email and QR code with the person attending in your place."
    }
];

export const EventFAQs = ({ faqs }) => {
    const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
    const items = Array.isArray(faqs) ? faqs : FAQ_ITEMS;

    return (
        <>
            <div className="faqs-wrapper-container">
                <div className="faqs-wrapper-content">
                    <h2 className="faqs-heading">Event FAQs</h2>
                    <div className="faqs-list-container">
                        <div className="faqs-list">
                            {items.map((faq, index) => {
                                const isExpanded = expandedFaqIndex === index;
                                return (
                                    <div key={index} className={`faq-item${isExpanded ? ' faq-item-expanded' : ''}`}>
                                        <div className="faq-question-row" onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}>
                                            <span className="faq-icon">{isExpanded ? "—" : "+"}</span>
                                            <span className="faq-question">{faq.question}</span>
                                        </div>
                                        {isExpanded && (
                                            <div className="faq-answer-row">
                                                <p className="faq-answer">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <HorizontalRow />
        </>
    );
};

export default EventFAQs;
