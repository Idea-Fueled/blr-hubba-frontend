import React, { useState } from "react";
import "./MultipleVenueDateBooking.css";
import { useLocation, useNavigate } from "react-router-dom";
import { BookingFlow } from "./BookingFlow";
import { ReviewOrder } from "./ReviewOrder";
import { extractSubVenueName } from "../../utils/subVenueUtils";

const formatTimeString = (timeStr) => {
    if (!timeStr) return "";
    if (typeof timeStr === "string" && (timeStr.includes("T") || timeStr.includes("Z"))) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).toLowerCase();
        }
    }
    return String(timeStr);
};

export const MultipleVenueDateBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const event = location.state?.event || {
        id: "default-multi-date",
        title: "Group Drawing Sessions",
        mainPerformer: "Drawing Bengaluru",
        startDateTime: "2027-01-17T09:00:00.000Z",
        venue: {
            name: "NGMA",
            address: "25, Mudalappa St, Anjanadri Layout, Konanakunte, Bengaluru, Karnataka 560062"
        },
        subVenue: { name: "Mirror Pool" },
        eventDates: [
            {
                id: "d1",
                date: "2027-01-17T00:00:00.000Z",
                timeSlots: [{ id: "ts1", startTime: "9:00 am", endTime: "12:00 pm" }]
            },
            {
                id: "d2",
                date: "2027-01-18T00:00:00.000Z",
                timeSlots: [{ id: "ts2", startTime: "10:00 am", endTime: "1:00 pm" }]
            },
            {
                id: "d3",
                date: "2027-01-19T00:00:00.000Z",
                timeSlots: [{ id: "ts3", startTime: "2:00 pm", endTime: "5:00 pm" }]
            }
        ]
    };

    const rawDates = event.eventDates || [];
    const formattedDates = rawDates
        .map((ed, idx) => {
            const d = new Date(ed.date || ed.startDateTime || ed);
            return {
                id: ed.id || `date-${idx}`,
                dateObj: d,
                date: d.getDate().toString(),
                day: d.toLocaleString("en-US", { weekday: "short" }).toUpperCase(),
                month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
                raw: ed
            };
        })
        .filter(item => !isNaN(item.dateObj.getTime()))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const datesList = formattedDates.length > 0 ? formattedDates : [
        { id: "17", date: "17", day: "SUN", month: "JAN" },
        { id: "18", date: "18", day: "MON", month: "JAN" },
        { id: "24", date: "24", day: "SUN", month: "JAN" },
        { id: "25", date: "25", day: "MON", month: "JAN" }
    ];

    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [step, setStep] = useState(1);
    const [selectedPass, setSelectedPass] = useState(null);

    // Determine event's master fixed slot if single time slot
    const getEventMasterSlot = () => {
        if (event.startDateTime || event.endDateTime) {
            return {
                id: event.id ? `ts-${event.id}` : "ts-fixed",
                startTime: event.startDateTime,
                endTime: event.endDateTime
            };
        }
        if (event.timeSlots && event.timeSlots.length > 0) {
            return event.timeSlots[0];
        }
        if (event.timeSlot) {
            return event.timeSlot;
        }
        if (event.eventDates && event.eventDates[0]?.timeSlots?.length > 0) {
            return event.eventDates[0].timeSlots[0];
        }
        return { id: "ts-def", startTime: "9:00 am", endTime: "12:00 pm" };
    };

    const masterSlot = getEventMasterSlot();

    const currentDateItem = datesList[selectedDateIndex];
    const rawSlots = currentDateItem?.raw?.timeSlots;
    const timeSlots = (rawSlots && rawSlots.length > 0) ? rawSlots : [masterSlot];
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

    const currentVenue = currentDateItem?.raw?.venue || event.venue || {};
    const venueName = currentVenue.name || event.venue?.name || "Freedom Park";

    const subVenueName = extractSubVenueName(currentDateItem?.raw || currentDateItem || currentVenue, event);
    const venueAddress = currentVenue.address || event.venue?.address || "Seshadri Rd, Gandhi Nagar, Bengaluru, Karnataka 560009";

    const currentSlot = timeSlots[selectedSlotIndex] || timeSlots[0] || masterSlot;
    const startTimeStr = formatTimeString(currentSlot.startTime || masterSlot.startTime);
    const endTimeStr = formatTimeString(currentSlot.endTime || masterSlot.endTime);
    const timeSlotDisplay = (startTimeStr && endTimeStr)
        ? `${startTimeStr}–${endTimeStr}`
        : (startTimeStr || endTimeStr || currentSlot.timeDisplay || masterSlot.timeDisplay || "9:00 am–12:00 pm");

    const firstDateStr = datesList[0]?.date;
    const lastDateStr = datesList[datesList.length - 1]?.date;
    const monthYearStr = `${datesList[0]?.month || 'Jan'} ${datesList[0]?.dateObj ? datesList[0].dateObj.getFullYear() : '2027'}`;
    const headerDateText = (firstDateStr && lastDateStr && firstDateStr !== lastDateStr)
        ? `${firstDateStr}-${lastDateStr}, ${monthYearStr}`
        : `${firstDateStr || ''}, ${monthYearStr}`;
    
    const selectedVenueObj = {
        ...currentVenue,
        name: venueName,
        subVenue: subVenueName,
        subvenue: subVenueName,
        venueDetail: subVenueName,
        address: venueAddress
    };

    return (
        <section className="mutiple-venue-date-booking-main-container">
            <div className="multiple-venue-date-booking-top-container">
                <div className="mutiple-venue-date-booking-top-container-header">
                    <div
                        className="multiple-venue-date-booking-top-left-container"
                        onClick={() => navigate(-1)}
                        style={{ cursor: "pointer" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M22.1663 14H5.83301M13.9997 5.83337L5.83301 14L13.9997 22.1667" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="multiple-venue-date-booking-top-right-container">
                        <div className="multiple-venue-date-booking-top-right-event-container">
                            <h2 className="multiple-venue-date-booking-top-event-name">{event.title}</h2>
                            <p className="multiple-venue-date-booking-top-performer-name">{event.mainPerformer || event.by || "Drawing Bengaluru"}</p>
                        </div>
                        <h2 className="multiple-venue-date-booking-top-date">{headerDateText}</h2>
                    </div>
                </div>
                <div className="multiple-venue-date-booking-middle-row">
                    <div className="mutiple-venue-date-booking-item-container" onClick={() => setStep(1)} style={{ cursor: "pointer" }}>
                        <div className="multiple-venue-date-booking-number-container" style={{ background: "#000" }}>
                            <p className="multiple-venue-date-booking-number">1</p>
                        </div>
                        <p className="multiple-venue-date-booking-item-title" style={{ color: "#000" }}>Venue &amp; Time Slot</p>
                    </div>
                    <div className="mutiple-venue-date-booking-item-container" onClick={() => step >= 2 && setStep(2)} style={{ cursor: step >= 2 ? "pointer" : "default", opacity: step >= 2 ? 1 : 0.4 }}>
                        <div className="multiple-venue-date-booking-number-container" style={{ background: step >= 2 ? "#000" : "#C3C3C3" }}>
                            <p className="multiple-venue-date-booking-number">2</p>
                        </div>
                        <p className="multiple-venue-date-booking-item-title" style={{ color: step >= 2 ? "#000" : "#888" }}>Select Pass</p>
                    </div>
                    <div className="mutiple-venue-date-booking-item-container" onClick={() => step >= 3 && setStep(3)} style={{ cursor: step >= 3 ? "pointer" : "default", opacity: step >= 3 ? 1 : 0.4 }}>
                        <div className="multiple-venue-date-booking-number-container" style={{ background: step >= 3 ? "#000" : "#C3C3C3" }}>
                            <p className="multiple-venue-date-booking-number">3</p>
                        </div>
                        <p className="multiple-venue-date-booking-item-title" style={{ color: step >= 3 ? "#000" : "#888" }}>Review &amp; Add to Cart</p>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <>
                    <div className="multiple-venue-date-booking-top-date-container">
                        <div className="multiple-venue-date-booking-top-date-inner-container">
                            {datesList.map((item, index) => (
                                <div
                                    key={index}
                                    className={`multiple-venue-top-date-select-container ${selectedDateIndex === index ? "selected" : ""}`}
                                    onClick={() => {
                                        setSelectedDateIndex(index);
                                        setSelectedSlotIndex(0);
                                    }}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="multiple-venue-date-top-date-select-inner-container">
                                        <h2 className="multiple-venue-date-top-date">{item.date}</h2>
                                        <h2 className="multiple-venue-date-top-day">{item.day}</h2>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {timeSlots.map((slot, sIdx) => {
                        const startTimeStr = formatTimeString(slot.startTime || masterSlot.startTime);
                        const endTimeStr = formatTimeString(slot.endTime || masterSlot.endTime);
                        const slotTimeDisplay = (startTimeStr && endTimeStr)
                            ? `${startTimeStr}–${endTimeStr}`
                            : (startTimeStr || endTimeStr || slot.timeDisplay || masterSlot.timeDisplay || "9:00 am–12:00 pm");

                        return (
                            <div
                                key={slot.id || sIdx}
                                className="multiple-venue-date-booking-bottom-container"
                                onClick={() => {
                                    setSelectedSlotIndex(sIdx);
                                    setStep(2);
                                }}
                                style={{ cursor: "pointer", marginBottom: "16px" }}
                            >
                                <div className="multiple-venue-date-booking-bottom-left">
                                    <div className="mutiple-venue-date-booking-bottom-venue-container">
                                        <div className="dflex">
                                            <span className="multiple-venue-date-booking-venue-name">{venueName}</span>
                                            {subVenueName ? (
                                                <>
                                                    <span> : </span>
                                                    <span className="multiple-venue-date-booking-subvenue-name">{subVenueName}</span>
                                                </>
                                            ) : null}
                                        </div>
                                        <p className="multiple-venue-date-booking-venue-address">{venueAddress}</p>
                                    </div>
                                    <div className="multiple-venue-date-booking-map-container">
                                        <h2 className="multiple-venue-date-booking-map-title">View on map</h2>
                                        <div className="multiple-venue-date-booking-arrow-container">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="multiple-venue-date-booking-bottom-right">
                                    <span className="multiple-venue-date-booking-b-r-text">
                                        {slotTimeDisplay}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            {step === 2 && (
                <BookingFlow
                    event={event}
                    selectedDate={currentDateItem}
                    selectedSlot={{ ...currentSlot, timeDisplay: timeSlotDisplay }}
                    selectedVenue={selectedVenueObj}
                    hideHeader={true}
                    onSelectPass={(pass) => {
                        setSelectedPass(pass);
                        setStep(3);
                    }}
                />
            )}

            {step === 3 && (
                <ReviewOrder
                    propsData={{
                        event,
                        selectedTicket: selectedPass,
                        selectedDate: currentDateItem,
                        selectedSlot: { ...currentSlot, timeDisplay: timeSlotDisplay },
                        selectedVenue: selectedVenueObj,
                        quantity: 1
                    }}
                    hideHeader={true}
                />
            )}
        </section>
    );
};