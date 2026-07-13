import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export const FilterSidebar = ({
    genres = [],
    venues = [],
    languages = [],
    selectedGenreId = "",
    onSelectGenre,
    selectedVenueId = "",
    onSelectVenue,
    selectedLanguages = [],
    onSelectLanguage,
    search = "",
    onSearchChange,
    onReset,
    allEvents = [],
    isFree = false,
    onFreeChange,
    isAvailable = false,
    onAvailableChange,
    isMultiDay = false,
    onMultiDayChange
}) => {
    const [isGenreExpanded, setIsGenreExpanded] = useState(false);
    const [isVenueExpanded, setIsVenueExpanded] = useState(false);
    const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
    // Find active names for "Filtered by" chips
    const selectedGenreIds = selectedGenreId ? selectedGenreId.split(',') : [];
    const activeVenue = venues.find(v => v.id === selectedVenueId);

    const handleSelectGenre = (genreId) => {
        if (selectedGenreIds.includes(genreId)) {
            const nextIds = selectedGenreIds.filter(id => id !== genreId);
            onSelectGenre(nextIds.join(','));
        } else {
            const nextIds = [...selectedGenreIds, genreId];
            onSelectGenre(nextIds.join(','));
        }
    };

    const handleSelectLanguage = (lang) => {
        if (selectedLanguages.includes(lang)) {
            onSelectLanguage(selectedLanguages.filter(l => l !== lang));
        } else {
            onSelectLanguage([...selectedLanguages, lang]);
        }
    };

    // Helper to check if an event matches a genre
    const matchesGenre = (event, genreId) => {
        return event.genres?.some(g => (g.id || g.genreId || g.genre?.id) === genreId) || false;
    };

    // Helper to check if an event matches venue
    const matchesVenue = (event, venueId) => {
        if (!event || !venueId) return false;
        if (event.venueId === venueId || event.venue?.id === venueId) return true;
        if (event.venueIds && event.venueIds.includes(venueId)) return true;
        if (event.eventDates && event.eventDates.some(ed => ed.venueId === venueId)) return true;
        return false;
    };

    // Helper to check if an event is Free
    const isEventFree = (event) => {
        return event.pricingType === 'FREE' || event.ticketPrice === 0 || event.ticketPrice === null;
    };

    // Helper to check if an event is Available
    const isEventAvailable = (event) => {
        return event.capacity === null || event.capacity > 0;
    };

    // Helper to check if an event is Multi-Day
    const isEventMultiDay = (event) => {
        if (event.eventType === 'SERIES' || event.eventType === 'RECURRING') return true;
        if (event.startDateTime && event.endDateTime) {
            return new Date(event.startDateTime).toDateString() !== new Date(event.endDateTime).toDateString();
        }
        return false;
    };

    // Calculate dynamic counts based directly on the events dataset rendered in the grid:
    const getGenreCount = (genreId) => {
        return allEvents.filter(e => matchesGenre(e, genreId)).length;
    };

    const getVenueCount = (venueId) => {
        return allEvents.filter(e => matchesVenue(e, venueId)).length;
    };

    const getLanguageCount = (langName) => {
        return allEvents.filter(e => e.languages && e.languages.includes(langName)).length;
    };

    const getMoreFilterCount = (type) => {
        if (type === 'free') return allEvents.filter(isEventFree).length;
        if (type === 'available') return allEvents.filter(isEventAvailable).length;
        if (type === 'multiday') return allEvents.filter(isEventMultiDay).length;
        return 0;
    };

    return (
        <div className="w-[280px] shrink-0 flex flex-col gap-4">
            <aside
                className="w-full rounded-[24px] border border-[#E5E7EB] bg-white p-[20px] flex flex-col gap-[20px] h-fit"
            >
                {/* Search Filter */}
                <div>
                    <h3 className="text-[18px] font-semibold text-[#111827] mb-2">
                        Search
                    </h3>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-[36px] px-[12px] rounded-full border border-[#D1D5DB] bg-white text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#111827] transition-colors"
                    />
                </div>

                {/* Section 1: Filtered By */}
                <div>
                    <p className="text-[12px] font-medium text-[#6B7280] mb-2">
                        Filtered by
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {activeVenue && (
                            <span className="inline-flex items-center gap-1 h-[28px] px-[12px] rounded-full border border-[#D1D5DB] bg-white text-[14px]">
                                {activeVenue.name}
                                <X size={14} className="cursor-pointer" onClick={() => onSelectVenue("")} />
                            </span>
                        )}
                        {selectedGenreIds.map((genreId) => {
                            const gen = genres.find(g => g.id === genreId);
                            if (!gen) return null;
                            return (
                                <span key={genreId} className="inline-flex items-center gap-1 h-[28px] px-[12px] rounded-full border border-[#D1D5DB] bg-white text-[14px]">
                                    {gen.name}
                                    <X size={14} className="cursor-pointer" onClick={() => {
                                        const nextIds = selectedGenreIds.filter(id => id !== genreId);
                                        onSelectGenre(nextIds.join(','));
                                    }} />
                                </span>
                            );
                        })}
                        {selectedLanguages.map((lang) => (
                            <span key={lang} className="inline-flex items-center gap-1 h-[28px] px-[12px] rounded-full border border-[#D1D5DB] bg-white text-[14px]">
                                {lang}
                                <X size={14} className="cursor-pointer" onClick={() => {
                                    onSelectLanguage(selectedLanguages.filter(l => l !== lang));
                                }} />
                            </span>
                        ))}
                        {search && (
                            <span className="inline-flex items-center gap-1 h-[28px] px-[12px] rounded-full border border-[#D1D5DB] bg-white text-[14px]">
                                "{search}"
                                <X size={14} className="cursor-pointer" onClick={() => onSearchChange("")} />
                            </span>
                        )}
                        {!activeVenue && selectedGenreIds.length === 0 && selectedLanguages.length === 0 && !search && (
                            <span className="inline-flex items-center h-[28px] px-[12px] rounded-full border border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF] text-[14px]">
                                All Events
                            </span>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-[#E5E7EB] m-0" />

                {/* Section 2: Genre */}
                <div>
                    <h3 className="text-[18px] font-semibold text-[#111827] mb-3">
                        Genre
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(isGenreExpanded ? genres : genres.slice(0, 5)).map((genre) => {
                            const isSelected = selectedGenreIds.includes(genre.id);
                            return (
                                <span
                                    key={genre.id}
                                    onClick={() => handleSelectGenre(genre.id)}
                                    className={`inline-flex items-center min-h-[32px] px-[12px] py-[6px] rounded-full border text-[14px] cursor-pointer transition-colors break-words whitespace-normal max-w-full select-none ${isSelected
                                            ? "bg-[#111827] text-white border-[#111827]"
                                            : "border-[#D1D5DB] bg-white text-[#111827] hover:border-[#9CA3AF]"
                                        }`}
                                >
                                    {genre.name} ({getGenreCount(genre.id)})
                                </span>
                            );
                        })}
                    </div>
                    {genres.length > 5 && (
                        <button
                            type="button"
                            onClick={() => setIsGenreExpanded(!isGenreExpanded)}
                            className="text-[14px] font-semibold text-[#111827] mt-3 hover:underline cursor-pointer focus:outline-none block text-left"
                        >
                            {isGenreExpanded ? "See Less" : "See More"}
                        </button>
                    )}
                </div>

                {/* Divider */}
                <hr className="border-[#E5E7EB] m-0" />

                {/* Section 3: Zones (UI Placeholder matching mockups) */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer">
                        <h3 className="text-[18px] font-semibold text-[#111827]">
                            Zones
                        </h3>
                        <ChevronDown className="w-5 h-5 text-[#111827]" />
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-[#E5E7EB] m-0" />

                {/* Section 4: Language */}
                <div>
                    <h3 className="text-[18px] font-semibold text-[#111827] mb-3">
                        Language
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(isLanguageExpanded ? languages : languages.slice(0, 5)).map((lang) => {
                            const isSelected = selectedLanguages.includes(lang);
                            return (
                                <span
                                    key={lang}
                                    onClick={() => handleSelectLanguage(lang)}
                                    className={`inline-flex items-center min-h-[32px] px-[12px] py-[6px] rounded-full border text-[14px] cursor-pointer transition-colors break-words whitespace-normal max-w-full select-none ${isSelected
                                            ? "bg-[#111827] text-white border-[#111827]"
                                            : "border-[#D1D5DB] bg-white text-[#111827] hover:border-[#9CA3AF]"
                                        }`}
                                >
                                    {lang} ({getLanguageCount(lang)})
                                </span>
                            );
                        })}
                    </div>
                    {languages.length > 5 && (
                        <button
                            type="button"
                            onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
                            className="text-[14px] font-semibold text-[#111827] mt-3 hover:underline cursor-pointer focus:outline-none block text-left"
                        >
                            {isLanguageExpanded ? "See Less" : "See More"}
                        </button>
                    )}
                </div>

                {/* Divider */}
                <hr className="border-[#E5E7EB] m-0" />

                {/* Section 5: More Filters (UI Placeholder) */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[18px] font-semibold text-[#111827]">
                            More Filters
                        </h3>
                        <ChevronDown className="w-5 h-5 text-[#111827]" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 text-[16px] font-normal text-[#111827] cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#111827]"
                                checked={isFree}
                                onChange={(e) => onFreeChange(e.target.checked)}
                            />
                            Free ({getMoreFilterCount('free')})
                        </label>
                        <label className="flex items-center gap-2 text-[16px] font-normal text-[#111827] cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#111827]"
                                checked={isAvailable}
                                onChange={(e) => onAvailableChange(e.target.checked)}
                            />
                            Available ({getMoreFilterCount('available')})
                        </label>
                        <label className="flex items-center gap-2 text-[16px] font-normal text-[#111827] cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#111827]"
                                checked={isMultiDay}
                                onChange={(e) => onMultiDayChange(e.target.checked)}
                            />
                            Multi-Day Events ({getMoreFilterCount('multiday')})
                        </label>
                    </div>
                </div>
            </aside>

            {/* Section 6: Reset Filters */}
            <button
                type="button"
                onClick={onReset}
                className="text-[16px] font-semibold text-[#111827] bg-transparent border-none py-2 px-1 cursor-pointer text-left hover:underline self-start"
            >
                Reset All Filters
            </button>
        </div>
    );
};
