import React from "react";
import "./Loader.css";

export const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="page-loader-container">
            <div className="spinner"></div>
            {text && <span className="loader-text">{text}</span>}
        </div>
    );
};

export const SkeletonCard = ({ className = "skeleton-event-card" }) => {
    return <div className={`skeleton-box ${className}`}></div>;
};
