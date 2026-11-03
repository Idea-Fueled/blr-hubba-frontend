import React from "react";
import { useNavigate } from "react-router-dom";
import "./TicketCard.css";

export const TicketCard = ({ ticket }) => {
    const navigate = useNavigate();

    const defaultTicket = {
        id: 1,
        month: "JAN",
        day: "25",
        weekday: "MON",
        title: "Pankh: A Leap of Faith",
        by: "By Kaushiki Chakraborty & Shantanu Moitra",
        date: "Monday 25 Jan, 2027 | 8:30 pm–10:00 pm",
        venue: "Freedom Park",
        venueDetail: "",
        quantity: 1,
        passType: "DONOR",
        amount: "800.00",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
    };

    const item = ticket || defaultTicket;

    const handleCancelClick = () => {
        navigate("/cancel-booking");
    };

    return (
        <div className="ticket-c-card">

            {/* LEFT SIDEBAR (YELLOW DATE + IMAGE BADGE) */}
            <div className="ticket-c-yellow-col">
                <div className="ticket-c-date-stack">
                    <span className="ticket-c-weekday">{item.weekday}</span>
                    <span className="ticket-c-day">{item.day}</span>
                    <span className="ticket-c-month">{item.month}</span>
                </div>

                <img
                    src={item.image}
                    alt={item.title}
                    className="ticket-c-thumb-img"
                />
            </div>

            {/* VERTICAL TEAR DOTTED LINE */}
            <div className="ticket-c-tear-divider">
                <svg xmlns="http://www.w3.org/2000/svg" width="2" height="211" viewBox="0 0 2 211" fill="none">
                    <path d="M1 210V1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
                </svg>
            </div>

            {/* RIGHT MAIN TICKET CONTENT */}
            <div className="ticket-c-main">

                {/* TOP CONTENT GRID */}
                <div className="ticket-c-top-grid">

                    {/* LEFT DETAIL COL */}
                    <div className="ticket-c-left-info">
                        <div className="ticket-c-title-by-wrapper">
                            <h3 className="ticket-c-event-title">{item.title}</h3>
                            <p className="ticket-c-event-by">{item.by}</p>
                        </div>
                        <div className="ticket-c-date-v-container">
                            <p className="ticket-c-event-datetime">{item.date}</p>
                            <p className="ticket-c-event-venue">
                                <strong>{item.venue}</strong>{item.venueDetail ? <span>: <span className="ticket-c-subvenue">{item.venueDetail}</span></span> : null}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT META COL */}
                    <div className="ticket-c-right-meta">
                        <div className="ticket-c-meta-row">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M12.75 15.75V14.25C12.75 13.4544 12.4339 12.6913 11.8713 12.1287C11.3087 11.5661 10.5456 11.25 9.75 11.25H3.75C2.95435 11.25 2.19129 11.5661 1.62868 12.1287C1.06607 12.6913 0.75 13.4544 0.75 14.25V15.75M17.25 15.75V14.25C17.2495 13.5853 17.0283 12.9396 16.621 12.4142C16.2138 11.8889 15.6436 11.5137 15 11.3475M12 2.3475C12.6453 2.51273 13.2173 2.88803 13.6257 3.41423C14.0342 3.94044 14.2559 4.58762 14.2559 5.25375C14.2559 5.91988 14.0342 6.56706 13.6257 7.09327C13.2173 7.61947 12.6453 7.99477 12 8.16M9.75 5.25C9.75 6.90685 8.40685 8.25 6.75 8.25C5.09315 8.25 3.75 6.90685 3.75 5.25C3.75 3.59315 5.09315 2.25 6.75 2.25C8.40685 2.25 9.75 3.59315 9.75 5.25Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>QUANTITY: {item.quantity}</span>
                        </div>

                        <div className="ticket-c-meta-row">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 6V5.25M7.5 9.375V8.625M7.5 12.75V12M3.9 3H14.1C14.9401 3 15.3601 3 15.681 3.16349C15.9632 3.3073 16.1927 3.53677 16.3365 3.81901C16.5 4.13988 16.5 4.55992 16.5 5.4V6.375C15.0503 6.375 13.875 7.55025 13.875 9C13.875 10.4497 15.0503 11.625 16.5 11.625V12.6C16.5 13.4401 16.5 13.8601 16.3365 14.181C16.1927 14.4632 15.9632 14.6927 15.681 14.8365C15.3601 15 14.9401 15 14.1 15H3.9C3.05992 15 2.63988 15 2.31901 14.8365C2.03677 14.6927 2.03677 14.4632 1.66349 14.181C1.5 13.8601 1.5 13.4401 1.5 12.6V11.625C2.94975 11.625 4.125 10.4497 4.125 9C4.125 7.55025 2.94975 6.375 1.5 6.375V5.4C1.5 4.55992 1.5 4.13988 1.66349 3.81901C1.8073 3.53677 2.03677 3.3073 2.31901 3.16349C2.63988 3 3.05992 3 3.9 3Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>PASS TYPE: {item.passType}</span>
                        </div>

                        <div className="ticket-c-meta-row ticket-c-amount-row">
                            <span>AMOUNT: ₹{item.amount}</span>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ACTIONS BAR */}
                <div className="ticket-c-action-bar">
                    <div className="ticket-c-action-left">
                        <div className="ticket-c-act-button" onClick={handleCancelClick}>
                            <span className="ticket-c-icon-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                    <g clipPath="url(#clip0_tc_1)">
                                        <path d="M0.781516 10.7402L1.62812 11.538C1.92699 11.3619 2.22993 11.2256 2.57882 11.1846C3.26928 11.1032 3.94673 11.3373 4.43265 11.7959C4.91329 12.2498 5.16581 12.8964 5.07838 13.548C5.03446 13.8738 4.89214 14.1531 4.70753 14.4394L5.53991 15.2272C5.6684 15.3488 5.85382 15.3795 5.99289 15.2479L8.3851 12.9893C8.52661 12.8557 8.7222 12.8208 8.87916 12.9536C9.00928 13.0637 9.03611 13.2771 8.89379 13.411L6.43653 15.7252C6.0795 16.0618 5.47972 16.0652 5.12555 15.7325L4.03944 14.7126C3.9207 14.6009 3.90932 14.4071 4.02033 14.2878C4.29399 13.9942 4.43387 13.6397 4.41639 13.2444C4.37979 12.4071 3.6385 11.7648 2.74351 11.8112C2.38811 11.8296 2.0685 11.9789 1.7863 12.1796C1.65577 12.2724 1.46791 12.2836 1.34429 12.1677L0.246797 11.1404C0.0190842 10.9275 -0.0276783 10.6427 0.0133914 10.35C0.0373826 10.178 0.132534 10.0107 0.268349 9.88296L2.19008 8.07905L4.7482 5.68419L7.22498 3.36646L8.38632 2.27552L8.54612 2.11512L10.5293 0.277434C10.8932 -0.0598642 11.4641 -0.107447 11.8284 0.233689L12.956 1.2901C13.0727 1.39946 13.0581 1.58634 12.9568 1.70491C12.5669 2.16116 12.4819 2.77206 12.7617 3.31389C13.013 3.80123 13.5493 4.13699 14.1572 4.14965C14.535 4.15733 14.8855 4.04298 15.1836 3.81811C15.3165 3.71796 15.5085 3.69839 15.6398 3.82156L16.7434 4.85687C17.1399 5.2287 17.0467 5.7947 16.6718 6.14658L14.7387 7.95971C14.6801 8.01458 14.637 8.06638 14.5773 8.11627C14.5106 8.17229 14.4423 8.23676 14.3874 8.29969C14.2442 8.46431 14.0104 8.47429 13.8665 8.34152C13.6884 8.17728 13.7823 7.96738 13.9165 7.81849C13.8303 7.6815 13.7575 7.48657 13.9165 7.34727C14.0519 7.2287 14.2629 7.21297 14.4154 7.36301L16.2176 5.66155C16.3477 5.53875 16.3197 5.35917 16.1993 5.24597L15.3552 4.45203C15.0368 4.6343 14.7009 4.76631 14.3304 4.78703C12.9365 4.86492 11.7874 3.74367 11.9346 2.43208C11.97 2.11665 12.1045 1.83308 12.2786 1.5495L11.4263 0.744434C11.3092 0.633919 11.1221 0.621256 10.9989 0.737143L9.2008 2.42517C9.31181 2.57214 9.32523 2.75249 9.19836 2.87797C9.07149 3.00345 8.86045 3.00537 8.70105 2.88603L6.7293 4.73484L3.57141 7.69762L0.746139 10.3519C0.63025 10.4609 0.679045 10.6439 0.781923 10.741L0.781516 10.7402Z" fill="white" />
                                        <path d="M15.9922 14.8615C14.5771 16.3097 12.2 16.3818 10.6934 15.046C9.11363 13.6454 9.11851 11.2943 10.704 9.89983C12.202 8.58249 14.5438 8.65041 15.9576 10.0587C17.3015 11.3971 17.3247 13.4977 15.9922 14.8618V14.8615ZM13.4455 15.3534C15.07 15.2552 16.3073 13.9754 16.302 12.4689C16.2964 10.9631 15.0602 9.70451 13.4536 9.60206C11.7657 9.49461 10.3087 10.6961 10.1965 12.2828C10.0737 14.0192 11.5896 15.4654 13.4455 15.3534Z" fill="white" />
                                        <path d="M11.8335 5.66229L11.5481 5.57288L11.1085 5.15961C11.0743 5.12737 11.0109 5.05178 11.0117 5.00496L11.0158 4.74096L11.2602 4.57404L11.5558 4.66153L12.0039 5.08325C12.0324 5.11011 12.0905 5.17649 12.0901 5.21218L12.0873 5.49422L11.8335 5.66306V5.66229Z" fill="white" />
                                        <path d="M10.6512 4.13547L10.4154 4.3093L10.1145 4.22296L9.58057 3.70339C9.5704 3.60669 9.57284 3.49234 9.58504 3.39027L9.83756 3.2337C9.9262 3.26325 10.0706 3.2786 10.134 3.33578L10.5837 3.74291C10.6988 3.8469 10.6699 3.97046 10.6512 4.13547Z" fill="white" />
                                        <path d="M13.5207 6.84036L13.2678 7.00229L12.9885 6.91787L12.4509 6.40636C12.4302 6.30582 12.4403 6.18763 12.4598 6.07712L12.6969 5.92401L12.9864 6.01649L13.4138 6.41941C13.5821 6.57827 13.5216 6.57136 13.5203 6.84074L13.5207 6.84036Z" fill="white" />
                                        <path d="M14.6903 13.3853C14.8326 13.5199 14.7879 13.7348 14.6622 13.8388C14.5191 13.957 14.3149 13.9493 14.1783 13.8204L13.2431 12.9378L12.3224 13.8066C12.1809 13.9401 11.974 13.9681 11.8199 13.835C11.684 13.7176 11.6682 13.5031 11.8138 13.3657L12.7539 12.4774L11.8125 11.5894C11.6731 11.4578 11.6641 11.2544 11.802 11.1266C11.9398 10.9988 12.1541 10.9904 12.3009 11.1289L13.2427 12.0165L14.2133 11.109C14.3377 10.9923 14.5544 11.0157 14.6748 11.117C14.7879 11.2118 14.8407 11.4229 14.7134 11.5437L13.7306 12.477L14.689 13.3853H14.6903Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_tc_1">
                                            <rect width="17" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>
                            <span className="ticket-c-action-bar-title">CANCEL BOOKINGS</span>
                        </div>

                        <div className="ticket-c-act-button">
                            <span className="ticket-c-icon-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <g clipPath="url(#clip0_tc_2)">
                                        <path d="M9.40717 4.37036C9.95321 4.4769 10.4953 4.71771 10.8887 5.1111C11.282 5.5045 11.5229 6.04654 11.6294 6.59259M9.77754 1.77777C10.912 1.9038 11.9329 2.45264 12.7405 3.25925C13.5481 4.06587 14.0945 5.08791 14.222 6.22222M14.2216 11.7605V13.7677C14.2247 14.535 13.5348 15.1758 12.7601 15.1059C6.07387 15.1111 0.888672 9.87776 0.893905 3.23643C0.824135 2.46588 1.46169 1.77856 2.22801 1.77784H4.23924C4.56459 1.77464 4.88 1.88962 5.12669 2.10136C5.82804 2.70332 6.27915 4.74649 6.10559 5.55872C5.97007 6.19286 5.33083 6.63651 4.89623 7.07025C5.8506 8.74531 7.24028 10.1322 8.91867 11.0847C9.35327 10.651 9.79781 10.013 10.4332 9.87776C11.2483 9.70427 13.3046 10.156 13.9042 10.8622C14.1168 11.1127 14.2297 11.4324 14.2216 11.7605Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_tc_2">
                                            <rect width="16" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>
                            <span className="ticket-c-action-bar-title">CONTACT US</span>
                        </div>
                    </div>

                    <div className="ticket-c-action-right">
                        <a href="#policy" className="ticket-c-policy-link">
                            CANCELLATION &amp; REFUND POLICY
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
