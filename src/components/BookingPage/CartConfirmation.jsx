import React from "react";
import "./CartConfirmation.css";
import { useNavigate } from "react-router-dom";

export const CartConfirmation = () => {
    const navigate = useNavigate();

    return (
        <section className="cart-confirmation-container">

            <div className="cart-confirmation-card">
                <div>

                    <div className="cart-confirmation-icon">

                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                            <path d="M43.166 18.6667V7.00001M12.8327 49V37.3333M37.3327 12.8333H48.9994M6.99935 43.1667H18.666M15.166 4.66667L13.3356 8.32748C12.7161 9.56643 12.4064 10.1859 11.9926 10.7227C11.6254 11.1991 11.1984 11.6261 10.7221 11.9933C10.1852 12.4071 9.56577 12.7168 8.32682 13.3363L4.66602 15.1667L8.32682 16.9971C9.56577 17.6166 10.1852 17.9263 10.7221 18.3401C11.1984 18.7073 11.6254 19.1343 11.9926 19.6106C12.4064 20.1474 12.7161 20.7669 13.3356 22.0059L15.166 25.6667L16.9964 22.0059C17.6159 20.7669 17.9256 20.1474 18.3394 19.6106C18.7066 19.1343 19.1336 18.7073 19.61 18.3401C20.1468 17.9263 20.7663 17.6165 22.0052 16.9971L25.666 15.1667L22.0052 13.3363C20.7663 12.7168 20.1468 12.4071 19.61 11.9933C19.1336 11.6261 18.7066 11.1991 18.3394 10.7227C17.9256 10.1859 17.6159 9.56643 16.9964 8.32748L15.166 4.66667ZM39.666 28L37.4467 32.4386C36.8273 33.6775 36.5175 34.297 36.1037 34.8338C35.7365 35.3102 35.3095 35.7372 34.8332 36.1044C34.2964 36.5182 33.6769 36.8279 32.4379 37.4474L27.9994 39.6667L32.4379 41.886C33.6769 42.5054 34.2964 42.8152 34.8332 43.229C35.3095 43.5961 35.7365 44.0232 36.1037 44.4995C36.5175 45.0363 36.8273 45.6558 37.4467 46.8948L39.666 51.3333L41.8853 46.8948C42.5048 45.6558 42.8145 45.0363 43.2283 44.4995C43.5955 44.0232 44.0225 43.5961 44.4989 43.229C45.0357 42.8152 45.6552 42.5054 46.8941 41.886L51.3327 39.6667L46.8941 37.4474C45.6552 36.8279 45.0357 36.5182 44.4989 36.1044C44.0225 35.7372 43.5955 35.3102 43.2283 34.8338C42.8145 34.297 42.5048 33.6775 41.8853 32.4386L39.666 28Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                    </div>

                    <div className="cart-confirmation-content">

                        <h2 className="cart-confirmation-title">
                            Event added to cart !
                        </h2>

                        <p className="cart-confirmation-description">
                            View your cart to complete your booking
                            <br />
                            before passes sell out.
                        </p>

                    </div>
                </div>

                <div className="cart-confirmation-buttons">

                    <button className="view-cart-btn" onClick={() => navigate("/cart")}>
                        <span className="btn-text-primary">VIEW CART</span>
                        <span className="btn-text-secondary">VIEW CART</span>
                    </button>

                    <button className="browse-events-btn" onClick={() => navigate("/events")}>
                        <span className="btn-text-primary">BROWSE EVENTS</span>
                        <span className="btn-text-secondary">BROWSE EVENTS</span>
                    </button>

                </div>

            </div>

        </section>
    );
};

export default CartConfirmation;