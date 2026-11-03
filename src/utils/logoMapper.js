import aataLogo from "../assets/subfestivals/Aata_Hubba_logo.png";
import churumuriLogo from "../assets/subfestivals/Churumuri_Hubba_logo.png";
import kalaLogo from "../assets/subfestivals/Kala_Hubba_logo.png";
import kalpaneLogo from "../assets/subfestivals/Kalpane_Hubba_logo.png";
import kanthaLogo from "../assets/subfestivals/Kantha_Hubba_logo.png";
import kriyaLogo from "../assets/subfestivals/Kriya_Hubba_logo.png";
import makkalaLogo from "../assets/subfestivals/Makkala_Hubba_logo.png";
import nartisuLogo from "../assets/subfestivals/Nartisu_Hubba_logo.png";
import natakaLogo from "../assets/subfestivals/Nataka_Hubba_logo.png";
import rastheLogo from "../assets/subfestivals/Rasthe_Hubba_logo.png";
import samvadaLogo from "../assets/subfestivals/Samvada_Hubba_logo.png";
import santheLogo from "../assets/subfestivals/Santhe_Hubba_logo.png";
import swaraLogo from "../assets/subfestivals/Swara_Hubba_logo.png";
import thindiLogo from "../assets/subfestivals/Thindi_Hubba_logo.png";
import udayanaLogo from "../assets/subfestivals/Udayana_Hubba_logo.png";

export const subfestivalLogos = {
  aata: { icon: aataLogo },
  churumuri: { icon: churumuriLogo },
  churmuri: { icon: churumuriLogo },
  kala: { icon: kalaLogo },
  kalpane: { icon: kalpaneLogo },
  kantha: { icon: kanthaLogo },
  kriya: { icon: kriyaLogo },
  makkala: { icon: makkalaLogo },
  nartisu: { icon: nartisuLogo },
  nrutya: { icon: nartisuLogo },
  nataka: { icon: natakaLogo },
  rasthe: { icon: rastheLogo },
  samvada: { icon: samvadaLogo },
  santhe: { icon: santheLogo },
  swara: { icon: swaraLogo },
  thindi: { icon: thindiLogo },
  udayana: { icon: udayanaLogo },
  udyana: { icon: udayanaLogo },
};

export const getSubfestivalLogo = (logoKey) => {
  if (!logoKey) return null;
  let key = String(logoKey).toLowerCase().trim();

  // Strip prefix/suffix like "-hubba", " hubba", "_hubba", "subfestival-"
  key = key.replace(/[-_\s]?hubba$/i, "").trim();
  key = key.replace(/^subfestival[-_\s]?/i, "").trim();

  return subfestivalLogos[key] || subfestivalLogos[logoKey.toLowerCase().trim()] || null;
};
