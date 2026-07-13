import React, { useState } from "react";
import "./EventFAQs.css";
import HorizontalRow from "../HorizontalRow";

const FAQ_ITEMS = [
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        question: "Sapien, est felis, sagittis viverra nulla mattis scelerisque est felis, sagittis viverra nulla mattis scelerisque?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    }
];

export const EventFAQs = () => {
    const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

    return (
        <>
            <div className="faqs-wrapper-container">
                <div className="faqs-wrapper-content">
                    <h2 className="faqs-heading">Event FAQs</h2>
                    <div className="faqs-list-container">
                        <div className="faqs-list">
                            {FAQ_ITEMS.map((faq, index) => {
                                const isExpanded = expandedFaqIndex === index;
                                return (
                                    <div key={index} className="faq-item">
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
