// Google Translate integration utility for BLR Hubba 2027

const setCookie = (name, value, days = 30) => {
    if (typeof document === "undefined") return;
    const host = window.location.hostname;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();

    document.cookie = `${name}=${value}; expires=${expires}; path=/;`;
    document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=${host};`;

    const parts = host.split(".");
    if (parts.length > 1) {
        const rootDomain = "." + parts.slice(-2).join(".");
        document.cookie = `${name}=${value}; expires=${expires}; path=/; domain=${rootDomain};`;
    }
};

const clearCookie = (name) => {
    if (typeof document === "undefined") return;
    const host = window.location.hostname;
    const expired = "Thu, 01 Jan 1970 00:00:00 UTC";

    document.cookie = `${name}=; expires=${expired}; path=/;`;
    document.cookie = `${name}=; expires=${expired}; path=/; domain=${host};`;

    const parts = host.split(".");
    if (parts.length > 1) {
        const rootDomain = "." + parts.slice(-2).join(".");
        document.cookie = `${name}=; expires=${expired}; path=/; domain=${rootDomain};`;
    }
};

export const applyGoogleTranslate = (targetLang) => {
    if (typeof window === "undefined") return;

    const isKn = targetLang === "kn";

    if (isKn) {
        setCookie("googtrans", "/en/kn");

        let attempts = 0;
        const maxAttempts = 25;

        const interval = setInterval(() => {
            attempts++;
            const combo = document.querySelector(".goog-te-combo");

            if (combo) {
                if (combo.value !== "kn") {
                    combo.value = "kn";
                    combo.dispatchEvent(new Event("change", { bubbles: true }));
                }
                clearInterval(interval);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 150);
    } else {
        // Reverting to English
        const hadKnCookie = typeof document !== "undefined" && document.cookie.includes("/en/kn");
        const hasFontTags = typeof document !== "undefined" && Boolean(document.querySelector("font"));

        clearCookie("googtrans");
        setCookie("googtrans", "/en/en");

        // If the page was translated to Kannada, ensure clean English restoration
        if (hadKnCookie || hasFontTags) {
            let restoredCleanly = false;

            // 1. Try Google Translate iframe's native restore button
            try {
                const iframe = document.querySelector("iframe.goog-te-banner-frame");
                if (iframe) {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    const restoreBtn = doc?.querySelector(".goog-close-link") ||
                                       doc?.querySelector(".goog-te-banner-frame-restore") ||
                                       doc?.getElementById(":1.restore");
                    if (restoreBtn) {
                        restoreBtn.click();
                        restoredCleanly = true;
                    }
                }
            } catch (e) {
                // Cross-origin or restricted
            }

            // 2. Try select combo with empty or 'en'
            try {
                const combo = document.querySelector(".goog-te-combo");
                if (combo) {
                    combo.value = "";
                    combo.dispatchEvent(new Event("change", { bubbles: true }));
                }
            } catch (e) {}

            // 3. Fallback reload to guarantee pristine English without DOM artifacts
            setTimeout(() => {
                const stillHasFontTags = Boolean(document.querySelector("font"));
                if (stillHasFontTags || !restoredCleanly) {
                    window.location.reload();
                }
            }, 150);
        }
    }
};

export const syncGoogleTranslateOnNavigation = (targetLang) => {
    if (typeof window === "undefined" || targetLang !== "kn") return;

    // Give React 200ms to mount the new route DOM, then re-check Google Translate
    setTimeout(() => {
        const combo = document.querySelector(".goog-te-combo");
        if (combo) {
            if (combo.value !== "kn") {
                combo.value = "kn";
            }
            combo.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }, 200);
};
