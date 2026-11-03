import React, { useEffect } from "react";
import "./AddToCalendarModal.css";

export const AddToCalendarModal = ({ isOpen, onClose, events = [], calendarName = "BLR Hubba 2027" }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const eventsList = Array.isArray(events) && events.length > 0 ? events : [];
    const eventCount = eventsList.length;
    const primaryEvent = eventsList[0] || {
        title: "BLR Hubba 2027 Festival",
        name: "BLR Hubba 2027 Festival",
        performer: "Various Artists",
        venue: "Bengaluru, Karnataka, India",
        startDateTime: "2027-01-16T18:00:00Z",
        endDateTime: "2027-01-16T22:00:00Z"
    };

    const formatIcsDate = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) {
            return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        }
        return dateObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const escapeIcsText = (text) => {
        if (!text) return "";
        return String(text)
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\n/g, "\\n");
    };

    // 1. Download ICS (Apple Calendar / Outlook / Universal)
    const handleDownloadIcs = () => {
        const isSingleEvent = eventsList.length === 1;
        const icsLines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//BLR Hubba//Festival Calendar//EN",
            "CALSCALE:GREGORIAN",
            isSingleEvent ? "METHOD:REQUEST" : "METHOD:PUBLISH",
            `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
            "X-WR-TIMEZONE:Asia/Kolkata"
        ];

        const nowStamp = formatIcsDate(new Date());

        eventsList.forEach((evt, idx) => {
            if (!evt) return;

            const titleStr = evt.title || evt.name || `BLR Hubba Event ${idx + 1}`;
            const performerStr = evt.performer || evt.artist || evt.artistName || "";
            const venueStr = evt.venue || evt.venueName || evt.address || evt.location || "Bengaluru, India";

            let startDateObj = evt.startDateTime ? new Date(evt.startDateTime) : null;
            let endDateObj = evt.endDateTime ? new Date(evt.endDateTime) : null;

            if (!startDateObj || isNaN(startDateObj.getTime())) {
                if (evt.eventDates && Array.isArray(evt.eventDates) && evt.eventDates.length > 0) {
                    const firstEd = evt.eventDates[0];
                    const rawD = firstEd.startDateTime || firstEd.date || firstEd.dateTime;
                    if (rawD) startDateObj = new Date(rawD);
                }
            }

            if (!startDateObj || isNaN(startDateObj.getTime())) {
                startDateObj = new Date(2027, 0, 16, 18, 0, 0);
            }

            if (!endDateObj || isNaN(endDateObj.getTime())) {
                endDateObj = new Date(startDateObj.getTime() + 2 * 60 * 60 * 1000);
            }

            const dtStartStr = formatIcsDate(startDateObj);
            const dtEndStr = formatIcsDate(endDateObj);
            const eventUid = `${evt.id || evt.slug || idx}-${Date.now()}@blrhubba.in`;

            const descriptionStr = performerStr
                ? `${performerStr} | BLR Hubba 2027 Festival\n${evt.description || ""}`
                : `BLR Hubba 2027 Festival Event\n${evt.description || ""}`;

            icsLines.push(
                "BEGIN:VEVENT",
                `UID:${eventUid}`,
                `DTSTAMP:${nowStamp}`,
                `ORGANIZER;CN="BLR Hubba":mailto:calendar@blrhubba.in`,
                `DTSTART:${dtStartStr}`,
                `DTEND:${dtEndStr}`,
                `SUMMARY:${escapeIcsText(titleStr)}`,
                `DESCRIPTION:${escapeIcsText(descriptionStr)}`,
                `LOCATION:${escapeIcsText(venueStr)}`,
                "CLASS:PUBLIC",
                "PRIORITY:5",
                "STATUS:CONFIRMED",
                "SEQUENCE:0",
                "TRANSP:OPAQUE",
                "END:VEVENT"
            );
        });

        icsLines.push("END:VCALENDAR");

        const icsContent = icsLines.join("\r\n");
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${calendarName.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        onClose();
    };

    // 2. Open Google Calendar (Web Link)
    const handleGoogleCalendar = () => {
        const title = encodeURIComponent(primaryEvent.title || primaryEvent.name || "BLR Hubba 2027 Festival");
        const details = encodeURIComponent(
            `${primaryEvent.performer || ""} | BLR Hubba 2027 Festival\n${primaryEvent.description || "Join us at the BLR Hubba Festival!"}`
        );
        const location = encodeURIComponent(primaryEvent.venue || primaryEvent.venueName || "Bengaluru, Karnataka, India");

        let startIso = "20270116T180000Z";
        let endIso = "20270116T220000Z";

        if (primaryEvent.startDateTime) {
            const s = new Date(primaryEvent.startDateTime);
            if (!isNaN(s.getTime())) startIso = formatIcsDate(s);
        }
        if (primaryEvent.endDateTime) {
            const e = new Date(primaryEvent.endDateTime);
            if (!isNaN(e.getTime())) endIso = formatIcsDate(e);
        } else if (primaryEvent.startDateTime) {
            const s = new Date(primaryEvent.startDateTime);
            if (!isNaN(s.getTime())) {
                const e = new Date(s.getTime() + 2 * 60 * 60 * 1000);
                endIso = formatIcsDate(e);
            }
        }

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
        window.open(googleUrl, "_blank", "noopener,noreferrer");
        onClose();
    };

    // 3. Open Outlook Web Calendar (Direct Event Compose)
    const handleOutlook = () => {
        const subject = encodeURIComponent(primaryEvent.title || primaryEvent.name || "BLR Hubba 2027 Festival");
        const body = encodeURIComponent(
            `${primaryEvent.performer || ""} | BLR Hubba 2027 Festival\n${primaryEvent.description || ""}`
        );
        const location = encodeURIComponent(primaryEvent.venue || primaryEvent.venueName || "Bengaluru, India");

        let startIso = new Date("2027-01-16T18:00:00Z").toISOString();
        let endIso = new Date("2027-01-16T22:00:00Z").toISOString();

        if (primaryEvent.startDateTime) {
            const s = new Date(primaryEvent.startDateTime);
            if (!isNaN(s.getTime())) startIso = s.toISOString();
        }
        if (primaryEvent.endDateTime) {
            const e = new Date(primaryEvent.endDateTime);
            if (!isNaN(e.getTime())) endIso = e.toISOString();
        }

        const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&body=${body}&location=${location}&startdt=${startIso}&enddt=${endIso}`;
        window.open(outlookUrl, "_blank", "noopener,noreferrer");
        onClose();
    };

    return (
        <div className="add-to-calendar-backdrop" onClick={onClose}>
            <div className="add-to-calendar-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="add-to-calendar-header">
                    <div className="add-to-calendar-header-left">
                        <span className="add-to-calendar-tag">CALENDAR SYNC</span>
                        <h3 className="add-to-calendar-title">Add to Calendar</h3>
                        <p className="add-to-calendar-subtitle">
                            {eventCount > 1
                                ? `${eventCount} events selected from ${calendarName}`
                                : (primaryEvent.title || primaryEvent.name || calendarName)}
                        </p>
                    </div>
                    <button className="add-to-calendar-close-btn" onClick={onClose} aria-label="Close">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Calendar Options List */}
                <div className="add-to-calendar-options">
                    {/* Google Calendar */}
                    <button className="calendar-option-item" onClick={handleGoogleCalendar}>
                        <div className="calendar-option-icon google-cal-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4H19ZM19 20H5V9H19V20ZM7 11H12V16H7V11Z" fill="#4285F4" />
                            </svg>
                        </div>
                        <div className="calendar-option-content">
                            <span className="calendar-option-name">Google Calendar</span>
                            <span className="calendar-option-desc">Opens directly in Google Calendar • 1-Click Save</span>
                        </div>
                        <span className="calendar-option-arrow">→</span>
                    </button>

                    {/* Apple Calendar */}
                    <button className="calendar-option-item" onClick={handleDownloadIcs}>
                        <div className="calendar-option-icon apple-cal-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.98 1.72-.85 2.74 1 .08 2.03-.54 2.55-1.24z" />
                            </svg>
                        </div>
                        <div className="calendar-option-content">
                            <span className="calendar-option-name">Apple Calendar</span>
                            <span className="calendar-option-desc">Best for iPhone, iPad & Mac users</span>
                        </div>
                        <span className="calendar-option-arrow">→</span>
                    </button>

                    {/* Outlook */}
                    <button className="calendar-option-item" onClick={handleOutlook}>
                        <div className="calendar-option-icon outlook-cal-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="4" fill="#0078D4" />
                                <path d="M14 6H19V18H14V6Z" fill="#28A8EA" />
                                <path d="M5 8.5L13 6V18L5 15.5V8.5Z" fill="#0078D4" />
                                <ellipse cx="9" cy="12" rx="2.5" ry="3.5" fill="#FFFFFF" />
                            </svg>
                        </div>
                        <div className="calendar-option-content">
                            <span className="calendar-option-name">Outlook / Office 365</span>
                            <span className="calendar-option-desc">Opens Outlook Web Calendar</span>
                        </div>
                        <span className="calendar-option-arrow">→</span>
                    </button>

                    {/* Download ICS */}
                    <button className="calendar-option-item" onClick={handleDownloadIcs}>
                        <div className="calendar-option-icon ics-cal-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="#000000" />
                            </svg>
                        </div>
                        <div className="calendar-option-content">
                            <span className="calendar-option-name">Download .ICS File</span>
                            <span className="calendar-option-desc">Universal file ({eventCount} events) • Works on all apps</span>
                        </div>
                        <span className="calendar-option-arrow">↓</span>
                    </button>
                </div>

                {/* Footer Note */}
                <div className="add-to-calendar-footer">
                    <span className="add-to-calendar-tip-icon">💡</span>
                    <span className="add-to-calendar-tip-text">
                        <strong>Tip:</strong> Google Calendar opens directly in your browser. iPhone & Mac users can tap Apple Calendar for instant sync.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AddToCalendarModal;
