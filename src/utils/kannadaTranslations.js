export const SUBFESTIVAL_KANNADA_NAMES = {
    "Swara Hubba": "ಸ್ವರ ಹಬ್ಬ",
    "Kantha Hubba": "ಕಾಂತಾ ಹಬ್ಬ",
    "Nataka Hubba": "ನಾಟಕ ಹಬ್ಬ",
    "Nrutya Hubba": "ನೃತ್ಯ ಹಬ್ಬ",
    "Kala Hubba": "ಕಲಾ ಹಬ್ಬ",
    "Makkala Hubba": "ಮಕ್ಕಳ ಹಬ್ಬ",
    "Aata Hubba": "ಆಟ ಹಬ್ಬ",
    "Samvada Hubba": "ಸಂವಾದ ಹಬ್ಬ",
    "Churumuri Hubba": "ಚುರುಮುರಿ ಹಬ್ಬ",
    "On Wheels BLR Hubba": "ಆನ್ ವೀಲ್ಸ್ ಬೆಂಗಳೂರು ಹಬ್ಬ",
    "On Wheels Hubba": "ಆನ್ ವೀಲ್ಸ್ ಬೆಂಗಳೂರು ಹಬ್ಬ",
    "Rasthe Hubba": "ರಸ್ತೆ ಹಬ್ಬ",
    "Thindi Hubba": "ತಿಂಡಿ ಹಬ್ಬ",
    "Santhe Hubba": "ಸಂತೆ ಹಬ್ಬ",
    "Vishesha Hubba": "ವಿಶೇಷ ಹಬ್ಬ",
    "Udyana Hubba": "ಉದ್ಯಾನ ಹಬ್ಬ",
    "Kriya Hubba": "ಕ್ರಿಯಾ ಹಬ್ಬ",
    "Kalpane Hubba": "ಕಲ್ಪನೆ ಹಬ್ಬ"
};

export const getSubfestivalName = (name, isKannada) => {
    if (!name) return "";
    if (isKannada && SUBFESTIVAL_KANNADA_NAMES[name]) {
        return SUBFESTIVAL_KANNADA_NAMES[name];
    }
    return name;
};
