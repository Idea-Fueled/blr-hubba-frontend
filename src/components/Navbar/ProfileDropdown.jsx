import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDropdown.css";
import { toast } from "sonner";

export const ProfileDropdown = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("User");
    const [userPhone, setUserPhone] = useState("");

    const loadUserData = () => {
        const storedName = localStorage.getItem("user_name");
        const storedMobile = localStorage.getItem("user_mobile");
        setUserName(storedName || "User");
        setUserPhone(storedMobile || "");
    };

    useEffect(() => {
        loadUserData();
        
        const handleProfileChange = () => {
            loadUserData();
        };

        window.addEventListener("profile-change", handleProfileChange);
        window.addEventListener("auth-change", handleProfileChange);
        return () => {
            window.removeEventListener("profile-change", handleProfileChange);
            window.removeEventListener("auth-change", handleProfileChange);
        };
    }, []);


    if (!isOpen) return null;

    const handleItemClick = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user_cart");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_mobile");
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Logged out successfully!");
        navigate("/");
        onClose();
    };

    return (
        <div className="profile-dropdown-container">
        <div className="profile-dropdown-header">
            <span className="profile-dropdown-user-title">Hi, {userName}</span>
            {userPhone && <span className="profile-dropdown-user-email">{userPhone}</span>}
        </div>
            
            <div className="profile-dropdown-divider"></div>
            
            <ul className="profile-dropdown-menu">
                <li className="profile-dropdown-item" onClick={() => handleItemClick("/dashboard")}>
                    Dashboard
                </li>
                <li className="profile-dropdown-item" onClick={() => handleItemClick("/bookings")}>
                    My Bookings
                </li>
                <li className="profile-dropdown-item" onClick={() => handleItemClick("/favorites")}>
                    Favourites
                </li>
                <li className="profile-dropdown-item" onClick={() => handleItemClick("/profile")}>
                    Profile
                </li>
                <li className="profile-dropdown-item" onClick={() => handleItemClick("/help")}>
                    Help & Support
                </li>
            </ul>
            
            <div className="profile-dropdown-divider"></div>
            
            <div className="profile-dropdown-logout-section">
                <button className="profile-dropdown-logout-btn" onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </div>
    );
};

export default ProfileDropdown;
