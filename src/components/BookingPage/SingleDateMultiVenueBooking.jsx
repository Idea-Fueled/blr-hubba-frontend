import React, { useState } from "react";
import "./SingleDateMultiVenueBooking.css";
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

export const SingleDateMultiVenueBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const event = location.state?.event || {
        id: "default-single-date",
        title: "Gully Cricket Sunday",
        mainPerformer: "Alpha Games",
        startDateTime: "2027-01-17T09:00:00.000Z",
        venueIds: [
            {
                id: "v1",
                name: "TEST2 VENUE",
                address: "TEST2 VENUE FULL ADDRESS",
                subVenue: { name: "Mirror Pool" },
                timeSlots: [{ id: "ts1", startTime: "9:00 am", endTime: "10:00 am" }]
            },
            {
                id: "v2",
                name: "Freedom Park",
                address: "Seshadri Rd, Gandhi Nagar, Bengaluru, Karnataka 560009",
                subVenue: { name: "Watch Tower" },
                timeSlots: [{ id: "ts2", startTime: "11:00 am", endTime: "1:00 pm" }]
            }
        ]
    };

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
        return { id: "ts-def", startTime: "9:00 am", endTime: "12:00 pm" };
    };

    const masterSlot = getEventMasterSlot();

    const rawVenues = event.venueIds || event.venues || [];
    let venuesToProcess = [...rawVenues];

    if (venuesToProcess.length === 0 && event.eventDates && event.eventDates.length > 0) {
        event.eventDates.forEach(ed => {
            if (ed.venue || ed.timeSlots) {
                venuesToProcess.push({
                    id: ed.venue?.id || ed.id,
                    name: ed.venue?.name || event.venue?.name,
                    subVenue: ed.venue?.subVenue || ed.subVenue || event.subVenue,
                    address: ed.venue?.address || event.venue?.address,
                    timeSlots: ed.timeSlots || []
                });
            }
        });
    }

    const venueList = [];

    (venuesToProcess.length > 0 ? venuesToProcess : [event.venue || {}]).forEach((v, idx) => {
        const vObj = typeof v === 'object' ? v : {};
        const slots = (vObj.timeSlots && vObj.timeSlots.length > 0)
            ? vObj.timeSlots
            : ((event.timeSlots && event.timeSlots.length > 0) ? event.timeSlots : [masterSlot]);

        slots.forEach((slot, sIdx) => {
            const startTimeStr = formatTimeString(slot.startTime || masterSlot.startTime);
            const endTimeStr = formatTimeString(slot.endTime || masterSlot.endTime);
            const timeDisplay = (startTimeStr && endTimeStr)
                ? `${startTimeStr}–${endTimeStr}`
                : (startTimeStr || endTimeStr || slot.timeDisplay || masterSlot.timeDisplay || "9:00 am–12:00 pm");

            venueList.push({
                id: `${vObj.id || idx}-slot-${slot.id || sIdx}`,
                name: vObj.name || event.venue?.name || "Freedom Park",
                subVenue: extractSubVenueName(vObj, event),
                address: vObj.address || event.venue?.address || "Seshadri Rd, Gandhi Nagar, Bengaluru, Karnataka 560009",
                timeSlot: { ...slot, timeDisplay },
                timeDisplay,
                raw: vObj
            });
        });
    });

    const [selectedVenueIndex, setSelectedVenueIndex] = useState(0);
    const [step, setStep] = useState(1);
    const [selectedPass, setSelectedPass] = useState(null);

    const selectedVenue = venueList[selectedVenueIndex] || venueList[0] || {};

    const handleSelectVenueSlot = (vItem) => {
        const idx = venueList.findIndex(v => v.id === vItem.id);
        if (idx >= 0) setSelectedVenueIndex(idx);
        setStep(2);
    };

    const dateStr = event.startDateTime
        ? new Date(event.startDateTime).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
        : "Sunday 17, Jan 2027";

    return (
        <section className="single-multi-book-main-wrapper">
            <div className="top-middle-container">
                <div className="single-multi-top-row-container">
                    <div className="single-multi-top-row-arrow-container" onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                        <div className="single-multi-top-row-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <path d="M22.1663 14H5.83301M13.9997 5.83337L5.83301 14L13.9997 22.1667" stroke="#181C20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <div className="single-multi-top-row-right-container">
                        <div className="single-multi-top-row-right-event-container">
                            <h2 className="single-multi-top-row-event-name">{event.title}</h2>
                            <p className="single-multi-top-row-performer-name">{event.mainPerformer || event.by || "Alpha Games"}</p>
                        </div>
                        <h2 className="single-multi-top-row-date-container">{dateStr}</h2>
                    </div>
                </div>
                <div className="single-multi-middle-row-container">
                    <div className="single-multi-middle-row-item-container" onClick={() => setStep(1)} style={{ cursor: "pointer" }}>
                        <div className="single-multi-middle-row-number-container" style={{ background: "#000" }}>
                            <span className="single-multi-middle-row-number">1</span>
                        </div>
                        <span className="single-multi-middle-row-title" style={{ color: "#000" }}>Venue &amp; Time Slot</span>
                    </div>
                    <div className="single-multi-middle-row-item-container" onClick={() => step >= 2 && setStep(2)} style={{ cursor: step >= 2 ? "pointer" : "default", opacity: step >= 2 ? 1 : 0.4 }}>
                        <div className="single-multi-middle-row-number-container" style={{ background: step >= 2 ? "#000" : "#C3C3C3" }}>
                            <span className="single-multi-middle-row-number">2</span>
                        </div>
                        <span className="single-multi-middle-row-title" style={{ color: step >= 2 ? "#000" : "#888" }}>Select Pass</span>
                    </div>
                    <div className="single-multi-middle-row-item-container" onClick={() => step >= 3 && setStep(3)} style={{ cursor: step >= 3 ? "pointer" : "default", opacity: step >= 3 ? 1 : 0.4 }}>
                        <div className="single-multi-middle-row-number-container" style={{ background: step >= 3 ? "#000" : "#C3C3C3" }}>
                            <span className="single-multi-middle-row-number">3</span>
                        </div>
                        <span className="single-multi-middle-row-title" style={{ color: step >= 3 ? "#000" : "#888" }}>Review &amp; Add to Cart</span>
                    </div>
                </div>
            </div>

            {step === 1 && (
                venueList.map((vItem) => (
                    <div
                        key={vItem.id}
                        className="single-multi-bottom-container"
                        onClick={() => handleSelectVenueSlot(vItem)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="single-multi-bottom-left-container">
                            <div className="single-multi-bottom-left-header">
                                <div className="dflex">
                                    <span className="single-multi-bottom-left-venue-name">{vItem.name}</span>
                                    {vItem.subVenue ? (
                                        <>
                                            <span> : </span>
                                            <span className="single-multi-bottom-left-subvenue-name">
                                                {typeof vItem.subVenue === 'object' ? vItem.subVenue.name : vItem.subVenue}
                                            </span>
                                        </>
                                    ) : null}
                                </div>
                                <span className="single-multi-bottom-left-venue-address">{vItem.address}</span>
                            </div>
                            <div className="single-multi-bottom-left-map-container">
                                <h2 className="single-multi-bottom-left-map-title">View on map</h2>
                                <div className="single-multi-bottom-arrow-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M5.72084 3.309L0.957996 8L0 7.0581L4.66684 2.38972C2.88234 2.8072 1.7198 2.42879 0.267154 1.40668L1.33368 0C2.84268 1.56915 5.08635 1.63085 6.80824 0.296144L7.79755 1.2401C6.44091 2.90797 6.53065 5.16195 8 6.7311L6.62249 7.68946C5.64362 6.4 5.31177 4.96658 5.71876 3.30694L5.72084 3.309Z" fill="black" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="single-multi-bottom-right-container">
                            <h2 className="single-multi-bottom-right-container-content">
                                {vItem.timeDisplay}
                            </h2>
                        </div>
                    </div>
                ))
            )}

            {step === 2 && (
                <BookingFlow
                    event={event}
                    selectedVenue={{ name: selectedVenue?.name, subVenue: selectedVenue?.subVenue, address: selectedVenue?.address }}
                    selectedSlot={selectedVenue?.timeSlot}
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
                        selectedDate: null,
                        selectedSlot: selectedVenue?.timeSlot,
                        selectedVenue: { name: selectedVenue?.name, subVenue: selectedVenue?.subVenue, address: selectedVenue?.address },
                        quantity: 1
                    }}
                    hideHeader={true}
                />
            )}

        </section>
    );
};

export default SingleDateMultiVenueBooking;