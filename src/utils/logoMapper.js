import aataLogo from "../assets/subfestivals/Aata_Hubba_logo.png";
import aataTitle from "../assets/subfestivals/Aata_Hubba_logo_title.png";
import churumuriLogo from "../assets/subfestivals/Churumuri_Hubba_logo.png";
import churmuriTitle from "../assets/subfestivals/Churmuri_Hubba_logo_title.png";
import jagaLogo from "../assets/subfestivals/Jaga_Hubba_logo.png";
import jagaTitle from "../assets/subfestivals/Jaga_Hubba_logo_title.png";
import kalaLogo from "../assets/subfestivals/Kala_Hubba_logo.png";
import kalaTitle from "../assets/subfestivals/Kala_Hubba_logo_title.png";
import kalpaneLogo from "../assets/subfestivals/Kalpane_Hubba_logo.png";
import kalpaneTitle from "../assets/subfestivals/Kalpane_Hubba_logo_title.png";
import kriyaLogo from "../assets/subfestivals/Kriya_Hubba_logo.png";
import kriyaTitle from "../assets/subfestivals/Kriya_Hubba_logo_title.png";
import makkalaLogo from "../assets/subfestivals/Makkala_Hubba_logo.png";
import makkalaTitle from "../assets/subfestivals/Makkala_Hubba_logo_title.png";
import nartisuLogo from "../assets/subfestivals/Nartisu_Hubba_logo.png";
import nartisuTitle from "../assets/subfestivals/Nartisu_Hubba_logo_title.png";
import natakaLogo from "../assets/subfestivals/Nataka_Hubba_logo.png";
import natakaTitle from "../assets/subfestivals/Nataka_Hubba_logo_title.png";
import onwheelsLogo from "../assets/subfestivals/OnWheels_Hubba_logo.png";
import onwheelsTitle from "../assets/subfestivals/OnWheels_Hubba_logo_title.png";
import rastheLogo from "../assets/subfestivals/Rasthe_Hubba_logo.png";
import rastheTitle from "../assets/subfestivals/Rasthe_Hubba_logo_title.png";
import samvadaLogo from "../assets/subfestivals/Samvada_Hubba_logo.png";
import samvadaTitle from "../assets/subfestivals/Samvada_Hubba_logo_title.png";
import santheLogo from "../assets/subfestivals/Santhe_Hubba_logo.png";
import santheTitle from "../assets/subfestivals/Santhe_Hubba_logo_title.png";
import swaraLogo from "../assets/subfestivals/Swara_Hubba_logo.png";
import swaraTitle from "../assets/subfestivals/Swara_Hubba_logo_title.png";
import thindiLogo from "../assets/subfestivals/Thindi_Hubba_logo.png";
import thindiTitle from "../assets/subfestivals/Thindi_Hubba_logo_title.png";
import udyanaLogo from "../assets/subfestivals/Udyana_Hubba_logo.png";
import udyanaTitle from "../assets/subfestivals/Udyana_Hubba_logo_title.png";
import visheshaLogo from "../assets/subfestivals/Vishesha_Hubba_logo.png";
import visheshaTitle from "../assets/subfestivals/Vishesha_Hubba_logo_title.png";

export const subfestivalLogos = {
  aata: { icon: aataLogo, title: aataTitle },
  churumuri: { icon: churumuriLogo, title: churmuriTitle },
  churmuri: { icon: churumuriLogo, title: churmuriTitle },
  jaga: { icon: jagaLogo, title: jagaTitle },
  kala: { icon: kalaLogo, title: kalaTitle },
  kalpane: { icon: kalpaneLogo, title: kalpaneTitle },
  kriya: { icon: kriyaLogo, title: kriyaTitle },
  makkala: { icon: makkalaLogo, title: makkalaTitle },
  nartisu: { icon: nartisuLogo, title: nartisuTitle },
  nataka: { icon: natakaLogo, title: natakaTitle },
  onwheels: { icon: onwheelsLogo, title: onwheelsTitle },
  wheels: { icon: onwheelsLogo, title: onwheelsTitle },
  rasthe: { icon: rastheLogo, title: rastheTitle },
  samvada: { icon: samvadaLogo, title: samvadaTitle },
  santhe: { icon: santheLogo, title: santheTitle },
  swara: { icon: swaraLogo, title: swaraTitle },
  thindi: { icon: thindiLogo, title: thindiTitle },
  udyana: { icon: udyanaLogo, title: udyanaTitle },
  vishesha: { icon: visheshaLogo, title: visheshaTitle }
};

export const getSubfestivalLogo = (logoKey) => {
  if (!logoKey) return null;
  const key = logoKey.toLowerCase().trim();
  return subfestivalLogos[key] || null;
};
