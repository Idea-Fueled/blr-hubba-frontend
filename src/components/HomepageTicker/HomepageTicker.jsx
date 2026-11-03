import React, { useState, useEffect } from "react";
import "./HomepageTicker.css";

import logo1 from "../../assets/hp-ticker-logos/1st-logo.png";
import logo2 from "../../assets/hp-ticker-logos/2nd-logo.png";
import logo3 from "../../assets/hp-ticker-logos/3rd-logo.png";
import logo4 from "../../assets/hp-ticker-logos/4th-logo.png";
import logo5 from "../../assets/hp-ticker-logos/5th-logo.png";
import logo6 from "../../assets/hp-ticker-logos/6th-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FALLBACK_CATEGORIES = [
  {
    id: "fallback-1",
    name: "PARTNER",
    logos: [
      { id: "fl-1", name: "Government of Karnataka", imageUrl: logo1, className: "hp-logo-1" }
    ]
  },
  {
    id: "fallback-2",
    name: "TITLE SPONSOR",
    logos: [
      { id: "fl-2", name: "JSW Better Everyday", imageUrl: logo2, className: "hp-logo-2" }
    ]
  },
  {
    id: "fallback-3",
    name: "FESTIVAL SPONSORS",
    logos: [
      { id: "fl-3", name: "Manipal Foundation", imageUrl: logo3, className: "hp-logo-3" },
      { id: "fl-4", name: "Go Native", imageUrl: logo4, className: "hp-logo-4" },
      { id: "fl-5", name: "Prestige Group", imageUrl: logo5, className: "hp-logo-5" }
    ]
  },
  {
    id: "fallback-4",
    name: "ANCHOR",
    logos: [
      { id: "fl-6", name: "UnboxingBLR", imageUrl: logo6, className: "hp-logo-6" }
    ]
  }
];

const TickerContent = ({ categories }) => (
  <div className="hp-ticker-track-group">
    {categories.map((category) => (
      <React.Fragment key={category.id}>
        <div className={`hp-ticker-item ${category.logos.length > 1 ? "hp-ticker-item-multi" : ""}`}>
          <span className="hp-ticker-label">{category.name}</span>
          <div className="hp-ticker-logos-subgroup">
            {category.logos.map((logo) => (
              <img
                key={logo.id}
                src={logo.imageUrl}
                alt={logo.name || category.name}
                style={{
                  width: logo.width ? `${logo.width}px` : undefined,
                  height: logo.height ? `${logo.height}px` : undefined
                }}
                className={`hp-ticker-logo ${logo.className || ""}`}
              />
            ))}
          </div>
        </div>
        <svg className="hp-ticker-divider" xmlns="http://www.w3.org/2000/svg" width="1" height="40" viewBox="0 0 1 40" fill="none">
          <path d="M0.499998 40L0.5 0" stroke="#B7B7B7" />
        </svg>
      </React.Fragment>
    ))}
  </div>
);

const HomepageTicker = () => {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    const fetchTickerData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/homepage-ticker`);
        if (!res.ok) return;
        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          if (isMounted) {
            const resolved = result.data.map((cat, catIdx) => ({
              ...cat,
              logos: (cat.logos || []).map((logo, logoIdx) => {
                let img = logo.imageUrl;
                let cls = "";
                if (img?.includes("1st-logo") || (catIdx === 0 && logoIdx === 0 && img?.startsWith("/src/assets"))) {
                  img = logo1;
                  cls = "hp-logo-1";
                } else if (img?.includes("2nd-logo") || (catIdx === 1 && logoIdx === 0 && img?.startsWith("/src/assets"))) {
                  img = logo2;
                  cls = "hp-logo-2";
                } else if (img?.includes("3rd-logo") || (catIdx === 2 && logoIdx === 0 && img?.startsWith("/src/assets"))) {
                  img = logo3;
                  cls = "hp-logo-3";
                } else if (img?.includes("4th-logo") || (catIdx === 2 && logoIdx === 1 && img?.startsWith("/src/assets"))) {
                  img = logo4;
                  cls = "hp-logo-4";
                } else if (img?.includes("5th-logo") || (catIdx === 2 && logoIdx === 2 && img?.startsWith("/src/assets"))) {
                  img = logo5;
                  cls = "hp-logo-5";
                } else if (img?.includes("6th-logo") || (catIdx === 3 && logoIdx === 0 && img?.startsWith("/src/assets"))) {
                  img = logo6;
                  cls = "hp-logo-6";
                }
                return {
                  ...logo,
                  imageUrl: img,
                  className: cls
                };
              })
            }));
            setCategories(resolved);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic homepage ticker, using fallback:", err);
      }
    };

    fetchTickerData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="hp-ticker-section" aria-label="Sponsors and Partners">
      <div className="hp-ticker-wrapper">
        <div className="hp-ticker-track">
          <TickerContent categories={categories} />
          <TickerContent categories={categories} />
          <TickerContent categories={categories} />
          <TickerContent categories={categories} />
        </div>
      </div>
    </section>
  );
};

export default HomepageTicker;
