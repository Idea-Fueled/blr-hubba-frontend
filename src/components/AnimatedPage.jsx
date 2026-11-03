import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

// Custom hook to detect prefers-reduced-motion
export const useReducedMotionCheck = () => {
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setShouldReduceMotion(mediaQuery.matches);

        const handleChange = () => setShouldReduceMotion(mediaQuery.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return shouldReduceMotion;
};

// 1. COUNT UP NUMBER COMPONENT
export const CountUpNumber = ({ value, duration = 1.8, className = "", prefix = "", suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });
    const [displayValue, setDisplayValue] = useState(0);
    const prefersReducedMotion = useReducedMotionCheck();

    useEffect(() => {
        const numericVal = parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0;

        if (prefersReducedMotion) {
            setDisplayValue(numericVal);
            return;
        }

        if (isInView) {
            const controls = animate(0, numericVal, {
                duration: duration,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: (latest) => {
                    setDisplayValue(Math.floor(latest));
                }
            });
            return () => controls.stop();
        }
    }, [isInView, value, duration, prefersReducedMotion]);

    return (
        <span ref={ref} className={className}>
            {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
    );
};

// 2. MASKED TEXT REVEAL COMPONENT
export const MotionMaskText = ({ children, delay = 0, className = "", style = {} }) => {
    const prefersReducedMotion = useReducedMotionCheck();

    if (prefersReducedMotion) {
        return <div className={className} style={style}>{children}</div>;
    }

    return (
        <div style={{ overflow: "hidden", ...style }} className={className}>
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                whileInView={{ y: "0%", opacity: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                    duration: 0.65,
                    delay: delay,
                    ease: [0.22, 1, 0.36, 1]
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

// 3. HEADING REVEAL
export const MotionHeading = ({ children, className = "", delay = 0, style = {} }) => {
    const prefersReducedMotion = useReducedMotionCheck();

    if (prefersReducedMotion) {
        return <div className={className} style={style}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

// 4. SECTION REVEAL WITH VARIATIONS
export const MotionSection = ({
    children,
    className = "",
    delay = 0,
    variant = "slideUp",
    style = {}
}) => {
    const prefersReducedMotion = useReducedMotionCheck();

    if (prefersReducedMotion) {
        return <div className={className} style={style}>{children}</div>;
    }

    const variantsMap = {
        slideUp: {
            initial: { opacity: 0.1, y: 20 },
            animate: { opacity: 1, y: 0 }
        },
        scaleUp: {
            initial: { opacity: 0.1, scale: 0.985, y: 15 },
            animate: { opacity: 1, scale: 1, y: 0 }
        },
        slideLeft: {
            initial: { opacity: 0.1, x: -20 },
            animate: { opacity: 1, x: 0 }
        },
        slideRight: {
            initial: { opacity: 0.1, x: 20 },
            animate: { opacity: 1, x: 0 }
        },
        clipReveal: {
            initial: { opacity: 0.1, y: 25 },
            animate: { opacity: 1, y: 0 }
        }
    };

    const selectedVariant = variantsMap[variant] || variantsMap.slideUp;

    return (
        <motion.div
            initial={selectedVariant.initial}
            whileInView={selectedVariant.animate}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

// 5. CARD STAGGER REVEAL
export const MotionCard = ({ children, className = "", index = 0, onClick, style = {}, whileHover }) => {
    const prefersReducedMotion = useReducedMotionCheck();

    if (prefersReducedMotion) {
        return (
            <div className={className} onClick={onClick} style={style}>
                {children}
            </div>
        );
    }

    const defaultHover = { y: -4, scale: 1.01, transition: { duration: 0.25, ease: "easeOut" } };
    const hoverConfig = whileHover === false ? undefined : (whileHover || defaultHover);

    return (
        <motion.div
            initial={{ opacity: 0.1, y: 20, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
                duration: 0.5,
                delay: Math.min(index * 0.08, 0.32),
                ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={hoverConfig}
            className={className}
            onClick={onClick}
            style={style}
        >
            {children}
        </motion.div>
    );
};

// 6. IMAGE REVEAL COMPONENT
export const MotionImageReveal = ({ src, alt, className = "", style = {}, delay = 0 }) => {
    const prefersReducedMotion = useReducedMotionCheck();

    if (prefersReducedMotion) {
        return <img src={src} alt={alt} className={className} style={style} />;
    }

    return (
        <motion.img
            src={src}
            alt={alt}
            initial={{ opacity: 0.2, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1.0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.7,
                delay: delay,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={className}
            style={style}
        />
    );
};

// 7. BUTTON MICRO-INTERACTION
export const MotionButton = ({ children, className = "", onClick, style = {}, type = "button", ariaLabel }) => {
    const prefersReducedMotion = useReducedMotionCheck();

    if (prefersReducedMotion) {
        return (
            <button className={className} onClick={onClick} style={style} type={type} aria-label={ariaLabel}>
                {children}
            </button>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
            onClick={onClick}
            style={style}
            type={type}
            aria-label={ariaLabel}
        >
            {children}
        </motion.button>
    );
};

// 8. PAGE WRAPPER
export const AnimatedPage = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0.2, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.2, y: -5 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={className}
            style={{ width: "100%" }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;
