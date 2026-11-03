import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MotionSection, MotionButton } from "../AnimatedPage";
import { resolveSubfestivalImageUrl } from "../../utils/subfestivalImageResolver";
import { useLanguage } from "../../context/LanguageContext";
import "./FestivalsSection.css";

export const FestivalsSection = ({
    subtitle = "OUR FESTIVALS",
    title = "There’s a festival for everyone at the Hubba — discover yours.",
    viewAllLink = "/festivals",
    excludeSlug = null,
}) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isKannada = language === "kn";
    const [subfestivals, setSubfestivals] = useState([]);

    const wrapperRef = useRef(null);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const startScrollLeftRef = useRef(0);
    const hasDraggedRef = useRef(false);
    const isHoveredRef = useRef(false);
    const isAnimatingRef = useRef(false);
    const pauseTimerRef = useRef(null);
    const animFrameRef = useRef(null);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/public/subfestivals`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch subfestivals");
                return res.json();
            })
            .then((data) => {
                const rawList = data?.data?.subfestivals || data?.subfestivals || data?.data || (Array.isArray(data) ? data : []);
                const apiList = Array.isArray(rawList) ? rawList : [];

                if (apiList && apiList.length > 0) {
                    let filtered = apiList;
                    if (excludeSlug) {
                        filtered = apiList.filter(
                            (sf) => sf.slug !== excludeSlug && sf.id !== excludeSlug
                        );
                    }

                    const mapped = filtered.map((sf) => ({
                        id: sf.id || sf.slug,
                        slug: sf.slug || sf.id,
                        name: sf.name,
                        img: resolveSubfestivalImageUrl(sf),
                    }));

                    setSubfestivals(mapped);
                }
            })
            .catch((err) => {
                console.error("Error fetching subfestivals for marquee:", err);
            });
    }, [excludeSlug]);

    // Three identical cycles of all 17 subfestivals ensure seamless infinite loop
    // (After the 17th subfest, the 1st subfest immediately follows)
    const displayList = subfestivals.length > 0
        ? [...subfestivals, ...subfestivals, ...subfestivals]
        : [];

    const getCardStepDistance = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return 294;
        const firstCard = wrapper.querySelector(".hp-festival-card");
        if (firstCard && firstCard.offsetWidth > 0) {
            return firstCard.offsetWidth + 24; // card width + 24px gap
        }
        return 294;
    }, []);

    const checkCycleWrap = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const cycleWidth = wrapper.scrollWidth / 3;
        if (cycleWidth > 0) {
            while (wrapper.scrollLeft >= 2 * cycleWidth) {
                wrapper.scrollLeft -= cycleWidth;
            }
            while (wrapper.scrollLeft <= 0) {
                wrapper.scrollLeft += cycleWidth;
            }
        }
    }, []);

    // Smooth step animation using easeOutCubic
    const smoothStep = useCallback((distance, duration = 500) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }

        const start = wrapper.scrollLeft;
        const startTime = performance.now();
        isAnimatingRef.current = true;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic: quick start, smooth settle
            const ease = 1 - Math.pow(1 - progress, 3);
            wrapper.scrollLeft = start + distance * ease;

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                isAnimatingRef.current = false;
                checkCycleWrap();
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
    }, [checkCycleWrap]);

    const stepNext = useCallback(() => {
        const stepDist = getCardStepDistance();
        smoothStep(stepDist, 500);
    }, [getCardStepDistance, smoothStep]);

    const stepPrev = useCallback(() => {
        const stepDist = getCardStepDistance();
        smoothStep(-stepDist, 500);
    }, [getCardStepDistance, smoothStep]);

    // Center in middle cycle initially so both backward & forward scrolling work immediately
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || !displayList.length) return;

        const setInitialPosition = () => {
            if (wrapper.scrollWidth > 0) {
                const cycleWidth = wrapper.scrollWidth / 3;
                if (cycleWidth > 0 && (wrapper.scrollLeft === 0 || wrapper.scrollLeft < cycleWidth * 0.5)) {
                    wrapper.scrollLeft = cycleWidth;
                }
            }
        };

        const timer = setTimeout(setInitialPosition, 60);
        window.addEventListener("resize", setInitialPosition);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", setInitialPosition);
        };
    }, [displayList.length]);

    // Stepped auto-ticker with increased speed: pause 1.7s, smooth step 0.5s (2.2s total per card)
    useEffect(() => {
        if (!displayList.length) return;

        const interval = setInterval(() => {
            if (!isDownRef.current && !isHoveredRef.current && !isAnimatingRef.current) {
                stepNext();
            }
        }, 2200);

        return () => {
            clearInterval(interval);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        };
    }, [displayList.length, stepNext]);

    // Handle wrap on trackpad / mousewheel horizontal scroll
    const handleScroll = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || isDownRef.current || isAnimatingRef.current) return;
        checkCycleWrap();
    }, [checkCycleWrap]);

    // Pointer events for press down and drag left/right
    const handlePointerDown = useCallback((e) => {
        if (e.button !== undefined && e.button !== 0) return;
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            isAnimatingRef.current = false;
        }

        isDownRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.clientX;
        startScrollLeftRef.current = wrapper.scrollLeft;
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!isDownRef.current) return;
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const diffX = e.clientX - startXRef.current;
        if (Math.abs(diffX) > 8) {
            if (!hasDraggedRef.current) {
                hasDraggedRef.current = true;
                wrapper.classList.add("is-dragging");
                try {
                    wrapper.setPointerCapture(e.pointerId);
                } catch (err) {}
            }

            const cycleWidth = wrapper.scrollWidth / 3;
            let target = startScrollLeftRef.current - diffX;

            if (cycleWidth > 0) {
                while (target <= 0) {
                    target += cycleWidth;
                    startScrollLeftRef.current += cycleWidth;
                }
                while (target >= 2 * cycleWidth) {
                    target -= cycleWidth;
                    startScrollLeftRef.current -= cycleWidth;
                }
            }

            wrapper.scrollLeft = target;
        }
    }, []);

    const handlePointerUp = useCallback((e) => {
        if (!isDownRef.current) return;
        isDownRef.current = false;
        const wrapper = wrapperRef.current;

        if (wrapper) {
            wrapper.classList.remove("is-dragging");
            try {
                if (wrapper.hasPointerCapture && wrapper.hasPointerCapture(e.pointerId)) {
                    wrapper.releasePointerCapture(e.pointerId);
                }
            } catch (err) {}
        }

        // Pause ticker briefly after dragging so user can inspect landing card
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        isHoveredRef.current = true;
        pauseTimerRef.current = setTimeout(() => {
            isHoveredRef.current = false;
        }, 2500);

        if (hasDraggedRef.current) {
            setTimeout(() => {
                hasDraggedRef.current = false;
            }, 120);
        } else {
            hasDraggedRef.current = false;
        }
    }, []);

    const handlePointerCancel = useCallback((e) => {
        if (!isDownRef.current) return;
        isDownRef.current = false;
        const wrapper = wrapperRef.current;

        if (wrapper) {
            wrapper.classList.remove("is-dragging");
            try {
                e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (err) {}
        }

        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        isHoveredRef.current = true;
        pauseTimerRef.current = setTimeout(() => {
            isHoveredRef.current = false;
        }, 2000);

        setTimeout(() => {
            hasDraggedRef.current = false;
        }, 100);
    }, []);

    const handleMouseEnter = useCallback(() => {
        isHoveredRef.current = true;
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (!isDownRef.current) {
            isHoveredRef.current = false;
        }
    }, []);

    const handlePrev = useCallback(() => {
        isHoveredRef.current = true;
        stepPrev();
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
            isHoveredRef.current = false;
        }, 3000);
    }, [stepPrev]);

    const handleNext = useCallback(() => {
        isHoveredRef.current = true;
        stepNext();
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
            isHoveredRef.current = false;
        }, 3000);
    }, [stepNext]);

    const handleCardClick = useCallback((fest, e) => {
        if (hasDraggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        navigate(`/festivals/${fest.slug || fest.id}`);
    }, [navigate]);

    if (!subfestivals || subfestivals.length === 0) {
        return null;
    }

    const renderTitle = () => {
        if (isKannada) {
            return (
                <>
                    <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                        ಹಬ್ಬದಲ್ಲಿ ಎಲ್ಲರಿಗೂ ಜಾಗವಿದೆ — ನಿಮ್ಮ ಪ್ರಿಯ
                    </span>
                    <br />
                    <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                        ಹಬ್ಬದಲ್ಲಿ ಭಾಗವಹಿಸಿ.
                    </span>
                </>
            );
        }
        if (
            typeof title === "string" &&
            (title.includes("There’s a festival for everyone at") ||
             title.includes("There's a festival for everyone at"))
        ) {
            return (
                <>
                    <span className="hp-festivals-title-line">There’s a festival for everyone at </span>
                    <span className="hp-festivals-title-line">the Hubba – discover yours.</span>
                </>
            );
        }
        return title;
    };

    return (
        <MotionSection className="hp-festivals-section" variant="slideLeft">
            <div className="hp-festivals-header">
                <div className="hp-festivals-header-left">
                    <span className={`hp-festivals-subtitle ${isKannada ? "kannada" : ""}`}>
                        {isKannada ? (subtitle === "OTHER FESTIVALS" ? "ಇತರ ಹಬ್ಬಗಳು" : "ನಮ್ಮ ಹಬ್ಬಗಳು") : subtitle}
                    </span>
                    <h2 className={`hp-festivals-title ${isKannada ? "kannada" : ""}`}>
                        {renderTitle()}
                    </h2>
                </div>
                <MotionButton className={`hp-festivals-view-all-btn hp-festivals-btn-desktop ${isKannada ? "kannada" : ""}`} onClick={() => navigate(viewAllLink)}>
                    <span className="btn-text-primary">{isKannada ? "ಸಂಪೂರ್ಣ ನೋಡಿ" : "VIEW ALL"}</span>
                    <span className="btn-text-secondary">{isKannada ? "ಸಂಪೂರ್ಣ ನೋಡಿ" : "VIEW ALL"}</span>
                </MotionButton>
            </div>

            <div
                className="hp-festivals-marquee-wrapper"
                ref={wrapperRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onScroll={handleScroll}
            >
                <div className="hp-festivals-track">
                    {displayList.map((fest, idx) => (
                        <div
                            key={`${fest.id}-${idx}`}
                            className="hp-festival-card"
                            onClick={(e) => handleCardClick(fest, e)}
                        >
                            <img
                                src={fest.img}
                                alt={fest.name}
                                className="hp-festival-card-img"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Centered Arrow Buttons (as requested) */}
            <div className="hp-festivals-bottom-controls">
                <div className="hp-festivals-nav-arrows">
                    <button
                        type="button"
                        className="hp-festivals-nav-btn"
                        aria-label="Previous festival"
                        onClick={handlePrev}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 5L5 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="hp-festivals-nav-btn"
                        aria-label="Next festival"
                        onClick={handleNext}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M12 19L19 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <MotionButton className={`hp-festivals-view-all-btn hp-festivals-btn-mobile ${isKannada ? "kannada" : ""}`} onClick={() => navigate(viewAllLink)}>
                <span className="btn-text-primary">{isKannada ? "ಸಂಪೂರ್ಣ ನೋಡಿ" : "VIEW ALL"}</span>
                <span className="btn-text-secondary">{isKannada ? "ಸಂಪೂರ್ಣ ನೋಡಿ" : "VIEW ALL"}</span>
            </MotionButton>
        </MotionSection>
    );
};

export default FestivalsSection;
